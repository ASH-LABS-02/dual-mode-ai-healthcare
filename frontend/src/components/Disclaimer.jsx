import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Disclaimer() {
    const { t } = useTranslation();
    return (
        <footer className="mt-12 py-8 border-t border-surface-200 text-center text-xs text-slate-400">
            <p className="max-w-2xl mx-auto leading-relaxed">
                <strong className="text-slate-500 block mb-1">{t('disclaimer_title')}</strong>
                {t('disclaimer_text_1')} {t('disclaimer_text_2')}
            </p>
        </footer>
    );
}
