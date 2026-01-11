import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Globe, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { countriesAPI, uploadAPI } from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Table from '../components/Table';
import Badge from '../components/Badge';
import ConfirmDialog from '../components/ConfirmDialog';

const CountriesPage = () => {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '', imageUrl: '', sortOrder: 0 });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCountries();
  }, [pagination.page, search]);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      const response = await countriesAPI.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search
      });
      setCountries(response.data.data.countries);
      setPagination(prev => ({ ...prev, ...response.data.data.pagination }));
    } catch (error) {
      toast.error('Failed to fetch countries');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (country = null) => {
    if (country) {
      setSelectedCountry(country);
      setFormData({
        name: country.name,
        code: country.code,
        imageUrl: country.image_url || '',
        sortOrder: country.sort_order || 0
      });
    } else {
      setSelectedCountry(null);
      setFormData({ name: '', code: '', imageUrl: '', sortOrder: 0 });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCountry(null);
    setFormData({ name: '', code: '', imageUrl: '', sortOrder: 0 });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const response = await uploadAPI.uploadSingle('countries', file);
      setFormData(prev => ({ ...prev, imageUrl: response.data.data.url }));
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      if (selectedCountry) {
        await countriesAPI.update(selectedCountry.id, formData);
        toast.success('Country updated successfully');
      } else {
        await countriesAPI.create(formData);
        toast.success('Country created successfully');
      }
      handleCloseModal();
      fetchCountries();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save country');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await countriesAPI.delete(selectedCountry.id);
      toast.success('Country deleted successfully');
      setIsDeleteOpen(false);
      setSelectedCountry(null);
      fetchCountries();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete country');
    }
  };

  const handleToggleActive = async (country) => {
    try {
      await countriesAPI.update(country.id, { isActive: !country.is_active });
      toast.success(`Country ${country.is_active ? 'deactivated' : 'activated'}`);
      fetchCountries();
    } catch (error) {
      toast.error('Failed to update country status');
    }
  };

  const columns = [
    {
      key: 'image',
      label: 'Image',
      render: (row) => (
        <div className="w-16 h-12 rounded-lg overflow-hidden bg-slate-100">
          {row.image_url ? (
            <img src={row.image_url} alt={row.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Globe className="w-6 h-6 text-slate-400" />
            </div>
          )}
        </div>
      )
    },
    { key: 'name', label: 'Name' },
    { 
      key: 'code', 
      label: 'Code',
      render: (row) => <Badge variant="secondary">{row.code}</Badge>
    },
    { 
      key: 'cities_count', 
      label: 'Cities',
      render: (row) => (
        <span className="flex items-center gap-1 text-slate-600">
          <MapPin className="w-4 h-4" />
          {row.cities_count || 0}
        </span>
      )
    },
    { key: 'sort_order', label: 'Order' },
    {
      key: 'is_active',
      label: 'Status',
      render: (row) => (
        <Badge variant={row.is_active ? 'success' : 'danger'}>
          {row.is_active ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleToggleActive(row)}
            className={`px-2 py-1 text-xs rounded ${
              row.is_active 
                ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {row.is_active ? 'Deactivate' : 'Activate'}
          </button>
          <button
            onClick={() => handleOpenModal(row)}
            className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setSelectedCountry(row); setIsDeleteOpen(true); }}
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-slate-900">Countries</h1>
          <p className="text-slate-500 mt-1">Manage countries where activities are available</p>
        </div>
        <Button onClick={() => handleOpenModal()} icon={Plus}>
          Add Country
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search countries..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={countries}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedCountry ? 'Edit Country' : 'Add Country'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Country Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            placeholder="e.g., Morocco"
          />
          
          <Input
            label="Country Code"
            value={formData.code}
            onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
            required
            placeholder="e.g., MA"
            maxLength={10}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Cover Image
            </label>
            <div className="flex items-center gap-4">
              {formData.imageUrl && (
                <img 
                  src={formData.imageUrl} 
                  alt="Preview" 
                  className="w-20 h-14 object-cover rounded-lg"
                />
              )}
              <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium text-slate-700">
                {uploading ? 'Uploading...' : 'Upload Image'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          <Input
            label="Sort Order"
            type="number"
            value={formData.sortOrder}
            onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))}
            min={0}
          />

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {selectedCountry ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Country"
        message={`Are you sure you want to delete "${selectedCountry?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default CountriesPage;
