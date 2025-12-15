import { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit,
  Trash2,
  UserCheck,
  UserX,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { adminApi, type AdminUser, type CreateUserInput, type UpdateUserInput } from '../../api/admin';
import type { Role } from '../../types/index';

const roleLabels: Record<Role, string> = {
  user: 'ผู้ใช้งาน',
  technician: 'ช่าง',
  admin: 'ผู้ดูแล',
};

const roleColors: Record<Role, string> = {
  user: 'bg-blue-100 text-blue-800',
  technician: 'bg-green-100 text-green-800',
  admin: 'bg-purple-100 text-purple-800',
};

export default function UsersManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | ''>('');
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<CreateUserInput>({
    email: '',
    password: '',
    name: '',
    role: 'user',
    phone: '',
    department: '',
  });

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.users.getAll({
        page: pagination.page,
        limit: pagination.limit,
        role: roleFilter || undefined,
        search: search || undefined,
      });

      if (response.success && response.data) {
        setUsers(response.data.items);
        setPagination(response.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [pagination.page, roleFilter]);

  const handleSearch = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      email: '',
      password: '',
      name: '',
      role: 'user',
      phone: '',
      department: '',
    });
    setShowModal(true);
  };

  const openEditModal = (user: AdminUser) => {
    setEditingUser(user);
    setFormData({
      email: user.email || '',
      password: '',
      name: user.name,
      role: user.role,
      phone: user.phone || '',
      department: user.department || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (editingUser) {
        const updateData: UpdateUserInput = {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          department: formData.department || undefined,
          role: formData.role,
        };
        await adminApi.users.update(editingUser.id, updateData);
      } else {
        await adminApi.users.create(formData);
      }
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Failed to save user:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (user: AdminUser) => {
    try {
      await adminApi.users.update(user.id, { isActive: !user.isActive });
      fetchUsers();
    } catch (error) {
      console.error('Failed to toggle user status:', error);
    }
  };

  const handleDelete = async (user: AdminUser) => {
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบผู้ใช้ "${user.name}"? การลบนี้ไม่สามารถย้อนกลับได้`)) return;

    try {
      const response = await adminApi.users.delete(user.id);
      if (!response.success) {
        const message = response.error?.message || 'ไม่สามารถลบผู้ใช้ได้';
        alert(message);
        return;
      }
      fetchUsers();
    } catch (error: unknown) {
      console.error('Failed to delete user:', error);
      alert('ไม่สามารถลบผู้ใช้ได้');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-6 h-6" />
            จัดการผู้ใช้
          </h1>
          <p className="text-gray-600">จัดการบัญชีผู้ใช้ในระบบ</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มผู้ใช้
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder="ค้นหาชื่อ, อีเมล, แผนก..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button variant="outline" onClick={handleSearch}>
                <Search className="w-4 h-4" />
              </Button>
            </div>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as Role | '')}
            >
              <option value="">ทุกบทบาท</option>
              <option value="user">ผู้ใช้งาน</option>
              <option value="technician">ช่าง</option>
              <option value="admin">ผู้ดูแล</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              ไม่พบผู้ใช้
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">ชื่อ</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">อีเมล</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">บทบาท</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">แผนก</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">สถานะ</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} alt="" className="w-8 h-8 rounded-full" />
                            ) : (
                              <Users className="w-4 h-4 text-gray-500" />
                            )}
                          </div>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{user.email || '-'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                          {roleLabels[user.role]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{user.department || '-'}</td>
                      <td className="px-4 py-3">
                        {user.isActive ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <UserCheck className="w-4 h-4" /> ใช้งาน
                          </span>
                        ) : (
                          <span className="text-gray-400 flex items-center gap-1">
                            <UserX className="w-4 h-4" /> ปิดใช้งาน
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(user)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(user)}
                          >
                            {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleDelete(user)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page <= 1}
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm text-gray-600">
            หน้า {pagination.page} จาก {pagination.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingUser ? 'แก้ไขผู้ใช้' : 'เพิ่มผู้ใช้ใหม่'}</CardTitle>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="ชื่อ"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="อีเมล"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              {!editingUser && (
                <Input
                  label="รหัสผ่าน"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">บทบาท</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                >
                  <option value="user">ผู้ใช้งาน</option>
                  <option value="technician">ช่าง</option>
                  <option value="admin">ผู้ดูแล</option>
                </select>
              </div>
              <Input
                label="เบอร์โทร"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label="แผนก"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                  ยกเลิก
                </Button>
                <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'บันทึก'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
