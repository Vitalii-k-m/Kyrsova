export const BackupService = {

    exportToJSON(transactions, budgetLimit) {
        const dataStr = JSON.stringify({
            transactions: transactions,
            budget: budgetLimit,
            exportedAt: new Date().toISOString(),
            version: "2.0-refactored"
        }, null, 2);

        const blob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.setAttribute("href", url);
        link.setAttribute("download", `finance_backup_${new Date().toISOString().split('T')[0]}.json`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },

    importFromJSON(onSuccess, onError) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (readerEvent) => {
                try {
                    const imported = JSON.parse(readerEvent.target.result);
                    if (imported.transactions) {
                        onSuccess(imported);
                    } else {
                        throw new Error("Невірний формат файлу");
                    }
                } catch (err) {
                    onError("Помилка: Файл пошкоджено або має невірний формат!");
                }
            };
            reader.readAsText(file, 'UTF-8');
        };

        input.click();
    }
};