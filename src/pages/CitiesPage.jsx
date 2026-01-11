import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Building2, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { citiesAPI, countriesAPI, uploadAPI } from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import Table from '../components/Table';
import Badge from '../components/Badge';
import ConfirmDialog from '../components/ConfirmDialog';

const CitiesPage = () => {
  const [cities, setCities] = useState([]);
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCountry, setFilterCountry] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    countryId: '', 
    description: '',
    imageUrl: '', 
    sortOrder: 0 
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCountries();
  }, []);

  useEffect(() => {
    fetchCities();
  }, [pagination.page, search, filterCountry]);

  const fetchCountries = async () => {
    try {
      const response = await countriesAPI.getActive();
      setCountries(response.data.data.countries);
    } catch (error) {
      toast.error('Failed to fetch countries');
    }
  };

  const fetchCities = async () => {
    try {
      setLoading(true);
      const response = await citiesAPI.getAll({
        page: pagination.page,
        limit: pagination.limit,
        search,
        countryId: filterCountry || undefined
      });
      setCities(response.data.data.cities);
      setPagination(prev => ({ ...prev, ...response.data.data.pagination }));
    } catch (error) {
      toast.error('Failed to fetch cities');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (city = null) => {
    if (city) {
      setSelectedCity(city);
      setFormData({
        name: city.name,
        countryId: city.country_id,
        description: city.description || '',
        imageUrl: city.image_url || '',
        sortOrder: city.sort_order || 0
      });
    } else {
      setSelectedCity(null);
      setFormData({ name: '', countryId: '', description: '', imageUrl: '', sortOrder: 0 });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCity(null);
    setFormData({ name: '', countryId: '', description: '', imageUrl: '', sortOrder: 0 });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const response = await uploadAPI.uploadSingle('cities', file);
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
      if (selectedCity) {
        await citiesAPI.update(selectedCity.id, formData);
        toast.success('City updated successfully');
      } else {
        await citiesAPI.create(formData);
        toast.success('City created successfully');
      }
      handleCloseModal();
      fetchCities();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save city');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await citiesAPI.delete(selectedCity.id);
      toast.success('City deleted successfully');
      setIsDeleteOpen(false);
      setSelectedCity(null);
      fetchCities();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete city');
    }
  };

  const handleToggleActive = async (city) => {
    try {
      await citiesAPI.update(city.id, { isActive: !city.is_active });
      toast.success(`City ${city.is_active ? 'deactivated' : 'activated'}`);
      fetchCities();
    } catch (error) {
      toast.error('Failed to update city status');
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
              <Building2 className="w-6 h-6 text-slate-400" />
            </div>
          )}
        </div>
      )
    },
    { key: 'name', label: 'City Name' },
    { 
      key: 'country_name', 
      label: 'Country',
      render: (row) => (
        <span className="flex items-center gap-1">
          <MapPin className="w-4 h-4 text-slate-400" />
          {row.country_name}
        </span>
      )
    },
    { 
      key: 'activities_count', 
      label: 'Activities',
      render: (row) => row.activities_count || 0
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
            onClick={() => { setSelectedCity(row); setIsDeleteOpen(true); }}
            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const countryOptions = [
    { value: '', label: 'All Countries' },
    ...countries.map(c => ({ value: c.id, label: c.name }))
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-slate-900">Cities</h1>
          <p className="text-slate-500 mt-1">Manage cities where activities are available</p>
        </div>
        <Button onClick={() => handleOpenModal()} icon={Plus}>
          Add City
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search cities..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={filterCountry}
          onChange={(e) => { setFilterCountry(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
          className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          {countryOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={cities}
        loading={loading}
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
      />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedCity ? 'Edit City' : 'Add City'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="City Name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            placeholder="e.g., Marrakech"
          />
          
          <Select
            label="Country"
            value={formData.countryId}
            onChange={(e) => setFormData(prev => ({ ...prev, countryId: e.target.value }))}
            required
            options={[
              { value: '', label: 'Select a country' },
              ...countries.map(c => ({ value: c.id, label: c.name }))
            ]}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Brief description of the city..."
            />
          </div>

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
              {selectedCity ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete City"
        message={`Are you sure you want to delete "${selectedCity?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default CitiesPage;
