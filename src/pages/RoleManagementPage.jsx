import React, { useState, useEffect } from 'react';
import { rolesAPI, menusAPI } from '../services/api';
import Table from '../components/Table';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Input from '../components/Input';
import ConfirmDialog from '../components/ConfirmDialog';
import Card from '../components/Card';
import { Plus, Edit2, Trash2, Shield, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const RoleManagementPage = () => {
  const [roles, setRoles] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPermissionsModalOpen, setIsPermissionsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [formErrors, setFormErrors] = useState({});

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await rolesAPI.getAll();
      setRoles(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const response = await menusAPI.getAll();
      setMenuItems(response.data.data);
    } catch (error) {
      console.error('Failed to fetch menu items:', error);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchMenuItems();
  }, []);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Role name is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setFormLoading(true);
      await rolesAPI.create(formData);
      toast.success('Role created successfully');
      setIsCreateModalOpen(false);
      setFormData({ name: '', description: '' });
      fetchRoles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create role');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      setFormLoading(true);
      await rolesAPI.update(selectedRole.id, formData);
      toast.success('Role updated successfully');
      setIsEditModalOpen(false);
      fetchRoles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    } finally {
      setFormLoading(false);
    }
  };

  const handlePermissionsUpdate = async () => {
    try {
      setFormLoading(true);
      await rolesAPI.setPermissions(selectedRole.id, selectedPermissions);
      toast.success('Permissions updated successfully');
      setIsPermissionsModalOpen(false);
      fetchRoles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update permissions');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setFormLoading(true);
      await rolesAPI.delete(selectedRole.id);
      toast.success('Role deleted successfully');
      setIsDeleteDialogOpen(false);
      fetchRoles();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete role');
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (role) => {
    setSelectedRole(role);
    setFormData({ name: role.name, description: role.description || '' });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  const openPermissionsModal = async (role) => {
    setSelectedRole(role);
    try {
      const response = await rolesAPI.getPermissions(role.id);
      setSelectedPermissions(response.data.data.map((p) => p.id));
      setIsPermissionsModalOpen(true);
    } catch (error) {
      toast.error('Failed to load permissions');
    }
  };

  const togglePermission = (menuId) => {
    setSelectedPermissions((prev) =>
      prev.includes(menuId) ? prev.filter((id) => id !== menuId) : [...prev, menuId]
    );
  };

  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!item.parent_id) {
      acc[item.id] = { ...item, children: menuItems.filter((child) => child.parent_id === item.id) };
    }
    return acc;
  }, {});

  const columns = [
    {
      header: 'Role',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${row.is_system_role ? 'bg-primary-100' : 'bg-slate-100'}`}>
            <Shield className={`w-5 h-5 ${row.is_system_role ? 'text-primary-600' : 'text-slate-600'}`} />
          </div>
          <div>
            <span className="font-medium text-slate-900">{row.name}</span>
            {row.is_system_role && <Badge variant="primary" size="sm" className="ml-2">System</Badge>}
          </div>
        </div>
      ),
    },
    { header: 'Description', render: (row) => <span className="text-slate-500">{row.description || '-'}</span> },
    { header: 'Users', render: (row) => <Badge variant="default">{row.userCount} users</Badge> },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button onClick={() => openPermissionsModal(row)} className="px-3 py-1.5 rounded-lg bg-primary-50 text-primary-600 hover:bg-primary-100 text-sm font-medium">
            Permissions
          </button>
          {!row.is_system_role && (
            <>
              <button onClick={() => openEditModal(row)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-500"><Edit2 className="w-4 h-4" /></button>
              <button onClick={() => { setSelectedRole(row); setIsDeleteDialogOpen(true); }} className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600" disabled={row.userCount > 0}><Trash2 className="w-4 h-4" /></button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display font-semibold text-xl text-slate-900">Roles</h2>
          <p className="text-slate-500 text-sm mt-1">Manage roles and their permissions</p>
        </div>
        <Button icon={Plus} onClick={() => { setFormData({ name: '', description: '' }); setFormErrors({}); setIsCreateModalOpen(true); }}>Add Role</Button>
      </div>

      <Table columns={columns} data={roles} loading={loading} emptyMessage="No roles found" />

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create Role">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input label="Role Name" placeholder="Enter role name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} error={formErrors.name} />
          <Input label="Description" placeholder="Enter description (optional)" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" fullWidth onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
            <Button type="submit" fullWidth loading={formLoading}>Create Role</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Role">
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input label="Role Name" placeholder="Enter role name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} error={formErrors.name} />
          <Input label="Description" placeholder="Enter description (optional)" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" fullWidth onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button type="submit" fullWidth loading={formLoading}>Update Role</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isPermissionsModalOpen} onClose={() => setIsPermissionsModalOpen(false)} title={`Permissions for ${selectedRole?.name}`} size="lg">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Select which menu items this role can access:</p>
          <div className="max-h-96 overflow-y-auto space-y-4">
            {Object.values(groupedMenuItems).map((parent) => (
              <Card key={parent.id} padding="sm" className="bg-slate-50">
                <div className="space-y-2">
                  <label className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-white">
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedPermissions.includes(parent.id) ? 'bg-primary-600 border-primary-600' : 'border-slate-300'}`}>
                      {selectedPermissions.includes(parent.id) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <input type="checkbox" className="hidden" checked={selectedPermissions.includes(parent.id)} onChange={() => togglePermission(parent.id)} />
                    <span className="font-medium text-slate-900">{parent.name}</span>
                  </label>
                  {parent.children.length > 0 && (
                    <div className="ml-8 space-y-1">
                      {parent.children.map((child) => (
                        <label key={child.id} className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-white">
                          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${selectedPermissions.includes(child.id) ? 'bg-primary-600 border-primary-600' : 'border-slate-300'}`}>
                            {selectedPermissions.includes(child.id) && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <input type="checkbox" className="hidden" checked={selectedPermissions.includes(child.id)} onChange={() => togglePermission(child.id)} />
                          <span className="text-slate-700">{child.name}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" fullWidth onClick={() => setIsPermissionsModalOpen(false)}>Cancel</Button>
            <Button fullWidth loading={formLoading} onClick={handlePermissionsUpdate}>Save Permissions</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={isDeleteDialogOpen} onClose={() => setIsDeleteDialogOpen(false)} onConfirm={handleDelete} title="Delete Role" message={`Are you sure you want to delete "${selectedRole?.name}"? This action cannot be undone.`} confirmText="Delete" loading={formLoading} />
    </div>
  );
};

export default RoleManagementPage;
