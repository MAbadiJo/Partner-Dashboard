import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const PaymentsPage = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentStats, setPaymentStats] = useState({
    totalEarned: 0,
    totalPaid: 0,
    pendingBalance: 0,
    lastPayment: null
  });

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        navigate('/partner/login');
        return;
      }

      const { data: partnerData, error: partnerError } = await supabase
        .from('partners')
        .select('*')
        .eq('id', user.id)
        .single();

      if (partnerError || !partnerData) {
        navigate('/partner/login');
        return;
      }

      await Promise.all([
        loadPayments(),
        loadPaymentStats()
      ]);

    } catch (error) {
      console.error('Error in checkAuthAndLoadData:', error);
      setError('Authentication failed. Please login again.');
      navigate('/partner/login');
    } finally {
      setLoading(false);
    }
  };

  const loadPayments = async () => {
    try {
      const { data, error } = await supabase
        .from('partner_payments')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading payments:', error);
        setError('Failed to load payments');
        return;
      }

      setPayments(data || []);
    } catch (error) {
      console.error('Error in loadPayments:', error);
      setError('Failed to load payments');
    }
  };

  const loadPaymentStats = async () => {
    try {
      const partnerInfo = JSON.parse(localStorage.getItem('partnerInfo'));
      
      // Calculate total earned from tickets
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('tickets')
        .select('total_amount, status')
        .eq('partner_id', partnerInfo.id);

      if (ticketsError) {
        console.error('Error loading tickets for stats:', ticketsError);
        return;
      }

      const totalEarned = ticketsData?.reduce((sum, ticket) => sum + (ticket.total_amount || 0), 0) || 0;
      
      // Calculate payments
      const totalPaid = payments.reduce((sum, payment) => {
        if (payment.status === 'paid') {
          return sum + (payment.amount || 0);
        }
        return sum;
      }, 0);

      const pendingBalance = totalEarned - totalPaid;
      
      const lastPayment = payments.find(p => p.status === 'paid');

      setPaymentStats({
        totalEarned,
        totalPaid,
        pendingBalance,
        lastPayment
      });

    } catch (error) {
      console.error('Error in loadPaymentStats:', error);
    }
  };

  const requestPayment = async () => {
    try {
      const partnerInfo = JSON.parse(localStorage.getItem('partnerInfo'));
      
      if (paymentStats.pendingBalance <= 0) {
        setError('No pending balance to request payment for');
        return;
      }

      const { error } = await supabase
        .from('partner_payments')
        .insert({
          partner_id: partnerInfo.id,
          amount: paymentStats.pendingBalance,
          payment_type: 'commission',
          status: 'pending',
          notes: 'Payment request from partner portal'
        });

      if (error) throw error;

      // Create notification for admin
      await supabase
        .from('partner_notifications')
        .insert({
          partner_id: partnerInfo.id,
          title: 'Payment Request Submitted',
          title_ar: 'تم تقديم طلب الدفع',
          message: `Payment request for ${paymentStats.pendingBalance.toFixed(2)} JOD has been submitted`,
          message_ar: `تم تقديم طلب دفع بقيمة ${paymentStats.pendingBalance.toFixed(2)} دينار أردني`,
          type: 'info',
          related_type: 'payment'
        });

      await loadPayments();
      await loadPaymentStats();

      alert('Payment request submitted successfully!');

    } catch (error) {
      console.error('Error requesting payment:', error);
      setError('Failed to submit payment request');
    }
  };

  const handleExportPayments = async () => {
    try {
      const data = payments;
      const filename = `payments_${new Date().toISOString().split('T')[0]}.csv`;

      // Create CSV content
      const headers = ['Date', 'Amount', 'Type', 'Status', 'Reference', 'Notes'];
      const rows = data.map(payment => [
        new Date(payment.created_at).toLocaleDateString(),
        payment.amount,
        payment.payment_type,
        payment.status,
        payment.reference_number || '',
        payment.notes || ''
      ]);
      
      const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error('Error exporting payments:', error);
      setError('Failed to export payments');
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded text-xs ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const getPaymentTypeIcon = (type) => {
    switch (type) {
      case 'commission':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
      case 'bonus':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'refund':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 pt-12 pb-24">
      <div className="px-4 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => navigate('/partner/home')}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
            >
              ← Back
            </button>
            <h1 className="text-3xl font-bold text-gray-800">Payments</h1>
            <button
              onClick={handleExportPayments}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Export CSV
            </button>
          </div>
          <p className="text-gray-600">View your payment history and request payments</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Payment Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-gray-800">{paymentStats.totalEarned.toFixed(2)} JOD</div>
            <div className="text-sm text-gray-600">Total Earned</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-gray-800">{paymentStats.totalPaid.toFixed(2)} JOD</div>
            <div className="text-sm text-gray-600">Total Paid</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{paymentStats.pendingBalance.toFixed(2)} JOD</div>
            <div className="text-sm text-gray-600">Pending Balance</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {paymentStats.lastPayment ? paymentStats.lastPayment.amount.toFixed(2) : '0.00'} JOD
            </div>
            <div className="text-sm text-gray-600">Last Payment</div>
          </div>
        </div>

        {/* Request Payment */}
        {paymentStats.pendingBalance > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-2">Request Payment</h3>
                <p className="text-gray-600">
                  You have {paymentStats.pendingBalance.toFixed(2)} JOD pending. Request a payment to receive your earnings.
                </p>
              </div>
              <button
                onClick={requestPayment}
                className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
              >
                Request Payment
              </button>
            </div>
          </div>
        )}

        {/* Payment History */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Payment History ({payments.length})</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Date</th>
                    <th className="text-left py-3 px-4 font-semibold">Type</th>
                    <th className="text-left py-3 px-4 font-semibold">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Reference</th>
                    <th className="text-left py-3 px-4 font-semibold">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(payment.created_at).toLocaleTimeString()}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          {getPaymentTypeIcon(payment.payment_type)}
                          <span className="capitalize">{payment.payment_type}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium">{payment.amount} JOD</td>
                      <td className="py-3 px-4">{getStatusBadge(payment.status)}</td>
                      <td className="py-3 px-4 text-sm">
                        {payment.reference_number || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {payment.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {payments.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <p>No payment history found</p>
              </div>
            )}
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Payment Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Commission Rate</h4>
              <p className="text-gray-600">
                Your commission rate is {JSON.parse(localStorage.getItem('partnerInfo'))?.commission_rate || 10}% of each ticket sale.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Payment Schedule</h4>
              <p className="text-gray-600">
                Payments are processed monthly. You can request a payment when you have a pending balance.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Payment Methods</h4>
              <p className="text-gray-600">
                Payments are made via bank transfer to your registered account.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-2">Contact Support</h4>
              <p className="text-gray-600">
                For payment inquiries, contact support at payments@basmahjo.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage; 