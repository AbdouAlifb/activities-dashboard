import React, { useState, useEffect } from 'react';
import { Search, Eye, CheckCircle, XCircle, Calendar, Clock, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { reservationsAPI } from '../services/api';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Table from '../components/Table';
import Badge from '../components/Badge';

const statusColors = { pending: 'warning', confirmed: 'primary', completed: 'success', cancelled: 'danger' };

const AgencyReservationsPage = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => { fetchReservations(); }, [pagination.page, filterStatus]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await reservationsAPI.getMyReservations({ page: pagination.page, limit: pagination.limit, status: filterStatus || undefined });
      setReservations(response.data.data.reservations);
      setPagination(prev => ({ ...prev, ...response.data.data.pagination }));
    } catch (error) {
      toast.error('Failed to fetch reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id) => {
    try { await reservationsAPI.confirm(id); toast.success('Confirmed'); fetchReservations(); }
    catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const handleCancel = async () => {
    try { await reservationsAPI.cancel(selectedReservation.id, cancelReason); toast.success('Cancelled'); setIsCancelOpen(false); setCancelReason(''); fetchReservations(); }
    catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const handleComplete = async (id) => {
    try { await reservationsAPI.complete(id); toast.success('Completed'); fetchReservations(); }
    catch (error) { toast.error(error.response?.data?.message || 'Failed'); }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const formatTime = (time) => time ? time.substring(0, 5) : '-';

  const columns = [
    { key: 'reference', label: 'Ref', render: (row) => <code className="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded">{row.reference_code}</code> },
    { key: 'activity', label: 'Activity', render: (row) => <span className="font-medium text-sm">{row.activity_title}</span> },
    { key: 'customer', label: 'Customer', render: (row) => <div><div className="font-medium">{row.customer_name}</div><div className="text-xs text-slate-500">{row.customer_phone || row.customer_email}</div></div> },
    { key: 'booking', label: 'Date', render: (row) => <div><div>{formatDate(row.booking_date)}</div><div className="text-xs text-slate-500">{formatTime(row.booking_time)} • {row.participants} pax</div></div> },
    { key: 'payout', label: 'Payout', render: (row) => <span className="font-medium text-green-600">${parseFloat(row.agency_payout).toFixed(2)}</span> },
    { key: 'status', label: 'Status', render: (row) => <Badge variant={statusColors[row.status]}>{row.status}</Badge> },
    {
      key: 'actions', label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1">
          <button onClick={() => { setSelectedReservation(row); setIsViewOpen(true); }} className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"><Eye className="w-4 h-4" /></button>
          {row.status === 'pending' && <>
            <button onClick={() => handleConfirm(row.id)} className="p-1.5 text-slate-500 hover:text-green-600 hover:bg-green-50 rounded-lg" title="Confirm"><CheckCircle className="w-4 h-4" /></button>
            <button onClick={() => { setSelectedReservation(row); setIsCancelOpen(true); }} className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg" title="Cancel"><XCircle className="w-4 h-4" /></button>
          </>}
          {row.status === 'confirmed' && <button onClick={() => handleComplete(row.id)} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">Complete</button>}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-display font-semibold text-slate-900">My Reservations</h1><p className="text-slate-500 mt-1">Manage your bookings</p></div>
      
      <div className="flex gap-4">
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPagination(p => ({ ...p, page: 1 })); }} className="px-4 py-2 border border-slate-200 rounded-lg">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <Table columns={columns} data={reservations} loading={loading} pagination={pagination} onPageChange={(page) => setPagination(prev => ({ ...prev, page }))} />

      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title="Reservation Details">
        {selectedReservation && (
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <code className="text-lg font-mono bg-slate-100 px-3 py-1 rounded">{selectedReservation.reference_code}</code>
              <Badge variant={statusColors[selectedReservation.status]} size="lg">{selectedReservation.status}</Badge>
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <h4 className="font-medium mb-2">{selectedReservation.activity_title}</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div><span className="text-slate-500">Date:</span> {formatDate(selectedReservation.booking_date)}</div>
                <div><span className="text-slate-500">Time:</span> {formatTime(selectedReservation.booking_time)}</div>
                <div><span className="text-slate-500">Participants:</span> {selectedReservation.participants}</div>
                <div><span className="text-slate-500">Your Payout:</span> <span className="font-medium text-green-600">${parseFloat(selectedReservation.agency_payout).toFixed(2)}</span></div>
              </div>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Customer</h4>
              <p className="font-medium">{selectedReservation.customer_name}</p>
              <p className="text-sm">{selectedReservation.customer_email}</p>
              {selectedReservation.customer_phone && <p className="text-sm">{selectedReservation.customer_phone}</p>}
              {selectedReservation.customer_notes && <p className="text-sm mt-2 italic">"{selectedReservation.customer_notes}"</p>}
            </div>
            {selectedReservation.meeting_point && <div><h4 className="font-medium mb-1">Meeting Point</h4><p className="text-sm text-slate-600">{selectedReservation.meeting_point}</p></div>}
            <div className="flex justify-end gap-3 pt-4">
              {selectedReservation.status === 'pending' && <>
                <Button variant="danger" onClick={() => { setIsViewOpen(false); setIsCancelOpen(true); }}>Cancel</Button>
                <Button onClick={() => { handleConfirm(selectedReservation.id); setIsViewOpen(false); }}>Confirm</Button>
              </>}
              {selectedReservation.status === 'confirmed' && <Button onClick={() => { handleComplete(selectedReservation.id); setIsViewOpen(false); }}>Mark Complete</Button>}
              <Button variant="secondary" onClick={() => setIsViewOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={isCancelOpen} onClose={() => { setIsCancelOpen(false); setCancelReason(''); }} title="Cancel Reservation">
        <div className="space-y-4">
          <p>Cancel reservation <strong>{selectedReservation?.reference_code}</strong>?</p>
          <textarea value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={3} className="w-full px-4 py-2 border border-slate-200 rounded-lg" placeholder="Reason..." />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => { setIsCancelOpen(false); setCancelReason(''); }}>Back</Button>
            <Button variant="danger" onClick={handleCancel}>Cancel Reservation</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AgencyReservationsPage;
