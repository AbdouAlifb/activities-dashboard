import React, { useState, useEffect } from 'react';
import { Store, Calendar, DollarSign, TrendingUp, Clock, Users, CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { agenciesAPI, reservationsAPI } from '../services/api';
import Button from '../components/Button';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';

const statusColors = { pending: 'warning', confirmed: 'primary', completed: 'success', cancelled: 'danger' };

const AgencyDashboardPage = () => {
  const [agency, setAgency] = useState(null);
  const [stats, setStats] = useState(null);
  const [upcomingReservations, setUpcomingReservations] = useState([]);
  const [myActivities, setMyActivities] = useState([]);
  const [availableActivities, setAvailableActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isAddActivityOpen, setIsAddActivityOpen] = useState(false);
  const [isRemoveOpen, setIsRemoveOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [agencyRes, statsRes, upcomingRes, activitiesRes] = await Promise.all([
        agenciesAPI.getMyAgency(),
        reservationsAPI.getMyStats({}),
        reservationsAPI.getMyUpcoming(5),
        agenciesAPI.getMyActivities()
      ]);
      
      setAgency(agencyRes.data.data.agency);
      setStats(statsRes.data.data.stats);
      setUpcomingReservations(upcomingRes.data.data.reservations);
      setMyActivities(activitiesRes.data.data.activities);
    } catch (error) {
      toast.error('Échec du chargement du tableau de bord');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableActivities = async () => {
    try {
      const response = await agenciesAPI.getAvailableActivities({});
      setAvailableActivities(response.data.data.activities);
    } catch (error) {
      toast.error('Échec de récupération des activités');
    }
  };

  const handleAddActivity = async (activityId) => {
    try {
      await agenciesAPI.addMyActivity({ activityId });
      toast.success('Activité ajoutée');
      setIsAddActivityOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Échec de l'ajout de l'activité");
    }
  };

  const handleRemoveActivity = async () => {
    try {
      await agenciesAPI.removeMyActivity(selectedActivity.activity_id);
      toast.success('Activité retirée');
      setIsRemoveOpen(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Échec de suppression');
    }
  };

  const handleToggleAvailability = async (activity) => {
    try {
      await agenciesAPI.updateMyActivity(activity.activity_id, { isAvailable: !activity.is_available });
      toast.success(`Activité ${activity.is_available ? 'désactivée' : 'activée'}`);
      fetchData();
    } catch (error) {
      toast.error('Échec de mise à jour');
    }
  };

  const handleConfirmReservation = async (id) => {
    try {
      await reservationsAPI.confirm(id);
      toast.success('Réservation confirmée');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Échec de confirmation');
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const formatTime = (time) => time ? time.substring(0, 5) : '-';

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  }

  if (!agency) {
    return <div className="text-center py-12"><p className="text-slate-500">Aucune agence associée à votre compte.</p></div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl bg-primary-50 flex items-center justify-center">
          <Store className="w-8 h-8 text-primary-600" />
        </div>
        <div>
          <h1 className="text-2xl font-display font-semibold text-slate-900 flex items-center gap-2">
            {agency.name}
            {agency.is_verified && <CheckCircle className="w-5 h-5 text-green-500" />}
          </h1>
          <p className="text-slate-500">{agency.city_name || 'Aucun emplacement défini'}</p>
        </div>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg"><Clock className="w-5 h-5 text-amber-600" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.pending}</p>
                <p className="text-sm text-slate-500">En Attente</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg"><Calendar className="w-5 h-5 text-blue-600" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.confirmed}</p>
                <p className="text-sm text-slate-500">Confirmées</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.completed}</p>
                <p className="text-sm text-slate-500">Terminées</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg"><DollarSign className="w-5 h-5 text-green-600" /></div>
              <div>
                <p className="text-2xl font-bold text-green-600">${parseFloat(stats.total_payout || 0).toFixed(0)}</p>
                <p className="text-sm text-slate-500">Gains</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Reservations */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Réservations à Venir</h2>
          {upcomingReservations.length === 0 ? (
            <p className="text-slate-500 text-center py-8">Aucune réservation à venir</p>
          ) : (
            <div className="space-y-3">
              {upcomingReservations.map((res) => (
                <div key={res.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {res.activity_image && <img src={res.activity_image} alt="" className="w-12 h-10 rounded object-cover" />}
                    <div>
                      <p className="font-medium text-sm">{res.activity_title}</p>
                      <p className="text-xs text-slate-500">{res.customer_name} • {res.participants} pers.</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-sm">{formatDate(res.booking_date)}</p>
                    <p className="text-xs text-slate-500">{formatTime(res.booking_time)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Activities */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Mes Activités</h2>
            <Button size="sm" icon={Plus} onClick={() => { fetchAvailableActivities(); setIsAddActivityOpen(true); }}>Ajouter</Button>
          </div>
          {myActivities.length === 0 ? (
            <p className="text-slate-500 text-center py-8">Aucune activité pour le moment. Ajoutez-en pour commencer à recevoir des réservations !</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {myActivities.map((act) => (
                <div key={act.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {act.main_image_url && <img src={act.main_image_url} alt="" className="w-12 h-10 rounded object-cover" />}
                    <div>
                      <p className="font-medium text-sm">{act.title}</p>
                      <p className="text-xs text-slate-500">{act.city_name} • ${parseFloat(act.base_price).toFixed(2)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={act.is_available ? 'success' : 'secondary'} size="sm">
                      {act.is_available ? 'Disponible' : 'Désactivée'}
                    </Badge>
                    <button onClick={() => handleToggleAvailability(act)} className="p-1 text-slate-400 hover:text-slate-600">
                      {act.is_available ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                    <button onClick={() => { setSelectedActivity(act); setIsRemoveOpen(true); }} className="p-1 text-slate-400 hover:text-red-600">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Activity Modal */}
      <Modal isOpen={isAddActivityOpen} onClose={() => setIsAddActivityOpen(false)} title="Ajouter une Activité">
        <div className="space-y-4">
          <p className="text-slate-600">Sélectionnez une activité à ajouter à vos offres :</p>
          {availableActivities.length === 0 ? (
            <p className="text-slate-500 text-center py-8">Aucune activité disponible à ajouter.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {availableActivities.map((act) => (
                <button
                  key={act.id}
                  onClick={() => handleAddActivity(act.id)}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {act.main_image_url && <img src={act.main_image_url} alt="" className="w-12 h-10 rounded object-cover" />}
                    <div className="text-left">
                      <p className="font-medium text-sm">{act.title}</p>
                      <p className="text-xs text-slate-500">{act.city_name} • {act.category_name || 'Non catégorisée'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-green-600">${parseFloat(act.base_price).toFixed(2)}</p>
                    <Plus className="w-4 h-4 text-primary-600" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={isRemoveOpen}
        onClose={() => setIsRemoveOpen(false)}
        onConfirm={handleRemoveActivity}
        title="Retirer l'Activité"
        message={`Retirer "${selectedActivity?.title}" de vos offres ? Vous pourrez la rajouter plus tard.`}
        confirmText="Retirer"
        variant="danger"
      />
    </div>
  );
};

export default AgencyDashboardPage;
