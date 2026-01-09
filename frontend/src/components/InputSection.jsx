import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Search, Upload, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function InputSection({ text, setText, onAnalyze, loading }) {
    const { t } = useTranslation();
    const [uploading, setUploading] = useState(false);
    const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type !== 'application/pdf' && !file.type.startsWith('image/')) {
            alert(t('upload_error_type'));
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post(`${API_BASE}/extract_text`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setText(response.data.text);
        } catch (err) {
            console.error(err);
            alert(t('upload_error_generic'));
        } finally {
            setUploading(false);
            // Reset input
            event.target.value = '';
        }
    };

    return (
        <div className="card space-y-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-3 text-slate-800">
                <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-brand-600" />
                </div>
                {t('input_placeholder')}
            </h2>

            <div className="group relative">
                <label className="flex flex-col items-center gap-3 p-8 border-2 border-dashed border-surface-200 rounded-2xl hover:bg-surface-50 hover:border-brand-300 cursor-pointer transition-all duration-300 text-slate-500 hover:text-brand-600">
                    <input
                        type="file"
                        accept=".pdf, .jpg, .jpeg, .png, .webp"
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploading}
                    />
                    <div className="p-3 bg-surface-100 rounded-full group-hover:bg-brand-50 transition-colors">
                        {uploading ? <Loader2 className="w-6 h-6 animate-spin text-brand-500" /> : <Upload className="w-6 h-6" />}
                    </div>
                    <div className="text-center">
                        <span className="font-semibold text-sm block mb-1">
                            {uploading ? t('upload_processing') : t('upload_label')}
                        </span>
                        <span className="text-xs text-slate-400">PDF, JPG, PNG (Max 10MB)</span>
                    </div>
                </label>
            </div>

            <textarea
                className="input-field min-h-[200px] font-mono text-sm resize-y"
                placeholder={t('input_placeholder')}
                value={text}
                onChange={(e) => setText(e.target.value)}
            />
            <div className="flex justify-end pt-2">
                <button
                    className="btn btn-primary w-full sm:w-auto"
                    onClick={onAnalyze}
                    disabled={!text || loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {t('analyzing')}
                        </>
                    ) : (
                        <>
                            <Search className="w-4 h-4" />
                            {t('analyze_button')}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
