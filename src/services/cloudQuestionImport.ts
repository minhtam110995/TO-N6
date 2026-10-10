import type { SupabaseClient } from '@supabase/supabase-js';
import type { Question } from '../types';

export async function getCloudTeacher(client: SupabaseClient) {
  const { data: auth, error: authError } = await client.auth.getUser();
  if (authError || !auth.user) throw new Error('Phiên Supabase hết hạn. Hãy kết nối lại.');
  const { data: profile, error } = await client.from('toan6_profiles')
    .select('id,auth_user_id,class_id,full_name,role,status')
    .eq('auth_user_id', auth.user.id).single();
  if (error || !profile || profile.role !== 'teacher' || profile.status !== 'active' || profile.class_id !== 'class-6d') {
    throw new Error('Tài khoản Supabase chưa được liên kết với giáo viên lớp 6D.');
  }
  return profile;
}

export function validateCloudQuestionBank(questions: Question[]) {
  if (!questions.length || questions.length > 10000) throw new Error('Ngân hàng phải có từ 1 đến 10.000 câu hỏi.');
  const ids = new Set<string>();
  for (const question of questions) {
    if (!question.id?.trim() || ids.has(question.id)) throw new Error('Ngân hàng có mã câu hỏi trống hoặc trùng.');
    ids.add(question.id);
    if (!Number.isInteger(question.chapterId) || question.chapterId < 1 || question.chapterId > 9 || !Number.isInteger(question.lessonId) || question.lessonId < 1 || !question.content?.trim() || !Array.isArray(question.solutionSteps)) {
      throw new Error('Câu hỏi không hợp lệ: ' + question.id);
    }
  }
}

export async function importCloudQuestionBank(client: SupabaseClient, questions: Question[]) {
  validateCloudQuestionBank(questions);
  const profile = await getCloudTeacher(client);
  const { data, error } = await client.rpc('toan6_import_question_bank', { target_class: profile.class_id, questions });
  if (error) throw new Error('Chưa nạp được ngân hàng. Kiểm tra SQL bước 4 và kết nối Supabase. Không xóa dữ liệu cục bộ.');
  if (data !== questions.length) throw new Error('Số câu Supabase trả về chưa khớp. Cần kiểm tra trước khi chuyển dữ liệu tiếp.');
  return data as number;
}
