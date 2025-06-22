document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('customAlertModal');
    const closeBtn = document.getElementById('customAlertClose');
    const messagePara = document.getElementById('customAlertMessage');
    const buttonsDiv = document.getElementById('customAlertButtons');
    const okBtn = document.getElementById('customAlertOk');
    const cancelBtn = document.getElementById('customAlertCancel');

    function closeModal() {
        modal.style.display = 'none';
        if (typeof window._customAlertCancelCallback === 'function') {
            window._customAlertCancelCallback();
            window._customAlertCancelCallback = null;
            window._customAlertOkCallback = null;
        }
    }

    closeBtn.addEventListener('click', closeModal);

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            closeModal();
        }
    });

    okBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        if (typeof window._customAlertOkCallback === 'function') {
            window._customAlertOkCallback();
            window._customAlertOkCallback = null;
            window._customAlertCancelCallback = null;
        }
    });

    cancelBtn.addEventListener('click', closeModal);

    window.showMessage = function(message, options = {}) {
        messagePara.textContent = message;
        if (options.showButtons) {
            buttonsDiv.style.display = 'flex';
            window._customAlertOkCallback = options.onOk || null;
            window._customAlertCancelCallback = options.onCancel || null;
        } else {
            buttonsDiv.style.display = 'none';
            window._customAlertOkCallback = null;
            window._customAlertCancelCallback = null;
        }
        modal.style.display = 'flex';
    };
});
