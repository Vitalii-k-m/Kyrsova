import { STORAGE_KEYS } from '../config/settings.js';
import * as Storage from '../modules/storage.js';
import * as UI from '../modules/ui.js';

export function handleAddTransaction(formData) {
    // 1. Створюємо об'єкт транзакції з отриманих даних
    const newTransaction = {
        id: Date.now(),
        ...formData,
        amount: parseFloat(formData.amount)
    };

    // 2. Отримуємо поточний список та додаємо нову
    const transactions = Storage.get(STORAGE_KEYS.TRANSACTIONS) || [];
    transactions.push(newTransaction);

    // 3. Зберігаємо та оновлюємо інтерфейс
    Storage.save(STORAGE_KEYS.TRANSACTIONS, transactions);
    UI.refreshDashboard(transactions);

    UI.notify('Транзакцію додано успішно!', 'success');
}

export function handleDeleteTransaction(id) {
    if (!confirm("Ви впевнені, що хочете видалити цей запис?")) return;

    const transactions = Storage.get(STORAGE_KEYS.TRANSACTIONS) || [];
    const filtered = transactions.filter(t => t.id !== id);

    Storage.save(STORAGE_KEYS.TRANSACTIONS, filtered);
    UI.refreshDashboard(filtered);
}

export function handleFilterChange(filters) {
    const transactions = Storage.get(STORAGE_KEYS.TRANSACTIONS) || [];

    const filtered = transactions.filter(t => {
        const searchMatch = t.name.toLowerCase().includes(filters.search.toLowerCase());
        const catMatch = filters.category === 'all' || t.category === filters.category;
        const typeMatch = filters.type === 'all' || t.type === filters.type;
        return searchMatch && catMatch && typeMatch;
    });

    UI.renderTable(filtered);
    UI.updateCharts(filtered);
}