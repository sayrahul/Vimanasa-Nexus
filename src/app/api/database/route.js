import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { toDB, toFrontend } from '@/lib/dataMapper';
import { verifyToken } from '@/lib/auth';

export const runtime = 'edge';

const allowedOrigins = new Set([
  'https://nexus.vimanasa.com',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

const tableMapping = {
  dashboard: null,
  workforce: 'employees',
  employees: 'employees',
  clients: 'clients',
  partners: 'partners',
  payroll: 'payroll',
  finance: 'finance',
  compliance: 'compliance',
  attendance: 'attendance',
  leave: 'leave_requests',
  leave_requests: 'leave_requests',
  expenses: 'expense_claims',
  expense_claims: 'expense_claims',
  invoices: 'client_invoices',
  client_invoices: 'client_invoices',
  candidates: 'candidates',
  job_openings: 'job_openings',
};

const tablePermissions = {
  super_admin: '*',
  admin: '*',
  hr_manager: {
    read: ['dashboard', 'workforce', 'employees', 'clients', 'partners', 'attendance', 'leave', 'leave_requests', 'candidates', 'job_openings'],
    write: ['workforce', 'employees', 'attendance', 'leave', 'leave_requests', 'candidates', 'job_openings'],
  },
  finance_manager: {
    read: ['dashboard', 'workforce', 'employees', 'clients', 'payroll', 'finance', 'expenses', 'expense_claims', 'invoices', 'client_invoices'],
    write: ['payroll', 'finance', 'expenses', 'expense_claims', 'invoices', 'client_invoices'],
  },
  compliance_officer: {
    read: ['dashboard', 'workforce', 'employees', 'compliance'],
    write: ['compliance'],
  },
};

const publicRules = [
  { table: 'job_openings', method: 'GET' },
  { table: 'candidates', method: 'POST' },
];

const requestSchema = z.object({
  table: z.string().min(1),
  id: z.string().uuid().optional(),
  data: z.unknown().optional(),
});

const candidateSchema = z.object({
  'Full Name': z.string().trim().min(2).max(120),
  Phone: z.string().trim().min(8).max(20),
  Email: z.string().trim().email().optional().or(z.literal('')),
  'Job Title': z.string().trim().min(2).max(160).optional(),
  'Job ID': z.string().trim().max(80).optional(),
  PAN: z.string().trim().max(20).optional().or(z.literal('')),
  Aadhar: z.string().trim().max(20).optional().or(z.literal('')),
  Status: z.string().trim().max(40).optional(),
}).passthrough();

const jobSchema = z.object({
  title: z.string().trim().min(2).max(160).optional(),
  'Job Title': z.string().trim().min(2).max(160).optional(),
  department: z.string().trim().max(120).optional(),
  Department: z.string().trim().max(120).optional(),
  status: z.enum(['open', 'closed']).optional(),
  Status: z.string().trim().max(40).optional(),
}).passthrough().refine((data) => data.title || data['Job Title'], {
  message: 'Job title is required',
});

const genericDataSchema = z.object({}).passthrough();
const rateLimitStore = new Map();

function getHeaders(request) {
  const origin = request?.headers?.get('origin');

  return {
    'Access-Control-Allow-Origin': allowedOrigins.has(origin) ? origin : 'https://nexus.vimanasa.com',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Cache-Control': 'no-store',
  };
}

function json(request, body, status = 200) {
  return Response.json(body, { status, headers: getHeaders(request) });
}

function getClientKey(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('cf-connecting-ip')
    || 'unknown';
}

function checkRateLimit(request, bucket, limit = 20, windowMs = 60_000) {
  const key = `${bucket}:${getClientKey(request)}`;
  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || now > current.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (current.count >= limit) {
    return false;
  }

  current.count += 1;
  return true;
}

function resolveTable(table) {
  return Object.prototype.hasOwnProperty.call(tableMapping, table) ? tableMapping[table] : undefined;
}

function isPublicRequest(table, method) {
  return publicRules.some((rule) => rule.table === table && rule.method === method);
}

function hasTableAccess(payload, table, method) {
  const role = payload?.role || 'employee';
  const permissions = tablePermissions[role];

  if (permissions === '*') return true;
  if (!permissions) return false;

  const action = method === 'GET' ? 'read' : 'write';
  return permissions[action]?.includes(table);
}

async function verifyRequest(request, table, method) {
  if (isPublicRequest(table, method)) {
    return { success: true, public: true };
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return { success: false, error: 'Unauthorized', message: 'No token provided', status: 401 };
  }

  const payload = await verifyToken(authHeader.substring(7));
  if (!payload) {
    return { success: false, error: 'Unauthorized', message: 'Invalid or expired token', status: 401 };
  }

  if (!hasTableAccess(payload, table, method)) {
    return { success: false, error: 'Forbidden', message: 'Insufficient permissions', status: 403 };
  }

  return { success: true, payload };
}

function validatePayload(table, data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { success: false, message: 'Data must be an object' };
  }

  const schema = table === 'candidates'
    ? candidateSchema
    : table === 'job_openings'
      ? jobSchema
      : genericDataSchema;

  const result = schema.safeParse(data);
  if (!result.success) {
    return {
      success: false,
      message: result.error.issues.map((issue) => issue.message).join(', '),
    };
  }

  return { success: true, data: result.data };
}

async function fetchRows(table, dbTable, isPublic) {
  if (table === 'dashboard') {
    return { data: [], error: null };
  }

  let query = supabaseAdmin.from(dbTable).select('*');

  if (isPublic && table === 'job_openings') {
    query = query.eq('status', 'open');
  }

  const ordered = await query.order('created_at', { ascending: false });
  if (!ordered.error) {
    return ordered;
  }

  if (ordered.error.message?.includes('column') && ordered.error.message?.includes('does not exist')) {
    let fallback = supabaseAdmin.from(dbTable).select('*');
    if (isPublic && table === 'job_openings') {
      fallback = fallback.eq('status', 'open');
    }
    return fallback;
  }

  return ordered;
}

function handleSchemaError(request, error, table, dbTable) {
  if (error.code === '42P01' || (error.message?.includes('relation') && error.message?.includes('does not exist'))) {
    return json(request, { success: true, data: [], count: 0 });
  }

  return json(request, {
    success: false,
    error: 'Database Error',
    message: error.message,
    details: { table: dbTable || table },
  }, 500);
}

export async function OPTIONS(request) {
  return new Response(null, { status: 204, headers: getHeaders(request) });
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const table = searchParams.get('table');
    const dbTable = resolveTable(table);

    if (!table || dbTable === undefined) {
      return json(request, { error: 'Validation Error', message: 'Unsupported or missing table' }, 400);
    }

    const auth = await verifyRequest(request, table, 'GET');
    if (!auth.success) {
      return json(request, { error: auth.error, message: auth.message }, auth.status);
    }

    if (!supabaseAdmin) {
      return json(request, { error: 'Configuration Error', message: 'Supabase is not configured' }, 500);
    }

    const { data, error } = await fetchRows(table, dbTable, auth.public);
    if (error) {
      return handleSchemaError(request, error, table, dbTable);
    }

    return json(request, {
      success: true,
      data: toFrontend(table, data) || [],
      count: data?.length || 0,
    });
  } catch (error) {
    return json(request, { success: false, message: error.message }, 500);
  }
}

export async function POST(request) {
  try {
    if (!checkRateLimit(request, 'api-database-post', 30)) {
      return json(request, { error: 'Rate Limited', message: 'Too many requests' }, 429);
    }

    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return json(request, { error: 'Validation Error', message: 'Invalid request body' }, 400);
    }

    const { table, data: insertData } = parsed.data;
    const dbTable = resolveTable(table);

    if (!table || dbTable === undefined || table === 'dashboard') {
      return json(request, { error: 'Validation Error', message: 'Unsupported table' }, 400);
    }

    const auth = await verifyRequest(request, table, 'POST');
    if (!auth.success) {
      return json(request, { error: auth.error, message: auth.message }, auth.status);
    }

    if (!supabaseAdmin) {
      return json(request, { error: 'Configuration Error', message: 'Supabase is not configured' }, 500);
    }

    const validation = validatePayload(table, insertData);
    if (!validation.success) {
      return json(request, { error: 'Validation Error', message: validation.message }, 400);
    }

    const { data, error } = await supabaseAdmin
      .from(dbTable)
      .insert(toDB(table, validation.data))
      .select();

    if (error) throw error;

    return json(request, {
      success: true,
      data: toFrontend(table, data?.[0]),
      message: 'Data added successfully',
    });
  } catch (error) {
    return json(request, { success: false, message: error.message }, 500);
  }
}

export async function PUT(request) {
  try {
    const parsed = requestSchema.extend({
      id: z.string().uuid(),
      data: z.unknown(),
    }).safeParse(await request.json());

    if (!parsed.success) {
      return json(request, { error: 'Validation Error', message: 'Table, id, and data are required' }, 400);
    }

    const { table, id, data: updateData } = parsed.data;
    const dbTable = resolveTable(table);

    if (!table || dbTable === undefined || table === 'dashboard') {
      return json(request, { error: 'Validation Error', message: 'Unsupported table' }, 400);
    }

    const auth = await verifyRequest(request, table, 'PUT');
    if (!auth.success) {
      return json(request, { error: auth.error, message: auth.message }, auth.status);
    }

    const validation = validatePayload(table, updateData);
    if (!validation.success) {
      return json(request, { error: 'Validation Error', message: validation.message }, 400);
    }

    const dbData = toDB(table, validation.data);
    delete dbData.id;

    const { data, error } = await supabaseAdmin
      .from(dbTable)
      .update(dbData)
      .eq('id', id)
      .select();

    if (error) throw error;

    return json(request, {
      success: true,
      data: toFrontend(table, data?.[0]),
      message: 'Data updated successfully',
    });
  } catch (error) {
    return json(request, { success: false, message: error.message }, 500);
  }
}

export async function DELETE(request) {
  try {
    const parsed = requestSchema.extend({
      id: z.string().uuid(),
    }).safeParse(await request.json());

    if (!parsed.success) {
      return json(request, { error: 'Validation Error', message: 'Table and id are required' }, 400);
    }

    const { table, id } = parsed.data;
    const dbTable = resolveTable(table);

    if (!table || dbTable === undefined || table === 'dashboard') {
      return json(request, { error: 'Validation Error', message: 'Unsupported table' }, 400);
    }

    const auth = await verifyRequest(request, table, 'DELETE');
    if (!auth.success) {
      return json(request, { error: auth.error, message: auth.message }, auth.status);
    }

    const { data, error } = await supabaseAdmin
      .from(dbTable)
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;

    return json(request, {
      success: true,
      data: toFrontend(table, data?.[0]),
      message: 'Data deleted successfully',
    });
  } catch (error) {
    return json(request, { success: false, message: error.message }, 500);
  }
}
