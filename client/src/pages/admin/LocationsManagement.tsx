import { useEffect, useState } from 'react';
import {
  MapPin,
  Plus,
  Edit,
  Trash2,
  Loader2,
  X,
  Check,
  XCircle,
  Building2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { adminApi, type LocationInput } from '../../api/admin';
import type { Location } from '../../types/index';

export default function LocationsManagement() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterBuilding, setFilterBuilding] = useState<string>('');

  const [formData, setFormData] = useState<LocationInput>({
    building: '',
    floor: '',
    room: '',
    isActive: true,
  });

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const response = await adminApi.locations.getAll();
      if (response.success && response.data) {
        setLocations(response.data);
      }
    } catch (err) {
      console.error('Failed to fetch locations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const buildings = [...new Set(locations.map((l) => l.building))];

  const filteredLocations = filterBuilding
    ? locations.filter((l) => l.building === filterBuilding)
    : locations;

  const openCreateModal = () => {
    setEditingLocation(null);
    setFormData({
      building: '',
      floor: '',
      room: '',
      isActive: true,
    });
    setError(null);
    setShowModal(true);
  };

  const openEditModal = (location: Location) => {
    setEditingLocation(location);
    setFormData({
      building: location.building,
      floor: location.floor || '',
      room: location.room || '',
      isActive: location.isActive,
    });
    setError(null);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.building) {
      setError('กรุณากรอกชื่ออาคาร');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      if (editingLocation) {
        await adminApi.locations.update(editingLocation.id, formData);
      } else {
        await adminApi.locations.create(formData);
      }
      setShowModal(false);
      fetchLocations();
    } catch (err) {
      console.error('Failed to save location:', err);
      setError('ไม่สามารถบันทึกสถานที่ได้');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleActive = async (location: Location) => {
    try {
      await adminApi.locations.update(location.id, { isActive: !location.isActive });
      fetchLocations();
    } catch (err) {
      console.error('Failed to toggle location status:', err);
    }
  };

  const handleDelete = async (location: Location) => {
    const locationName = [location.building, location.floor, location.room]
      .filter(Boolean)
      .join(' - ');
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบสถานที่ "${locationName}"?`)) return;

    try {
      await adminApi.locations.delete(location.id);
      fetchLocations();
    } catch (err) {
      console.error('Failed to delete location:', err);
      alert('ไม่สามารถลบสถานที่ได้ อาจมีการใช้งานอยู่');
    }
  };

  const formatLocation = (location: Location) => {
    const parts = [location.floor && `ชั้น ${location.floor}`, location.room && `ห้อง ${location.room}`];
    return parts.filter(Boolean).join(' ');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-6 h-6" />
            จัดการสถานที่
          </h1>
          <p className="text-gray-600">จัดการอาคารและห้องในระบบ</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="w-4 h-4 mr-2" />
          เพิ่มสถานที่
        </Button>
      </div>

      {/* Filter */}
      {buildings.length > 1 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">กรองตามอาคาร:</label>
              <select
                className="border border-gray-300 rounded-lg px-3 py-2"
                value={filterBuilding}
                onChange={(e) => setFilterBuilding(e.target.value)}
              >
                <option value="">ทั้งหมด</option>
                {buildings.map((building) => (
                  <option key={building} value={building}>
                    {building}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Locations Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
          ) : filteredLocations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              ยังไม่มีสถานที่
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">อาคาร</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">ชั้น/ห้อง</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">สถานะ</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredLocations.map((location) => (
                    <tr key={location.id} className={`hover:bg-gray-50 ${!location.isActive ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Building2 className="w-4 h-4 text-primary-600" />
                          </div>
                          <span className="font-medium">{location.building}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatLocation(location) || '-'}
                      </td>
                      <td className="px-4 py-3">
                        {location.isActive ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <Check className="w-4 h-4" /> ใช้งาน
                          </span>
                        ) : (
                          <span className="text-gray-400 flex items-center gap-1">
                            <XCircle className="w-4 h-4" /> ปิดใช้งาน
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditModal(location)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleActive(location)}
                          >
                            {location.isActive ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => handleDelete(location)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary by Building */}
      {buildings.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {buildings.map((building) => {
            const count = locations.filter((l) => l.building === building && l.isActive).length;
            return (
              <Card key={building}>
                <CardContent className="p-4 text-center">
                  <Building2 className="w-8 h-8 mx-auto mb-2 text-primary-500" />
                  <p className="font-medium">{building}</p>
                  <p className="text-sm text-gray-500">{count} สถานที่</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{editingLocation ? 'แก้ไขสถานที่' : 'เพิ่มสถานที่ใหม่'}</CardTitle>
              <button onClick={() => setShowModal(false)} className="p-1 hover:bg-gray-100 rounded">
                <X className="w-5 h-5" />
              </button>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Input
                label="ชื่ออาคาร"
                value={formData.building}
                onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                placeholder="อาคาร A"
              />

              <Input
                label="ชั้น (ไม่บังคับ)"
                value={formData.floor || ''}
                onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                placeholder="1"
              />

              <Input
                label="ห้อง (ไม่บังคับ)"
                value={formData.room || ''}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="101"
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  เปิดใช้งาน
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>
                  ยกเลิก
                </Button>
                <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'บันทึก'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
