export const Validators = {
    isEmpty(value) {
        return !value || value.trim().length === 0;
    },

    isPositiveNumber(value) {
        const num = parseFloat(value);
        return !isNaN(num) && num > 0;
    },

    hasNoHtml(value) {
        return typeof value === 'string' && !/[<>]/.test(value);
    }
};