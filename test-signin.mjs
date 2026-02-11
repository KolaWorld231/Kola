import { signIn } from 'next-auth/react';

(async () => {
  const result = await signIn('credentials', {
    email: 'admin@volo.test',
    password: 'password123',
    redirect: false,
  });
  console.log('signIn result:', result);
})();
