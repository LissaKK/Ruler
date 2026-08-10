import { ToolManager, ToolName } from '../shared/ToolManager';
import { RulerTool, RulerOrientation } from './tools/ruler';
import { ProtractorTool } from './tools/protractor';
import { EyedropperTool } from './tools/eyedropper';
import { DistanceTool } from './tools/distance';
import { GridTool } from './tools/grid';
import { ElementInspectorTool } from './tools/inspector';

const toolManager = new ToolManager();
let canvas: HTMLCanvasElement | null = null;
let canvasContext: CanvasRenderingContext2D | null = null;
let rafHandle = 0;
let inspectorRafHandle = 0;
let inspectorLatestX = 0;
let inspectorLatestY = 0;

const rulerTool = (() => {
  return new RulerTool(undefined as unknown as HTMLCanvasElement);
})();

const protractorTool = new ProtractorTool();
const eyedropperTool = new EyedropperTool();
const distanceTool = new DistanceTool();
const gridTool = new GridTool();
const inspectorTool = new ElementInspectorTool();

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

  if (toolManager.getActiveTool() === 'distance') {
    distanceTool.draw();
  }

  if (toolManager.getActiveTool() === 'grid') {
    gridTool.draw();
  }

  if (toolManager.getActiveTool() === 'size') {
    inspectorTool.draw();
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

function scheduleInspectorHover(x: number, y: number): void {
  inspectorLatestX = x;
  inspectorLatestY = y;

  if (inspectorRafHandle !== 0) {
    return;
  }

  inspectorRafHandle = window.requestAnimationFrame(() => {
    if (toolManager.getActiveTool() === 'size' && inspectorTool.isActive()) {
      inspectorTool.updateHover(inspectorLatestX, inspectorLatestY);
      scheduleRedraw();
    }

    inspectorRafHandle = 0;
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

    if (toolManager.getActiveTool() === 'distance' && distanceTool.isActive()) {
      if (distanceTool.getMode() === 'drawing') {
        distanceTool.updateDraft(event.clientX, event.clientY);
        scheduleRedraw();
      }

      if (distanceTool.isDragging()) {
        distanceTool.moveDrag(event.clientX, event.clientY);
        scheduleRedraw();
      }
    }

    if (toolManager.getActiveTool() === 'size' && inspectorTool.isActive()) {
      scheduleInspectorHover(event.clientX, event.clientY);
    }
  });

  window.addEventListener('mousedown', (event: MouseEvent) => {
    if (toolManager.getActiveTool() !== 'distance') {
      return;
    }

    if (distanceTool.isActive() && distanceTool.getMode() === 'committed') {
      if (distanceTool.startDrag(event.clientX, event.clientY)) {
        event.preventDefault();
      }
    }
  });

  window.addEventListener('mouseup', () => {
    if (toolManager.getActiveTool() !== 'distance') {
      return;
    }

    if (distanceTool.isActive()) {
      distanceTool.endDrag();
    }
  });

  window.addEventListener('click', async (event: MouseEvent) => {
    if (toolManager.getActiveTool() === 'eyedropper') {
      if (eyedropperTool.isActive()) {
        await eyedropperTool.sampleAtViewportPosition(event.clientX, event.clientY);
      }
      return;
    }

    if (toolManager.getActiveTool() === 'distance') {
      if (distanceTool.isActive()) {
        if (distanceTool.getMode() === 'idle') {
          distanceTool.begin(event.clientX, event.clientY);
        } else if (distanceTool.getMode() === 'drawing') {
          distanceTool.begin(event.clientX, event.clientY);
        } else if (distanceTool.getMode() === 'committed') {
          distanceTool.reset();
          distanceTool.begin(event.clientX, event.clientY);
        }

        scheduleRedraw();
      }
      return;
    }

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

      if (activeTool === 'eyedropper') {
        eyedropperTool.activate();
      } else {
        eyedropperTool.deactivate();
      }

      if (activeTool === 'distance') {
        distanceTool.activate();
      } else {
        distanceTool.deactivate();
      }

      if (activeTool === 'grid') {
        gridTool.activate();
      } else {
        gridTool.deactivate();
      }

      if (activeTool === 'size') {
        inspectorTool.activate();
      } else {
        inspectorTool.deactivate();
      }

      scheduleRedraw();
      sendResponse({ ok: true, activeTool, canvasEnabled: isActive });
    }

    if (message?.type === 'GRID_CONFIG') {
      const gridSize = Number(message.gridSize ?? 8);
      const showGuides = Boolean(message.showCenterGuides ?? false);
      gridTool.setGridSize(gridSize);
      gridTool.setCenterGuides(showGuides);
      scheduleRedraw();
      sendResponse({ ok: true, gridSize: gridTool.getGridSize(), showCenterGuides: gridTool.isCenterGuidesVisible() });
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
