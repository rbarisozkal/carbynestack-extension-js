// Import any dependencies you need
// For example, you might use the chrome.runtime API for Chrome extension communication
// const chrome = require('chrome');
// Define a function to send a message from the web app to the Chrome extension
function sendMessageToExtension(message, crxId) {
  // Use the chrome.runtime.sendMessage method to send a message to the extension
  // You can customize this based on your extension's needs
  let data = { ...message };
  chrome.runtime.sendMessage(
    crxId,
    {
      type: "data",
      data: data,
    },
    (response) => {
      console.log(response);
    }
  );
}
function onMessageExternal() {
  chrome.runtime.onMessageExternal.addListener(
    (request, sender, sendResponse) => {
      console.log("request", request);
      console.log("sender", sender);
      switch (request.type) {
        case "data":
          chrome.runtime.openOptionsPage(() => {
            chrome.storage.local.set({ data: request.data }, () => {
              console.log("Data stored and options page opened.");
            });
          });
          // @ts-ignore
          let url = new URL(
            chrome.runtime.getURL("src/popup/index.html?message=form")
          );
          let width = 320;
          let height = 500;

          // @ts-ignore
          chrome.windows.getCurrent((win) => {
            // @ts-ignore
            chrome.windows.create({
              url: url.href,
              type: "popup",
              focused: true,
              width: width,
              height: height,
              // positioned top-right
              top: win.top + 75,
              left: win.left + win.width - width,
            });
          });

          break;
        case "get_secret":
          console.log("get_secret");
          break;
        default:
          console.log("undefined type");
          break;
      }
    }
  );
}

// In your library
function getDataFromLocalStorage(callback) {
  chrome.storage.local.get(["data"], (result) => {
    const data = result.data;
    console.log(data, "data get from local storage");
    callback(data);
    if (data) {
      console.log(data);
      callback(data);
    } else {
    }
  });
}

async function sendDataToWebApp(url, carbynestackData) {
  const data = carbynestackData;
  // Send a message to the content script of a specific tab
  chrome.tabs.query({ url: url }, (tabs) => {
    tabs.forEach((tab) => {
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: (data) => {
          window.postMessage(
            {
              fromExtension: true,
              message: "Form data received from extension:",
              data: data,
            },
            "*"
          );
        },
        args: [data], // Pass the form data to the content script
      });
    });
  });
}

// Export the functions or classes you've defined
module.exports = {
  sendMessageToExtension,
  getDataFromLocalStorage,
  sendDataToWebApp,
  onMessageExternal,
};
