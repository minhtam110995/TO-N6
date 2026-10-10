export type MathTextPart = string | { top: string; bottom: string };

export function splitMathText(text: string): MathTextPart[] {
  const atom = String.raw`(?:\(-?\d+(?:[.,]\d+)?\)|-?\d+(?:[.,]\d+)?|[abcdnxy])`;
  const pattern = new RegExp(String.raw`(?<![\p{L}\p{N}_/])(${atom})\s*/\s*(${atom})(?![\p{L}\p{N}_/])`, 'gu');
  const parts: MathTextPart[] = [];
  let position = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index! > position) parts.push(text.slice(position, match.index));
    parts.push({ top: match[1], bottom: match[2] });
    position = match.index! + match[0].length;
  }
  if (position < text.length) parts.push(text.slice(position));
  return parts;
}
