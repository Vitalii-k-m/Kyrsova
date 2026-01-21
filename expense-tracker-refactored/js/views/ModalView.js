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
    }
};