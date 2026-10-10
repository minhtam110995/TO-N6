import { ExamMatrix, Question } from '../types';
export const MATRIX_LEVELS = ['nhan_biet', 'thong_hieu', 'van_dung', 'van_dung_cao'] as const;
const fields = ['nhanBietPercent', 'thongHieuPercent', 'vanDungPercent', 'vanDungCaoPercent'] as const;
export function matrixCounts(matrix: ExamMatrix, totalCount: number) {
  if (!Number.isInteger(totalCount) || totalCount < 1) throw new Error('Số câu phải là số nguyên dương.');
  const percentages = fields.map(field => matrix[field]);
  if (percentages.some(p => !Number.isFinite(p) || p < 0 || p > 100) || percentages.reduce((a, b) => a + b, 0) !== 100) throw new Error('Tổng ma trận phải bằng 100%.');
  const counts = percentages.map(p => Math.floor(p * totalCount / 100));
  const order = percentages.map((p, i) => ({ i, remainder: p * totalCount / 100 - counts[i] })).sort((a, b) => b.remainder - a.remainder);
  for (let i = 0, remaining = totalCount - counts.reduce((a, b) => a + b, 0); i < remaining; i++) counts[order[i].i]++;
  return counts;
}
export function suggestMatrix(pool: Question[], count: number): ExamMatrix {
  if (!Number.isInteger(count) || count < 1 || count > 100 || count > pool.length) throw new Error(`Chọn số câu từ 1 đến ${Math.min(100, pool.length)} trong phạm vi hiện tại.`);
  const available = MATRIX_LEVELS.map(level => pool.filter(q => q.level === level).length);
  const quotas = available.map(n => Math.floor(n * count / pool.length));
  const quotaOrder = available.map((n, i) => ({ i, remainder: n * count / pool.length - quotas[i] })).sort((a, b) => b.remainder - a.remainder);
  for (let i = 0, remaining = count - quotas.reduce((a, b) => a + b, 0); i < remaining; i++) quotas[quotaOrder[i].i]++;
  const raw = quotas.map(n => n / count * 100);
  const percents = raw.map(Math.floor);
  const order = raw.map((p, i) => ({ i, remainder: p - percents[i] })).sort((a, b) => b.remainder - a.remainder);
  for (let i = 0, remaining = 100 - percents.reduce((a, b) => a + b, 0); i < remaining; i++) percents[order[i].i]++;
  return Object.fromEntries(fields.map((field, i) => [field, percents[i]])) as unknown as ExamMatrix;
}
