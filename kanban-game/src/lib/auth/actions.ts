'use server';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { createSession, deleteSession } from './session';

export interface AuthState {
  error?: string;
  success?: boolean;
}

export async function registerAction(
  prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const username = (formData.get('username') as string)?.trim();
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!username || !email || !password) {
    return { error: 'All fields are required.' };
  }
  if (username.length < 3) return { error: 'Username must be at least 3 characters.' };
  if (password.length < 8) return { error: 'Password must be at least 8 characters.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'Invalid email address.' };

  const existing = await db.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { id: true },
  });
  if (existing) return { error: 'Username or email already in use.' };

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await db.user.create({
    data: { username, email, passwordHash },
  });

  await createSession({ id: user.id, username: user.username, email: user.email, tier: user.tier });
  redirect('/dashboard');
}

export async function loginAction(
  prevState: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const identifier = (formData.get('identifier') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!identifier || !password) return { error: 'All fields are required.' };

  const user = await db.user.findFirst({
    where: { OR: [{ email: identifier }, { username: identifier }] },
  });

  if (!user) return { error: 'Invalid credentials.' };

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return { error: 'Invalid credentials.' };

  await createSession({ id: user.id, username: user.username, email: user.email, tier: user.tier });
  redirect('/dashboard');
}

export async function logoutAction(): Promise<void> {
  await deleteSession();
  redirect('/login');
}
