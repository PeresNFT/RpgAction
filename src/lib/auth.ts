import { User, LoginFormData, RegisterFormData } from '@/types/user';

// Client-side authentication functions that call API routes

export async function createUser(data: RegisterFormData): Promise<User> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Registration failed');
  }

  return result.user;
}

export async function authenticateUser(data: LoginFormData): Promise<User | null> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Login failed');
  }

  return result.user;
}

// These functions are now handled by API routes
export function getUserById(id: string): User | null {
  // This would need to be implemented as an API route if needed
  console.warn('getUserById not implemented in client-side auth');
  return null;
}

export function updateUser(updatedUser: User): void {
  // This would need to be implemented as an API route if needed
  console.warn('updateUser not implemented in client-side auth');
}
