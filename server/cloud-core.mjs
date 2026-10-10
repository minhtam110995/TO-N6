import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'node:crypto';

export class CloudError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
const requireValue = (ok, message, status) => { if (!ok) throw new CloudError(message, status); };
const checked = async query => {
  const { data, error } = await query;
  if (error) {
    const messages = { 'Deadline passed': 'Bài tập đã hết hạn.', 'No retries left': 'Bạn đã dùng hết lượt làm bài.', 'Attempt expired': 'Lượt làm bài đã hết thời gian nộp.', 'Exam not assigned': 'Bài tập không được giao cho bạn.', 'Student not active': 'Tài khoản học sinh đã bị khóa.' };
    if (error.code === 'P0001' && messages[error.message]) throw new CloudError(messages[error.message]);
    const failure = new CloudError('Chưa lưu/đọc được Supabase. Dữ liệu chưa được xác nhận, hãy thử lại.', 503);
    failure.cause = error;
    throw failure;
  }
  return data;
};
const all = async makeQuery => {
  const rows = [];
  for (let page = 0; page < 30; page++) {
    const part = await checked(makeQuery().range(page * 1000, page * 1000 + 999));
    rows.push(...part);
    if (part.length < 1000) return rows;
  }
  throw new CloudError('Dữ liệu vượt giới hạn tải. Liên hệ giáo viên.', 503);
};
export function stripAnswers(question) {
  const { correctAnswers, solutionSteps, teacherAdvice, ...safe } = question;
  return { ...safe, solutionSteps: [], options: question.options?.map(({ isCorrect, note, ...o }) => o),
    statements: question.statements?.map(({ isCorrect, ...s }) => s) };
}
export function equivalentAnswer(input, expected) {
  if (!input || !expected?.length) return false;
  const normalize = text => String(text).trim().toLowerCase().replace(/\s+/g, '').replace(',', '.');
  const parse = text => {
    const numeric = /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/;
    if (text.endsWith('%')) { const n = text.slice(0, -1); return numeric.test(n) ? Number(n) / 100 : null; }
    const parts = text.split('/');
    if (parts.length === 2 && parts.every(p => numeric.test(p)) && Number(parts[1]) !== 0) return Number(parts[0]) / Number(parts[1]);
    return numeric.test(text) ? Number(text) : null;
  };
  const value = normalize(input);
  return expected.some(answer => {
    const target = normalize(answer); if (value === target) return true;
    const a = parse(value), b = parse(target);
    return a !== null && b !== null && Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) < 1e-9;
  });
}
export function gradeQuestions(questions, selected) {
  return questions.map(q => {
    const value = typeof selected[q.id] === 'string' ? selected[q.id].trim().slice(0, 2000) : '';
    let correct = false;
    if (q.type === 'multiple_choice') correct = !!q.options?.some(o => o.isCorrect && (o.id === value || o.label === value));
    else if (q.type === 'fill_in_the_blank') correct = equivalentAnswer(value, q.correctAnswers);
    else if (q.type === 'true_false') {
      try { const answers = JSON.parse(value); correct = !!q.statements?.length && q.statements.every(s => answers[s.id] === s.isCorrect); } catch {}
    }
    return { questionId: q.id, selectedAnswerText: value, selectedOptionId: q.type === 'multiple_choice' ? value : undefined,
      isCorrect: correct, score: correct ? 10 / questions.length : 0, timeSpentSeconds: 0 };
  });
}
export function assignedTo(exam, studentId) {
  return exam.type === 'practice' ? exam.createdBy === studentId : exam.assignedTo === 'all' || Array.isArray(exam.assignedTo) && exam.assignedTo.includes(studentId);
}
export function canReview(exam, studentId, submissions, now = Date.now()) {
  return exam.showSolutionAfter === 'deadline' ? now >= Date.parse(exam.deadline) :
    submissions.some(s => s.examId === exam.id && s.studentId === studentId);
}
function asUser(row, profiles) {
  const child = profiles.find(p => p.id === row.linked_student_id);
  const parent = profiles.find(p => p.role === 'parent' && p.linked_student_id === row.id);
  return { id: row.id, username: row.username, fullName: row.full_name, role: row.role, status: row.status,
    classId: row.class_id, className: 'Lớp 6D', birthDate: row.birth_date || undefined, phone: row.phone || undefined,
    studentId: row.linked_student_id || undefined, studentName: child?.full_name,
    parentId: parent?.id, parentName: parent?.full_name };
}

export function createCloudApi(config) {
  const url = config.SUPABASE_URL || config.VITE_SUPABASE_URL;
  const secret = config.SUPABASE_SECRET_KEY;
  const publicKey = config.SUPABASE_PUBLISHABLE_KEY || config.VITE_SUPABASE_ANON_KEY;
  let admin;
  const rates = new Map();
  const database = () => {
    requireValue(url && secret && publicKey, 'Máy chủ chưa có cấu hình Supabase.', 503);
    admin ||= createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
    return admin;
  };
  const teacherOnly = actor => requireValue(actor.role === 'teacher', 'Chỉ giáo viên được thực hiện thao tác này.', 403);
  const scoped = (db, table, actor) => db.from(table).select('*').eq('class_id', actor.class_id);
  const authenticate = async token => {
    requireValue(token, 'Hãy đăng nhập lại.', 401);
    const db = database();
    const { data, error } = await db.auth.getUser(token);
    requireValue(!error && data.user, 'Phiên đăng nhập hết hạn.', 401);
    const profile = await checked(db.from('toan6_profiles').select('*').eq('auth_user_id', data.user.id).maybeSingle());
    requireValue(profile?.status === 'active', 'Tài khoản chưa được liên kết hoặc đã khóa.', 403);
    const school = await checked(db.from('toan6_classes').select('id,teacher_auth_id').eq('id',profile.class_id).single());
    if (profile.role === 'teacher') requireValue(school.teacher_auth_id === profile.auth_user_id, 'Quyền giáo viên không hợp lệ.', 403);
    if (profile.role === 'parent') {
      const child = await checked(scoped(db,'toan6_profiles',profile).eq('id',profile.linked_student_id).eq('role','student').maybeSingle());
      requireValue(child, 'Tài khoản chưa liên kết đúng học sinh.', 403);
    }
    return profile;
  };
  const examFor = async (actor, id) => {
    const row = await checked(scoped(database(),'toan6_exams',actor).eq('id',id).maybeSingle());
    requireValue(row, 'Không tìm thấy bài tập.', 404);
    const studentId = actor.role === 'parent' ? actor.linked_student_id : actor.id;
    requireValue(actor.role === 'teacher' || assignedTo(row.payload,studentId), 'Bài tập không được giao cho bạn.', 403);
    return row;
  };
  const snapshot = async (actor, includeBank = true) => {
    const db = database(), teacher = actor.role === 'teacher';
    const studentId = actor.role === 'parent' ? actor.linked_student_id : actor.id;
    const profiles = await all(() => {
      const q = scoped(db,'toan6_profiles',actor);
      return teacher ? q : actor.role === 'parent' ? q.in('id',[actor.id,studentId]) : q.eq('id',actor.id);
    });
    const users = profiles.map(p => asUser(p,profiles));
    const examRows = await all(() => scoped(db,'toan6_exams',actor));
    const subRows = await all(() => teacher ? scoped(db,'toan6_submissions',actor) : scoped(db,'toan6_submissions',actor).eq('student_id',studentId));
    const submissions = subRows.map(r=>r.payload).sort((a,b)=>Date.parse(b.submittedAt)-Date.parse(a.submittedAt));
    const exams = examRows.map(r=>r.payload).filter(e=>teacher || assignedTo(e,studentId)).sort((a,b)=>Date.parse(b.createdAt)-Date.parse(a.createdAt)).map(e=>
      teacher || canReview(e,studentId,submissions) ? e : {...e,questions:e.questions.map(stripAnswers)});
    const wrongRows = await all(() => teacher ? scoped(db,'toan6_wrong_questions',actor) : scoped(db,'toan6_wrong_questions',actor).eq('student_id',studentId));
    const wrong = wrongRows.map(r=>r.payload).map(w=>{
      const source = examRows.find(r=>r.id===w.sourceExamId)?.payload;
      return teacher || source && canReview(source,studentId,submissions) ? w : {...w,question:stripAnswers(w.question),correctAnswer:'',teacherNote:''};
    });
    const messages = actor.role === 'student' ? [] : await all(()=>teacher ? scoped(db,'toan6_messages',actor).order('created_at') : scoped(db,'toan6_messages',actor).eq('parent_id',actor.id).order('created_at'));
    const reminders = actor.role !== 'student' ? [] : await all(()=>scoped(db,'toan6_reminders',actor).eq('student_id',actor.id));
    const drafts = await all(()=>scoped(db,'toan6_drafts',actor).eq('owner_id',actor.id));
    const attempts = actor.role !== 'student' ? [] : await all(()=>scoped(db,'toan6_attempts',actor).eq('student_id',actor.id).is('submission_id',null));
    const result = {user:asUser(actor,profiles),students:users.filter(u=>u.role==='student'),parents:users.filter(u=>u.role==='parent'),
      exams,submissions,wrong,weakTopics:[],drafts:Object.fromEntries(drafts.map(d=>[d.id,d.payload])),attempts,
      messages:messages.map(m=>({id:m.id,parentId:m.parent_id,senderId:m.sender_id,body:m.body,createdAt:m.created_at,readAt:m.read_at||undefined})),
      reminders:reminders.map(r=>r.payload)};
    if (includeBank) {
      const bank = (await all(()=>scoped(db,'toan6_questions',actor).order('id'))).map(r=>r.payload);
      result.bank = teacher ? bank : bank.map(stripAnswers);
    }
    return result;
  };
  const provision = async (actor, role, input, password, studentId) => {
    teacherOnly(actor); const db = database();
    const username = input.username?.trim(), fullName = input.fullName?.trim(), phone = input.phone?.replace(/\D/g,'') || null;
    requireValue(/^[A-Za-z0-9_]{1,64}$/.test(username||'') && fullName && fullName.length<=150, 'Họ tên hoặc tài khoản không hợp lệ.');
    requireValue(typeof password==='string' && password.length>=8 && password.length<=100, 'Mật khẩu cần từ 8 đến 100 ký tự.');
    requireValue(!phone || /^\d{10,15}$/.test(phone), 'Số điện thoại không hợp lệ.');
    if (role==='parent') {
      const child = await checked(scoped(db,'toan6_profiles',actor).eq('id',studentId).eq('role','student').maybeSingle());
      requireValue(child, 'Không tìm thấy học sinh.');
      const linked = await checked(scoped(db,'toan6_profiles',actor).eq('linked_student_id',studentId).eq('role','parent').maybeSingle());
      requireValue(!linked, 'Học sinh đã liên kết phụ huynh.');
    }
    const duplicate = await checked(db.from('toan6_profiles').select('id').ilike('username',username.replace(/[_%\\]/g,'\\$&')).maybeSingle());
    requireValue(!duplicate, 'Tên đăng nhập đã tồn tại.');
    if (phone && role==='parent') {
      const duplicatePhone = await checked(scoped(db,'toan6_profiles',actor).eq('role','parent').eq('phone',phone).maybeSingle());
      requireValue(!duplicatePhone, 'Số điện thoại đã có tài khoản.');
    }
    const id=(role==='parent'?'ph-':'hs-')+randomUUID();
    const {data,error}=await db.auth.admin.createUser({email:username.toLowerCase()+'@'+(role==='parent'?'parents':'students')+'.toan6d.invalid',
      password,email_confirm:true,app_metadata:{toan6_source_id:id,toan6_class_id:actor.class_id}});
    requireValue(!error && data.user, 'Chưa tạo được tài khoản Supabase. Kiểm tra tài khoản trùng.',503);
    const row={id,auth_user_id:data.user.id,class_id:actor.class_id,username,full_name:fullName,role,status:'active',
      phone,birth_date:input.birthDate||null,linked_student_id:role==='parent'?studentId:null};
    const {error:saveError}=await db.from('toan6_profiles').insert(row);
    if(saveError){
      const {data:existing,error:checkError}=await db.from('toan6_profiles').select('id').eq('auth_user_id',data.user.id).maybeSingle();
      if(!checkError && !existing) await db.auth.admin.deleteUser(data.user.id);
      requireValue(existing,'Chưa liên kết được hồ sơ. Kiểm tra lại danh sách trước khi thử tiếp.',503);
    }
    return row;
  };
  async function dispatch(op, body, token, ip='local') {
    const db=database();
    if(op==='login'){
      const now=Date.now(), rateKey=ip+':'+String(body.username).trim().toLowerCase(), rate=rates.get(rateKey);
      requireValue(!rate || rate.until<now || rate.count<10,'Đăng nhập quá nhiều lần. Hãy đợi 1 phút.',429);
      if(rates.size>1000) rates.clear();
      rates.set(rateKey,{count:rate?.until>now?rate.count+1:1,until:rate?.until>now?rate.until:now+60000});
      requireValue(['teacher','student','parent'].includes(body.role) && typeof body.username==='string' && typeof body.password==='string' && body.password.length<=100,'Thông tin đăng nhập không hợp lệ.',401);
      let email=body.username.trim(), profile;
      if(!email.includes('@')){
        requireValue(/^[A-Za-z0-9_]{1,64}$/.test(email),'Tài khoản hoặc mật khẩu không đúng.',401);
        let q=db.from('toan6_profiles').select('*').eq('role',body.role);
        q = body.role==='parent' && /^\d{10,15}$/.test(email) ? q.or('username.eq.'+email+',phone.eq.'+email) : q.ilike('username',email.replace(/[_%\\]/g,'\\$&'));
        const {data,error}=await q.maybeSingle();
        requireValue(!error && data?.status==='active','Tài khoản hoặc mật khẩu không đúng.',401);profile=data;
        const user=await db.auth.admin.getUserById(profile.auth_user_id);email=user.data.user?.email;
      }
      const client=createClient(url,publicKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
      const {data,error}=await client.auth.signInWithPassword({email,password:body.password});
      requireValue(!error && data.session,'Tài khoản hoặc mật khẩu không đúng.',401);
      try {
        const actor=await authenticate(data.session.access_token);
        requireValue(actor.role===body.role,'Vai trò đăng nhập không đúng.',403);
        return {session:data.session,snapshot:await snapshot(actor)};
      } catch(e) {await client.auth.signOut({scope:'local'});throw e;}
    }
    const actor=await authenticate(token);
    if(op==='snapshot')return {snapshot:await snapshot(actor,body.includeBank!==false)};
    let result, includeBank=false;
    if(op==='createExam'){
      const e=body.exam;
      requireValue(e && typeof e.id==='string' && e.id.length<160 && typeof e.title==='string' && e.title.trim().length>0 && e.title.length<=200,'Tên đề không hợp lệ.');
      const practice=e.type==='practice';
      requireValue(practice?actor.role==='student':actor.role==='teacher','Không có quyền tạo bài.',403);
      requireValue(Array.isArray(e.questions)&&e.questions.length>0&&e.questions.length<=100&&new Set(e.questions.map(q=>q.id)).size===e.questions.length,'Đề phải có 1 đến 100 câu khác nhau.');
      const rows=await checked(scoped(db,'toan6_questions',actor).in('id',e.questions.map(q=>q.id)));
      requireValue(rows.length===e.questions.length,'Một câu hỏi không có trong ngân hàng.');
      const map=new Map(rows.map(r=>[r.id,r.payload]));
      requireValue(Number.isInteger(e.timeLimitMinutes)&&e.timeLimitMinutes>=1&&e.timeLimitMinutes<=180&&Number.isInteger(e.maxRetries)&&e.maxRetries>=1&&e.maxRetries<=999&&Date.parse(e.deadline)>Date.now(),'Thời gian, lượt làm hoặc hạn nộp không hợp lệ.');
      requireValue(['submit','deadline'].includes(e.showSolutionAfter),'Cấu hình lời giải không hợp lệ.');
      requireValue(practice || e.assignedTo==='all' || Array.isArray(e.assignedTo),'Danh sách nhận bài không hợp lệ.');
      if(!practice && Array.isArray(e.assignedTo)){
        const students=await checked(scoped(db,'toan6_profiles',actor).eq('role','student').in('id',e.assignedTo));
        requireValue(students.length===new Set(e.assignedTo).size,'Danh sách nhận bài không thuộc lớp.');
      }
      const payload={...e,title:e.title.trim(),createdBy:actor.id,createdAt:new Date().toISOString(),status:'active',
        assignedTo:practice?[actor.id]:e.assignedTo,questions:e.questions.map(q=>map.get(q.id))};
      const existing=await checked(db.from('toan6_exams').select('class_id,created_by').eq('id',e.id).maybeSingle());
      requireValue(!existing || existing.class_id===actor.class_id && existing.created_by===actor.id,'Mã đề đã tồn tại.',409);
      await checked(db.from('toan6_exams').upsert({id:e.id,class_id:actor.class_id,created_by:actor.id,payload},{onConflict:'id',ignoreDuplicates:true}));
      result={id:e.id};
    } else if(op==='startExam'){
      requireValue(actor.role==='student','Chỉ học sinh được làm bài.',403);
      await examFor(actor,body.examId);
      result=await checked(db.rpc('toan6_begin_attempt',{p_student:actor.id,p_exam:body.examId}));
    } else if(op==='submit'){
      requireValue(actor.role==='student','Chỉ học sinh được nộp bài.',403);
      const attempt=await checked(scoped(db,'toan6_attempts',actor).eq('id',body.attemptId).eq('student_id',actor.id).maybeSingle());
      requireValue(attempt,'Không tìm thấy lượt làm của bạn.',403);
      const exam=(await examFor(actor,attempt.exam_id)).payload;
      requireValue(body.answers && typeof body.answers==='object' && !Array.isArray(body.answers),'Đáp án không hợp lệ.');
      const answers=gradeQuestions(exam.questions,body.answers), correctCount=answers.filter(a=>a.isCorrect).length;
      const now=new Date().toISOString();
      const submission={id:'sub-'+attempt.id,examId:exam.id,examTitle:exam.title,studentId:actor.id,studentName:actor.full_name,
        startedAt:attempt.started_at,submittedAt:now,durationSeconds:Math.max(0,Math.min(exam.timeLimitMinutes*60,Math.floor((Date.now()-Date.parse(attempt.started_at))/1000))),
        score:Number((correctCount*10/answers.length).toFixed(1)),totalQuestions:answers.length,correctCount,wrongCount:answers.length-correctCount,
        answers,speedRating:'normal',isLate:Date.now()>Date.parse(exam.deadline)};
      const wrong=answers.filter(a=>!a.isCorrect).map(a=>{
        const q=exam.questions.find(q=>q.id===a.questionId);
        return {id:'wq-'+actor.id+'-'+q.id,studentId:actor.id,questionId:q.id,question:q,
          wrongAnswer:q.options?.find(o=>o.id===a.selectedAnswerText||o.label===a.selectedAnswerText)?.text||a.selectedAnswerText||'Chưa trả lời',
          correctAnswer:q.correctAnswers?.[0]||q.options?.find(o=>o.isCorrect)?.label||'',wrongCount:1,lastWrongAt:now,isResolved:false,teacherNote:q.teacherAdvice||'',sourceExamId:exam.id};
      });
      result=await checked(db.rpc('toan6_finish_attempt',{p_attempt:attempt.id,p_submission:submission,p_wrong:wrong}));
    } else if(op==='sendMessage'){
      requireValue(actor.role!=='student'&&(actor.role==='teacher'||actor.id===body.parentId),'Không có quyền gửi tin.',403);
      const parent=await checked(scoped(db,'toan6_profiles',actor).eq('role','parent').eq('id',body.parentId).eq('status','active').maybeSingle());
      requireValue(parent?.linked_student_id,'Không tìm thấy phụ huynh đã liên kết.');
      const text=typeof body.body==='string'?body.body.trim():'';
      requireValue(text.length>0&&text.length<=3000,'Tin nhắn phải có từ 1 đến 3000 ký tự.');
      const id=typeof body.id==='string'&&body.id.length<160?body.id:randomUUID();
      const existing=await checked(db.from('toan6_messages').select('class_id,sender_id,parent_id').eq('id',id).maybeSingle());
      requireValue(!existing || existing.class_id===actor.class_id && existing.sender_id===actor.id && existing.parent_id===body.parentId,'Mã tin nhắn không hợp lệ.',409);
      await checked(db.from('toan6_messages').upsert({id,class_id:actor.class_id,parent_id:body.parentId,sender_id:actor.id,body:text},{onConflict:'id',ignoreDuplicates:true}));
    } else if(op==='readMessages'){
      requireValue(actor.role!=='student'&&(actor.role==='teacher'||actor.id===body.parentId),'Không có quyền đọc tin.',403);
      await checked(db.from('toan6_messages').update({read_at:new Date().toISOString()}).eq('class_id',actor.class_id).eq('parent_id',body.parentId).neq('sender_id',actor.id).is('read_at',null));
    } else if(op==='linkParent')result=await provision(actor,'parent',body.input,body.password,body.studentId);
    else if(op==='createStudent'){
      result=await provision(actor,'student',body.student,body.password);
      if(body.parent?.fullName) {
        try {await provision(actor,'parent',body.parent,body.password,result.id);}
        catch {throw new CloudError('Đã tạo học sinh nhưng chưa liên kết phụ huynh. Dùng nút Thêm phụ huynh, không tạo lại học sinh.',409);}
      }
    } else if(op==='importStudents'){
      teacherOnly(actor);
      requireValue(Array.isArray(body.students)&&body.students.length>0&&body.students.length<=200,'Danh sách không hợp lệ.');
      let count=0;
      for(const row of body.students){await provision(actor,'student',row,row.initialPassword);count++;}
      result=count;
    } else if(op==='saveQuestion'||op==='importQuestions'){
      teacherOnly(actor);const questions=op==='saveQuestion'?[body.question]:body.questions;
      requireValue(Array.isArray(questions)&&questions.length>0&&questions.length<=10000,'Ngân hàng không hợp lệ.');
      const ids=new Set();
      for(const q of questions){
        requireValue(q&&typeof q.id==='string'&&!ids.has(q.id)&&Number.isInteger(q.chapterId)&&q.chapterId>=1&&q.chapterId<=9&&Number.isInteger(q.lessonId)&&q.lessonId>0&&typeof q.content==='string'&&q.content.trim()&&Array.isArray(q.solutionSteps),'Câu hỏi không hợp lệ.');
        ids.add(q.id);
      }
      // Keep database RLS active for bank writes, including cross-class ID collisions.
      const teacherClient=createClient(url,publicKey,{global:{headers:{Authorization:'Bearer '+token}},auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
      await checked(teacherClient.rpc('toan6_import_question_bank',{target_class:actor.class_id,questions}));
      includeBank=true;result=questions.length;
    } else if(op==='deleteQuestion'){
      teacherOnly(actor);await checked(db.from('toan6_questions').delete().eq('class_id',actor.class_id).eq('id',body.id));includeBank=true;
    } else if(op==='resolveWrong'){
      const row=await checked(scoped(db,'toan6_wrong_questions',actor).eq('id',body.id).maybeSingle());
      requireValue(row&&(actor.role==='teacher'||actor.role==='student'&&row.student_id===actor.id),'Không có quyền sửa sổ câu sai.',403);
      await checked(db.from('toan6_wrong_questions').update({payload:{...row.payload,isResolved:true}}).eq('id',row.id).eq('class_id',actor.class_id));
    } else if(op==='remindChild'){
      requireValue(actor.role==='parent'&&actor.linked_student_id,'Chưa liên kết với học sinh.',403);
      const id=randomUUID(),payload={id,studentId:actor.linked_student_id,body:actor.full_name+' nhắc em hoàn thành bài tập được giao.',createdAt:new Date().toISOString()};
      await checked(db.from('toan6_reminders').insert({id,class_id:actor.class_id,student_id:actor.linked_student_id,payload}));
    } else if(op==='readReminders'){
      requireValue(actor.role==='student','Không có quyền đọc nhắc nhở.',403);
      const rows=await checked(scoped(db,'toan6_reminders',actor).eq('student_id',actor.id));
      if(rows.length)await checked(db.from('toan6_reminders').upsert(rows.map(r=>({...r,payload:{...r.payload,readAt:new Date().toISOString()}}))));
    } else if(op==='saveDraft'){
      requireValue(typeof body.id==='string'&&body.id.length<160&&body.payload&&JSON.stringify(body.payload).length<200000,'Bản nháp quá lớn hoặc không hợp lệ.');
      const id=actor.id+':'+body.id;
      await checked(db.from('toan6_drafts').upsert({id,class_id:actor.class_id,owner_id:actor.id,payload:{...body.payload,updatedAt:new Date().toISOString()}},{onConflict:'id'}));
    } else if(op==='deleteDraft'){
      requireValue(typeof body.id==='string'&&body.id.length<160,'Mã bản nháp không hợp lệ.');
      await checked(db.from('toan6_drafts').delete().eq('class_id',actor.class_id).eq('owner_id',actor.id).eq('id',actor.id+':'+body.id));
    } else if(op==='changePassword'){
      requireValue(typeof body.oldPassword==='string'&&typeof body.newPassword==='string'&&body.newPassword.length>=8&&body.newPassword.length<=100&&body.oldPassword!==body.newPassword,'Mật khẩu mới phải khác mật khẩu cũ và có ít nhất 8 ký tự.');
      const authUser=await db.auth.admin.getUserById(actor.auth_user_id);
      const authClient=createClient(url,publicKey,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}});
      const login=await authClient.auth.signInWithPassword({email:authUser.data.user.email,password:body.oldPassword});
      requireValue(!login.error,'Mật khẩu hiện tại không đúng.',401);
      const update=await authClient.auth.updateUser({password:body.newPassword});
      if(update.error)throw new CloudError('Chưa đổi được mật khẩu. Hãy thử lại.',503);
      const currentSession = (await authClient.auth.getSession()).data.session;
      result={session:{access_token:currentSession.access_token,refresh_token:currentSession.refresh_token}};
    } else throw new CloudError('Thao tác không được hỗ trợ.',404);
    return {result,snapshot:await snapshot(actor,includeBank)};
  }
  return {dispatch,snapshot,authenticate};
}

export function createCloudHandler(config) {
  const api=createCloudApi(config);
  return async function handler(req,res) {
    res.setHeader('Cache-Control','no-store');res.setHeader('Content-Type','application/json; charset=utf-8');
    try {
      requireValue(req.method==='POST','Phương thức không hợp lệ.',405);
      const origin=req.headers.origin;
      requireValue(!origin||new URL(origin).host===req.headers.host,'Nguồn yêu cầu không hợp lệ.',403);
      let body=req.body;
      if(!body){const chunks=[];let size=0;for await(const chunk of req){const buffer=Buffer.isBuffer(chunk)?chunk:Buffer.from(chunk);size+=buffer.length;requireValue(size<=4*1024*1024,'Yêu cầu quá lớn.',413);chunks.push(buffer);}body=Buffer.concat(chunks).toString('utf8');}
      if(typeof body==='string'){
        try { body=JSON.parse(body); } catch { throw new CloudError('Dữ liệu JSON không hợp lệ.'); }
      }
      requireValue(Buffer.byteLength(JSON.stringify(body)||'')<=4*1024*1024,'Yêu cầu quá lớn.',413);
      requireValue(body&&typeof body.op==='string','Yêu cầu không hợp lệ.');
      const token=req.headers.authorization?.replace(/^Bearer /,'');
      const result=await api.dispatch(body.op,body,token,req.socket?.remoteAddress||'serverless');
      res.statusCode=200;res.end(JSON.stringify(result));
    } catch(error) {
      res.statusCode=error instanceof CloudError?error.status:500;
      res.end(JSON.stringify({error:error instanceof CloudError?error.message:'Máy chủ chưa xử lý được. Dữ liệu chưa được xác nhận, hãy thử lại.'}));
    }
  };
}
