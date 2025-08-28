import {
    ArrowLeft,
    BarChart3,
    DollarSign,
    Download,
    Eye,
    Users
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const SummaryPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState({
    totalTickets: 0,
    totalRevenue: 0,
    totalClicks: 0,
    activeTickets: 0,
    usedTickets: 0,
    expiredTickets: 0,
    monthlyRevenue: 0,
    monthlyTickets: 0,
    monthlyClicks: 0,
    topActivities: [],
    recentClicks: [],
    recentTickets: [],
    dailyStats: [],
    weeklyStats: []
  });
  const [dateRange, setDateRange] = useState('30'); // days
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    checkAuthAndLoadSummary();
  }, [dateRange, selectedPeriod]);

  const checkAuthAndLoadSummary = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Authentication error:', authError);
        navigate('/partner/login');
        return;
      }

      const partnerInfo = JSON.parse(localStorage.getItem('partnerInfo') || '{}');
      if (!partnerInfo.id) {
        navigate('/partner/login');
        return;
      }

      await loadSummaryData(partnerInfo.id);

    } catch (error) {
      console.error('Error in checkAuthAndLoadSummary:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSummaryData = async (partnerId) => {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(dateRange));

      // Load ticket statistics
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select('*')
        .eq('partner_id', partnerId)
        .gte('booking_date', startDate.toISOString())
        .lte('booking_date', endDate.toISOString());

      if (ticketsError) throw ticketsError;

      // Load click statistics
      const { data: clicks, error: clicksError } = await supabase
        .from('activity_click_logs')
        .select('*')
        .eq('partner_id', partnerId)
        .gte('clicked_at', startDate.toISOString())
        .lte('clicked_at', endDate.toISOString());

      if (clicksError) throw clicksError;

      // Load partner activities for top activities calculation
      const { data: activities, error: activitiesError } = await supabase
        .from('partner_activities')
        .select('*')
        .eq('partner_id', partnerId);

      if (activitiesError) throw activitiesError;

      // Calculate statistics
      const totalTickets = tickets.length;
      const totalRevenue = tickets.reduce((sum, ticket) => sum + parseFloat(ticket.total_amount), 0);
      const totalClicks = clicks.length;
      const activeTickets = tickets.filter(t => t.status === 'active').length;
      const usedTickets = tickets.filter(t => t.status === 'used').length;
      const expiredTickets = tickets.filter(t => t.status === 'expired').length;

      // Calculate monthly stats (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const monthlyTickets = tickets.filter(t => new Date(t.booking_date) >= thirtyDaysAgo).length;
      const monthlyRevenue = tickets
        .filter(t => new Date(t.booking_date) >= thirtyDaysAgo)
        .reduce((sum, ticket) => sum + parseFloat(ticket.total_amount), 0);
      const monthlyClicks = clicks.filter(c => new Date(c.clicked_at) >= thirtyDaysAgo).length;

      // Calculate top activities by clicks
      const activityClickCounts = {};
      clicks.forEach(click => {
        if (click.activity_id) {
          activityClickCounts[click.activity_id] = (activityClickCounts[click.activity_id] || 0) + 1;
        }
      });

      const topActivities = activities
        .map(activity => ({
          ...activity,
          clickCount: activityClickCounts[activity.id] || 0
        }))
        .sort((a, b) => b.clickCount - a.clickCount)
        .slice(0, 5);

      // Get recent clicks (last 10)
      const recentClicks = clicks
        .sort((a, b) => new Date(b.clicked_at) - new Date(a.clicked_at))
        .slice(0, 10);

      // Get recent tickets (last 10)
      const recentTickets = tickets
        .sort((a, b) => new Date(b.booking_date) - new Date(a.booking_date))
        .slice(0, 10);

      // Calculate daily stats for the selected period
      const dailyStats = calculateDailyStats(tickets, clicks, selectedPeriod);

      // Calculate weekly stats
      const weeklyStats = calculateWeeklyStats(tickets, clicks);

      setSummaryData({
        totalTickets,
        totalRevenue,
        totalClicks,
        activeTickets,
        usedTickets,
        expiredTickets,
        monthlyRevenue,
        monthlyTickets,
        monthlyClicks,
        topActivities,
        recentClicks,
        recentTickets,
        dailyStats,
        weeklyStats
      });

    } catch (error) {
      console.error('Error loading summary data:', error);
    }
  };

  const calculateDailyStats = (tickets, clicks, period) => {
    const days = period === 'week' ? 7 : period === 'month' ? 30 : 90;
    const stats = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayTickets = tickets.filter(t => 
        t.booking_date.split('T')[0] === dateStr
      ).length;
      
      const dayRevenue = tickets
        .filter(t => t.booking_date.split('T')[0] === dateStr)
        .reduce((sum, ticket) => sum + parseFloat(ticket.total_amount), 0);
      
      const dayClicks = clicks.filter(c => 
        c.clicked_at.split('T')[0] === dateStr
      ).length;
      
      stats.push({
        date: dateStr,
        tickets: dayTickets,
        revenue: dayRevenue,
        clicks: dayClicks
      });
    }
    
    return stats;
  };

  const calculateWeeklyStats = (tickets, clicks) => {
    const weeks = [];
    const now = new Date();
    
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      
      const weekTickets = tickets.filter(t => {
        const ticketDate = new Date(t.booking_date);
        return ticketDate >= weekStart && ticketDate <= weekEnd;
      }).length;
      
      const weekRevenue = tickets
        .filter(t => {
          const ticketDate = new Date(t.booking_date);
          return ticketDate >= weekStart && ticketDate <= weekEnd;
        })
        .reduce((sum, ticket) => sum + parseFloat(ticket.total_amount), 0);
      
      const weekClicks = clicks.filter(c => {
        const clickDate = new Date(c.clicked_at);
        return clickDate >= weekStart && clickDate <= weekEnd;
      }).length;
      
      weeks.push({
        week: `Week ${4 - i}`,
        tickets: weekTickets,
        revenue: weekRevenue,
        clicks: weekClicks
      });
    }
    
    return weeks;
  };

  const exportSummaryReport = () => {
    const csvContent = generateCSVReport();
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `summary_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSVReport = () => {
    const headers = [
      'Metric',
      'Value',
      'Period'
    ];
    
    const rows = [
      ['Total Tickets', summaryData.totalTickets, `${dateRange} days`],
      ['Total Revenue', `${summaryData.totalRevenue.toFixed(2)} JOD`, `${dateRange} days`],
      ['Total Clicks', summaryData.totalClicks, `${dateRange} days`],
      ['Active Tickets', summaryData.activeTickets, 'Current'],
      ['Used Tickets', summaryData.usedTickets, 'Current'],
      ['Expired Tickets', summaryData.expiredTickets, 'Current'],
      ['Monthly Revenue', `${summaryData.monthlyRevenue.toFixed(2)} JOD`, 'Last 30 days'],
      ['Monthly Tickets', summaryData.monthlyTickets, 'Last 30 days'],
      ['Monthly Clicks', summaryData.monthlyClicks, 'Last 30 days']
    ];
    
    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading summary data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pt-12 pb-24">
      <div className="px-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/partner/home')}
              className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Summary Dashboard</h1>
              <p className="text-gray-600">Comprehensive overview of your business metrics</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
            >
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
            
            <button
              onClick={exportSummaryReport}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tickets</p>
                <p className="text-3xl font-bold text-gray-800">{summaryData.totalTickets}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">{summaryData.totalRevenue.toFixed(2)} JOD</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Clicks</p>
                <p className="text-3xl font-bold text-purple-600">{summaryData.totalClicks}</p>
              </div>
              <Eye className="h-8 w-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Tickets</p>
                <p className="text-3xl font-bold text-orange-600">{summaryData.activeTickets}</p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Ticket Status</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Active</span>
                <span className="font-semibold text-green-600">{summaryData.activeTickets}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Used</span>
                <span className="font-semibold text-blue-600">{summaryData.usedTickets}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Expired</span>
                <span className="font-semibold text-red-600">{summaryData.expiredTickets}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Monthly Overview</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Revenue</span>
                <span className="font-semibold text-green-600">{summaryData.monthlyRevenue.toFixed(2)} JOD</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Tickets</span>
                <span className="font-semibold text-blue-600">{summaryData.monthlyTickets}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Clicks</span>
                <span className="font-semibold text-purple-600">{summaryData.monthlyClicks}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Conversion Rate</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Clicks to Tickets</span>
                <span className="font-semibold text-purple-600">
                  {summaryData.totalClicks > 0 
                    ? ((summaryData.totalTickets / summaryData.totalClicks) * 100).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Avg. Ticket Value</span>
                <span className="font-semibold text-green-600">
                  {summaryData.totalTickets > 0 
                    ? (summaryData.totalRevenue / summaryData.totalTickets).toFixed(2)
                    : 0} JOD
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Top Activities */}
        <div className="bg-white rounded-xl p-6 shadow-lg mb-8">
          <h3 className="text-lg font-semibold mb-4">Top Activities by Clicks</h3>
          <div className="space-y-3">
            {summaryData.topActivities.map((activity, index) => (
              <div key={activity.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium">{activity.title}</p>
                  <p className="text-sm text-gray-600">{activity.clickCount} clicks</p>
                </div>
                <span className="text-sm text-gray-500">#{index + 1}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Recent Clicks</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {summaryData.recentClicks.map((click, index) => (
                <div key={click.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium">Activity Click</p>
                    <p className="text-xs text-gray-600">
                      {new Date(click.clicked_at).toLocaleString()}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">#{index + 1}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Recent Tickets</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {summaryData.recentTickets.map((ticket, index) => (
                <div key={ticket.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium">{ticket.customer_name}</p>
                    <p className="text-xs text-gray-600">
                      {ticket.total_amount} JOD - {ticket.status}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500">#{index + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryPage; 