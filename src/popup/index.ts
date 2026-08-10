const toolButtons = document.querySelectorAll<HTMLButtonElement>('[data-tool]');
const orientationButtons = document.querySelectorAll<HTMLButtonElement>('[data-ruler-orientation]');
const gridSizeInput = document.querySelector<HTMLInputElement>('#grid-size-input');
const gridGuidesToggle = document.querySelector<HTMLInputElement>('#grid-center-guides');
const gridApplyButton = document.querySelector<HTMLButtonElement>('#grid-apply-button');

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

gridApplyButton?.addEventListener('click', async () => {
  const gridSize = Number(gridSizeInput?.value ?? 8);
  const showCenterGuides = Boolean(gridGuidesToggle?.checked ?? false);

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab?.id) {
    await chrome.tabs.sendMessage(tab.id, {
      type: 'GRID_CONFIG',
      gridSize,
      showCenterGuides
    });
  }
});
