export const Helpers = {
    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    },

    formatCurrency(amount, currency = 'грн') {
        return `${parseFloat(amount).toFixed(2)} ${currency}`;
    }
};