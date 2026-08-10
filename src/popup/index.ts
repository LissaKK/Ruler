const toolButtons = document.querySelectorAll<HTMLButtonElement>('[data-tool]');

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
