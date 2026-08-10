export type ColorFormat = 'HEX' | 'RGB' | 'HSL';

export interface ColorSample {
  hex: string;
  rgb: string;
  hsl: string;
}

interface EyeDropperConstructor {
  new (): {
    open: () => Promise<{ sRGBHex: string }>;
  };
}

declare global {
  interface Window {
    EyeDropper?: EyeDropperConstructor;
  }
}

export class EyedropperTool {
  private active = false;
  private popup: HTMLDivElement | null = null;

  public activate(): void {
    this.active = true;
  }

  public deactivate(): void {
    this.active = false;
    this.hidePanel();
  }

  public isActive(): boolean {
    return this.active;
  }

  public async sampleAtViewportPosition(x: number, y: number): Promise<ColorSample | null> {
    if (!this.active) {
      return null;
    }

    if (typeof window !== 'undefined' && typeof window.EyeDropper !== 'undefined') {
      const dropper = new window.EyeDropper();
      const result = await dropper.open();
      const { hex, rgb, hsl } = this.toColorFormats(result.sRGBHex);
      this.renderPopup(hex, rgb, hsl);
      return { hex, rgb, hsl };
    }

    const capture = await this.captureVisibleAreaFallback();
    if (!capture) {
      return null;
    }

    const picked = await this.readPixelFromCapture(capture, x, y);
    if (!picked) {
      return null;
    }

    const { hex, rgb, hsl } = this.toColorFormats(picked);
    this.renderPopup(hex, rgb, hsl);
    return { hex, rgb, hsl };
  }

  private async captureVisibleAreaFallback(): Promise<string | null> {
    try {
      const result = await chrome.runtime.sendMessage({ type: 'CAPTURE_VISIBLE_TAB' });
      if (!result?.ok || !result.imageDataUrl) {
        return null;
      }

      return result.imageDataUrl;
    } catch {
      return null;
    }
  }

  private async readPixelFromCapture(imageDataUrl: string, x: number, y: number): Promise<string | null> {
    const image = new Image();

    return await new Promise<string | null>((resolve) => {
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;

        const context = canvas.getContext('2d');
        if (!context) {
          resolve(null);
          return;
        }

        context.drawImage(image, 0, 0);

        const dpr = window.devicePixelRatio || 1;
        const mappedX = Math.max(0, Math.min(image.naturalWidth - 1, Math.round(x * dpr)));
        const mappedY = Math.max(0, Math.min(image.naturalHeight - 1, Math.round(y * dpr)));

        const pixel = context.getImageData(mappedX, mappedY, 1, 1).data;
        const hex = this.rgbToHex(pixel[0], pixel[1], pixel[2]);
        resolve(hex);
      };

      image.onerror = () => resolve(null);
      image.src = imageDataUrl;
    });
  }

  private toColorFormats(hex: string): ColorSample {
    const normalized = this.normalizeHex(hex);
    const [r, g, b] = this.hexToRgb(normalized);

    return {
      hex: normalized.toUpperCase(),
      rgb: `rgb(${r}, ${g}, ${b})`,
      hsl: this.rgbToHsl(r, g, b)
    };
  }

  private renderPopup(hex: string, rgb: string, hsl: string): void {
    if (!this.popup) {
      this.popup = this.createPopup();
      document.documentElement.appendChild(this.popup);
    }

    const popup = this.popup;
    popup.innerHTML = `
      <div class="ruler-popup-header">
        <span class="ruler-popup-title">Eyedropper</span>
        <button class="ruler-popup-close" aria-label="Close">×</button>
      </div>
      <div class="ruler-popup-row">
        <span class="ruler-popup-label">HEX</span>
        <span class="ruler-popup-value">${hex}</span>
        <button class="ruler-copy" data-copy="${hex}">Copy</button>
      </div>
      <div class="ruler-popup-row">
        <span class="ruler-popup-label">RGB</span>
        <span class="ruler-popup-value">${rgb}</span>
        <button class="ruler-copy" data-copy="${rgb}">Copy</button>
      </div>
      <div class="ruler-popup-row">
        <span class="ruler-popup-label">HSL</span>
        <span class="ruler-popup-value">${hsl}</span>
        <button class="ruler-copy" data-copy="${hsl}">Copy</button>
      </div>
    `;

    popup.querySelector<HTMLButtonElement>('[aria-label="Close"]')?.addEventListener('click', () => {
      this.hidePanel();
    });

    popup.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((button) => {
      button.addEventListener('click', async () => {
        const value = button.getAttribute('data-copy') ?? '';
        await this.copyText(value);
      });
    });
  }

  private createPopup(): HTMLDivElement {
    const panel = document.createElement('div');
    panel.className = 'ruler-extension-eyedropper-panel';
    panel.style.position = 'fixed';
    panel.style.top = '20px';
    panel.style.right = '20px';
    panel.style.zIndex = '2147483648';
    panel.style.width = '260px';
    panel.style.border = '1px solid #d1d5db';
    panel.style.borderRadius = '8px';
    panel.style.background = '#fff';
    panel.style.color = '#111';
    panel.style.boxShadow = '0 12px 32px rgba(0,0,0,.2)';
    panel.style.fontFamily = 'Arial, sans-serif';
    panel.style.fontSize = '12px';
    panel.style.padding = '10px';
    panel.style.pointerEvents = 'auto';
    panel.style.display = 'block';

    const style = document.createElement('style');
    style.textContent = `
      .ruler-extension-eyedropper-panel .ruler-popup-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid #e5e7eb;
        padding-bottom: 6px;
        margin-bottom: 8px;
      }
      .ruler-extension-eyedropper-panel .ruler-popup-title {
        font-weight: 700;
      }
      .ruler-extension-eyedropper-panel .ruler-popup-close {
        border: none;
        background: transparent;
        font-size: 20px;
        line-height: 1;
        cursor: pointer;
      }
      .ruler-extension-eyedropper-panel .ruler-popup-row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 4px 0;
      }
      .ruler-extension-eyedropper-panel .ruler-popup-label {
        color: #64748b;
        font-weight: 700;
        min-width: 38px;
      }
      .ruler-extension-eyedropper-panel .ruler-popup-value {
        flex: 1;
        color: #111827;
      }
      .ruler-extension-eyedropper-panel .ruler-copy {
        padding: 4px 9px;
        background: #111827;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 11px;
      }
    `;

    panel.appendChild(style);

    return panel;
  }

  private async copyText(value: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }

  private hidePanel(): void {
    if (this.popup) {
      this.popup.style.display = 'none';
    }
  }

  private normalizeHex(value: string): string {
    const raw = String(value).trim();
    if (raw.startsWith('#')) {
      return raw.length === 4
        ? `#${raw.slice(1).split('').map((c) => `${c}${c}`).join('')}`
        : raw;
    }
    return `#${raw}`;
  }

  private hexToRgb(hex: string): [number, number, number] {
    const normalized = this.normalizeHex(hex).slice(1);
    const value = normalized.length === 3
      ? normalized.split('').map((letter) => `${letter}${letter}`).join('')
      : normalized;

    const bigint = parseInt(value, 16);
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return `#${[r, g, b]
      .map((part) => Math.max(0, Math.min(255, part)).toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase()}`;
  }

  private rgbToHsl(r: number, g: number, b: number): string {
    const rn = r / 255;
    const gn = g / 255;
    const bn = b / 255;

    const max = Math.max(rn, gn, bn);
    const min = Math.min(rn, gn, bn);
    const lightness = (max + min) / 2;

    if (max === min) {
      return 'hsl(0, 0%, ' + Math.round(lightness * 100) + '%)';
    }

    const delta = max - min;
    const saturation = delta / (1 - Math.abs(2 * lightness - 1));

    let hue = 0;
    if (max === rn) {
      hue = ((gn - bn) / delta) % 6;
    } else if (max === gn) {
      hue = (bn - rn) / delta + 2;
    } else {
      hue = (rn - gn) / delta + 4;
    }

    hue = Math.round(hue * 60);
    if (hue < 0) {
      hue += 360;
    }

    const h = Math.round(hue);
    const s = Math.round(saturation * 100);
    const l = Math.round(lightness * 100);

    return `hsl(${h}, ${s}%, ${l}%)`;
  }
}
