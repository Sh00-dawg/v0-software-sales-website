'use server'

// Admin accounts store
export interface AdminAccount {
  id: string
  username: string
  passwordHash: string
  name: string
  role: 'admin' | 'moderator'
  createdAt: number
  lastLogin?: number
}

// Simple hash function for demo (in production use bcrypt)
function simpleHash(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return 'hash_' + Math.abs(hash).toString(16)
}

// Default admin account
const defaultAdmin: AdminAccount = {
  id: 'admin-1',
  username: 'admin',
  passwordHash: simpleHash('admin123'),
  name: 'Administrator',
  role: 'admin',
  createdAt: Date.now(),
}

// In-memory store for admin accounts
let adminAccounts: AdminAccount[] = [defaultAdmin]

// Active sessions
interface Session {
  token: string
  adminId: string
  createdAt: number
  expiresAt: number
}

let sessions: Session[] = []

// Generate a random token
function generateToken(): string {
  return 'session_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 16)
}

// Login
export async function loginAdmin(username: string, password: string): Promise<{ success: boolean; token?: string; admin?: Omit<AdminAccount, 'passwordHash'>; error?: string }> {
  const passwordHash = simpleHash(password)
  const admin = adminAccounts.find(a => a.username === username && a.passwordHash === passwordHash)
  
  if (!admin) {
    return { success: false, error: 'Invalid username or password' }
  }
  
  // Update last login
  admin.lastLogin = Date.now()
  
  // Create session
  const token = generateToken()
  const session: Session = {
    token,
    adminId: admin.id,
    createdAt: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000), // 24 hours
  }
  sessions.push(session)
  
  const { passwordHash: _, ...adminWithoutPassword } = admin
  return { success: true, token, admin: adminWithoutPassword }
}

// Validate session
export async function validateSession(token: string): Promise<{ valid: boolean; admin?: Omit<AdminAccount, 'passwordHash'> }> {
  const session = sessions.find(s => s.token === token && s.expiresAt > Date.now())
  
  if (!session) {
    return { valid: false }
  }
  
  const admin = adminAccounts.find(a => a.id === session.adminId)
  if (!admin) {
    return { valid: false }
  }
  
  const { passwordHash: _, ...adminWithoutPassword } = admin
  return { valid: true, admin: adminWithoutPassword }
}

// Logout
export async function logoutAdmin(token: string): Promise<void> {
  sessions = sessions.filter(s => s.token !== token)
}

// Get all admins (for admin management)
export async function getAllAdmins(): Promise<Omit<AdminAccount, 'passwordHash'>[]> {
  return adminAccounts.map(({ passwordHash: _, ...admin }) => admin)
}

// Create admin
export async function createAdmin(
  username: string,
  password: string,
  name: string,
  role: 'admin' | 'moderator'
): Promise<{ success: boolean; admin?: Omit<AdminAccount, 'passwordHash'>; error?: string }> {
  // Check if username exists
  if (adminAccounts.find(a => a.username === username)) {
    return { success: false, error: 'Username already exists' }
  }
  
  const newAdmin: AdminAccount = {
    id: `admin-${Date.now()}`,
    username,
    passwordHash: simpleHash(password),
    name,
    role,
    createdAt: Date.now(),
  }
  
  adminAccounts.push(newAdmin)
  
  const { passwordHash: _, ...adminWithoutPassword } = newAdmin
  return { success: true, admin: adminWithoutPassword }
}

// Delete admin
export async function deleteAdmin(adminId: string): Promise<{ success: boolean; error?: string }> {
  // Prevent deleting the last admin
  if (adminAccounts.length === 1) {
    return { success: false, error: 'Cannot delete the last admin account' }
  }
  
  // Prevent deleting admin-1 (default admin)
  if (adminId === 'admin-1') {
    return { success: false, error: 'Cannot delete the default admin account' }
  }
  
  adminAccounts = adminAccounts.filter(a => a.id !== adminId)
  // Also remove their sessions
  sessions = sessions.filter(s => s.adminId !== adminId)
  
  return { success: true }
}

// Update admin password
export async function updateAdminPassword(
  adminId: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const admin = adminAccounts.find(a => a.id === adminId)
  if (!admin) {
    return { success: false, error: 'Admin not found' }
  }
  
  admin.passwordHash = simpleHash(newPassword)
  return { success: true }
}
