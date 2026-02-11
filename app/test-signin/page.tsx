"use client";

import { signIn } from 'next-auth/react';
import { useState } from 'react';

export default function TestSignIn() {
  const [result, setResult] = useState('');

  const handleTest = async () => {
    console.log('Calling signIn...');
    const r = await signIn('credentials', {
      email: 'admin@volo.test',
      password:'password123',
      redirect: false,
    });
    console.log('signIn returned:', r);
    setResult(JSON.stringify(r, null, 2));
  };

  return (
    <div className="p-8">
      <h1>Test SignIn</h1>
      <button onClick={handleTest} className="px-4 py-2 bg-blue-500 text-white rounded">
        Test signIn
      </button>
      <pre className="mt-4">{result}</pre>
    </div>
  );
}
