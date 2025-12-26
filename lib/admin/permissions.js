/**
 * Admin Permission Middleware
 * Verifies if user has ADMIN role and is active
 */

import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';

/**
 * Require admin role for server components
 * Note: This checks the database role, not Stack Auth metadata
 */
export async function requireAdmin(userEmail) {
  if (!userEmail) {
    redirect('/login?callbackUrl=/admin');
  }
  
  // Get user from database with role
  const dbUser = await prisma.user.findUnique({
    where: { email: userEmail },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      suspendedAt: true
    }
  });
  
  // Check if user exists and has admin role
  if (!dbUser || dbUser.role !== 'ADMIN') {
    redirect('/?error=unauthorized');
  }
  
  // Check if account is active
  if (!dbUser.isActive || dbUser.suspendedAt) {
    redirect('/?error=account_suspended');
  }
  
  return dbUser;
}

/**
 * Log admin activity
 */
export async function logAdminActivity(adminId, action, targetType, targetId, metadata = null) {
  try {
    await prisma.adminActivityLog.create({
      data: {
        adminId,
        action,
        targetType,
        targetId,
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });
  } catch (error) {
    console.error('Failed to log admin activity:', error);
    // Don't throw - logging shouldn't break the app
  }
}

/**
 * Check if user has admin role (without redirect)
 */
export async function isAdmin(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, isActive: true }
  });
  
  return user?.role === 'ADMIN' && user?.isActive;
}

