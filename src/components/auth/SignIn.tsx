import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { signIn } from '../../lib/auth';

interface SignInProps {
  onToggleMode: () => void;
}

export function SignIn({ onToggleMode }: SignInProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { mutate, isPending, error } = useMutation({
    mutationFn: () => signIn(email, password)
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutate();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
              <div className="text-sm text-red-700 dark:text-red-200">
                {error.message}
              </div>
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border 
                         border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 
                         text-gray-900 dark:text-gray-100 rounded-t-md 
                         focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm
                         bg-white dark:bg-gray-700"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border
                         border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400
                         text-gray-900 dark:text-gray-100 rounded-b-md
                         focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm
                         bg-white dark:bg-gray-700"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isPending}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent 
                       text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
                       disabled:opacity-50"
            >
              {isPending ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-sm text-center">
            <button
              type="button"
              onClick={onToggleMode}
              className="font-medium text-primary hover:text-primary/90"
            >
              Need an account? Sign up
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}