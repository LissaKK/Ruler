import { ToolManager } from '../shared/ToolManager';

const toolManager = new ToolManager();

function ensureCanvas(): HTMLCanvasElement {
  const existing = document.getElementById('ruler-extension-canvas') as HTMLCanvasElement | null;
  if (existing) {
    return existing;
  }

  const canvas = document.createElement('canvas');
  canvas.id = 'ruler-extension-canvas';
  canvas.width = Math.max(window.innerWidth, 1);
  canvas.height = Math.max(window.innerHeight, 1);
  canvas.style.position = 'fixed';
  canvas.style.left = '0';
  canvas.style.top = '0';
  canvas.style.width = '100vw';
  canvas.style.height = '100vh';
  canvas.style.zIndex = '2147483647';
  canvas.style.pointerEvents = 'none';
  canvas.style.display = 'block';

  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  document.documentElement.appendChild(canvas);
  return canvas;
}

function syncCanvasSize(canvas: HTMLCanvasElement) {
  canvas.width = Math.max(window.innerWidth, 1);
  canvas.height = Math.max(window.innerHeight, 1);
}

function init() {
  const canvas = ensureCanvas();
  toolManager.bindCanvas(canvas);
  toolManager.setCanvasVisibility(false);

  window.addEventListener('resize', () => {
    syncCanvasSize(canvas);
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'TOOL_TOGGLE') {
      const tool = String(message.tool ?? 'ruler');
      toolManager.activateTool(tool);

      const isActive = toolManager.isAnyToolActive();
      toolManager.setCanvasVisibility(isActive);
      sendResponse({ ok: true, activeTool: tool, canvasEnabled: isActive });
    }

    return true;
  });
}

init();
