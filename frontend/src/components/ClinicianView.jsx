import React from 'react';
import { useTranslation } from 'react-i18next';
import { Activity, AlertTriangle, FileText, List, CheckSquare } from 'lucide-react';


export default function ClinicianView({ analysis, extraction }) {
    const { t } = useTranslation();
    if (!analysis) return null;

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Impression */}
            <div className="card bg-slate-900 text-white border-slate-800">
                <h3 className="text-lg font-bold flex items-center gap-2 mb-3 text-brand-300 uppercase tracking-wider text-xs">
                    <Activity className="w-4 h-4" />
                    {t('impression_title')}
                </h3>
                <p className="font-mono text-sm leading-relaxed text-slate-300">
                    {analysis.impression}
                </p>
            </div>

            {/* Structured Findings (Fallback to bullet points if structured not available, though backend should provide) */}
            <div className="card">
                <h4 className="font-bold flex items-center gap-2 mb-4 text-slate-900 border-b border-surface-200 pb-2">
                    <FileText className="w-4 h-4 text-brand-600" />
                    {t('findings_title')}
                </h4>

                {analysis.findings ? (
                    <div className="space-y-4">
                        {analysis.findings.map((finding, i) => (
                            <div key={i} className="p-3 bg-surface-50 rounded-lg border border-surface-200">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-semibold text-sm text-slate-800">{finding.observation}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${finding.status === 'normal' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                        {finding.status}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500">{finding.location}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <ul className="list-disc pl-5 space-y-1 font-mono text-sm text-slate-600">
                        {analysis.findings_bullet_points?.map((point, i) => (
                            <li key={i}>{point}</li>
                        )) || <li className="text-slate-400 italic">No findings available</li>}
                    </ul>
                )}
            </div>



            <div className="grid md:grid-cols-2 gap-6">
                <div className="card">
                    <h4 className="font-bold flex items-center gap-2 mb-4 text-red-600 border-b border-red-100 pb-2">
                        <AlertTriangle className="w-4 h-4" />
                        {t('flagged_entities_title')}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {analysis.flagged_entities && analysis.flagged_entities.length > 0 ? (
                            analysis.flagged_entities.map((entity, i) => (
                                <span key={i} className="px-2.5 py-1 bg-red-50 text-red-700 rounded-md text-xs font-medium border border-red-100">
                                    {entity}
                                </span>
                            ))
                        ) : (
                            <span className="text-slate-400 text-sm italic">None</span>
                        )}
                    </div>
                </div>

                <div className="card">
                    <h4 className="font-bold flex items-center gap-2 mb-4 text-brand-600 border-b border-brand-100 pb-2">
                        <CheckSquare className="w-4 h-4" />
                        {t('recommendations_title')}
                    </h4>
                    <ul className="list-disc pl-4 space-y-2 text-sm text-slate-600">
                        {analysis.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
