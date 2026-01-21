import { STORAGE_KEYS, INITIAL_TRANSACTIONS } from './config/constants.js';
import { StorageService } from './services/StorageService.js';
import { AnalyticsService } from './services/AnalyticsService.js';
import { ExportService } from './services/ExportService.js';
import * as TransactionController from './controllers/TransactionController.js';
import * as BudgetController from './controllers/BudgetController.js';
import { TableView } from './views/TableView.js';
import { DashboardView } from './views/DashboardView.js';
import { ModalView } from './views/ModalView.js';
import { DateFormatter } from './utils/DateFormatter.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log("[System]: Ініціалізація ректорованої системи...");
    initApp();
    setupEventListeners();
});

function initApp() {
    let transactions = StorageService.load(STORAGE_KEYS.TRANSACTIONS);

    if (!transactions) {
        transactions = INITIAL_TRANSACTIONS;
        StorageService.save(STORAGE_KEYS.TRANSACTIONS, transactions);
    }

    const dateInput = document.getElementById('inpDate');
    if (dateInput) {
        dateInput.value = DateFormatter.getCurrentISODate();
    }

    refreshUI(transactions);
}

function refreshUI(transactions) {
    const summary = AnalyticsService.getSummary(transactions);
    const budgetLimit = StorageService.load(STORAGE_KEYS.BUDGET_LIMIT) || 0;

    DashboardView.updateSummary(summary);
    DashboardView.updateBudget(budgetLimit, summary.expenses);
    TableView.render(transactions, TransactionController.handleDeleteTransaction);
}

function setupEventListeners() {
    document.getElementById('btnOpenModal').addEventListener('click', () => {
        ModalView.show('addTransactionModal');
    });

    const btnSave = document.querySelector('.btn-save');
    if (btnSave) {
        btnSave.addEventListener('click', () => {
            const formData = ModalView.getFormData();
            TransactionController.handleAddTransaction(formData);

            refreshUI(StorageService.load(STORAGE_KEYS.TRANSACTIONS));
            ModalView.hide('addTransactionModal');
        });
    }

    document.getElementById('btnExport').addEventListener('click', () => {
        const transactions = StorageService.load(STORAGE_KEYS.TRANSACTIONS);
        ExportService.exportToCSV(transactions);
    });

    const filters = ['globalSearch', 'categoryFilter', 'typeFilter', 'dateFilter'];
    filters.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', () => {
                const currentFilters = {
                    search: document.getElementById('globalSearch').value,
                    category: document.getElementById('categoryFilter').value,
                    type: document.getElementById('typeFilter').value
                };
                TransactionController.handleFilterChange(currentFilters);
            });
        }
    });
}