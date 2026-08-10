export interface GridConfig {
  size: number;
  showCenterGuides: boolean;
}

export class GridTool {
  private canvas: HTMLCanvasElement | null = null;
  private active = false;
  private size = 8;
  private showCenterGuides = false;

  public constructor(canvas?: HTMLCanvasElement) {
    this.canvas = canvas ?? null;
  }

  public setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
  }

  public activate(): void {
    this.active = true;
  }

  public deactivate(): void {
    this.active = false;
  }

  public isActive(): boolean {
    return this.active;
  }

  public setGridSize(size: number): void {
    const normalized = Number.isFinite(size) ? Math.max(2, Math.round(size)) : 8;
    this.size = normalized;
  }

  public getGridSize(): number {
    return this.size;
  }

  public setCenterGuides(enabled: boolean): void {
    this.showCenterGuides = Boolean(enabled);
  }

  public isCenterGuidesVisible(): boolean {
    return this.showCenterGuides;
  }

  public draw(): void {
    if (!this.active || !this.canvas) {
      return;
    }

    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const width = Math.max(window.innerWidth, 1);
    const height = Math.max(window.innerHeight, 1);

    ctx.save();
    ctx.strokeStyle = 'rgba(30, 41, 59, 0.36)';
    ctx.lineWidth = 1;
    ctx.beginPath();

    for (let x = 0; x <= width; x += this.size) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
    }

    for (let y = 0; y <= height; y += this.size) {
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
    }

    ctx.stroke();

    if (this.showCenterGuides) {
      const centerX = Math.round(width / 2);
      const centerY = Math.round(height / 2);

      ctx.save();
      ctx.strokeStyle = 'rgba(249, 115, 22, 0.9)';
      ctx.setLineDash([2, 3]);
      ctx.lineWidth = 1;

      ctx.beginPath();
      ctx.moveTo(centerX, 0);
      ctx.lineTo(centerX, height);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();
  }
}
