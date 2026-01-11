import React, { useState, useEffect } from 'react';
import { agencyPayoutsAPI } from '../services/api';
import { ChevronDown, ChevronRight, DollarSign, Building2, Calendar, TrendingUp, CheckCircle, Mail, Phone, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const AgencyPayoutsPage = () => {
  const [agencies, setAgencies] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedAgency, setExpandedAgency] = useState(null);
  const [agencyDetails, setAgencyDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});
  const [sortBy, setSortBy] = useState('total_owed');
  const [sortOrder, setSortOrder] = useState('DESC');

  useEffect(() => {
    fetchPayoutsSummary();
  }, [sortBy, sortOrder]);

  const fetchPayoutsSummary = async () => {
    try {
      setLoading(true);
      const response = await agencyPayoutsAPI.getSummary({ sortBy, order: sortOrder });
      setAgencies(response.data.data.agencies);
      setSummary(response.data.data.summary);
    } catch (error) {
      console.error('Failed to fetch payouts summary:', error);
      toast.error('Failed to load agency payouts');
    } finally {
      setLoading(false);
    }
  };

  const fetchAgencyDetails = async (agencyId) => {
    try {
      setLoadingDetails(prev => ({ ...prev, [agencyId]: true }));
      const response = await agencyPayoutsAPI.getAgencyDetails(agencyId);
      setAgencyDetails(prev => ({
        ...prev,
        [agencyId]: response.data.data
      }));
    } catch (error) {
      console.error('Failed to fetch agency details:', error);
      toast.error('Failed to load agency details');
    } finally {
      setLoadingDetails(prev => ({ ...prev, [agencyId]: false }));
    }
  };

  const toggleAgencyExpand = async (agencyId) => {
    if (expandedAgency === agencyId) {
      setExpandedAgency(null);
    } else {
      setExpandedAgency(agencyId);
      if (!agencyDetails[agencyId]) {
        await fetchAgencyDetails(agencyId);
      }
    }
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('DESC');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Agency Payouts</h1>
        <p className="text-slate-500 mt-1">Track and manage agency commission payouts</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium mb-1">Total Owed to Agencies</p>
                <h3 className="text-3xl font-bold">${parseFloat(summary.total_owed).toLocaleString()}</h3>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <DollarSign className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium mb-1">Total Agencies</p>
                <h3 className="text-3xl font-bold">{summary.total_agencies}</h3>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <Building2 className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium mb-1">Total Reservations</p>
                <h3 className="text-3xl font-bold">{summary.total_reservations}</h3>
              </div>
              <div className="bg-white/20 p-3 rounded-xl">
                <Calendar className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Agencies Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700 w-8"></th>
                <th
                  className="text-left py-4 px-6 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center gap-2">
                    Agency
                    {sortBy === 'name' && <span>{sortOrder === 'ASC' ? '↑' : '↓'}</span>}
                  </div>
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Contact</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Location</th>
                <th
                  className="text-left py-4 px-6 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('reservations_count')}
                >
                  <div className="flex items-center gap-2">
                    Reservations
                    {sortBy === 'reservations_count' && <span>{sortOrder === 'ASC' ? '↑' : '↓'}</span>}
                  </div>
                </th>
                <th
                  className="text-left py-4 px-6 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('total_owed')}
                >
                  <div className="flex items-center gap-2">
                    Total Owed
                    {sortBy === 'total_owed' && <span>{sortOrder === 'ASC' ? '↑' : '↓'}</span>}
                  </div>
                </th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-slate-700">Commission</th>
                <th
                  className="text-left py-4 px-6 text-sm font-semibold text-slate-700 cursor-pointer hover:bg-slate-100"
                  onClick={() => handleSort('last_reservation')}
                >
                  <div className="flex items-center gap-2">
                    Last Activity
                    {sortBy === 'last_reservation' && <span>{sortOrder === 'ASC' ? '↑' : '↓'}</span>}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {agencies.map((agency) => (
                <React.Fragment key={agency.id}>
                  <tr
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => toggleAgencyExpand(agency.id)}
                  >
                    <td className="py-4 px-6">
                      {expandedAgency === agency.id ? (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-slate-400" />
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white font-semibold">
                          {agency.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{agency.name}</p>
                          {agency.is_verified && (
                            <span className="inline-flex items-center gap-1 text-xs text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              Verified
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="w-3 h-3" />
                          {agency.email}
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-3 h-3" />
                          {agency.phone}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <MapPin className="w-4 h-4" />
                        {agency.city_name}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-sm font-semibold text-slate-900">{agency.reservations_count}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-lg font-bold text-green-600">
                        ${parseFloat(agency.total_owed).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-slate-600">
                        ${parseFloat(agency.total_commission).toLocaleString()}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500">
                      {new Date(agency.last_reservation).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                  </tr>

                  {/* Expanded Details */}
                  {expandedAgency === agency.id && (
                    <tr>
                      <td colSpan="8" className="bg-slate-50 p-6">
                        {loadingDetails[agency.id] ? (
                          <div className="flex items-center justify-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                          </div>
                        ) : agencyDetails[agency.id] ? (
                          <div className="space-y-6">
                            {/* Summary Stats */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              <div className="bg-white rounded-lg p-4 border border-slate-200">
                                <p className="text-sm text-slate-500 mb-1">Total Revenue</p>
                                <p className="text-xl font-bold text-slate-900">
                                  ${parseFloat(agencyDetails[agency.id].summary.total_revenue).toLocaleString()}
                                </p>
                              </div>
                              <div className="bg-white rounded-lg p-4 border border-slate-200">
                                <p className="text-sm text-slate-500 mb-1">Agency Payout</p>
                                <p className="text-xl font-bold text-green-600">
                                  ${parseFloat(agencyDetails[agency.id].summary.total_owed).toLocaleString()}
                                </p>
                              </div>
                              <div className="bg-white rounded-lg p-4 border border-slate-200">
                                <p className="text-sm text-slate-500 mb-1">Platform Commission</p>
                                <p className="text-xl font-bold text-blue-600">
                                  ${parseFloat(agencyDetails[agency.id].summary.total_commission).toLocaleString()}
                                </p>
                              </div>
                              <div className="bg-white rounded-lg p-4 border border-slate-200">
                                <p className="text-sm text-slate-500 mb-1">Status Breakdown</p>
                                <div className="flex gap-2 mt-1 text-xs">
                                  <span className="text-green-600">{agencyDetails[agency.id].summary.confirmed_count} confirmed</span>
                                  <span className="text-yellow-600">{agencyDetails[agency.id].summary.pending_count} pending</span>
                                </div>
                              </div>
                            </div>

                            {/* Reservations Table */}
                            <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                              <div className="px-4 py-3 bg-slate-100 border-b border-slate-200">
                                <h4 className="font-semibold text-slate-900">Reservation Details</h4>
                              </div>
                              <div className="overflow-x-auto">
                                <table className="w-full">
                                  <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr>
                                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700">Reference</th>
                                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700">Customer</th>
                                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700">Activity</th>
                                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700">Date</th>
                                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700">People</th>
                                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700">Total Price</th>
                                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700">Agency Gets</th>
                                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700">Commission</th>
                                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700">Status</th>
                                      <th className="text-left py-3 px-4 text-xs font-semibold text-slate-700">Payment</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {agencyDetails[agency.id].reservations.map((reservation) => (
                                      <tr key={reservation.id} className="border-b border-slate-100 hover:bg-slate-50">
                                        <td className="py-3 px-4 text-xs font-mono text-slate-600">{reservation.reference_code}</td>
                                        <td className="py-3 px-4 text-xs">
                                          <div className="font-medium text-slate-900">{reservation.customer_name}</div>
                                          <div className="text-slate-500">{reservation.customer_email}</div>
                                        </td>
                                        <td className="py-3 px-4 text-xs text-slate-900">{reservation.activity_title}</td>
                                        <td className="py-3 px-4 text-xs text-slate-600">
                                          {new Date(reservation.reservation_date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric'
                                          })}
                                        </td>
                                        <td className="py-3 px-4 text-xs text-slate-600">{reservation.number_of_people}</td>
                                        <td className="py-3 px-4 text-xs font-semibold text-slate-900">
                                          ${parseFloat(reservation.total_price).toFixed(2)}
                                        </td>
                                        <td className="py-3 px-4 text-xs font-bold text-green-600">
                                          ${parseFloat(reservation.agency_payout).toFixed(2)}
                                        </td>
                                        <td className="py-3 px-4 text-xs text-blue-600">
                                          ${parseFloat(reservation.commission_amount).toFixed(2)}
                                          <span className="text-slate-500"> ({reservation.commission_rate}%)</span>
                                        </td>
                                        <td className="py-3 px-4">
                                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                                            {reservation.status}
                                          </span>
                                        </td>
                                        <td className="py-3 px-4">
                                          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(reservation.payment_status)}`}>
                                            {reservation.payment_status}
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-center text-slate-500 py-8">No details available</p>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {agencies.length === 0 && (
          <div className="text-center py-12">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">No agencies with payouts found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgencyPayoutsPage;
