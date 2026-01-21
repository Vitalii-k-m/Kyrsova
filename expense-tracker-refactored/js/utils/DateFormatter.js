export const DateFormatter = {
    toUkrainianFormat(dateStr) {
        if (!dateStr) return "";
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        return `${parts[2]}.${parts[1]}.${parts[0]}`;
    },

    getCurrentISODate() {
        return new Date().toISOString().split('T')[0];
    }
};