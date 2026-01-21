import { STORAGE_KEYS } from '../config/settings.js';
import * as Storage from '../modules/storage.js';
import * as UI from '../modules/ui.js';

export function handleUpdateBudget(limit) {
    const numericLimit = parseFloat(limit);

    if (isNaN(numericLimit) || numericLimit < 0) {
        UI.notify('Введіть коректну суму бюджету!', 'error');
        return;
    }

    Storage.save(STORAGE_KEYS.BUDGET_LIMIT, numericLimit);

    const transactions = Storage.get(STORAGE_KEYS.TRANSACTIONS) || [];
    UI.updateBudgetDisplay(numericLimit, transactions);

    UI.notify('Бюджет оновлено!', 'success');
}