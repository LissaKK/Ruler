chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ activeTool: 'ruler' });
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
