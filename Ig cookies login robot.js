// ==UserScript==
// @name         Instagram Smart Login
// @namespace    local-helper
// @version      45.0
// @match        https://www.instagram.com/*
// @match        https://accountscenter.instagram.com/*
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';

    // ব্রাউজার ওপেন হলে সরাসরি ইনস্টাগ্রামে নিয়ে যাওয়া
    if (window.location.hostname !== 'www.instagram.com' && window.location.hostname !== 'accountscenter.instagram.com') {
        window.location.href = "https://www.instagram.com/";
        return;
    }

    // ==========================================
    // পার্ট ১: ইনস্টাগ্রাম লগইন পেজ (বক্স তৈরি)
    // ==========================================
    if (window.location.hostname === 'www.instagram.com') {
        setTimeout(function() {
            var isLoginPage = document.querySelector('input[name="username"]') || document.body.innerText.includes('Log in');
            if (!isLoginPage) return; 

            var overlay = document.createElement('div');
            overlay.style.cssText = `position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.6); z-index: 9999999; display: flex; align-items: center; justify-content: center; font-family: sans-serif;`;

            var box = document.createElement('div');
            box.style.cssText = `position: relative; width: 400px; max-width: 90%; background: #fff; border-radius: 12px; padding: 20px; box-sizing: border-box; box-shadow: 0 10px 30px rgba(0,0,0,0.3);`;

            var closeBtn = document.createElement('div');
            closeBtn.innerHTML = '❌';
            closeBtn.style.cssText = `position: absolute; top: 10px; right: 15px; font-size: 18px; cursor: pointer; color: #888; transition: color 0.2s; user-select: none;`;
            closeBtn.onmouseover = function() { closeBtn.style.color = '#ed4956'; };
            closeBtn.onmouseout = function() { closeBtn.style.color = '#888'; };
            closeBtn.addEventListener('click', function() { overlay.remove(); });

            var title = document.createElement('h2');
            title.textContent = '👨‍🎓 Instagram Login';
            title.style.cssText = `margin: 0 0 15px; font-size: 18px; text-align: center; color: #262626;`;

            var textarea = document.createElement('textarea');
            textarea.placeholder = 'Paste cookies here...';
            textarea.style.cssText = `width: 100%; height: 100px; border: 1px solid #ccc; border-radius: 8px; padding: 10px; font-family: monospace; box-sizing: border-box; outline: none; background: #fafafa; margin-bottom: 15px;`;

            var loginBtn = document.createElement('button');
            loginBtn.textContent = 'Login';
            loginBtn.style.cssText = `width: 100%; padding: 12px; background: #0095f6; color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 16px;`;

            loginBtn.addEventListener('click', function () {
                var rawText = textarea.value.trim();
                if (!rawText) { alert("⚠️ আগে কুকি পেস্ট করুন!"); return; }

                var c = rawText;
                if (rawText.includes("|")) {
                    var parts = rawText.split("|");
                    c = parts[parts.length - 1].trim(); 
                }

                try {
                    navigator.clipboard.writeText(c);
                } catch (e) {}

                var p = c.split(";");
                for (var i = 0; i < p.length; i++) {
                    var kv = p[i].trim().split("=");
                    if (kv.length >= 2) {
                        var n = kv[0].trim();
                        var v = kv.slice(1).join("=");
                        document.cookie = n + "=" + v + ";path=/;domain=.instagram.com";
                        document.cookie = n + "=" + v + ";path=/;domain=instagram.com";
                        document.cookie = n + "=" + v + ";path=/;domain=www.instagram.com";
                    }
                }

                loginBtn.textContent = 'Logging in...';
                loginBtn.style.background = '#0077cc';
                loginBtn.disabled = true;

                setTimeout(function () {
                    window.location.href = "https://accountscenter.instagram.com/?entry_point=app_settings";
                }, 500); 
            });

            box.appendChild(closeBtn);
            box.appendChild(title);
            box.appendChild(textarea);
            box.appendChild(loginBtn);
            overlay.appendChild(box);
            document.body.appendChild(overlay);
            textarea.focus();

        }, 1000); 
    }

    // ==========================================
    // পার্ট ২: Accounts Center-এ কাজ করা (Smart Speed V45)
    // ==========================================
    if (window.location.hostname === 'accountscenter.instagram.com') {
        
        function clickSpecificText(text) {
            var elements = document.querySelectorAll('span, div');
            for (var i = 0; i < elements.length; i++) {
                if (elements[i].textContent.trim() === text && elements[i].children.length === 0) {
                    var clickable = elements[i].closest('div[role="button"], a, button, div[tabindex="0"]');
                    if (clickable) {
                        clickable.click();
                        console.log("Clicked on: " + text);
                        return true;
                    }
                }
            }
            return false;
        }

        function clearOldUsername() {
            var inputField = document.querySelector('input[type="text"]');
            if (!inputField) return false; 
            inputField.focus();
            inputField.click();
            inputField.select();
            document.execCommand('delete', false, null); 
            return true;
        }

        function autoClickDone() {
            var buttons = document.querySelectorAll('div[role="button"], button');
            for (var i = 0; i < buttons.length; i++) {
                var txt = buttons[i].textContent.trim().toLowerCase();
                if (txt === 'done' || txt === 'save') {
                    var style = window.getComputedStyle(buttons[i]);
                    if (style.pointerEvents !== 'none' && buttons[i].getAttribute('aria-disabled') !== 'true') {
                        buttons[i].click();
                        return true;
                    }
                }
            }
            return false;
        }

        // --- মূল সিকোয়েন্স (স্মার্ট স্পিডিং) ---
        setTimeout(function() {
            var step = 0;
            var lock = false; 

            // ৫০০ms এর বদলে ৩০০ms (আরও ফাস্ট)
            var sequence = setInterval(function() {
                
                if (lock) return; 

                if (step === 0) {
                    var profileClicked = clickSpecificText("1 profile") || 
                                         clickSpecificText("2 profiles") || 
                                         clickSpecificText("profiles") || 
                                         clickSpecificText("Profile");
                    
                    if (profileClicked) { 
                        step = 1; 
                        lock = true; 
                        // পেজ লোড হওয়ার জন্য ১.৫ সেকেন্ডের বদলে ১ সেকেন্ড অপেক্ষা
                        setTimeout(function() { lock = false; }, 1000); 
                    }
                } 
                else if (step === 1) {
                    if (clickSpecificText("Instagram")) { 
                        step = 2; 
                        lock = true; 
                        setTimeout(function() { lock = false; }, 1000); 
                    }
                }
                else if (step === 2) {
                    if (clickSpecificText("Username")) { 
                        step = 3; 
                        clearInterval(sequence); 
                        
                        var findBox = setInterval(function() {
                            var inputField = document.querySelector('input[type="text"]');
                            if (inputField) {
                                clearInterval(findBox);
                                clearOldUsername();
                                
                                var waitForDone = setInterval(function() {
                                    if (autoClickDone()) {
                                        clearInterval(waitForDone);
                                    }
                                }, 300); // Done বাটনও ০.৩ সেকেন্ড পর পর চেক করবে
                            }
                        }, 300);
                    }
                }
                
            }, 300); // স্মার্ট চেকিং
        }, 1000); 
    }

})();