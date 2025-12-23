import { useState } from 'react';
import { Star, X, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { ratingsApi } from '../api/ratings';

interface RatingModalProps {
  requestId: string;
  requestNumber: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RatingModal({
  requestId,
  requestNumber,
  onClose,
  onSuccess,
}: RatingModalProps) {
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

    setIsSubmitting(true);
    setError('');

    try {
      const response = await ratingsApi.create(requestId, { score, comment: comment || undefined });
      if (response.success) {
        onSuccess();
      } else {
        setError(response.error?.message || 'ไม่สามารถให้คะแนนได้');
      }
    } catch {
      setError('เกิดข้อผิดพลาด กรุณาลองใหม่');
    } finally {
      setIsSubmitting(false);
    }
  };

  const ratingLabels = ['', 'แย่มาก', 'แย่', 'พอใช้', 'ดี', 'ดีมาก'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>ให้คะแนนการบริการ</CardTitle>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm text-gray-600">
            คำร้อง: <span className="font-medium">{requestNumber}</span>
          </p>

          {/* Star Rating */}
          <div className="text-center">
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setScore(value)}
                  onMouseEnter={() => setHoverScore(value)}
                  onMouseLeave={() => setHoverScore(0)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      value <= (hoverScore || score)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            {(hoverScore || score) > 0 && (
              <p className="text-sm font-medium text-gray-700">
                {ratingLabels[hoverScore || score]}
              </p>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ความคิดเห็น (ไม่บังคับ)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="แสดงความคิดเห็นของคุณ..."
            />
          </div>

          {error && <p className="text-sm text-red-500 text-center">{error}</p>}

          {/* Actions */}
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose} disabled={isSubmitting}>
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
                'ส่งคะแนน'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
