export type RulerOrientation = 'horizontal' | 'vertical' | 'both';

export class RulerTool {
  private canvas: HTMLCanvasElement | null = null;
  private orientation: RulerOrientation = 'both';
  private active = false;

  public constructor(canvas?: HTMLCanvasElement) {
    this.canvas = canvas ?? null;
  }

  public setCanvas(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
  }

  public setOrientation(orientation: RulerOrientation): void {
    this.orientation = orientation;
  }

  public getOrientation(): RulerOrientation {
    return this.orientation;
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
    const dpr = window.devicePixelRatio || 1;

    if (this.canvas.width !== Math.round(width * dpr) || this.canvas.height !== Math.round(height * dpr)) {
      this.canvas.width = Math.round(width * dpr);
      this.canvas.height = Math.round(height * dpr);
      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }

    const viewportWidth = width;
    const viewportHeight = height;
    const scrollLeft = Math.round(window.scrollX);
    const scrollTop = Math.round(window.scrollY);

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#bd3a2f';
    ctx.font = '10px Arial';

    if (this.orientation === 'horizontal' || this.orientation === 'both') {
      this.drawHorizontalRuler(ctx, viewportWidth, scrollLeft, scrollTop);
    }

    if (this.orientation === 'vertical' || this.orientation === 'both') {
      this.drawVerticalRuler(ctx, viewportHeight, scrollTop, scrollLeft);
    }
  }

  private drawHorizontalRuler(ctx: CanvasRenderingContext2D, viewportWidth: number, scrollLeft: number, scrollTop: number): void {
    const topY = 0;

    ctx.save();
    ctx.strokeStyle = '#1f6feb';
    ctx.fillStyle = '#1f6feb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, topY + 1);
    ctx.lineTo(viewportWidth, topY + 1);
    ctx.stroke();

    for (let x = 0; x <= viewportWidth; x += 10) {
      const px = scrollLeft + x;
      const isMajor = px % 100 === 0;
      const tickHeight = isMajor ? 14 : 7;

      ctx.strokeStyle = '#1f6feb';
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, tickHeight);
      ctx.stroke();

      if (isMajor) {
        const label = String(px);
        ctx.fillStyle = '#2d2d2d';
        ctx.fillRect(Math.max(x - 12, 0), 0, 34, 16);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.fillText(label, Math.max(x, 4), 11);
      }
    }

    ctx.fillStyle = '#2d2d2d';
    ctx.fillText(`scrollX=${scrollLeft}`, 4, 38);
    ctx.fillText(`scrollY=${scrollTop}`, 4, 52);
    ctx.restore();
  }

  private drawVerticalRuler(ctx: CanvasRenderingContext2D, viewportHeight: number, scrollTop: number, scrollLeft: number): void {
    const leftX = 0;

    ctx.save();
    ctx.strokeStyle = '#1f6feb';
    ctx.fillStyle = '#1f6feb';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(leftX + 1, 0);
    ctx.lineTo(leftX + 1, viewportHeight);
    ctx.stroke();

    for (let y = 0; y <= viewportHeight; y += 10) {
      const py = scrollTop + y;
      const isMajor = py % 100 === 0;
      const tickWidth = isMajor ? 14 : 7;

      ctx.strokeStyle = '#1f6feb';
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(tickWidth, y);
      ctx.stroke();

      if (isMajor) {
        const label = String(py);
        ctx.fillStyle = '#2d2d2d';
        ctx.fillRect(0, Math.max(y - 6, 0), 40, 20);
        ctx.fillStyle = '#ffffff';
        ctx.font = '10px Arial';
        ctx.fillText(label, 6, y + 6);
      }
    }

    ctx.fillStyle = '#2d2d2d';
    ctx.fillText(`scrollY=${scrollTop}`, 48, 16);
    ctx.fillText(`scrollX=${scrollLeft}`, 48, 30);
    ctx.restore();
  }
}
