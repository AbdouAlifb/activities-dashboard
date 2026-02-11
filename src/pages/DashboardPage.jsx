import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Users, Building2, MapPin, Calendar, CheckCircle, XCircle, Clock, Activity } from 'lucide-react';
import toast from 'react-hot-toast';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const KPICard = ({ title, value, change, icon: Icon, color, prefix = '', suffix = '' }) => {
  const isPositive = parseFloat(change) >= 0;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 mb-2">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </h3>
          {change !== undefined && (
            <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              <span>{Math.abs(change)}% vs période précédente</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchStats();
  }, [timeRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await dashboardAPI.getStats(timeRange);
      setStats(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      toast.error('Échec du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!stats) return null;

  const { overview, growthMetrics, revenueTrends, topActivities, topAgencies, recentReservations, statusBreakdown } = stats;

  // Format data for charts
  const revenueChartData = revenueTrends.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    revenue: parseFloat(item.revenue),
    commission: parseFloat(item.commission),
    reservations: parseInt(item.reservations_count)
  })).reverse();

  const reservationStatusData = revenueTrends.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    confirmed: parseInt(item.confirmed_count),
    cancelled: parseInt(item.cancelled_count),
    pending: parseInt(item.pending_count)
  })).reverse();

  const statusPieData = statusBreakdown.map(item => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: parseInt(item.count)
  }));

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Aperçu du Tableau de Bord</h1>
          <p className="text-slate-500 mt-1">Bienvenue ! Voici ce qui se passe sur votre plateforme.</p>
        </div>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="7">7 derniers jours</option>
          <option value="30">30 derniers jours</option>
          <option value="90">90 derniers jours</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard
          title="Revenu Total"
          value={parseFloat(overview.total_revenue).toFixed(2)}
          prefix="$"
          change={growthMetrics.revenue_growth}
          icon={DollarSign}
          color="bg-gradient-to-br from-green-500 to-green-600"
        />
        <KPICard
          title="Commission Totale"
          value={parseFloat(overview.total_commission).toFixed(2)}
          prefix="$"
          change={growthMetrics.commission_growth}
          icon={TrendingUp}
          color="bg-gradient-to-br from-blue-500 to-blue-600"
        />
        <KPICard
          title="Réservations Totales"
          value={overview.total_reservations}
          change={growthMetrics.reservations_growth}
          icon={Calendar}
          color="bg-gradient-to-br from-purple-500 to-purple-600"
        />
        <KPICard
          title="Agences Actives"
          value={overview.total_agencies}
          icon={Building2}
          color="bg-gradient-to-br from-orange-500 to-orange-600"
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Statut des Réservations</h3>
            <Activity className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-slate-600">Confirmées</span>
              </div>
              <span className="text-sm font-semibold text-slate-900">{overview.confirmed_reservations}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-500" />
                <span className="text-sm text-slate-600">En Attente</span>
              </div>
              <span className="text-sm font-semibold text-slate-900">{overview.pending_reservations}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-slate-600">Annulées</span>
              </div>
              <span className="text-sm font-semibold text-slate-900">{overview.cancelled_reservations}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Statistiques Plateforme</h3>
            <MapPin className="w-5 h-5 text-slate-400" />
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Activités Actives</span>
              <span className="text-sm font-semibold text-slate-900">{overview.total_activities}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Clients Inscrits</span>
              <span className="text-sm font-semibold text-slate-900">{overview.total_clients}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Agences Actives</span>
              <span className="text-sm font-semibold text-slate-900">{overview.total_agencies}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Répartition par Statut</h3>
          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie
                data={statusPieData}
                cx="50%"
                cy="50%"
                innerRadius={30}
                outerRadius={50}
                paddingAngle={2}
                dataKey="value"
              >
                {statusPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Revenue & Commission Trends */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Tendances Revenu & Commission</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={revenueChartData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorCommission" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
              formatter={(value) => `$${parseFloat(value).toFixed(2)}`}
            />
            <Legend />
            <Area type="monotone" dataKey="revenue" stroke="#3b82f6" fillOpacity={1} fill="url(#colorRevenue)" name="Revenu" />
            <Area type="monotone" dataKey="commission" stroke="#10b981" fillOpacity={1} fill="url(#colorCommission)" name="Commission" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Reservation Status Trends */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-6">Réservations Quotidiennes par Statut</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={reservationStatusData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px' }} />
            <Legend />
            <Bar dataKey="confirmed" fill="#10b981" name="Confirmées" radius={[4, 4, 0, 0]} />
            <Bar dataKey="pending" fill="#f59e0b" name="En Attente" radius={[4, 4, 0, 0]} />
            <Bar dataKey="cancelled" fill="#ef4444" name="Annulées" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Activités les Plus Performantes</h3>
          <div className="space-y-3">
            {topActivities.slice(0, 5).map((activity, index) => (
              <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold text-sm">
                  #{index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{activity.title}</p>
                  <p className="text-sm text-slate-500">{activity.city_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{activity.reservations_count} réservations</p>
                  <p className="text-sm text-green-600">${parseFloat(activity.total_revenue).toFixed(0)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Agences les Plus Performantes</h3>
          <div className="space-y-3">
            {topAgencies.slice(0, 5).map((agency, index) => (
              <div key={agency.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-semibold text-sm">
                  #{index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 truncate">{agency.name}</p>
                  <p className="text-sm text-slate-500">{agency.city_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-slate-900">{agency.reservations_count} réservations</p>
                  <p className="text-sm text-green-600">${parseFloat(agency.total_revenue).toFixed(0)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reservations */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Réservations Récentes</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Référence</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Client</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Activité</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Agence</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Montant</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Statut</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-slate-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentReservations.map((reservation) => (
                <tr key={reservation.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="py-3 px-4 text-sm font-mono text-slate-600">{reservation.reference_code}</td>
                  <td className="py-3 px-4 text-sm text-slate-900">{reservation.customer_name}</td>
                  <td className="py-3 px-4 text-sm text-slate-900">{reservation.activity_title}</td>
                  <td className="py-3 px-4 text-sm text-slate-600">{reservation.agency_name}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-green-600">${parseFloat(reservation.total_price).toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                      {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-slate-500">
                    {new Date(reservation.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
