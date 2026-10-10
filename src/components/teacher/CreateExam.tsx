import React, { useState } from 'react';
import { generateExamQuestions, createExam } from '../../services/storage';
import { Question } from '../../types';
import { MathRenderer } from '../common/MathRenderer';

interface CreateExamProps {
  onSuccess: () => void;
}

export const CreateExam: React.FC<CreateExamProps> = ({ onSuccess }) => {
  const [examTitle, setExamTitle] = useState('Kiểm tra 15 phút: Phân số bằng nhau và Rút gọn phân số');
  const [selectedChapter, setSelectedChapter] = useState(6);
  const [selectedLessons, setSelectedLessons] = useState<number[]>([23, 24]);
  const [questionCount, setQuestionCount] = useState(15);
  const [timeLimit, setTimeLimit] = useState(20);
  const [retries, setRetries] = useState(1);
  const [deadline, setDeadline] = useState('2026-10-15T21:00');
  const [shuffleQuestions, setShuffleQuestions] = useState(true);
  const [shuffleOptions, setShuffleOptions] = useState(true);
  const [showSolution, setShowSolution] = useState<'submit' | 'deadline'>('submit');

  const [matrix, setMatrix] = useState({
    nhanBietPercent: 40,
    thongHieuPercent: 30,
    vanDungPercent: 20,
    vanDungCaoPercent: 10,
  });

  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>(() =>
    generateExamQuestions(6, [23, 24], 15, matrix)
  );

  const [showAllQuestions, setShowAllQuestions] = useState(false);

  const handleGenerateQuestions = () => {
    const questions = generateExamQuestions(selectedChapter, selectedLessons, questionCount, matrix);
    setGeneratedQuestions(questions);
  };

  const handleSwapQuestion = (index: number) => {
    const questions = generateExamQuestions(selectedChapter, selectedLessons, questionCount, matrix);
    const newQuestions = [...generatedQuestions];
    if (questions[0]) {
      newQuestions[index] = questions[0];
      setGeneratedQuestions(newQuestions);
    }
  };

  const handleAssignExam = () => {
    createExam({
      id: `exam-${Date.now()}`,
      title: examTitle,
      type: 'test',
      chapterId: selectedChapter,
      lessonIds: selectedLessons,
      questionCount,
      matrix,
      timeLimitMinutes: timeLimit,
      deadline: new Date(deadline).toISOString(),
      maxRetries: retries,
      shuffleQuestions,
      shuffleOptions,
      showSolutionAfter: showSolution,
      assignedTo: 'all',
      createdBy: 'cotamtoan',
      createdAt: new Date().toISOString(),
      questions: generatedQuestions,
      status: 'active',
    });

    alert(`🎉 Đã tạo và giao thành công đề thi "${examTitle}" cho 40 học sinh Lớp 6A4!`);
    onSuccess();
  };

  const toggleLesson = (lessonId: number) => {
    setSelectedLessons(prev =>
      prev.includes(lessonId) ? prev.filter(id => id !== lessonId) : [...prev, lessonId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700">Lớp 6A4 - 40 học sinh</span>
            <span>•</span>
            <span className="text-slate-800">Tạo đề tự động</span>
            <span>•</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              SGK Chuẩn 2026-2027
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Thiết lập ma trận &amp; Giao bài</h1>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => alert('Đã lưu bản nháp đề thi thành công!')}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs"
          >
            Lưu bản nháp
          </button>
          <button
            onClick={handleAssignExam}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition"
          >
            <span className="material-symbols-outlined text-base">send</span>
            <span>Tạo đề &amp; Giao bài ngay</span>
          </button>
        </div>
      </div>

      {/* Main Grid: 5 Cols Left (Cấu hình) & 7 Cols Right (Xem trước đề) */}
      <div className="grid grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: 5 COLS */}
        <section className="col-span-12 xl:col-span-5 space-y-5">
          {/* Box 1: Cấu hình tự động */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-xl">tune</span>
                <h3 className="font-bold text-sm text-slate-900">Cấu hình tự động</h3>
              </div>
              <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">Tự động 100%</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tên đề kiểm tra</label>
              <input
                type="text"
                value={examTitle}
                onChange={e => setExamTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phạm vi kiến thức (SGK Kết nối tri thức)
              </label>
              <select
                value={selectedChapter}
                onChange={e => setSelectedChapter(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-slate-50 mb-2 cursor-pointer"
              >
                <option value={6}>Chương VI: Phân số</option>
                <option value={1}>Chương I: Tập hợp các số tự nhiên</option>
                <option value={2}>Chương II: Tính chia hết trong tập số tự nhiên</option>
                <option value={3}>Chương III: Số nguyên</option>
                <option value={4}>Chương IV: Một số hình phẳng trong thực tiễn</option>
                <option value={5}>Chương V: Tính đối xứng của hình phẳng</option>
                <option value={7}>Chương VII: Số thập phân</option>
                <option value={8}>Chương VIII: Những hình hình học cơ bản</option>
                <option value={9}>Chương IX: Dữ liệu và xác suất thực nghiệm</option>
              </select>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Chọn bài học cần đánh giá:</div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedLessons.includes(23)}
                    onChange={() => toggleLesson(23)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium text-slate-800">Bài 23: Mở rộng phân số. Phân số bằng nhau</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedLessons.includes(24)}
                    onChange={() => toggleLesson(24)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-medium text-slate-800">Bài 24: So sánh phân số. Hỗn số dương</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-slate-500">
                  <input
                    type="checkbox"
                    checked={selectedLessons.includes(25)}
                    onChange={() => toggleLesson(25)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span>Bài 25: Phép cộng và phép trừ phân số</span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tổng số câu hỏi</label>
                <div className="flex items-center rounded-xl border border-slate-300 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setQuestionCount(c => Math.max(5, c - 5))}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-xs font-bold"
                  >
                    -
                  </button>
                  <input
                    type="text"
                    readOnly
                    value={`${questionCount} câu`}
                    className="w-full text-center text-xs font-bold text-blue-700 border-none p-1"
                  />
                  <button
                    type="button"
                    onClick={() => setQuestionCount(c => Math.min(40, c + 5))}
                    className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-xs font-bold"
                  >
                    +
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hình thức ra đề</label>
                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-700 flex items-center justify-between">
                  <span>Trắc nghiệm (12) + Điền số (3)</span>
                  <span className="material-symbols-outlined text-sm text-blue-600">check_circle</span>
                </div>
              </div>
            </div>
          </div>

          {/* Box 2: Ma trận 4 mức độ nhận thức */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600 text-xl">bar_chart</span>
                <h3 className="font-bold text-sm text-slate-900">Ma trận 4 mức độ nhận thức</h3>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Tổng: 100% ({questionCount} câu)
              </span>
            </div>

            {/* Segmented bar */}
            <div>
              <div className="h-3 w-full rounded-full bg-slate-100 overflow-hidden flex">
                <div style={{ width: `${matrix.nhanBietPercent}%` }} className="bg-emerald-500" title="Nhận biết 40%"></div>
                <div style={{ width: `${matrix.thongHieuPercent}%` }} className="bg-blue-600" title="Thông hiểu 30%"></div>
                <div style={{ width: `${matrix.vanDungPercent}%` }} className="bg-amber-500" title="Vận dụng 20%"></div>
                <div style={{ width: `${matrix.vanDungCaoPercent}%` }} className="bg-purple-600" title="Vận dụng cao 10%"></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 font-medium mt-1">
                <span>0%</span>
                <span>40%</span>
                <span>70%</span>
                <span>90%</span>
                <span>100%</span>
              </div>
            </div>

            {/* 4 tiers items */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <div>
                    <span className="font-bold text-emerald-950">Nhận biết</span>
                    <span className="text-[11px] text-emerald-700 block">Khái niệm, nhận dạng phân số cơ bản</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-800">{matrix.nhanBietPercent}%</span>
                  <span className="ml-1 text-[11px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-semibold">6 câu</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-blue-50/70 border border-blue-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                  <div>
                    <span className="font-bold text-blue-950">Thông hiểu</span>
                    <span className="text-[11px] text-blue-700 block">Quy đồng, tính chất phân số bằng nhau</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-blue-800">{matrix.thongHieuPercent}%</span>
                  <span className="ml-1 text-[11px] text-blue-700 bg-blue-100 px-1.5 py-0.2 rounded font-semibold">5 câu</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-amber-50/70 border border-amber-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                  <div>
                    <span className="font-bold text-amber-950">Vận dụng</span>
                    <span className="text-[11px] text-amber-700 block">Tìm x, rút gọn biểu thức có số nguyên âm</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-amber-800">{matrix.vanDungPercent}%</span>
                  <span className="ml-1 text-[11px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded font-semibold">3 câu</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/70 border border-purple-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-600"></span>
                  <div>
                    <span className="font-bold text-purple-950">Vận dụng cao</span>
                    <span className="text-[11px] text-purple-700 block">Tìm n thuộc Z để phân số đạt giá trị nguyên</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-purple-800">{matrix.vanDungCaoPercent}%</span>
                  <span className="ml-1 text-[11px] text-purple-700 bg-purple-100 px-1.5 py-0.2 rounded font-semibold">1 câu</span>
                </div>
              </div>
            </div>
          </div>

          {/* Box 3: Cài đặt phòng thi & giao bài */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
              <span className="material-symbols-outlined text-blue-600 text-lg">schedule</span>
              <h3 className="font-bold text-sm text-slate-900">Cài đặt phòng thi &amp; giao bài</h3>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Thời gian làm bài</label>
                <div className="flex items-center rounded-xl border border-slate-300 px-3 py-2 bg-white">
                  <span className="material-symbols-outlined text-sm text-slate-400 mr-1.5">timer</span>
                  <input
                    type="number"
                    value={timeLimit}
                    onChange={e => setTimeLimit(Number(e.target.value))}
                    className="w-full border-none p-0 focus:ring-0 font-bold text-slate-800"
                  />
                  <span className="text-slate-500 ml-1">phút</span>
                </div>
              </div>
              <div>
                <label className="block font-bold text-slate-700 mb-1">Số lần làm lại</label>
                <select
                  value={retries}
                  onChange={e => setRetries(Number(e.target.value))}
                  className="w-full py-2 px-2.5 rounded-xl border border-slate-300 font-semibold text-slate-800 bg-white"
                >
                  <option value={1}>1 lần duy nhất</option>
                  <option value={2}>2 lần (Lấy cao nhất)</option>
                  <option value={999}>Không giới hạn</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Hạn nộp bài</label>
              <input
                type="datetime-local"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium bg-white"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-2.5 text-xs">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-semibold text-slate-800">Đảo thứ tự câu hỏi</span>
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={e => setShuffleQuestions(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-semibold text-slate-800">Đảo thứ tự các đáp án</span>
                <input
                  type="checkbox"
                  checked={shuffleOptions}
                  onChange={e => setShuffleOptions(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="font-semibold text-slate-800">Cho phép xem lời giải sau khi nộp</span>
                <input
                  type="checkbox"
                  checked={showSolution === 'submit'}
                  onChange={e => setShowSolution(e.target.checked ? 'submit' : 'deadline')}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={handleGenerateQuestions}
              className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">auto_awesome</span>
              <span>Tạo ma trận đề tự động</span>
            </button>
          </div>
        </section>

        {/* RIGHT COLUMN: 7 COLS (XEM TRƯỚC VÀ ĐỔI CÂU) */}
        <section className="col-span-12 xl:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <span className="material-symbols-outlined text-2xl">task_alt</span>
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900">
                    Đề kiểm tra đã sinh: {generatedQuestions.length} câu
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Đúng chuẩn ma trận
                  </span>
                </div>
                <p className="text-xs text-slate-500">Tự động chọn lọc theo 4 mức độ • Nhấp "Đổi câu khác" để tinh chỉnh</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGenerateQuestions}
                className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-base text-blue-600">shuffle</span>
                <span>Xáo lại toàn bộ</span>
              </button>
            </div>
          </div>

          {/* List of questions preview */}
          <div className="space-y-4">
            {(showAllQuestions ? generatedQuestions : generatedQuestions.slice(0, 4)).map((q, idx) => {
              const levelBadge = (lvl: string) => {
                if (lvl === 'nhan_biet') return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800">Nhận biết</span>;
                if (lvl === 'thong_hieu') return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-100 text-blue-800">Thông hiểu</span>;
                if (lvl === 'van_dung') return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800">Vận dụng</span>;
                return <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-800">Vận dụng cao</span>;
              };

              return (
                <div key={q.id + idx} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs">
                        Câu {idx + 1}
                      </span>
                      {levelBadge(q.level)}
                      <span className="text-xs text-slate-400">Điểm: {q.difficultyScore || 0.5}đ</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSwapQuestion(idx)}
                      className="flex items-center gap-1 text-xs text-blue-600 font-semibold hover:underline"
                    >
                      <span className="material-symbols-outlined text-sm">sync</span>
                      <span>Đổi câu khác</span>
                    </button>
                  </div>

                  <p className="font-semibold text-sm text-slate-900">{q.content}</p>

                  {q.mathFormula && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center font-bold text-base text-blue-700">
                      <MathRenderer formula={q.mathFormula} />
                    </div>
                  )}

                  {/* Options if multiple choice */}
                  {q.type === 'multiple_choice' && q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {q.options.map(opt => (
                        <div
                          key={opt.id}
                          className={`p-2.5 rounded-xl border flex items-center justify-between ${
                            opt.isCorrect
                              ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold'
                              : 'border-slate-200 bg-white text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[11px] ${
                              opt.isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {opt.label}
                            </span>
                            <span>{opt.text}</span>
                          </div>
                          {opt.isCorrect && (
                            <span className="text-emerald-700 text-[10px] font-bold flex items-center gap-0.5">
                              <span className="material-symbols-outlined text-xs">check_circle</span>
                              Đáp án đúng
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Fill in the blank preview */}
                  {q.type === 'fill_in_the_blank' && (
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-2">
                      <span className="font-semibold text-slate-700">Học sinh điền:</span>
                      <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-800">
                        {q.correctAnswers ? q.correctAnswers[0] : ''}
                      </span>
                      <span className="text-[11px] text-slate-400 italic">(Tự động nhận diện phân số tương đương &amp; dấu phẩy)</span>
                    </div>
                  )}

                  {/* Solution Preview */}
                  <div className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100 text-[11px] text-slate-600 flex items-start gap-1.5">
                    <span className="material-symbols-outlined text-blue-600 text-sm mt-0.5">lightbulb</span>
                    <div>
                      <strong className="text-blue-800">Lời giải chuẩn SGK: </strong>
                      {q.solutionSteps[0]?.explanation || 'Áp dụng định nghĩa và tính chất cơ bản.'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-white text-center flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {showAllQuestions
                ? `Đang hiển thị toàn bộ ${generatedQuestions.length} câu`
                : `Hiển thị 4 trong tổng số ${generatedQuestions.length} câu đã sinh`}
            </span>
            <button
              type="button"
              onClick={() => setShowAllQuestions(!showAllQuestions)}
              className="px-3.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold hover:bg-blue-100 transition flex items-center gap-1"
            >
              <span>{showAllQuestions ? 'Thu gọn' : `Xem tiếp ${generatedQuestions.length - 4} câu còn lại`}</span>
              <span className="material-symbols-outlined text-sm">
                {showAllQuestions ? 'expand_less' : 'expand_more'}
              </span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
