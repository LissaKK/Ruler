export interface InspectorGeometry {
  width: number;
  height: number;
  padding: string;
  margin: string;
  border: string;
}

export class ElementInspectorTool {
  private canvas: HTMLCanvasElement | null = null;
  private active = false;
  private lastElement: Element | null = null;
  private hoverX = 0;
  private hoverY = 0;

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
    this.lastElement = null;
  }

  public isActive(): boolean {
    return this.active;
  }

  public updateHover(x: number, y: number): void {
    if (!this.active) {
      return;
    }

    this.hoverX = x;
    this.hoverY = y;

    const target = document.elementFromPoint(x, y);
    if (target === null || target.id === 'ruler-extension-canvas') {
      this.lastElement = null;
      return;
    }

    this.lastElement = target;
  }

  public draw(): void {
    if (!this.active || !this.lastElement || !this.canvas) {
      return;
    }

    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const rect = this.lastElement.getBoundingClientRect();
    const computed = window.getComputedStyle(this.lastElement);

    const left = Math.round(rect.left);
    const top = Math.round(rect.top);
    const width = Math.round(rect.width);
    const height = Math.round(rect.height);

    ctx.save();
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 2]);
    ctx.strokeRect(left, top, width, height);
    ctx.setLineDash([]);

    const labelWidth = 206;
    const labelHeight = 98;
    const labelX = Math.max(8, Math.min(left + width + 3, window.innerWidth - labelWidth - 8));
    const labelY = Math.max(8, Math.min(top + height + 3, window.innerHeight - labelHeight - 8));

    ctx.fillStyle = 'rgba(17,24,39,0.92)';
    roundRect(ctx, labelX, labelY, labelWidth, labelHeight, 4);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.fillText(`${Math.round(width)} × ${Math.round(height)}`, labelX + 10, labelY + 16);

    const line1 = `padding ${computed.paddingTop} ${computed.paddingRight} ${computed.paddingBottom} ${computed.paddingLeft}`;
    const line2 = `margin ${computed.marginTop} ${computed.marginRight} ${computed.marginBottom} ${computed.marginLeft}`;
    const line3 = `border ${computed.borderTopWidth} ${computed.borderRightWidth} ${computed.borderBottomWidth} ${computed.borderLeftWidth}`;

    ctx.font = '10px Arial';
    ctx.fillStyle = '#cbd5e1';
    ctx.fillText(line1, labelX + 10, labelY + 38);
    ctx.fillText(line2, labelX + 10, labelY + 55);
    ctx.fillText(line3, labelX + 10, labelY + 72);
    ctx.restore();
  }

  public getHoverElement(): Element | null {
    return this.lastElement;
  }

  public getLatestGeometry(): InspectorGeometry | null {
    if (!this.lastElement) {
      return null;
    }

    const rect = this.lastElement.getBoundingClientRect();
    const computed = window.getComputedStyle(this.lastElement);

    return {
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      padding: `${computed.paddingTop} ${computed.paddingRight} ${computed.paddingBottom} ${computed.paddingLeft}`,
      margin: `${computed.marginTop} ${computed.marginRight} ${computed.marginBottom} ${computed.marginLeft}`,
      border: `${computed.borderTopWidth} ${computed.borderRightWidth} ${computed.borderBottomWidth} ${computed.borderLeftWidth}`
    };
  }
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}
