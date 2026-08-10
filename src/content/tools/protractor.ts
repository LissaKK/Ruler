export type ProtractorMode = 'idle' | 'drawing' | 'locked';

export class ProtractorTool {
  private canvas: HTMLCanvasElement | null = null;
  private active = false;
  private mode: ProtractorMode = 'idle';
  private startX = 0;
  private startY = 0;
  private currentX = 0;
  private currentY = 0;
  private lockedAngle = 0;
  private shiftSnapEnabled = false;

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

  public getMode(): ProtractorMode {
    return this.mode;
  }

  public begin(x: number, y: number): void {
    if (!this.active || this.mode === 'locked') {
      return;
    }

    if (this.mode === 'idle') {
      this.startX = x;
      this.startY = y;
      this.currentX = x;
      this.currentY = y;
      this.mode = 'drawing';
    }
  }

  public update(x: number, y: number, shiftKey = false): void {
    if (!this.active || this.mode !== 'drawing') {
      return;
    }

    this.shiftSnapEnabled = shiftKey;

    const rawDX = x - this.startX;
    const rawDY = y - this.startY;

    if (!shiftKey) {
      this.currentX = x;
      this.currentY = y;
      return;
    }

    const rawAngle = this.computeAngle(this.startX, this.startY, x, y);
    const snappedAngle = this.snapToFiveDegrees(rawAngle);
    const length = Math.max(Math.sqrt(rawDX * rawDX + rawDY * rawDY), 1);
    const radians = (snappedAngle * Math.PI) / 180;

    this.currentX = this.startX + Math.cos(radians) * length;
    this.currentY = this.startY + Math.sin(radians) * length;
  }

  public finalize(): void {
    if (this.mode !== 'drawing') {
      return;
    }

    this.lockedAngle = this.computeAngle(this.startX, this.startY, this.currentX, this.currentY, this.shiftSnapEnabled);
    this.mode = 'locked';
  }

  public reset(): void {
    this.mode = 'idle';
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.currentY = 0;
    this.lockedAngle = 0;
    this.shiftSnapEnabled = false;
  }

  public draw(): void {
    if (!this.active || !this.canvas) {
      return;
    }

    const ctx = this.canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    if (this.mode === 'idle') {
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      return;
    }

    if (this.mode === 'drawing') {
      this.drawDraftAngle(ctx);
    }

    if (this.mode === 'locked') {
      this.drawLockedAngle(ctx);
    }
  }

  private drawDraftAngle(ctx: CanvasRenderingContext2D): void {
    const x1 = this.startX;
    const y1 = this.startY;
    const x2 = this.currentX;
    const y2 = this.currentY;

    const angle = this.computeAngle(x1, y1, x2, y2, this.shiftSnapEnabled);

    ctx.save();
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2;
    ctx.setLineDash([4, 2]);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = '#111827';
    ctx.fillRect(x2 + 12, y2 - 34, 150, 28);
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.fillText(`θ ${angle.toFixed(2)}°`, x2 + 18, y2 - 16);
    ctx.restore();
  }

  private drawLockedAngle(ctx: CanvasRenderingContext2D): void {
    const anchorX = this.startX;
    const anchorY = this.startY;

    ctx.save();
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(anchorX, anchorY);
    ctx.lineTo(this.currentX, this.currentY);
    ctx.stroke();

    const readoutX = Math.max(this.currentX + 16, anchorX + 16);
    const readoutY = Math.max(this.currentY - 10, anchorY - 10);

    ctx.fillStyle = '#111827';
    ctx.fillRect(readoutX, readoutY - 18, 132, 28);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 13px Arial';
    ctx.fillText(`${this.lockedAngle.toFixed(2)}°`, readoutX + 8, readoutY);
    ctx.restore();
  }

  private computeAngle(x1: number, y1: number, x2: number, y2: number, snapToFive = false): number {
    const dx = x2 - x1;
    const dy = y2 - y1;

    const raw = Math.atan2(dy, dx) * 180 / Math.PI;
    const normalized = raw < 0 ? 360 + raw : raw;
    const maybeSnapped = snapToFive ? this.snapToFiveDegrees(normalized) : normalized;

    return maybeSnapped;
  }

  private snapToFiveDegrees(angle: number): number {
    const snapped = Math.round(angle / 5) * 5;
    return snapped % 360;
  }
}
