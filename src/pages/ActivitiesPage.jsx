import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Star, Eye, Clock, Users, DollarSign, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { activitiesAPI, citiesAPI, categoriesAPI, uploadAPI } from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import Table from '../components/Table';
import Badge from '../components/Badge';
import ConfirmDialog from '../components/ConfirmDialog';

const ActivitiesPage = () => {
  const [activities, setActivities] = useState([]);
  const [cities, setCities] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '', description: '', shortDescription: '', cityId: '', categoryId: '',
    basePrice: '', pricingModel: 'commission', platformFeeValue: '10', commissionRate: '10', durationMinutes: '', maxParticipants: '', minParticipants: '1',
    meetingPoint: '', benefits: [], includedItems: [], excludedItems: [], requirements: [],
    cancellationPolicy: '', mainImageUrl: '', isFeatured: false
  });

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [pagination.page, search, filterCity, filterCategory]);

  const fetchFilters = async () => {
    try {
      const [citiesRes, catsRes] = await Promise.all([citiesAPI.getActive(), categoriesAPI.getActive()]);
      setCities(citiesRes.data.data.cities);
      setCategories(catsRes.data.data.categories);
    } catch (error) {
      toast.error('Failed to fetch filters');
    }
  };

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await activitiesAPI.getAll({
        page: pagination.page, limit: pagination.limit, search,
        cityId: filterCity || undefined, categoryId: filterCategory || undefined
      });
      setActivities(response.data.data.activities);
      setPagination(prev => ({ ...prev, ...response.data.data.pagination }));
    } catch (error) {
      toast.error('Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (activity = null) => {
    if (activity) {
      setSelectedActivity(activity);
      setFormData({
        title: activity.title, description: activity.description || '',
        shortDescription: activity.short_description || '', cityId: activity.city_id,
        categoryId: activity.category_id || '', basePrice: activity.base_price,
        pricingModel: activity.pricing_model || 'commission',
        platformFeeValue: activity.platform_fee_value || activity.commission_rate || '10',
        commissionRate: activity.commission_rate || '10', durationMinutes: activity.duration_minutes || '',
        maxParticipants: activity.max_participants || '', minParticipants: activity.min_participants || '1',
        meetingPoint: activity.meeting_point || '',
        benefits: activity.benefits || [], includedItems: activity.included_items || [],
        excludedItems: activity.excluded_items || [], requirements: activity.requirements || [],
        cancellationPolicy: activity.cancellation_policy || '', mainImageUrl: activity.main_image_url || '',
        isFeatured: activity.is_featured
      });
    } else {
      setSelectedActivity(null);
      setFormData({
        title: '', description: '', shortDescription: '', cityId: '', categoryId: '',
        basePrice: '', pricingModel: 'commission', platformFeeValue: '10', commissionRate: '10', durationMinutes: '', maxParticipants: '', minParticipants: '1',
        meetingPoint: '', benefits: [], includedItems: [], excludedItems: [], requirements: [],
        cancellationPolicy: '', mainImageUrl: '', isFeatured: false
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => { setIsModalOpen(false); setSelectedActivity(null); };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(true);
      const response = await uploadAPI.uploadSingle('activities', file);
      setFormData(prev => ({ ...prev, mainImageUrl: response.data.data.url }));
      toast.success('Image uploaded');
    } catch (error) {
      toast.error('Failed to upload');
    } finally {
      setUploading(false);
    }
  };

  const handleArrayField = (field, value) => {
    const items = value.split('\n').map(s => s.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, [field]: items }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const data = {
        ...formData,
        basePrice: parseFloat(formData.basePrice),
        platformFeeValue: parseFloat(formData.platformFeeValue),
        commissionRate: parseFloat(formData.commissionRate)
      };
      if (formData.durationMinutes) data.durationMinutes = parseInt(formData.durationMinutes);
      if (formData.maxParticipants) data.maxParticipants = parseInt(formData.maxParticipants);
      data.minParticipants = parseInt(formData.minParticipants) || 1;

      // Don't send categoryId if it's empty (backend validator requires UUID or nothing)
      if (!formData.categoryId || formData.categoryId === '') {
        delete data.categoryId;
      }

      console.log('📤 Submitting activity data:', JSON.stringify(data, null, 2));

      if (selectedActivity) {
        await activitiesAPI.update(selectedActivity.id, data);
        toast.success('Activity updated');
      } else {
        await activitiesAPI.create(data);
        toast.success('Activity created');
      }
      handleCloseModal();
      fetchActivities();
    } catch (error) {
      console.error('❌ Activity submission error:', error.response?.data);
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
      await activitiesAPI.delete(selectedActivity.id);
      toast.success('Activity deleted');
      setIsDeleteOpen(false);
      fetchActivities();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete');
    }
  };

  const handleToggleFeatured = async (activity) => {
    try {
      await activitiesAPI.toggleFeatured(activity.id);
      toast.success(`Activity ${activity.is_featured ? 'removed from' : 'marked as'} featured`);
      fetchActivities();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const handleToggleActive = async (activity) => {
    try {
      await activitiesAPI.update(activity.id, { isActive: !activity.is_active });
      toast.success(`Activity ${activity.is_active ? 'deactivated' : 'activated'}`);
      fetchActivities();
    } catch (error) {
      toast.error('Failed to update');
    }
  };

  const columns = [
    {
      key: 'image', label: 'Image',
      render: (row) => (
        <div className="w-20 h-14 rounded-lg overflow-hidden bg-slate-100">
          {row.main_image_url ? <img src={row.main_image_url} alt={row.title} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-400">No image</div>}
        </div>
      )
    },
    {
      key: 'title', label: 'Activity',
      render: (row) => (
        <div>
          <div className="font-medium text-slate-900 flex items-center gap-2">
            {row.title}
            {row.is_featured && <Star className="w-4 h-4 text-amber-500 fill-amber-500" />}
          </div>
          <div className="text-sm text-slate-500">{row.city_name}, {row.country_name}</div>
        </div>
      )
    },
    { key: 'category_name', label: 'Category', render: (row) => row.category_name || '-' },
    {
      key: 'base_price', label: 'Price',
      render: (row) => <span className="font-medium">${parseFloat(row.base_price).toFixed(2)}</span>
    },
    {
      key: 'duration', label: 'Duration',
      render: (row) => row.duration_minutes ? `${Math.floor(row.duration_minutes / 60)}h ${row.duration_minutes % 60}m` : '-'
    },
    { key: 'agencies_count', label: 'Agencies', render: (row) => row.agencies_count || 0 },
    {
      key: 'is_active', label: 'Status',
      render: (row) => <Badge variant={row.is_active ? 'success' : 'danger'}>{row.is_active ? 'Active' : 'Inactive'}</Badge>
    },
    {
      key: 'actions', label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => { setSelectedActivity(row); setIsViewOpen(true); }} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="View"><Eye className="w-4 h-4" /></button>
          <button onClick={() => handleToggleFeatured(row)} className={`p-1.5 rounded-lg ${row.is_featured ? 'text-amber-500 bg-amber-50' : 'text-slate-500 hover:text-amber-500 hover:bg-amber-50'}`} title="Toggle Featured"><Star className="w-4 h-4" /></button>
          <button onClick={() => handleOpenModal(row)} className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg" title="Edit"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => { setSelectedActivity(row); setIsDeleteOpen(true); }} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Delete"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-slate-900">Activities</h1>
          <p className="text-slate-500 mt-1">Manage activities available for booking</p>
        </div>
        <Button onClick={() => handleOpenModal()} icon={Plus}>Add Activity</Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" placeholder="Search activities..." value={search} onChange={(e) => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg" />
        </div>
        <select value={filterCity} onChange={(e) => { setFilterCity(e.target.value); setPagination(p => ({ ...p, page: 1 })); }} className="px-4 py-2 border border-slate-200 rounded-lg">
          <option value="">All Cities</option>
          {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPagination(p => ({ ...p, page: 1 })); }} className="px-4 py-2 border border-slate-200 rounded-lg">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      <Table columns={columns} data={activities} loading={loading} pagination={pagination} onPageChange={(page) => setPagination(prev => ({ ...prev, page }))} />

      {/* Create/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedActivity ? 'Edit Activity' : 'Add Activity'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Title *" value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} required />
            <Select label="City *" value={formData.cityId} onChange={(e) => setFormData(p => ({ ...p, cityId: e.target.value }))} required options={[{ value: '', label: 'Select city' }, ...cities.map(c => ({ value: c.id, label: `${c.name} (${c.country_name})` }))]} />
          </div>
          
          <Select label="Category" value={formData.categoryId} onChange={(e) => setFormData(p => ({ ...p, categoryId: e.target.value }))} options={[{ value: '', label: 'Select category' }, ...categories.map(c => ({ value: c.id, label: c.name }))]} />
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Short Description</label>
            <textarea value={formData.shortDescription} onChange={(e) => setFormData(p => ({ ...p, shortDescription: e.target.value }))} rows={2} className="w-full px-4 py-2 border border-slate-200 rounded-lg" maxLength={500} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} rows={4} className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
          </div>

          {/* Pricing Section */}
          <div className="border border-slate-200 rounded-lg p-4 bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Pricing Configuration</h3>

            {/* Pricing Model Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Pricing Model</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pricingModel"
                    value="commission"
                    checked={formData.pricingModel === 'commission'}
                    onChange={(e) => setFormData(p => ({ ...p, pricingModel: e.target.value }))}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="text-sm text-slate-700">Commission % (added on top)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="pricingModel"
                    value="fixed_markup"
                    checked={formData.pricingModel === 'fixed_markup'}
                    onChange={(e) => setFormData(p => ({ ...p, pricingModel: e.target.value }))}
                    className="w-4 h-4 text-primary-600"
                  />
                  <span className="text-sm text-slate-700">Fixed Markup $ (added on top)</span>
                </label>
              </div>
            </div>

            {/* Pricing Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  label="Agency Base Price ($) *"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.basePrice}
                  onChange={(e) => setFormData(p => ({ ...p, basePrice: e.target.value }))}
                  required
                  placeholder="100.00"
                />
                <p className="text-xs text-slate-500 mt-1">What agency receives per person</p>
              </div>

              <div>
                <Input
                  label={formData.pricingModel === 'commission' ? 'Platform Commission (%)' : 'Platform Markup ($)'}
                  type="number"
                  step={formData.pricingModel === 'commission' ? '0.01' : '0.01'}
                  min="0"
                  max={formData.pricingModel === 'commission' ? '100' : undefined}
                  value={formData.platformFeeValue}
                  onChange={(e) => setFormData(p => ({ ...p, platformFeeValue: e.target.value }))}
                  placeholder={formData.pricingModel === 'commission' ? '10' : '50.00'}
                />
                <p className="text-xs text-slate-500 mt-1">
                  {formData.pricingModel === 'commission' ? 'Percentage added to base' : 'Fixed amount added to base'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Customer Pays (per person)</label>
                <div className="w-full px-4 py-2 border border-primary-200 bg-primary-50 rounded-lg text-primary-900 font-semibold">
                  ${(() => {
                    const base = parseFloat(formData.basePrice) || 0;
                    const fee = parseFloat(formData.platformFeeValue) || 0;
                    if (formData.pricingModel === 'commission') {
                      return (base + (base * fee / 100)).toFixed(2);
                    } else {
                      return (base + fee).toFixed(2);
                    }
                  })()}
                </div>
                <p className="text-xs text-slate-500 mt-1">Final price shown to customers</p>
              </div>
            </div>

            {/* Breakdown Example */}
            {formData.basePrice && (
              <div className="mt-3 p-3 bg-white rounded border border-slate-200">
                <p className="text-xs font-medium text-slate-700 mb-2">Pricing Breakdown:</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">Agency gets:</span>
                    <span className="ml-2 font-semibold text-green-600">${parseFloat(formData.basePrice || 0).toFixed(2)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Platform gets:</span>
                    <span className="ml-2 font-semibold text-blue-600">
                      ${(() => {
                        const base = parseFloat(formData.basePrice) || 0;
                        const fee = parseFloat(formData.platformFeeValue) || 0;
                        if (formData.pricingModel === 'commission') {
                          return (base * fee / 100).toFixed(2);
                        } else {
                          return fee.toFixed(2);
                        }
                      })()}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Customer pays:</span>
                    <span className="ml-2 font-semibold text-slate-900">
                      ${(() => {
                        const base = parseFloat(formData.basePrice) || 0;
                        const fee = parseFloat(formData.platformFeeValue) || 0;
                        if (formData.pricingModel === 'commission') {
                          return (base + (base * fee / 100)).toFixed(2);
                        } else {
                          return (base + fee).toFixed(2);
                        }
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
            <Input label="Duration (min)" type="number" min="1" value={formData.durationMinutes} onChange={(e) => setFormData(p => ({ ...p, durationMinutes: e.target.value }))} />
            <Input label="Max Participants" type="number" min="1" value={formData.maxParticipants} onChange={(e) => setFormData(p => ({ ...p, maxParticipants: e.target.value }))} />
          </div>

          <Input label="Meeting Point" value={formData.meetingPoint} onChange={(e) => setFormData(p => ({ ...p, meetingPoint: e.target.value }))} placeholder="Where participants should meet" />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Benefits (one per line)</label>
            <textarea value={formData.benefits.join('\n')} onChange={(e) => handleArrayField('benefits', e.target.value)} rows={3} className="w-full px-4 py-2 border border-slate-200 rounded-lg" placeholder="Professional guide&#10;Small group sizes&#10;Hotel pickup" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">What's Included (one per line)</label>
              <textarea value={formData.includedItems.join('\n')} onChange={(e) => handleArrayField('includedItems', e.target.value)} rows={3} className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">What's Excluded (one per line)</label>
              <textarea value={formData.excludedItems.join('\n')} onChange={(e) => handleArrayField('excludedItems', e.target.value)} rows={3} className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Requirements (one per line)</label>
            <textarea value={formData.requirements.join('\n')} onChange={(e) => handleArrayField('requirements', e.target.value)} rows={2} className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Cancellation Policy</label>
            <textarea value={formData.cancellationPolicy} onChange={(e) => setFormData(p => ({ ...p, cancellationPolicy: e.target.value }))} rows={2} className="w-full px-4 py-2 border border-slate-200 rounded-lg" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Main Image</label>
            <div className="flex items-center gap-4">
              {formData.mainImageUrl && <img src={formData.mainImageUrl} alt="Preview" className="w-24 h-16 object-cover rounded-lg" />}
              <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-medium">
                {uploading ? 'Uploading...' : 'Upload Image'}
                <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploading} />
              </label>
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input type="checkbox" checked={formData.isFeatured} onChange={(e) => setFormData(p => ({ ...p, isFeatured: e.target.checked }))} className="rounded" />
            <span className="text-sm font-medium text-slate-700">Featured Activity</span>
          </label>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button type="submit" loading={saving}>{selectedActivity ? 'Update' : 'Create'}</Button>
          </div>
        </form>
      </Modal>

      {/* View Modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Activity Details" size="lg">
        {selectedActivity && (
          <div className="space-y-4">
            {selectedActivity.main_image_url && <img src={selectedActivity.main_image_url} alt={selectedActivity.title} className="w-full h-48 object-cover rounded-lg" />}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">{selectedActivity.title} {selectedActivity.is_featured && <Star className="w-5 h-5 text-amber-500 fill-amber-500" />}</h3>
                <p className="text-slate-500 flex items-center gap-1 mt-1"><MapPin className="w-4 h-4" /> {selectedActivity.city_name}, {selectedActivity.country_name}</p>
              </div>
              <Badge variant={selectedActivity.is_active ? 'success' : 'danger'}>{selectedActivity.is_active ? 'Active' : 'Inactive'}</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="text-center"><DollarSign className="w-5 h-5 mx-auto text-green-600" /><p className="font-semibold">${parseFloat(selectedActivity.base_price).toFixed(2)}</p><p className="text-xs text-slate-500">Price</p></div>
              <div className="text-center"><Clock className="w-5 h-5 mx-auto text-blue-600" /><p className="font-semibold">{selectedActivity.duration_minutes ? `${Math.floor(selectedActivity.duration_minutes / 60)}h ${selectedActivity.duration_minutes % 60}m` : '-'}</p><p className="text-xs text-slate-500">Duration</p></div>
              <div className="text-center"><Users className="w-5 h-5 mx-auto text-purple-600" /><p className="font-semibold">{selectedActivity.max_participants || '∞'}</p><p className="text-xs text-slate-500">Max People</p></div>
              <div className="text-center"><span className="text-lg">%</span><p className="font-semibold">{selectedActivity.commission_rate}%</p><p className="text-xs text-slate-500">Commission</p></div>
            </div>
            {selectedActivity.description && <div><h4 className="font-medium mb-1">Description</h4><p className="text-slate-600 text-sm">{selectedActivity.description}</p></div>}
            {selectedActivity.meeting_point && <div><h4 className="font-medium mb-1">Meeting Point</h4><p className="text-slate-600 text-sm">{selectedActivity.meeting_point}</p></div>}
            <div className="flex justify-end pt-4"><Button onClick={() => setIsViewOpen(false)}>Close</Button></div>
          </div>
        )}
      </Modal>

      <ConfirmDialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete} title="Delete Activity" message={`Delete "${selectedActivity?.title}"? This cannot be undone.`} confirmText="Delete" variant="danger" />
    </div>
  );
};

export default ActivitiesPage;
