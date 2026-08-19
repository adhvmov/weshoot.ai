import React, { useState, useRef } from 'react';

import api from '../../services/api';

const AssetSelectionModal = ({ isOpen, onClose, onSelect, title = "Select Image" }) => {
    const [assets, setAssets] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const fileInputRef = useRef(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const tempId = Date.now();
            const tempUrl = URL.createObjectURL(file);

            setIsUploading(true);
            const newAsset = { id: tempId, url: tempUrl, file, isUploaded: false };
            // Optimistic update
            setAssets(prev => [...prev, newAsset]);
            setSelectedAsset(newAsset);

            const formData = new FormData();
            formData.append('file', file);

            try {
                const response = await api.post('/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                if (response.data.success) {
                    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
                    const serverUrl = `${baseUrl.replace(/\/$/, '')}${response.data.url.startsWith('/') ? response.data.url : '/' + response.data.url}`;
                    setAssets(prev => prev.map(a => a.id === tempId ? { ...a, url: serverUrl, isUploaded: true } : a));
                    setSelectedAsset(prev => prev && prev.id === tempId ? { ...prev, url: serverUrl, isUploaded: true } : prev);
                }
            } catch (error) {
                console.error("Asset upload failed:", error);
                // Revert on failure
                setAssets(prev => prev.filter(a => a.id !== tempId));
                setSelectedAsset(null);
            } finally {
                setIsUploading(false);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
            <div className="flex flex-col items-center max-h-[90vh]">
                <div className="bg-white rounded-[32px] shadow-2xl w-[600px] max-w-full flex flex-col border-[12px] border-[#F5F8FF] overflow-hidden animate-in zoom-in-95 duration-300">
                    <div className="pt-10 px-10 pb-2 text-center">
                        <h3 className="text-3xl font-black text-[#0F172A] tracking-tight mb-2">{title}</h3>
                        <p className="text-[#64748B] font-medium">Choose from your library or upload new</p>
                    </div>

                    <div className="p-8 overflow-y-auto flex-1 custom-scrollbar min-h-[300px] max-h-[500px]">
                        <div className="grid grid-cols-4 gap-4">
                            {/* Upload Button */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-square border-2 border-dashed border-[#E2E8F0] rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-[#4D96FF] hover:bg-[#F5F8FF] transition-all group"
                            >
                                <div className="w-10 h-10 bg-[#F1F5F9] rounded-full flex items-center justify-center mb-2 group-hover:bg-[#4D96FF]/10 transition-colors">
                                    <svg className="w-5 h-5 text-[#94A3B8] group-hover:text-[#4D96FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                                </div>
                                <span className="text-xs font-bold text-[#64748B] group-hover:text-[#4D96FF]">Upload</span>
                                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                            </div>

                            {/* Assets */}
                            {assets.map(asset => (
                                <div
                                    key={asset.id}
                                    onClick={() => setSelectedAsset(asset)}
                                    className={`aspect-square rounded-2xl overflow-hidden relative cursor-pointer border-[3px] transition-all group ${selectedAsset?.id === asset.id ? 'border-[#4D96FF] ring-2 ring-[#4D96FF]/20' : 'border-transparent hover:border-[#E2E8F0]'}`}
                                >
                                    <img src={asset.url} className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${!asset.isUploaded ? 'opacity-50 grayscale blur-[2px]' : ''}`} alt="" />
                                    {!asset.isUploaded && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-5 h-5 border-2 border-[#4D96FF] border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    )}
                                    {selectedAsset?.id === asset.id && asset.isUploaded && (
                                        <div className="absolute top-2 right-2 w-6 h-6 bg-[#4D96FF] rounded-full flex items-center justify-center shadow-md animate-in zoom-in duration-200">
                                            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 border-t border-gray-100 flex justify-center gap-4 bg-gray-50/50 backdrop-blur-sm">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 text-sm font-bold text-[#64748B] hover:text-[#0F172A] transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                if (selectedAsset) {
                                    onSelect(selectedAsset.url);
                                    onClose();
                                }
                            }}
                            disabled={!selectedAsset || !selectedAsset.isUploaded || isUploading}
                            className="px-8 py-3 text-sm font-bold text-white bg-gradient-to-r from-[#4D96FF] to-[#2563EB] rounded-xl hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                        >
                            {isUploading ? 'Uploading...' : 'Get Access'}
                        </button>
                    </div>
                </div>

                {/* External Close Button */}
                <button
                    onClick={onClose}
                    className="mt-8 w-12 h-12 bg-white rounded-2xl border-2 border-[#F5F8FF] shadow-2xl flex items-center justify-center text-[#94A3B8] hover:text-[#0F172A] hover:scale-110 active:scale-95 transition-all duration-300"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>
        </div>
    );
};

export default AssetSelectionModal;
