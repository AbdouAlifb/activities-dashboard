import React, { useState, useEffect } from 'react';
import { usersAPI, rolesAPI } from '../services/api';
import Table from '../components/Table';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import Input from '../components/Input';
import Select from '../components/Select';
import ConfirmDialog from '../components/ConfirmDialog';
import { Plus, Edit2, Trash2, Key, Unlock, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const UserManagementPage = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    roleId: '',
  });
  const [newPassword, setNewPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await usersAPI.getAll({ page, limit: 10, search });
      setUsers(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  // Fetch roles
  const fetchRoles = async () => {
    try {
      const response = await rolesAPI.getAll();
      setRoles(response.data.data);
    } catch (error) {
      console.error('Failed to fetch roles:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [page, search]);

  // Validate form
  const validateForm = (isCreate = true) => {
    const errors = {};
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      errors.username = 'Username must be at least 3 characters';
    }
    if (isCreate && !formData.password) {
      errors.password = 'Password is required';
    } else if (isCreate && formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    if (!formData.roleId) {
      errors.roleId = 'Role is required';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Create user
  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm(true)) return;
    
    try {
      setFormLoading(true);
      await usersAPI.create(formData);
      toast.success('User created successfully');
      setIsCreateModalOpen(false);
      setFormData({ username: '', password: '', roleId: '' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setFormLoading(false);
    }
  };

  // Update user
  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm(false)) return;
    
    try {
      setFormLoading(true);
      await usersAPI.update(selectedUser.id, {
        username: formData.username,
        roleId: formData.roleId,
      });
      toast.success('User updated successfully');
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update user');
    } finally {
      setFormLoading(false);
    }
  };

  // Update password
  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    try {
      setFormLoading(true);
      await usersAPI.updatePassword(selectedUser.id, { newPassword });
      toast.success('Password updated successfully');
      setIsPasswordModalOpen(false);
      setNewPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setFormLoading(false);
    }
  };

  // Delete user
  const handleDelete = async () => {
    try {
      setFormLoading(true);
      await usersAPI.delete(selectedUser.id);
      toast.success('User deleted successfully');
      setIsDeleteDialogOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    } finally {
      setFormLoading(false);
    }
  };

  // Unlock user
  const handleUnlock = async (user) => {
    try {
      await usersAPI.unlock(user.id);
      toast.success('User account unlocked');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to unlock user');
    }
  };

  // Open edit modal
  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      password: '',
      roleId: user.role_id,
    });
    setFormErrors({});
    setIsEditModalOpen(true);
  };

  // Open password modal
  const openPasswordModal = (user) => {
    setSelectedUser(user);
    setNewPassword('');
    setIsPasswordModalOpen(true);
  };

  // Open delete dialog
  const openDeleteDialog = (user) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  // Table columns
  const columns = [
    {
      header: 'Username',
      accessor: 'username',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center">
            <span className="text-white font-semibold text-sm">
              {row.username.charAt(0).toUpperCase()}
            </span>
          </div>
          <span className="font-medium text-slate-900">{row.username}</span>
        </div>
      ),
    },
    {
      header: 'Role',
      accessor: 'role_name',
      render: (row) => (
        <Badge variant={row.role_name === 'Super Admin' ? 'primary' : 'default'}>
          {row.role_name}
        </Badge>
      ),
    },
    {
      header: 'Status',
      accessor: 'is_active',
      render: (row) => (
        <Badge variant={row.is_active ? 'success' : 'danger'}>
          {row.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      header: 'Last Login',
      accessor: 'last_login',
      render: (row) => (
        <span className="text-slate-500">
          {row.last_login ? new Date(row.last_login).toLocaleDateString() : 'Never'}
        </span>
      ),
    },
    {
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => openEditModal(row)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700"
            title="Edit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => openPasswordModal(row)}
            className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700"
            title="Reset Password"
          >
            <Key className="w-4 h-4" />
          </button>
          {row.role_name !== 'Super Admin' && (
            <button
              onClick={() => openDeleteDialog(row)}
              className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  const roleOptions = roles.map((role) => ({
    value: role.id,
    label: role.name,
  }));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display font-semibold text-xl text-slate-900">Users</h2>
          <p className="text-slate-500 text-sm mt-1">Manage system users and their roles</p>
        </div>
        <Button icon={Plus} onClick={() => {
          setFormData({ username: '', password: '', roleId: '' });
          setFormErrors({});
          setIsCreateModalOpen(true);
        }}>
          Add User
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={users}
        loading={loading}
        emptyMessage="No users found"
        pagination={pagination}
        onPageChange={setPage}
      />

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create User">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Username"
            placeholder="Enter username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            error={formErrors.username}
          />
          <Input
            label="Password"
            type="password"
            placeholder="Enter password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={formErrors.password}
          />
          <Select
            label="Role"
            options={roleOptions}
            value={formData.roleId}
            onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
            error={formErrors.roleId}
          />
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" fullWidth onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" fullWidth loading={formLoading}>
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit User">
        <form onSubmit={handleUpdate} className="space-y-4">
          <Input
            label="Username"
            placeholder="Enter username"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            error={formErrors.username}
          />
          <Select
            label="Role"
            options={roleOptions}
            value={formData.roleId}
            onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
            error={formErrors.roleId}
          />
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" fullWidth onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" fullWidth loading={formLoading}>
              Update User
            </Button>
          </div>
        </form>
      </Modal>

      {/* Password Modal */}
      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title="Reset Password">
        <form onSubmit={handlePasswordUpdate} className="space-y-4">
          <p className="text-sm text-slate-600">
            Set a new password for <strong>{selectedUser?.username}</strong>
          </p>
          <Input
            label="New Password"
            type="password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <p className="text-xs text-slate-500">
            Password must be at least 8 characters with uppercase, lowercase, number, and special character.
          </p>
          <div className="flex gap-3 pt-4">
            <Button variant="secondary" fullWidth onClick={() => setIsPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" fullWidth loading={formLoading}>
              Update Password
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete "${selectedUser?.username}"? This action cannot be undone.`}
        confirmText="Delete"
        loading={formLoading}
      />
    </div>
  );
};

export default UserManagementPage;
