'use client';

import { useState } from 'react';
import { supabase } from '@/lib/db/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            setMessage('Simulated login successful (mock mode).');
            setTimeout(() => router.push('/admin/products'), 1000);
            return;
        }

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setMessage(`Error: ${error.message}`);
        } else {
            setMessage('Login successful! Redirecting...');
            router.push('/admin/products');
        }
    } catch (err: any) {
        setMessage(`Error: ${err.message}`);
    } finally {
        setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    if (!email) {
      setMessage('Please enter an email address first.');
      return;
    }
    setLoading(true);
    setMessage('');

    try {
        if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
            setMessage('Simulated magic link sent (mock mode).');
            return;
        }

        const { error } = await supabase.auth.signInWithOtp({ email });

        if (error) {
            setMessage(`Error: ${error.message}`);
        } else {
            setMessage('Magic link sent to your email!');
        }
    } catch (err: any) {
        setMessage(`Error: ${err.message}`);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your account using email/password or magic link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <input
                id="email"
                type="email"
                required
                className="w-full px-3 py-2 border rounded-md"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">Password</label>
              <input
                id="password"
                type="password"
                className="w-full px-3 py-2 border rounded-md"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {message && (
              <div className="p-3 text-sm rounded-md bg-secondary text-secondary-foreground">
                {message}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Processing...' : 'Sign In'}
              </Button>
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={handleMagicLink}
                className="w-full"
              >
                Send Magic Link
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
