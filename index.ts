// Import any dependencies you need
// For example, you might use the chrome.runtime API for Chrome extension communication

// Define a function to send a message from the web app to the Chrome extension
//@ts-nocheck
function sendMessageToExtension(message: any, crxId: string) {
  // Use the chrome.runtime.sendMessage method to send a message to the extension
  // You can customize this based on your extension's needs
  const data = { ...message };
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
//popup directory example : "src/popup/index.html?message=form"
function onMessageExternal(popupDirectory: string) {
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

          const url = new URL(
            chrome.runtime.getURL(popupDirectory)
          );
          const width = 320;
          const height = 500;

          chrome.windows.getCurrent((win) => {
            chrome.windows.create({
              url: url.href,
              type: "popup",
              focused: true,
              width: width,
              height: height,
              top: win.top + 75, // positioned top-right
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
function getDataFromLocalStorage(callback: (data: any) => void) {
  chrome.storage.local.get(["data"], (result) => {
    const data = result.data;
    console.log(data, "data get from local storage");
    callback(data);
  });
}

async function sendDataToWebApp(url: string, carbynestackData: any) {
  const data = carbynestackData;
  console.log(data, "data send to web app");
  // Send a message to the content script of a specific tab
  chrome.tabs.query({ url: url }, (tabs) => {
    tabs.forEach((tab) => {
      console.log(tab);

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
export {
  sendMessageToExtension,
  getDataFromLocalStorage,
  sendDataToWebApp,
  onMessageExternal,
};
