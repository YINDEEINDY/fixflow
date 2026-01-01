import { useState } from 'react';
// Force rebuild
import { X, Loader2, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { templatesApi, type CreateTemplateInput } from '../../api/templates';
import type { Priority } from '../../types/index';

interface SaveTemplateModalProps {
  categoryId: string;
  title: string;
  description: string;
  priority: Priority;
  onClose: () => void;
  onSuccess: () => void;
}

export default function SaveTemplateModal({
  categoryId,
  title,
  description,
  priority,
  onClose,
  onSuccess,
}: SaveTemplateModalProps) {
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!templateName.trim()) {
      setError('กรุณากรอกชื่อ Template');
      return;
    }

    if (!categoryId) {
      setError('กรุณาเลือกหมวดหมู่ก่อน');
      return;
    }

    if (!title.trim()) {
      setError('กรุณากรอกหัวข้อก่อน');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const input: CreateTemplateInput = {
        name: templateName.trim(),
        description: templateDescription.trim() || undefined,
        categoryId,
        title: title.trim(),
        content: description.trim() || undefined,
        priority,
        isPublic,
      };

      const response = await templatesApi.create(input);
      if (response.success) {
        onSuccess();
      } else {
        setError(response.error?.message || 'ไม่สามารถบันทึก Template ได้');
      }
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Save className="w-5 h-5" />
            บันทึกเป็น Template
          </CardTitle>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Template Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ชื่อ Template <span className="text-red-500">*</span>
              </label>
              <Input
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="เช่น แจ้งซ่อมแอร์ห้องประชุม"
              />
            </div>

            {/* Template Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                คำอธิบาย Template
              </label>
              <textarea
                value={templateDescription}
                onChange={(e) => setTemplateDescription(e.target.value)}
                rows={2}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="อธิบายว่า Template นี้ใช้สำหรับอะไร..."
              />
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-3 space-y-1">
              <p className="text-xs text-gray-500 font-medium">ข้อมูลที่จะบันทึก:</p>
              <p className="text-sm">
                <span className="text-gray-500">หัวข้อ:</span> {title || '-'}
              </p>
              <p className="text-sm">
                <span className="text-gray-500">รายละเอียด:</span> {description || '-'}
              </p>
              <p className="text-sm">
                <span className="text-gray-500">ความเร่งด่วน:</span>{' '}
                {priority === 'low'
                  ? 'ต่ำ'
                  : priority === 'normal'
                    ? 'ปกติ'
                    : priority === 'high'
                      ? 'สูง'
                      : 'ด่วนมาก'}
              </p>
            </div>

            {/* Public Option */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">แชร์ให้ผู้ใช้คนอื่นใช้งานได้</span>
            </label>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={onClose}
                disabled={isSubmitting}
              >
                ยกเลิก
              </Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    กำลังบันทึก...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    บันทึก Template
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
