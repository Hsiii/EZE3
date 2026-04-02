// EZE3 | Premium Portal Automation Configuration
document.addEventListener('DOMContentLoaded', () => {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const saveBtn = document.getElementById('save');
    const messageEl = document.getElementById('message');

    const showMessage = (text, type = 'success') => {
        messageEl.textContent = text;
        messageEl.className = `message ${type} show`;
        setTimeout(() => {
            messageEl.classList.remove('show');
        }, 3000);
    };

    // Load saved credentials
    chrome.storage.local.get(['nycu_username', 'nycu_password'], (result) => {
        if (result.nycu_username) {
            usernameInput.value = result.nycu_username;
        }
        if (result.nycu_password) {
            passwordInput.value = result.nycu_password;
        }
    });

    // Save credentials with validation
    saveBtn.addEventListener('click', () => {
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();

        if (!username || !password) {
            showMessage('MISSING FIELDS', 'error');
            return;
        }

        // Add visual feedback
        saveBtn.disabled = true;
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saving...';

        chrome.storage.local.set({
            nycu_username: username,
            nycu_password: password
        }, () => {
            showMessage('Saved!', 'success');
            saveBtn.disabled = false;
            saveBtn.textContent = originalText;
        });
    });

    // Focus username by default if empty
    if (!usernameInput.value) {
        usernameInput.focus();
    }
});
