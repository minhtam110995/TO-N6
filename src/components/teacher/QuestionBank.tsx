import React, { useEffect, useState } from 'react';
import { getQuestionBank, saveQuestion, deleteQuestion } from '../../services/storage';
import { CHAPTERS_DATA } from '../../data/seedQuestions';
import { Question, CognitiveLevel, QuestionType } from '../../types';
import { MathRenderer } from '../common/MathRenderer';
import { QuestionImport } from './QuestionImport';

export const QuestionBank: React.FC = () => {
  const [bank, setBank] = useState<Question[]>(getQuestionBank);
  const [selectedChapter, setSelectedChapter] = useState<number>(0); // 0 = all
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [importOpen, setImportOpen] = useState(false);
  const [importMessage, setImportMessage] = useState('');

  // Form states for adding/editing question
  const [formChapter, setFormChapter] = useState(6);
  const [formLesson, setFormLesson] = useState(23);
  const [formLevel, setFormLevel] = useState<CognitiveLevel>('nhan_biet');
  const [formType, setFormType] = useState<QuestionType>('multiple_choice');
  const [formContent, setFormContent] = useState('');
  const [formFormula, setFormFormula] = useState('');
  const [formAnswer, setFormAnswer] = useState('');
  const [formOptions, setFormOptions] = useState(['', '', '', '']);
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [selectedChapter, selectedLevel, searchTerm]);
  const [formSolution, setFormSolution] = useState('');
  const [formAdvice, setFormAdvice] = useState('');

  const refreshBank = () => {
    setBank(getQuestionBank());
    setPage(1);
  };

  const filteredQuestions = bank.filter(q => {
    const matchChap = selectedChapter === 0 || q.chapterId === selectedChapter;
    const matchLvl = selectedLevel === 'all' || q.level === selectedLevel;
    const matchSearch = q.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.lessonTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchChap && matchLvl && matchSearch;
  });

  const handleDelete = (id: string) => {
    if (confirm('Bạn có chắc muốn xoá câu hỏi này khỏi ngân hàng?')) {
      deleteQuestion(id);
      refreshBank();
    }
  };

  const handleOpenAdd = () => {
    setEditingQuestion(null);
    setFormChapter(6);
    setFormLesson(23);
    setFormLevel('nhan_biet');
    setFormType('multiple_choice');
    setFormContent('');
    setFormFormula('');
    setFormAnswer('A');
    setFormOptions(['', '', '', '']);
    setFormSolution('');
    setFormAdvice('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formContent.trim()) {
      alert('Vui lòng nhập nội dung câu hỏi!');
      return;
    }

    const chap = CHAPTERS_DATA.find(c => c.id === formChapter);
    const les = chap?.lessons.find(l => l.id === formLesson);
    if (!les) return alert('Chọn bài học thuộc chương đã chọn.');
    if (formType === 'multiple_choice' && (formOptions.some(o => !o.trim()) || !['A', 'B', 'C', 'D'].includes(formAnswer))) return alert('Nhập đủ bốn lựa chọn và chọn đáp án đúng.');
    if (formType === 'fill_in_the_blank' && !formAnswer.trim()) return alert('Nhập đáp án đúng.');

    const newQ: Question = {
      id: editingQuestion?.id || `q-custom-${Date.now()}`,
      chapterId: formChapter,
      chapterTitle: chap?.title || `Chương ${formChapter}`,
      lessonId: formLesson,
      lessonTitle: les?.title || `Bài ${formLesson}`,
      level: formLevel,
      type: formType,
      content: formContent,
      mathFormula: formFormula || undefined,
      correctAnswers: formType === 'fill_in_the_blank' ? formAnswer.split('|').map(a => a.trim()).filter(Boolean) : undefined,
      options: formType === 'multiple_choice' ? formOptions.map((text, i) => ({ id: `opt-${i}`, label: 'ABCD'[i], text: text.trim(), isCorrect: formAnswer === 'ABCD'[i] })) : undefined,
      solutionSteps: [
        { step: 1, title: 'Hướng dẫn giải', explanation: formSolution || 'Áp dụng định nghĩa và tính chất cơ bản SGK.' }
      ],
      teacherAdvice: formAdvice || undefined,
      estimatedSeconds: 60,
      difficultyScore: formLevel === 'nhan_biet' ? 0.5 : formLevel === 'thong_hieu' ? 0.75 : 1.0,
    };

    saveQuestion(newQ);
    refreshBank();
    setIsModalOpen(false);
    alert('Đã lưu câu hỏi vào ngân hàng thành công!');
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(bank, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "toan6_kntt_seed_questions.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 question-bank">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ngân hàng câu hỏi Toán 6</h1>
          <p className="text-xs text-slate-500 mt-1">
            Soạn sẵn theo 9 chương SGK Kết nối tri thức với cuộc sống • Đầy đủ 4 mức độ nhận thức
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button className="secondary-button" onClick={() => setImportOpen(true)}><span className="material-symbols-outlined">upload</span>Nạp câu hỏi từ file</button>
          <button
            onClick={handleExportJSON}
            className="px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base text-blue-600">download</span>
            <span>Xuất tệp Seed JSON</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-base">add_circle</span>
            <span>Thêm câu hỏi mới</span>
          </button>
        </div>
      </div>

      {/* Filters Toolbar */}
      {importMessage && <p role="status" className="correct">{importMessage}</p>}
      {importOpen && <QuestionImport onClose={() => setImportOpen(false)} onDone={count => { refreshBank(); setImportOpen(false); setImportMessage(`Đã thêm ${count} câu, bỏ qua các câu trùng nội dung.`); }} />}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="bank-search flex-1 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Tìm theo nội dung, bài học, công thức..."
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="bank-filter-selects flex items-center gap-2 flex-wrap">
          <select
            value={selectedChapter}
            onChange={e => setSelectedChapter(Number(e.target.value))}
            className="py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800"
          >
            <option value={0}>Tất cả 9 chương</option>
            {CHAPTERS_DATA.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>

          <select
            value={selectedLevel}
            onChange={e => setSelectedLevel(e.target.value)}
            className="py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800"
          >
            <option value="all">Tất cả mức độ</option>
            <option value="nhan_biet">Nhận biết</option>
            <option value="thong_hieu">Thông hiểu</option>
            <option value="van_dung">Vận dụng</option>
            <option value="van_dung_cao">Vận dụng cao</option>
          </select>
        </div>
      </div>

      {/* Questions Stream */}
      <div className="space-y-4">
        {filteredQuestions.slice((Math.min(page, Math.max(1, Math.ceil(filteredQuestions.length / 20))) - 1) * 20, Math.min(page, Math.max(1, Math.ceil(filteredQuestions.length / 20))) * 20).map((q, idx) => (
          <div key={q.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-2 min-w-0 flex-1">
                <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold text-xs">
                  #{idx + 1}
                </span>
                <span className="text-xs font-bold text-slate-700">{q.chapterTitle} • {q.lessonTitle}</span>
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                  q.level === 'nhan_biet' ? 'bg-emerald-100 text-emerald-800' :
                  q.level === 'thong_hieu' ? 'bg-blue-100 text-blue-800' :
                  q.level === 'van_dung' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800'
                }`}>
                  {q.level === 'nhan_biet' ? 'Nhận biết' : q.level === 'thong_hieu' ? 'Thông hiểu' : q.level === 'van_dung' ? 'Vận dụng' : 'Vận dụng cao'}
                </span>
                <span className="text-xs text-slate-400">({q.estimatedSeconds}s)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleDelete(q.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                  title="Xoá câu hỏi"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                </button>
              </div>
            </div>

            <p className="font-semibold text-sm text-slate-900">{q.content}</p>

            {q.mathFormula && (
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center font-bold text-base text-blue-700">
                <MathRenderer formula={q.mathFormula} />
              </div>
            )}

            {q.type === 'multiple_choice' && q.options && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {q.options.map(opt => (
                  <div
                    key={opt.id}
                    className={`p-2.5 rounded-xl border flex items-center justify-between ${
                      opt.isCorrect ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold' : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    <span>{opt.label}. {opt.text}</span>
                    {opt.isCorrect && <span className="text-emerald-700 font-bold">✓ Đáp án đúng</span>}
                  </div>
                ))}
              </div>
            )}

            {q.type === 'fill_in_the_blank' && (
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center gap-2">
                <span className="font-semibold text-slate-700">Đáp án điền số chấp nhận:</span>
                <span className="font-mono font-bold bg-white px-2 py-0.5 rounded border border-emerald-300 text-emerald-800">
                  {q.correctAnswers?.join(' | ')}
                </span>
              </div>
            )}

            <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-slate-700 flex items-start gap-1.5">
              <span className="material-symbols-outlined text-blue-600 text-base">lightbulb</span>
              <div>
                <strong className="text-blue-900">Lời giải từng bước: </strong>
                {q.solutionSteps[0]?.explanation}
                {q.teacherAdvice && <p className="text-orange-700 font-medium mt-0.5">💡 Lời khuyên: {q.teacherAdvice}</p>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Modal */}
      <div className="pagination"><button className="secondary-button" disabled={page <= 1} onClick={() => setPage(Math.max(1, page - 1))}>Trước</button><span>{filteredQuestions.length} câu · Trang {Math.min(page, Math.max(1, Math.ceil(filteredQuestions.length / 20)))}/{Math.max(1, Math.ceil(filteredQuestions.length / 20))}</span><button className="secondary-button" disabled={page >= Math.ceil(filteredQuestions.length / 20)} onClick={() => setPage(page + 1)}>Tiếp</button></div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h3 className="font-bold text-base text-slate-900">Thêm câu hỏi mới vào ngân hàng</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Chương</label>
                <select
                  value={formChapter}
                  onChange={e => { const id = Number(e.target.value); setFormChapter(id); setFormLesson(CHAPTERS_DATA.find(c => c.id === id)!.lessons[0].id); }}
                  className="w-full p-2 rounded-xl border border-slate-300"
                >
                  {CHAPTERS_DATA.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <label className="col-span-2">Bài học<select className="w-full p-2 rounded-xl border border-slate-300" value={formLesson} onChange={e => setFormLesson(Number(e.target.value))}>{CHAPTERS_DATA.find(c => c.id === formChapter)?.lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}</select></label>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mức độ nhận thức</label>
                  <select
                    value={formLevel}
                    onChange={e => setFormLevel(e.target.value as CognitiveLevel)}
                    className="w-full p-2 rounded-xl border border-slate-300"
                  >
                    <option value="nhan_biet">Nhận biết</option>
                    <option value="thong_hieu">Thông hiểu</option>
                    <option value="van_dung">Vận dụng</option>
                    <option value="van_dung_cao">Vận dụng cao</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Dạng câu hỏi</label>
                  <select
                    value={formType}
                    onChange={e => { setFormType(e.target.value as QuestionType); setFormAnswer(e.target.value === 'multiple_choice' ? 'A' : ''); }}
                    className="w-full p-2 rounded-xl border border-slate-300"
                  >
                    <option value="multiple_choice">Trắc nghiệm 4 đáp án</option>
                    <option value="fill_in_the_blank">Điền số</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nội dung câu hỏi</label>
                <textarea
                  rows={2}
                  value={formContent}
                  onChange={e => setFormContent(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs"
                  placeholder="Nhập nội dung đề bài..."
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Công thức toán (LaTeX nếu có)</label>
                <input
                  type="text"
                  value={formFormula}
                  onChange={e => setFormFormula(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs font-mono"
                  placeholder="VD: \frac{x}{-5} = \frac{12}{20}"
                />
              </div>

              {formType === 'multiple_choice' && <div className="space-y-2">{formOptions.map((text, i) => <label className="block" key={i}>Lựa chọn {'ABCD'[i]}<input className="w-full p-2 rounded-xl border border-slate-300" required value={text} onChange={e => setFormOptions(prev => prev.map((v, j) => i === j ? e.target.value : v))} /></label>)}</div>}
              <div>
                <label className="block font-bold text-slate-700 mb-1">Đáp án đúng</label>
                {formType === 'multiple_choice' ? <select className="w-full p-2 rounded-xl border border-slate-300" value={formAnswer} onChange={e => setFormAnswer(e.target.value)}>{['A', 'B', 'C', 'D'].map(label => <option key={label}>{label}</option>)}</select> :
                <input
                  type="text"
                  value={formAnswer}
                  onChange={e => setFormAnswer(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs"
                  placeholder="Nhập đáp án đúng (hoặc giá trị số)"
                  required
                />}
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lời giải từng bước</label>
                <textarea
                  rows={2}
                  value={formSolution}
                  onChange={e => setFormSolution(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs"
                  placeholder="Giải thích các bước giải..."
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Lời khuyên / Mẹo tránh bẫy</label>
                <input
                  type="text"
                  value={formAdvice}
                  onChange={e => setFormAdvice(e.target.value)}
                  className="w-full p-2 rounded-xl border border-slate-300 text-xs"
                  placeholder="Nhắc học sinh quy tắc cần nhớ..."
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                  Lưu vào ngân hàng
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
