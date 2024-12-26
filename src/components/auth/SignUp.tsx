import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { signUp } from '../../lib/auth';

interface SignUpProps {
  onToggleMode: () => void;
}

export function SignUp({ onToggleMode }: SignUpProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { mutate, isPending, error: signUpError } = useMutation({
    mutationFn: () => signUp(email, password),
    onSuccess: () => {
      alert('Check your email to confirm your account');
      onToggleMode();
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    mutate();
  };

  return (
    <div className="max-w-md w-full space-y-8">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-gray-100">
          Create your account
        </h2>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        {(error || signUpError) && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/50 p-4">
            <div className="text-sm text-red-700 dark:text-red-200">
              {error || signUpError?.message}
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
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none rounded-none relative block w-full px-3 py-2 border
                       border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400
                       text-gray-900 dark:text-gray-100
                       focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm
                       bg-white dark:bg-gray-700"
              placeholder="Password"
            />
          </div>
          <div>
            <label htmlFor="confirm-password" className="sr-only">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="appearance-none rounded-none relative block w-full px-3 py-2 border
                       border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400
                       text-gray-900 dark:text-gray-100 rounded-b-md
                       focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm
                       bg-white dark:bg-gray-700"
              placeholder="Confirm password"
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
            {isPending ? 'Creating account...' : 'Sign up'}
          </button>
        </div>

        <div className="text-sm text-center">
          <button
            type="button"
            onClick={onToggleMode}
            className="font-medium text-primary hover:text-primary/90"
          >
            Already have an account? Sign in
          </button>
        </div>
      </form>
    </div>
  );
}