import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { User, CheckCircle, AlertCircle, HelpCircle, Volume2, StopCircle } from 'lucide-react';


export default function PatientView({ analysis, extraction }) {
    const { t } = useTranslation();
    const [speaking, setSpeaking] = useState(false);

    if (!analysis) return null;

    const handleSpeak = () => {
        if (speaking) {
            window.speechSynthesis.cancel();
            setSpeaking(false);
            return;
        }

        const text = `${t('patient_summary_prefix')} ${analysis.summary}. ${t('key_points_prefix')} ${analysis.key_points.join('. ')}`;
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.onend = () => setSpeaking(false);
        setSpeaking(true);
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Summary Card with TTS */}
            {/* Summary Card with TTS */}
            <div className="card bg-brand-50/50 border-brand-100">
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold flex items-center gap-3 text-brand-900">
                        <div className="p-2 bg-white rounded-lg shadow-sm text-brand-600">
                            <User className="w-6 h-6" />
                        </div>
                        {t('summary_title')}
                    </h3>
                    <button
                        onClick={handleSpeak}
                        className="btn btn-secondary text-xs py-1.5 px-3 h-auto gap-1.5"
                    >
                        {speaking ? <StopCircle className="w-4 h-4 text-red-500" /> : <Volume2 className="w-4 h-4 text-brand-500" />}
                        {speaking ? t('stop') : t('listen')}
                    </button>
                </div>
                <p className="text-lg leading-relaxed text-slate-700 font-medium">
                    {analysis.summary}
                </p>
            </div>



            {/* Why This Was Noted (New Section) */}
            <div className="card">
                <h4 className="font-bold flex items-center gap-2 mb-3 text-slate-900 border-b border-surface-200 pb-2">
                    <HelpCircle className="w-5 h-5 text-brand-500" />
                    {t('why_noted_title')}
                </h4>
                <p className="text-slate-600 leading-relaxed">
                    {analysis.why_noted}
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="card h-full bg-green-50/50 border-green-100">
                    <h4 className="font-bold flex items-center gap-2 mb-4 text-green-800">
                        <CheckCircle className="w-5 h-5" />
                        {t('key_points_title')}
                    </h4>
                    <ul className="space-y-3">
                        {analysis.key_points.map((point, i) => (
                            <li key={i} className="flex gap-3 text-slate-700">
                                <span className="text-green-500 font-bold">•</span>
                                <span>{point}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="card h-full bg-amber-50/50 border-amber-100">
                    <h4 className="font-bold flex items-center gap-2 mb-4 text-amber-800">
                        <AlertCircle className="w-5 h-5" />
                        {t('what_means_title')}
                    </h4>
                    <ul className="space-y-3">
                        {analysis.what_this_means.map((step, i) => (
                            <li key={i} className="flex gap-3 text-slate-700">
                                <span className="text-amber-500 font-bold">→</span>
                                <span>{step}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="card bg-brand-900 text-white">
                <h4 className="font-bold flex items-center gap-2 mb-4 text-white/90 border-b border-white/20 pb-2">
                    <HelpCircle className="w-5 h-5" />
                    {t('questions_title')}
                </h4>
                <ul className="space-y-3">
                    {analysis.questions_to_ask.map((q, i) => (
                        <li key={i} className="flex gap-3 items-start text-brand-50">
                            <span className="font-bold bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-xs flex-shrink-0 mt-0.5">?</span>
                            <span>{q}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
