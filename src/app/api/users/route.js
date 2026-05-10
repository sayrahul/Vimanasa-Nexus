/**
 * User Management API
 * Allows admins to create, update, and manage users from the dashboard
 */

import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { hashPassword } from '@/lib/passwordHash';
import { verifyToken } from '@/lib/auth';

export const runtime = 'edge';

const createUserSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(8),
  full_name: z.string().min(2).max(255),
  role: z.enum(['super_admin', 'admin', 'hr_manager', 'finance_manager', 'compliance_officer', 'employee']),
  must_change_password: z.boolean().optional(),
});

const updateUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().optional(),
  full_name: z.string().min(2).max(255).optional(),
  role: z.enum(['super_admin', 'admin', 'hr_manager', 'finance_manager', 'compliance_officer', 'employee']).optional(),
  is_active: z.boolean().optional(),
  password: z.string().min(8).optional(), // Optional - only if changing password
});

const resetPasswordSchema = z.object({
  id: z.string().uuid(),
  new_password: z.string().min(8),
  must_change_password: z.boolean().optional(),
});

function json(body, status = 200) {
  return Response.json(body, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Cache-Control': 'no-store',
    },
  });
}

async function requireAdmin(request) {
  const authHeader = request.headers.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return { error: 'Unauthorized', message: 'No token provided', status: 401 };
  }

  const payload = await verifyToken(authHeader.substring(7));
  
  if (!payload) {
    return { error: 'Unauthorized', message: 'Invalid or expired token', status: 401 };
  }

  if (!['super_admin', 'admin'].includes(payload.role)) {
    return { error: 'Forbidden', message: 'Admin access required', status: 403 };
  }

  return { user: payload };
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// GET - List all users
export async function GET(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return json({ error: auth.error, message: auth.message }, auth.status);
    }

    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, username, email, full_name, role, is_active, is_locked, last_login_at, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return json({
      success: true,
      data: users || [],
      count: users?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return json({ success: false, message: error.message }, 500);
  }
}

// POST - Create new user
export async function POST(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return json({ error: auth.error, message: auth.message }, auth.status);
    }

    const body = await request.json();
    const { action } = body;

    // Handle password reset
    if (action === 'reset_password') {
      const validation = resetPasswordSchema.safeParse(body);
      if (!validation.success) {
        return json({
          error: 'Validation Error',
          message: validation.error.issues.map(i => i.message).join(', '),
        }, 400);
      }

      const { id, new_password, must_change_password = true } = validation.data;

      // Hash the new password
      const passwordHash = await hashPassword(new_password);

      // Update user password
      const { error } = await supabaseAdmin
        .from('users')
        .update({
          password_hash: passwordHash,
          must_change_password,
          password_changed_at: new Date().toISOString(),
          is_locked: false,
          failed_login_attempts: 0,
        })
        .eq('id', id);

      if (error) throw error;

      // Log the action
      await supabaseAdmin.from('audit_logs').insert({
        user_id: auth.user.id,
        username: auth.user.username,
        action: 'password_reset',
        resource: 'users',
        resource_id: id,
        status: 'success',
        details: { reset_by: auth.user.username },
      });

      return json({
        success: true,
        message: 'Password reset successfully',
      });
    }

    // Handle user creation
    const validation = createUserSchema.safeParse(body);
    if (!validation.success) {
      return json({
        error: 'Validation Error',
        message: validation.error.issues.map(i => i.message).join(', '),
      }, 400);
    }

    const { username, email, password, full_name, role, must_change_password = false } = validation.data;

    // Check if username already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return json({
        error: 'Validation Error',
        message: 'Username already exists',
      }, 400);
    }

    // Hash the password
    const passwordHash = await hashPassword(password);

    // Create user
    const { data: newUser, error } = await supabaseAdmin
      .from('users')
      .insert({
        username,
        email,
        password_hash: passwordHash,
        full_name,
        role,
        must_change_password,
        is_active: true,
        created_by: auth.user.id,
      })
      .select('id, username, email, full_name, role, is_active, created_at')
      .single();

    if (error) throw error;

    // Add default permissions based on role
    const permissions = getDefaultPermissions(role);
    if (permissions.length > 0) {
      await supabaseAdmin
        .from('user_permissions')
        .insert(
          permissions.map(permission => ({
            user_id: newUser.id,
            permission,
            granted_by: auth.user.id,
          }))
        );
    }

    // Log the action
    await supabaseAdmin.from('audit_logs').insert({
      user_id: auth.user.id,
      username: auth.user.username,
      action: 'user_created',
      resource: 'users',
      resource_id: newUser.id,
      status: 'success',
      details: { created_user: username, role },
    });

    return json({
      success: true,
      data: newUser,
      message: 'User created successfully',
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return json({ success: false, message: error.message }, 500);
  }
}

// PUT - Update user
export async function PUT(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return json({ error: auth.error, message: auth.message }, auth.status);
    }

    const body = await request.json();
    const validation = updateUserSchema.safeParse(body);
    
    if (!validation.success) {
      return json({
        error: 'Validation Error',
        message: validation.error.issues.map(i => i.message).join(', '),
      }, 400);
    }

    const { id, password, ...updateData } = validation.data;

    // If password is being changed, hash it
    if (password) {
      updateData.password_hash = await hashPassword(password);
      updateData.password_changed_at = new Date().toISOString();
    }

    updateData.updated_by = auth.user.id;
    updateData.updated_at = new Date().toISOString();

    // Update user
    const { data: updatedUser, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select('id, username, email, full_name, role, is_active, updated_at')
      .single();

    if (error) throw error;

    // Log the action
    await supabaseAdmin.from('audit_logs').insert({
      user_id: auth.user.id,
      username: auth.user.username,
      action: 'user_updated',
      resource: 'users',
      resource_id: id,
      status: 'success',
      details: { updated_fields: Object.keys(updateData) },
    });

    return json({
      success: true,
      data: updatedUser,
      message: 'User updated successfully',
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return json({ success: false, message: error.message }, 500);
  }
}

// DELETE - Delete user
export async function DELETE(request) {
  try {
    const auth = await requireAdmin(request);
    if (auth.error) {
      return json({ error: auth.error, message: auth.message }, auth.status);
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return json({ error: 'Validation Error', message: 'User ID is required' }, 400);
    }

    // Prevent deleting yourself
    if (id === auth.user.id) {
      return json({ error: 'Validation Error', message: 'Cannot delete your own account' }, 400);
    }

    // Delete user (cascade will delete permissions)
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;

    // Log the action
    await supabaseAdmin.from('audit_logs').insert({
      user_id: auth.user.id,
      username: auth.user.username,
      action: 'user_deleted',
      resource: 'users',
      resource_id: id,
      status: 'success',
    });

    return json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return json({ success: false, message: error.message }, 500);
  }
}

// Helper function to get default permissions based on role
function getDefaultPermissions(role) {
  const permissionMap = {
    super_admin: ['*'],
    admin: ['*'],
    hr_manager: ['workforce:*', 'attendance:*', 'leave:*', 'candidates:*'],
    finance_manager: ['finance:*', 'payroll:*', 'invoices:*', 'expenses:*'],
    compliance_officer: ['compliance:*'],
    employee: [],
  };

  return permissionMap[role] || [];
}
