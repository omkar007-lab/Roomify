import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';

export default function LoginPage() {
  // State for email and password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [redirect, setRedirect] = useState(false);

  // Handle login form submission
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    // Logic for handling login (e.g., validate email/password)
    // If login is successful, you can update the `redirect` state
    // For demonstration, we'll assume successful login
    setRedirect(true);
  };

  // Redirect to home page after successful login
  if (redirect) {
    return <Navigate to="/" />;
  }

  return (
    <div className="mt-4 grow flex items-center justify-around">
      <div className="mb-64">
        <h1 className="text-4xl text-center mb-4">Login</h1>
        <form className="max-w-md mx-auto" onSubmit={handleLoginSubmit}>
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            className="border p-2 mb-2 w-full"
          />
          <input
            type="password"
            placeholder="password"
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            className="border p-2 mb-2 w-full"
          />
          <button type="submit" className="primary p-2 w-full">
            Login
          </button>
          <div className="text-center py-2 text-gray-500">
            Don't have an account yet?{' '}
            <Link className="underline text-black" to="/register">
              Register now
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
