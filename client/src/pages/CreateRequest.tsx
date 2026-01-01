import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Loader2, FileText, Save, ChevronDown, Sparkles, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { MultiImageUpload } from '../components/ImageUpload';
import { useRequestStore } from '../stores/request.store';
import { templatesApi, type RequestTemplate } from '../api/templates';
import { suggestCategory, type CategorySuggestion } from '../api/chat';
import SaveTemplateModal from '../components/templates/SaveTemplateModal';
import type { Priority } from '../types/index';

const priorityOptions: { value: Priority; label: string; description: string }[] = [
  { value: 'low', label: 'ต่ำ', description: 'สามารถรอได้หลายวัน' },
  { value: 'normal', label: 'ปกติ', description: 'ดำเนินการตามลำดับ' },
  { value: 'high', label: 'สูง', description: 'ต้องการดำเนินการเร็ว' },
  { value: 'urgent', label: 'ด่วนมาก', description: 'กระทบต่อการทำงาน' },
];

export default function CreateRequest() {
  const navigate = useNavigate();
  const { categories, locations, isSubmitting, fetchCategories, fetchLocations, createRequest } =
    useRequestStore();

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
  const [templates, setTemplates] = useState<RequestTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [showTemplateDropdown, setShowTemplateDropdown] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);

  // AI Category Suggestion state
  const [aiSuggestion, setAiSuggestion] = useState<CategorySuggestion | null>(null);
  const [isLoadingSuggestion, setIsLoadingSuggestion] = useState(false);
  const [suggestionApplied, setSuggestionApplied] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchLocations();
    loadTemplates();
  }, [fetchCategories, fetchLocations]);

  // Debounced AI category suggestion
  const fetchAiSuggestion = useCallback(async (title: string, description: string) => {
    if (!title.trim() || title.length < 5) {
      setAiSuggestion(null);
      return;
    }

    setIsLoadingSuggestion(true);
    setSuggestionApplied(false);
    try {
      const suggestion = await suggestCategory(title, description);
      setAiSuggestion(suggestion);
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
      setAiSuggestion(null);
    } finally {
      setIsLoadingSuggestion(false);
    }
  }, []);

  // Debounce effect for title/description changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.title.trim() && !formData.categoryId) {
        fetchAiSuggestion(formData.title, formData.description);
      }
    }, 800);

    return () => clearTimeout(timer);
  }, [formData.title, formData.description, formData.categoryId, fetchAiSuggestion]);

  // Apply AI suggestion
  const applyAiSuggestion = () => {
    if (aiSuggestion) {
      setFormData((prev) => ({ ...prev, categoryId: aiSuggestion.categoryId }));
      setSuggestionApplied(true);
      if (errors.categoryId) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.categoryId;
          return newErrors;
        });
      }
    }
  };

  const loadTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const response = await templatesApi.getAll();
      if (response.success && response.data) {
        setTemplates(response.data);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const handleTemplateSelect = async (template: RequestTemplate) => {
    setFormData((prev) => ({
      ...prev,
      categoryId: template.categoryId,
      title: template.title,
      description: template.content || '',
      priority: template.priority,
    }));
    setShowTemplateDropdown(false);
    try {
      await templatesApi.use(template.id);
    } catch (error) {
      console.error('Failed to increment template usage:', error);
    }
  };

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
      navigate('/requests/' + request.id);
    } catch (error) {
      console.error('Failed to create request:', error);
      setErrors({ submit: 'ไม่สามารถส่งคำร้องได้ กรุณาลองใหม่อีกครั้ง' });
    }
  };

  const formatLocation = (loc: { building: string; floor: string | null; room: string | null }) => {
    let result = loc.building;
    if (loc.floor) result += ' ชั้น ' + loc.floor;
    if (loc.room) result += ' ห้อง ' + loc.room;
    return result;
  };

  const canSaveAsTemplate = formData.categoryId && formData.title.trim();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">แจ้งซ่อมใหม่</h1>
          <p className="text-gray-600">กรอกรายละเอียดปัญหาที่ต้องการแจ้ง</p>
        </div>
      </div>

      {templates.length > 0 && (
        <Card className="bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary-600" />
                <span className="font-medium text-primary-900">Quick Templates</span>
                <span className="text-sm text-primary-600">({templates.length} รายการ)</span>
              </div>
              <div className="relative">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTemplateDropdown(!showTemplateDropdown)}
                  disabled={isLoadingTemplates}
                  className="bg-white"
                >
                  {isLoadingTemplates ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 mr-2" />
                  )}
                  เลือก Template
                  <ChevronDown className="w-4 h-4 ml-2" />
                </Button>

                {showTemplateDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    <div className="p-2">
                      {templates.map((template) => (
                        <button
                          key={template.id}
                          type="button"
                          onClick={() => handleTemplateSelect(template)}
                          className="w-full text-left p-3 hover:bg-gray-50 rounded-lg transition-colors"
                        >
                          <div className="font-medium text-gray-900">{template.name}</div>
                          <div className="text-sm text-gray-500 truncate">{template.title}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs px-2 py-0.5 bg-gray-100 rounded text-gray-600">
                              {template.category.nameTh}
                            </span>
                            <span className="text-xs text-gray-400">
                              ใช้ {template.usageCount} ครั้ง
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>รายละเอียดการแจ้งซ่อม</CardTitle>
            {canSaveAsTemplate && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowSaveTemplateModal(true)}
                className="text-primary-600 hover:text-primary-700 hover:bg-primary-50"
              >
                <Save className="w-4 h-4 mr-1" />
                บันทึกเป็น Template
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                หมวดหมู่ <span className="text-red-500">*</span>
              </label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className={'w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ' + (errors.categoryId ? 'border-red-500' : 'border-gray-300')}
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

              {/* AI Category Suggestion */}
              {isLoadingSuggestion && (
                <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>AI กำลังวิเคราะห์หมวดหมู่...</span>
                </div>
              )}

              {aiSuggestion && !formData.categoryId && !isLoadingSuggestion && (
                <div className="mt-2 p-3 bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-purple-900">AI แนะนำ:</span>
                        <span className="text-purple-700">
                          {categories.find((c) => c.id === aiSuggestion.categoryId)?.nameTh || aiSuggestion.categoryName}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          aiSuggestion.confidence === 'high'
                            ? 'bg-green-100 text-green-700'
                            : aiSuggestion.confidence === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {aiSuggestion.confidence === 'high' ? 'มั่นใจสูง' : aiSuggestion.confidence === 'medium' ? 'มั่นใจปานกลาง' : 'ไม่แน่ใจ'}
                        </span>
                      </div>
                      <p className="text-sm text-purple-600 mt-1">{aiSuggestion.reason}</p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={applyAiSuggestion}
                        className="mt-2 bg-white border-purple-300 text-purple-700 hover:bg-purple-50"
                      >
                        <Check className="w-4 h-4 mr-1" />
                        ใช้หมวดหมู่นี้
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {suggestionApplied && (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                  <Check className="w-4 h-4" />
                  <span>ใช้หมวดหมู่ที่ AI แนะนำแล้ว</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                สถานที่ <span className="text-red-500">*</span>
              </label>
              <select
                name="locationId"
                value={formData.locationId}
                onChange={handleChange}
                className={'w-full rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 ' + (errors.locationId ? 'border-red-500' : 'border-gray-300')}
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

            <MultiImageUpload
              label="รูปภาพประกอบ"
              value={formData.photos}
              onChange={(urls) => setFormData((prev) => ({ ...prev, photos: urls }))}
              maxImages={5}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ความเร่งด่วน</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {priorityOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, priority: option.value }))}
                    className={'p-3 rounded-lg border text-left transition-colors ' + (formData.priority === option.value ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300')}
                  >
                    <div className="font-medium text-sm">{option.label}</div>
                    <div className="text-xs text-gray-500">{option.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">วันที่สะดวก</label>
                <Input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เวลาที่สะดวก</label>
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

            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {errors.submit}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
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

      {showSaveTemplateModal && (
        <SaveTemplateModal
          categoryId={formData.categoryId}
          title={formData.title}
          description={formData.description}
          priority={formData.priority}
          onClose={() => setShowSaveTemplateModal(false)}
          onSuccess={() => {
            setShowSaveTemplateModal(false);
            loadTemplates();
          }}
        />
      )}

      {showTemplateDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowTemplateDropdown(false)}
        />
      )}
    </div>
  );
}
