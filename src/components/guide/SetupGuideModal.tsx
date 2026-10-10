import React, { useState } from 'react';
import { SUPABASE_SQL_SCHEMA, SETUP_GUIDE_CONTENT } from '../../services/supabaseSchema';

interface SetupGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SetupGuideModal: React.FC<SetupGuideModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopySQL = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-emerald-600 text-2xl">database</span>
              <h2 className="font-extrabold text-xl text-slate-900">
                Hướng dẫn cài đặt Supabase &amp; Vercel (Dành cho người không chuyên)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Các bước đơn giản để kích hoạt Cơ sở dữ liệu Postgres thật, phân quyền RLS và đưa web app lên Internet
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Steps */}
        <div className="space-y-4 text-xs">
          {SETUP_GUIDE_CONTENT.steps.map(s => (
            <div key={s.step} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5">
              <div className="font-bold text-sm text-blue-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs shrink-0">
                  {s.step}
                </span>
                <span>{s.title}</span>
              </div>
              <p className="text-slate-600 leading-relaxed pl-8">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* SQL Schema Copy Box */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-blue-600 text-base">code</span>
              <span>Mã SQL khởi tạo toàn bộ CSDL &amp; Phân quyền RLS (PostgreSQL):</span>
            </label>
            <button
              onClick={handleCopySQL}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl flex items-center gap-1 shadow-xs transition"
            >
              <span className="material-symbols-outlined text-sm">{copied ? 'check' : 'content_copy'}</span>
              <span>{copied ? 'Đã sao chép vào bộ nhớ tạm!' : 'Sao chép toàn bộ mã SQL'}</span>
            </button>
          </div>
          <div className="relative">
            <textarea
              readOnly
              rows={8}
              value={SUPABASE_SQL_SCHEMA}
              className="w-full p-3 font-mono text-[11px] bg-slate-900 text-emerald-400 rounded-xl focus:outline-none select-all"
            />
          </div>
          <p className="text-[11px] text-slate-500 italic">
            * Mẹo: Trong Supabase, dán đoạn mã trên vào SQL Editor và nhấn "Run" là xong ngay trong 3 giây.
          </p>
        </div>

        <div className="pt-2 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
          >
            Đóng hướng dẫn
          </button>
        </div>
      </div>
    </div>
  );
};
