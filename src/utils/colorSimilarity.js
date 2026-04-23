/**
 * 색상 유사도 유틸
 *
 * hex → HSL 변환 후 (hue 거리 + saturation/lightness 허용 오차) 로 매칭.
 * 컬러 필터에서 "대표 색상 선택 시 주변색까지 필터링" 용도.
 */

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

export function hexToRgb(hex) {
  if (!hex) return null;
  const h = hex.replace('#', '');
  if (h.length !== 6) return null;
  const n = parseInt(h, 16);
  if (Number.isNaN(n)) return null;
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHsl({ r, g, b }) {
  const rn = r / 255; const gn = g / 255; const bn = b / 255;
  const max = Math.max(rn, gn, bn); const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  let h = 0; let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = (gn - bn) / d + (gn < bn ? 6 : 0); break;
      case gn: h = (bn - rn) / d + 2; break;
      case bn: h = (rn - gn) / d + 4; break;
      default: break;
    }
    h *= 60;
  }
  return { h, s, l };
}

export function hexToHsl(hex) {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  return rgbToHsl(rgb);
}

/**
 * 두 hex 값이 "유사" 한가 (hue 거리 + S/L 오차).
 * 저채도(neutral)는 hue 가 불안정하므로 L 만으로 판정.
 */
export function isSimilarColor(a, b, { hueTolerance = 30, lightTolerance = 0.28, satTolerance = 0.35 } = {}) {
  const ah = hexToHsl(a); const bh = hexToHsl(b);
  if (!ah || !bh) return false;

  // neutral (무채색) 취급 — 양쪽 다 저채도이면 lightness 로만 판정
  const neutralThreshold = 0.12;
  if (ah.s < neutralThreshold && bh.s < neutralThreshold) {
    return Math.abs(ah.l - bh.l) <= lightTolerance;
  }

  // 한쪽만 무채색이면 mismatch
  if ((ah.s < neutralThreshold) !== (bh.s < neutralThreshold)) return false;

  const hueDist = Math.min(Math.abs(ah.h - bh.h), 360 - Math.abs(ah.h - bh.h));
  if (hueDist > hueTolerance) return false;
  if (Math.abs(ah.s - bh.s) > satTolerance) return false;
  if (Math.abs(ah.l - bh.l) > lightTolerance) return false;
  return true;
}

/** 대표 색상환 — 12 hue + 4 neutral */
export const REPRESENTATIVE_COLORS = [
  { hex: '#E53935', label: 'Red' },
  { hex: '#F4511E', label: 'Coral' },
  { hex: '#F9A825', label: 'Orange' },
  { hex: '#FDD835', label: 'Yellow' },
  { hex: '#7CB342', label: 'Lime' },
  { hex: '#2E7D32', label: 'Green' },
  { hex: '#00897B', label: 'Teal' },
  { hex: '#00ACC1', label: 'Cyan' },
  { hex: '#1E88E5', label: 'Blue' },
  { hex: '#3949AB', label: 'Indigo' },
  { hex: '#8E24AA', label: 'Purple' },
  { hex: '#D81B60', label: 'Pink' },
  { hex: '#1A1A1F', label: 'Black' },
  { hex: '#6B6B74', label: 'Gray' },
  { hex: '#C9BBA5', label: 'Beige' },
  { hex: '#F2F2F5', label: 'White' },
];

export { clamp };
