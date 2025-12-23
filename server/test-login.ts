import 'dotenv/config';
import * as authService from './src/services/auth.service.js';

async function main() {
  console.log('Testing login...');
  try {
    const result = await authService.login({
      email: 'admin@fixflow.com',
      password: 'admin123',
    });
    console.log('Login success:', result.user.email);
  } catch (e: any) {
    console.error('Login failed:', e.name, e.message);
  }
}
main();
