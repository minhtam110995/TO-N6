import React, { useState } from 'react';
import { addStudent } from '../../services/storage';

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CreateAccountModal: React.FC<CreateAccountModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [studentName, setStudentName] = useState('Nguyễn Hoàng Nam');
  const [birthDate, setBirthDate] = useState('2013-05-18');
  const [gender, setGender] = useState<'nam' | 'nu'>('nam');
  const [group, setGroup] = useState('Tổ 2');
  
  const [linkingTarget, setLinkingTarget] = useState<'new_student' | 'existing_student'>('new_student');
  const [parentName, setParentName] = useState('Nguyễn Hoàng Dũng');
  const [parentRelation, setParentRelation] = useState('Bố (Cha)');
  const [parentPhone, setParentPhone] = useState('0988.123.456');
  const [parentEmail, setParentEmail] = useState('nguyenhoangdung@gmail.com');
  const [sendSMS, setSendSMS] = useState(true);

  // Derived username
  const cleanName = studentName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, '');
  const studentUsername = `hs6a4_${cleanName || 'hocsinh'}`;
  const parentUsername = `ph_${studentUsername}`;

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !parentPhone.trim()) {
      alert('Vui lòng điền đầy đủ họ tên học sinh và số điện thoại phụ huynh!');
      return;
    }

    addStudent(
      {
        fullName: studentName,
        username: studentUsername,
        birthDate,
        group,
        phone: parentPhone,
      },
      {
        fullName: parentName,
        username: parentUsername,
        phone: parentPhone,
        email: parentEmail,
      }
    );

    alert(`🎉 Đã cấp tài khoản kép thành công cho em ${studentName} và Phụ huynh ${parentName}!`);
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full p-6 sm:p-8 shadow-2xl max-h-[92vh] overflow-y-auto my-auto animate-in zoom-in-95 duration-150 border border-slate-200">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-blue-600 text-2xl">person_add</span>
              <h2 className="font-extrabold text-xl text-slate-900">
                Cấp tài khoản Học sinh &amp; Liên kết Phụ huynh
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Chuẩn GDPT 2018
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl">
              Hệ thống tự động sinh mã định danh và cấp tài khoản kép cho Học sinh và Phụ huynh đồng bộ. Đảm bảo 100% phụ huynh được ghép nối chính xác với học sinh.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Form Body: 2 Columns */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* CỘT 1: THÔNG TIN HỌC SINH MỚI */}
            <div className="bg-slate-50/60 rounded-2xl border border-slate-200 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                    HS
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">Thông tin Học sinh mới</h3>
                </div>
                <span className="text-xs text-blue-700 font-semibold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Học sinh #41
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên học sinh <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={e => setStudentName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="Nhập họ tên đầy đủ..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ngày sinh *</label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={e => setBirthDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Giới tính *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setGender('nam')}
                      className={`py-2 text-xs rounded-xl font-bold border transition ${
                        gender === 'nam' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-300 bg-white text-slate-600'
                      }`}
                    >
                      Nam
                    </button>
                    <button
                      type="button"
                      onClick={() => setGender('nu')}
                      className={`py-2 text-xs rounded-xl font-bold border transition ${
                        gender === 'nu' ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-300 bg-white text-slate-600'
                      }`}
                    >
                      Nữ
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Lớp sinh hoạt</label>
                  <input
                    type="text"
                    disabled
                    value="Lớp 6A4 (GVCN: Cô Tâm)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-100 text-slate-600 cursor-not-allowed font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tổ học tập</label>
                  <select
                    value={group}
                    onChange={e => setGroup(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-800 font-medium"
                  >
                    <option value="Tổ 1">Tổ 1 (8 học sinh)</option>
                    <option value="Tổ 2">Tổ 2 (8 học sinh)</option>
                    <option value="Tổ 3">Tổ 3 (8 học sinh)</option>
                    <option value="Tổ 4">Tổ 4 (8 học sinh)</option>
                  </select>
                </div>
              </div>

              {/* Auto credentials box */}
              <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-200 space-y-2">
                <div className="text-[11px] font-bold text-blue-800 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  Hệ thống tự động sinh tài khoản học sinh:
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-blue-100">
                    <span className="text-[10px] text-slate-500 block">Tên đăng nhập HS</span>
                    <span className="font-mono font-bold text-blue-700">{studentUsername}</span>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-blue-100">
                    <span className="text-[10px] text-slate-500 block">Mật khẩu mặc định</span>
                    <span className="font-mono font-bold text-slate-800">Toan6@2026</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CỘT 2: TÀI KHOẢN PHỤ HUYNH & CƠ CHẾ TÍCH CHỌN TRÁNH NHẦM LẪN */}
            <div className="bg-slate-50/60 rounded-2xl border-2 border-blue-200 p-5 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                    PH
                  </div>
                  <h3 className="font-bold text-sm text-slate-900">Tài khoản Phụ huynh giám sát</h3>
                </div>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                  Bảo mật &amp; Tránh nhầm lẫn
                </span>
              </div>

              {/* MECHANISM TÍCH CHỌN */}
              <div className="p-3.5 rounded-xl bg-blue-100/60 border border-blue-300 space-y-2">
                <div className="text-xs font-extrabold text-blue-900 flex items-center justify-between">
                  <span>CƠ CHẾ XÁC NHẬN LIÊN KẾT (BẮT BUỘC TÍCH CHỌN):</span>
                  <span className="text-[10px] bg-white text-blue-700 px-1.5 py-0.2 rounded font-bold">100% chính xác</span>
                </div>

                <label className="flex items-start gap-2.5 p-2.5 rounded-lg bg-white border-2 border-blue-600 cursor-pointer">
                  <input
                    type="radio"
                    name="linking"
                    checked={linkingTarget === 'new_student'}
                    onChange={() => setLinkingTarget('new_student')}
                    className="mt-0.5 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="text-xs flex-1">
                    <div className="font-bold text-blue-800">Liên kết trực tiếp với Học sinh đang tạo mới ở bên trái</div>
                    <div className="text-slate-600 text-[11px] mt-0.5 flex items-center gap-2">
                      <span>Em: <strong>{studentName}</strong></span>
                      <span>•</span>
                      <span className="font-mono text-blue-700">{studentUsername}</span>
                      <span className="text-emerald-700 font-bold ml-auto">✓ ĐÃ LIÊN KẾT</span>
                    </div>
                  </div>
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mối quan hệ với Học sinh *</label>
                <div className="grid grid-cols-3 gap-2">
                  {['Bố (Cha)', 'Mẹ', 'Người giám hộ'].map(rel => (
                    <button
                      key={rel}
                      type="button"
                      onClick={() => setParentRelation(rel)}
                      className={`py-2 text-xs rounded-xl font-bold border transition ${
                        parentRelation === rel ? 'border-orange-600 bg-orange-50 text-orange-700' : 'border-slate-300 bg-white text-slate-600'
                      }`}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Họ và tên Phụ huynh <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={parentName}
                  onChange={e => setParentName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="Nhập họ tên phụ huynh..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số điện thoại đăng nhập (SMS OTP) *
                  </label>
                  <input
                    type="tel"
                    value={parentPhone}
                    onChange={e => setParentPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-blue-500 bg-white"
                    placeholder="09xx.xxx.xxx"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tên đăng nhập hệ thống</label>
                  <input
                    type="text"
                    disabled
                    value={parentUsername}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-100 font-mono font-bold text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email nhận báo cáo tuần (tùy chọn)</label>
                <input
                  type="email"
                  value={parentEmail}
                  onChange={e => setParentEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="email@example.com"
                />
              </div>

              <label className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sendSMS}
                  onChange={e => setSendSMS(e.target.checked)}
                  className="mt-0.5 rounded text-orange-600 focus:ring-orange-500"
                />
                <span className="text-[11px] text-amber-900 leading-snug">
                  <strong>Gửi tin nhắn SMS / Zalo ZNS</strong> kèm mật khẩu và link cài App Toán 6 KNTT cho phụ huynh ngay lập tức.
                </span>
              </label>
            </div>
          </div>

          {/* SUMMARY REVIEW SECTION */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
              <span>XEM TRƯỚC CẶP TÀI KHOẢN ĐỒNG BỘ:</span>
              <span className="text-[11px] text-emerald-700 font-bold">Đồng bộ 2 chiều HS &lt;-&gt; PH</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-xl border border-blue-200">
                <div className="font-bold text-blue-700">Tài khoản Học sinh: {studentName}</div>
                <div className="text-slate-500 mt-1">Đăng nhập: <strong className="font-mono text-slate-800">{studentUsername}</strong></div>
                <div className="text-slate-500">Mật khẩu: <strong className="font-mono text-slate-800">Toan6@2025</strong></div>
              </div>
              <div className="bg-white p-3 rounded-xl border border-orange-200">
                <div className="font-bold text-orange-700">Tài khoản Phụ huynh: {parentName} ({parentRelation})</div>
                <div className="text-slate-500 mt-1">Đăng nhập / SĐT: <strong className="font-mono text-slate-800">{parentPhone}</strong></div>
                <div className="text-slate-500">Liên kết duy nhất: <strong className="font-mono text-blue-700">{studentUsername}</strong></div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              Hủy bỏ
            </button>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md transition flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-base">how_to_reg</span>
                <span>Xác nhận &amp; Cấp tài khoản ngay</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
