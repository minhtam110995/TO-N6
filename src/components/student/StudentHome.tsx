import React from 'react';

interface StudentHomeProps {
  onStartExam: (examId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const StudentHome: React.FC<StudentHomeProps> = ({ onStartExam, onNavigateTab }) => {
  return (
    <div className="space-y-4 max-w-md mx-auto pb-6">
      {/* Gamification Ribbon: Streak & XP */}
      <div className="grid grid-cols-2 gap-2.5">
        <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 shrink-0">
            <span className="material-symbols-outlined text-2xl fill-icon">local_fire_department</span>
          </div>
          <div>
            <div className="flex items-center gap-1 font-bold text-orange-600 text-sm">
              <span>5 ngày</span>
              <span className="text-xs font-normal">streak</span>
            </div>
            <span className="text-[11px] text-slate-500">Học đều mỗi ngày!</span>
          </div>
        </div>

        <div className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <span className="material-symbols-outlined text-2xl fill-icon">military_tech</span>
          </div>
          <div>
            <div className="flex items-center gap-1 font-bold text-blue-700 text-sm">
              <span>380</span>
              <span className="text-xs font-normal">Sao XP</span>
            </div>
            <span className="text-[11px] text-slate-500">Top 5 của lớp 6A4</span>
          </div>
        </div>
      </div>

      {/* 1. Hero Motivation Card */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white rounded-2xl p-5 shadow-sm">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[11px] font-semibold">
            <span className="material-symbols-outlined text-xs fill-icon">verified</span>
            Học sinh Tích cực tuần 14
          </div>
          <h2 className="text-lg font-bold leading-snug">
            Chào Khang! Hôm nay cùng chinh phục Phân số nhé! 🚀
          </h2>
          <p className="text-xs text-blue-100 opacity-95">
            Cô Tâm vừa giao thêm 1 bài tập quan trọng. Hãy hoàn thành sớm để giữ chuỗi học 5 ngày nhé!
          </p>
        </div>
        <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
        <div className="absolute top-2 right-4 text-white/15 select-none font-bold text-6xl pointer-events-none font-mono">
          ¼
        </div>
      </section>

      {/* 2. Bài cần làm hôm nay */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-lg fill-icon">assignment</span>
            <h3 className="font-bold text-base text-slate-900">Bài cần làm hôm nay</h3>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">2 bài</span>
        </div>

        {/* Task 1: Bài 23 (Urgent) */}
        <article className="bg-white rounded-2xl p-4 border-2 border-orange-200 shadow-xs space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-semibold rounded">
                  Chương VI: Phân số
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[11px] font-bold">
                  <span className="material-symbols-outlined text-xs fill-icon">schedule</span>
                  Sắp hết hạn
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 pt-0.5">
                Bài 23: Mở rộng phân số. Phân số bằng nhau
              </h4>
            </div>
          </div>

          <div className="flex items-center gap-3 text-slate-600 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
            <div className="flex items-center gap-1 text-orange-700 font-semibold">
              <span className="material-symbols-outlined text-sm">alarm</span>
              <span>Hạn nộp: <strong>21:00 hôm nay</strong></span>
            </div>
            <div className="w-1 h-1 rounded-full bg-slate-300"></div>
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">format_list_numbered</span>
              <span>15 câu • 20 phút</span>
            </div>
          </div>

          <div className="flex items-start gap-1.5 text-xs text-slate-600 pl-0.5">
            <span className="material-symbols-outlined text-blue-600 text-base shrink-0 mt-0.5">campaign</span>
            <span>Cô Mai dặn: <em>"Chú ý kiểm tra điều kiện mẫu số khác 0 nhé các em!"</em></span>
          </div>

          <button
            onClick={() => onStartExam('exam-01')}
            className="tactile-btn-orange w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">edit_note</span>
            <span>Làm bài ngay</span>
            <span className="material-symbols-outlined text-base">arrow_forward</span>
          </button>
        </article>

        {/* Task 2: Bài 24 */}
        <article className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[11px] font-semibold rounded">
                Chương VI: Phân số
              </span>
              <h4 className="font-bold text-sm text-slate-900 pt-1">
                Bài 24: So sánh phân số
              </h4>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
              20 câu
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-600 text-xs pt-1">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm text-slate-400">event</span>
              <span>Hạn nộp: 20:00 ngày mai</span>
            </div>
            <button
              onClick={() => onStartExam('exam-02')}
              className="text-blue-600 font-bold hover:underline flex items-center gap-0.5"
            >
              <span>Chi tiết</span>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
            </button>
          </div>
        </article>
      </section>

      {/* 3. Ôn tập đề xuất cho em (AI Weakness Fix) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-blue-600 text-lg fill-icon">psychology</span>
            <h3 className="font-bold text-base text-slate-900">Ôn tập đề xuất cho em</h3>
          </div>
          <span className="text-[11px] text-blue-700 font-semibold flex items-center gap-0.5">
            <span>AI cá nhân hóa</span>
            <span className="material-symbols-outlined text-xs">auto_awesome</span>
          </span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-blue-200/80 shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-orange-700">Chủ đề em cần cải thiện</span>
            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded-full">Nắm vững: 55%</span>
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900">
              Chương II - Quy tắc dấu ngoặc và phép nhân số nguyên
            </h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Tuần trước Khang hay nhầm dấu khi bỏ ngoặc có dấu trừ đằng trước: <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-slate-800 font-bold">-(a - b) = -a + b</code>
            </p>
          </div>
          <div className="bg-blue-50/60 rounded-xl p-3 flex items-center justify-between gap-3 border border-blue-100">
            <div className="flex items-center gap-2 text-xs text-slate-800 font-medium">
              <span className="material-symbols-outlined text-blue-600 text-lg">bolt</span>
              <span>Luyện 10 câu trọng tâm để tăng điểm</span>
            </div>
            <button
              onClick={() => onNavigateTab('wrong_book')}
              className="tactile-btn-blue px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl whitespace-nowrap shadow-xs"
            >
              Luyện ngay
            </button>
          </div>
        </div>
      </section>

      {/* 4. Nhiệm vụ tuần & Thử thách */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="material-symbols-outlined text-emerald-600 text-lg fill-icon">task_alt</span>
            <h3 className="font-bold text-base text-slate-900">Nhiệm vụ tuần &amp; Thử thách</h3>
          </div>
          <span className="text-xs font-bold text-emerald-700">Tuần 14</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-600 font-medium">Tiến độ bài tập tuần này:</span>
              <span className="font-bold text-blue-600">4/6 bài tập đã nộp</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 rounded-full" style={{ width: '66.6%' }}></div>
            </div>
            <p className="text-[11px] text-slate-400 text-right">Còn 2 bài tập trước Chủ nhật 23:59</p>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-base fill-icon">workspace_premium</span>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">Bậc thầy phép cộng</div>
                <div className="text-[10px] text-emerald-700 font-medium">Đã mở khóa 🎉</div>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-200 flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-base fill-icon">speed</span>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">Chiến binh đúng giờ</div>
                <div className="text-[10px] text-orange-700 font-medium">Đạt 5/5 bài đúng hạn</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Khám phá kiến thức hôm nay (Math Flashcard Block) */}
      <section className="space-y-3">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-amber-500 text-lg fill-icon">lightbulb</span>
          <h3 className="font-bold text-base text-slate-900">Khám phá kiến thức hôm nay</h3>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-blue-700 flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">menu_book</span>
              Trọng tâm SGK Kết nối tri thức
            </span>
            <span className="text-slate-400">Trang 9</span>
          </div>

          <h4 className="font-bold text-sm text-slate-900">Quy tắc hai phân số bằng nhau</h4>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 text-center space-y-2">
            <div className="font-bold text-blue-700 inline-flex items-center justify-center gap-3 text-lg">
              <div className="inline-flex flex-col items-center leading-none">
                <span className="border-b-2 border-slate-900 px-1 pb-0.5">a</span>
                <span className="pt-0.5">b</span>
              </div>
              <span>=</span>
              <div className="inline-flex flex-col items-center leading-none">
                <span className="border-b-2 border-slate-900 px-1 pb-0.5">c</span>
                <span className="pt-0.5">d</span>
              </div>
              <span className="text-xs text-slate-500 font-normal">khi và chỉ khi</span>
              <span className="bg-blue-100 px-2 py-0.5 rounded-lg text-blue-800 text-base">a · d = b · c</span>
            </div>
            <div className="text-xs text-slate-500">
              (với điều kiện a, b, c, d ∈ ℤ và b, d ≠ 0)
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200 flex items-start gap-1.5">
            <span className="material-symbols-outlined text-emerald-600 text-base shrink-0 mt-0.5">tips_and_updates</span>
            <div>
              <strong>Ví dụ mẫu: </strong>
              <span className="font-mono">(-3)/4 = 6/(-8)</span> vì <span className="font-mono">(-3) · (-8) = 4 · 6 = 24</span>.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
