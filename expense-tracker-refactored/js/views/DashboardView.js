import { Helpers } from '../utils/Helpers.js';

export const DashboardView = {

    updateSummary(summary) {
        document.getElementById('display-total-balance').innerText = Helpers.formatCurrency(summary.balance);
        // Оновлення окремих полів, якщо вони є в DOM
    },

    updateBudget(limit, spent) {
        const bar = document.getElementById('budget-progress');
        const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;

        bar.style.width = `${percent}%`;

        if (percent >= 90) bar.style.backgroundColor = 'var(--danger-color)';
        else if (percent >= 70) bar.style.backgroundColor = 'var(--warning-color)';
        else bar.style.backgroundColor = 'var(--success-color)';
    }
};