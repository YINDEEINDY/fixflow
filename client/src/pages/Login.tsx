import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wrench, Mail, Lock, MessageCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuthStore } from '../stores/auth.store';

const loginSchema = z.object({
  email: z.string().email('กรุณากรอกอีเมลให้ถูกต้อง'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    setIsLoading(true);

    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เข้าสู่ระบบไม่สำเร็จ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLineLogin = () => {
    const lineChannelId = import.meta.env.VITE_LINE_CHANNEL_ID;
    const redirectUri = encodeURIComponent(
      `${window.location.origin}/auth/line/callback`
    );
    const state = Math.random().toString(36).substring(7);

    window.location.href = `https://access.line.me/oauth2/v2.1/authorize?response_type=code&client_id=${lineChannelId}&redirect_uri=${redirectUri}&state=${state}&scope=profile%20openid%20email`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">FixFlow</h1>
          <p className="text-gray-600 mt-1">ระบบแจ้งซ่อม/บำรุงรักษา</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">เข้าสู่ระบบ</CardTitle>
          </CardHeader>
          <CardContent>
            {/* LINE Login Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full mb-6 bg-[#00B900] hover:bg-[#00A000] text-white border-[#00B900]"
              onClick={handleLineLogin}
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              เข้าสู่ระบบด้วย LINE
            </Button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">หรือ</span>
              </div>
            </div>

            {/* Email Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    {...register('email')}
                    type="email"
                    placeholder="อีเมล"
                    className="pl-10"
                    error={errors.email?.message}
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    {...register('password')}
                    type="password"
                    placeholder="รหัสผ่าน"
                    className="pl-10"
                    error={errors.password?.message}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading}>
                เข้าสู่ระบบ
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              ยังไม่มีบัญชี?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-500 font-medium">
                สมัครสมาชิก
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Demo accounts */}
        <div className="mt-6 p-4 bg-white/50 rounded-lg text-sm text-gray-600">
          <p className="font-medium mb-2">บัญชีทดสอบ:</p>
          <p>Admin: admin@fixflow.com / admin123</p>
          <p>Tech: tech@fixflow.com / tech123</p>
          <p>User: user@fixflow.com / user123</p>
        </div>
      </div>
    </div>
  );
}
