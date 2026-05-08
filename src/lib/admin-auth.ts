import { z } from 'zod';
import crypto from 'crypto';

export const adminLoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export const adminUserSchema = z.object({
  _id: z.string().optional(),
  email: z.string().email(),
  passwordHash: z.string(),
  name: z.string(),
  role: z.enum(['admin', 'editor']),
  createdAt: z.date().optional(),
  lastLogin: z.date().optional(),
});

export type AdminUser = z.infer<typeof adminUserSchema>;

// Hash password using crypto (Node.js built-in)
export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Verify password
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Generate simple JWT-like token (for demo - use real JWT in production)
export function generateToken(email: string): string {
  const payload = JSON.stringify({ email, iat: Date.now() });
  return Buffer.from(payload).toString('base64');
}

export function verifyToken(token: string): { email: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    return payload;
  } catch {
    return null;
  }
}
