import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Loader2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { MultiImageUpload } from '../components/ImageUpload';
import { useRequestStore } from '../stores/request.store';
import type { Priority } from '../types/index';

const priorityOptions: { value: Priority; label: string; description: string }[] = [
  { value: 'low', label: 'ต่ำ', description: 'สามารถรอได้หลายวัน' },
  { value: 'normal', label: 'ปกติ', description: 'ดำเนินการตามลำดับ' },
  { value: 'high', label: 'สูง', description: 'ต้องการดำเนินการเร็ว' },
  { value: 'urgent', label: 'ด่วนมาก', description: 'กระทบต่อการทำงาน' },
];

export default function CreateRequest() {
  const navigate = useNavigate();
  const {
    categories,
    locations,
    isSubmitting,
    fetchCategories,
    fetchLocations,
    createRequest,
  } = useRequestStore();

  const [formData, setFormData] = useState({
    categoryId: '',
    locationId: '',
    title: '',
    description: '',
    priority: 'normal' as Priority,
    preferredDate: '',
    preferredTime: '',
    photos: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCategories();
    fetchLocations();
  }, [fetchCategories, fetchLocations]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.categoryId) newErrors.categoryId = 'กรุณาเลือกหมวดหมู่';
    if (!formData.locationId) newErrors.locationId = 'กรุณาเลือกสถานที่';
    if (!formData.title.trim()) newErrors.title = 'กรุณากรอกหัวข้อ';
    if (formData.title.length > 200) newErrors.title = 'หัวข้อต้องไม่เกิน 200 ตัวอักษร';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const request = await createRequest({
        categoryId: formData.categoryId,
        locationId: formData.locationId,
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        priority: formData.priority,
        preferredDate: formData.preferredDate || undefined,
        preferredTime: formData.preferredTime || undefined,
        photos: formData.photos.length > 0 ? formData.photos : undefined,
      });
      navigate(`/requests/${request.id}`);
    } catch (error) {
      console.error('Failed to create request:', error);
      setErrors({ submit: 'ไม่สามารถส่งคำร้องได้ กรุณาลองใหม่อีกครั้ง' });
    }
  };

  const formatLocation = (loc: { building: string; floor: string | null; room: string | null }) => {
    let result = loc.building;
    if (loc.floor) result += ` ชั้น ${loc.floor}`;
    if (loc.room) result += ` ห้อง ${loc.room}`;
    return result;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">แจ้งซ่อมใหม่</h1>
          <p className="text-gray-600">กรอกรายละเอียดปัญหาที่ต้องการแจ้ง</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>รายละเอียดการแจ้งซ่อม</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                หมวดหมู่ <span className="text-red-500">*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.categoryId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">เลือกหมวดหมู่</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameTh}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="mt-1 text-sm text-red-500">{errors.categoryId}</p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                สถานที่ <span className="text-red-500">*</span>
              </label>
              <select
                name="locationId"
                value={formData.locationId}
                onChange={handleChange}
                className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                  errors.locationId ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">เลือกสถานที่</option>
                {locations.map((loc) => (
                  <option key={loc.id} value={loc.id}>
                    {formatLocation(loc)}
                  </option>
                ))}
              </select>
              {errors.locationId && (
                <p className="mt-1 text-sm text-red-500">{errors.locationId}</p>
              )}
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                หัวข้อ <span className="text-red-500">*</span>
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="เช่น แอร์ไม่เย็น, คอมพิวเตอร์เปิดไม่ติด"
                error={errors.title}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                รายละเอียดเพิ่มเติม
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="อธิบายรายละเอียดของปัญหา..."
              />
            </div>

            {/* Photos */}
            <MultiImageUpload
              label="รูปภาพประกอบ"
              value={formData.photos}
              onChange={(urls) => setFormData((prev) => ({ ...prev, photos: urls }))}
              maxImages={5}
            />

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ความเร่งด่วน
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {priorityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, priority: option.value }))
                    }
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      formData.priority === option.value
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Date & Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  วันที่สะดวก
                </label>
                <Input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เวลาที่สะดวก
                </label>
                <select
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">ไม่ระบุ</option>
                  <option value="08:00-10:00">08:00 - 10:00</option>
                  <option value="10:00-12:00">10:00 - 12:00</option>
                  <option value="13:00-15:00">13:00 - 15:00</option>
                  <option value="15:00-17:00">15:00 - 17:00</option>
                </select>
              </div>
            </div>

            {/* Error */}
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {errors.submit}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex gap-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => navigate(-1)}
          >
            ยกเลิก
          </Button>
          <Button type="submit" className="flex-1" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                กำลังส่ง...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                ส่งคำร้อง
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
