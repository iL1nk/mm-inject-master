var isEnabled = false,

    enableActionIcon = function () {
      chrome.browserAction.setTitle({
        title: 'mm-inject on'
      });

      chrome.browserAction.setIcon({
        path: 'src/assets/icon.png'
      });

      chrome.browserAction.setBadgeBackgroundColor({
        color: '#449d44'
      });

      chrome.browserAction.setBadgeText({
        text: 'on'
      });
    },

    disableActionIcon = function () {
      chrome.browserAction.setTitle({
        title: 'mm-inject off'
      });

      chrome.browserAction.setIcon({
        path: 'src/assets/icon_off.png'
      })

      chrome.browserAction.setBadgeBackgroundColor({
        color: '#666666'
      });

      chrome.browserAction.setBadgeText({
        text: 'off'
      });
    };

// listen to `mm-inject.js` to update state
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request && request.settings && request.settings.enabled) {
    isEnabled = request.settings.enabled;
    enableActionIcon();
  } else {
    isEnabled = false;
    disableActionIcon();
  }
});

// reject defaul `mmcore/mmapi` on the page if it should be replaced
chrome.webRequest.onBeforeRequest.addListener(function (details) {
  var url = details.url,
      type = details.type;

  if (/mmcore.js|mmapi.js/g.test(url)
      && !/mm-inject-mmapi|mm-inject-mmcore/g.test(url)
      && type === 'script'
      && isEnabled) {

    return {
      cancel: true
    };
  }
}, {urls: ["http://*/*", "https://*/*"]}, ['blocking']);

// get `enabled` setting from `popup.js`
chrome.extension.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(msg) {
    isEnabled = !!msg;
  });
});