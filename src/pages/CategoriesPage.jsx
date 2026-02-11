import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Search, Tags } from 'lucide-react';
import toast from 'react-hot-toast';
import { categoriesAPI } from '../services/api';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Table from '../components/Table';
import Badge from '../components/Badge';
import ConfirmDialog from '../components/ConfirmDialog';

const ICON_OPTIONS = [
  'Compass', 'Landmark', 'ChefHat', 'Waves', 'Mountain', 
  'Sparkles', 'Car', 'Camera', 'Tent', 'Bike', 'Plane',
  'Ship', 'TreePine', 'Sun', 'Moon', 'Star', 'Heart'
];

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', icon: '', description: '', sortOrder: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, [pagination.page, search]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesAPI.getAll({ page: pagination.page, limit: pagination.limit, search });
      setCategories(response.data.data.categories);
      setPagination(prev => ({ ...prev, ...response.data.data.pagination }));
    } catch (error) {
      toast.error('Échec de récupération des catégories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setSelectedCategory(category);
      setFormData({ name: category.name, icon: category.icon || '', description: category.description || '', sortOrder: category.sort_order || 0 });
    } else {
      setSelectedCategory(null);
      setFormData({ name: '', icon: '', description: '', sortOrder: 0 });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategory(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      if (selectedCategory) {
        await categoriesAPI.update(selectedCategory.id, formData);
        toast.success('Catégorie mise à jour');
      } else {
        await categoriesAPI.create(formData);
        toast.success('Catégorie créée');
      }
      handleCloseModal();
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Échec de sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await categoriesAPI.delete(selectedCategory.id);
      toast.success('Catégorie supprimée');
      setIsDeleteOpen(false);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Échec de suppression');
    }
  };

  const handleToggleActive = async (category) => {
    try {
      await categoriesAPI.update(category.id, { isActive: !category.is_active });
      toast.success(`Catégorie ${category.is_active ? 'désactivée' : 'activée'}`);
      fetchCategories();
    } catch (error) {
      toast.error('Échec de mise à jour du statut');
    }
  };

  const columns = [
    { key: 'name', label: 'Nom' },
    { key: 'icon', label: 'Icône', render: (row) => <code className="px-2 py-1 bg-slate-100 rounded text-sm">{row.icon || '-'}</code> },
    { key: 'description', label: 'Description', render: (row) => <span className="text-slate-600 truncate max-w-xs block">{row.description || '-'}</span> },
    { key: 'activities_count', label: 'Activités', render: (row) => row.activities_count || 0 },
    { key: 'sort_order', label: 'Ordre' },
    { key: 'is_active', label: 'Statut', render: (row) => <Badge variant={row.is_active ? 'success' : 'danger'}>{row.is_active ? 'Active' : 'Inactive'}</Badge> },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => handleToggleActive(row)} className={`px-2 py-1 text-xs rounded ${row.is_active ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
            {row.is_active ? 'Désactiver' : 'Activer'}
          </button>
          <button onClick={() => handleOpenModal(row)} className="p-1.5 text-slate-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => { setSelectedCategory(row); setIsDeleteOpen(true); }} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-slate-900">Catégories d'Activités</h1>
          <p className="text-slate-500 mt-1">Gérer les catégories pour organiser les activités</p>
        </div>
        <Button onClick={() => handleOpenModal()} icon={Plus}>Ajouter Catégorie</Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher des catégories..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }}
          className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      <Table columns={columns} data={categories} loading={loading} pagination={pagination} onPageChange={(page) => setPagination(prev => ({ ...prev, page }))} />

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={selectedCategory ? 'Modifier la Catégorie' : 'Ajouter une Catégorie'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nom de la Catégorie" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} required placeholder="ex. Aventures Désert" />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom de l'Icône</label>
            <select value={formData.icon} onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))} className="w-full px-4 py-2 border border-slate-200 rounded-lg">
              <option value="">Sélectionner une icône</option>
              {ICON_OPTIONS.map(icon => <option key={icon} value={icon}>{icon}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} rows={3} className="w-full px-4 py-2 border border-slate-200 rounded-lg" placeholder="Brève description..." />
          </div>
          <Input label="Ordre de Tri" type="number" value={formData.sortOrder} onChange={(e) => setFormData(prev => ({ ...prev, sortOrder: parseInt(e.target.value) || 0 }))} min={0} />
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={handleCloseModal}>Annuler</Button>
            <Button type="submit" loading={saving}>{selectedCategory ? 'Mettre à Jour' : 'Créer'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={isDeleteOpen} onClose={() => setIsDeleteOpen(false)} onConfirm={handleDelete} title="Supprimer la Catégorie" message={`Supprimer "${selectedCategory?.name}"? Cette action est irréversible.`} confirmText="Supprimer" variant="danger" />
    </div>
  );
};

export default CategoriesPage;
