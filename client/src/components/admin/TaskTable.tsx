import React, { useState } from 'react';
import { ArrowUpDown, Eye, Trash2, User } from 'lucide-react';
import type { MaintenanceRequest, Status } from '../../types';
import { useRequests } from '../../context/RequestContext';
import { StatusBadge } from '../shared/StatusBadge';
import { UrgencyIndicator } from '../shared/UrgencyIndicator';
import { Modal } from '../shared/Modal';
import { THAI_TEXT } from '../../constants';

interface TaskTableProps {
  requests: MaintenanceRequest[];
}

type SortField = 'createdAt' | 'urgency' | 'status';
type SortOrder = 'asc' | 'desc';

export const TaskTable: React.FC<TaskTableProps> = ({ requests }) => {
  const { updateRequest, deleteRequest } = useRequests();
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const sortedRequests = [...requests].sort((a, b) => {
    let comparison = 0;

    if (sortField === 'createdAt') {
      comparison = a.createdAt.getTime() - b.createdAt.getTime();
    } else if (sortField === 'urgency') {
      const urgencyOrder = { high: 3, medium: 2, low: 1 };
      comparison = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
    } else if (sortField === 'status') {
      const statusOrder = { pending: 1, in_progress: 2, completed: 3 };
      comparison = statusOrder[a.status] - statusOrder[b.status];
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const handleStatusChange = async (id: string, newStatus: Status) => {
    try {
      await updateRequest(id, { status: newStatus });
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAssignTechnician = async (id: string) => {
    const technician = prompt('ระบุชื่อช่างผู้รับผิดชอบ:');
    if (technician) {
      try {
        await updateRequest(id, { assignedTechnician: technician });
      } catch (error) {
        console.error('Error assigning technician:', error);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบคำขอนี้?')) {
      try {
        await deleteRequest(id);
      } catch (error) {
        console.error('Error deleting request:', error);
      }
    }
  };

  const handleViewDetails = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('th-TH', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  หมายเลข
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ผู้แจ้ง
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  อุปกรณ์
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('urgency')}
                >
                  <div className="flex items-center gap-1">
                    ความเร่งด่วน
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center gap-1">
                    สถานะ
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ช่างผู้รับผิดชอบ
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('createdAt')}
                >
                  <div className="flex items-center gap-1">
                    วันที่แจ้ง
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  จัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    ยังไม่มีคำขอในระบบ
                  </td>
                </tr>
              ) : (
                sortedRequests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {request.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      <div>
                        <div className="font-medium">{request.requesterName}</div>
                        <div className="text-xs text-gray-500">
                          {THAI_TEXT.department[request.department]}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {request.equipment}
                    </td>
                    <td className="px-4 py-3">
                      <UrgencyIndicator urgency={request.urgency} />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={request.status}
                        onChange={(e) =>
                          handleStatusChange(request.id, e.target.value as Status)
                        }
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        <option value="pending">
                          {THAI_TEXT.status.pending}
                        </option>
                        <option value="in_progress">
                          {THAI_TEXT.status.in_progress}
                        </option>
                        <option value="completed">
                          {THAI_TEXT.status.completed}
                        </option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {request.assignedTechnician ? (
                        <span>{request.assignedTechnician}</span>
                      ) : (
                        <button
                          onClick={() => handleAssignTechnician(request.id)}
                          className="text-primary hover:text-blue-700 flex items-center gap-1"
                        >
                          <User className="w-4 h-4" />
                          มอบหมาย
                        </button>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="text-blue-600 hover:text-blue-800"
                          title="ดูรายละเอียด"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(request.id)}
                          className="text-red-600 hover:text-red-800"
                          title="ลบ"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          title={`รายละเอียดคำขอ ${selectedRequest.id}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">ผู้แจ้ง</p>
                <p className="font-medium text-gray-800">{selectedRequest.requesterName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">แผนก</p>
                <p className="font-medium text-gray-800">
                  {THAI_TEXT.department[selectedRequest.department]}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">อุปกรณ์</p>
                <p className="font-medium text-gray-800">{selectedRequest.equipment}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">ความเร่งด่วน</p>
                <UrgencyIndicator urgency={selectedRequest.urgency} />
              </div>
              <div>
                <p className="text-sm text-gray-500">สถานะ</p>
                <StatusBadge status={selectedRequest.status} />
              </div>
              {selectedRequest.assignedTechnician && (
                <div>
                  <p className="text-sm text-gray-500">ช่างผู้รับผิดชอบ</p>
                  <p className="font-medium text-gray-800">
                    {selectedRequest.assignedTechnician}
                  </p>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-500 mb-1">รายละเอียดปัญหา</p>
              <p className="text-gray-800">{selectedRequest.description}</p>
            </div>

            {selectedRequest.imageUrl && (
              <div>
                <p className="text-sm text-gray-500 mb-2">รูปภาพประกอบ</p>
                <img
                  src={selectedRequest.imageUrl}
                  alt="Request"
                  className="max-h-64 rounded-lg border border-gray-200"
                />
              </div>
            )}

            <div className="border-t pt-4">
              <div className="text-sm space-y-1">
                <div>
                  <span className="text-gray-500">วันที่แจ้ง: </span>
                  <span className="text-gray-700">{formatDate(selectedRequest.createdAt)}</span>
                </div>
                <div>
                  <span className="text-gray-500">อัปเดตล่าสุด: </span>
                  <span className="text-gray-700">{formatDate(selectedRequest.updatedAt)}</span>
                </div>
                {selectedRequest.completedAt && (
                  <div>
                    <span className="text-gray-500">วันที่เสร็จสิ้น: </span>
                    <span className="text-gray-700">
                      {formatDate(selectedRequest.completedAt)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
};
