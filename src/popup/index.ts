const toolButtons = document.querySelectorAll<HTMLButtonElement>('[data-tool]');
const orientationButtons = document.querySelectorAll<HTMLButtonElement>('[data-ruler-orientation]');

toolButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const tool = button.getAttribute('data-tool');
    if (!tool) {
      return;
    }

    await chrome.storage.local.set({ activeTool: tool });

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      await chrome.tabs.sendMessage(tab.id, {
        type: 'TOOL_TOGGLE',
        tool
      });
    }
  });
});

orientationButtons.forEach((button) => {
  button.addEventListener('click', async () => {
    const orientation = button.getAttribute('data-ruler-orientation');
    if (!orientation) {
      return;
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.id) {
      await chrome.tabs.sendMessage(tab.id, {
        type: 'RULER_ORIENTATION',
        orientation
      });
    }
  });
});
