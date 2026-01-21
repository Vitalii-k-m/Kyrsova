export const StorageService = {
    save(key, data) {
        try {
            const serializedData = JSON.stringify(data);
            localStorage.setItem(key, serializedData);
        } catch (error) {
            console.error(`[StorageService]: Помилка збереження для ключа ${key}`, error);
        }
    },
    load(key) {
        const data = localStorage.getItem(key);
        if (!data) return null;
        try {
            return JSON.parse(data);
        } catch (error) {
            console.error(`[StorageService]: Помилка парсингу для ключа ${key}`);
            return null;
        }
    },

    clearAll() {
        localStorage.clear();
    }
};