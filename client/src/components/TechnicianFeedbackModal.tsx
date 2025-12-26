import { useState } from 'react';
import { Star, X, Loader2, MessageSquare } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { technicianFeedbackApi, type CreateTechnicianFeedbackInput } from '../api/technicianFeedback';

interface TechnicianFeedbackModalProps {
  requestId: string;
  requestNumber: string;
  technicianName: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TechnicianFeedbackModal({
  requestId,
  requestNumber,
  technicianName,
  onClose,
  onSuccess,
}: TechnicianFeedbackModalProps) {
  const [score, setScore] = useState(0);
  const [hoverScore, setHoverScore] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (score === 0) {
      setError('กรุณาให้คะแนน');
      return;
    }

    if (score < 1 || score > 5) {
      setError('คะแนนต้องอยู่ระหว่าง 1-5');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const input: CreateTechnicianFeedbackInput = {
        score,
        comment: comment.trim() || undefined,
      };

      const response = await technicianFeedbackApi.createFeedback(requestId, input);

      if (response.success) {
        onSuccess();
      } else {
        setError(response.error?.message || 'ไม่สามารถให้ Feedback ได้');
      }
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingLabels = ['', 'ต้องปรับปรุง', 'พอใช้', 'ปานกลาง', 'ดี', 'ยอดเยี่ยม'];
  const ratingColors = ['', 'text-red-500', 'text-orange-500', 'text-yellow-500', 'text-green-500', 'text-emerald-500'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary-500" />
            ให้ Feedback ช่าง
          </CardTitle>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Request & Technician Info */}
          <div className="space-y-2 text-sm">
            <p className="text-gray-600 dark:text-gray-400">
              คำร้อง: <span className="font-medium text-gray-900 dark:text-white">{requestNumber}</span>
            </p>
            <p className="text-gray-600 dark:text-gray-400">
              ช่าง: <span className="font-medium text-gray-900 dark:text-white">{technicianName}</span>
            </p>
          </div>

          {/* Star Rating */}
          <div className="text-center">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              คะแนนประเมิน <span className="text-red-500">*</span>
            </label>
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setScore(value)}
                  onMouseEnter={() => setHoverScore(value)}
                  onMouseLeave={() => setHoverScore(0)}
                  className="p-1 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                >
                  <Star
                    className={`w-10 h-10 transition-colors ${
                      value <= (hoverScore || score)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
            {(hoverScore || score) > 0 && (
              <p className={`text-sm font-medium ${ratingColors[hoverScore || score]}`}>
                {ratingLabels[hoverScore || score]}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              ความคิดเห็น (ไม่บังคับ)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              maxLength={500}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              placeholder="แสดงความคิดเห็นเกี่ยวกับการทำงานของช่าง..."
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-right">
              {comment.length}/500 ตัวอักษร
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-900/20 py-2 px-3 rounded-lg">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={isSubmitting}
            >
              ยกเลิก
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmit}
              disabled={isSubmitting || score === 0}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  กำลังส่ง...
                </>
              ) : (
                'ส่ง Feedback'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
