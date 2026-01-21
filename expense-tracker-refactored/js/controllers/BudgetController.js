import { STORAGE_KEYS } from '../config/settings.js';
import { StorageService } from '../services/StorageService.js';
import { AnalyticsService } from '../services/AnalyticsService.js';
import { DashboardView } from '../views/DashboardView.js';
import { NotificationView } from '../views/NotificationView.js';
export function handleUpdateBudget(limit) {
    const numericLimit = parseFloat(limit);

    if (isNaN(numericLimit) || numericLimit < 0) {
        NotificationView.show('Введіть коректну суму бюджету!', 'error');
        return;
    }

    StorageService.save(STORAGE_KEYS.BUDGET_LIMIT, numericLimit);

    const transactions = StorageService.load(STORAGE_KEYS.TRANSACTIONS) || [];
    const summary = AnalyticsService.getSummary(transactions);

    DashboardView.updateBudget(numericLimit, summary.expenses);

    NotificationView.show('Бюджет оновлено!', 'success');
}