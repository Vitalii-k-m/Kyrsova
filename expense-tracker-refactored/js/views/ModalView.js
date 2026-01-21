export const ModalView = {
    show(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'block';
    },

    hide(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'none';
    },

    getFormData() {
        return {
            name: document.getElementById('inpName').value,
            amount: document.getElementById('inpAmount').value,
            type: document.getElementById('inpType').value,
            category: document.getElementById('inpCategory').value,
            date: document.getElementById('inpDate').value,
            comment: document.getElementById('inpComment').value
        };
    },

    fillForm(data) {
        document.getElementById('inpName').value = data.name;
        document.getElementById('inpAmount').value = data.amount;
        document.getElementById('inpType').value = data.type;
        document.getElementById('inpCategory').value = data.category;
        document.getElementById('inpDate').value = data.date;
        document.getElementById('inpComment').value = data.comment || "";
    },

    setEditMode(isEditing, transactionId = null) {
        const btnSave = document.querySelector('.btn-save');
        if (isEditing) {
            btnSave.innerText = "Оновити запис";
            btnSave.dataset.mode = 'edit';
            btnSave.dataset.id = transactionId;
        } else {
            btnSave.innerText = "Зберегти транзакцію";
            delete btnSave.dataset.mode;
            delete btnSave.dataset.id;
        }
    },

    clearForm() {
        document.getElementById('inpName').value = "";
        document.getElementById('inpAmount').value = "";
        document.getElementById('inpComment').value = "";
    }
};