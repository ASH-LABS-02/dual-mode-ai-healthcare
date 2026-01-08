
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Calendar, FileText, AlertTriangle, ArrowRight, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function HistoryList({ onSelectReport }) {
    const { t } = useTranslation();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8000/history');
                setHistory(response.data);
            } catch (err) {
                console.error("Failed to load history:", err);
                setError("Failed to load history. Is the backend running?");
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
                <p>Loading history...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5" />
                {error}
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="text-center p-12 bg-white rounded-xl border border-slate-200 shadow-sm">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900">No reports yet</h3>
                <p className="text-slate-500 mt-1">Analyzed reports will appear here automatically.</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                    <Clock className="w-6 h-6 text-brand-600" />
                    Report History
                </h2>
            </div>

            <div className="divide-y divide-slate-100">
                {history.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onSelectReport(item.id)}
                        className="w-full text-left p-4 sm:p-6 hover:bg-slate-50 transition-colors flex items-center justify-between group"
                    >
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-brand-50 text-brand-600 rounded-lg">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-slate-900">
                                        {formatDate(item.timestamp)}
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${item.report_type === 'Radiology'
                                            ? 'bg-purple-50 text-purple-700 border-purple-100'
                                            : 'bg-blue-50 text-blue-700 border-blue-100'
                                        }`}>
                                        {item.report_type}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {item.red_flags && item.red_flags.length > 0 ? (
                                        item.red_flags.map((flag, idx) => (
                                            <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                                                <AlertTriangle className="w-3 h-3" />
                                                {flag.length > 30 ? flag.substring(0, 30) + '...' : flag}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                            No red flags detected
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-brand-500 transition-colors" />
                    </button>
                ))}
            </div>
        </div>
    );
}

function formatDate(isoString) {
    if (!isoString) return '';
    return new Date(isoString).toLocaleString(undefined, {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit'
    });
}
