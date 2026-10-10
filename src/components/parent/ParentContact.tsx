import React, { useState } from 'react';

interface ParentContactProps {
  onBack: () => void;
}

export const ParentContact: React.FC<ParentContactProps> = ({ onBack }) => {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'teacher', text: 'Chào anh Thành, tuần này Khang học môn Toán rất tiến bộ ở phần Phân số bằng nhau, tuy nhiên phần rút gọn về tối giản con cần tìm đúng ƯCLN nhé ạ!', time: 'Hôm qua 21:00' },
    { id: 2, sender: 'parent', text: 'Dạ cảm ơn cô Tâm! Gia đình đã nhắc con xem lại bảng nhân và cách tìm ước chung rồi cô nhé.', time: 'Hôm qua 21:15' },
    { id: 3, sender: 'teacher', text: 'Dạ tuyệt vời quá ạ, tối nay lớp có bài kiểm tra 15 phút, anh nhắc con làm đúng hạn nhé!', time: 'Hôm nay 09:30' }
  ]);
  const [inputVal, setInputVal] = useState('');

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    const newMsg = {
      id: Date.now(),
      sender: 'parent',
      text: inputVal.trim(),
      time: 'Vừa xong'
    };
    setMessages(prev => [...prev, newMsg]);
    setInputVal('');

    // Auto simulated reply from teacher
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'teacher',
          text: 'Cô Tâm đã nhận được tin nhắn và sẽ hỗ trợ em Khang ngay trong tiết học tới nhé gia đình!',
          time: 'Vừa xong'
        }
      ]);
    }, 1200);
  };

  return (
    <div className="w-full max-w-[420px] mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col h-[82vh]">
      {/* Top chat header */}
      <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50 rounded-t-2xl">
        <div className="flex items-center gap-2.5">
          <button onClick={onBack} className="p-1 hover:bg-slate-200 rounded-lg">
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </button>
          <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            CT
          </div>
          <div>
            <div className="font-bold text-xs text-slate-900">Cô Tâm</div>
            <div className="text-[10px] text-emerald-600 flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Đang trực tuyến
            </div>
          </div>
        </div>
        <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
          GV Toán 6A4
        </span>
      </div>

      {/* Messages body */}
      <div className="flex-1 p-3.5 overflow-y-auto space-y-3 text-xs bg-slate-50/50">
        {messages.map(m => (
          <div
            key={m.id}
            className={`flex flex-col ${m.sender === 'parent' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`p-3 rounded-2xl max-w-[82%] leading-relaxed ${
                m.sender === 'parent'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-2xs'
              }`}
            >
              {m.text}
            </div>
            <span className="text-[10px] text-slate-400 mt-1 px-1">{m.time}</span>
          </div>
        ))}
      </div>

      {/* Quick suggest prompts */}
      <div className="p-2 border-t border-slate-100 bg-white flex gap-1.5 overflow-x-auto no-scrollbar">
        {[
          'Xin cô gửi thêm bài tập về phân số',
          'Khang đã hoàn thành bài tập tối nay',
          'Nhờ cô kiểm tra lại điểm bài 23'
        ].map(p => (
          <button
            key={p}
            onClick={() => setInputVal(p)}
            className="text-[11px] bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 px-2.5 py-1 rounded-full whitespace-nowrap transition"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <form onSubmit={handleSend} className="p-2.5 border-t border-slate-200 bg-white rounded-b-2xl flex items-center gap-2">
        <input
          type="text"
          value={inputVal}
          onChange={e => setInputVal(e.target.value)}
          placeholder="Nhắn tin với cô giáo Mai..."
          className="flex-1 py-2 px-3 text-xs rounded-xl bg-slate-100 border-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition shadow-xs"
        >
          <span className="material-symbols-outlined text-lg">send</span>
        </button>
      </form>
    </div>
  );
};
