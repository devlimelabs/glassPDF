chrome.runtime.onInstalled.addListener(() => {
  console.log('Glass PDF extension installed');
});

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  if (request.action === 'captureVisibleTab') {
    chrome.tabs.captureVisibleTab(
      { format: 'png' },
      (dataUrl) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError.message);
          sendResponse({ success: false, error: chrome.runtime.lastError.message });
        } else {
          sendResponse({ success: true, dataUrl });
        }
      }
    );
    return true; // Indicates that the response is sent asynchronously
  } else if (request.action === 'generatePdf') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.tabs.print({
          tabId: tabs[0].id,
          // Add print options here if needed
        }, (dataUrl) => {
          if (chrome.runtime.lastError) {
            console.error('Print API failed:', chrome.runtime.lastError.message);
            sendResponse({ success: false, error: chrome.runtime.lastError.message });
          } else if (dataUrl) {
            chrome.storage.local.set({ generatedPdfDataUrl: dataUrl }, () => {
              chrome.tabs.create({ url: chrome.runtime.getURL('src/viewer/index.html') });
              sendResponse({ success: true });
            });
          } else {
            sendResponse({ success: false, error: 'No data URL received from print API.' });
          }
        });
      }
    });
    return true; // Indicates that the response is sent asynchronously
  } else if (request.action === 'generatePdfWithCanvas') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].id) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          function: () => {
            // This function will be executed in the context of the content script
            // It will trigger the html2canvas capture and return the data URL
            return new Promise((resolve) => {
              chrome.runtime.sendMessage({ action: 'capturePageForPdf' }, (response) => {
                if (response.success) {
                  resolve(response.imageData);
                } else {
                  resolve(null);
                }
              });
            });
          },
        }, (results) => {
          if (results && results[0] && results[0].result) {
            const dataUrl = results[0].result;
            chrome.storage.local.set({ generatedPdfDataUrl: dataUrl }, () => {
              chrome.tabs.create({ url: chrome.runtime.getURL('src/viewer/index.html') });
              sendResponse({ success: true });
            });
          } else {
            sendResponse({ success: false, error: 'Failed to capture page with canvas.' });
          }
        });
      }
    });
    return true; // Indicates that the response is sent asynchronously
  }
  return true; // Keep the message channel open for async response
});