export interface DistancePoint {
  x: number;
  y: number;
}

export class DistanceTool {
  private canvas: HTMLCanvasElement | null = null;
  private active = false;
  private mode: 'idle' | 'drawing' | 'committed' = 'idle';
  private pointA: DistancePoint | null = null;
  private pointB: DistancePoint | null = null;
  private dragTarget: 'a' | 'b' | null = null;
  private dragOffsetX = 0;
  private dragOffsetY = 0;

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
    this.reset();
  }

  public isActive(): boolean {
    return this.active;
  }

  public getMode(): 'idle' | 'drawing' | 'committed' {
    return this.mode;
  }

  public begin(x: number, y: number): boolean {
    if (!this.active) {
      return false;
    }

    if (this.mode === 'idle') {
      this.pointA = { x, y };
      this.pointB = { x, y };
      this.mode = 'drawing';
      return true;
    }

    if (this.mode === 'drawing') {
      this.pointB = { x, y };
      this.mode = 'committed';
      return true;
    }

    return false;
  }

  public updateDraft(x: number, y: number): void {
    if (!this.active || this.mode !== 'drawing') {
      return;
    }

    this.pointB = { x, y };
  }

  public reset(): void {
    this.mode = 'idle';
    this.pointA = null;
    this.pointB = null;
    this.dragTarget = null;
  }

  public draw(): void {
    if (!this.active || !this.canvas || !this.pointA || !this.pointB) {
      return;
    }

    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const from = this.pointA;
    const to = this.pointB;
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    ctx.save();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();

    ctx.fillStyle = '#052e16';
    const labelWidth = 180;
    const labelHeight = 54;
    const labelX = Math.min(from.x, to.x) + Math.abs(dx) / 2 - labelWidth / 2;
    const labelY = Math.min(from.y, to.y) + Math.abs(dy) / 2 - labelHeight / 2;

    const clampedX = Math.max(4, Math.min(labelX, this.canvas.width - labelWidth - 4));
    const clampedY = Math.max(4, Math.min(labelY, this.canvas.height - labelHeight - 4));

    ctx.fillStyle = 'rgba(17,24,39,0.92)';
    roundRect(ctx, clampedX, clampedY, labelWidth, labelHeight, 4);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.fillText(`px ${Math.round(distance)}`, clampedX + 10, clampedY + 17);
    ctx.fillStyle = '#a7f3d0';
    ctx.fillText(`dx ${Math.round(dx)}`, clampedX + 10, clampedY + 34);
    ctx.fillStyle = '#a7f3d0';
    ctx.fillText(`dy ${Math.round(dy)}`, clampedX + 10, clampedY + 50);

    ctx.restore();
  }

  public findHitTarget(x: number, y: number): 'a' | 'b' | null {
    if (!this.pointA || !this.pointB) {
      return null;
    }

    const threshold = 14;
    if (this.distance(x, y, this.pointA.x, this.pointA.y) <= threshold) {
      return 'a';
    }

    if (this.distance(x, y, this.pointB.x, this.pointB.y) <= threshold) {
      return 'b';
    }

    return null;
  }

  public startDrag(x: number, y: number): boolean {
    if (this.mode !== 'committed') {
      return false;
    }

    const hit = this.findHitTarget(x, y);
    if (!hit) {
      return false;
    }

    this.dragTarget = hit;

    if (hit === 'a' && this.pointA) {
      this.dragOffsetX = x - this.pointA.x;
      this.dragOffsetY = y - this.pointA.y;
    }

    if (hit === 'b' && this.pointB) {
      this.dragOffsetX = x - this.pointB.x;
      this.dragOffsetY = y - this.pointB.y;
    }

    return true;
  }

  public isDragging(): boolean {
    return this.dragTarget !== null;
  }

  public moveDrag(x: number, y: number): boolean {
    if (!this.dragTarget || this.mode !== 'committed') {
      return false;
    }

    const nextX = x - this.dragOffsetX;
    const nextY = y - this.dragOffsetY;

    if (this.dragTarget === 'a' && this.pointA) {
      this.pointA = { x: nextX, y: nextY };
    } else if (this.dragTarget === 'b' && this.pointB) {
      this.pointB = { x: nextX, y: nextY };
    }

    return true;
  }

  public endDrag(): void {
    this.dragTarget = null;
  }

  private distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
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
