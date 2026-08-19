import { useState, useEffect } from 'react';
import api from '../services/api';
import {
    Search, Filter, Trash2, CheckCircle,
    Archive, ChevronLeft, ChevronRight, User, Phone, Building2,
    MessageSquare, Briefcase, CreditCard, DollarSign, Mail
} from 'lucide-react';

const CustomRequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');
    const [pagination, setPagination] = useState({ page: 1, total: 0, limit: 10 });
    const [selectedRequest, setSelectedRequest] = useState(null);

    const fetchRequests = async (page = 1, status = '') => {
        setLoading(true);
        try {
            const res = await api.get('/contact/custom-requests', {
                params: { page, limit: pagination.limit, status }
            });
            setRequests(res.data.data.requests);
            setPagination(prev => ({
                ...prev,
                page,
                total: res.data.data.pagination.total
            }));
        } catch (error) {
            console.error('Failed to fetch requests:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // We can reuse the status update endpoint if we modify the backend or just create a new one.
    // The backend contactController uses `contact_messages` table for `updateMessageStatus`.
    // We created a NEW table `custom_requests`. We did NOT create an update status endpoint for it in the plan.
    // The user asked "also make the Db in file to add it to the quary manualy to updata it".
    // I should probably add status update support in the backend if I want to use it here.
    // For now, I will display the requests. If I need status update I'll add it.
    // The previous plan didn't explicitly ask for status update on custom requests, but it's good practice.
    // I'll stick to display first.

    // Actually, I can reuse the logic but I need a backend endpoint for it.
    // Since I can't easily add it without modifying the controller again (which I can do),
    // I will skip status update for now or implement it if I have time. 
    // Wait, `submitCustomRequest` sets status to 'pending'.
    // `getCustomRequests` filters by status.
    // So visual indication is there. 

    // Let's keep it simple: List and View Details.

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-600';
            case 'contacted': return 'bg-blue-100 text-blue-600';
            case 'completed': return 'bg-green-100 text-green-600';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[#0F172A] tracking-tight">Custom Credit Requests</h1>
                    <p className="text-[#64748B] font-bold mt-1 tracking-tight">Manage custom plan inquiries</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => fetchRequests()}
                        className="px-6 py-3 bg-white border border-[#E2E8F0] rounded-[18px] text-sm font-black text-[#0F172A] hover:bg-[#F8FAFC] transition-all shadow-sm"
                    >
                        Refresh
                    </button>
                    <div className="h-10 w-px bg-[#E2E8F0] mx-2" />
                    <div className="bg-[#4D96FF]/10 text-[#4D96FF] px-6 py-3 rounded-[18px] flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        <span className="text-sm font-black">{pagination.total} Total</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-280px)]">
                {/* List */}
                <div className="lg:col-span-12 xl:col-span-5 bg-white rounded-[40px] border border-[#F1F5F9] shadow-sm flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-[#F8FAFC]">
                        <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                            {['', 'pending', 'contacted', 'completed'].map((s) => (
                                <button
                                    key={s}
                                    onClick={() => { setFilter(s); fetchRequests(1, s); }}
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
                                <p className="text-sm font-bold text-[#64748B]">Loading requests...</p>
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="p-10 text-center space-y-4">
                                <p className="text-sm font-bold text-[#64748B]">No requests found</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-[#F8FAFC]">
                                {requests.map((req) => (
                                    <div
                                        key={req.id}
                                        onClick={() => setSelectedRequest(req)}
                                        className={`p-6 cursor-pointer hover:bg-[#F8FAFC] transition-all group relative ${selectedRequest?.id === req.id ? 'bg-[#F5F8FF]' : 'bg-white'
                                            }`}
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <h3 className="text-sm font-black text-[#0F172A] truncate pr-4">{req.name}</h3>
                                            <span className="text-[10px] text-[#94A3B8] font-bold shrink-0">
                                                {new Date(req.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-md ${getStatusColor(req.status)}`}>{req.status}</span>
                                            <span className="text-xs text-[#64748B]">•</span>
                                            <span className="text-xs text-[#64748B] font-bold">{req.credits_needed} Credits</span>
                                        </div>
                                        <p className="text-xs text-[#64748B] line-clamp-2 leading-relaxed">{req.message}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Detail */}
                <div className="lg:col-span-12 xl:col-span-7 bg-white rounded-[40px] border border-[#F1F5F9] shadow-sm flex flex-col overflow-hidden">
                    {selectedRequest ? (
                        <div className="flex flex-col h-full">
                            <div className="p-8 border-b border-[#F8FAFC] bg-[#F8FAFC]/30">
                                <h2 className="text-xl font-black text-[#0F172A] mb-4">{selectedRequest.name}</h2>
                                <div className="flex gap-4 flex-wrap">
                                    <div className="bg-white p-3 rounded-xl border border-[#F1F5F9] shadow-sm flex items-center gap-3">
                                        <User className="w-4 h-4 text-[#94A3B8]" />
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Type</p>
                                            <p className="text-sm font-bold text-[#0F172A] capitalize">{selectedRequest.user_type}</p>
                                        </div>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-[#F1F5F9] shadow-sm flex items-center gap-3">
                                        <CreditCard className="w-4 h-4 text-[#94A3B8]" />
                                        <div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-[#94A3B8]">Credits Needed</p>
                                            <p className="text-sm font-bold text-[#0F172A]">{selectedRequest.credits_needed}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 flex-1 overflow-y-auto custom-scrollbar space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#F1F5F9]">
                                        <div className="flex items-center gap-2 text-[#94A3B8] mb-1">
                                            <Mail className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Email</span>
                                        </div>
                                        <p className="text-sm font-black text-[#0F172A]">{selectedRequest.email}</p>
                                    </div>
                                    <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#F1F5F9]">
                                        <div className="flex items-center gap-2 text-[#94A3B8] mb-1">
                                            <Phone className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Phone</span>
                                        </div>
                                        <p className="text-sm font-black text-[#0F172A]">{selectedRequest.phone || 'N/A'}</p>
                                    </div>
                                    <div className="bg-[#F8FAFC] p-4 rounded-2xl border border-[#F1F5F9]">
                                        <div className="flex items-center gap-2 text-[#94A3B8] mb-1">
                                            <Building2 className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Company</span>
                                        </div>
                                        <p className="text-sm font-black text-[#0F172A]">{selectedRequest.company || 'N/A'}</p>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 text-[#94A3B8] mb-2">
                                        <MessageSquare className="w-4 h-4" />
                                        <span className="text-xs font-black uppercase tracking-widest">Additional Details</span>
                                    </div>
                                    <div className="bg-[#F8FAFC]/50 p-6 rounded-[24px] border border-[#F1F5F9]">
                                        <p className="text-[#334155] leading-relaxed whitespace-pre-wrap">
                                            {selectedRequest.message || 'No additional details provided.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 text-center text-[#94A3B8]">
                            <Briefcase className="w-12 h-12 mb-4 opacity-20" />
                            <p className="text-sm font-bold">Select a request to view details</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CustomRequestsPage;
