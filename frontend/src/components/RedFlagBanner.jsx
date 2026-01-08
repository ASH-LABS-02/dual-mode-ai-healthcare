import React from 'react';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';

export default function RedFlagBanner({ flags }) {
    const { t } = useTranslation();
    if (!flags || flags.length === 0) return null;

    return (
        <div className="bg-red-500 text-white p-4 rounded-xl shadow-lg shadow-red-500/20 mb-6 animate-pulse-slow">
            <div className="flex items-start gap-4">
                <div className="p-2 bg-white/20 rounded-lg">
                    <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                </div>
                <div>
                    <h3 className="font-bold text-lg mb-1">{t('red_flags_alert')}</h3>
                    <ul className="list-disc pl-4 space-y-1 text-red-50 font-medium">
                        {flags.map((flag, i) => (
                            <li key={i}>{flag}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}
