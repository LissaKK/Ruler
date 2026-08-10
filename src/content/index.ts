import { ToolManager, ToolName } from '../shared/ToolManager';
import { RulerTool, RulerOrientation } from './tools/ruler';
import { ProtractorTool } from './tools/protractor';

const toolManager = new ToolManager();
let canvas: HTMLCanvasElement | null = null;
let canvasContext: CanvasRenderingContext2D | null = null;
let rafHandle = 0;

const rulerTool = (() => {
  return new RulerTool(undefined as unknown as HTMLCanvasElement);
})();

const protractorTool = new ProtractorTool();

function ensureCanvas(): HTMLCanvasElement {
  const existing = document.getElementById('ruler-extension-canvas') as HTMLCanvasElement | null;
  if (existing) {
    return existing;
  }

  const newCanvas = document.createElement('canvas');
  newCanvas.id = 'ruler-extension-canvas';
  newCanvas.width = Math.max(window.innerWidth, 1);
  newCanvas.height = Math.max(window.innerHeight, 1);
  newCanvas.style.position = 'fixed';
  newCanvas.style.left = '0';
  newCanvas.style.top = '0';
  newCanvas.style.width = `${Math.max(window.innerWidth, 1)}px`;
  newCanvas.style.height = `${Math.max(window.innerHeight, 1)}px`;
  newCanvas.style.zIndex = '2147483647';
  newCanvas.style.pointerEvents = 'none';
  newCanvas.style.display = 'none';

  document.documentElement.appendChild(newCanvas);
  return newCanvas;
}

function resizeCanvas(): void {
  if (!canvas) {
    return;
  }

  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(window.innerWidth, 1);
  const height = Math.max(window.innerHeight, 1);

  const desiredWidth = Math.round(width * dpr);
  const desiredHeight = Math.round(height * dpr);

  if (canvas.width !== desiredWidth || canvas.height !== desiredHeight) {
    canvas.width = desiredWidth;
    canvas.height = desiredHeight;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    if (canvasContext) {
      canvasContext.setTransform(1, 0, 0, 1, 0, 0);
      canvasContext.scale(dpr, dpr);
    }
  }
}

function redrawOverlay(): void {
  if (!canvas || !canvasContext) {
    return;
  }

  const width = Math.max(window.innerWidth, 1);
  const height = Math.max(window.innerHeight, 1);
  const dpr = window.devicePixelRatio || 1;

  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;

  canvasContext.setTransform(1, 0, 0, 1, 0, 0);
  canvasContext.scale(dpr, dpr);
  canvasContext.clearRect(0, 0, width, height);

  if (toolManager.getActiveTool() === 'ruler') {
    rulerTool.draw();
  }

  if (toolManager.getActiveTool() === 'protractor') {
    protractorTool.draw();
  }
}

function scheduleRedraw(): void {
  if (rafHandle !== 0) {
    return;
  }

  rafHandle = window.requestAnimationFrame(() => {
    redrawOverlay();
    rafHandle = 0;
  });
}

function init() {
  canvas = ensureCanvas();
  canvasContext = canvas.getContext('2d');

  resizeCanvas();

  toolManager.bindCanvas(canvas);
  toolManager.setCanvasVisibility(false);

  rulerTool.setCanvas(canvas);
  rulerTool.setOrientation('both');
  protractorTool.setCanvas(canvas);

  window.addEventListener('resize', () => {
    resizeCanvas();
    scheduleRedraw();
  });

  window.addEventListener('scroll', () => {
    scheduleRedraw();
  }, { passive: true });

  window.addEventListener('mousemove', (event: MouseEvent) => {
    if (toolManager.getActiveTool() === 'protractor' && protractorTool.isActive()) {
      if (protractorTool.getMode() === 'drawing') {
        protractorTool.update(event.clientX, event.clientY, event.shiftKey);
        scheduleRedraw();
      }
    }
  });

  window.addEventListener('click', (event: MouseEvent) => {
    if (toolManager.getActiveTool() !== 'protractor') {
      return;
    }

    if (event.altKey) {
      protractorTool.reset();
      scheduleRedraw();
      return;
    }

    if (protractorTool.isActive()) {
      if (protractorTool.getMode() === 'idle') {
        protractorTool.begin(event.clientX, event.clientY);
      } else if (protractorTool.getMode() === 'drawing') {
        protractorTool.finalize();
      } else if (protractorTool.getMode() === 'locked') {
        protractorTool.reset();
      }

      scheduleRedraw();
    }
  });

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type === 'TOOL_TOGGLE') {
      const tool = String(message.tool ?? 'ruler');
      const activeTool = toolManager.activateTool(tool);

      const isActive = toolManager.isAnyToolActive();
      toolManager.setCanvasVisibility(isActive);

      if (activeTool === 'ruler') {
        rulerTool.activate();
        rulerTool.draw();
      } else {
        rulerTool.deactivate();
      }

      if (activeTool === 'protractor') {
        protractorTool.activate();
      } else {
        protractorTool.deactivate();
      }

      scheduleRedraw();
      sendResponse({ ok: true, activeTool, canvasEnabled: isActive });
    }

    if (message?.type === 'RULER_ORIENTATION') {
      const orientation = String(message.orientation ?? 'both') as RulerOrientation;
      if (orientation === 'horizontal' || orientation === 'vertical' || orientation === 'both') {
        rulerTool.setOrientation(orientation);
        scheduleRedraw();
      }
      sendResponse({ ok: true, orientation: rulerTool.getOrientation() });
    }

    return true;
  });
}

init();
