import { supabaseAdmin } from '@/lib/supabase';
import { toDB, toFrontend } from '@/lib/dataMapper';
import { verifyToken } from '@/lib/auth';

export const runtime = 'edge';

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

/**
 * Verify authentication for the request
 */
async function verifyRequest(request, table, method) {
  // PUBLIC ACCESS RULE: Allow anyone to apply (insert into candidates)
  if (table === 'candidates' && method === 'POST') {
    return { success: true, public: true };
  }

  // PUBLIC ACCESS RULE: Allow anyone to see open jobs
  if (table === 'job_openings' && method === 'GET') {
    return { success: true, public: true };
  }

  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { success: false, error: 'Unauthorized', message: 'No token provided', status: 401 };
  }

  const token = authHeader.substring(7);
  const payload = await verifyToken(token);

  if (!payload) {
    return { success: false, error: 'Unauthorized', message: 'Invalid or expired token', status: 401 };
  }

  return { success: true, payload };
}

// Handle OPTIONS request for CORS preflight
export async function OPTIONS(req) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// Map frontend tabs to database tables
const tableMapping = {
  workforce: 'employees',
  clients: 'clients',
  partners: 'partners',
  payroll: 'payroll',
  finance: 'finance',
  compliance: 'compliance',
  attendance: 'attendance',
  leave: 'leave_requests',
  expenses: 'expense_claims',
  invoices: 'client_invoices',
  job_openings: 'job_openings'
};

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const table = searchParams.get('table');
    
    // Verify auth
    const auth = await verifyRequest(req, table, 'GET');
    if (!auth.success) {
      return Response.json({ error: auth.error, message: auth.message }, { status: auth.status, headers: corsHeaders });
    }
    
    console.log(`[API] GET /api/database?table=${table}`);
    
    if (!table) {
      console.error('[API] Error: Table name is required');
      return Response.json({ 
        error: 'Validation Error',
        message: 'Table name is required' 
      }, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    if (!supabaseAdmin) {
      console.error('[API] Error: Supabase is not configured');
      return Response.json({ 
        error: 'Configuration Error',
        message: 'Supabase is not configured' 
      }, { 
        status: 500,
        headers: corsHeaders
      });
    }

    // Dashboard doesn't have a table - return empty data
    if (table === 'dashboard') {
      return Response.json({ 
        success: true, 
        data: [], 
        count: 0 
      }, {
        headers: corsHeaders
      });
    }

    const dbTable = tableMapping[table] || table;
    console.log(`[API] Mapped table: ${table} -> ${dbTable}`);

    // Try to fetch with created_at ordering first
    let query = supabaseAdmin.from(dbTable).select('*');
    
    // Try ordering by created_at, but fallback if column doesn't exist
    try {
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) {
        // If created_at doesn't exist, try without ordering
        if (error.message.includes('column') && error.message.includes('does not exist')) {
          const { data: fallbackData, error: fallbackError } = await supabaseAdmin
            .from(dbTable)
            .select('*');
          
          if (fallbackError) throw fallbackError;
          
          return Response.json({ 
            success: true, 
            data: toFrontend(table, fallbackData) || [], 
            count: fallbackData?.length || 0 
          }, {
            headers: corsHeaders
          });
        }
        throw error;
      }

      return Response.json({ 
        success: true, 
        data: toFrontend(table, data) || [], 
        count: data?.length || 0 
      }, {
        headers: corsHeaders
      });
    } catch (orderError) {
      // Fallback: fetch without ordering
      const { data, error } = await supabaseAdmin
        .from(dbTable)
        .select('*');
      
      if (error) throw error;

      return Response.json({ 
        success: true, 
        data: toFrontend(table, data) || [], 
        count: data?.length || 0 
      }, {
        headers: corsHeaders
      });
    }
  } catch (error) {
    const { searchParams } = new URL(req.url);
    const table = searchParams.get('table');
    const dbTable = tableMapping[table] || table;

    // Handle "Table not found" (Postgres code 42P01)
    if (error.code === '42P01' || (error.message && error.message.includes('relation') && error.message.includes('does not exist'))) {
      console.warn(`[API] Table "${dbTable}" does not exist yet. Returning empty data for frontend.`);
      return Response.json({ 
        success: true, 
        data: [], 
        count: 0 
      }, {
        headers: corsHeaders
      });
    }

    console.error('[API] Database Error (GET):', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      table: dbTable
    });

    return Response.json({ 
      error: 'Database Error',
      message: error.message,
      details: { table: dbTable }
    }, { 
      status: 500,
      headers: corsHeaders 
    });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { table, data: insertData } = body;
    
    // Verify auth
    const auth = await verifyRequest(req, table, 'POST');
    if (!auth.success) {
      return Response.json({ error: auth.error, message: auth.message }, { status: auth.status, headers: corsHeaders });
    }
    
    console.log(`[API] POST /api/database - table: ${table}`, insertData);
    
    if (!table || !insertData) {
      console.error('[API] Error: Table name and data are required');
      return Response.json({ 
        error: 'Validation Error',
        message: 'Table name and data are required' 
      }, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    if (!supabaseAdmin) {
      console.error('[API] Error: Supabase is not configured');
      return Response.json({ 
        error: 'Configuration Error',
        message: 'Supabase is not configured' 
      }, { 
        status: 500,
        headers: corsHeaders 
      });
    }

    const dbTable = tableMapping[table] || table;
    const dbData = toDB(table, insertData);
    console.log(`[API] Inserting into table: ${dbTable}`, dbData);

    const { data, error } = await supabaseAdmin
      .from(dbTable)
      .insert(dbData)
      .select();

    if (error) {
      console.error('[API] Supabase Insert Error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        table: dbTable
      });
      throw error;
    }

    console.log(`[API] Successfully inserted into ${dbTable}`);
    return Response.json({ 
      success: true, 
      data: toFrontend(table, data[0]),
      message: 'Data added successfully' 
    }, {
      headers: corsHeaders
    });
  } catch (error) {
    console.error('[API] Database Error (POST):', {
      message: error.message,
      stack: error.stack
    });

    // Special check for metadata column issue
    if (error.message?.includes('metadata')) {
      return Response.json({ 
        success: false, 
        message: "Database schema mismatch: 'metadata' column missing. Please run the SQL update provided by the assistant.",
        error: error.message 
      }, { status: 500, headers: corsHeaders });
    }

    return Response.json({ success: false, message: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { table, id, data: updateData } = body;
    
    // Verify auth
    const auth = await verifyRequest(req, table, 'PUT');
    if (!auth.success) {
      return Response.json({ error: auth.error, message: auth.message }, { status: auth.status, headers: corsHeaders });
    }
    
    if (!table || !id || !updateData) {
      return Response.json({ 
        error: 'Validation Error',
        message: 'Table name, ID, and data are required' 
      }, { 
        status: 400,
        headers: corsHeaders 
      });
    }

    const dbTable = tableMapping[table] || table;
    const dbData = toDB(table, updateData);
    if (dbData.id) delete dbData.id;

    const { data, error } = await supabaseAdmin
      .from(dbTable)
      .update(dbData)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error('[API] Supabase Update Error:', error);
      throw error;
    }

    return Response.json({ 
      success: true, 
      data: toFrontend(table, data[0]),
      message: 'Data updated successfully' 
    }, {
      headers: corsHeaders
    });
  } catch (error) {
    console.error('[API] Database Error (PUT):', error);
    if (error.message?.includes('metadata')) {
      return Response.json({ 
        success: false, 
        message: "Database schema mismatch: 'metadata' column missing.",
        error: error.message 
      }, { status: 500, headers: corsHeaders });
    }
    return Response.json({ success: false, message: error.message }, { status: 500, headers: corsHeaders });
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { table, id } = body;
    
    const auth = await verifyRequest(req, table, 'DELETE');
    if (!auth.success) {
      return Response.json({ error: auth.error, message: auth.message }, { status: auth.status, headers: corsHeaders });
    }
    
    if (!table || !id) {
      return Response.json({ error: 'Validation Error', message: 'Table name and ID are required' }, { status: 400, headers: corsHeaders });
    }

    const dbTable = tableMapping[table] || table;
    const { data, error } = await supabaseAdmin
      .from(dbTable)
      .delete()
      .eq('id', id)
      .select();
    
    if (error) throw error;

    return Response.json({ 
      success: true, 
      data: toFrontend(table, data[0]),
      message: 'Data deleted successfully' 
    }, {
      headers: corsHeaders
    });
  } catch (error) {
    console.error('[API] Database Error (DELETE):', error);
    return Response.json({ success: false, message: error.message }, { status: 500, headers: corsHeaders });
  }
}
