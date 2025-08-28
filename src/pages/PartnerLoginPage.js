import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Eye, EyeOff, Lock, Mail, AlertCircle, CheckCircle } from 'lucide-react';

const PartnerLoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      console.log('🔐 Partner login attempt:', email);

      // Step 1: Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        console.error('❌ Auth error:', authError);
        setError('Invalid email or password');
        return;
      }

      console.log('✅ Auth successful for:', email);

      // Step 2: Get the authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error('❌ User error:', userError);
        setError('Authentication failed');
        return;
      }

      console.log('👤 User authenticated:', user.email);

      // Step 3: Check if user exists in partners table
      const { data: partnerData, error: partnerError } = await supabase
        .from('partners')
        .select('id, name, business_name, is_active, is_verified, commission_rate')
        .eq('email', email)
        .eq('is_active', true)
        .single();

      if (partnerError) {
        console.error('🔍 Partner check error:', partnerError);
        
        // If partner not found, try a broader search
        const { data: allPartners, error: searchError } = await supabase
          .from('partners')
          .select('*')
          .eq('email', email);

        if (searchError || !allPartners || allPartners.length === 0) {
          console.error('❌ Partner not found in database');
          setError('Partner account not found. Please contact support.');
          return;
        }

        const partner = allPartners[0];
        if (!partner.is_active) {
          setError('Your account is inactive. Please contact support.');
          return;
        }

        if (!partner.is_verified) {
          setError('Your account is not verified. Please contact support.');
          return;
        }

        // Use the found partner data
        partnerData = partner;
      }

      if (!partnerData) {
        console.error('❌ Partner data is null');
        setError('Partner account not found or inactive');
        return;
      }

      console.log('✅ Partner found:', partnerData.name);

      // Step 4: Store partner info in localStorage
      const partnerInfo = {
        id: partnerData.id,
        email: email,
        name: partnerData.name,
        business_name: partnerData.business_name,
        commission_rate: partnerData.commission_rate,
        loginTime: new Date().toISOString()
      };

      localStorage.setItem('partnerInfo', JSON.stringify(partnerInfo));
      localStorage.setItem('partnerId', partnerData.id);

      setSuccess('Login successful! Redirecting...');
      
      // Step 5: Navigate to partner home
      setTimeout(() => {
        navigate('/partner/home');
      }, 1000);

    } catch (error) {
      console.error('❌ Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e0e7ff, #c7d2fe, #a5b4fc)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '2.5rem 1rem',
      fontFamily: '"Roboto", "Helvetica Neue", Arial, sans-serif',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Subtle background pattern */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.1) 0%, transparent 70%)',
        zIndex: 0,
      }} />

      <header style={{
        width: '100%',
        maxWidth: '900px',
        textAlign: 'center',
        marginBottom: '3rem',
        animation: 'slideDown 0.8s ease-out',
        zIndex: 1,
      }}>
        <h1 style={{
          color: '#4c51bf',
          fontSize: '3.2rem',
          fontWeight: 800,
          margin: 0,
          textShadow: '0 2px 6px rgba(76, 81, 191, 0.1)',
          letterSpacing: '1px',
        }}>BASMAH JO</h1>
        <p style={{
          color: '#64748b',
          fontSize: '1.4rem',
          marginTop: '0.75rem',
          fontWeight: 500,
        }}>Partner Login</p>
      </header>

      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '3rem 2.5rem',
        borderRadius: '20px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
        width: '100%',
        maxWidth: '520px',
        textAlign: 'center',
        animation: 'fadeInUp 0.7s ease-out',
        backdropFilter: 'blur(5px)',
        border: '1px solid rgba(100, 116, 139, 0.1)',
        zIndex: 1,
      }}>
        <h2 style={{
          color: '#4c51bf',
          fontSize: '1.9rem',
          marginBottom: '2.5rem',
          fontWeight: 700,
          letterSpacing: '0.5px',
        }}>Login to Partner Dashboard</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.8rem' }}>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: '1.2rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }}>
              <Mail size={24} />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your Email"
              style={{
                padding: '1.2rem 1.2rem 1.2rem 3.5rem',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '1.1rem',
                width: '100%',
                boxSizing: 'border-box',
                transition: 'all 0.4s ease',
                background: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 500,
                color: '#1e293b',
              }}
              onFocus={e => {
                e.target.style.borderColor = '#4c51bf';
                e.target.style.boxShadow = '0 0 12px rgba(76, 81, 191, 0.1)';
              }}
              onBlur={e => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{
              position: 'absolute',
              left: '1.2rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#94a3b8',
            }}>
              <Lock size={24} />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your Password"
              style={{
                padding: '1.2rem 1.2rem 1.2rem 3.5rem',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '1.1rem',
                width: '100%',
                boxSizing: 'border-box',
                transition: 'all 0.4s ease',
                background: 'rgba(255, 255, 255, 0.9)',
                fontWeight: 500,
                color: '#1e293b',
              }}
              onFocus={e => {
                e.target.style.borderColor = '#4c51bf';
                e.target.style.boxShadow = '0 0 12px rgba(76, 81, 191, 0.1)';
              }}
              onBlur={e => {
                e.target.style.borderColor = '#e2e8f0';
                e.target.style.boxShadow = 'none';
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '1.2rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                transition: 'color 0.3s ease, transform 0.2s ease',
              }}
              onMouseEnter={e => { e.target.style.color = '#4c51bf'; e.target.style.transform = 'scale(1.1)'; }}
              onMouseLeave={e => { e.target.style.color = '#94a3b8'; e.target.style.transform = 'scale(1)'; }}
            >
              {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
            </button>
          </div>
          {error && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '1.2rem',
              background: 'rgba(253, 224, 224, 0.9)',
              border: '1px solid #f87171',
              borderRadius: '12px',
              color: '#991b1b',
              animation: 'slideIn 0.5s ease-out',
              boxShadow: '0 2px 8px rgba(248, 113, 113, 0.1)',
            }}>
              <AlertCircle size={24} style={{ marginRight: '0.8rem' }} />
              <span style={{ fontWeight: 500 }}>{error}</span>
            </div>
          )}
          {success && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '1.2rem',
              background: 'rgba(209, 250, 229, 0.9)',
              border: '1px solid #6ee7b7',
              borderRadius: '12px',
              color: '#047857',
              animation: 'slideIn 0.5s ease-out',
              boxShadow: '0 2px 8px rgba(110, 231, 183, 0.1)',
            }}>
              <CheckCircle size={24} style={{ marginRight: '0.8rem' }} />
              <span style={{ fontWeight: 500 }}>{success}</span>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '1.2rem 2.5rem',
              background: loading ? '#d1d5db' : 'linear-gradient(90deg, #4c51bf, #6366f1)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1.3rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.4s ease',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.2)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
            onMouseEnter={e => !loading && (e.target.style.background = 'linear-gradient(90deg, #3b41a9, #4f52c7)', e.target.style.transform = 'translateY(-3px)')}
            onMouseLeave={e => !loading && (e.target.style.background = 'linear-gradient(90deg, #4c51bf, #6366f1)', e.target.style.transform = 'translateY(0)')}
            onMouseDown={e => !loading && (e.target.style.transform = 'translateY(0)')}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '3px solid white',
                  borderTop: '3px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '1rem',
                }} />
                Signing in...
              </div>
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>

      <footer style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '1.8rem',
        borderRadius: '20px',
        boxShadow: '0 6px 20px rgba(0, 0, 0, 0.05)',
        width: '100%',
        maxWidth: '520px',
        marginTop: '3rem',
        textAlign: 'center',
        color: '#64748b',
        animation: 'fadeInUp 0.7s ease-out 0.2s backwards',
        zIndex: 1,
      }}>
        <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', fontWeight: 500 }}>BASMAH JO</p>
        <p style={{ fontSize: '0.9rem' }}>© 2024 Basmah Jo. All rights reserved.</p>
        <p style={{ fontSize: '0.9rem' }}>
          <a href="mailto:support@basmahjo.com" style={{
            color: '#4c51bf',
            textDecoration: 'none',
            transition: 'color 0.3s ease',
            fontWeight: 500,
          }}
          onMouseEnter={e => e.target.style.color = '#6366f1'}
          onMouseLeave={e => e.target.style.color = '#4c51bf'}
          >For support, contact support@basmahjo.com</a>
        </p>
      </footer>

      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideIn {
            from { opacity: 0; transform: translateX(-30px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default PartnerLoginPage;