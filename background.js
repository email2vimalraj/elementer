chrome.extension.onConnect.addListener(function(port) {
  var extensionListener = function(message, sender, sendResponse) {
    if (message.tabId && message.content) {
      // Attach a script to inspected page
      if (message.action === "script") {
        // chrome.tabs.executeScript(message.tabId, {file: "assets/inspector.js"});
        chrome.tabs.executeScript(message.tabId, {
          file: message.content,
          allFrames: true // fix for iframe
        })
      } else if (message.action === "code") {
        chrome.tabs.executeScript(message.tabId, {
          code: message.content,
          allFrames: true // fix for iframe
        })
      } else if (message.action === "clear-script") {
        alert("Injecting clear script")
        chrome.tabs.executeScript(message.tabId, {
          code: "document.removeEventListener('mousemove', onMouseMove);",
          allFrames: true // fix for iframe
        })
      }
    } else {
      // alert(message);
      port.postMessage(message)
    }

    if (message.type === "selectedElement") {
      sendResponse(message)
    }

    // sendResponse(message);
  }

  // Listens to messages sent from panel
  chrome.extension.onMessage.addListener(extensionListener)

  port.onDisconnect.addListener(function(port) {
    chrome.extension.onMessage.removeListener(extensionListener)
  })
})

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.type === "selectedElement") {
    sendResponse(request)
  }

  return true
})
