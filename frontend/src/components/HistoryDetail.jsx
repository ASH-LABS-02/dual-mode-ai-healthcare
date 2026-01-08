
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { ArrowLeft, User, Stethoscope, FileText, Code, AlertTriangle } from 'lucide-react';
import PatientView from './PatientView';
import ClinicianView from './ClinicianView';
import RedFlagBanner from './RedFlagBanner';

export default function HistoryDetail({ reportId, onBack }) {
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('patient'); // 'patient' | 'clinician' | 'original' | 'json'

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const response = await axios.get(`http://127.0.0.1:8000/history/${reportId}`);
                setReport(response.data);
            } catch (err) {
                console.error("Failed to load report detail:", err);
                setError("Failed to load report details.");
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [reportId]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-slate-400">
                <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mb-4"></div>
                <p>Loading details...</p>
            </div>
        );
    }

    if (error || !report) {
        return (
            <div className="p-4">
                <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-800 mb-4">
                    <ArrowLeft className="w-4 h-4" /> Back to History
                </button>
                <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                    {error || "Report not found."}
                </div>
            </div>
        );
    }

    return (
        <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={onBack}
                    className="p-2 -ml-2 hover:bg-slate-100 rounded-full text-slate-500 hover:text-slate-900 transition-colors"
                    title="Back to History"
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">
                        Analysis Details
                    </h2>
                    <p className="text-sm text-slate-500">
                        {new Date(report.timestamp || Date.now()).toLocaleString()} • {report.extraction?.report_type || 'Unknown Type'}
                    </p>
                </div>
            </div>

            <RedFlagBanner flags={report.red_flags} />

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-1 overflow-x-auto">
                <TabButton
                    active={activeTab === 'patient'}
                    onClick={() => setActiveTab('patient')}
                    icon={<User className="w-4 h-4" />}
                    label="Patient View"
                />
                <TabButton
                    active={activeTab === 'clinician'}
                    onClick={() => setActiveTab('clinician')}
                    icon={<Stethoscope className="w-4 h-4" />}
                    label="Clinician View"
                />
                <TabButton
                    active={activeTab === 'original'}
                    onClick={() => setActiveTab('original')}
                    icon={<FileText className="w-4 h-4" />}
                    label="Original Text"
                />
                <TabButton
                    active={activeTab === 'json'}
                    onClick={() => setActiveTab('json')}
                    icon={<Code className="w-4 h-4" />}
                    label="Debug JSON"
                />
            </div>

            {/* Content Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px]">
                {activeTab === 'patient' && (
                    <div className="p-6">
                        {report.patient_analysis ? (
                            <PatientView
                                analysis={report.patient_analysis}
                                extraction={report.extraction}
                            />
                        ) : (
                            <EmptyState message="No Patient Analysis available for this report." />
                        )}
                    </div>
                )}

                {activeTab === 'clinician' && (
                    <div className="p-6">
                        {report.clinician_analysis ? (
                            <ClinicianView
                                analysis={report.clinician_analysis}
                                extraction={report.extraction}
                            />
                        ) : (
                            <EmptyState message="No Clinician Analysis available for this report." />
                        )}
                    </div>
                )}

                {activeTab === 'original' && (
                    <div className="p-6">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Original Report Text</h3>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 font-mono text-sm whitespace-pre-wrap text-slate-700">
                            {report.original_text}
                        </div>
                    </div>
                )}

                {activeTab === 'json' && (
                    <div className="p-6">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Structured Data Extraction</h3>
                        <pre className="bg-slate-900 text-slate-50 p-4 rounded-lg overflow-auto max-h-[600px] text-xs font-mono">
                            {JSON.stringify(report.extraction, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}

function TabButton({ active, onClick, icon, label }) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-4 py-2 rounded-t-lg text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${active
                    ? 'border-brand-500 text-brand-600 bg-brand-50/50'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                }`}
        >
            {icon}
            {label}
        </button>
    );
}

function EmptyState({ message }) {
    return (
        <div className="text-center py-12 text-slate-500">
            <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
            <p>{message}</p>
        </div>
    );
}
