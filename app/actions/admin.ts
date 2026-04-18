'use server'

import {
  loginAdmin,
  validateSession,
  logoutAdmin,
  getAllAdmins,
  createAdmin,
  deleteAdmin,
  updateAdminPassword,
} from '@/lib/admin-store'

export async function login(username: string, password: string) {
  return loginAdmin(username, password)
}

export async function checkSession(token: string) {
  return validateSession(token)
}

export async function logout(token: string) {
  await logoutAdmin(token)
  return { success: true }
}

export async function fetchAdmins() {
  return getAllAdmins()
}

export async function addAdmin(
  username: string,
  password: string,
  name: string,
  role: 'admin' | 'moderator'
) {
  return createAdmin(username, password, name, role)
}

export async function removeAdmin(adminId: string) {
  return deleteAdmin(adminId)
}

export async function changePassword(adminId: string, newPassword: string) {
  return updateAdminPassword(adminId, newPassword)
}
