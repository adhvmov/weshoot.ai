import React from 'react';

const DeleteImageModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="flex flex-col items-center max-h-[95vh] w-full max-w-[500px] px-4">
                <div className="bg-white rounded-[32px] shadow-2xl w-full flex flex-col border-[12px] border-[#F5F8FF] overflow-hidden animate-in zoom-in-95 duration-300">
                    <div className="p-10">
                        {/* Header with Warning Icon */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center shrink-0 shadow-lg shadow-red-500/20">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-black text-[#0F172A] tracking-tight">You are about to delete the image</h2>
                        </div>

                        {/* Body Content */}
                        <div className="space-y-6 mb-10">
                            <p className="text-[#475569] font-bold text-[15px] leading-relaxed">
                                This action will delete the image itself and all of its versions.
                            </p>
                            <p className="text-[#475569] font-bold text-[15px] leading-relaxed">
                                If you want to go back to the previous image version, consider using the Undo button instead.
                            </p>
                            <p className="text-[#0F172A] font-black text-[15px]">
                                Choose how to proceed:
                            </p>
                        </div>

                        {/* Footer Buttons */}
                        <div className="flex gap-4">
                            <button
                                onClick={onConfirm}
                                className="flex-1 py-4 bg-white border-2 border-[#E2E8F0] text-[#0F172A] rounded-2xl font-black text-[13px] flex items-center justify-center gap-2 hover:bg-red-50 hover:border-red-200 hover:text-red-500 transition-all active:scale-95 shadow-sm"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                            </button>
                            <button
                                onClick={onClose}
                                className="flex-1 py-4 bg-[#0F172A] text-white rounded-2xl font-black text-[13px] hover:bg-[#1E293B] transition-all active:scale-95 shadow-lg shadow-[#0F172A]/10"
                            >
                                Keep
                            </button>
                        </div>
                    </div>
                </div>

                {/* External Close Button (As in PricingModal) */}
                <button
                    onClick={onClose}
                    className="mt-8 w-12 h-12 bg-white rounded-2xl border-2 border-[#F5F8FF] shadow-2xl flex items-center justify-center text-[#94A3B8] hover:text-[#0F172A] hover:scale-110 active:scale-95 transition-all duration-300"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default DeleteImageModal;
