'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { authenticate } from '@/app/lib/actions/auth';

export default function LoginForm() {
  const [errorMessage, dispatch] = useFormState(authenticate, undefined);

  return (
    <form action={dispatch} className="space-y-3 mt-10">
      <div className="flex-1 rounded-lg bg-fuchsia-700 bg-opacity-10 px-8 py-8">
        <h1 className={`mb-3 text-2xl`}>Please log in to continue.</h1>
        <div className="w-full">
          <div>
            <label className="mb-3 mt-5 block text-xs font-medium text-gray-900" htmlFor="email">
              Login
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                required
              />
              <div className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900">
                👤
              </div>
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-3 mt-5 block text-xs font-medium text-gray-900" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                required
                minLength={6}
              />
              <div className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900">
                🔑
              </div>
            </div>
          </div>
        </div>
        <LoginButton />
        <div className="" aria-live="polite" aria-atomic="true">
          {errorMessage && (
            <>
              <p className="text-red-500 mt-6 text-center">{errorMessage}</p>
            </>
          )}
        </div>
      </div>
    </form>
  );
}

function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className={`mt-4 w-full px-3 py-2 rounded-md bg-indigo-500 text-white hover:bg-indigo-700 font-bold`}>
      {pending ? 'Logging ... ' : 'Log in'}
    </button>
  );
}
