import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  User,
  Wrench,
  AlertTriangle,
  Loader2,
  X,
  Check,
  Play,
  CheckCircle,
  Star,
  Image as ImageIcon,
  MessageSquare,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useRequestStore } from '../stores/request.store';
import { useAuthStore } from '../stores/auth.store';
import { ratingApi, type Rating } from '../api/rating';
import { technicianFeedbackApi, type TechnicianFeedback } from '../api/technicianFeedback';
import TechnicianFeedbackModal from '../components/TechnicianFeedbackModal';

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  assigned: 'bg-blue-100 text-blue-800 border-blue-200',
  accepted: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  in_progress: 'bg-purple-100 text-purple-800 border-purple-200',
  on_hold: 'bg-orange-100 text-orange-800 border-orange-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-gray-100 text-gray-800 border-gray-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
};

const statusLabels: Record<string, string> = {
  pending: 'รอรับเรื่อง',
  assigned: 'มอบหมายแล้ว',
  accepted: 'รับงานแล้ว',
  in_progress: 'กำลังดำเนินการ',
  on_hold: 'รอดำเนินการ',
  completed: 'เสร็จสิ้น',
  cancelled: 'ยกเลิก',
  rejected: 'ปฏิเสธ',
};

const priorityLabels: Record<string, string> = {
  low: 'ต่ำ',
  normal: 'ปกติ',
  high: 'สูง',
  urgent: 'ด่วนมาก',
};

const priorityColors: Record<string, string> = {
  low: 'text-gray-600',
  normal: 'text-blue-600',
  high: 'text-orange-600',
  urgent: 'text-red-600',
};

export default function RequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    currentRequest,
    technicians,
    isLoading,
    isSubmitting,
    fetchRequestById,
    fetchTechnicians,
    cancelRequest,
    assignRequest,
    acceptRequest,
    rejectRequest,
    startRequest,
    completeRequest,
    clearCurrentRequest,
  } = useRequestStore();

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [cancelReason, setCancelReason] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [selectedTechnicianId, setSelectedTechnicianId] = useState('');
  const [assignNote, setAssignNote] = useState('');

  // Rating state
  const [rating, setRating] = useState<Rating | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  // Technician Feedback state (admin feedback for technician)
  const [technicianFeedback, setTechnicianFeedback] = useState<TechnicianFeedback | null>(null);
  const [showTechnicianFeedbackModal, setShowTechnicianFeedbackModal] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRequestById(id);
      // Fetch rating
      ratingApi.getRating(id).then((res) => {
        if (res.success && res.data) {
          setRating(res.data);
        }
      });
      // Fetch technician feedback
      technicianFeedbackApi.getFeedbackByRequestId(id).then((res) => {
        if (res.success && res.data) {
          setTechnicianFeedback(res.data);
        }
      });
    }
    return () => clearCurrentRequest();
  }, [id, fetchRequestById, clearCurrentRequest]);

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchTechnicians();
    }
  }, [user?.role, fetchTechnicians]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCancel = async () => {
    if (!id) return;
    try {
      await cancelRequest(id, cancelReason || undefined);
      setShowCancelModal(false);
      navigate('/requests');
    } catch (error) {
      console.error('Cancel failed:', error);
    }
  };

  const handleAssign = async () => {
    if (!id || !selectedTechnicianId) return;
    try {
      await assignRequest(id, selectedTechnicianId, assignNote || undefined);
      setShowAssignModal(false);
      setSelectedTechnicianId('');
      setAssignNote('');
    } catch (error) {
      console.error('Assign failed:', error);
    }
  };

  const handleAccept = async () => {
    if (!id) return;
    try {
      await acceptRequest(id);
    } catch (error) {
      console.error('Accept failed:', error);
    }
  };

  const handleReject = async () => {
    if (!id || !rejectReason) return;
    try {
      await rejectRequest(id, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
    } catch (error) {
      console.error('Reject failed:', error);
    }
  };

  const handleStart = async () => {
    if (!id) return;
    try {
      await startRequest(id);
    } catch (error) {
      console.error('Start failed:', error);
    }
  };

  const handleComplete = async () => {
    if (!id) return;
    try {
      await completeRequest(id);
    } catch (error) {
      console.error('Complete failed:', error);
    }
  };

  const handleSubmitRating = async () => {
    if (!id) return;
    setIsSubmittingRating(true);
    try {
      const res = await ratingApi.createRating(id, ratingScore, ratingComment || undefined);
      if (res.success && res.data) {
        setRating(res.data);
        setShowRatingModal(false);
      }
    } catch (error) {
      console.error('Rating failed:', error);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const openImageModal = (index: number) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  if (isLoading || !currentRequest) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const request = currentRequest;
  const isOwner = request.user.id === user?.id;
  const isAdmin = user?.role === 'admin';
  const isTechnician = user?.role === 'technician';
  const isAssignedTechnician = request.technician?.user.id === user?.id;
  const canRate = isOwner && request.status === 'completed' && !rating;
  // Admin can give technician feedback when request is completed, has a technician, and no feedback yet
  const canGiveTechnicianFeedback = isAdmin && request.status === 'completed' && request.technician && !technicianFeedback;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{request.requestNumber}</span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                statusColors[request.status]
              }`}
            >
              {statusLabels[request.status]}
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900">{request.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>รายละเอียด</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {request.description && <p className="text-gray-700">{request.description}</p>}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="p-1 bg-gray-100 rounded">{request.category.nameTh}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <AlertTriangle className={`w-4 h-4 ${priorityColors[request.priority]}`} />
                  {priorityLabels[request.priority]}
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>
                  {request.location.building}
                  {request.location.floor && ` ชั้น ${request.location.floor}`}
                  {request.location.room && ` ห้อง ${request.location.room}`}
                </span>
              </div>

              {request.preferredDate && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>วันที่สะดวก: {formatDate(request.preferredDate)}</span>
                </div>
              )}

              {request.preferredTime && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>เวลาที่สะดวก: {request.preferredTime}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Photos Card */}
          {request.photos && request.photos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  รูปภาพประกอบ ({request.photos.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {request.photos.map((photo, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => openImageModal(index)}
                    >
                      <img
                        src={photo}
                        alt={`รูปที่ ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rating Card */}
          {rating && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  การให้คะแนน
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${
                        star <= rating.score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-lg font-medium">{rating.score}/5</span>
                </div>
                {rating.comment && <p className="text-gray-600 mt-2">{rating.comment}</p>}
                <p className="text-xs text-gray-400 mt-2">
                  ให้คะแนนโดย {rating.user.name} เมื่อ {formatDate(rating.createdAt)}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Technician Feedback Card (Admin's feedback for technician) */}
          {technicianFeedback && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-indigo-500" />
                  Feedback ช่าง
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-6 h-6 ${
                        star <= technicianFeedback.score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                  <span className="ml-2 text-lg font-medium">{technicianFeedback.score}/5</span>
                </div>
                {technicianFeedback.comment && (
                  <p className="text-gray-600 dark:text-gray-300 mt-2 bg-gray-50 dark:bg-gray-700/50 p-3 rounded-lg">
                    "{technicianFeedback.comment}"
                  </p>
                )}
                <p className="text-xs text-gray-400 mt-2">
                  โดย {technicianFeedback.admin.name} เมื่อ {formatDate(technicianFeedback.createdAt)}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Timeline Card */}
          <Card>
            <CardHeader>
              <CardTitle>ไทม์ไลน์</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-gray-400 rounded-full" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">สร้างคำร้อง</p>
                    <p className="text-xs text-gray-500">{formatDate(request.createdAt)}</p>
                  </div>
                </div>
                {request.assignedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">มอบหมายช่าง</p>
                      <p className="text-xs text-gray-500">{formatDate(request.assignedAt)}</p>
                    </div>
                  </div>
                )}
                {request.startedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">เริ่มดำเนินการ</p>
                      <p className="text-xs text-gray-500">{formatDate(request.startedAt)}</p>
                    </div>
                  </div>
                )}
                {request.completedAt && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">เสร็จสิ้น</p>
                      <p className="text-xs text-gray-500">{formatDate(request.completedAt)}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Requester Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-4 h-4" />
                ผู้แจ้ง
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  {request.user.avatarUrl ? (
                    <img
                      src={request.user.avatarUrl}
                      alt={request.user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-5 h-5 text-gray-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{request.user.name}</p>
                  <p className="text-sm text-gray-500">{request.user.department || '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technician Info */}
          {request.technician && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  ช่างที่รับผิดชอบ
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    {request.technician.user.avatarUrl ? (
                      <img
                        src={request.technician.user.avatarUrl}
                        alt={request.technician.user.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <Wrench className="w-5 h-5 text-gray-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{request.technician.user.name}</p>
                    <p className="text-sm text-gray-500">{request.technician.user.phone || '-'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>การดำเนินการ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {/* User actions */}
              {isOwner && ['pending', 'assigned'].includes(request.status) && (
                <Button
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => setShowCancelModal(true)}
                >
                  <X className="w-4 h-4 mr-2" />
                  ยกเลิกคำร้อง
                </Button>
              )}

              {/* Admin actions */}
              {isAdmin && ['pending', 'rejected'].includes(request.status) && (
                <Button className="w-full" onClick={() => setShowAssignModal(true)}>
                  <User className="w-4 h-4 mr-2" />
                  มอบหมายช่าง
                </Button>
              )}

              {/* Technician actions */}
              {(isTechnician || isAdmin) && isAssignedTechnician && (
                <>
                  {request.status === 'assigned' && (
                    <>
                      <Button className="w-full" onClick={handleAccept} disabled={isSubmitting}>
                        <Check className="w-4 h-4 mr-2" />
                        รับงาน
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => setShowRejectModal(true)}
                      >
                        <X className="w-4 h-4 mr-2" />
                        ปฏิเสธงาน
                      </Button>
                    </>
                  )}
                  {request.status === 'accepted' && (
                    <Button className="w-full" onClick={handleStart} disabled={isSubmitting}>
                      <Play className="w-4 h-4 mr-2" />
                      เริ่มดำเนินการ
                    </Button>
                  )}
                  {['in_progress', 'on_hold'].includes(request.status) && (
                    <Button
                      className="w-full bg-green-600 hover:bg-green-700"
                      onClick={handleComplete}
                      disabled={isSubmitting}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      เสร็จสิ้น
                    </Button>
                  )}
                </>
              )}

              {/* Rating button */}
              {canRate && (
                <Button
                  className="w-full bg-yellow-500 hover:bg-yellow-600"
                  onClick={() => setShowRatingModal(true)}
                >
                  <Star className="w-4 h-4 mr-2" />
                  ให้คะแนน
                </Button>
              )}

              {/* Technician Feedback button (Admin only) */}
              {canGiveTechnicianFeedback && (
                <Button
                  className="w-full bg-indigo-500 hover:bg-indigo-600"
                  onClick={() => setShowTechnicianFeedbackModal(true)}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  ให้ Feedback ช่าง
                </Button>
              )}

              {request.status === 'completed' && !canRate && !rating && (
                <p className="text-center text-green-600 font-medium">งานเสร็จสิ้นแล้ว</p>
              )}
              {request.status === 'completed' && rating && (
                <p className="text-center text-green-600 font-medium">ให้คะแนนแล้ว</p>
              )}
              {request.status === 'cancelled' && (
                <p className="text-center text-gray-500">คำร้องถูกยกเลิก</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && request.photos && request.photos.length > 0 && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <button
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full"
            onClick={() => setShowImageModal(false)}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-4xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <img
              src={request.photos[selectedImageIndex]}
              alt={`รูปที่ ${selectedImageIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain"
            />
            {request.photos.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {request.photos.map((_, index) => (
                  <button
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === selectedImageIndex ? 'bg-white' : 'bg-white/50'
                    }`}
                    onClick={() => setSelectedImageIndex(index)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>ยกเลิกคำร้อง</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">คุณแน่ใจหรือไม่ที่จะยกเลิกคำร้องนี้?</p>
              <textarea
                className="w-full border rounded-lg p-2"
                rows={3}
                placeholder="เหตุผลในการยกเลิก (ไม่บังคับ)"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCancelModal(false)}
                >
                  ไม่ใช่
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                >
                  ยืนยันยกเลิก
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Assign Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>มอบหมายช่าง</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">เลือกช่าง</label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={selectedTechnicianId}
                  onChange={(e) => setSelectedTechnicianId(e.target.value)}
                >
                  <option value="">เลือกช่าง</option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ</label>
                <textarea
                  className="w-full border rounded-lg p-2"
                  rows={2}
                  placeholder="หมายเหตุถึงช่าง (ไม่บังคับ)"
                  value={assignNote}
                  onChange={(e) => setAssignNote(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowAssignModal(false)}
                >
                  ยกเลิก
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleAssign}
                  disabled={!selectedTechnicianId || isSubmitting}
                >
                  มอบหมาย
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>ปฏิเสธงาน</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  เหตุผลในการปฏิเสธ <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full border rounded-lg p-2"
                  rows={3}
                  placeholder="กรุณาระบุเหตุผล"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowRejectModal(false)}
                >
                  ยกเลิก
                </Button>
                <Button
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={handleReject}
                  disabled={!rejectReason || isSubmitting}
                >
                  ปฏิเสธงาน
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-500" />
                ให้คะแนนการบริการ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">คะแนน</label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRatingScore(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star
                        className={`w-10 h-10 ${
                          star <= ratingScore
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-gray-300 hover:text-yellow-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm text-gray-500 mt-1">
                  {ratingScore === 1 && 'แย่มาก'}
                  {ratingScore === 2 && 'แย่'}
                  {ratingScore === 3 && 'ปานกลาง'}
                  {ratingScore === 4 && 'ดี'}
                  {ratingScore === 5 && 'ดีมาก'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ความคิดเห็น (ไม่บังคับ)
                </label>
                <textarea
                  className="w-full border rounded-lg p-2"
                  rows={3}
                  placeholder="แสดงความคิดเห็นเพิ่มเติม..."
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowRatingModal(false)}
                >
                  ยกเลิก
                </Button>
                <Button
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600"
                  onClick={handleSubmitRating}
                  disabled={isSubmittingRating}
                >
                  {isSubmittingRating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'ส่งคะแนน'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Technician Feedback Modal */}
      {showTechnicianFeedbackModal && request.technician && (
        <TechnicianFeedbackModal
          requestId={request.id}
          requestNumber={request.requestNumber}
          technicianName={request.technician.user.name}
          onClose={() => setShowTechnicianFeedbackModal(false)}
          onSuccess={() => {
            setShowTechnicianFeedbackModal(false);
            // Refetch technician feedback
            if (id) {
              technicianFeedbackApi.getFeedbackByRequestId(id).then((res) => {
                if (res.success && res.data) {
                  setTechnicianFeedback(res.data);
                }
              });
            }
          }}
        />
      )}
    </div>
  );
}
