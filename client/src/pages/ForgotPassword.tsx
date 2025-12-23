import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Wrench, Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { api } from '../api/client';

const forgotPasswordSchema = z.object({
  email: z.string().email('กรุณากรอกอีเมลให้ถูกต้อง'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordForm) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email: data.email });
      if (response.success) {
        setIsSuccess(true);
      } else {
        setError('ไม่สามารถส่งอีเมลได้ กรุณาลองใหม่อีกครั้ง');
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
            <CardTitle className="text-center">ลืมรหัสผ่าน</CardTitle>
          </CardHeader>
          <CardContent>
            {isSuccess ? (
              <div className="text-center py-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">ส่งอีเมลเรียบร้อยแล้ว</h3>
                <p className="text-gray-600 mb-6">
                  กรุณาตรวจสอบอีเมลของคุณเพื่อรีเซ็ตรหัสผ่าน หากไม่พบอีเมล
                  กรุณาตรวจสอบในโฟลเดอร์สแปม
                </p>
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    กลับไปหน้าเข้าสู่ระบบ
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <p className="text-gray-600 text-sm mb-6 text-center">
                  กรอกอีเมลที่ใช้สมัครสมาชิก เราจะส่งลิงก์สำหรับรีเซ็ตรหัสผ่านให้คุณ
                </p>

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

                  <Button type="submit" className="w-full" isLoading={isLoading}>
                    ส่งลิงก์รีเซ็ตรหัสผ่าน
                  </Button>
                </form>

                <div className="mt-6 text-center">
                  <Link
                    to="/login"
                    className="text-sm text-primary-600 hover:text-primary-500 inline-flex items-center"
                  >
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
