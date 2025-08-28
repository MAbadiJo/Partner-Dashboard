import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const SalesAnalytics = () => {
  const [partnerUser, setPartnerUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState({
    daily: [],
    weekly: [],
    monthly: [],
    topActivities: [],
    revenueTrends: []
  });
  const [dateRange, setDateRange] = useState('30'); // days
  const [selectedPeriod, setSelectedPeriod] = useState('daily');
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (partnerUser) {
      fetchAnalytics();
    }
  }, [partnerUser, dateRange, selectedPeriod]);

  const checkAuth = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/partner/login');
        return;
      }

      const storedPartner = localStorage.getItem('partnerUser');
      if (storedPartner) {
        setPartnerUser(JSON.parse(storedPartner));
      }

      setLoading(false);
    } catch (error) {
      console.error('Auth check error:', error);
      navigate('/partner/login');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      // Fetch tickets data
      const { data: tickets, error } = await supabase
        .from('tickets')
        .select(`
          *,
          partner_activities (
            title,
            title_ar
          )
        `)
        .eq('partner_id', partnerUser.id)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Process analytics data
      const processedData = processAnalyticsData(tickets || []);
      setAnalytics(processedData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const processAnalyticsData = (tickets) => {
    const daily = {};
    const weekly = {};
    const monthly = {};
    const activityStats = {};

    tickets.forEach(ticket => {
      const date = new Date(ticket.created_at);
      const dayKey = date.toISOString().split('T')[0];
      const weekKey = `${date.getFullYear()}-W${Math.ceil((date.getDate() + date.getDay()) / 7)}`;
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const activityTitle = ticket.partner_activities?.title || 'Unknown';

      // Daily stats
      if (!daily[dayKey]) {
        daily[dayKey] = { tickets: 0, revenue: 0, commission: 0 };
      }
      daily[dayKey].tickets += 1;
      daily[dayKey].revenue += parseFloat(ticket.price);
      daily[dayKey].commission += parseFloat(ticket.commission_amount || 0);

      // Weekly stats
      if (!weekly[weekKey]) {
        weekly[weekKey] = { tickets: 0, revenue: 0, commission: 0 };
      }
      weekly[weekKey].tickets += 1;
      weekly[weekKey].revenue += parseFloat(ticket.price);
      weekly[weekKey].commission += parseFloat(ticket.commission_amount || 0);

      // Monthly stats
      if (!monthly[monthKey]) {
        monthly[monthKey] = { tickets: 0, revenue: 0, commission: 0 };
      }
      monthly[monthKey].tickets += 1;
      monthly[monthKey].revenue += parseFloat(ticket.price);
      monthly[monthKey].commission += parseFloat(ticket.commission_amount || 0);

      // Activity stats
      if (!activityStats[activityTitle]) {
        activityStats[activityTitle] = { tickets: 0, revenue: 0 };
      }
      activityStats[activityTitle].tickets += 1;
      activityStats[activityTitle].revenue += parseFloat(ticket.price);
    });

    // Convert to arrays and sort
    const dailyArray = Object.entries(daily).map(([date, stats]) => ({
      date,
      ...stats
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    const weeklyArray = Object.entries(weekly).map(([week, stats]) => ({
      week,
      ...stats
    })).sort((a, b) => a.week.localeCompare(b.week));

    const monthlyArray = Object.entries(monthly).map(([month, stats]) => ({
      month,
      ...stats
    })).sort((a, b) => a.month.localeCompare(b.month));

    const topActivities = Object.entries(activityStats)
      .map(([title, stats]) => ({ title, ...stats }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      daily: dailyArray,
      weekly: weeklyArray,
      monthly: monthlyArray,
      topActivities,
      revenueTrends: dailyArray.map(d => ({ date: d.date, revenue: d.revenue }))
    };
  };

  const handleExportReport = async (type) => {
    try {
      const data = analytics[selectedPeriod] || [];
      const csvContent = generateCSV(data, type);
      downloadCSV(csvContent, `${type}_report_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const generateCSV = (data, type) => {
    const headers = ['Date', 'Tickets Sold', 'Revenue (JOD)', 'Commission (JOD)'];
    const rows = data.map(item => [
      item.date || item.week || item.month,
      item.tickets,
      item.revenue.toFixed(2),
      item.commission.toFixed(2)
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getTotalStats = () => {
    const data = analytics[selectedPeriod] || [];
    return data.reduce((acc, item) => ({
      tickets: acc.tickets + item.tickets,
      revenue: acc.revenue + item.revenue,
      commission: acc.commission + item.commission
    }), { tickets: 0, revenue: 0, commission: 0 });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const totalStats = getTotalStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pt-12 pb-24">
      <div className="px-4 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <img src="/lovable-uploads/52d2885b-a83e-43c1-959a-c4bb018bdfb0.png" alt="Basmah Jo" className="h-16 w-auto" />
            </div>
            <button
              onClick={() => navigate('/partner/home')}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Sales Analytics</h1>
          <p className="text-gray-600">Detailed insights into your business performance</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex gap-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">Last 7 days</option>
                <option value="30">Last 30 days</option>
                <option value="90">Last 90 days</option>
                <option value="365">Last year</option>
              </select>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
            <button
              onClick={() => handleExportReport(selectedPeriod)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Export Report
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{totalStats.tickets}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">{totalStats.revenue.toFixed(2)} JOD</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Commission Earned</p>
                <p className="text-2xl font-bold text-gray-900">{totalStats.commission.toFixed(2)} JOD</p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Revenue Trend</h3>
            <div className="space-y-3">
              {analytics[selectedPeriod]?.slice(-10).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">
                      {item.date || item.week || item.month}
                    </div>
                    <div className="text-sm text-gray-600">{item.tickets} tickets</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{item.revenue.toFixed(2)} JOD</div>
                    <div className="text-sm text-gray-600">{item.commission.toFixed(2)} JOD commission</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Activities */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Top Performing Activities</h3>
            <div className="space-y-3">
              {analytics.topActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{activity.title}</div>
                    <div className="text-sm text-gray-600">{activity.tickets} tickets sold</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{activity.revenue.toFixed(2)} JOD</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Detailed {selectedPeriod.charAt(0).toUpperCase() + selectedPeriod.slice(1)} Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {selectedPeriod === 'daily' ? 'Date' : selectedPeriod === 'weekly' ? 'Week' : 'Month'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tickets Sold</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue (JOD)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission (JOD)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Ticket Price</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics[selectedPeriod]?.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.date || item.week || item.month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.tickets}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.revenue.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.commission.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.tickets > 0 ? (item.revenue / item.tickets).toFixed(2) : '0.00'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SalesAnalytics; 