/**
 * send message to content script (mm-inject) to enquire information from local storage
 * if visitor changes settings send message to save info to local storage
 */

var settingsDict = {
      ui: [{
        baseContentUrl: '//service.maxymiser.net/platform/eu/api/',
        srv: 'service.maxymiser.net/cg/v5/?'
      }, {
        baseContentUrl: '//service.maxymiser.net/platform/demo/api/',
        srv: 'cg-demo.maxymiser.org/demo/?'
      }, {
        baseContentUrl: '//service.maxymiser.net/platform/us/api/',
        srv: 'service.maxymiser.net/cg/v5us/?'
      }, {
        baseContentUrl: '//service.maxymiser.qa/platformvcb/api/',
        srv: 'service.maxymiser.qa/cg/cg/?'
      }, {
        baseContentUrl: '//service.maxymiser.qa/platform/api/',
        srv: 'service.maxymiser.qa/cg/ad/ContentManager.ashx?'
      }],

      api: [
        'https://dl.dropboxusercontent.com/s/qxqdewghlo15cjz/mm-inject-mmapi.js',
        'https://dl.dropboxusercontent.com/s/g86epvzv5viyo60/mm-inject-mmcore.js'
      ]
    },

    getSettings = function () {
      var ui = $('#ui').val(),
          domain = $('#domain').val(),
          api = $('#api').val(),
          enabled = $('#toggle input')[0].checked;

      if (ui !== -1 && domain && api !== -1) {
        return {
          enabled: enabled,
          fields: [ui, domain, api],
          api: settingsDict.api[api],
          domain: domain,
          baseContentUrl: settingsDict.ui[ui].baseContentUrl,
          srv: settingsDict.ui[ui].srv
        };
      } else {
        return null;
      }

    },

    populateFields = function (settings) {
      if (settings.enabled) {
        $('#toggle input').bootstrapToggle('on');
      } else {
        $('#toggle input').bootstrapToggle('off');
      }

      $('#ui').val(settings.fields[0]);
      $('#domain').val(settings.fields[1]);
      $('#api').val(settings.fields[2]);
    },

    applySettings = function (settings) {
      chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        // notify mm-inject.js
        chrome.tabs.sendMessage(tabs[0].id, {message: 'apply settings', settings: settings});

        // notify background.js
        chrome.extension
          .connect({name: "background"})
          .postMessage(getSettings().enabled);

        window.close();
      });
    },

    initApplyHandler = function () {
      var applyBtn = document.getElementById('apply'),
          settings;

      applyBtn && apply.addEventListener('click', function (e) {

        settings = getSettings();
        if (settings) {
          applySettings(settings);
        }
      });
    },

    initialize = (function () {
      // request api settings to populate popup fields
      chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {message: 'get settings'}, function(resp) {
          if (resp && resp.settings) {
            populateFields(resp.settings);
          }
        });
      });

      // send settings by "Aplly" click
      initApplyHandler();
    })();
