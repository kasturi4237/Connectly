import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from '../lib/axios';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('loading'); // loading | success | error

  useEffect(() => {
    if (!token) return setStatus('error');
    axios.get(`/auth/verify/${token}`)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gray-900 rounded-2xl p-8 shadow-2xl text-center">
        {status === 'loading' && (
          <>
            <div className="text-6xl mb-4 animate-pulse">⏳</div>
            <h1 className="text-2xl font-bold text-white">Verifying your email...</h1>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">✅</div>
            <h1 className="text-2xl font-bold text-white">Email Verified!</h1>
            <p className="text-gray-400 mt-2">Your account is ready. You can now log in.</p>
            <Link
              to="/login"
              className="inline-block mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition"
            >
              Go to Login
            </Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">❌</div>
            <h1 className="text-2xl font-bold text-white">Verification Failed</h1>
            <p className="text-gray-400 mt-2">The link is invalid or has expired.</p>
            <Link
              to="/register"
              className="inline-block mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition"
            >
              Register Again
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

