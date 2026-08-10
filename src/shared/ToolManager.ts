export type ToolName = 'ruler' | 'protractor' | 'eyedropper' | 'distance' | 'grid' | 'size';

export class ToolManager {
  private activeTool: ToolName | null = null;
  private canvas: HTMLCanvasElement | null = null;

  public bindCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
  }

  public activateTool(tool: string): void {
    const normalized = this.normalizeTool(tool);
    this.activeTool = normalized;

    if (this.canvas) {
      this.canvas.style.pointerEvents = normalized === null ? 'none' : 'auto';
    }
  }

  public deactivateTool(): void {
    this.activeTool = null;
    if (this.canvas) {
      this.canvas.style.pointerEvents = 'none';
    }
  }

  public isAnyToolActive(): boolean {
    return this.activeTool !== null;
  }

  public getActiveTool(): ToolName | null {
    return this.activeTool;
  }

  public setCanvasVisibility(visible: boolean): void {
    if (!this.canvas) {
      return;
    }

    this.canvas.style.display = visible ? 'block' : 'none';
  }

  private normalizeTool(tool: string): ToolName | null {
    const validTools: ToolName[] = ['ruler', 'protractor', 'eyedropper', 'distance', 'grid', 'size'];
    const normalized = String(tool).toLowerCase();
    return validTools.includes(normalized as ToolName) ? normalized as ToolName : null;
  }
}
