// EZE3 | Premium Portal Automation Content Script

(function() {
    const DEBUG = false;
    const log = (...args) => DEBUG && console.log('[EZE3]', ...args);

    // 1. Redirect if we are on the legacy E3 login page
    if (window.location.hostname === 'e3p.nycu.edu.tw' && window.location.pathname.includes('/login/index.php')) {
        log('Legacy login detected. Redirecting to NYCU Portal...');
        window.location.href = 'https://portal.nycu.edu.tw/';
        return;
    }

    function fillLogin(username, password) {
        const accountField = document.querySelector('#account');
        const passwordField = document.querySelector('#password');
        const loginBtn = document.querySelector('button.carbon-button--primary');

        if (accountField && passwordField) {
            log('Initiating automation...');
            accountField.value = username;
            passwordField.value = password;

            // Trigger input events to ensure the page's React/Vue/etc state updates
            accountField.dispatchEvent(new Event('input', { bubbles: true }));
            passwordField.dispatchEvent(new Event('input', { bubbles: true }));

            if (loginBtn) {
                log('Authenticating...');
                loginBtn.click();
            }
        }
    }

    function monitorFor2FA() {
        log('Monitoring for security verification...');
        const observer = new MutationObserver(() => {
            const otpPatterns = ['#otp', '[name="otp"]', 'input[placeholder*="驗證碼"]', 'input[placeholder*="OTP"]', 'input[placeholder*="Code"]'];
            
            for (const pattern of otpPatterns) {
                const otpField = document.querySelector(pattern);
                if (otpField) {
                    log('2FA required. Awaiting user input...');
                    otpField.focus();
                    observer.disconnect(); // Stop observing once 2FA field found
                    return;
                }
            }
        });

        observer.observe(document.body, { childList: true, subtree: true });
    }

    function handlePostLogin() {
        const currentHash = window.location.hash;
        
        // Dashboard redirection
        const isDashboard = currentHash === '' || currentHash === '#/' || currentHash === '#/home';
        if (!document.querySelector('#account') && isDashboard) {
            log('Session detected. Navigating to E3...');
            window.location.hash = '#/links/nycu';
        }

        // Automated link picking on the transition page
        if (currentHash === '#/links/nycu') {
            log('Locating New E3 redirect...');
            const e3LinkSelector = 'a[href="#/redirect/newe3p"]';
            let redirectFired = false; // Guard against double-fire
            
            const clickAndClose = (element) => {
                if (redirectFired) return;
                redirectFired = true;
                log('Redirecting to E3 now...');
                element.click();
                
                // After clicking, close this portal tab since it's no longer needed
                log('Job completed. Closing original portal tab...');
                setTimeout(() => {
                    chrome.runtime.sendMessage({ action: 'close_tab' }, () => {
                        if (chrome.runtime.lastError) {
                            log('Tab close message failed:', chrome.runtime.lastError.message);
                        }
                    });
                }, 1000); 
            };

            const e3LinkObserver = new MutationObserver(() => {
                const e3Link = document.querySelector(e3LinkSelector);
                if (e3Link) {
                    clickAndClose(e3Link);
                    e3LinkObserver.disconnect();
                }
            });
            e3LinkObserver.observe(document.body, { childList: true, subtree: true });

            const initialE3Link = document.querySelector(e3LinkSelector);
            if (initialE3Link) clickAndClose(initialE3Link);
        }
    }

    // Main deployment logic
    chrome.storage.local.get(['nycu_username', 'nycu_password'], (result) => {
        if (result.nycu_username && result.nycu_password) {
            if (document.querySelector('#account')) {
                fillLogin(result.nycu_username, result.nycu_password);
            } else {
                handlePostLogin();
            }
            monitorFor2FA();
            // Support SPAs - only register when credentials are present
            window.addEventListener('hashchange', handlePostLogin);
        } else {
            log('Automation engine active. Please configure student credentials in the options.');
        }
    });
})();
