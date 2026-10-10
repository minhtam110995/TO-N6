import React, { useState } from 'react';
import { CHAPTERS_DATA } from '../../data/seedQuestions';
import { getWeakTopics } from '../../services/storage';

interface SelfPracticeProps {
  onStartCustomPractice: (chapterId: number, lessonId?: number) => void;
}

export const SelfPractice: React.FC<SelfPracticeProps> = ({ onStartCustomPractice }) => {
  const weakTopics = getWeakTopics();
  const [selectedChapter, setSelectedChapter] = useState(6);

  const currentChapter = CHAPTERS_DATA.find(c => c.id === selectedChapter) || CHAPTERS_DATA[5];

  return (
    <div className="space-y-4 max-w-md mx-auto pb-8">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="font-extrabold text-lg text-slate-900 tracking-tight">Tự ôn luyện thông minh</h1>
          <p className="text-xs text-slate-500">Tự do rèn luyện 9 chương SGK Toán 6 Kết nối tri thức</p>
        </div>
        <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">
          Không giới hạn
        </span>
      </div>

      {/* AI WEAK TOPIC CARD (< 60%) */}
      <section className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-orange-200 rounded-2xl p-4 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-orange-800 bg-orange-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
            Đề xuất ôn tập cá nhân hóa AI
          </span>
          <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full">
            Dưới 60%
          </span>
        </div>

        <div>
          <h3 className="font-bold text-sm text-slate-900">{weakTopics[0].topicTitle}</h3>
          <p className="text-xs text-slate-600 mt-1">{weakTopics[0].reason}</p>
        </div>

        <div className="bg-white p-2.5 rounded-xl border border-orange-200 text-xs text-slate-700 flex items-center justify-between">
          <span>Tự tạo đề ôn 10 câu (tăng dần độ khó)</span>
          <button
            onClick={() => onStartCustomPractice(weakTopics[0].chapterId, weakTopics[0].lessonId)}
            className="tactile-btn-orange px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-bold text-xs shadow-xs"
          >
            Luyện ngay
          </button>
        </div>
      </section>

      {/* Chapter Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-bold text-slate-700">Chọn chương cần ôn luyện:</label>
        <div className="grid grid-cols-3 gap-1.5 text-xs">
          {CHAPTERS_DATA.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedChapter(c.id)}
              className={`p-2 rounded-xl border text-center font-bold transition ${
                selectedChapter === c.id
                  ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              Chương {c.id}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Chapter Lessons */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="border-b border-slate-100 pb-2">
          <h3 className="font-bold text-sm text-slate-900">{currentChapter.title}</h3>
          <p className="text-[11px] text-slate-500">Gồm {currentChapter.lessons.length} bài học trọng tâm</p>
        </div>

        <div className="space-y-2">
          {currentChapter.lessons.map(l => (
            <div
              key={l.id}
              className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/50 flex items-center justify-between transition"
            >
              <div className="pr-2">
                <h4 className="font-bold text-xs text-slate-900">{l.title}</h4>
                <span className="text-[10px] text-slate-400">20+ câu hỏi đủ 4 mức độ</span>
              </div>
              <button
                onClick={() => onStartCustomPractice(currentChapter.id, l.id)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shrink-0 shadow-2xs"
              >
                Luyện tập
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
