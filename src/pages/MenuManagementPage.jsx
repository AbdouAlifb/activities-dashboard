import React, { useState, useEffect } from 'react';
import { menusAPI, rolesAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Table from '../components/Table';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import ConfirmDialog from '../components/ConfirmDialog';
import Card from '../components/Card';
import { Plus, Edit2, Trash2, Menu, ChevronRight, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const MenuManagementPage = () => {
  const { refreshMenu } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', icon: '', path: '', parentId: '', sortOrder: 0 });
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  const fetchMenuItems = async () => {
    try {
      setLoading(true);
      const response = await menusAPI.getAll();
      setMenuItems(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch menu items');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const response = await rolesAPI.getAll();
      setRoles(response.data.data);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  useEffect(() => {
    fetchMenuItems();
    fetchRoles();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Menu name is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setFormLoading(true);
      await menusAPI.create({
        ...formData,
        parentId: formData.parentId || null,
        sortOrder: parseInt(formData.sortOrder) || 0,
      });
      toast.success('Menu item created successfully');
      setIsCreateModalOpen(false);
      setFormData({ name: '', icon: '', path: '', parentId: '', sortOrder: 0 });
      fetchMenuItems();
      refreshMenu();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create menu item');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setFormLoading(true);
      await menusAPI.update(selectedMenu.id, {
        ...formData,
        parentId: formData.parentId || null,
        sortOrder: parseInt(formData.sortOrder) || 0,
      });
      toast.success('Menu item updated successfully');
      setIsEditModalOpen(false);
      fetchMenuItems();
      refreshMenu();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update menu item');
    } finally {
      setFormLoading(false);
    }
  };

  const handleAccessUpdate = async () => {
    try {
      setFormLoading(true);
      await menusAPI.setRoleAccess(selectedMenu.id, selectedRoles);
      toast.success('Access updated successfully');
      setIsAccessModalOpen(false);
      refreshMenu();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update access');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setFormLoading(true);
      await menusAPI.delete(selectedMenu.id);
      toast.success('Menu item deleted successfully');
      setIsDeleteDialogOpen(false);
      fetchMenuItems();
      refreshMenu();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete menu item');
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (menu) => {
    setSelectedMenu(menu);
    setFormData({
      name: menu.name,
      icon: menu.icon || '',
      path: menu.path || '',
      parentId: menu.parent_id || '',
      sortOrder: menu.sort_order || 0,
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const openAccessModal = async (menu) => {
    setSelectedMenu(menu);
    try {
      const response = await menusAPI.getById(menu.id);
      setSelectedRoles(response.data.data.rolesWithAccess.map((r) => r.id));
      setIsAccessModalOpen(true);
    } catch (error) {
      toast.error('Failed to load access settings');
    }
  };

  const toggleRole = (roleId) => {
    setSelectedRoles((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  const parentOptions = menuItems
    .filter((item) => !item.parent_id)
    .map((item) => ({ value: item.id, label: item.name }));

  const getParentName = (parentId) => {
    const parent = menuItems.find((item) => item.id === parentId);
    return parent ? parent.name : null;
  };

  const columns = [
    {
      header: 'Menu Item',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.parent_id && <ChevronRight className="w-4 h-4 text-slate-400 ml-4" />}
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${row.parent_id ? 'bg-slate-50' : 'bg-primary-100'}`}>
            <Menu className={`w-5 h-5 ${row.parent_id ? 'text-slate-500' : 'text-primary-600'}`} />
          </div>
          <div>
            <span className="font-medium text-slate-900">{row.name}</span>
            {row.parent_id && (
              <p className="text-xs text-slate-500">Under: {getParentName(row.parent_id)}</p>
            )}
          </div>
        </div>
      ),
    },
    { header: 'Path', render: (row) => <span className="text-slate-500 font-mono text-sm">{row.path || '-'}</span> },
    { header: 'Icon', render: (row) => <span className="text-slate-500">{row.icon || '-'}</span> },
    { header: 'Order', render: (row) => <Badge variant="default">{row.sort_order}</Badge> },
    {
      header: 'Status',
      render: (row) => <Badge variant={row.is_active ? 'success' : 'danger'}>{row.is_active ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openAccessModal(row)} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-sm font-medium">
            Access
          </button>
          <button onClick={() => openEditModal(row)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"><Edit2 className="w-4 h-4" /></button>
          <button onClick={() => { setSelectedMenu(row); setIsDeleteDialogOpen(true); }} className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  // Sort items: parents first, then children grouped under parents
  const sortedMenuItems = [...menuItems].sort((a, b) => {
    if (!a.parent_id && !b.parent_id) return a.sort_order - b.sort_order;
    if (!a.parent_id) return -1;
    if (!b.parent_id) return 1;
    if (a.parent_id === b.parent_id) return a.sort_order - b.sort_order;
    return 0;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display font-semibold text-xl text-slate-900">Menu Items</h2>
          <p className="text-slate-500 text-sm mt-1">Manage sidebar navigation and access</p>
        </div>
        <Button icon={Plus} onClick={() => { setFormData({ name: '', icon: '', path: '', parentId: '', sortOrder: 0 }); setFormErrors({}); setIsCreateModalOpen(true); }}>Add Menu Item</Button>
      </div>

      <Table columns={columns} data={sortedMenuItems} loading={loading} emptyMessage="No menu items found" />

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Menu Item">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Name" placeholder="Enter menu name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} error={formErrors.name} />
          <Input label="Icon" placeholder="e.g., LayoutDashboard" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} />
          <Input label="Path" placeholder="e.g., /dashboard" value={formData.path} onChange={(e) => setFormData({ ...formData, path: e.target.value })} />
          <Select label="Parent Menu" options={parentOptions} placeholder="None (Top Level)" value={formData.parentId} onChange={(e) => setFormData({ ...formData, parentId: e.target.value })} />
          <Input label="Sort Order" type="number" placeholder="0" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })} />
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" fullWidth onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button type="submit" fullWidth loading={formLoading}>Create Menu</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Menu Item">
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input label="Name" placeholder="Enter menu name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} error={formErrors.name} />
          <Input label="Icon" placeholder="e.g., LayoutDashboard" value={formData.icon} onChange={(e) => setFormData({ ...formData, icon: e.target.value })} />
          <Input label="Path" placeholder="e.g., /dashboard" value={formData.path} onChange={(e) => setFormData({ ...formData, path: e.target.value })} />
          <Select label="Parent Menu" options={parentOptions.filter(o => o.value !== selectedMenu?.id)} placeholder="None (Top Level)" value={formData.parentId} onChange={(e) => setFormData({ ...formData, parentId: e.target.value })} />
          <Input label="Sort Order" type="number" placeholder="0" value={formData.sortOrder} onChange={(e) => setFormData({ ...formData, sortOrder: e.target.value })} />
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" fullWidth onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button type="submit" fullWidth loading={formLoading}>Update Menu</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isAccessModalOpen} onClose={() => setIsAccessModalOpen(false)} title={`Access for "${selectedMenu?.name}"`} size="md">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Select which roles can access this menu item:</p>
          <div className="space-y-2">
            {roles.map((role) => (
              <label key={role.id} className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-slate-50 border border-slate-200">
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedRoles.includes(role.id) ? 'bg-primary-600 border-primary-600' : 'border-slate-300'}`}>
                  {selectedRoles.includes(role.id) && <Check className="w-3 h-3 text-white" />}
                </div>
                <input type="checkbox" className="hidden" checked={selectedRoles.includes(role.id)} onChange={() => toggleRole(role.id)} />
                <div>
                  <span className="font-medium text-slate-900">{role.name}</span>
                  {role.is_system_role && <Badge variant="primary" size="sm" className="ml-2">System</Badge>}
                </div>
              </label>
            ))}
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" fullWidth onClick={() => setIsAccessModalOpen(false)}>Cancel</Button>
            <Button fullWidth loading={formLoading} onClick={handleAccessUpdate}>Save Access</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} onConfirm={handleDelete} title="Delete Menu Item" message={`Are you sure you want to delete "${selectedMenu?.name}"? This will also delete any child items.`} confirmText="Delete" loading={formLoading} />
    </div>
  );
};

export default MenuManagementPage;
