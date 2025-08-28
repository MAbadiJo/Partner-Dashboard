import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

const ProfilePage = () => {
  const [partnerUser, setPartnerUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    name_ar: '',
    phone: '',
    business_name: '',
    business_name_ar: '',
    business_address: '',
    business_address_ar: '',
    commission_rate: 12.00
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (partnerUser) {
      fetchProfileData();
    }
  }, [partnerUser]);

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

  const fetchProfileData = async () => {
    try {
      const { data, error } = await supabase
        .from('partners')
        .select('*')
        .eq('id', partnerUser.id)
        .single();

      if (error) throw error;

      setProfileData({
        name: data.name || '',
        name_ar: data.name_ar || '',
        phone: data.phone || '',
        business_name: data.business_name || '',
        business_name_ar: data.business_name_ar || '',
        business_address: data.business_address || '',
        business_address_ar: data.business_address_ar || '',
        commission_rate: data.commission_rate || 12.00
      });
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!profileData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!profileData.name_ar.trim()) {
      newErrors.name_ar = 'Arabic name is required';
    }
    if (!profileData.business_name.trim()) {
      newErrors.business_name = 'Business name is required';
    }
    if (!profileData.business_name_ar.trim()) {
      newErrors.business_name_ar = 'Arabic business name is required';
    }
    if (!profileData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }
    if (profileData.commission_rate < 0 || profileData.commission_rate > 100) {
      newErrors.commission_rate = 'Commission rate must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      const { error } = await supabase
        .from('partners')
        .update({
          name: profileData.name.trim(),
          name_ar: profileData.name_ar.trim(),
          phone: profileData.phone.trim(),
          business_name: profileData.business_name.trim(),
          business_name_ar: profileData.business_name_ar.trim(),
          business_address: profileData.business_address.trim(),
          business_address_ar: profileData.business_address_ar.trim(),
          commission_rate: parseFloat(profileData.commission_rate),
          updated_at: new Date().toISOString()
        })
        .eq('id', partnerUser.id);

      if (error) throw error;

      // Update localStorage
      const updatedPartner = {
        ...partnerUser,
        name: profileData.name.trim(),
        business_name: profileData.business_name.trim(),
        commission_rate: parseFloat(profileData.commission_rate)
      };
      localStorage.setItem('partnerUser', JSON.stringify(updatedPartner));
      setPartnerUser(updatedPartner);

      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const newPassword = prompt('Enter new password:');
    if (!newPassword) return;

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      alert('Password updated successfully!');
    } catch (error) {
      console.error('Error changing password:', error);
      alert('Error changing password. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 pt-12 pb-24">
      <div className="px-4 max-w-4xl mx-auto">
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Partner Profile</h1>
          <p className="text-gray-600">Manage your personal and business information</p>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name (English) *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter your full name"
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name (Arabic) *
                  </label>
                  <input
                    type="text"
                    name="name_ar"
                    value={profileData.name_ar}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.name_ar ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="أدخل اسمك الكامل"
                    dir="rtl"
                  />
                  {errors.name_ar && <p className="text-red-500 text-sm mt-1">{errors.name_ar}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profileData.phone}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="+962 79 123 4567"
                  />
                  {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={partnerUser?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                    placeholder="Email address"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Business Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name (English) *
                  </label>
                  <input
                    type="text"
                    name="business_name"
                    value={profileData.business_name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.business_name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter business name"
                  />
                  {errors.business_name && <p className="text-red-500 text-sm mt-1">{errors.business_name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Name (Arabic) *
                  </label>
                  <input
                    type="text"
                    name="business_name_ar"
                    value={profileData.business_name_ar}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.business_name_ar ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="أدخل اسم الشركة"
                    dir="rtl"
                  />
                  {errors.business_name_ar && <p className="text-red-500 text-sm mt-1">{errors.business_name_ar}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Address (English)
                  </label>
                  <textarea
                    name="business_address"
                    value={profileData.business_address}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter business address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Business Address (Arabic)
                  </label>
                  <textarea
                    name="business_address_ar"
                    value={profileData.business_address_ar}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="أدخل عنوان الشركة"
                    dir="rtl"
                  />
                </div>
              </div>
            </div>

            {/* Commission Rate */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Commission Settings</h3>
              <div className="max-w-md">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commission Rate (%) *
                </label>
                <input
                  type="number"
                  name="commission_rate"
                  value={profileData.commission_rate}
                  onChange={handleInputChange}
                  min="0"
                  max="100"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.commission_rate ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="12.00"
                />
                {errors.commission_rate && <p className="text-red-500 text-sm mt-1">{errors.commission_rate}</p>}
                <p className="text-xs text-gray-500 mt-1">This is the percentage you earn from each ticket sale</p>
              </div>
            </div>

            {/* Account Status */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Account Status</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Account Status</p>
                    <p className="text-sm text-green-600 font-medium">Active</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Verification Status</p>
                    <p className="text-sm text-green-600 font-medium">Verified</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Member Since</p>
                    <p className="text-sm text-gray-600">{new Date(partnerUser?.loginTime).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Partner ID</p>
                    <p className="text-sm text-gray-600 font-mono">{partnerUser?.id}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <button
                onClick={handleChangePassword}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Change Password
              </button>
              <div className="flex space-x-4">
                <button
                  onClick={() => navigate('/partner/home')}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 