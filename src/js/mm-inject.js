/**
 * This script is invoked before any script is loaded and invoked on the page
 */
;(function () {
  var SETTINGS = 'mm-inject-settings',

      getSettings = function () {
        try {
          return JSON.parse(localStorage.getItem(SETTINGS));
        } catch(e) {
          return null;
        }
      },

      saveSettings = function (settings) {
        try {
          window.localStorage.setItem(SETTINGS, JSON.stringify(settings));
          return true;
        } catch(e) {
          return false;
        }
      },

      hideDocument = function () {
        var style = document.createElement('style');
        
        style.type = 'text/css';
        style.id = 'mm-inject-hide';
        style.innerHTML = 'html, body {\
                        visibility: hidden !important;\
                        background: none !important;\
                      }';

        document.documentElement.appendChild(style);
      },

      showDocument = function () {
        var style = document.getElementById('mm-inject-hide');
        style && style.parentNode.removeChild(style);
      },

      injectScript = function (settings) {
        var script = document.createElement('script'); 
        script.src = settings.api;
        document.documentElement.appendChild(script);
      },

      initialize = (function (settings) {
        // inject Maxymiser library if there are setting defined
        if (settings && settings.enabled) {
          hideDocument();
          injectScript(settings);
          setTimeout(showDocument, 5000);
        }

        // Listen to popup.js and respond with settings (if there are some)
        // to prepopulate the fields
        chrome.runtime.onMessage.addListener(function (req, sender, sendResp) {
          if (req.message === 'get settings') {
            sendResp({settings: getSettings()});
          } else if (req.message === 'apply settings' && req.settings) {
            saveSettings(req.settings) && window.location.reload(true);
          }
        });

        // send message to background page with `enable` setting
        chrome.runtime.sendMessage({settings: getSettings()});
      })(getSettings());
})();