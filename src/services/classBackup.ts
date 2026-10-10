type StorageReader = Pick<Storage, 'length' | 'key' | 'getItem'>;

const isClassKey = (key: string) => (
  key.startsWith('toan6_') || /^(draft_exam_|active_exam_|parent_contact_draft_|teacher_exam_draft)/.test(key)
) && !['toan6_current_user', 'toan6_login_session', 'toan6_session_user'].includes(key);

export function createClassBackup(storage: StorageReader, exportedAt = new Date().toISOString()) {
  const records: Record<string, string> = {};
  for (let i = 0; i < storage.length; i++) {
    const key = storage.key(i);
    if (!key || !isClassKey(key)) continue;
    const value = storage.getItem(key);
    if (value !== null) records[key] = value;
  }
  const count = (key: string) => {
    const data = JSON.parse(records[key] || '[]');
    if (!Array.isArray(data)) throw new Error('Dữ liệu lớp không hợp lệ: ' + key);
    return data.length;
  };
  return {
    format: 'toan6-local-backup',
    version: 1,
    exportedAt,
    classId: 'class-6d',
    counts: {
      students: count('toan6_students'), parents: count('toan6_parents'),
      questions: count('toan6_questions_bank'), exams: count('toan6_exams'),
      submissions: count('toan6_submissions'), messages: count('toan6_messages'),
    },
    records,
  };
}

export function downloadClassBackup(backup: ReturnType<typeof createClassBackup>) {
  const file = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = `toan-6d-sao-luu-${backup.exportedAt.replace(/[:.]/g, '-')}.json`;
  try { link.click(); } finally { setTimeout(() => URL.revokeObjectURL(url), 1000); }
}
