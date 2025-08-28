// C:\projects\basmahjo-partners\src\pages\UpdatedPartnerHomePage.js
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

/* --------------------- Enhanced Modern Styling --------------------- */
function StyleTag() {
  return (
    <style>{`
      * { box-sizing: border-box; margin: 0; padding: 0; }

      :root {
        --primary: #6366f1;
        --primary-light: #8b5cf6;
        --primary-dark: #4f46e5;
        --secondary: #f8fafc;
        --background: #f1f5f9;
        --surface: #ffffff;
        --text: #0f172a;
        --text-muted: #64748b;
        --text-light: #94a3b8;
        --border: #e2e8f0;
        --border-light: #f1f5f9;
        --success: #10b981;
        --warning: #f59e0b;
        --danger: #ef4444;
        --info: #3b82f6;
        --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        --radius: 12px;
        --radius-lg: 16px;
      }

      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: var(--background);
        color: var(--text);
        line-height: 1.6;
      }

      .app { display: flex; min-height: 100vh; }

      /* Sidebar */
      .sidebar {
        width: 280px;
        background: var(--surface);
        border-right: 1px solid var(--border);
        display: flex;
        flex-direction: column;
        position: fixed;
        height: 100vh;
        left: 0; top: 0; z-index: 100;
      }

      .sidebar-header { padding: 24px 20px; border-bottom: 1px solid var(--border-light); }
      .logo { display: flex; align-items: center; gap: 12px; }
      .logo-icon {
        width: 40px; height: 40px;
        background: linear-gradient(135deg, var(--primary), var(--primary-light));
        border-radius: 10px; display: flex; align-items: center; justify-content: center;
        color: white; font-weight: 700; font-size: 16px;
      }
      .logo-text { font-weight: 700; font-size: 18px; color: var(--text); }

      .sidebar-nav { padding: 20px 16px; flex: 1; }
      .nav-item {
        display: flex; align-items: center; gap: 12px; width: 100%;
        padding: 12px 16px; margin-bottom: 4px; border: none; background: transparent;
        border-radius: var(--radius); cursor: pointer; transition: all .2s ease;
        color: var(--text-muted); font-size: 14px; font-weight: 500;
      }
      .nav-item:hover { background: var(--secondary); color: var(--text); }
      .nav-item.active {
        background: linear-gradient(135deg, var(--primary), var(--primary-light));
        color: white; box-shadow: var(--shadow);
      }
      .nav-icon { font-size: 18px; width: 20px; text-align: center; }

      .sidebar-footer {
        padding: 20px 16px; border-top: 1px solid var(--border-light);
        display: flex; flex-direction: column; gap: 8px;
      }
      .sidebar-action {
        display: flex; align-items: center; gap: 8px; padding: 10px 12px;
        border: 1px solid var(--border); background: var(--surface); border-radius: var(--radius);
        cursor: pointer; font-size: 13px; color: var(--text-muted); transition: all .2s ease;
      }
      .sidebar-action:hover { border-color: var(--primary); color: var(--primary); }
      .sidebar-action.logout:hover { border-color: var(--danger); color: var(--danger); background: #fef2f2; }

      /* Main Content */
      .main-content { flex: 1; margin-left: 280px; padding: 0; }
      .top-header {
        background: var(--surface); padding: 24px 32px; border-bottom: 1px solid var(--border);
        display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 50;
      }
      .page-title { font-size: 28px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
      .page-subtitle { color: var(--text-muted); font-size: 14px; }
      .header-actions { display: flex; gap: 12px; }

      /* Buttons */
      .btn {
        display: inline-flex; align-items: center; gap: 8px; padding: 10px 16px;
        border: 1px solid var(--border); background: var(--surface); color: var(--text);
        border-radius: var(--radius); font-size: 14px; font-weight: 500; cursor: pointer; transition: all .2s ease;
        text-decoration: none;
      }
      .btn:hover { box-shadow: var(--shadow); transform: translateY(-1px); }
      .btn.primary { background: linear-gradient(135deg, var(--primary), var(--primary-light)); color: white; border-color: transparent; }
      .btn.ghost { background: var(--secondary); border-color: var(--border-light); }
      .btn.outline { background: transparent; border-color: var(--primary); color: var(--primary); }
      .btn.danger { background: var(--danger); color: white; border-color: transparent; }
      .btn.large { padding: 14px 24px; font-size: 16px; }
      .btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }

      /* Content Areas */
      .content-area { padding: 32px; max-width: none; }
      .filters-section {
        background: var(--surface); padding: 24px 32px; border-bottom: 1px solid var(--border);
        display: flex; justify-content: space-between; align-items: flex-end; gap: 20px;
      }
      .filter-group { display: flex; gap: 20px; align-items: flex-end; }
      .filter-item { display: flex; flex-direction: column; gap: 6px; }
      .filter-search { flex: 1; min-width: 300px; }
      .filter-item label { font-size: 13px; font-weight: 500; color: var(--text-muted); }
      .filter-item input {
        padding: 10px 12px; border: 1px solid var(--border); border-radius: var(--radius);
        background: var(--surface); font-size: 14px;
      }
      .filter-item input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99,102,241,.1); }

      /* KPIs */
      .kpis-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px,1fr)); gap: 20px; margin-bottom: 32px; }
      .kpi-card {
        background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg);
        padding: 24px; box-shadow: var(--shadow); transition: all .2s ease;
      }
      .kpi-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-2px); }
      .kpi-card.highlight { background: linear-gradient(135deg, #fef7ff, #f3e8ff); border-color: var(--primary-light); }
      .kpi-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
      .kpi-icon { font-size: 24px; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; background: var(--secondary); border-radius: 10px; }
      .kpi-label { font-size: 14px; color: var(--text-muted); font-weight: 500; }
      .kpi-value { font-size: 32px; font-weight: 700; color: var(--text); line-height: 1; }

      /* Data Cards + Tables */
      .data-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow); margin-bottom: 24px; overflow: hidden; }
      .card-header { padding: 24px; border-bottom: 1px solid var(--border-light); }
      .card-header h3 { font-size: 18px; font-weight: 600; color: var(--text); margin-bottom: 4px; }
      .card-subtitle { font-size: 14px; color: var(--text-muted); }
      .table-container { overflow-x: auto; }
      .modern-table { width: 100%; border-collapse: collapse; }
      .modern-table th, .modern-table td { padding: 16px; text-align: left; border-bottom: 1px solid var(--border-light); }
      .modern-table th {
        background: var(--secondary); font-weight: 600; font-size: 13px; color: var(--text-muted);
        text-transform: uppercase; letter-spacing: .05em; position: sticky; top: 0;
      }
      .modern-table tbody tr:hover { background: var(--secondary); }
      .table-footer { padding: 16px 24px; background: var(--secondary); font-size: 13px; color: var(--text-muted); }

      /* Ticket Info */
      .ticket-info { display: flex; flex-direction: column; gap: 4px; }
      .ticket-id { font-family: 'Fira Code', monospace; font-weight: 600; font-size: 14px; display: flex; align-items: center; gap: 8px; }
      .new-badge { background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; }
      .ticket-name { font-size: 13px; color: var(--text-muted); }
      .customer-info, .purchase-info { display: flex; flex-direction: column; gap: 2px; }
      .customer-name { font-weight: 500; font-size: 14px; }
      .customer-contact { font-size: 12px; color: var(--text-muted); }
      .price { font-weight: 600; font-size: 14px; color: var(--success); }
      .payment-method, .purchase-date { font-size: 12px; color: var(--text-muted); }

      /* Status Badge + Actions */
      .status-badge { display: inline-flex; align-items: center; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; border: 1px solid; }
      .action-btn {
        background: linear-gradient(135deg, var(--primary), var(--primary-light));
        color: white; border: none; padding: 8px 16px; border-radius: var(--radius); font-size: 13px; font-weight: 500;
        cursor: pointer; transition: all .2s ease;
      }
      .action-btn:hover:not(.disabled) { box-shadow: var(--shadow); transform: translateY(-1px); }
      .action-btn.disabled { background: var(--border); color: var(--text-light); cursor: not-allowed; }

      /* Audit */
      .audit-col { max-width: 260px; }
      .audit-info { font-size: 12px; color: var(--text-muted); line-height: 1.4; }
      .audit-actor { font-weight: 500; color: var(--text); }
      .audit-date, .audit-cash { color: var(--text-muted); }

      /* Activities */
      .activities-header { text-align: center; margin-bottom: 32px; }
      .activities-header h2 { font-size: 32px; font-weight: 700; margin-bottom: 8px; color: var(--text); }
      .activities-header p { font-size: 16px; color: var(--text-muted); }
      .activities-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 24px; }
      .activity-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow); transition: all .3s ease; }
      .activity-card:hover { box-shadow: var(--shadow-lg); transform: translateY(-4px); }
      .activity-media { position: relative; height: 200px; overflow: hidden; }
      .activity-image { width: 100%; height: 100%; object-fit: cover; }
      .activity-placeholder { width: 100%; height: 100%; background: var(--secondary); display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); }
      .placeholder-icon { font-size: 48px; margin-bottom: 8px; }
      .activity-badges { position: absolute; top: 12px; right: 12px; display: flex; flex-direction: column; gap: 6px; }
      .badge-featured, .badge-popular, .badge-new, .badge-inactive { padding: 4px 8px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
      .badge-featured { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; }
      .badge-popular { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; }
      .badge-new { background: linear-gradient(135deg, #10b981, #059669); color: white; }
      .badge-inactive { background: var(--border); color: var(--text-muted); }
      .activity-content { padding: 24px; }
      .activity-header { margin-bottom: 16px; }
      .activity-title { font-size: 20px; font-weight: 700; color: var(--text); margin-bottom: 4px; }
      .activity-title-ar { font-size: 16px; color: var(--text-muted); margin-bottom: 8px; }
      .activity-rating { display: flex; align-items: center; gap: 8px; }
      .rating-stars { color: #fbbf24; }
      .rating-value { font-weight: 600; color: var(--text); }
      .rating-count { color: var(--text-muted); font-size: 14px; }
      .activity-description { margin-bottom: 20px; color: var(--text-muted); line-height: 1.6; }
      .description-ar { font-style: italic; margin-top: 8px; }

      .activity-details { margin-bottom: 20px; }
      .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid var(--border-light); }
      .detail-row:last-child { border-bottom: none; }
      .detail-label { font-weight: 500; color: var(--text); }

      .tickets-section, .payment-methods, .terms-section, .gallery-section { margin-bottom: 20px; }
      .tickets-section h4, .payment-methods h4, .terms-section h4, .gallery-section h4 { font-size: 16px; font-weight: 600; color: var(--text); margin-bottom: 12px; }
      .tickets-list { display: flex; flex-direction: column; gap: 8px; }
      .ticket-option { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--secondary); border-radius: var(--radius); border: 1px solid var(--border-light); }
      .ticket-option .ticket-name { font-weight: 500; color: var(--text); }
      .ticket-option .ticket-price { font-weight: 600; color: var(--success); }
      .payment-tags { display: flex; flex-wrap: wrap; gap: 8px; }
      .payment-tag { background: var(--secondary); color: var(--text); padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 500; border: 1px solid var(--border); }

      .terms-content {
        background: var(--secondary); padding: 16px; border-radius: var(--radius);
        border: 1px solid var(--border-light); font-size: 14px; line-height: 1.5; color: var(--text-muted);
      }
      .terms-ar { margin-top: 12px; font-style: italic; }

      .gallery-preview { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
      .gallery-thumb { aspect-ratio: 1; border-radius: var(--radius); overflow: hidden; background: var(--secondary); }
      .gallery-thumb img { width: 100%; height: 100%; object-fit: cover; }
      .gallery-more { aspect-ratio: 1; background: var(--border); display: flex; align-items: center; justify-content: center; font-weight: 600; color: var(--text-muted); border-radius: var(--radius); }

      .activity-meta { display: flex; justify-content: space-between; margin-bottom: 16px; padding: 16px; background: var(--secondary); border-radius: var(--radius); }
      .meta-item { display: flex; flex-direction: column; gap: 4px; }
      .meta-item span:first-child { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: .05em; font-weight: 500; }
      .meta-item span:last-child { font-weight: 600; color: var(--text); }
      .status.active { color: var(--success); }
      .status.inactive { color: var(--danger); }
      .social-links { display: flex; gap: 12px; }
      .social-link { text-decoration: none; color: var(--text-muted); font-size: 14px; padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius); transition: all .2s ease; }
      .social-link:hover { color: var(--primary); border-color: var(--primary); background: #f8fafc; }

      /* Analytics */
      .analytics-header { text-align: center; margin-bottom: 32px; }
      .analytics-header h2 { font-size: 32px; font-weight: 700; margin-bottom: 8px; color: var(--text); }
      .analytics-header p { font-size: 16px; color: var(--text-muted); }
      .analytics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 24px; }
      .chart-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow); }
      .chart-card.full-width { grid-column: 1 / -1; }
      .metric-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 24px; box-shadow: var(--shadow); text-align: center; }
      .metric-header { display: flex; align-items: center; justify-content: center; gap: 12px; margin-bottom: 20px; }
      .metric-header h3 { font-size: 18px; font-weight: 600; color: var(--text); }
      .metric-icon { font-size: 24px; }
      .big-metric { font-size: 48px; font-weight: 700; color: var(--text); margin-bottom: 12px; line-height: 1; }
      .metric-footer { font-size: 14px; color: var(--text-muted); }
      .chart-summary { text-align: center; margin-top: 16px; padding: 12px; background: var(--secondary); border-radius: var(--radius); font-size: 14px; color: var(--text-muted); }
      .top-list { display: flex; flex-direction: column; gap: 12px; padding: 16px 0; }
      .top-item { display: flex; align-items: center; gap: 16px; padding: 12px; background: var(--secondary); border-radius: var(--radius); }
      .rank { font-weight: 700; color: var(--primary); min-width: 32px; text-align: center; }
      .item-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
      .item-name { font-weight: 500; color: var(--text); }
      .item-value { font-size: 14px; color: var(--text-muted); }
      .mini-chart { display: flex; align-items: center; justify-content: center; height: 200px; padding: 16px; }
      .gauge svg { max-width: 100%; height: auto; }

      /* Profile */
      .profile-section { max-width: 600px; margin: 0 auto; }
      .profile-header { text-align: center; margin-bottom: 32px; }
      .profile-header h2 { font-size: 32px; font-weight: 700; margin-bottom: 8px; color: var(--text); }
      .profile-header p { font-size: 16px; color: var(--text-muted); }
      .profile-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); box-shadow: var(--shadow); overflow: hidden; }
      .profile-form { padding: 24px; }
      .form-group { margin-bottom: 20px; }
      .form-group label { display: block; font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 8px; }
      .form-group input, .form-group textarea {
        width: 100%; padding: 12px 16px; border: 1px solid var(--border); border-radius: var(--radius);
        background: var(--surface); font-size: 14px; color: var(--text); transition: all .2s ease;
      }
      .form-group input:focus, .form-group textarea:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(99,102,241,.1); }

      /* States */
      .loading-state, .error-state { margin: 40px; font-size: 14px; }
      .spinner {
        width: 18px; height: 18px; border: 3px solid var(--border);
        border-top-color: var(--primary); border-radius: 50%; display: inline-block; margin-right: 8px;
        animation: spin .8s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
      .required { color: var(--danger); margin-left: 4px; font-weight: 700; }

      /* Modal */
      .modal-overlay {
        position: fixed; inset: 0; background: rgba(15, 23, 42, .5);
        display: flex; align-items: center; justify-content: center; z-index: 200;
      }
      .modal-container {
        width: 100%; max-width: 560px; background: var(--surface); border: 1px solid var(--border);
        border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); overflow: hidden;
      }
      .modal-header {
        display: flex; align-items: center; justify-content: space-between;
        padding: 16px 20px; border-bottom: 1px solid var(--border-light);
      }
      .modal-header h3 { font-size: 18px; font-weight: 700; }
      .modal-close { border: none; background: transparent; font-size: 20px; cursor: pointer; color: var(--text-muted); }
      .modal-content { padding: 20px; }
      .modal-warning { margin-top: 10px; padding: 10px 12px; background: #fff7ed; border: 1px solid #fed7aa; color: #9a3412; border-radius: 8px; font-size: 13px; }
      .modal-actions { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 20px; border-top: 1px solid var(--border-light); }
    `}</style>
  );
}

/* --------------------- Constants & Helpers --------------------- */
const TABS = {
  SALES: 'SALES',
  ACTIVITIES: 'ACTIVITIES',
  ANALYTICS: 'ANALYTICS',
  PROFILE: 'PROFILE',
};

const STATUS_UI = {
  valid: { label: 'Active', color: '#10b981' },        // emerald
  used: { label: 'Used', color: '#6366f1' },           // indigo
  cancelled: { label: 'Cancelled', color: '#ef4444' }, // red
};

const dateToISODate = (d) => d.toISOString().slice(0, 10);
const isCashMethod = (s='') => /cash/i.test(String(s || ''));

/* Try to split "Name — Note..." into {name, note} if formatted that way */
function parseActivatedBy(text) {
  if (!text) return { name: '', note: '' };
  const parts = String(text).split(' — ');
  if (parts.length > 1) {
    return { name: parts.shift() || '', note: parts.join(' — ') };
  }
  return { name: text, note: '' };
}

/* --------------------- Main Page --------------------- */
export default function UpdatedPartnerHomePage() {
  const navigate = useNavigate();

  // auth/partner
  const [user, setUser] = useState(null);
  const [partner, setPartner] = useState(null);

  // data
  const [activities, setActivities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);

  // clicks (analytics)
  const [clickLogs, setClickLogs] = useState([]);

  // ui
  const [tab, setTab] = useState(TABS.SALES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // filters
  const today = new Date();
  const start = new Date(); start.setDate(today.getDate() - 30);
  const [fromDate, setFromDate] = useState(dateToISODate(start));
  const [toDate, setToDate] = useState(dateToISODate(today));
  const [query, setQuery] = useState('');

  // mark-used modal
  const [markModal, setMarkModal] = useState({
    open: false,
    ticket: null,
    note: '',
    actorName: '',
    cashAmount: '',
    saving: false,
  });

  // profile form
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', email: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  /* --------------------- LOAD: initial --------------------- */
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true); setError('');
      try {
        // 1) session
        const { data: authData, error: authErr } = await supabase.auth.getUser();
        if (authErr) throw authErr;
        const currentUser = authData?.user;
        if (!currentUser) return navigate('/login');
        if (!mounted) return;
        setUser(currentUser);

        // 2) partner
        const { data: partnerRow, error: pErr } = await supabase
          .from('partners').select('*').eq('email', currentUser.email).maybeSingle();
        if (pErr) throw pErr;
        if (!partnerRow) throw new Error('Partner record not found.');
        if (!mounted) return;
        setPartner(partnerRow);
        setProfileForm({
          name: partnerRow.name || '',
          phone: partnerRow.phone || '',
          email: partnerRow.email || '',
        });

        // 3) partner activities
        const { data: actRows, error: aErr } = await supabase
          .from('activities')
          .select('*')
          .eq('partner_id', partnerRow.id)
          .order('created_at', { ascending: false });
        if (aErr) throw aErr;
        if (!mounted) return;
        setActivities(actRows || []);
      } catch (e) {
        if (!mounted) return;
        setError(e.message || 'Failed to load.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- reload bookings/tickets/clicks when date/tab changes ---- */
  useEffect(() => {
    if (!partner) return;
    (async () => {
      try {
        setLoading(true); setError('');
        const activityIds = (activities || []).map(a => a.id);
        let loadedBookings = [];
        if (activityIds.length) {
          const { data: bRows, error: bErr } = await supabase
            .from('bookings')
            .select('id, activity_id, created_at, payment_method, customer_name, customer_email, customer_phone, short_booking_id')
            .in('activity_id', activityIds)
            .gte('created_at', new Date(fromDate).toISOString())
            .lte('created_at', new Date(new Date(toDate).setHours(23,59,59,999)).toISOString())
            .order('created_at', { ascending: false });
          if (bErr) throw bErr;
          loadedBookings = bRows || [];
        }
        setBookings(loadedBookings);

        const bookingIds = loadedBookings.map(b => b.id);
        let loadedTickets = [];
        if (bookingIds.length) {
          const { data: tRows, error: tErr } = await supabase
            .from('tickets')
            .select('id, booking_id, short_booking_id, ticket_id, full_ticket_id, ticket_name, unit_price, service_fee, total_price, status, collected_amount, activated_by, activated_at, created_at')
            .in('booking_id', bookingIds)
            .order('created_at', { ascending: false });
          if (tErr) throw tErr;
          loadedTickets = tRows || [];
        }
        setTickets(loadedTickets);

        // Clicks analytics (by partner)
        if (tab === TABS.ANALYTICS) {
          const { data: clicks, error: cErr } = await supabase
            .from('activity_click_logs')
            .select('activity_id, clicked_at')
            .eq('partner_id', partner.id)
            .gte('clicked_at', new Date(fromDate).toISOString())
            .lte('clicked_at', new Date(new Date(toDate).setHours(23,59,59,999)).toISOString());
          if (cErr) throw cErr;
          setClickLogs(clicks || []);
        }
      } catch (e) {
        console.error(e);
        setError(e.message || 'Failed to refresh.');
      } finally {
        setLoading(false);
      }
    })();
  }, [partner, activities, fromDate, toDate, tab]);

  /* --------------------- DERIVED --------------------- */
  const bookingMap = useMemo(() => {
    const m = new Map();
    bookings.forEach(b => m.set(b.id, b));
    return m;
  }, [bookings]);

  const rows = useMemo(() => {
    const arr = tickets.map(t => {
      const b = bookingMap.get(t.booking_id);
      const created = b?.created_at ? new Date(b.created_at) : new Date(t.created_at || Date.now());
      const isNew = (Date.now() - created.getTime()) < 1000*60*60*48;
      const paymentMethod = b?.payment_method || '—';
      const price = Number(t.total_price ?? t.unit_price ?? 0);
      const { name: actName, note: actNote } = parseActivatedBy(t.activated_by);

      return {
        id: t.id,
        fullTicketId: t.full_ticket_id || `${t.short_booking_id}-${t.ticket_id}`,
        ticketName: t.ticket_name,
        dateOfPurchase: created,
        price,
        collectedAmount: Number(t.collected_amount ?? 0),
        paymentMethod,
        isCash: isCashMethod(paymentMethod),
        customerName: b?.customer_name || '—',
        customerEmail: b?.customer_email || '—',
        customerPhone: b?.customer_phone || '—',
        status: t.status || 'valid',
        isNew,
        lastAction: t.activated_at ? {
          actorName: actName || '',
          note: actNote || '',
          when: new Date(t.activated_at)
        } : null
      };
    }).filter(r => {
      if (!query.trim()) return true;
      const q = query.trim().toLowerCase();
      return (
        r.fullTicketId?.toLowerCase().includes(q) ||
        r.ticketName?.toLowerCase().includes(q) ||
        r.customerName?.toLowerCase().includes(q)
      );
    }).sort((a,b) => b.dateOfPurchase - a.dateOfPurchase);
    return arr;
  }, [tickets, bookingMap, query]);

  // metrics: used amount = cash -> collectedAmount; else price
  const metrics = useMemo(() => {
    const m = { totalTickets: rows.length, usedCount: 0, usedAmount: 0, activeCount: 0, cancelledCount: 0 };
    rows.forEach(r => {
      if (r.status === 'used') {
        m.usedCount += 1;
        m.usedAmount += r.isCash ? Number(r.collectedAmount || 0) : Number(r.price || 0);
      } else if (r.status === 'valid') m.activeCount += 1;
      else if (r.status === 'cancelled') m.cancelledCount += 1;
    });
    return m;
  }, [rows]);

  /* --------------------- ACTIONS --------------------- */
  const openMarkUsed = (row) => {
    setMarkModal({
      open: true,
      ticket: row,
      note: '',
      actorName: '',
      cashAmount: row.isCash ? String(row.collectedAmount || '') : '',
      saving: false,
    });
  };
  const closeMarkUsed = () => setMarkModal({ open: false, ticket: null, note: '', actorName: '', cashAmount: '', saving: false });

  const confirmMarkUsed = async () => {
    if (!markModal.ticket || !partner || !user) return;

    if (!markModal.actorName.trim()) { alert('Please enter your name.'); return; }
    if (markModal.ticket.isCash) {
      const amt = Number(markModal.cashAmount);
      if (!isFinite(amt) || amt < 0) { alert('Enter a valid Cash Collected amount.'); return; }
    }
    if (!markModal.note.trim()) { alert('Please add a note.'); return; }

    setMarkModal(s => ({ ...s, saving: true }));

    try {
      // ensure still active
      const { data: cur, error: cErr } = await supabase.from('tickets').select('status').eq('id', markModal.ticket.id).maybeSingle();
      if (cErr) throw cErr;
      if (!cur) throw new Error('Ticket not found.');
      if (cur.status !== 'valid') throw new Error('Only Active tickets can be marked as Used.');

      const auditText = `${markModal.actorName.trim()} — ${markModal.note.trim()}`; // saved in activated_by

      const updateObj = {
        status: 'used',
        activated_by: auditText,
        activated_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      if (markModal.ticket.isCash) {
        updateObj.collected_amount = Number(markModal.cashAmount || 0);
      }

      const { error: uErr } = await supabase.from('tickets').update(updateObj).eq('id', markModal.ticket.id);
      if (uErr) throw uErr;

      // local state update
      setTickets(prev => prev.map(t => t.id === markModal.ticket.id
        ? {
            ...t,
            status: 'used',
            collected_amount: markModal.ticket.isCash ? Number(markModal.cashAmount || 0) : t.collected_amount,
            activated_by: auditText,
            activated_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        : t
      ));

      closeMarkUsed();
    } catch (e) {
      console.error(e);
      alert(e.message || 'Failed to mark ticket as used.');
      setMarkModal(s => ({ ...s, saving: false }));
    }
  };

  const exportCsv = () => {
    const header = [
      'Ticket ID',
      'Ticket Name',
      'Date of Purchase',
      'Ticket Price',
      'Payment Method',
      'Customer Name',
      'Ticket Status',
    ];
    const fmt = (d) =>
      new Date(d).toLocaleString(undefined, {
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
      });
    const rowsOut = rows.map(r => [
      r.fullTicketId,
      r.ticketName,
      fmt(r.dateOfPurchase),
      Number(r.price || 0).toFixed(2),
      r.paymentMethod,
      r.customerName, // only name exported
      STATUS_UI[r.status]?.label || r.status
    ]);
    const lines = [header, ...rowsOut].map(arr => arr.map(s => {
      s = String(s ?? '');
      return (s.includes(',') || s.includes('"') || s.includes('\n')) ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(',')).join('\n');
    const blob = new Blob([`\uFEFF${lines}`], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `BasmahJo_Sales_${fromDate}_to_${toDate}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  /* --------------------- ANALYTICS helpers --------------------- */
  const analytics = useMemo(() => {
    // Sales (Used-only)
    const byDay = new Map();
    const byName = new Map();
    const bookingsSet = new Set();

    tickets.forEach(t => {
      const b = bookingMap.get(t.booking_id);
      if (!b) return;
      bookingsSet.add(b.id);
      if (t.status !== 'used') return;
      const day = (new Date(b.created_at)).toISOString().slice(0,10);
      const val = Number(t.total_price ?? t.unit_price ?? 0);
      byDay.set(day, (byDay.get(day) || 0) + val);
      byName.set(t.ticket_name || '—', (byName.get(t.ticket_name || '—') || 0) + 1);
    });

    // Clicks
    const clicksByDay = new Map();
    const clicksByActivity = new Map();
    clickLogs.forEach(c => {
      const d = (new Date(c.clicked_at)).toISOString().slice(0,10);
      clicksByDay.set(d, (clicksByDay.get(d) || 0) + 1);
      clicksByActivity.set(c.activity_id, (clicksByActivity.get(c.activity_id) || 0) + 1);
    });

    const lineSales = Array.from(byDay.entries()).sort((a,b) => a[0].localeCompare(b[0]));
    const topNames = Array.from(byName.entries()).sort((a,b) => b[1]-a[1]).slice(0,5);
    const lineClicks = Array.from(clicksByDay.entries()).sort((a,b) => a[0].localeCompare(b[0]));
    const topClicks = Array.from(clicksByActivity.entries()).sort((a,b) => b[1]-a[1]).slice(0,5)
      .map(([actId, n]) => {
        const activity = activities.find(a => a.id === actId);
        return [activity?.title || actId, n];
      });

    return {
      salesSeries: lineSales,
      totalUsedTickets: rows.filter(r=>r.status==='used').length,
      totalBookings: bookingsSet.size,
      topTickets: topNames,
      revenueUsed: rows.filter(r=>r.status==='used').reduce((s,r)=>s + (r.isCash ? Number(r.collectedAmount||0) : Number(r.price||0)), 0),

      clickSeries: lineClicks,
      topClicks,                 // [ [title, count], ... ]
      totalClicks: clickLogs.length,
    };
  }, [tickets, bookingMap, rows, clickLogs, activities]);

  /* --------------------- UI --------------------- */
  return (
    <div className="app">
      <StyleTag/>
      <Sidebar
        tab={tab}
        setTab={setTab}
        onScan={() => window.open('https://admo.basmahjo.com/ticket?qr', '_blank')}
        onLogout={logout}
      />

      <div className="main-content">
        <div className="top-header">
          <div>
            <h1 className="page-title">Welcome to Basmah Jo Dashboard</h1>
            <p className="page-subtitle">Manage sales, activities, analytics & profile</p>
          </div>
          <div className="header-actions">
            <button className="btn ghost" onClick={() => window.open('https://admo.basmahjo.com/ticket?qr', '_blank')}>
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M0 0h7v7H0V0zm8 0h7v7H8V0zm0 8h7v7H8V8zM0 8h7v7H0V8z"/></svg>
              Scan QR Code
            </button>
            <button className="btn outline" onClick={logout}>Logout</button>
          </div>
        </div>

        {loading && <div className="loading-state"><span className="spinner" />Loading content...</div>}
        {error && !loading && <div className="error-state">⚠️ {error}</div>}

        {!loading && !error && (
          <>
            {(tab===TABS.SALES || tab===TABS.ANALYTICS) && (
              <div className="filters-section">
                <div className="filter-group">
                  <div className="filter-item">
                    <label>From Date</label>
                    <input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} />
                  </div>
                  <div className="filter-item">
                    <label>To Date</label>
                    <input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} />
                  </div>
                  <div className="filter-item filter-search">
                    <label>Search</label>
                    <input type="text" placeholder="Ticket ID, name, or customer..." value={query} onChange={e=>setQuery(e.target.value)}/>
                  </div>
                </div>
                <button className="btn primary" onClick={exportCsv}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8.5 6.5a.5.5 0 0 0-1 0v3.793L6.354 9.146a.5.5 0 1 0-.708.708l2 2a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 10.293V6.5z"/>
                    <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2zM9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5v2z"/>
                  </svg>
                  Export CSV
                </button>
              </div>
            )}

            {tab===TABS.SALES && (
              <div className="content-area">
                <Kpis metrics={metrics}/>
                <TicketsTable rows={rows} onMarkUsed={openMarkUsed}/>
              </div>
            )}

            {tab===TABS.ACTIVITIES && <ActivitiesView activities={activities}/>}

            {tab===TABS.ANALYTICS && <AnalyticsView analytics={analytics}/>}

            {tab===TABS.PROFILE && (
              <div className="content-area">
                <ProfileView
                  form={profileForm}
                  setForm={setProfileForm}
                  saving={savingProfile}
                  onSave={async()=>{
                    setSavingProfile(true);
                    try{
                      const { error: pErr } = await supabase.from('partners').update({
                        name: profileForm.name || null,
                        phone: profileForm.phone || null,
                        updated_at: new Date().toISOString(),
                      }).eq('id', partner.id);
                      if (pErr) throw pErr;
                      alert('Profile updated successfully.');
                    }catch(e){ alert(e.message || 'Failed to save profile.'); }
                    finally{ setSavingProfile(false); }
                  }}
                />
              </div>
            )}
          </>
        )}

        {markModal.open && (
          <div className="modal-overlay" onClick={closeMarkUsed}>
            <div className="modal-container" onClick={(e)=>e.stopPropagation()}>
              <div className="modal-header">
                <h3>Mark Ticket as Used</h3>
                <button className="modal-close" onClick={closeMarkUsed}>×</button>
              </div>
              <div className="modal-content">
                <div className="ticket-info" style={{marginBottom:12}}>
                  <div><strong>Ticket ID:</strong> {markModal.ticket?.fullTicketId}</div>
                  <div><strong>Customer:</strong> {markModal.ticket?.customerName}</div>
                  <div><strong>Price:</strong> {Number(markModal.ticket?.price || 0).toFixed(2)} JOD</div>
                </div>
                <div className="form-group">
                  <label>Your Name <span className="required">*</span></label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={markModal.actorName}
                    onChange={e=>setMarkModal(s=>({ ...s, actorName: e.target.value }))}
                  />
                </div>
                {markModal.ticket?.isCash && (
                  <div className="form-group">
                    <label>Cash Collected (JOD) <span className="required">*</span></label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={markModal.cashAmount}
                      onChange={e=>setMarkModal(s=>({ ...s, cashAmount: e.target.value }))}
                    />
                  </div>
                )}
                <div className="form-group">
                  <label>Usage Note <span className="required">*</span></label>
                  <textarea
                    rows={3}
                    placeholder="e.g., Verified at entrance by Ahmad on 2025-02-05 7:13 PM"
                    value={markModal.note}
                    onChange={e=>setMarkModal(s=>({ ...s, note: e.target.value }))}
                  />
                </div>
                <div className="modal-warning">
                  This action is permanent and will be saved to the ticket (activated_by / activated_at).
                </div>
              </div>
              <div className="modal-actions">
                <button className="btn ghost" onClick={closeMarkUsed}>Cancel</button>
                <button className="btn danger" disabled={markModal.saving} onClick={confirmMarkUsed}>
                  {markModal.saving ? 'Processing...' : 'Mark as Used'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* --------------------- Enhanced Components --------------------- */

function Sidebar({ tab, setTab, onScan, onLogout }) {
  const menuItems = [
    { key: TABS.SALES, label: 'Sales Dashboard', icon: '📊' },
    { key: TABS.ACTIVITIES, label: 'Activities', icon: '🎯' },
    { key: TABS.ANALYTICS, label: 'Analytics', icon: '📈' },
    { key: TABS.PROFILE, label: 'Profile', icon: '👤' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <div className="logo-icon">BJ</div>
          <div className="logo-text">BASMAH JO</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map(item => (
          <button
            key={item.key}
            className={`nav-item ${tab === item.key ? 'active' : ''}`}
            onClick={() => setTab(item.key)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="sidebar-action" onClick={onScan}>
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M0 0h7v7H0V0zm8 0h7v7H8V0zm0 8h7v7H8V8zM0 8h7v7H0V8z"/></svg>
          Scan QR
        </button>
        <button className="sidebar-action logout" onClick={onLogout}>
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
            <path d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}

function Kpis({ metrics }) {
  return (
    <div className="kpis-grid">
      <div className="kpi-card">
        <div className="kpi-header"><div className="kpi-icon">🎫</div><div className="kpi-label">Total Tickets</div></div>
        <div className="kpi-value">{metrics.totalTickets}</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-header"><div className="kpi-icon">✅</div><div className="kpi-label">Active Tickets</div></div>
        <div className="kpi-value">{metrics.activeCount}</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-header"><div className="kpi-icon">❌</div><div className="kpi-label">Cancelled</div></div>
        <div className="kpi-value">{metrics.cancelledCount}</div>
      </div>
      <div className="kpi-card highlight">
        <div className="kpi-header"><div className="kpi-icon">🎯</div><div className="kpi-label">Used Tickets</div></div>
        <div className="kpi-value">{metrics.usedCount}</div>
      </div>
      <div className="kpi-card highlight">
        <div className="kpi-header"><div className="kpi-icon">💰</div><div className="kpi-label">Revenue (Used)</div></div>
        <div className="kpi-value">{metrics.usedAmount.toFixed(2)} JOD</div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_UI[status] || { label: status, color: '#64748b' };
  return (
    <span className="status-badge" style={{ color: s.color, borderColor: s.color }}>
      {s.label}
    </span>
  );
}

function TicketsTable({ rows, onMarkUsed }) {
  return (
    <div className="data-card">
      <div className="card-header">
        <h3>Latest Tickets</h3>
        <div className="card-subtitle">See new tickets, change status and export</div>
      </div>
      <div className="table-container">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Ticket</th>
              <th>Customer</th>
              <th>Date of Purchase</th>
              <th>Price</th>
              <th>Payment</th>
              <th>Status</th>
              <th className="audit-col">Last Action</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id}>
                <td>
                  <div className="ticket-info">
                    <div className="ticket-id">
                      {r.fullTicketId}
                      {r.isNew && <span className="new-badge">NEW</span>}
                    </div>
                    <div className="ticket-name">{r.ticketName || '—'}</div>
                  </div>
                </td>
                <td>
                  <div className="customer-info">
                    <div className="customer-name">{r.customerName}</div>
                    <div className="customer-contact">
                      {r.customerEmail !== '—' ? r.customerEmail : ''}{r.customerEmail && r.customerPhone ? ' • ' : ''}{r.customerPhone !== '—' ? r.customerPhone : ''}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="purchase-info">
                    <div className="purchase-date">{r.dateOfPurchase.toLocaleString()}</div>
                  </div>
                </td>
                <td><div className="price">{Number(r.price||0).toFixed(2)} JOD</div></td>
                <td><div className="payment-method">{r.paymentMethod}</div></td>
                <td><StatusBadge status={r.status} /></td>
                <td className="audit-col">
                  {r.lastAction ? (
                    <div className="audit-info">
                      <div>
                        <span className="audit-actor">
                          {r.lastAction.actorName || '—'}
                        </span>
                        {r.lastAction.note ? ` — ${r.lastAction.note}` : ''}
                      </div>
                      {r.lastAction.when && <div className="audit-date">{new Date(r.lastAction.when).toLocaleString()}</div>}
                    </div>
                  ) : <span className="audit-info">—</span>}
                </td>
                <td>
                  <button
                    className={`action-btn ${r.status !== 'valid' ? 'disabled' : ''}`}
                    disabled={r.status !== 'valid'}
                    onClick={() => onMarkUsed(r)}
                  >
                    Mark as Used
                  </button>
                </td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td colSpan={8} style={{padding:20, color:'var(--text-muted)'}}>No tickets in the selected range.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        Showing {rows.length} ticket{rows.length !== 1 ? 's' : ''}.
        &nbsp;Only Used tickets are counted in revenue (cash tickets use collected amount).
      </div>
    </div>
  );
}

function ActivitiesView({ activities }) {
  return (
    <div className="content-area">
      <div className="activities-header">
        <h2>Activities Details</h2>
        <p>All activities linked to your partner account</p>
      </div>
      <div className="activities-grid">
        {activities.map(a => {
          const gallery = Array.isArray(a.gallery_images) ? a.gallery_images : [];
          const ticketsData = Array.isArray(a.tickets_data) ? a.tickets_data : (a.tickets_data && typeof a.tickets_data === 'object' ? Object.values(a.tickets_data) : []);
          const payments = Array.isArray(a.payment_types) ? a.payment_types : [];
          return (
            <div className="activity-card" key={a.id}>
              <div className="activity-media">
                {a.image_url ? (
                  <img className="activity-image" src={a.image_url} alt={a.title} />
                ) : (
                  <div className="activity-placeholder">
                    <div className="placeholder-icon">🖼️</div>
                    No cover image
                  </div>
                )}
                <div className="activity-badges">
                  {a.is_featured && <span className="badge-featured">Featured</span>}
                  {a.is_popular && <span className="badge-popular">Popular</span>}
                  {a.is_new && <span className="badge-new">New</span>}
                  {!a.is_active && <span className="badge-inactive">Inactive</span>}
                </div>
              </div>
              <div className="activity-content">
                <div className="activity-header">
                  <div className="activity-title">{a.title}</div>
                  {a.title_ar && <div className="activity-title-ar">{a.title_ar}</div>}
                </div>

                {a.description && (
                  <div className="activity-description">
                    {a.description}
                    {a.description_ar && <div className="description-ar">{a.description_ar}</div>}
                  </div>
                )}

                <div className="activity-details">
                  <div className="detail-row"><span className="detail-label">Location</span><span>{a.location || '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">City</span><span>{a.city || '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">Duration</span><span>{a.duration || '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">Available Tickets</span><span>{a.available_tickets ?? '—'}</span></div>
                  <div className="detail-row"><span className="detail-label">Status</span><span className={a.is_active ? 'status active' : 'status inactive'}>{a.is_active ? 'Active' : 'Inactive'}</span></div>
                </div>

                {!!ticketsData?.length && (
                  <div className="tickets-section">
                    <h4>Ticket Options</h4>
                    <div className="tickets-list">
                      {ticketsData.map((t, idx) => (
                        <div className="ticket-option" key={idx}>
                          <div className="ticket-name">{t?.name || t?.title || `Ticket ${idx+1}`}</div>
                          <div className="ticket-price">{Number(t?.price||0).toFixed(2)} {a.currency || 'JOD'}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="payment-methods">
                  <h4>Payment Methods</h4>
                  <div className="payment-tags">
                    {payments.length ? payments.map((p, i) => <span className="payment-tag" key={i}>{p}</span>) : <span className="payment-tag">—</span>}
                    {a.cash_payment_enabled && <span className="payment-tag">cash</span>}
                  </div>
                </div>

                {(a.terms || a.terms_ar) && (
                  <div className="terms-section">
                    <h4>Terms & Conditions</h4>
                    <div className="terms-content">
                      {a.terms || '—'}
                      {a.terms_ar && <div className="terms-ar">{a.terms_ar}</div>}
                    </div>
                  </div>
                )}

                {!!gallery.length && (
                  <div className="gallery-section">
                    <h4>Gallery</h4>
                    <div className="gallery-preview">
                      {gallery.slice(0,7).map((g, i) => (
                        <div key={i} className="gallery-thumb"><img src={g} alt={`g-${i}`} /></div>
                      ))}
                      {gallery.length > 8 && <div className="gallery-more">+{gallery.length - 8}</div>}
                    </div>
                  </div>
                )}

                <div className="activity-meta">
                  <div className="meta-item"><span>Vendor</span><span>{a.vendor_name || '—'}</span></div>
                  <div className="meta-item"><span>Created</span><span>{a.created_at ? new Date(a.created_at).toLocaleDateString() : '—'}</span></div>
                  <div className="meta-item"><span>Updated</span><span>{a.updated_at ? new Date(a.updated_at).toLocaleDateString() : '—'}</span></div>
                </div>

                <div className="social-links">
                  {a.website_url && <a className="social-link" href={a.website_url} target="_blank" rel="noreferrer">Website</a>}
                  {a.instagram_url && <a className="social-link" href={a.instagram_url} target="_blank" rel="noreferrer">Instagram</a>}
                  {a.facebook_url && <a className="social-link" href={a.facebook_url} target="_blank" rel="noreferrer">Facebook</a>}
                  {a.google_map_link && <a className="social-link" href={a.google_map_link} target="_blank" rel="noreferrer">Google Maps</a>}
                </div>
              </div>
            </div>
          );
        })}
        {!activities.length && (
          <div className="data-card" style={{padding:24}}>
            <div className="card-subtitle">No activities linked to this partner.</div>
          </div>
        )}
      </div>
    </div>
  );
}

function AnalyticsView({ analytics }) {
  const usedPct = (analytics.totalUsedTickets && analytics.totalBookings)
    ? Math.min(100, Math.round((analytics.totalUsedTickets / Math.max(1, analytics.totalBookings)) * 100))
    : 0;

  const renderLine = (series, width=400, height=160, pad=24) => {
    if (!series.length) return <div style={{color:'var(--text-muted)'}}>No data</div>;
    const xs = series.map(([d]) => new Date(d).getTime());
    const ys = series.map(([,v]) => v);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = 0, maxY = Math.max(...ys) || 1;
    const toX = (x) => pad + ((x - minX) / Math.max(1, (maxX - minX))) * (width - pad*2);
    const toY = (y) => height - pad - (y - minY) / Math.max(1,(maxY-minY)) * (height - pad*2);
    const path = series.map(([d,v],i) => `${i?'L':'M'}${toX(new Date(d).getTime())},${toY(v)}`).join(' ');
    return (
      <svg width={width} height={height}>
        <rect x="0" y="0" width={width} height={height} fill="#ffffff" />
        <path d={path} fill="none" stroke="#6366f1" strokeWidth="2" />
      </svg>
    );
  };

  const renderGauge = (pct, size=200) => {
    const r = size/2 - 16;
    const cx = size/2, cy = size/2;
    const start = Math.PI, end = 0;
    const angle = start + (end - start) * (pct/100);
    const arc = (ang) => {
      const x = cx + r * Math.cos(ang), y = cy + r * Math.sin(ang);
      return { x, y };
    };
    const a0 = arc(start), a1 = arc(end), aP = arc(angle);
    const large = 0;
    return (
      <svg width={size} height={size/1.2} className="gauge">
        <path d={`M ${a0.x} ${a0.y} A ${r} ${r} 0 ${large} 1 ${a1.x} ${a1.y}`} fill="none" stroke="#e5e7eb" strokeWidth="14" />
        <path d={`M ${a0.x} ${a0.y} A ${r} ${r} 0 ${large} 1 ${aP.x} ${aP.y}`} fill="none" stroke="#10b981" strokeWidth="14" />
        <circle cx={aP.x} cy={aP.y} r="5" fill="#10b981" />
        <text x="50%" y="85%" textAnchor="middle" fontSize="16" fontWeight="700" fill="#0f172a">{pct}%</text>
      </svg>
    );
  };

  return (
    <div className="content-area">
      <div className="analytics-header">
        <h2>Sales Analytics</h2>
        <p>Daily sales, top tickets, clicks & KPIs</p>
      </div>

      <div className="analytics-grid">
        <div className="chart-card">
          <div className="metric-header"><div className="metric-icon">📈</div><h3>Daily Sales (Used)</h3></div>
          <div className="mini-chart">{renderLine(analytics.salesSeries)}</div>
          <div className="chart-summary">Total revenue (Used tickets): <strong>{analytics.revenueUsed.toFixed(2)} JOD</strong></div>
        </div>

        <div className="metric-card">
          <div className="metric-header"><div className="metric-icon">🎟️</div><h3>Used Tickets</h3></div>
          <div className="big-metric">{analytics.totalUsedTickets}</div>
          <div className="metric-footer">Only Used tickets counted as sales</div>
        </div>

        <div className="metric-card">
          <div className="metric-header"><div className="metric-icon">📚</div><h3>Bookings</h3></div>
          <div className="big-metric">{analytics.totalBookings}</div>
          <div className="metric-footer">Bookings in selected range</div>
        </div>

        <div className="metric-card">
          <div className="metric-header"><div className="metric-icon">🎯</div><h3>Use Rate</h3></div>
          {renderGauge(usedPct)}
          <div className="metric-footer">Used tickets vs bookings</div>
        </div>

        <div className="chart-card">
          <div className="metric-header"><div className="metric-icon">👆</div><h3>Activity Clicks per Day</h3></div>
          <div className="mini-chart">{renderLine(analytics.clickSeries)}</div>
          <div className="chart-summary">Total clicks tracked: <strong>{analytics.totalClicks}</strong></div>
        </div>

        <div className="chart-card">
          <div className="metric-header"><div className="metric-icon">🏆</div><h3>Top Sold Ticket Names</h3></div>
          <div className="top-list">
            {analytics.topTickets.length ? analytics.topTickets.map(([name, n], i) => (
              <div className="top-item" key={i}>
                <div className="rank">{i+1}</div>
                <div className="item-info">
                  <div className="item-name">{name}</div>
                  <div className="item-value">{n} sold</div>
                </div>
              </div>
            )) : <div className="item-value">No used tickets yet</div>}
          </div>
        </div>

        <div className="chart-card">
          <div className="metric-header"><div className="metric-icon">🔥</div><h3>Top Activities by Clicks</h3></div>
          <div className="top-list">
            {analytics.topClicks.length ? analytics.topClicks.map(([title, n], i) => (
              <div className="top-item" key={i}>
                <div className="rank">{i+1}</div>
                <div className="item-info">
                  <div className="item-name">{title}</div>
                  <div className="item-value">{n} clicks</div>
                </div>
              </div>
            )) : <div className="item-value">No click logs yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileView({ form, setForm, saving, onSave }) {
  return (
    <div className="profile-section">
      <div className="profile-header">
        <h2>Profile</h2>
        <p>Update your contact details</p>
      </div>
      <div className="profile-card">
        <div className="profile-form">
          <div className="form-group">
            <label>Name</label>
            <input value={form.name} onChange={e=>setForm(s=>({...s, name: e.target.value}))} placeholder="Partner name"/>
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input value={form.phone} onChange={e=>setForm(s=>({...s, phone: e.target.value}))} placeholder="+962..." />
          </div>
          <div className="form-group">
            <label>Email (read-only)</label>
            <input value={form.email} disabled />
          </div>
          <div style={{display:'flex', gap:12, justifyContent:'flex-end'}}>
            <button className="btn ghost" onClick={()=>window.location.reload()}>Reset</button>
            <button className="btn primary" onClick={onSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
