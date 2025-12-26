import { useState, useEffect } from 'react';
import { Loader2, MessageSquare, ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import TechnicianFeedbackCard from './TechnicianFeedbackCard';
import { technicianFeedbackApi, type TechnicianFeedback, type FeedbackQueryParams } from '../api/technicianFeedback';
import { cn } from '../utils/cn';

interface TechnicianFeedbackListProps {
  technicianId?: string;
  showTechnician?: boolean;
  showRequest?: boolean;
  title?: string;
  emptyMessage?: string;
  className?: string;
  limit?: number;
  fetchType?: 'all' | 'technician' | 'my';
}

export default function TechnicianFeedbackList({
  technicianId,
  showTechnician = true,
  showRequest = true,
  title = 'Feedback',
  emptyMessage = 'ยังไม่มี Feedback',
  className,
  limit = 10,
  fetchType = 'all',
}: TechnicianFeedbackListProps) {
  const [feedbacks, setFeedbacks] = useState<TechnicianFeedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState<'createdAt' | 'score'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const fetchFeedbacks = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params: FeedbackQueryParams = {
        page: currentPage,
        limit,
        sortBy,
        sortOrder,
      };

      let response;

      if (fetchType === 'technician' && technicianId) {
        response = await technicianFeedbackApi.getTechnicianFeedbacks(technicianId, params);
      } else if (fetchType === 'my') {
        response = await technicianFeedbackApi.getMyFeedbacks(params);
      } else {
        response = await technicianFeedbackApi.getAllFeedbacks(params);
      }

      if (response.success && response.data) {
        setFeedbacks(response.data.feedbacks);
        setTotalPages(response.data.totalPages);
        setTotal(response.data.total);
      } else {
        setError(response.error?.message || 'ไม่สามารถโหลดข้อมูลได้');
      }
    } catch {
      setError('เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, sortBy, sortOrder, technicianId, fetchType]);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleSort = (newSortBy: 'createdAt' | 'score') => {
    if (sortBy === newSortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardContent className="text-center py-12">
          <p className="text-red-500">{error}</p>
          <Button variant="outline" className="mt-4" onClick={fetchFeedbacks}>
            ลองใหม่
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-primary-500" />
          {title}
          {total > 0 && (
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
              ({total} รายการ)
            </span>
          )}
        </CardTitle>

        {/* Sort Controls */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500 dark:text-gray-400">เรียงตาม:</span>
          <button
            onClick={() => handleSort('createdAt')}
            className={cn(
              'px-3 py-1 text-sm rounded-lg transition-colors',
              sortBy === 'createdAt'
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
          >
            วันที่ {sortBy === 'createdAt' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
          <button
            onClick={() => handleSort('score')}
            className={cn(
              'px-3 py-1 text-sm rounded-lg transition-colors flex items-center gap-1',
              sortBy === 'score'
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
          >
            <Star className="w-3.5 h-3.5" />
            คะแนน {sortBy === 'score' && (sortOrder === 'desc' ? '↓' : '↑')}
          </button>
        </div>
      </CardHeader>

      <CardContent>
        {feedbacks.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">{emptyMessage}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <TechnicianFeedbackCard
                key={feedback.id}
                feedback={feedback}
                showTechnician={showTechnician}
                showRequest={showRequest}
              />
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  หน้า {currentPage} จาก {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    ก่อนหน้า
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    ถัดไป
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
