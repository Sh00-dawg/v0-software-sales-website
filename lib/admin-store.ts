'use server'

import { createClient } from '@/lib/supabase/server'

// Admin accounts store
export interface AdminAccount {
  id: string
  username: string
  name: string
  role: 'admin' | 'moderator'
  createdAt: number
  lastLogin?: number
}

// Login
export async function loginAdmin(username: string, password: string): Promise<{ success: boolean; token?: string; admin?: AdminAccount; error?: string }> {
  const supabase = await createClient()
  
  const { data: admin, error } = await supabase
    .from('admins')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single()
  
  if (error || !admin) {
    return { success: false, error: 'Invalid username or password' }
  }
  
  // Update last login
  await supabase
    .from('admins')
    .update({ last_login: new Date().toISOString() })
    .eq('id', admin.id)
  
  return {
    success: true,
    token: admin.id,
    admin: {
      id: admin.id,
      username: admin.username,
      name: admin.username, // Use username as name for now
      role: admin.role as 'admin' | 'moderator',
      createdAt: new Date(admin.created_at).getTime(),
      lastLogin: admin.last_login ? new Date(admin.last_login).getTime() : undefined
    }
  }
}

// Validate session
export async function validateSession(token: string): Promise<{ valid: boolean; admin?: AdminAccount }> {
  const supabase = await createClient()
  
  const { data: admin, error } = await supabase
    .from('admins')
    .select('*')
    .eq('id', token)
    .single()
  
  if (error || !admin) {
    return { valid: false }
  }
  
  return {
    valid: true,
    admin: {
      id: admin.id,
      username: admin.username,
      name: admin.username,
      role: admin.role as 'admin' | 'moderator',
      createdAt: new Date(admin.created_at).getTime(),
      lastLogin: admin.last_login ? new Date(admin.last_login).getTime() : undefined
    }
  }
}

// Logout (no-op for simple token-based auth)
export async function logoutAdmin(_token: string): Promise<void> {
  // With Supabase, we just clear the client-side token
  return
}

// Get all admins (for admin management)
export async function getAllAdmins(): Promise<AdminAccount[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('admins')
    .select('*')
    .order('created_at', { ascending: true })
  
  if (error) return []
  
  return (data || []).map(admin => ({
    id: admin.id,
    username: admin.username,
    name: admin.username,
    role: admin.role as 'admin' | 'moderator',
    createdAt: new Date(admin.created_at).getTime(),
    lastLogin: admin.last_login ? new Date(admin.last_login).getTime() : undefined
  }))
}

// Create admin
export async function createAdmin(
  username: string,
  password: string,
  name: string,
  role: 'admin' | 'moderator'
): Promise<{ success: boolean; admin?: AdminAccount; error?: string }> {
  const supabase = await createClient()
  
  // Check if username exists
  const { data: existing } = await supabase
    .from('admins')
    .select('id')
    .eq('username', username)
    .single()
  
  if (existing) {
    return { success: false, error: 'Username already exists' }
  }
  
  const { data: newAdmin, error } = await supabase
    .from('admins')
    .insert({
      username,
      password,
      role
    })
    .select()
    .single()
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  return {
    success: true,
    admin: {
      id: newAdmin.id,
      username: newAdmin.username,
      name: name || newAdmin.username,
      role: newAdmin.role as 'admin' | 'moderator',
      createdAt: new Date(newAdmin.created_at).getTime()
    }
  }
}

// Delete admin
export async function deleteAdmin(adminId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  // Get all admins to check count
  const { data: allAdmins } = await supabase.from('admins').select('id, username')
  
  if (!allAdmins || allAdmins.length <= 1) {
    return { success: false, error: 'Cannot delete the last admin account' }
  }
  
  // Find admin to delete
  const adminToDelete = allAdmins.find(a => a.id === adminId)
  if (adminToDelete?.username === 'admin') {
    return { success: false, error: 'Cannot delete the default admin account' }
  }
  
  const { error } = await supabase
    .from('admins')
    .delete()
    .eq('id', adminId)
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  return { success: true }
}

// Update admin password
export async function updateAdminPassword(
  adminId: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('admins')
    .update({ password: newPassword })
    .eq('id', adminId)
  
  if (error) {
    return { success: false, error: error.message }
  }
  
  return { success: true }
}
