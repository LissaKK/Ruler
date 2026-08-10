chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ activeTool: 'ruler' });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'CAPTURE_VISIBLE_TAB') {
    chrome.tabs.captureVisibleTab({ format: 'png' }, (imageDataUrl) => {
      if (chrome.runtime.lastError) {
        sendResponse({ ok: false, error: chrome.runtime.lastError.message });
      } else {
        sendResponse({ ok: true, imageDataUrl });
      }
    });

    return true;
  }

  return false;
});

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.id) {
    return;
  }

  const current = await chrome.storage.local.get(['activeTool']);
  const activeTool = current.activeTool ?? 'ruler';

  await chrome.tabs.sendMessage(tab.id, {
    type: 'TOOL_TOGGLE',
    tool: activeTool
  });
});
