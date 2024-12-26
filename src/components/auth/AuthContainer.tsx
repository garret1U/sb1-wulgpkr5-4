import React, { useState } from 'react';
import { SignIn } from './SignIn';
import { SignUp } from './SignUp';

export function AuthContainer() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      {isSignUp ? (
        <SignUp onToggleMode={() => setIsSignUp(false)} />
      ) : (
        <SignIn onToggleMode={() => setIsSignUp(true)} />
      )}
    </div>
  );
}