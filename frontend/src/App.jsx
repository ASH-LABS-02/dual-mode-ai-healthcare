import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Activity, User, Stethoscope, ChevronDown, Globe, Clock, Plus } from 'lucide-react';
import InputSection from './components/InputSection';
import PatientView from './components/PatientView';
import ClinicianView from './components/ClinicianView';
import RedFlagBanner from './components/RedFlagBanner';
import Disclaimer from './components/Disclaimer';
import HistoryList from './components/HistoryList';
import HistoryDetail from './components/HistoryDetail';

function App() {
    const { t, i18n } = useTranslation();
    const [text, setText] = useState('');
    const [mode, setMode] = useState('patient'); // 'patient' or 'clinician'

    // Navigation State
    const [view, setView] = useState('home'); // 'home' | 'history'
    const [selectedReportId, setSelectedReportId] = useState(null);

    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleAnalyze = async () => {
        setLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            let langName = 'English';
            if (i18n.language.startsWith('es')) langName = 'Spanish';
            else if (i18n.language.startsWith('fr')) langName = 'French';
            else if (i18n.language.startsWith('zh')) langName = 'Mandarin';
            else if (i18n.language.startsWith('hi')) langName = 'Hindi';

            const response = await axios.post('http://127.0.0.1:8000/analyze', {
                text,
                mode,
                language: langName
            });
            setAnalysis(response.data);
            // Optionally auto-switch to details or just show result. Result is nice.
        } catch (err) {
            console.error(err);
            const msg = err.response?.data?.detail || 'Failed to analyze report. Please ensure the backend is running.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleHistorySelect = (id) => {
        setSelectedReportId(id);
        // We stay in history view, but the component renderer handles list vs detail
        // Or we can let App handle the switching. Let's let App handle it for simplicity of state.
    };

    const handleBackToHome = () => {
        setView('home');
        setSelectedReportId(null);
        // Clear analysis? No, let's keep it so user can go back and forth if they want.
    };

    const handleBackToHistoryList = () => {
        setSelectedReportId(null);
    };

    const renderContent = () => {
        if (view === 'history') {
            if (selectedReportId) {
                return (
                    <HistoryDetail
                        reportId={selectedReportId}
                        onBack={handleBackToHistoryList}
                    />
                );
            }
            return (
                <HistoryList
                    onSelectReport={handleHistorySelect}
                />
            );
        }

        // Home View
        return (
            <>
                {/* Red Flags - Always visible if present in current analysis */}
                {analysis && <RedFlagBanner flags={analysis.red_flags} />}

                <div className="grid lg:grid-cols-2 gap-8">
                    {/* Left Column: Input */}
                    <div className="space-y-6">
                        <InputSection
                            text={text}
                            setText={setText}
                            onAnalyze={handleAnalyze}
                            loading={loading}
                        />

                        {error && (
                            <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
                                {error}
                            </div>
                        )}

                        <div className="bg-blue-50 p-4 rounded-md text-sm text-blue-800 border border-blue-100">
                            <h4 className="font-bold mb-2">{t('try_sample')}</h4>
                            <p className="mb-2">{t('copy_content')}</p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li>{t('sample_1')}</li>
                                <li>{t('sample_2')}</li>
                            </ul>
                        </div>
                    </div>

                    {/* Right Column: Output */}
                    {/* Right Column: Output */}
                    <div>
                        {analysis ? (
                            <div className="flex flex-col gap-4">
                                {/* Actions Toolbar */}
                                {analysis.id && (
                                    <div className="flex justify-end">
                                        <a
                                            href={`http://127.0.0.1:8000/history/${analysis.id}/pdf`}
                                            className="flex items-center gap-2 text-sm font-semibold text-brand-600 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                                            Download PDF
                                        </a>
                                    </div>
                                )}

                                {mode === 'patient' ? (
                                    <PatientView
                                        analysis={analysis.patient_analysis}
                                        extraction={analysis.extraction}
                                    />
                                ) : (
                                    <ClinicianView
                                        analysis={analysis.clinician_analysis}
                                        extraction={analysis.extraction}
                                    />
                                )}
                            </div>
                        ) : (
                            <div className="h-full min-h-[500px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl bg-surface-50/50">
                                <Activity className="w-16 h-16 mb-4 text-slate-300" />
                                <p className="font-medium">{t('analysis_waiting')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-brand-100 selection:text-brand-900">
            {/* Header */}
            <header className="glass-header sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div
                        className="flex items-center gap-2.5 group cursor-pointer"
                        onClick={handleBackToHome}
                    >
                        <div className="p-2 bg-brand-50 rounded-lg group-hover:bg-brand-100 transition-colors">
                            <Activity className="w-6 h-6 text-brand-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                                {t('app_title')}
                            </h1>
                            <p className="text-xs font-medium text-slate-500 tracking-wide uppercase mt-0.5">Medical AI Assistant</p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-center">
                        {/* Navigation Buttons */}
                        <div className="flex bg-surface-100 p-1 rounded-xl border border-surface-200">
                            <button
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${view === 'home' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                onClick={() => setView('home')}
                            >
                                <Plus className="w-4 h-4" />
                                New Analysis
                            </button>
                            <button
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${view === 'history' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                onClick={() => setView('history')}
                            >
                                <Clock className="w-4 h-4" />
                                History
                            </button>
                        </div>

                        {/* View Mode (Only show on home) */}
                        {view === 'home' && (
                            <div className="flex bg-surface-100 p-1 rounded-xl border border-surface-200 hidden sm:flex">
                                <button
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${mode === 'patient' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    onClick={() => setMode('patient')}
                                >
                                    <User className="w-4 h-4" />
                                    {t('mode_patient')}
                                </button>
                                <button
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${mode === 'clinician' ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    onClick={() => setMode('clinician')}
                                >
                                    <Stethoscope className="w-4 h-4" />
                                    {t('mode_clinician')}
                                </button>
                            </div>
                        )}

                        {/* Language Selector */}
                        <div className="relative group hidden sm:block">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                            <select
                                value={i18n.language}
                                onChange={(e) => i18n.changeLanguage(e.target.value)}
                                className="pl-9 pr-8 py-2 bg-surface-50 border border-surface-200 rounded-lg text-sm font-medium text-slate-600 hover:border-brand-300 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none appearance-none cursor-pointer transition-all"
                            >
                                <option value="en">English</option>
                                <option value="es">Spanish</option>
                                <option value="fr">French</option>
                                <option value="zh">Mandarin</option>
                                <option value="hi">Hindi</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {renderContent()}
            </main>

            <Disclaimer />
        </div>
    );
}

export default App;
