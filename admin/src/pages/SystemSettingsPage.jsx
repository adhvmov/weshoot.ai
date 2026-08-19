import { useState, useEffect } from 'react';
import api from '../services/api';
import { Globe, Palette, Lock, Activity, Zap, Shield, CheckCircle2, AlertTriangle, X, Clock, Save, RefreshCw } from 'lucide-react';

const SystemSettingsPage = () => {
    const [settings, setSettings] = useState({
        site_config: {
            site_name: 'WeShoot.ai',
            support_email: 'support@weshoot.ai',
            maintenance_mode: false,
            site_closed: false,
            allow_new_registrations: true,
            trial_credits: 5,
            default_language: 'en'
        },
        branding: {
            primary_color: '#4D96FF'
        },
        security: {
            max_login_attempts: 5,
            session_timeout: 3600
        }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [activeTab, setActiveTab] = useState('general');
    const [whitelist, setWhitelist] = useState([]);
    const [newEmail, setNewEmail] = useState('');
    const [addingEmail, setAddingEmail] = useState(false);
    const [accessRequests, setAccessRequests] = useState([]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/settings');
            if (response.data.success) {
                setSettings(response.data.data);
            }
        } catch (error) {
            console.error('Fetch settings error:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWhitelist = async () => {
        try {
            const response = await api.get('/admin/early-access/whitelist');
            if (response.data.success) {
                setWhitelist(response.data.data);
            }
        } catch (error) {
            console.error('Fetch whitelist error:', error);
        }
    };

    const fetchAccessRequests = async () => {
        try {
            const response = await api.get('/admin/early-access/requests');
            if (response.data.success) {
                setAccessRequests(response.data.data);
            }
        } catch (error) {
            console.error('Fetch requests error:', error);
        }
    };

    const handleApproveRequest = async (email) => {
        try {
            await api.post('/admin/early-access/approve', { email });
            fetchWhitelist();
            fetchAccessRequests();
        } catch (error) {
            alert('Failed to approve request');
        }
    };

    const handleAddEmail = async () => {
        if (!newEmail || !newEmail.includes('@')) {
            alert('Please enter a valid email');
            return;
        }
        try {
            setAddingEmail(true);
            await api.post('/admin/early-access/whitelist', { email: newEmail });
            setNewEmail('');
            fetchWhitelist();
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add email');
        } finally {
            setAddingEmail(false);
        }
    };

    const handleRemoveEmail = async (email) => {
        if (!window.confirm(`Remove ${email} from whitelist?`)) return;
        try {
            await api.delete(`/admin/early-access/whitelist/${encodeURIComponent(email)}`);
            fetchWhitelist();
        } catch (error) {
            alert('Failed to remove email');
        }
    };

    useEffect(() => {
        fetchSettings();
        fetchWhitelist();
        fetchAccessRequests();
    }, []);

    const handleUpdate = async (category, key, value) => {
        const newSettings = { ...settings };
        newSettings[category][key] = value;
        setSettings(newSettings);
    };

    const handleCommit = async () => {
        setSaving(true);
        try {
            // Determine which category to save based on activeTab
            let category = activeTab;
            if (activeTab === 'general' || activeTab === 'site_access') {
                category = 'site_config';
            }

            console.log('=== Saving Settings ===');
            console.log('Active Tab:', activeTab);
            console.log('Category:', category);
            console.log('Settings to save:', settings[category]);

            await api.post('/admin/settings', {
                key: category,
                value: settings[category]
            });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (error) {
            console.error('Save settings error:', error);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <div className="w-12 h-12 border-4 border-[#4D96FF] border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs font-black text-[#0F172A] uppercase tracking-widest">Accessing Cipher Config...</p>
            </div>
        );
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">System Configuration</h1>
                    <p className="text-[#64748B] font-bold mt-1 tracking-tight">Centralized control for platform aesthetics, behavior, and security.</p>
                </div>
                <button
                    onClick={handleCommit}
                    disabled={saving}
                    className="bg-[#0F172A] text-white font-black px-8 py-3 rounded-2xl text-[10px] uppercase tracking-widest hover:shadow-xl transition-all flex items-center gap-2 disabled:opacity-50"
                >
                    {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-5 h-5" />}
                    {saved ? 'Protocol Updated' : 'Commit Changes'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Categorized Settings Sidebar */}
                <div className="space-y-4">
                    {[
                        { id: 'general', label: 'General Presence', icon: Globe },
                        { id: 'site_access', label: 'Site Access Control', icon: Lock },
                        { id: 'branding', label: 'Visual Identity', icon: Palette },
                        { id: 'security', label: 'Shield & Access', icon: Lock },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-4 p-6 border rounded-3xl transition-all group text-left shadow-sm ${activeTab === tab.id
                                ? 'bg-[#0F172A] border-[#0F172A] text-white'
                                : 'bg-white border-[#F1F5F9] hover:border-[#0F172A] text-[#0F172A]'
                                }`}
                        >
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${activeTab === tab.id ? 'bg-white/10 text-white' : 'bg-[#F5F8FF] text-[#4D96FF]'
                                }`}>
                                <tab.icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-sm font-black">{tab.label}</p>
                                <p className={`text-[10px] font-bold uppercase tracking-widest mt-0.5 ${activeTab === tab.id ? 'text-white/50' : 'text-[#94A3B8]'
                                    }`}>Configure Parameters</p>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Main Settings Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white border border-[#F1F5F9] rounded-[48px] p-10 shadow-sm min-h-[500px]">
                        {activeTab === 'general' && (
                            <div className="space-y-10 animate-in fade-in duration-500">
                                <h3 className="text-xl font-black text-[#0F172A] tracking-tight flex items-center gap-3">
                                    <Globe className="w-6 h-6 text-[#4D96FF]" />
                                    General Presence
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8] ml-4">Platform Title</label>
                                        <input
                                            value={settings.site_config.site_name}
                                            onChange={e => handleUpdate('site_config', 'site_name', e.target.value)}
                                            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[22px] py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-[#4D96FF]/10 focus:border-[#4D96FF] transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8] ml-4">Registry Support Email</label>
                                        <input
                                            value={settings.site_config.support_email}
                                            onChange={e => handleUpdate('site_config', 'support_email', e.target.value)}
                                            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[22px] py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-[#4D96FF]/10 focus:border-[#4D96FF] transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="flex items-center justify-between p-6 bg-[#F5F8FF] rounded-3xl border border-[#E2E8F0]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#4D96FF] shadow-sm">
                                                <Activity className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-[#0F172A]">Maintenance</p>
                                                <p className="text-[10px] font-bold text-[#64748B]">Lock platform</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={settings.site_config.maintenance_mode}
                                                onChange={e => handleUpdate('site_config', 'maintenance_mode', e.target.checked)}
                                            />
                                            <div className="w-14 h-8 bg-[#E2E8F0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-500"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-6 bg-[#F8FAFC] rounded-3xl border border-[#E2E8F0]">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#4D96FF] shadow-sm">
                                                <Zap className="w-5 h-5 text-[#FFB800]" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-[#0F172A]">Trial Credits</p>
                                                <p className="text-[10px] font-bold text-[#64748B]">Bonus for new users</p>
                                            </div>
                                        </div>
                                        <input
                                            type="number"
                                            value={settings.site_config.trial_credits}
                                            onChange={e => handleUpdate('site_config', 'trial_credits', parseInt(e.target.value))}
                                            className="w-16 bg-white border border-[#E2E8F0] rounded-xl py-2 px-3 text-xs font-black outline-none focus:border-[#4D96FF]"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'site_access' && (
                            <div className="space-y-10 animate-in fade-in duration-500">
                                <h3 className="text-xl font-black text-[#0F172A] tracking-tight flex items-center gap-3">
                                    <Lock className="w-6 h-6 text-red-500" />
                                    Site Access Control
                                </h3>

                                {/* Site Closure Toggle */}
                                <div className={`p-8 rounded-[32px] border-2 transition-all ${settings.site_config.site_closed ? 'bg-red-50 border-red-200' : 'bg-[#F8FAFC] border-[#E2E8F0]'}`}>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${settings.site_config.site_closed ? 'bg-red-500' : 'bg-white'}`}>
                                                <AlertTriangle className={`w-8 h-8 ${settings.site_config.site_closed ? 'text-white' : 'text-[#4D96FF]'}`} />
                                            </div>
                                            <div>
                                                <p className="text-lg font-black text-[#0F172A]">Close Site to Public</p>
                                                <p className="text-xs font-bold text-[#64748B] mt-1">Enable early access mode</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                className="sr-only peer"
                                                checked={settings.site_config.site_closed}
                                                onChange={e => handleUpdate('site_config', 'site_closed', e.target.checked)}
                                            />
                                            <div className="w-16 h-9 bg-[#E2E8F0] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-7 after:w-7 after:transition-all peer-checked:bg-red-500"></div>
                                        </label>
                                    </div>
                                    <div className={`text-xs font-bold px-4 py-3 rounded-2xl ${settings.site_config.site_closed ? 'bg-red-100 text-red-700' : 'bg-[#F5F8FF] text-[#64748B]'}`}>
                                        {settings.site_config.site_closed
                                            ? '⚠️ Site is currently closed. Only whitelisted users can access the platform.'
                                            : 'ℹ️ Site is open to public. All visitors can access the platform.'}
                                    </div>
                                </div>

                                {/* Email Whitelist Management */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-lg font-black text-[#0F172A]">Email Whitelist</h4>
                                            <p className="text-xs font-bold text-[#64748B] mt-1">Emails with full access when site is closed</p>
                                        </div>
                                        <span className="px-4 py-2 bg-[#4D96FF]/10 text-[#4D96FF] rounded-full text-xs font-black">
                                            {whitelist.length} {whitelist.length === 1 ? 'Email' : 'Emails'}
                                        </span>
                                    </div>

                                    {/* Add Email Form */}
                                    <div className="flex gap-3">
                                        <input
                                            type="email"
                                            value={newEmail}
                                            onChange={e => setNewEmail(e.target.value)}
                                            onKeyPress={e => e.key === 'Enter' && handleAddEmail()}
                                            placeholder="Enter email address"
                                            className="flex-1 bg-white border border-[#E2E8F0] rounded-[22px] py-4 px-6 text-sm font-bold outline-none focus:ring-4 focus:ring-[#4D96FF]/10 focus:border-[#4D96FF] transition-all"
                                        />
                                        <button
                                            onClick={handleAddEmail}
                                            disabled={addingEmail}
                                            className="bg-[#4D96FF] text-white font-black px-8 py-4 rounded-2xl text-xs uppercase tracking-widest hover:shadow-lg transition-all disabled:opacity-50"
                                        >
                                            {addingEmail ? 'Adding...' : 'Add Email'}
                                        </button>
                                    </div>

                                    {/* Whitel ist Display */}
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                        {whitelist.length > 0 ? whitelist.map((item) => (
                                            <div key={item.id} className="flex items-center justify-between p-4 bg-white border border-[#F1F5F9] rounded-2xl hover:border-[#4D96FF]/30 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-[#F5F8FF] rounded-xl flex items-center justify-center">
                                                        <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-[#0F172A]">{item.email}</p>
                                                        <p className="text-[10px] font-bold text-[#94A3B8]">Added {new Date(item.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveEmail(item.email)}
                                                    className="w-8 h-8 bg-red-50 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )) : (
                                            <div className="text-center py-12 bg-[#F8FAFC] rounded-[32px] border border-dashed border-[#E2E8F0]">
                                                <Shield className="w-12 h-12 text-[#CBD5E1] mx-auto mb-4" />
                                                <p className="text-[#94A3B8] font-black uppercase tracking-widest text-[10px]">No whitelisted emails yet</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Access Requests Section */}
                                <div className="space-y-6 mt-10">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="text-lg font-black text-[#0F172A]">Access Requests</h4>
                                            <p className="text-xs font-bold text-[#64748B] mt-1">Approve pending requests to grant access</p>
                                        </div>
                                        <span className="px-4 py-2 bg-orange-500/10 text-orange-600 rounded-full text-xs font-black">
                                            {accessRequests.filter(r => r.status === 'pending').length} Pending
                                        </span>
                                    </div>

                                    {/* Requests List */}
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto">
                                        {accessRequests.filter(r => r.status === 'pending').length > 0 ? accessRequests.filter(r => r.status === 'pending').map((request) => (
                                            <div key={request.id} className="flex items-center justify-between p-4 bg-white border border-[#F1F5F9] rounded-2xl hover:border-[#4D96FF]/30 transition-all">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                                                        <Clock className="w-5 h-5 text-orange-500" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-[#0F172A]">{request.email}</p>
                                                        <p className="text-[10px] font-bold text-[#94A3B8]">
                                                            Requested {new Date(request.created_at).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleApproveRequest(request.email)}
                                                    className="px-6 py-2 bg-green-500 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-green-600 transition-all"
                                                >
                                                    Approve
                                                </button>
                                            </div>
                                        )) : (
                                            <div className="text-center py-12 bg-[#F8FAFC] rounded-[32px] border border-dashed border-[#E2E8F0]">
                                                <CheckCircle2 className="w-12 h-12 text-[#CBD5E1] mx-auto mb-4" />
                                                <p className="text-[#94A3B8] font-black uppercase tracking-widest text-[10px]">No pending requests</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'branding' && (
                            <div className="space-y-10 animate-in fade-in duration-500">
                                <h3 className="text-xl font-black text-[#0F172A] tracking-tight flex items-center gap-3">
                                    <Palette className="w-6 h-6 text-[#FFB800]" />
                                    Visual Identity
                                </h3>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8] ml-4">Primary Brand Color</label>
                                    <div className="flex items-center gap-6">
                                        <input
                                            type="color"
                                            value={settings.branding.primary_color}
                                            onChange={e => handleUpdate('branding', 'primary_color', e.target.value)}
                                            className="w-24 h-24 rounded-3xl overflow-hidden border-none cursor-pointer"
                                        />
                                        <div>
                                            <p className="text-xl font-black text-[#0F172A] tracking-tighter uppercase">{settings.branding.primary_color}</p>
                                            <p className="text-xs font-bold text-[#64748B]">Standard Hexadecimal Signature</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'security' && (
                            <div className="space-y-10 animate-in fade-in duration-500">
                                <h3 className="text-xl font-black text-[#0F172A] tracking-tight flex items-center gap-3">
                                    <Shield className="w-6 h-6 text-green-500" />
                                    Shield & Access
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8] ml-4">Max Login Failures</label>
                                        <input
                                            type="number"
                                            value={settings.security.max_login_attempts}
                                            onChange={e => handleUpdate('security', 'max_login_attempts', parseInt(e.target.value))}
                                            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[22px] py-4 px-6 text-sm font-bold outline-none"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8] ml-4">Session Timeout (Seconds)</label>
                                        <input
                                            type="number"
                                            value={settings.security.session_timeout}
                                            onChange={e => handleUpdate('security', 'session_timeout', parseInt(e.target.value))}
                                            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-[22px] py-4 px-6 text-sm font-bold outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="p-8 bg-black rounded-[40px] text-white relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-10 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                        <Lock className="w-32 h-32" />
                                    </div>
                                    <div className="relative z-10">
                                        <h4 className="text-lg font-black tracking-tight mb-2">High-Security Rotation</h4>
                                        <p className="text-xs text-white/50 font-bold mb-6 max-w-[280px]">Force system-wide key rotation & log out all active administrator sessions.</p>
                                        <button className="bg-white text-black font-black px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest hover:bg-[#4D96FF] hover:text-white transition-all">
                                            Execute Rotation
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemSettingsPage;

