import { Request, Response } from 'express';
import { LocalStorageAdapter } from '../services/localStorageAdapter';
import { CreateRequestDTO, UpdateRequestDTO, MaintenanceRequest } from '../types';

const storage = new LocalStorageAdapter();

// Helper to calculate KPI metrics
const calculateKPIMetrics = (requests: MaintenanceRequest[]) => {
  const totalRequests = requests.length;
  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const inProgressRequests = requests.filter(r => r.status === 'in_progress').length;

  const completedRequests = requests.filter(r => r.status === 'completed');
  const averageCompletionTime = completedRequests.length > 0
    ? completedRequests.reduce((sum, r) => {
        if (!r.completedAt) return sum;
        const createdAt = new Date(r.createdAt);
        const completedAt = new Date(r.completedAt);
        const duration = (completedAt.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        return sum + duration;
      }, 0) / completedRequests.length
    : 0;

  return {
    totalRequests,
    pendingRequests,
    inProgressRequests,
    averageCompletionTime: Math.round(averageCompletionTime * 10) / 10,
  };
};

export const getAllRequests = async (req: Request, res: Response) => {
  try {
    const requests = await storage.getRequests();
    res.json(requests);
  } catch (error) {
    res.status(500).json({
      error: 'InternalServerError',
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
    });
  }
};

export const getRequestById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const request = await storage.getRequestById(id);

    if (!request) {
      return res.status(404).json({
        error: 'NotFound',
        message: 'ไม่พบคำขอนี้ในระบบ'
      });
    }

    res.json(request);
  } catch (error) {
    res.status(500).json({
      error: 'InternalServerError',
      message: 'เกิดข้อผิดพลาดในการดึงข้อมูล'
    });
  }
};

export const createRequest = async (req: Request, res: Response) => {
  try {
    const data: CreateRequestDTO = req.body;

    // Validation
    if (!data.requesterName || data.requesterName.length < 2) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'ชื่อผู้แจ้งต้องมีอย่างน้อย 2 ตัวอักษร'
      });
    }

    if (!data.description || data.description.length < 10) {
      return res.status(400).json({
        error: 'ValidationError',
        message: 'รายละเอียดปัญหาต้องมีอย่างน้อย 10 ตัวอักษร'
      });
    }

    const newRequest = await storage.createRequest(data);
    res.status(201).json(newRequest);
  } catch (error) {
    res.status(500).json({
      error: 'InternalServerError',
      message: 'เกิดข้อผิดพลาดในการสร้างคำขอ'
    });
  }
};

export const updateRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const data: UpdateRequestDTO = req.body;

    const updatedRequest = await storage.updateRequest(id, data);
    res.json(updatedRequest);
  } catch (error: any) {
    if (error.message === 'Request not found') {
      return res.status(404).json({
        error: 'NotFound',
        message: 'ไม่พบคำขอนี้ในระบบ'
      });
    }

    res.status(500).json({
      error: 'InternalServerError',
      message: 'เกิดข้อผิดพลาดในการอัปเดตคำขอ'
    });
  }
};

export const deleteRequest = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await storage.deleteRequest(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      error: 'InternalServerError',
      message: 'เกิดข้อผิดพลาดในการลบคำขอ'
    });
  }
};

export const getKPIMetrics = async (req: Request, res: Response) => {
  try {
    const requests = await storage.getRequests();
    const metrics = calculateKPIMetrics(requests);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({
      error: 'InternalServerError',
      message: 'เกิดข้อผิดพลาดในการคำนวณข้อมูล'
    });
  }
};
