import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { ObjectId } from 'mongodb';
import { getMongoDb } from '@/server/mongodb';
import { generateToken, hashPassword, verifyPassword, verifyToken } from './admin-auth';
import type { AdminLoginInput } from './admin-auth';

const defaultAdminEmail = process.env.ADMIN_EMAIL ?? 'abhi.guptafr@gmail.com';
const defaultAdminPassword = process.env.ADMIN_PASSWORD ?? 'Gamaa@123';
const defaultAdminName = process.env.ADMIN_NAME ?? 'Admin';

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const adminRegistrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().trim().min(2).max(80),
});

async function getAdminCollection() {
  const db = await getMongoDb();
  return db.collection('admin_users');
}

async function createAdminUser(email: string, password: string, name: string) {
  const admins = await getAdminCollection();
  const existing = await admins.findOne({ email });

  if (existing) {
    return existing;
  }

  const result = await admins.insertOne({
    email,
    passwordHash: hashPassword(password),
    name,
    role: 'admin',
    createdAt: new Date(),
    lastLogin: new Date(),
  });

  return {
    _id: result.insertedId,
    email,
    passwordHash: hashPassword(password),
    name,
    role: 'admin' as const,
  };
}

function toAdminResponse(email: string, name: string) {
  return {
    success: true,
    token: generateToken(email),
    admin: {
      email,
      name,
      role: 'admin',
    },
  };
}

// Register admin user.
export const registerAdmin = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => adminRegistrationSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const admin = await createAdminUser(data.email, data.password, data.name);
      return {
        success: true,
        message: `Admin user ready: ${admin.email}`,
      };
    } catch (error) {
      console.error('Error registering admin:', error);
      throw new Error('Admin registration failed');
    }
  });

// Login admin user.
export const loginAdmin = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => adminLoginSchema.parse(data))
  .handler(async ({ data }) => {
    try {
      const { email, password } = data as AdminLoginInput;

      if (email !== defaultAdminEmail || password !== defaultAdminPassword) {
        return {
          success: false,
          message: 'Invalid admin credentials',
        };
      }

      try {
        const admins = await getAdminCollection();
        const existing = await admins.findOne<{ email: string; passwordHash: string; name: string }>({ email });

        if (existing) {
          if (!verifyPassword(password, existing.passwordHash)) {
            return {
              success: false,
              message: 'Invalid admin credentials',
            };
          }

          await admins.updateOne(
            { email },
            { $set: { lastLogin: new Date() } }
          );

          return toAdminResponse(existing.email, existing.name);
        }

        await createAdminUser(email, password, defaultAdminName);
      } catch (error) {
        console.warn('MongoDB unavailable during admin login; continuing with env credentials only.', error);
      }

      return {
        success: true,
        token: generateToken(email),
        admin: {
          email,
          name: defaultAdminName,
          role: 'admin',
        },
      };
    } catch (error) {
      console.error('Error logging in:', error);
      throw new Error('Authentication failed');
    }
  });

// Verify admin token.
export const verifyAdminToken = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => data)
  .handler(async ({ data }) => {
    try {
      const { token } = data as { token?: string };

      if (!token) {
        return { valid: false };
      }

      const payload = verifyToken(token);
      if (!payload?.email) {
        return { valid: false };
      }

      if (payload.email === defaultAdminEmail) {
        return {
          valid: true,
          admin: {
            email: defaultAdminEmail,
            name: defaultAdminName,
            role: 'admin',
          },
        };
      }

      try {
        const admins = await getAdminCollection();
        const admin = await admins.findOne({ email: payload.email });

        if (!admin) {
          return { valid: false };
        }

        return {
          valid: true,
          admin: {
            email: admin.email,
            name: admin.name,
            role: admin.role || 'admin',
          },
        };
      } catch (error) {
        console.warn('MongoDB unavailable during token verification; falling back to env token check.', error);
        return {
          valid: payload.email === defaultAdminEmail,
          admin: {
            email: defaultAdminEmail,
            name: defaultAdminName,
            role: 'admin',
          },
        };
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      return { valid: false };
    }
  });
