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
// Define a function to receive messages from the Chrome extension in the web app
function listenForExtensionMessages(callback) {
  // Use chrome.runtime.onMessage.addListener to listen for messages from the extension
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    // Check if the message is from the extension
    if (message.fromExtension) {
      // Handle the received message
      console.log("Message received from extension:", message.message);
      // You can pass the message to a callback for further processing
      callback(message);
    }
  });
}
function getDataFromLocalStorage(data) {
  chrome.storage.local.get([data], (result) => {
    const data = result.data;
    console.log(data, "data get from local storage");
    if (data) {
      console.log(data);
    }
  });
}
async function sendDataToWebApp(url, carbynestackData) {
  const data = {
    ...carbynestackData,
  };
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
  listenForExtensionMessages,
  getDataFromLocalStorage,
  sendDataToWebApp,
};
