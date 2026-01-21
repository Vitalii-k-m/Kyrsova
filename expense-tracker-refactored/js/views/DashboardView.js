import { Helpers } from '../utils/Helpers.js';
import { AnalyticsService } from '../services/AnalyticsService.js';

let expenseChartInstance = null;
export const DashboardView = {

    updateSummary(summary) {
        const balanceEl = document.getElementById('display-total-balance');
        if (balanceEl) {
            balanceEl.innerText = Helpers.formatCurrency(summary.balance);
        }
    },

    updateBudget(limit, spent) {
        const bar = document.getElementById('budget-progress');
        if (!bar) return;

        const percent = limit > 0 ? Math.min((spent / limit) * 100, 100) : 0;
        bar.style.width = `${percent}%`;

        if (percent >= 90) bar.style.backgroundColor = 'var(--danger-color)';
        else if (percent >= 70) bar.style.backgroundColor = 'var(--warning-color)';
        else bar.style.backgroundColor = 'var(--success-color)';
    },

    updateChart(transactions) {
        const ctx = document.getElementById('expenseChart');
        if (!ctx) return;

        const categoryTotals = AnalyticsService.getExpenseTotalsByCategory(transactions);
        const labels = Object.keys(categoryTotals);
        const data = Object.values(categoryTotals);

        if (expenseChartInstance) {
            expenseChartInstance.data.labels = labels;
            expenseChartInstance.data.datasets[0].data = data;
            expenseChartInstance.update();
        } else {
            expenseChartInstance = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: labels,
                    datasets: [{
                        data: data,
                        backgroundColor: [
                            '#3498db', '#2ecc71', '#e74c3c', '#f1c40f', '#9b59b6', '#1abc9c', '#34495e'
                        ],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'bottom' }
                    }
                }
            });
        }
    }
};