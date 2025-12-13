import { MaintenanceRequest, CreateRequestDTO, UpdateRequestDTO, Status } from '../types';
import { StorageService } from './storageService';
import * as fs from 'fs';
import * as path from 'path';

const DATA_DIR = path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'requests.json');

export class LocalStorageAdapter implements StorageService {
  constructor() {
    // Ensure data directory exists
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    // Initialize file if it doesn't exist
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
    }
  }

  private getStorage(): MaintenanceRequest[] {
    try {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      if (!data || data.trim() === '') {
        return [];
      }

      const requests = JSON.parse(data);
      // Convert date strings back to Date objects
      return requests.map((req: any) => ({
        ...req,
        createdAt: new Date(req.createdAt),
        updatedAt: new Date(req.updatedAt),
        completedAt: req.completedAt ? new Date(req.completedAt) : undefined,
      }));
    } catch (error) {
      console.error('Error reading data file:', error);
      return [];
    }
  }

  private saveStorage(requests: MaintenanceRequest[]): void {
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(requests, null, 2));
    } catch (error) {
      console.error('Error writing data file:', error);
    }
  }

  private generateId(): string {
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `MR-${date}-${random}`;
  }

  async getRequests(): Promise<MaintenanceRequest[]> {
    return this.getStorage();
  }

  async getRequestById(id: string): Promise<MaintenanceRequest | null> {
    const requests = this.getStorage();
    return requests.find(req => req.id === id) || null;
  }

  async createRequest(data: CreateRequestDTO): Promise<MaintenanceRequest> {
    const requests = this.getStorage();

    const newRequest: MaintenanceRequest = {
      id: this.generateId(),
      ...data,
      status: 'pending' as Status,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    requests.push(newRequest);
    this.saveStorage(requests);

    return newRequest;
  }

  async updateRequest(id: string, data: UpdateRequestDTO): Promise<MaintenanceRequest> {
    const requests = this.getStorage();
    const index = requests.findIndex(req => req.id === id);

    if (index === -1) {
      throw new Error('Request not found');
    }

    const updatedRequest: MaintenanceRequest = {
      ...requests[index],
      ...data,
      updatedAt: new Date(),
    };

    // Set completedAt if status changed to completed
    if (data.status === 'completed' && !requests[index].completedAt) {
      updatedRequest.completedAt = new Date();
    }

    requests[index] = updatedRequest;
    this.saveStorage(requests);

    return updatedRequest;
  }

  async deleteRequest(id: string): Promise<void> {
    const requests = this.getStorage();
    const filtered = requests.filter(req => req.id !== id);
    this.saveStorage(filtered);
  }
}

export const localStorageAdapter = new LocalStorageAdapter();
