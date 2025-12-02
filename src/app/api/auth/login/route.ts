import { NextRequest, NextResponse } from 'next/server';
import { User, LoginFormData } from '@/types/user';
import { supabaseAdmin, dbRowToUser } from '@/lib/supabase';
import crypto from 'crypto';

// Hash password
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginFormData = await request.json();
    
    // Validation
    if (!body.email || !body.password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      );
    }

    const hashedPassword = hashPassword(body.password);
    
    // Find user by email and password
    const { data: userRow, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', body.email)
      .eq('password', hashedPassword)
      .single();
    
    if (error || !userRow) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Update last login
    await supabaseAdmin
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userRow.id);
    
    const user = dbRowToUser(userRow);
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    });
    
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
