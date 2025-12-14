import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wrench, Lock, ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { api } from '../api/client';

const resetPasswordSchema = z.object({
  password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'รหัสผ่านไม่ตรงกัน',
  path: ['confirmPassword'],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
  });

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      return;
    }

    // Verify token validity
    const verifyToken = async () => {
      try {
        const response = await api.post('/auth/verify-reset-token', { token });
        setIsValidToken(response.success);
      } catch {
        setIsValidToken(false);
      }
    };

    verifyToken();
  }, [token]);

  const onSubmit = async (data: ResetPasswordForm) => {
    if (!token) return;

    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post('/auth/reset-password', {
        token,
        password: data.password,
      });

      if (response.success) {
        setIsSuccess(true);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError('ไม่สามารถเปลี่ยนรหัสผ่านได้ กรุณาลองใหม่อีกครั้ง');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง');
    } finally {
      setIsLoading(false);
    }
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
            <CardTitle className="text-center">รีเซ็ตรหัสผ่าน</CardTitle>
          </CardHeader>
          <CardContent>
            {isValidToken === null ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">กำลังตรวจสอบ...</p>
              </div>
            ) : isValidToken === false ? (
              <div className="text-center py-4">
                <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  ลิงก์ไม่ถูกต้องหรือหมดอายุ
                </h3>
                <p className="text-gray-600 mb-6">
                  กรุณาขอลิงก์รีเซ็ตรหัสผ่านใหม่อีกครั้ง
                </p>
                <Link to="/forgot-password">
                  <Button className="w-full">
                    ขอลิงก์ใหม่
                  </Button>
                </Link>
              </div>
            ) : isSuccess ? (
              <div className="text-center py-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  เปลี่ยนรหัสผ่านสำเร็จ
                </h3>
                <p className="text-gray-600 mb-6">
                  กำลังนำคุณไปหน้าเข้าสู่ระบบ...
                </p>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    ไปหน้าเข้าสู่ระบบ
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <p className="text-gray-600 text-sm mb-6 text-center">
                  กรุณากรอกรหัสผ่านใหม่ของคุณ
                </p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                      {error}
                    </div>
                  )}

                  <div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        {...register('password')}
                        type="password"
                        placeholder="รหัสผ่านใหม่"
                        className="pl-10"
                        error={errors.password?.message}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <Input
                        {...register('confirmPassword')}
                        type="password"
                        placeholder="ยืนยันรหัสผ่านใหม่"
                        className="pl-10"
                        error={errors.confirmPassword?.message}
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full" isLoading={isLoading}>
                    เปลี่ยนรหัสผ่าน
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link to="/login" className="text-sm text-primary-600 hover:text-primary-500 inline-flex items-center">
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    กลับไปหน้าเข้าสู่ระบบ
                  </Link>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
