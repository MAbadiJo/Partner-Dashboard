import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const TicketTypesPage = () => {
  const navigate = useNavigate();
  const [ticketTypes, setTicketTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    description: '',
    description_ar: '',
    price: '',
    validity_hours: '24',
    max_quantity: '1',
    is_active: true
  });

  useEffect(() => {
    checkAuthAndLoadData();
  }, []);

  const checkAuthAndLoadData = async () => {
    try {
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser();

      if (authError || !user) {
        navigate('/partner/login');
        return;
      }

      // Match partner by email instead of id to avoid 406 error
      const { data: partnerData, error: partnerError } = await supabase
        .from('partners')
        .select('*')
        .eq('email', user.email)
        .single();

      if (partnerError || !partnerData) {
        console.error('Partner fetch error:', partnerError);
        navigate('/partner/login');
        return;
      }

      // Store partner info locally for later use
      localStorage.setItem('partnerInfo', JSON.stringify(partnerData));

      await loadTicketTypes();
    } catch (error) {
      console.error('Error in checkAuthAndLoadData:', error);
      setError('Authentication failed. Please login again.');
      navigate('/partner/login');
    } finally {
      setLoading(false);
    }
  };

  const loadTicketTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('ticket_types')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading ticket types:', error);
        setError('Failed to load ticket types');
        return;
      }

      setTicketTypes(data || []);
    } catch (error) {
      console.error('Error in loadTicketTypes:', error);
      setError('Failed to load ticket types');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const partnerInfo = JSON.parse(localStorage.getItem('partnerInfo'));

      const ticketTypeData = {
        partner_id: partnerInfo.id,
        name: formData.name,
        name_ar: formData.name_ar,
        description: formData.description,
        description_ar: formData.description_ar,
        price: parseFloat(formData.price),
        validity_hours: parseInt(formData.validity_hours),
        max_quantity: parseInt(formData.max_quantity),
        is_active: formData.is_active
      };

      let result;
      if (editingType) {
        // Update existing ticket type
        const { data, error } = await supabase
          .from('ticket_types')
          .update(ticketTypeData)
          .eq('id', editingType.id)
          .select();

        if (error) throw error;
        result = data[0];
      } else {
        // Create new ticket type
        const { data, error } = await supabase
          .from('ticket_types')
          .insert(ticketTypeData)
          .select();

        if (error) throw error;
        result = data[0];
      }

      await loadTicketTypes();
      resetForm();
      setShowAddForm(false);
      setEditingType(null);
    } catch (error) {
      console.error('Error saving ticket type:', error);
      setError('Failed to save ticket type');
    }
  };

  const handleEdit = (ticketType) => {
    setEditingType(ticketType);
    setFormData({
      name: ticketType.name,
      name_ar: ticketType.name_ar || '',
      description: ticketType.description || '',
      description_ar: ticketType.description_ar || '',
      price: ticketType.price.toString(),
      validity_hours: ticketType.validity_hours.toString(),
      max_quantity: ticketType.max_quantity.toString(),
      is_active: ticketType.is_active
    });
    setShowAddForm(true);
  };

  const handleDelete = async (ticketTypeId) => {
    if (!window.confirm('Are you sure you want to delete this ticket type?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('ticket_types')
        .delete()
        .eq('id', ticketTypeId);

      if (error) throw error;

      await loadTicketTypes();
    } catch (error) {
      console.error('Error deleting ticket type:', error);
      setError('Failed to delete ticket type');
    }
  };

  const toggleActive = async (ticketType) => {
    try {
      const { error } = await supabase
        .from('ticket_types')
        .update({ is_active: !ticketType.is_active })
        .eq('id', ticketType.id);

      if (error) throw error;

      await loadTicketTypes();
    } catch (error) {
      console.error('Error toggling ticket type status:', error);
      setError('Failed to update ticket type status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      name_ar: '',
      description: '',
      description_ar: '',
      price: '',
      validity_hours: '24',
      max_quantity: '1',
      is_active: true
    });
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingType(null);
    resetForm();
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
            <h1 className="text-3xl font-bold text-gray-800">Ticket Types</h1>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              + Add New
            </button>
          </div>
          <p className="text-gray-600">Manage your ticket types and pricing</p>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editingType ? 'Edit Ticket Type' : 'Add New Ticket Type'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name (English)
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Adult Entry"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Name (Arabic)
                  </label>
                  <input
                    type="text"
                    value={formData.name_ar}
                    onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="تذكرة بالغ"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (English)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Full day access to all attractions"
                    rows="3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Arabic)
                  </label>
                  <textarea
                    value={formData.description_ar}
                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="وصول ليوم كامل لجميع المعالم"
                    rows="3"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price (JOD)
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="25.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Validity (Hours)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.validity_hours}
                    onChange={(e) => setFormData({ ...formData, validity_hours: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="24"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Quantity
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.max_quantity}
                    onChange={(e) => setFormData({ ...formData, max_quantity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={formData.is_active ? 'active' : 'inactive'}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.value === 'active' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-purple-600 text-white px-6 py-2 rounded hover:bg-purple-700"
                >
                  {editingType ? 'Update' : 'Create'} Ticket Type
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Ticket Types List */}
        <div className="bg-white rounded-lg shadow-lg">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">Your Ticket Types ({ticketTypes.length})</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-semibold">Name</th>
                    <th className="text-left py-3 px-4 font-semibold">Price</th>
                    <th className="text-left py-3 px-4 font-semibold">Validity</th>
                    <th className="text-left py-3 px-4 font-semibold">Max Qty</th>
                    <th className="text-left py-3 px-4 font-semibold">Status</th>
                    <th className="text-left py-3 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {ticketTypes.map((ticketType) => (
                    <tr key={ticketType.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{ticketType.name}</div>
                          {ticketType.name_ar && (
                            <div className="text-sm text-gray-500">{ticketType.name_ar}</div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">{ticketType.price} JOD</td>
                      <td className="py-3 px-4">{ticketType.validity_hours} hours</td>
                      <td className="py-3 px-4">{ticketType.max_quantity}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            ticketType.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {ticketType.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(ticketType)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => toggleActive(ticketType)}
                            className={`px-3 py-1 rounded text-sm ${
                              ticketType.is_active
                                ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                                : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                          >
                            {ticketType.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDelete(ticketType.id)}
                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketTypesPage;
