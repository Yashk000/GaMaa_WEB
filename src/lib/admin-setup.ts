import { db } from '@/lib/mongodb';
import { hashPassword } from '@/lib/admin-auth';

/**
 * Initialize Admin User - Run this once to create the first admin
 * 
 * Usage in browser console or as a server endpoint:
 * await initializeAdmin({
 *   email: 'admin@gamaa.com',
 *   password: 'ChangeMe123!',
 *   name: 'Admin User'
 * })
 */
export async function initializeAdmin({
  email,
  password,
  name,
}: {
  email: string;
  password: string;
  name: string;
}) {
  const adminDb = db();
  if (!adminDb) throw new Error('Database not initialized');

  try {
    // Check if admin already exists
    const existing = await adminDb
      .collection('admin_users')
      .findOne({ email });

    if (existing) {
      console.warn('Admin user already exists');
      return { success: false, message: 'Admin user already exists' };
    }

    // Create index for email uniqueness
    await adminDb
      .collection('admin_users')
      .createIndex({ email: 1 }, { unique: true });

    // Create admin user
    const passwordHash = hashPassword(password);
    const result = await adminDb.collection('admin_users').insertOne({
      email,
      passwordHash,
      name,
      role: 'admin',
      createdAt: new Date(),
      lastLogin: null,
    });

    return {
      success: true,
      message: `Admin user created: ${email}`,
      userId: result.insertedId.toString(),
    };
  } catch (error) {
    console.error('Error initializing admin:', error);
    throw error;
  }
}

// SETUP INSTRUCTIONS:
// ==================
// 1. Copy this function to your browser console while on the admin panel
// 2. OR add it as a temporary server endpoint
// 3. Run: initializeAdmin({ email: 'admin@gamaa.com', password: 'SecurePassword123!', name: 'Your Name' })
// 4. After successful creation, delete this file or the endpoint
// 5. You can now login with the credentials you created
