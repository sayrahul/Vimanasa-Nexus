import { supabaseAdmin } from '@/lib/supabase';
import { toDB, toFrontend } from '@/lib/dataMapper';

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
  invoices: 'client_invoices'
};

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const table = searchParams.get('table');
    
    console.log(`[API] GET /api/database?table=${table}`);
    
    if (!table) {
      console.error('[API] Error: Table name is required');
      return Response.json({ 
        error: 'Validation Error',
        message: 'Table name is required' 
      }, { status: 400 });
    }

    if (!supabaseAdmin) {
      console.error('[API] Error: Supabase is not configured');
      return Response.json({ 
        error: 'Configuration Error',
        message: 'Supabase is not configured' 
      }, { status: 500 });
    }

    // Dashboard doesn't have a table - return empty data
    if (table === 'dashboard') {
      return Response.json({ 
        success: true, 
        data: [], 
        count: 0 
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
          });
        }
        throw error;
      }

      return Response.json({ 
        success: true, 
        data: toFrontend(table, data) || [], 
        count: data?.length || 0 
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
      });
    }
  } catch (error) {
    console.error('[API] Database Error (GET):', {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
      table: tableMapping[table] || table
    });
    return Response.json({ 
      error: 'Database Error',
      message: error.message,
      details: { table: tableMapping[table] || table }
    }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { table, data: insertData } = body;
    
    console.log(`[API] POST /api/database - table: ${table}`, insertData);
    
    if (!table || !insertData) {
      console.error('[API] Error: Table name and data are required');
      return Response.json({ 
        error: 'Validation Error',
        message: 'Table name and data are required' 
      }, { status: 400 });
    }

    if (!supabaseAdmin) {
      console.error('[API] Error: Supabase is not configured');
      return Response.json({ 
        error: 'Configuration Error',
        message: 'Supabase is not configured' 
      }, { status: 500 });
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
    });
  } catch (error) {
    console.error('[API] Database Error (POST):', {
      message: error.message,
      stack: error.stack
    });
    return Response.json({ 
      error: 'Database Error',
      message: error.message
    }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const { table, id, data: updateData } = body;
    
    if (!table || !id || !updateData) {
      return Response.json({ 
        error: 'Validation Error',
        message: 'Table name, ID, and data are required' 
      }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return Response.json({ 
        error: 'Configuration Error',
        message: 'Supabase is not configured' 
      }, { status: 500 });
    }

    const dbTable = tableMapping[table] || table;
    const dbData = toDB(table, updateData);
    if (dbData.id) delete dbData.id; // Prevent updating the ID column

    const { data, error } = await supabaseAdmin
      .from(dbTable)
      .update(dbData)
      .eq('id', id)
      .select();

    if (error) throw error;

    return Response.json({ 
      success: true, 
      data: toFrontend(table, data[0]),
      message: 'Data updated successfully' 
    });
  } catch (error) {
    console.error('Database Error (PUT):', error);
    return Response.json({ 
      error: 'Database Error',
      message: error.message
    }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const body = await req.json();
    const { table, id } = body;
    
    if (!table || !id) {
      return Response.json({ 
        error: 'Validation Error',
        message: 'Table name and ID are required' 
      }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return Response.json({ 
        error: 'Configuration Error',
        message: 'Supabase is not configured' 
      }, { status: 500 });
    }

    const dbTable = tableMapping[table] || table;

    const { error } = await supabaseAdmin
      .from(dbTable)
      .delete()
      .eq('id', id);

    if (error) throw error;

    return Response.json({ 
      success: true, 
      message: 'Data deleted successfully' 
    });
  } catch (error) {
    console.error('Database Error (DELETE):', error);
    return Response.json({ 
      error: 'Database Error',
      message: error.message
    }, { status: 500 });
  }
}
