import { useEffect, useState } from 'react';
import { FolderOpen, Plus, Edit, Trash2, Loader2, X, Check, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { adminApi, type CategoryInput } from '../../api/admin';
import type { Category } from '../../types/index';

const iconOptions = [
  { value: 'wrench', label: 'ประแจ' },
  { value: 'zap', label: 'ไฟฟ้า' },
  { value: 'droplet', label: 'น้ำ/ประปา' },
  { value: 'wind', label: 'แอร์' },
  { value: 'monitor', label: 'คอมพิวเตอร์' },
  { value: 'door-open', label: 'ประตู/หน้าต่าง' },
  { value: 'lightbulb', label: 'หลอดไฟ' },
  { value: 'settings', label: 'ทั่วไป' },
];

const colorOptions = [
  { value: '#3B82F6', label: 'น้ำเงิน' },
  { value: '#10B981', label: 'เขียว' },
  { value: '#F59E0B', label: 'เหลือง' },
  { value: '#EF4444', label: 'แดง' },
  { value: '#8B5CF6', label: 'ม่วง' },
  { value: '#EC4899', label: 'ชมพู' },
  { value: '#6B7280', label: 'เทา' },
  { value: '#14B8A6', label: 'เขียวน้ำทะเล' },
];

export default function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CategoryInput>({
    name: '',
    nameTh: '',
    icon: 'settings',
    color: '#3B82F6',
    sortOrder: 0,
    isActive: true,
  });

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.categories.getAll();
      if (response.success && response.data) {
        setCategories(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      nameTh: '',
      icon: 'settings',
      color: '#3B82F6',
      sortOrder: categories.length,
      isActive: true,
    });
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      nameTh: category.nameTh,
      icon: category.icon || 'settings',
      color: category.color || '#3B82F6',
      sortOrder: category.sortOrder,
      isActive: category.isActive,
    });
    setError(null);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.nameTh) {
      setError('กรุณากรอกชื่อหมวดหมู่');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (editingCategory) {
        await adminApi.categories.update(editingCategory.id, formData);
      } else {
        await adminApi.categories.create(formData);
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      console.error('Failed to save category:', err);
      setError('ไม่สามารถบันทึกหมวดหมู่ได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (category: Category) => {
    try {
      await adminApi.categories.update(category.id, { isActive: !category.isActive });
      fetchCategories();
    } catch (err) {
      console.error('Failed to toggle category status:', err);
    }
  };

  const handleDelete = async (category: Category) => {
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบหมวดหมู่ "${category.nameTh}"?`)) return;

    try {
      await adminApi.categories.delete(category.id);
      fetchCategories();
    } catch (err) {
      console.error('Failed to delete category:', err);
      alert('ไม่สามารถลบหมวดหมู่ได้ อาจมีการใช้งานอยู่');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FolderOpen className="w-6 h-6" />
            จัดการหมวดหมู่
          </h1>
          <p className="text-gray-600">จัดการประเภทของคำร้องซ่อม</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มหมวดหมู่
        </Button>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      ) : categories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-500">ยังไม่มีหมวดหมู่</CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <Card key={category.id} className={!category.isActive ? 'opacity-50' : ''}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: category.color || '#3B82F6' }}
                    >
                      <span className="text-white text-lg">
                        {iconOptions.find((i) => i.value === category.icon)?.label.charAt(0) || '?'}
                      </span>
                    </div>
                    <div>
                      <CardTitle className="text-base">{category.nameTh}</CardTitle>
                      <p className="text-sm text-gray-500">{category.name}</p>
                    </div>
                  </div>
                  {category.isActive ? (
                    <span className="text-green-600 flex items-center gap-1 text-sm">
                      <Check className="w-4 h-4" />
                    </span>
                  ) : (
                    <span className="text-gray-400 flex items-center gap-1 text-sm">
                      <XCircle className="w-4 h-4" />
                    </span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">ลำดับ: {category.sortOrder}</span>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditModal(category)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleToggleActive(category)}>
                      {category.isActive ? (
                        <XCircle className="w-4 h-4" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600"
                      onClick={() => handleDelete(category)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingCategory ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่'}</CardTitle>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>
              )}

              <Input
                label="ชื่อ (English)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="electrical"
              />

              <Input
                label="ชื่อภาษาไทย"
                value={formData.nameTh}
                onChange={(e) => setFormData({ ...formData, nameTh: e.target.value })}
                placeholder="ไฟฟ้า"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ไอคอน</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                >
                  {iconOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">สี</label>
                <div className="flex flex-wrap gap-2">
                  {colorOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`w-8 h-8 rounded-full border-2 ${
                        formData.color === opt.value ? 'border-gray-900' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: opt.value }}
                      onClick={() => setFormData({ ...formData, color: opt.value })}
                      title={opt.label}
                    />
                  ))}
                </div>
              </div>

              <Input
                label="ลำดับการแสดง"
                type="number"
                value={formData.sortOrder?.toString() || '0'}
                onChange={(e) =>
                  setFormData({ ...formData, sortOrder: parseInt(e.target.value, 10) || 0 })
                }
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  เปิดใช้งาน
                </label>
              </div>

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
