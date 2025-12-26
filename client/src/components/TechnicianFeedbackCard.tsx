import { Star, User, Calendar, FileText } from 'lucide-react';
import { Card, CardContent } from './ui/Card';
import { cn } from '../utils/cn';
import type { TechnicianFeedback } from '../api/technicianFeedback';

interface TechnicianFeedbackCardProps {
  feedback: TechnicianFeedback;
  showTechnician?: boolean;
  showRequest?: boolean;
  className?: string;
}

export default function TechnicianFeedbackCard({
  feedback,
  showTechnician = true,
  showRequest = true,
  className,
}: TechnicianFeedbackCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 5) return 'text-emerald-500';
    if (score >= 4) return 'text-green-500';
    if (score >= 3) return 'text-yellow-500';
    if (score >= 2) return 'text-orange-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    const labels = ['', 'ต้องปรับปรุง', 'พอใช้', 'ปานกลาง', 'ดี', 'ยอดเยี่ยม'];
    return labels[score] || '';
  };

  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header: Score and Date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Stars */}
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      'w-5 h-5',
                      star <= feedback.score
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300 dark:text-gray-600'
                    )}
                  />
                ))}
              </div>
              <span className={cn('font-semibold', getScoreColor(feedback.score))}>
                {feedback.score}/5
              </span>
              <span className={cn('text-sm', getScoreColor(feedback.score))}>
                ({getScoreLabel(feedback.score)})
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>{formatDate(feedback.createdAt)}</span>
            </div>
          </div>

          {/* Comment */}
          {feedback.comment && (
            <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
              "{feedback.comment}"
            </p>
          )}

          {/* Footer: Technician, Request, Admin info */}
          <div className="flex flex-wrap gap-4 text-sm pt-2 border-t border-gray-100 dark:border-gray-700">
            {showTechnician && feedback.technician && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  {feedback.technician.user.avatarUrl ? (
                    <img
                      src={feedback.technician.user.avatarUrl}
                      alt={feedback.technician.user.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <span className="text-gray-600 dark:text-gray-400">
                  ช่าง: <span className="font-medium text-gray-900 dark:text-white">{feedback.technician.user.name}</span>
                </span>
              </div>
            )}

            {showRequest && feedback.request && (
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">
                  คำร้อง: <span className="font-medium text-gray-900 dark:text-white">{feedback.request.requestNumber}</span>
                </span>
              </div>
            )}

            {feedback.admin && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-gray-500 dark:text-gray-400 text-xs">
                  โดย: {feedback.admin.name}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
