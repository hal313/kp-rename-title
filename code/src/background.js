// TODO: Object-ify code
// TODO: Open new tab on upgrade
// TODO: Only update if needed (dont forget to remove from the index tracker!)
// TODO: Documentation
// TODO: Screenshots
// TODO: Build scripts

var KEY_URL = "urls";

var memoryStorage = (function () {
    var cache = {};

    return {
        clear: function(callback) {
            cache = {};
            if (callback) {
                callback();
            }
        },
        set: function (object, callback) {
            cache = object;
            if (callback) {
                callback();
            }
        },
        get: function (callback) {
            if (callback) {
                callback(cache);
            }
        }
    };
})();

// var storage = chrome.storage.local;
// var storage = memoryStorage;
var storage = chrome.storage.sync;


function clearOptions(successCallback, failureCallback) {
    storage.clear(function () {
        var error = chrome.runtime.lastError;

        if (error) {
            if (failureCallback) {
                failureCallback();
            }
        } else {
            if (successCallback) {
                successCallback();
            }
        }
    });
}

function saveOption(key, value, successCallback, failureCallback) {
    // TODO: Preserve other options!
    var optionsObject = {};
    optionsObject[key] = value;
    storage.set(optionsObject, function () {
        var error = chrome.runtime.lastError;

        if (error) {
            if (failureCallback) {
                failureCallback(key, value, error);
            }
        } else {
            if (successCallback) {
                successCallback(key, value);
            }
        }

    });
}

function getOption(key, defaultValue, successCallback, failureCallback) {
    storage.get(function (result) {

        var error = chrome.runtime.lastError;
        var value = result[key] || defaultValue;

        if (error) {
            if (failureCallback) {
                failureCallback(key, defaultValue, error);
            }
        } else {
            if (successCallback) {
                successCallback(key, value);
            }
        }

    });
}

function saveURLOption(url) {
    saveOption(KEY_URL, url, function () {
        // Save the local copy!
        localURLs = url;
    });
}

function getURLOption(successCallback, failureCallback) {
    getOption(KEY_URL, {}, function (key, value) {
        if (successCallback) {
            successCallback(value);
        }
    }, failureCallback);
}

// Add listeners for updates
chrome.tabs.onCreated.addListener(function(tab) {
	evaluateAndRename(tab);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    evaluateAndRename(tab);
});

function evaluateAndRename(tab) {

    var index, regexObject;

    if (null !== localURLs) {
        for (index in localURLs) {
            if (new RegExp(localURLs[index].regex).test(tab.url)) {
                console.log(localURLs[index])
                chrome.tabs.executeScript(tab.id, { code: 'document.title="' + localURLs[index].title + '"' });
                return;
            }
        }
    }
}

var localURLs;
document.addEventListener('DOMContentLoaded', function () {
    // Load the options on plugin load
    getURLOption(function (value) {
        localURLs = value;
    });
});
