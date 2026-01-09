const HISTORY_KEY = 'dual_mode_ai_history';

export const saveToHistory = (analysis) => {
    try {
        const historyJson = localStorage.getItem(HISTORY_KEY);
        let history = historyJson ? JSON.parse(historyJson) : [];

        // Check if report with same ID (if exists) is already saved
        if (analysis.id) {
            const existingIndex = history.findIndex(h => h.id === analysis.id);
            if (existingIndex >= 0) {
                // Update existing? Or just return? Let's return to avoid duplicates
                return;
            }
        }

        // Add new analysis to top
        history.unshift(analysis);

        // Limit to 50 items to prevent storage issues
        if (history.length > 50) {
            history = history.slice(0, 50);
        }

        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch (e) {
        console.error("Failed to save to history:", e);
    }
};

export const getHistory = () => {
    try {
        const historyJson = localStorage.getItem(HISTORY_KEY);
        return historyJson ? JSON.parse(historyJson) : [];
    } catch (e) {
        console.error("Failed to read history:", e);
        return [];
    }
};

export const getReport = (id) => {
    try {
        const history = getHistory();
        return history.find(h => h.id === id) || null;
    } catch (e) {
        return null;
    }
};
