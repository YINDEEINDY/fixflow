import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import { Wrench, Mail, Lock, User, Phone, Building } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuthStore } from '../stores/auth.store';

const registerSchema = z
  .object({
    name: z.string().min(2, 'กรุณากรอกชื่อ (อย่างน้อย 2 ตัวอักษร)'),
    email: z.string().email('กรุณากรอกอีเมลให้ถูกต้อง'),
    password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
    confirmPassword: z.string(),
    phone: z.string().optional(),
    department: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'รหัสผ่านไม่ตรงกัน',
    path: ['confirmPassword'],
  });

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuthStore();
  const { executeRecaptcha } = useGoogleReCaptcha();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = useCallback(
    async (data: RegisterForm) => {
      setError(null);
      setIsLoading(true);

      try {
        let recaptchaToken: string | undefined;
        if (executeRecaptcha) {
          recaptchaToken = await executeRecaptcha('register');
        }
        await registerUser(
          {
            name: data.name,
            email: data.email,
            password: data.password,
            phone: data.phone,
            department: data.department,
          },
          recaptchaToken
        );
        navigate('/');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'สมัครสมาชิกไม่สำเร็จ');
      } finally {
        setIsLoading(false);
      }
    },
    [executeRecaptcha, registerUser, navigate]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-500 rounded-2xl mb-4">
            <Wrench className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">FixFlow</h1>
          <p className="text-gray-600 mt-1">สมัครสมาชิก</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">สร้างบัญชีใหม่</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  {...register('name')}
                  placeholder="ชื่อ-นามสกุล"
                  className="pl-10"
                  error={errors.name?.message}
                />
              </div>

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

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  {...register('password')}
                  type="password"
                  placeholder="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)"
                  className="pl-10"
                  error={errors.password?.message}
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  {...register('confirmPassword')}
                  type="password"
                  placeholder="ยืนยันรหัสผ่าน"
                  className="pl-10"
                  error={errors.confirmPassword?.message}
                />
              </div>

              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  {...register('phone')}
                  placeholder="เบอร์โทรศัพท์ (ไม่บังคับ)"
                  className="pl-10"
                />
              </div>

              <div className="relative">
                <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  {...register('department')}
                  placeholder="แผนก/หน่วยงาน (ไม่บังคับ)"
                  className="pl-10"
                />
              </div>

              <Button type="submit" className="w-full" isLoading={isLoading}>
                สมัครสมาชิก
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
              มีบัญชีอยู่แล้ว?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-500 font-medium">
                เข้าสู่ระบบ
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
