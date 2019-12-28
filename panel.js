;(function createChannel() {
  //Create a port with background page for continous message communication
  var port = chrome.extension.connect({
    name: "Sample Communication" //Given a Name
  })

  // Listen to messages from the background page
  port.onMessage.addListener(function(message) {
    document.querySelector("#tagName").value = message.tagName
    document.querySelector("#tagId").value = message.id
    document.querySelector("#name").value = message.name
    document.querySelector("#className").value = message.class
    document.querySelector("#xpath").value = message.xpath
    document.querySelector("#cssPath").value = message.cssPath
    // port.postMessage(message);
  })
})()

function sendObjectToInspectedPage(message) {
  message.tabId = chrome.devtools.inspectedWindow.tabId
  chrome.extension.sendMessage(message)
}

document.querySelector("#inspectElement").addEventListener(
  "click",
  function() {
    sendObjectToInspectedPage({ action: "script", content: "inspector.js" })
  },
  false
)

// document.querySelector("#clearscript").addEventListener(
//   "click",
//   function() {
//     sendObjectToInspectedPage({
//       action: "clear-script",
//       content: "clearscript.js"
//     })
//   },
//   false
// )

// document.querySelector("#executescript").addEventListener(
//   "click",
//   function() {
//     sendObjectToInspectedPage({
//       action: "code",
//       content: "alert('Inline script executed')"
//     })
//   },
//   false
// )
