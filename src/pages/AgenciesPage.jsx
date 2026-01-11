import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, CheckCircle, XCircle, Eye, Store, Mail, Phone, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { agenciesAPI, citiesAPI } from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import Table from '../components/Table';
import Badge from '../components/Badge';
import ConfirmDialog from '../components/ConfirmDialog';

const AgenciesPage = () => {
  const [agencies, setAgencies] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '', description: '', email: '', phone: '', website: '',
    address: '', cityId: '', licenseNumber: '', commissionRate: '15',
    adminUsername: '', adminPassword: ''
  });

  useEffect(() => {
    fetchCities();
  }, []);

  useEffect(() => {
    fetchAgencies();
  }, [pagination.page, search, filterCity]);

  const fetchCities = async () => {
    try {
      const response = await citiesAPI.getActive();
      setCities(response.data.data.cities);
    } catch (error) {
      toast.error('Failed to fetch cities');
    }
  };

  const fetchAgencies = async () => {
    try {
      setLoading(true);
      const response = await agenciesAPI.getAll({
        page: pagination.page, limit: pagination.limit, search,
        cityId: filterCity || undefined
      });
      setAgencies(response.data.data.agencies);
      setPagination(prev => ({ ...prev, ...response.data.data.pagination }));
    } catch (error) {
      toast.error('Failed to fetch agencies');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (agency = null) => {
    if (agency) {
      setSelectedAgency(agency);
      setFormData({
        name: agency.name, description: agency.description || '', email: agency.email,
        phone: agency.phone || '', website: agency.website || '', address: agency.address || '',
        cityId: agency.city_id || '', licenseNumber: agency.license_number || '',
        commissionRate: agency.commission_rate || '15', adminUsername: '', adminPassword: ''
      });
    } else {
      setSelectedAgency(null);
      setFormData({
        name: '', description: '', email: '', phone: '', website: '',
        address: '', cityId: '', licenseNumber: '', commissionRate: '15',
        adminUsername: '', adminPassword: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setSelectedAgency(null); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const data = { ...formData, commissionRate: parseFloat(formData.commissionRate) };

      // Don't send empty optional fields that have validation (UUID, URL)
      if (!data.cityId || data.cityId === '') {
        delete data.cityId;
      }
      if (!data.website || data.website.trim() === '') {
        delete data.website;
      }

      if (selectedAgency) {
        // Update - don't send admin credentials
        const { adminUsername, adminPassword, ...updateData } = data;
        console.log('📤 Updating agency:', selectedAgency.id);
        console.log('Update data:', JSON.stringify(updateData, null, 2));
        await agenciesAPI.update(selectedAgency.id, updateData);
        toast.success('Agency updated');
      } else {
        // Create - require admin credentials
        if (!formData.adminUsername || !formData.adminPassword) {
          toast.error('Admin username and password are required');
          return;
        }
        console.log('📤 Creating agency with data:', JSON.stringify(data, null, 2));
        await agenciesAPI.create(data);
        toast.success('Agency created with admin account');
      }
      handleCloseModal();
      fetchAgencies();
    } catch (error) {
      console.error('❌ Agency submission error:', error.response?.data);
      const errorMsg = error.response?.data?.message || 'Failed to save';
      const errors = error.response?.data?.errors;

      if (errors && errors.length > 0) {
        console.error('Validation errors:', errors);
        toast.error(`${errorMsg}: ${errors.map(e => `${e.field} - ${e.message}`).join(', ')}`);
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await agenciesAPI.delete(selectedAgency.id);
      toast.success('Agency deleted');
      setIsDeleteOpen(false);
      fetchAgencies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  const handleToggleVerified = async (agency) => {
    try {
      await agenciesAPI.toggleVerified(agency.id);
      toast.success(`Agency ${agency.is_verified ? 'unverified' : 'verified'}`);
      fetchAgencies();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const handleToggleActive = async (agency) => {
    try {
      await agenciesAPI.update(agency.id, { isActive: !agency.is_active });
      toast.success(`Agency ${agency.is_active ? 'deactivated' : 'activated'}`);
      fetchAgencies();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const columns = [
    {
      key: 'name', label: 'Agency',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center">
            <Store className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <div className="font-medium text-slate-900 flex items-center gap-2">
              {row.name}
              {row.is_verified && <CheckCircle className="w-4 h-4 text-green-500" />}
            </div>
            <div className="text-sm text-slate-500">{row.email}</div>
          </div>
        </div>
      )
    },
    { key: 'city_name', label: 'City', render: (row) => row.city_name || '-' },
    { key: 'admin_username', label: 'Admin', render: (row) => row.admin_username || '-' },
    { key: 'activities_count', label: 'Activities', render: (row) => row.activities_count || 0 },
    { key: 'reservations_count', label: 'Bookings', render: (row) => row.reservations_count || 0 },
    {
      key: 'status', label: 'Status',
      render: (row) => (
        <div className="flex flex-col gap-1">
          <Badge variant={row.is_active ? 'success' : 'danger'}>{row.is_active ? 'Active' : 'Inactive'}</Badge>
          <Badge variant={row.is_verified ? 'primary' : 'secondary'}>{row.is_verified ? 'Verified' : 'Unverified'}</Badge>
        </div>
      )
    },
    {
      key: 'actions', label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => { setSelectedAgency(row); setIsViewOpen(true); }} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="View"><Eye className="w-4 h-4" /></button>
          <button onClick={() => handleToggleVerified(row)} className={`p-1.5 rounded-lg ${row.is_verified ? 'text-green-500 bg-green-50' : 'text-slate-500 hover:text-green-500 hover:bg-green-50'}`} title="Toggle Verified"><CheckCircle className="w-4 h-4" /></button>
          <button onClick={() => handleOpenModal(row)} className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg" title="Edit"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => { setSelectedAgency(row); setIsDeleteOpen(true); }} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-slate-900">Agencies</h1>
          <p className="text-slate-500 mt-1">Manage partner agencies and their accounts</p>
        </div>
        <Button onClick={() => handleOpenModal()} icon={Plus}>Add Agency</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" placeholder="Search agencies..." value={search} onChange={(e) => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg" />
        </div>
        <select value={filterCity} onChange={(e) => { setFilterCity(e.target.value); setPagination(p => ({ ...p, page: 1 })); }} className="px-4 py-2 border border-slate-200 rounded-lg">
          <option value="">All Cities</option>
          {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <Table columns={columns} data={agencies} loading={loading} pagination={pagination} onPageChange={(page) => setPagination(prev => ({ ...prev, page }))} />

      {/* Create/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedAgency ? 'Edit Agency' : 'Add Agency'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <Input label="Agency Name *" value={formData.name} onChange={(e) => setFormData(p => ({ ...p, name: e.target.value }))} required />
          
          <Input label="Email *" type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} required />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Phone" value={formData.phone} onChange={(e) => setFormData(p => ({ ...p, phone: e.target.value }))} />
            <Input label="Website" value={formData.website} onChange={(e) => setFormData(p => ({ ...p, website: e.target.value }))} placeholder="https://..." />
          </div>

          <Select label="City" value={formData.cityId} onChange={(e) => setFormData(p => ({ ...p, cityId: e.target.value }))} options={[{ value: '', label: 'Select city' }, ...cities.map(c => ({ value: c.id, label: `${c.name} (${c.country_name})` }))]} />

          <Input label="Address" value={formData.address} onChange={(e) => setFormData(p => ({ ...p, address: e.target.value }))} />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="License Number" value={formData.licenseNumber} onChange={(e) => setFormData(p => ({ ...p, licenseNumber: e.target.value }))} />
            <Input label="Commission Rate (%)" type="number" step="0.01" min="0" max="100" value={formData.commissionRate} onChange={(e) => setFormData(p => ({ ...p, commissionRate: e.target.value }))} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
          </div>

          {!selectedAgency && (
            <div className="p-4 bg-blue-50 rounded-lg space-y-4">
              <h4 className="font-medium text-blue-900">Admin Account</h4>
              <p className="text-sm text-blue-700">Create an admin account for this agency to manage their reservations.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Admin Username *" value={formData.adminUsername} onChange={(e) => setFormData(p => ({ ...p, adminUsername: e.target.value }))} required={!selectedAgency} />
                <Input label="Admin Password *" type="password" value={formData.adminPassword} onChange={(e) => setFormData(p => ({ ...p, adminPassword: e.target.value }))} required={!selectedAgency} placeholder="Min 8 chars, uppercase, number, special" />
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" loading={saving}>{selectedAgency ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Agency Details" size="lg">
        {selectedAgency && (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl bg-primary-50 flex items-center justify-center">
                  <Store className="w-8 h-8 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold flex items-center gap-2">{selectedAgency.name} {selectedAgency.is_verified && <CheckCircle className="w-5 h-5 text-green-500" />}</h3>
                  <p className="text-slate-500">{selectedAgency.city_name || 'No city'}, {selectedAgency.country_name || ''}</p>
                </div>
              </div>
              <Badge variant={selectedAgency.is_active ? 'success' : 'danger'}>{selectedAgency.is_active ? 'Active' : 'Inactive'}</Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="text-center"><p className="text-2xl font-bold text-primary-600">{selectedAgency.activities_count || 0}</p><p className="text-xs text-slate-500">Activities</p></div>
              <div className="text-center"><p className="text-2xl font-bold text-green-600">{selectedAgency.reservations_count || 0}</p><p className="text-xs text-slate-500">Bookings</p></div>
              <div className="text-center"><p className="text-2xl font-bold text-amber-600">{selectedAgency.commission_rate}%</p><p className="text-xs text-slate-500">Commission</p></div>
              <div className="text-center"><p className="text-2xl font-bold text-blue-600">{selectedAgency.admin_username || '-'}</p><p className="text-xs text-slate-500">Admin</p></div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-600"><Mail className="w-4 h-4" /> {selectedAgency.email}</div>
              {selectedAgency.phone && <div className="flex items-center gap-2 text-slate-600"><Phone className="w-4 h-4" /> {selectedAgency.phone}</div>}
              {selectedAgency.website && <div className="flex items-center gap-2 text-slate-600"><Globe className="w-4 h-4" /> <a href={selectedAgency.website} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">{selectedAgency.website}</a></div>}
            </div>

            {selectedAgency.description && <div><h4 className="font-medium mb-1">Description</h4><p className="text-slate-600 text-sm">{selectedAgency.description}</p></div>}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="secondary" onClick={() => handleToggleActive(selectedAgency)}>{selectedAgency.is_active ? 'Deactivate' : 'Activate'}</Button>
              <Button onClick={() => { setIsViewOpen(false); handleOpenModal(selectedAgency); }}>Edit Agency</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete} title="Delete Agency" message={`Delete "${selectedAgency?.name}"? This will also delete the admin account. This cannot be undone.`} confirmText="Delete" variant="danger" />
    </div>
  );
};

export default AgenciesPage;
