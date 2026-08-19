import { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Mail, Search, Filter, Trash2, CheckCircle,
    Clock, Archive, MoreVertical, ExternalLink,
    ChevronLeft, ChevronRight, User, Phone, Building2,
    MessageSquare
} from 'lucide-react';

const ContactMessagesPage = () => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 10 });
    const [selectedMessage, setSelectedMessage] = useState(null);

    const fetchMessages = async (page = 1, status = '') => {
        setLoading(true);
        try {
            const res = await api.get('/contact/messages', {
                params: { page, limit: pagination.limit, status }
            });
            setMessages(res.data.data.messages);
            setPagination(prev => ({
                ...prev,
                page,
                total: res.data.data.pagination.total
            }));
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleStatusChange = async (id, newStatus) => {
        try {
            await api.patch(`/contact/messages/${id}/status`, { status: newStatus });
            fetchMessages(pagination.page, filter);
            if (selectedMessage?.id === id) {
                setSelectedMessage(prev => ({ ...prev, status: newStatus }));
            }
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this message?')) return;
        try {
            await api.delete(`/contact/messages/${id}`);
            fetchMessages(pagination.page, filter);
            if (selectedMessage?.id === id) setSelectedMessage(null);
        } catch (error) {
            console.error('Failed to delete message:', error);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'unread': return 'bg-blue-100 text-blue-600';
            case 'read': return 'bg-green-100 text-green-600';
            case 'archived': return 'bg-gray-100 text-gray-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Contact Messages</h1>
                    <p className="text-[#64748B] font-bold mt-1 tracking-tight">Manage user inquiries and support requests</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchMessages()}
                        className="px-6 py-3 bg-white border border-[#E2E8F0] rounded-[18px] text-sm font-black text-[#0F172A] hover:bg-[#F8FAFC] transition-all shadow-sm"
                    >
                        Refresh
                    </button>
                    <div className="h-10 w-px bg-[#E2E8F0] mx-2" />
                    <div className="bg-[#4D96FF]/10 text-[#4D96FF] px-6 py-3 rounded-[18px] flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        <span className="text-sm font-black">{pagination.total} Total</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-280px)]">
                {/* Messages List */}
                <div className="lg:col-span-5 bg-white rounded-[40px] border border-[#F1F5F9] shadow-sm flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-[#F8FAFC]">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl py-3 pl-11 pr-5 text-sm font-medium outline-none focus:ring-4 focus:ring-[#4D96FF]/10 transition-all"
                            />
                        </div>
                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 custom-scrollbar">
                            {['', 'unread', 'read', 'archived'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => { setFilter(s); fetchMessages(1, s); }}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${filter === s ? 'bg-[#0F172A] text-white shadow-md' : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F1F5F9]'
                                        }`}
                                >
                                    {s || 'All'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {loading ? (
                            <div className="p-10 text-center space-y-4">
                                <div className="w-10 h-10 border-4 border-[#4D96FF] border-t-transparent rounded-full animate-spin mx-auto" />
                                <p className="text-sm font-bold text-[#64748B]">Loading messages...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="p-10 text-center space-y-4">
                                <div className="w-16 h-16 bg-[#F8FAFC] rounded-full flex items-center justify-center mx-auto text-[#CBD5E1]">
                                    <Mail className="w-8 h-8" />
                                </div>
                                <p className="text-sm font-bold text-[#64748B]">No messages found</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[#F8FAFC]">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        onClick={() => {
                                            setSelectedMessage(msg);
                                            if (msg.status === 'unread') handleStatusChange(msg.id, 'read');
                                        }}
                                        className={`p-6 cursor-pointer hover:bg-[#F8FAFC] transition-all group relative ${selectedMessage?.id === msg.id ? 'bg-[#F5F8FF]' : msg.status === 'unread' ? 'bg-white font-black' : 'bg-white'
                                            }`}
                                    >
                                        {msg.status === 'unread' && (
                                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#4D96FF] rounded-full shadow-[0_0_8px_rgba(77,150,255,0.8)]" />
                                        )}
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-sm text-[#0F172A] truncate pr-4">{msg.name}</h3>
                                            <span className="text-[10px] text-[#94A3B8] font-bold shrink-0">
                                                {new Date(msg.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="text-xs text-[#4D96FF] font-black truncate mb-2">{msg.subject || 'General Inquiry'}</p>
                                        <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">{msg.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-[#F8FAFC] flex items-center justify-between text-xs font-black uppercase tracking-widest text-[#94A3B8]">
                        <button
                            disabled={pagination.page <= 1}
                            onClick={() => fetchMessages(pagination.page - 1, filter)}
                            className="flex items-center gap-1 hover:text-[#4D96FF] disabled:opacity-30"
                        >
                            <ChevronLeft className="w-4 h-4" /> Previous
                        </button>
                        <span>Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit) || 1}</span>
                        <button
                            disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                            onClick={() => fetchMessages(pagination.page + 1, filter)}
                            className="flex items-center gap-1 hover:text-[#4D96FF] disabled:opacity-30"
                        >
                            Next <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Message Detail */}
                <div className="lg:col-span-7 bg-white rounded-[40px] border border-[#F1F5F9] shadow-sm flex flex-col overflow-hidden">
                    {selectedMessage ? (
                        <div className="flex flex-col h-full">
                            <div className="p-8 border-b border-[#F8FAFC] flex justify-between items-center bg-[#F8FAFC]/30">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-[#4D96FF] rounded-[20px] flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-500/20">
                                        {selectedMessage.name[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-[#0F172A] tracking-tight">{selectedMessage.name}</h2>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusColor(selectedMessage.status)}`}>
                                                {selectedMessage.status}
                                            </span>
                                            <span className="text-xs text-[#94A3B8] font-bold">•</span>
                                            <span className="text-xs text-[#94A3B8] font-bold">{new Date(selectedMessage.created_at).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handleStatusChange(selectedMessage.id, selectedMessage.status === 'archived' ? 'read' : 'archived')}
                                        className="p-3 bg-white border border-[#E2E8F0] rounded-xl text-[#64748B] hover:text-[#4D96FF] transition-all shadow-sm"
                                        title={selectedMessage.status === 'archived' ? 'Unarchive' : 'Archive'}
                                    >
                                        <Archive className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(selectedMessage.id)}
                                        className="p-3 bg-white border border-[#E2E8F0] rounded-xl text-[#64748B] hover:text-red-500 transition-all shadow-sm"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#F1F5F9]">
                                        <div className="flex items-center gap-2 text-[#94A3B8] mb-1">
                                            <Mail className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Email Address</span>
                                        </div>
                                        <p className="text-sm font-black text-[#0F172A] break-all">{selectedMessage.email}</p>
                                    </div>
                                    <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#F1F5F9]">
                                        <div className="flex items-center gap-2 text-[#94A3B8] mb-1">
                                            <Phone className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Phone Number</span>
                                        </div>
                                        <p className="text-sm font-black text-[#0F172A]">{selectedMessage.phone || 'Not provided'}</p>
                                    </div>
                                    <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#F1F5F9]">
                                        <div className="flex items-center gap-2 text-[#94A3B8] mb-1">
                                            <Building2 className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Company</span>
                                        </div>
                                        <p className="text-sm font-black text-[#0F172A]">{selectedMessage.company || 'Not provided'}</p>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 text-[#94A3B8] mb-4">
                                        <MessageSquare className="w-4 h-4" />
                                        <span className="text-xs font-black uppercase tracking-widest">Subject: {selectedMessage.subject || 'General Inquiry'}</span>
                                    </div>
                                    <div className="bg-[#F8FAFC]/50 p-8 rounded-[32px] border border-[#F1F5F9] relative group">
                                        <div className="absolute top-4 right-6 text-[80px] font-serif italic text-[#4D96FF]/5 pointer-events-none">Message</div>
                                        <p className="text-[#334155] leading-relaxed text-lg whitespace-pre-wrap relative z-10">
                                            {selectedMessage.message}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-4">
                                    <a
                                        href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject || 'Inquiry from WeShoot.ai'}`}
                                        className="bg-[#4D96FF] text-white px-8 py-4 rounded-2xl font-black text-sm shadow-lg shadow-blue-500/20 hover:bg-[#3b82f6] hover:scale-[1.02] flex items-center gap-2 transition-all"
                                    >
                                        Reply via Email <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6">
                            <div className="w-24 h-24 bg-[#F8FAFC] rounded-[32px] flex items-center justify-center text-[#CBD5E1]">
                                <Mail className="w-12 h-12" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-[#0F172A] tracking-tight">Select a message</h3>
                                <p className="text-[#64748B] font-bold mt-1 max-w-xs mx-auto">Click on a message from the list to view its contents and reply</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ContactMessagesPage;
