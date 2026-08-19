import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const ChatWidget = () => {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am the WeShoot AI Assistant. How can I help you today?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    // Initialize session when opening chat for the first time
    useEffect(() => {
        const initSession = async () => {
            if (isOpen && !sessionId) {
                try {
                    const response = await api.post('/support/session');
                    if (response.data.success) {
                        setSessionId(response.data.sessionId);
                    }
                } catch (error) {
                    console.error('Failed to init session:', error);
                }
            }
        };
        initSession();
    }, [isOpen, sessionId]);

    const handleSend = async () => {
        if (!inputValue.trim() || !sessionId) return;

        const userMessage = inputValue;
        setInputValue('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await api.post('/support/chat', {
                sessionId,
                message: userMessage
            });

            if (response.data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
            } else {
                // Fallback handling if backend flags failure
                setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting. Please try again or contact support." }]);
            }
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, something went wrong. Please check your connection." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!user) return null; // Or show for guests too depending on requirements

    return (
        <div className="fixed bottom-6 right-6 z-[100] font-sans">
            {/* Chat Window */}
            {isOpen && (
                <div className="absolute bottom-20 right-0 w-[380px] h-[600px] max-h-[80vh] max-w-[calc(100vw-48px)] bg-white/95 backdrop-blur-xl rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] border border-white/50 flex flex-col overflow-hidden animate-in slide-in-from-bottom-6 fade-in duration-300 origin-bottom-right ring-1 ring-black/5">
                    {/* Header */}
                    <div className="bg-[#0F172A] p-6 flex items-center justify-between shrink-0 relative overflow-hidden">
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#4D96FF] opacity-10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

                        <div className="flex items-center gap-4 relative z-10">
                            <div className="relative">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10 overflow-hidden shadow-inner">
                                    <img src="/site_icons/o_logo.webp" alt="AI" className="w-full h-full object-cover" />
                                </div>
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#0F172A] rounded-full flex items-center justify-center">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E] border-2 border-[#0F172A]"></div>
                                </div>
                            </div>
                            <div>
                                <h3 className="font-bold text-white text-lg tracking-tight">WeShoot AI</h3>
                                <p className="text-xs text-blue-200/80 font-medium tracking-wide">Always here to help</p>
                            </div>
                        </div>
                        {/* <button
                            onClick={() => setIsOpen(false)}
                            className="w-9 h-9 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full text-white/80 hover:text-white transition-all backdrop-blur-md border border-white/10"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button> */}
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-slate-50/50">
                        <div className="flex justify-center">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-100/80 px-3 py-1 rounded-full">
                                {new Date().toLocaleDateString(undefined, { weekday: 'long', hour: 'numeric', minute: 'numeric' })}
                            </span>
                        </div>

                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group animate-in slide-in-from-bottom-2 duration-300`}>
                                {msg.role === 'assistant' && (
                                    <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center mr-3 shrink-0 shadow-sm mt-auto mb-1">
                                        <img src="/site_icons/o_logo.webp" alt="AI" className="w-6 h-6 object-contain" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] p-4 text-[14px] leading-relaxed shadow-sm transition-all ${msg.role === 'user'
                                        ? 'bg-gradient-to-br from-[#4D96FF] to-[#2563EB] text-white rounded-[20px] rounded-br-[4px]'
                                        : 'bg-white text-slate-700 border border-slate-100 rounded-[20px] rounded-bl-[4px] shadow-[0_2px_8px_rgba(0,0,0,0.04)]'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex justify-start items-end gap-3">
                                <div className="w-8 h-8 rounded-full bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                                    <img src="/site_icons/o_logo.webp" alt="AI" className="w-6 h-6 object-contain" />
                                </div>
                                <div className="bg-white rounded-[20px] rounded-bl-[4px] p-4 border border-slate-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-[#4D96FF] rounded-full animate-bounce"></span>
                                    <span className="w-1.5 h-1.5 bg-[#4D96FF] rounded-full animate-bounce delay-100"></span>
                                    <span className="w-1.5 h-1.5 bg-[#4D96FF] rounded-full animate-bounce delay-200"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-5 bg-white border-t border-slate-100 shrink-0">
                        <div className="relative flex items-center">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Type your message..."
                                disabled={isLoading}
                                className="w-full pl-5 pr-14 py-4 bg-slate-50 border-0 rounded-[20px] text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4D96FF]/20 focus:bg-white transition-all shadow-inner"
                            />
                            <button
                                onClick={handleSend}
                                disabled={!inputValue.trim() || isLoading}
                                className={`absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-xl transition-all duration-300 ${inputValue.trim() && !isLoading
                                    ? 'bg-gradient-to-tr from-[#4D96FF] to-[#2563EB] text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40 hover:scale-105 active:scale-95'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                    }`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 12h14M12 5l7 7-7 7" /></svg>
                            </button>
                        </div>
                        <div className="flex items-center justify-center gap-1.5 mt-3 opacity-60">
                            <span className="text-[10px] font-bold text-slate-400 tracking-wider">POWERED BY WESHOOT AI</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-[60px] h-[60px] rounded-full shadow-[0_20px_40px_rgba(77,150,255,0.4)] flex items-center justify-center transition-all duration-500 z-50 border-[3px] border-white active:scale-90 ${isOpen ? 'bg-[#0F172A] rotate-90 scale-90' : 'bg-gradient-to-br from-[#4D96FF] to-[#2563EB] hover:scale-110 hover:-translate-y-1'
                    }`}
            >
                {isOpen ? (
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                ) : (
                    <div className="relative w-8 h-8">
                        <svg className="w-8 h-8 text-white absolute inset-0 transition-all duration-300 opacity-100 scale-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                    </div>
                )}
            </button>
        </div>
    );
};

export default ChatWidget;
