import { useState, useEffect } from 'react';
import { Mail, Search, MessageSquare, Clock, User, AlertCircle, CheckCircle } from 'lucide-react';
import api from '../services/api';

const SupportInboxPage = () => {
    const [sessions, setSessions] = useState([]);
    const [selectedSession, setSelectedSession] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [filter, setFilter] = useState('all'); // all, open, closed

    useEffect(() => {
        fetchSessions();
    }, [filter]);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const response = await api.get('/support/admin/sessions', {
                params: { status: filter === 'all' ? undefined : filter }
            });
            if (response.data.success) {
                setSessions(response.data.sessions);
            }
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSessionClick = async (session) => {
        setSelectedSession(session);
        setMessagesLoading(true);
        try {
            const response = await api.get(`/support/admin/sessions/${session.id}/messages`);
            if (response.data.success) {
                setMessages(response.data.messages);
            }
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setMessagesLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="flex h-screen bg-[#F8FAFC]">
            {/* Sidebar List */}
            <div className="w-[380px] border-r border-[#E2E8F0] bg-white flex flex-col">
                <div className="p-6 border-b border-[#E2E8F0]">
                    <h1 className="text-2xl font-black text-[#0F172A] tracking-tight mb-6">AI Support</h1>

                    <div className="relative mb-6">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                        <input
                            type="text"
                            placeholder="Search sessions..."
                            className="w-full pl-10 pr-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm font-medium focus:outline-none focus:border-[#4D96FF] transition-colors"
                        />
                    </div>

                    <div className="flex gap-2">
                        {['all', 'open', 'needs_attention'].map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === f
                                        ? 'bg-[#0F172A] text-white'
                                        : 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]'
                                    }`}
                            >
                                {f.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="w-6 h-6 border-2 border-[#4D96FF] border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : sessions.length === 0 ? (
                        <div className="text-center py-10 px-6">
                            <div className="w-16 h-16 bg-[#F1F5F9] rounded-2xl flex items-center justify-center mx-auto mb-4 text-[#94A3B8]">
                                <MessageSquare className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-[#0F172A]">No sessions found</h3>
                            <p className="text-sm text-[#64748B] mt-1">Wait for users to start chatting.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#F1F5F9]">
                            {sessions.map((session) => (
                                <div
                                    key={session.id}
                                    onClick={() => handleSessionClick(session)}
                                    className={`p-5 cursor-pointer transition-all hover:bg-[#F8FAFC] ${selectedSession?.id === session.id ? 'bg-[#F1F5F9] border-l-4 border-l-[#4D96FF]' : 'border-l-4 border-l-transparent'
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-xs font-bold text-[#64748B] flex items-center gap-1.5">
                                            {session.email || 'Guest User'}
                                        </span>
                                        <span className="text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider">
                                            {formatDate(session.created_at)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[#0F172A] font-medium line-clamp-2 leading-relaxed">
                                        {session.last_message || 'New Session'}
                                    </p>
                                    <div className="mt-3 flex items-center gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${session.status === 'open' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {session.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-[#F8FAFC]">
                {selectedSession ? (
                    <>
                        <div className="p-6 border-b border-[#E2E8F0] bg-white flex justify-between items-center shadow-sm z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[#EEF2FF] flex items-center justify-center text-[#4D96FF] font-black text-lg">
                                    {(selectedSession.email || 'G')[0].toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-[#0F172A]">
                                        {selectedSession.email || 'Guest User'}
                                    </h2>
                                    <div className="flex items-center gap-2 text-xs text-[#64748B] font-medium">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>Started {formatDate(selectedSession.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {messagesLoading ? (
                                <div className="flex justify-center">
                                    <div className="w-8 h-8 border-3 border-[#4D96FF] border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div key={msg.id} className={`flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
                                        <div className={`flex gap-4 max-w-[80%] ${msg.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'}`}>
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-[#0F172A] text-white' : 'bg-[#E2E8F0] text-[#64748B]'
                                                }`}>
                                                {msg.role === 'assistant' ? 'AI' : <User className="w-5 h-5" />}
                                            </div>
                                            <div className={`p-6 rounded-3xl text-sm leading-relaxed shadow-sm ${msg.role === 'assistant'
                                                    ? 'bg-white text-[#0F172A] border border-[#E2E8F0] rounded-tl-none'
                                                    : 'bg-[#4D96FF] text-white rounded-tr-none'
                                                }`}>
                                                {msg.content}
                                                <div className={`mt-3 text-[10px] font-bold uppercase tracking-wider opacity-60 ${msg.role === 'assistant' ? 'text-[#64748B]' : 'text-white'
                                                    }`}>
                                                    {formatDate(msg.created_at)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                        <div className="w-24 h-24 bg-[#E2E8F0] rounded-3xl flex items-center justify-center mb-6 text-[#94A3B8]">
                            <MessageSquare className="w-10 h-10" />
                        </div>
                        <h2 className="text-xl font-black text-[#0F172A] mb-2">Select a session</h2>
                        <p className="text-[#64748B] font-medium">Choose a chat session from the sidebar to view the conversation history.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupportInboxPage;
