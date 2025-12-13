import React, { useState } from 'react';
import { Upload, AlertCircle, CheckCircle, Send, Sparkles } from 'lucide-react';
import type { CreateRequestDTO, Department, Urgency } from '../../types';
import { useRequests } from '../../context/RequestContext';
import { THAI_TEXT, DEPARTMENTS, URGENCY_LEVELS } from '../../constants';
import {
  validateRequesterName,
  validateDescription,
  validateEquipment,
  validateImageFile,
  fileToBase64,
} from '../../utils/helpers';

export const RequestForm: React.FC = () => {
  const { createRequest, loading } = useRequests();

  const [formData, setFormData] = useState<CreateRequestDTO>({
    requesterName: '',
    department: 'IT' as Department,
    equipment: '',
    description: '',
    urgency: 'medium' as Urgency,
    imageUrl: undefined,
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const error = validateImageFile(file);
    if (error) {
      setErrors(prev => ({ ...prev, image: error }));
      return;
    }

    setImageFile(file);
    setErrors(prev => ({ ...prev, image: '' }));

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameError = validateRequesterName(formData.requesterName);
    if (nameError) newErrors.requesterName = nameError;

    const equipmentError = validateEquipment(formData.equipment);
    if (equipmentError) newErrors.equipment = equipmentError;

    const descriptionError = validateDescription(formData.description);
    if (descriptionError) newErrors.description = descriptionError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(null);

    if (!validateForm()) {
      return;
    }

    try {
      let imageUrl = formData.imageUrl;

      if (imageFile) {
        imageUrl = await fileToBase64(imageFile);
      }

      const requestData: CreateRequestDTO = {
        ...formData,
        imageUrl,
      };

      const newRequest = await createRequest(requestData);

      setSubmitSuccess(`${THAI_TEXT.requester.successMessage}${newRequest.id}`);

      setFormData({
        requesterName: '',
        department: 'IT' as Department,
        equipment: '',
        description: '',
        urgency: 'medium' as Urgency,
        imageUrl: undefined,
      });
      setImageFile(null);
      setImagePreview(null);

      setTimeout(() => setSubmitSuccess(null), 5000);
    } catch (error) {
      setErrors({ submit: THAI_TEXT.requester.errorMessage });
    }
  };

  return (
    <div className="relative max-w-4xl mx-auto">
      {/* Glass Card */}
      <div className="bg-white/60 backdrop-blur-2xl rounded-3xl shadow-glass border border-white/20 p-10 animate-scale-in">
        {/* Header */}
        <div className="flex items-start gap-5 mb-10">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-secondary-400 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity animate-glow"></div>
            <div className="relative bg-gradient-to-br from-primary-500 to-secondary-500 p-4 rounded-2xl shadow-glass">
              <Upload className="w-10 h-10 text-white" strokeWidth={2.5} />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-4xl font-black bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                {THAI_TEXT.requester.formTitle}
              </h2>
              <Sparkles className="w-6 h-6 text-secondary-500 animate-bounce-subtle" />
            </div>
            <p className="text-gray-600 text-lg">
              กรอกข้อมูลให้ครบถ้วน เพื่อความรวดเร็วในการดำเนินการ ✨
            </p>
          </div>
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="mb-8 p-6 bg-gradient-to-r from-success-50 to-success-100 border-2 border-success-300 rounded-2xl flex items-center gap-4 text-success-800 animate-scale-in shadow-soft">
            <div className="bg-success-500 p-3 rounded-full shadow-lg">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">สำเร็จ!</p>
              <p className="text-success-700">{submitSuccess}</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="mb-8 p-6 bg-gradient-to-r from-danger-50 to-danger-100 border-2 border-danger-300 rounded-2xl flex items-center gap-4 text-danger-800 animate-scale-in shadow-soft">
            <div className="bg-danger-500 p-3 rounded-full shadow-lg">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-lg">เกิดข้อผิดพลาด</p>
              <p className="text-danger-700">{errors.submit}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Requester Name */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">
                ชื่อผู้แจ้ง <span className="text-danger-500">*</span>
              </label>
              <input
                type="text"
                name="requesterName"
                value={formData.requesterName}
                onChange={handleInputChange}
                placeholder="กรอกชื่อของคุณ"
                className={`w-full px-5 py-4 bg-white/50 backdrop-blur-sm border-2 rounded-2xl transition-all duration-200 ${
                  errors.requesterName
                    ? 'border-danger-400 focus:border-danger-500 focus:ring-4 focus:ring-danger-100'
                    : 'border-gray-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-100'
                } focus:outline-none font-medium shadow-inner`}
              />
              {errors.requesterName && (
                <p className="text-sm text-danger-600 flex items-center gap-2 animate-slide-down">
                  <AlertCircle className="w-4 h-4" />
                  {errors.requesterName}
                </p>
              )}
            </div>

            {/* Department */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">
                แผนก <span className="text-danger-500">*</span>
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full px-5 py-4 bg-white/50 backdrop-blur-sm border-2 border-gray-200 rounded-2xl focus:border-primary-400 focus:ring-4 focus:ring-primary-100 focus:outline-none font-medium shadow-inner transition-all duration-200"
              >
                {DEPARTMENTS.map(dept => (
                  <option key={dept} value={dept}>
                    {THAI_TEXT.department[dept]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Equipment */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700">
              อุปกรณ์/พื้นที่ <span className="text-danger-500">*</span>
            </label>
            <input
              type="text"
              name="equipment"
              value={formData.equipment}
              onChange={handleInputChange}
              placeholder="เช่น คอมพิวเตอร์ห้อง A101, เครื่องปริ้นเตอร์"
              className={`w-full px-5 py-4 bg-white/50 backdrop-blur-sm border-2 rounded-2xl transition-all duration-200 ${
                errors.equipment
                  ? 'border-danger-400 focus:border-danger-500 focus:ring-4 focus:ring-danger-100'
                  : 'border-gray-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-100'
              } focus:outline-none font-medium shadow-inner`}
            />
            {errors.equipment && (
              <p className="text-sm text-danger-600 flex items-center gap-2 animate-slide-down">
                <AlertCircle className="w-4 h-4" />
                {errors.equipment}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700">
              รายละเอียดปัญหา <span className="text-danger-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="อธิบายปัญหาที่พบโดยละเอียด..."
              rows={5}
              className={`w-full px-5 py-4 bg-white/50 backdrop-blur-sm border-2 rounded-2xl transition-all duration-200 ${
                errors.description
                  ? 'border-danger-400 focus:border-danger-500 focus:ring-4 focus:ring-danger-100'
                  : 'border-gray-200 focus:border-primary-400 focus:ring-4 focus:ring-primary-100'
              } focus:outline-none font-medium shadow-inner resize-none`}
            />
            {errors.description && (
              <p className="text-sm text-danger-600 flex items-center gap-2 animate-slide-down">
                <AlertCircle className="w-4 h-4" />
                {errors.description}
              </p>
            )}
          </div>

          {/* Image Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700">
              รูปภาพประกอบ (ไม่บังคับ)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center bg-white/30 backdrop-blur-sm hover:border-primary-400 transition-all duration-200">
              {imagePreview ? (
                <div className="space-y-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-64 mx-auto rounded-xl shadow-medium"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="text-sm text-danger-600 hover:text-danger-700 font-semibold"
                  >
                    ลบรูปภาพ
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <label className="cursor-pointer">
                    <span className="text-primary-600 hover:text-primary-700 font-semibold text-lg">
                      คลิกเพื่ออัปโหลดรูปภาพ
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm text-gray-500 mt-2">PNG, JPG, GIF ขนาดไม่เกิน 5MB</p>
                </div>
              )}
            </div>
            {errors.image && (
              <p className="text-sm text-danger-600 flex items-center gap-2 animate-slide-down">
                <AlertCircle className="w-4 h-4" />
                {errors.image}
              </p>
            )}
          </div>

          {/* Urgency */}
          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-700">
              ระดับความเร่งด่วน <span className="text-danger-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {URGENCY_LEVELS.map(level => (
                <label
                  key={level}
                  className={`relative cursor-pointer group ${
                    formData.urgency === level ? 'scale-105' : ''
                  } transition-transform duration-200`}
                >
                  <input
                    type="radio"
                    name="urgency"
                    value={level}
                    checked={formData.urgency === level}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div
                    className={`p-5 rounded-2xl border-2 text-center transition-all duration-200 ${
                      formData.urgency === level
                        ? level === 'high'
                          ? 'bg-danger-50 border-danger-400 shadow-glass'
                          : level === 'medium'
                          ? 'bg-warning-50 border-warning-400 shadow-glass'
                          : 'bg-success-50 border-success-400 shadow-glass'
                        : 'bg-white/30 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <span
                      className={`font-bold text-lg ${
                        formData.urgency === level
                          ? level === 'high'
                            ? 'text-danger-700'
                            : level === 'medium'
                            ? 'text-warning-700'
                            : 'text-success-700'
                          : 'text-gray-700'
                      }`}
                    >
                      {THAI_TEXT.urgency[level]}
                    </span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="relative w-full group overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary-600 via-secondary-600 to-primary-600 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition-opacity animate-shimmer bg-[length:200%_100%]"></div>
              <div className="relative bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white font-bold px-10 py-5 rounded-2xl transition-all duration-300 shadow-glass hover:shadow-glass-hover flex items-center justify-center gap-3 text-lg">
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>กำลังส่งคำขอ...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-6 h-6" />
                    <span>ส่งคำขอซ่อม</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
