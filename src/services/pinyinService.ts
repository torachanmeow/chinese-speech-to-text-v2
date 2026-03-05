import { pinyin } from 'pinyin-pro';

const cache = new Map<string, string>();

function isChinese(char: string): boolean {
  const code = char.codePointAt(0);
  if (code === undefined) return false;
  return (code >= 0x4e00 && code <= 0x9fff) ||
         (code >= 0x3400 && code <= 0x4dbf) ||
         (code >= 0x20000 && code <= 0x2a6df);
}

function getCharPinyin(char: string): string {
  const cached = cache.get(char);
  if (cached !== undefined) return cached;

  const result = pinyin(char, { toneType: 'symbol' });
  cache.set(char, result);
  return result;
}

export function textToRubyHtml(text: string): string {
  const chars = Array.from(text);
  const parts: string[] = [];

  for (const char of chars) {
    if (isChinese(char)) {
      const py = getCharPinyin(char);
      parts.push(`<ruby>${char}<rt>${py}</rt></ruby>`);
    } else {
      parts.push(char);
    }
  }

  return parts.join('');
}
