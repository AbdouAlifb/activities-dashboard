import React, { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, XCircle, Calendar, DollarSign, Users, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { reservationsAPI, agenciesAPI } from '../services/api';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Table from '../components/Table';
import Badge from '../components/Badge';
import ConfirmDialog from '../components/ConfirmDialog';

const statusColors = {
  pending: 'warning',
  confirmed: 'primary',
  completed: 'success',
  cancelled: 'danger'
};

const paymentColors = {
  pending: 'warning',
  paid: 'success',
  refunded: 'secondary',
  failed: 'danger'
};

const ReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAgency, setFilterAgency] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchAgencies();
    fetchStats();
  }, []);

  useEffect(() => {
    fetchReservations();
  }, [pagination.page, search, filterAgency, filterStatus]);

  const fetchAgencies = async () => {
    try {
      const response = await agenciesAPI.getAll({ limit: 100 });
      setAgencies(response.data.data.agencies);
    } catch (error) {
      console.error('Failed to fetch agencies');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await reservationsAPI.getStats({});
      setStats(response.data.data.stats);
    } catch (error) {
      console.error('Failed to fetch stats');
    }
  };

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await reservationsAPI.getAll({
        page: pagination.page, limit: pagination.limit, search,
        agencyId: filterAgency || undefined, status: filterStatus || undefined
      });
      setReservations(response.data.data.reservations);
      setPagination(prev => ({ ...prev, ...response.data.data.pagination }));
    } catch (error) {
      toast.error('Échec de récupération des réservations');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    try {
      await reservationsAPI.confirm(selectedReservation.id);
      toast.success('Réservation confirmée');
      setIsConfirmOpen(false);
      fetchReservations();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Échec de confirmation');
    }
  };

  const handleCancel = async () => {
    try {
      await reservationsAPI.cancel(selectedReservation.id, cancelReason);
      toast.success('Réservation annulée');
      setIsCancelOpen(false);
      setCancelReason('');
      fetchReservations();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || "Échec d'annulation");
    }
  };

  const handleComplete = async (reservation) => {
    try {
      await reservationsAPI.complete(reservation.id);
      toast.success('Réservation marquée comme terminée');
      fetchReservations();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Échec de complétion');
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (time) => time ? time.substring(0, 5) : '-';

  const columns = [
    {
      key: 'reference', label: 'Référence',
      render: (row) => (
        <div>
          <code className="text-sm font-mono bg-slate-100 px-2 py-0.5 rounded">{row.reference_code}</code>
          <div className="text-xs text-slate-500 mt-1">{formatDate(row.created_at)}</div>
        </div>
      )
    },
    {
      key: 'activity', label: 'Activité',
      render: (row) => (
        <div className="flex items-center gap-3">
          {row.activity_image && <img src={row.activity_image} alt="" className="w-12 h-8 rounded object-cover" />}
          <div>
            <div className="font-medium text-slate-900 text-sm">{row.activity_title}</div>
            <div className="text-xs text-slate-500">{row.city_name}</div>
          </div>
        </div>
      )
    },
    {
      key: 'customer', label: 'Client',
      render: (row) => (
        <div>
          <div className="font-medium text-slate-900">{row.customer_name}</div>
          <div className="text-xs text-slate-500">{row.customer_email}</div>
        </div>
      )
    },
    {
      key: 'booking', label: 'Réservation',
      render: (row) => (
        <div className="text-sm">
          <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {formatDate(row.booking_date)}</div>
          <div className="flex items-center gap-1 text-slate-500"><Clock className="w-3 h-3" /> {formatTime(row.booking_time)}</div>
          <div className="flex items-center gap-1 text-slate-500"><Users className="w-3 h-3" /> {row.participants} pers.</div>
        </div>
      )
    },
    {
      key: 'amount', label: 'Montant',
      render: (row) => (
        <div>
          <div className="font-medium text-green-600">${parseFloat(row.total_price).toFixed(2)}</div>
          <div className="text-xs text-slate-500">Commission: ${parseFloat(row.commission_amount).toFixed(2)}</div>
        </div>
      )
    },
    { key: 'agency_name', label: 'Agence' },
    {
      key: 'status', label: 'Statut',
      render: (row) => (
        <div className="space-y-1">
          <Badge variant={statusColors[row.status]}>{row.status}</Badge>
          <Badge variant={paymentColors[row.payment_status]} size="sm">{row.payment_status}</Badge>
        </div>
      )
    },
    {
      key: 'actions', label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => { setSelectedReservation(row); setIsViewOpen(true); }} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg" title="Voir"><Eye className="w-4 h-4" /></button>
          {row.status === 'pending' && (
            <>
              <button onClick={() => { setSelectedReservation(row); setIsConfirmOpen(true); }} className="p-1.5 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Confirmer"><CheckCircle className="w-4 h-4" /></button>
              <button onClick={() => { setSelectedReservation(row); setIsCancelOpen(true); }} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Annuler"><XCircle className="w-4 h-4" /></button>
            </>
          )}
          {row.status === 'confirmed' && (
            <button onClick={() => handleComplete(row)} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">Terminer</button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold text-slate-900">Réservations</h1>
        <p className="text-slate-500 mt-1">Gérer toutes les réservations de la plateforme</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
            <p className="text-sm text-slate-500">Total</p>
          </div>
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-200">
            <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            <p className="text-sm text-amber-700">En Attente</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <p className="text-2xl font-bold text-blue-600">{stats.confirmed}</p>
            <p className="text-sm text-blue-700">Confirmées</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            <p className="text-sm text-green-700">Terminées</p>
          </div>
          <div className="bg-green-50 p-4 rounded-xl border border-green-200">
            <p className="text-2xl font-bold text-green-600">${parseFloat(stats.total_revenue || 0).toFixed(0)}</p>
            <p className="text-sm text-green-700">Revenu</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input type="text" placeholder="Rechercher par référence, client..." value={search} onChange={(e) => { setSearch(e.target.value); setPagination(p => ({ ...p, page: 1 })); }} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg" />
        </div>
        <select value={filterAgency} onChange={(e) => { setFilterAgency(e.target.value); setPagination(p => ({ ...p, page: 1 })); }} className="px-4 py-2 border border-slate-200 rounded-lg">
          <option value="">Toutes les Agences</option>
          {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPagination(p => ({ ...p, page: 1 })); }} className="px-4 py-2 border border-slate-200 rounded-lg">
          <option value="">Tous les Statuts</option>
          <option value="pending">En Attente</option>
          <option value="confirmed">Confirmées</option>
          <option value="completed">Terminées</option>
          <option value="cancelled">Annulées</option>
        </select>
      </div>

      <Table columns={columns} data={reservations} loading={loading} pagination={pagination} onPageChange={(page) => setPagination(prev => ({ ...prev, page }))} />

      {/* View Modal */}
      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Détails de la Réservation" size="lg">
        {selectedReservation && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <code className="text-lg font-mono bg-slate-100 px-3 py-1 rounded">{selectedReservation.reference_code}</code>
              <div className="flex gap-2">
                <Badge variant={statusColors[selectedReservation.status]} size="lg">{selectedReservation.status}</Badge>
                <Badge variant={paymentColors[selectedReservation.payment_status]}>{selectedReservation.payment_status}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-slate-500">Activité</h4>
                <p className="font-medium">{selectedReservation.activity_title}</p>
                <p className="text-sm text-slate-500">{selectedReservation.city_name}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-slate-500">Agence</h4>
                <p className="font-medium">{selectedReservation.agency_name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 rounded-lg">
              <div>
                <h4 className="text-sm font-medium text-blue-800">Client</h4>
                <p className="font-medium">{selectedReservation.customer_name}</p>
                <p className="text-sm">{selectedReservation.customer_email}</p>
                {selectedReservation.customer_phone && <p className="text-sm">{selectedReservation.customer_phone}</p>}
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-800">Détails de Réservation</h4>
                <p className="font-medium">{formatDate(selectedReservation.booking_date)} à {formatTime(selectedReservation.booking_time)}</p>
                <p className="text-sm">{selectedReservation.participants} participants</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 p-4 bg-green-50 rounded-lg">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">${parseFloat(selectedReservation.total_price).toFixed(2)}</p>
                <p className="text-xs text-green-700">Prix Total</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-amber-600">${parseFloat(selectedReservation.commission_amount).toFixed(2)}</p>
                <p className="text-xs text-amber-700">Commission</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">${parseFloat(selectedReservation.agency_payout).toFixed(2)}</p>
                <p className="text-xs text-blue-700">Paiement Agence</p>
              </div>
            </div>

            {selectedReservation.customer_notes && (
              <div><h4 className="font-medium mb-1">Notes du Client</h4><p className="text-slate-600 text-sm bg-slate-50 p-3 rounded">{selectedReservation.customer_notes}</p></div>
            )}

            {selectedReservation.cancellation_reason && (
              <div className="p-4 bg-red-50 rounded-lg"><h4 className="font-medium text-red-800 mb-1">Raison d'Annulation</h4><p className="text-red-700 text-sm">{selectedReservation.cancellation_reason}</p></div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              {selectedReservation.status === 'pending' && (
                <>
                  <Button variant="danger" onClick={() => { setIsViewOpen(false); setIsCancelOpen(true); }}>Annuler</Button>
                  <Button onClick={() => { setIsViewOpen(false); setIsConfirmOpen(true); }}>Confirmer</Button>
                </>
              )}
              {selectedReservation.status === 'confirmed' && (
                <Button onClick={() => { handleComplete(selectedReservation); setIsViewOpen(false); }}>Marquer Terminée</Button>
              )}
              <Button variant="secondary" onClick={() => setIsViewOpen(false)}>Fermer</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Dialog */}
      <ConfirmDialog isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleConfirm} title="Confirmer la Réservation" message={`Confirmer la réservation ${selectedReservation?.reference_code}? Le client sera notifié.`} confirmText="Confirmer" variant="primary" />

      {/* Cancel Dialog */}
      <Modal isOpen={isCancelOpen} onClose={() => { setIsCancelOpen(false); setCancelReason(''); }} title="Annuler la Réservation">
        <div className="space-y-4">
          <p className="text-slate-600">Êtes-vous sûr de vouloir annuler la réservation <strong>{selectedReservation?.reference_code}</strong>?</p>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Raison d'Annulation</label>
            <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={3} className="w-full px-4 py-2 border border-slate-200 rounded-lg" placeholder="Raison de l'annulation..." />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setIsCancelOpen(false); setCancelReason(''); }}>Retour</Button>
            <Button variant="danger" onClick={handleCancel}>Annuler la Réservation</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ReservationsPage;
