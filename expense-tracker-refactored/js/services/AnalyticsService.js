export const AnalyticsService = {
    getExpenseTotalsByCategory(transactions) {
        return transactions
            .filter(t => t.type === 'expense')
            .reduce((acc, t) => {
                acc[t.category] = (acc[t.category] || 0) + t.amount;
                return acc;
            }, {});
    },
    getSummary(transactions) {
        return transactions.reduce((summary, t) => {
            if (t.type === 'income') {
                summary.income += t.amount;
                summary.balance += t.amount;
            } else {
                summary.expenses += t.amount;
                summary.balance -= t.amount;
            }
            return summary;
        }, { balance: 0, income: 0, expenses: 0 });
    }
};