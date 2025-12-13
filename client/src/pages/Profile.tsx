import { useEffect, useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  Lock,
  Save,
  Loader2,
  CheckCircle,
  FileText,
  Clock,
  Star,
  Wrench,
  Camera,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuthStore } from '../stores/auth.store';
import { profileApi, type UpdateProfileInput, type UserStats } from '../api/profile';

const roleLabels: Record<string, string> = {
  user: 'ผู้ใช้งาน',
  technician: 'ช่าง',
  admin: 'ผู้ดูแลระบบ',
};

export default function Profile() {
  const { user, checkAuth } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState<UpdateProfileInput>({
    name: '',
    phone: '',
    department: '',
    avatarUrl: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        department: user.department || '',
        avatarUrl: user.avatarUrl || '',
      });
    }
  }, [user]);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const response = await profileApi.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setIsSaving(true);
    setMessage(null);

    try {
      const response = await profileApi.updateProfile(formData);
      if (response.success) {
        setMessage({ type: 'success', text: 'บันทึกข้อมูลเรียบร้อยแล้ว' });
        checkAuth(); // Refresh user data
      } else {
        setMessage({ type: 'error', text: response.error?.message || 'เกิดข้อผิดพลาด' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'รหัสผ่านใหม่ไม่ตรงกัน' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' });
      return;
    }

    setIsChangingPassword(true);
    setMessage(null);

    try {
      const response = await profileApi.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.success) {
        setMessage({ type: 'success', text: 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setMessage({ type: 'error', text: response.error?.message || 'เกิดข้อผิดพลาด' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <User className="w-6 h-6" />
          โปรไฟล์ของฉัน
        </h1>
        <p className="text-gray-600">จัดการข้อมูลส่วนตัวและการตั้งค่าบัญชี</p>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>ข้อมูลส่วนตัว</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-6 pb-4 border-b">
              <div className="flex-shrink-0">
                <div className="w-24 h-24 relative">
                  {formData.avatarUrl ? (
                    <img
                      src={formData.avatarUrl}
                      alt=""
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="w-12 h-12 text-primary-600" />
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 p-2 bg-primary-500 text-white rounded-full cursor-pointer hover:bg-primary-600 transition-colors">
                    <Camera className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const { uploadApi } = await import('../api/upload');
                          const response = await uploadApi.uploadImage(file);
                          if (response.success && response.data) {
                            setFormData({ ...formData, avatarUrl: response.data.url });
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{user?.name}</h3>
                <p className="text-gray-500">{user?.email || 'ไม่มีอีเมล'}</p>
                <span className="inline-block mt-1 px-2 py-1 bg-primary-100 text-primary-700 text-sm rounded-full">
                  {roleLabels[user?.role || 'user']}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="ชื่อ-นามสกุล"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                icon={<User className="w-4 h-4" />}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล</label>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span>{user?.email || 'ไม่มีอีเมล'}</span>
                </div>
              </div>

              <Input
                label="เบอร์โทรศัพท์"
                value={formData.phone || ''}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                icon={<Phone className="w-4 h-4" />}
                placeholder="0812345678"
              />

              <Input
                label="แผนก/หน่วยงาน"
                value={formData.department || ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                icon={<Building2 className="w-4 h-4" />}
                placeholder="ฝ่ายไอที"
              />
            </div>

            <div className="pt-4">
              <Button onClick={handleUpdateProfile} disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                บันทึกข้อมูล
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stats Card */}
        <Card>
          <CardHeader>
            <CardTitle>สถิติของฉัน</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
              </div>
            ) : stats ? (
              <div className="space-y-4">
                {user?.role === 'technician' ? (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <Wrench className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{stats.totalJobs || 0}</p>
                        <p className="text-sm text-blue-600">งานทั้งหมด</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold text-green-600">{stats.completedJobs || 0}</p>
                        <p className="text-sm text-green-600">เสร็จแล้ว</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <Clock className="w-8 h-8 text-yellow-600" />
                      <div>
                        <p className="text-2xl font-bold text-yellow-600">{stats.inProgressJobs || 0}</p>
                        <p className="text-sm text-yellow-600">กำลังดำเนินการ</p>
                      </div>
                    </div>
                    {stats.rating !== null && stats.rating !== undefined && (
                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                        <Star className="w-8 h-8 text-purple-600" />
                        <div>
                          <p className="text-2xl font-bold text-purple-600">
                            {stats.rating?.toFixed(1) || '0.0'}
                          </p>
                          <p className="text-sm text-purple-600">คะแนนเฉลี่ย</p>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                      <FileText className="w-8 h-8 text-blue-600" />
                      <div>
                        <p className="text-2xl font-bold text-blue-600">{stats.totalRequests || 0}</p>
                        <p className="text-sm text-blue-600">คำร้องทั้งหมด</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                      <Clock className="w-8 h-8 text-yellow-600" />
                      <div>
                        <p className="text-2xl font-bold text-yellow-600">{stats.pendingRequests || 0}</p>
                        <p className="text-sm text-yellow-600">รอดำเนินการ</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                      <div>
                        <p className="text-2xl font-bold text-green-600">{stats.completedRequests || 0}</p>
                        <p className="text-sm text-green-600">เสร็จแล้ว</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">ไม่มีข้อมูล</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Change Password Card */}
      {user?.email && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              เปลี่ยนรหัสผ่าน
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="รหัสผ่านปัจจุบัน"
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                placeholder="••••••••"
              />
              <Input
                label="รหัสผ่านใหม่"
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                placeholder="••••••••"
              />
              <Input
                label="ยืนยันรหัสผ่านใหม่"
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                placeholder="••••••••"
              />
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={handleChangePassword}
                disabled={isChangingPassword || !passwordData.currentPassword || !passwordData.newPassword}
              >
                {isChangingPassword ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Lock className="w-4 h-4 mr-2" />
                )}
                เปลี่ยนรหัสผ่าน
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Account Info */}
      <Card>
        <CardHeader>
          <CardTitle>ข้อมูลบัญชี</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">วันที่สมัคร</p>
              <p className="font-medium">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('th-TH', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  : '-'}
              </p>
            </div>
            <div>
              <p className="text-gray-500">LINE ID</p>
              <p className="font-medium">{user?.lineId ? 'เชื่อมต่อแล้ว' : 'ยังไม่ได้เชื่อมต่อ'}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
