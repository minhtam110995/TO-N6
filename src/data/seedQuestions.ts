import { Question } from '../types';

export const CHAPTERS_DATA = [
  { id: 1, title: 'Chương I: Tập hợp các số tự nhiên', lessons: [
    { id: 1, title: 'Bài 1: Tập hợp. Phần tử của tập hợp' },
    { id: 2, title: 'Bài 2: Cách ghi số tự nhiên' },
    { id: 3, title: 'Bài 3: Thứ tự trong tập hợp các số tự nhiên' },
    { id: 4, title: 'Bài 4: Phép cộng và phép trừ số tự nhiên' },
    { id: 5, title: 'Bài 5: Phép nhân và phép chia số tự nhiên' },
  ]},
  { id: 2, title: 'Chương II: Tính chia hết trong tập hợp các số tự nhiên', lessons: [
    { id: 6, title: 'Bài 6: Chia hết và phép chia có dư' },
    { id: 7, title: 'Bài 7: Dấu hiệu chia hết cho 2, cho 5' },
    { id: 8, title: 'Bài 8: Dấu hiệu chia hết cho 3, cho 9' },
    { id: 9, title: 'Bài 9: Số nguyên tố. Hợp số' },
    { id: 10, title: 'Bài 10: Ước và bội' },
    { id: 11, title: 'Bài 11: Ước chung. Ước chung lớn nhất' },
    { id: 12, title: 'Bài 12: Bội chung. Bội chung nhỏ nhất' },
  ]},
  { id: 3, title: 'Chương III: Số nguyên', lessons: [
    { id: 13, title: 'Bài 13: Tập hợp các số nguyên' },
    { id: 14, title: 'Bài 14: Phép cộng và phép trừ số nguyên' },
    { id: 15, title: 'Bài 15: Quy tắc dấu ngoặc' },
    { id: 16, title: 'Bài 16: Phép nhân số nguyên' },
    { id: 17, title: 'Bài 17: Phép chia hết. Bội và ước của một số nguyên' },
  ]},
  { id: 4, title: 'Chương IV: Một số hình phẳng trong thực tiễn', lessons: [
    { id: 18, title: 'Bài 18: Tam giác đều. Hình vuông. Lục giác đều' },
    { id: 19, title: 'Bài 19: Hình chữ nhật. Hình thoi. Hình bình hành. Hình thang cân' },
    { id: 20, title: 'Bài 20: Chu vi và diện tích của một số tứ giác đã học' },
  ]},
  { id: 5, title: 'Chương V: Tính đối xứng của hình phẳng trong tự nhiên', lessons: [
    { id: 21, title: 'Bài 21: Hình có trục đối xứng' },
    { id: 22, title: 'Bài 22: Hình có tâm đối xứng' },
  ]},
  { id: 6, title: 'Chương VI: Phân số', lessons: [
    { id: 23, title: 'Bài 23: Mở rộng phân số. Phân số bằng nhau' },
    { id: 24, title: 'Bài 24: So sánh phân số. Hỗn số dương' },
    { id: 25, title: 'Bài 25: Phép cộng và phép trừ phân số' },
    { id: 26, title: 'Bài 26: Phép nhân và phép chia phân số' },
    { id: 27, title: 'Bài 27: Hai bài toán về phân số' },
  ]},
  { id: 7, title: 'Chương VII: Số thập phân', lessons: [
    { id: 28, title: 'Bài 28: Số thập phân' },
    { id: 29, title: 'Bài 29: Tính toán với số thập phân' },
    { id: 30, title: 'Bài 30: Làm tròn và ước lượng' },
    { id: 31, title: 'Bài 31: Một số bài toán về tỉ số và tỉ số phần trăm' },
  ]},
  { id: 8, title: 'Chương VIII: Những hình hình học cơ bản', lessons: [
    { id: 32, title: 'Bài 32: Điểm và đường thẳng' },
    { id: 33, title: 'Bài 33: Điểm nằm giữa hai điểm. Tia' },
    { id: 34, title: 'Bài 34: Đoạn thẳng. Độ dài đoạn thẳng' },
    { id: 35, title: 'Bài 35: Trung điểm của đoạn thẳng' },
    { id: 36, title: 'Bài 36: Góc' },
    { id: 37, title: 'Bài 37: Số đo góc' },
  ]},
  { id: 9, title: 'Chương IX: Dữ liệu và xác suất thực nghiệm', lessons: [
    { id: 38, title: 'Bài 38: Dữ liệu và thu thập dữ liệu' },
    { id: 39, title: 'Bài 39: Bảng thống kê và biểu đồ tranh' },
    { id: 40, title: 'Bài 40: Biểu đồ cột' },
    { id: 41, title: 'Bài 41: Biểu đồ cột kép' },
    { id: 42, title: 'Bài 42: Kết quả có thể và sự kiện trong trò chơi, thí nghiệm' },
    { id: 43, title: 'Bài 43: Xác suất thực nghiệm' },
  ]},
];

export const SEED_QUESTIONS: Question[] = [
  // =========================================================================
  // CHƯƠNG I: TẬP HỢP CÁC SỐ TỰ NHIÊN
  // =========================================================================
  {
    id: 'q-i-01-01',
    chapterId: 1,
    chapterTitle: 'Chương I: Tập hợp các số tự nhiên',
    lessonId: 1,
    lessonTitle: 'Bài 1: Tập hợp. Phần tử của tập hợp',
    level: 'nhan_biet',
    type: 'multiple_choice',
    content: 'Cho tập hợp A = {x ∈ ℕ | 3 < x ≤ 7}. Cách viết nào sau đây liệt kê đúng các phần tử của tập hợp A?',
    options: [
      { id: 'opt-a', label: 'A', text: 'A = {3; 4; 5; 6; 7}', isCorrect: false, note: '3 không thuộc A vì điều kiện là x > 3' },
      { id: 'opt-b', label: 'B', text: 'A = {4; 5; 6; 7}', isCorrect: true, note: 'Gồm các số tự nhiên lớn hơn 3 và không vượt quá 7' },
      { id: 'opt-c', label: 'C', text: 'A = {4; 5; 6}', isCorrect: false, note: 'Thiếu số 7 vì điều kiện có x ≤ 7' },
      { id: 'opt-d', label: 'D', text: 'A = {3; 4; 5; 6}', isCorrect: false, note: 'Sai cả hai đầu mút' },
    ],
    solutionSteps: [
      { step: 1, title: 'Phân tích điều kiện', explanation: 'x là số tự nhiên thỏa mãn 3 < x và x ≤ 7.' },
      { step: 2, title: 'Liệt kê phần tử', explanation: 'Các số tự nhiên lớn hơn 3 và nhỏ hơn hoặc bằng 7 là 4, 5, 6, 7. Do đó A = {4; 5; 6; 7}.' }
    ],
    teacherAdvice: 'Cô Tâm nhắc nhở: Chú ý dấu so sánh nghiêm ngặt (<) khác với dấu có dấu bằng (≤) nhé các em!',
    estimatedSeconds: 40,
    difficultyScore: 0.5
  },
  {
    id: 'q-i-02-01',
    chapterId: 1,
    chapterTitle: 'Chương I: Tập hợp các số tự nhiên',
    lessonId: 2,
    lessonTitle: 'Bài 2: Cách ghi số tự nhiên',
    level: 'thong_hieu',
    type: 'fill_in_the_blank',
    content: 'Số La Mã XXIV tương ứng với giá trị nào trong hệ thập phân?',
    correctAnswers: ['24', 'hai mươi bốn', '24.0', '24,0'],
    solutionSteps: [
      { step: 1, title: 'Phân tích cấu tạo số La Mã', explanation: 'X = 10, XX = 20, IV = 5 - 1 = 4.' },
      { step: 2, title: 'Tính tổng giá trị', explanation: 'XXIV = 10 + 10 + 4 = 24.' }
    ],
    teacherAdvice: 'Cô Tâm gợi ý: Khi chữ số nhỏ đứng trước chữ số lớn hơn (như IV, IX, XL), ta lấy số lớn trừ số nhỏ.',
    estimatedSeconds: 45,
    difficultyScore: 0.6
  },
  {
    id: 'q-i-04-01',
    chapterId: 1,
    chapterTitle: 'Chương I: Tập hợp các số tự nhiên',
    lessonId: 4,
    lessonTitle: 'Bài 4: Phép cộng và phép trừ số tự nhiên',
    level: 'thong_hieu',
    type: 'fill_in_the_blank',
    content: 'Tính nhanh giá trị của biểu thức: 135 + 360 + 65 + 40',
    correctAnswers: ['600', '600,0'],
    solutionSteps: [
      { step: 1, title: 'Nhóm các số tròn trăm', explanation: '(135 + 65) + (360 + 40).' },
      { step: 2, title: 'Cộng từng nhóm', explanation: '= 200 + 400 = 600.' }
    ],
    teacherAdvice: 'Áp dụng tính chất giao hoán và kết hợp của phép cộng để nhóm các số có tổng tròn trăm, tròn chục.',
    estimatedSeconds: 45,
    difficultyScore: 0.6
  },
  {
    id: 'q-i-05-01',
    chapterId: 1,
    chapterTitle: 'Chương I: Tập hợp các số tự nhiên',
    lessonId: 5,
    lessonTitle: 'Bài 5: Phép nhân và phép chia số tự nhiên',
    level: 'van_dung',
    type: 'fill_in_the_blank',
    content: 'Tính giá trị của biểu thức: 2³ · 17 + 2³ · 33 - 100',
    mathFormula: '2^3 \\cdot 17 + 2^3 \\cdot 33 - 100',
    correctAnswers: ['300', '300,0'],
    solutionSteps: [
      { step: 1, title: 'Đặt thừa số chung', explanation: '2³ · (17 + 33) - 100.' },
      { step: 2, title: 'Tính toán trong ngoặc', explanation: '= 8 · 50 - 100 = 400 - 100 = 300.' }
    ],
    teacherAdvice: 'Nhớ tính chất phân phối của phép nhân đối với phép cộng: a · b + a · c = a · (b + c).',
    estimatedSeconds: 60,
    difficultyScore: 0.75
  },
  {
    id: 'q-i-05-02',
    chapterId: 1,
    chapterTitle: 'Chương I: Tập hợp các số tự nhiên',
    lessonId: 5,
    lessonTitle: 'Bài 5: Phép nhân và phép chia số tự nhiên',
    level: 'van_dung_cao',
    type: 'multiple_choice',
    content: 'Tìm số tự nhiên x biết: 5^(x + 1) - 5^x = 500',
    mathFormula: '5^{x + 1} - 5^x = 500',
    options: [
      { id: 'opt-a', label: 'A', text: 'x = 3', isCorrect: true, note: '5^x · (5 - 1) = 4 · 5^x = 500 ⇒ 5^x = 125 ⇒ x = 3' },
      { id: 'opt-b', label: 'B', text: 'x = 2', isCorrect: false },
      { id: 'opt-c', label: 'C', text: 'x = 4', isCorrect: false },
      { id: 'opt-d', label: 'D', text: 'x = 5', isCorrect: false },
    ],
    solutionSteps: [
      { step: 1, title: 'Tách lũy thừa', explanation: '5^(x+1) = 5^x · 5. Biểu thức trở thành: 5^x · 5 - 5^x · 1 = 500.' },
      { step: 2, title: 'Đặt nhân tử chung', explanation: '5^x · (5 - 1) = 500 ⇒ 5^x · 4 = 500 ⇒ 5^x = 125.' },
      { step: 3, title: 'Tìm x', explanation: 'Vì 125 = 5³ nên 5^x = 5³ ⇒ x = 3.' }
    ],
    teacherAdvice: 'Cô Tâm lưu ý: Dạng toán lũy thừa biến x ở số mũ này rất hay xuất hiện trong đề kiểm tra giữa kỳ!',
    estimatedSeconds: 90,
    difficultyScore: 1.0
  },

  // =========================================================================
  // CHƯƠNG II: TÍNH CHIA HẾT TRONG TẬP HỢP CÁC SỐ TỰ NHIÊN
  // =========================================================================
  {
    id: 'q-ii-07-01',
    chapterId: 2,
    chapterTitle: 'Chương II: Tính chia hết trong tập hợp các số tự nhiên',
    lessonId: 7,
    lessonTitle: 'Bài 7: Dấu hiệu chia hết cho 2, cho 5',
    level: 'nhan_biet',
    type: 'multiple_choice',
    content: 'Trong các số sau: 234; 375; 540; 681, số nào vừa chia hết cho 2 vừa chia hết cho 5?',
    options: [
      { id: 'opt-a', label: 'A', text: '234', isCorrect: false, note: 'Chỉ chia hết cho 2, không chia hết cho 5' },
      { id: 'opt-b', label: 'B', text: '375', isCorrect: false, note: 'Chỉ chia hết cho 5, không chia hết cho 2' },
      { id: 'opt-c', label: 'C', text: '540', isCorrect: true, note: 'Tận cùng bằng 0 nên chia hết cho cả 2 và 5' },
      { id: 'opt-d', label: 'D', text: '681', isCorrect: false, note: 'Không chia hết cho cả 2 và 5' },
    ],
    solutionSteps: [
      { step: 1, title: 'Dấu hiệu đồng thời chia hết cho 2 và 5', explanation: 'Một số chia hết cho cả 2 và 5 khi và chỉ khi chữ số tận cùng của số đó là 0.' },
      { step: 2, title: 'Kiểm tra', explanation: 'Trong các số đã cho, số 540 có chữ số tận cùng là 0 nên chia hết cho cả 2 và 5.' }
    ],
    teacherAdvice: 'Nhớ ngay quy tắc vàng: Tận cùng là 0 thì chia hết cho cả 2 và 5!',
    estimatedSeconds: 30,
    difficultyScore: 0.5
  },
  {
    id: 'q-ii-08-01',
    chapterId: 2,
    chapterTitle: 'Chương II: Tính chia hết trong tập hợp các số tự nhiên',
    lessonId: 8,
    lessonTitle: 'Bài 8: Dấu hiệu chia hết cho 3, cho 9',
    level: 'thong_hieu',
    type: 'fill_in_the_blank',
    content: 'Tìm chữ số x để số tự nhiên 5x4 chia hết cho 9.',
    correctAnswers: ['0', '9'],
    solutionSteps: [
      { step: 1, title: 'Tính tổng các chữ số', explanation: 'Tổng các chữ số là S = 5 + x + 4 = 9 + x.' },
      { step: 2, title: 'Điều kiện chia hết cho 9', explanation: 'Để 5x4 chia hết cho 9 thì (9 + x) chia hết cho 9. Vì x là chữ số (0 ≤ x ≤ 9), nên x ∈ {0; 9}.' }
    ],
    teacherAdvice: 'Chú ý chữ số x có thể là 0 hoặc 9 vì 504 và 594 đều chia hết cho 9.',
    estimatedSeconds: 50,
    difficultyScore: 0.7
  },
  {
    id: 'q-ii-09-01',
    chapterId: 2,
    chapterTitle: 'Chương II: Tính chia hết trong tập hợp các số tự nhiên',
    lessonId: 9,
    lessonTitle: 'Bài 9: Số nguyên tố. Hợp số',
    level: 'nhan_biet',
    type: 'multiple_choice',
    content: 'Khẳng định nào sau đây là ĐÚNG?',
    options: [
      { id: 'opt-a', label: 'A', text: 'Tất cả các số nguyên tố đều là số lẻ.', isCorrect: false, note: 'Số 2 là số nguyên tố chẵn duy nhất' },
      { id: 'opt-b', label: 'B', text: 'Số 2 là số nguyên tố chẵn duy nhất.', isCorrect: true, note: 'Chính xác theo định nghĩa' },
      { id: 'opt-c', label: 'C', text: 'Số 0 và số 1 là các số nguyên tố nhỏ nhất.', isCorrect: false, note: 'Số 0 và 1 không là số nguyên tố cũng không là hợp số' },
      { id: 'opt-d', label: 'D', text: 'Mọi số chẵn đều là hợp số.', isCorrect: false, note: 'Số 2 là số chẵn nhưng là số nguyên tố' },
    ],
    solutionSteps: [
      { step: 1, title: 'Nhắc lại khái niệm', explanation: 'Số nguyên tố là số tự nhiên lớn hơn 1, chỉ có hai ước là 1 và chính nó.' },
      { step: 2, title: 'Đặc điểm số 2', explanation: 'Số 2 là số nguyên tố nhỏ nhất và cũng là số nguyên tố chẵn duy nhất.' }
    ],
    teacherAdvice: 'Ghi nhớ số 2: Vừa là số nguyên tố nhỏ nhất, vừa là số nguyên tố chẵn duy nhất!',
    estimatedSeconds: 35,
    difficultyScore: 0.5
  },
  {
    id: 'q-ii-11-01',
    chapterId: 2,
    chapterTitle: 'Chương II: Tính chia hết trong tập hợp các số tự nhiên',
    lessonId: 11,
    lessonTitle: 'Bài 11: Ước chung. Ước chung lớn nhất',
    level: 'thong_hieu',
    type: 'fill_in_the_blank',
    content: 'Tìm ƯCLN của 36 và 60.',
    mathFormula: 'ƯCLN(36, 60)',
    correctAnswers: ['12', '12,0', '12.0'],
    solutionSteps: [
      { step: 1, title: 'Phân tích ra thừa số nguyên tố', explanation: '36 = 2² · 3²; 60 = 2² · 3 · 5.' },
      { step: 2, title: 'Lấy thừa số chung với số mũ nhỏ nhất', explanation: 'ƯCLN(36, 60) = 2² · 3 = 4 · 3 = 12.' }
    ],
    teacherAdvice: 'Quy tắc tìm ƯCLN: Chọn thừa số nguyên tố CHUNG với số mũ NHỎ NHẤT.',
    estimatedSeconds: 60,
    difficultyScore: 0.7
  },
  {
    id: 'q-ii-12-01',
    chapterId: 2,
    chapterTitle: 'Chương II: Tính chia hết trong tập hợp các số tự nhiên',
    lessonId: 12,
    lessonTitle: 'Bài 12: Bội chung. Bội chung nhỏ nhất',
    level: 'van_dung',
    type: 'fill_in_the_blank',
    content: 'Học sinh lớp 6A4 khi xếp hàng 4, hàng 6, hàng 9 đều vừa đủ hàng. Biết số học sinh trong khoảng từ 30 đến 45 em. Hỏi lớp 6A4 có bao nhiêu học sinh?',
    correctAnswers: ['36', '36 học sinh'],
    solutionSteps: [
      { step: 1, title: 'Đưa về bài toán tìm BCNN', explanation: 'Số học sinh x là bội chung của 4, 6, 9. 4 = 2²; 6 = 2 · 3; 9 = 3². BCNN(4, 6, 9) = 2² · 3² = 36.' },
      { step: 2, title: 'Tìm số học sinh thỏa mãn điều kiện', explanation: 'BC(4, 6, 9) = {0; 36; 72; ...}. Vì 30 ≤ x ≤ 45 nên x = 36 học sinh.' }
    ],
    teacherAdvice: 'Bài toán thực tế chia hàng vừa đủ chính là ứng dụng trực tiếp của Bội chung nhỏ nhất.',
    estimatedSeconds: 80,
    difficultyScore: 0.85
  },

  // =========================================================================
  // CHƯƠNG III: SỐ NGUYÊN
  // =========================================================================
  {
    id: 'q-iii-13-01',
    chapterId: 3,
    chapterTitle: 'Chương III: Số nguyên',
    lessonId: 13,
    lessonTitle: 'Bài 13: Tập hợp các số nguyên',
    level: 'nhan_biet',
    type: 'multiple_choice',
    content: 'So sánh hai số nguyên âm: -15 và -9',
    options: [
      { id: 'opt-a', label: 'A', text: '-15 > -9', isCorrect: false, note: 'Sai, vì 15 > 9 nên -15 < -9' },
      { id: 'opt-b', label: 'B', text: '-15 < -9', isCorrect: true, note: 'Trong 2 số nguyên âm, số có khoảng cách đến 0 xa hơn thì nhỏ hơn' },
      { id: 'opt-c', label: 'C', text: '-15 = -9', isCorrect: false },
      { id: 'opt-d', label: 'D', text: 'Không so sánh được', isCorrect: false },
    ],
    solutionSteps: [
      { step: 1, title: 'Quy tắc so sánh hai số nguyên âm', explanation: 'Trong hai số nguyên âm, số nào có giá trị tuyệt đối lớn hơn thì số đó nhỏ hơn.' },
      { step: 2, title: 'So sánh', explanation: 'Vì 15 > 9 nên -15 < -9.' }
    ],
    teacherAdvice: 'Hình dung trên trục số: Số nào nằm bên trái thì luôn nhỏ hơn số nằm bên phải!',
    estimatedSeconds: 30,
    difficultyScore: 0.5
  },
  {
    id: 'q-iii-14-01',
    chapterId: 3,
    chapterTitle: 'Chương III: Số nguyên',
    lessonId: 14,
    lessonTitle: 'Bài 14: Phép cộng và phép trừ số nguyên',
    level: 'thong_hieu',
    type: 'fill_in_the_blank',
    content: 'Tính giá trị của biểu thức: (-45) + (-25) + 30',
    correctAnswers: ['-40', '-40.0', '-40,0'],
    solutionSteps: [
      { step: 1, title: 'Cộng hai số nguyên cùng dấu âm', explanation: '(-45) + (-25) = -(45 + 25) = -70.' },
      { step: 2, title: 'Cộng hai số khác dấu', explanation: '(-70) + 30 = -(70 - 30) = -40.' }
    ],
    teacherAdvice: 'Cộng hai số cùng dấu âm: cộng phần tự nhiên rồi đặt dấu trừ trước kết quả.',
    estimatedSeconds: 45,
    difficultyScore: 0.6
  },
  {
    id: 'q-iii-15-01',
    chapterId: 3,
    chapterTitle: 'Chương III: Số nguyên',
    lessonId: 15,
    lessonTitle: 'Bài 15: Quy tắc dấu ngoặc',
    level: 'thong_hieu',
    type: 'multiple_choice',
    content: 'Khi bỏ dấu ngoặc của biểu thức: -(a - b + c) ta được kết quả là:',
    options: [
      { id: 'opt-a', label: 'A', text: '-a + b - c', isCorrect: true, note: 'Đổi dấu toàn bộ các số hạng bên trong ngoặc' },
      { id: 'opt-b', label: 'B', text: '-a - b + c', isCorrect: false },
      { id: 'opt-c', label: 'C', text: '-a - b - c', isCorrect: false },
      { id: 'opt-d', label: 'D', text: 'a - b + c', isCorrect: false },
    ],
    solutionSteps: [
      { step: 1, title: 'Phát biểu quy tắc dấu ngoặc', explanation: 'Khi bỏ dấu ngoặc có dấu trừ "-" đằng trước, ta phải đổi dấu tất cả các số hạng trong dấu ngoặc: "+" thành "-" và "-" thành "+".' },
      { step: 2, title: 'Thực hiện', explanation: '-(a - b + c) = -a + b - c.' }
    ],
    teacherAdvice: 'Cô Tâm dặn dò: Lỗi sai kinh điển của học sinh là chỉ đổi dấu số hạng đầu tiên a mà quên đổi dấu b và c!',
    estimatedSeconds: 40,
    difficultyScore: 0.65
  },
  {
    id: 'q-iii-16-01',
    chapterId: 3,
    chapterTitle: 'Chương III: Số nguyên',
    lessonId: 16,
    lessonTitle: 'Bài 16: Phép nhân số nguyên',
    level: 'van_dung',
    type: 'fill_in_the_blank',
    content: 'Tính giá trị biểu thức: (-12) · (-5) - 25 · (-4)',
    correctAnswers: ['160', '160,0'],
    solutionSteps: [
      { step: 1, title: 'Nhân hai số cùng dấu âm', explanation: '(-12) · (-5) = 12 · 5 = 60.' },
      { step: 2, title: 'Tính tích thứ hai', explanation: '25 · (-4) = -100.' },
      { step: 3, title: 'Thực hiện phép trừ', explanation: '60 - (-100) = 60 + 100 = 160.' }
    ],
    teacherAdvice: 'Âm nhân âm ra dương, trừ cho số âm thì thành cộng số dương!',
    estimatedSeconds: 60,
    difficultyScore: 0.75
  },
  {
    id: 'q-iii-17-01',
    chapterId: 3,
    chapterTitle: 'Chương III: Số nguyên',
    lessonId: 17,
    lessonTitle: 'Bài 17: Phép chia hết. Bội và ước của một số nguyên',
    level: 'van_dung_cao',
    type: 'multiple_choice',
    content: 'Có bao nhiêu số nguyên n thỏa mãn (n + 5) chia hết cho (n + 1)?',
    options: [
      { id: 'opt-a', label: 'A', text: '6 số', isCorrect: true, note: 'Ước của 4 là {±1, ±2, ±4} gồm 6 ước' },
      { id: 'opt-b', label: 'B', text: '4 số', isCorrect: false },
      { id: 'opt-c', label: 'C', text: '3 số', isCorrect: false },
      { id: 'opt-d', label: 'D', text: '8 số', isCorrect: false },
    ],
    solutionSteps: [
      { step: 1, title: 'Biến đổi biểu thức', explanation: '(n + 5) = (n + 1) + 4.' },
      { step: 2, title: 'Tìm điều kiện chia hết', explanation: 'Để (n + 5) ⋮ (n + 1) thì 4 ⋮ (n + 1), nghĩa là (n + 1) ∈ Ư(4).' },
      { step: 3, title: 'Đếm số lượng nghiệm n', explanation: 'Ư(4) = {1; -1; 2; -2; 4; -4}. Với mỗi giá trị này ta tìm được 1 số nguyên n tương ứng. Vậy có tất cả 6 số.' }
    ],
    teacherAdvice: 'Tách tử số theo mẫu để đưa về bài toán tìm ước của hằng số.',
    estimatedSeconds: 90,
    difficultyScore: 1.0
  },

  // =========================================================================
  // CHƯƠNG IV: MỘT SỐ HÌNH PHẲNG TRONG THỰC TIỄN
  // =========================================================================
  {
    id: 'q-iv-18-01',
    chapterId: 4,
    chapterTitle: 'Chương IV: Một số hình phẳng trong thực tiễn',
    lessonId: 18,
    lessonTitle: 'Bài 18: Tam giác đều. Hình vuông. Lục giác đều',
    level: 'nhan_biet',
    type: 'multiple_choice',
    content: 'Trong tam giác đều ABC, khẳng định nào sau đây là SAI?',
    options: [
      { id: 'opt-a', label: 'A', text: 'Ba cạnh bằng nhau: AB = BC = CA', isCorrect: false },
      { id: 'opt-b', label: 'B', text: 'Ba góc bằng nhau và mỗi góc bằng 60°', isCorrect: false },
      { id: 'opt-c', label: 'C', text: 'Có 3 trục đối xứng', isCorrect: false },
      { id: 'opt-d', label: 'D', text: 'Có 1 tâm đối xứng', isCorrect: true, note: 'Tam giác đều không có tâm đối xứng' },
    ],
    solutionSteps: [
      { step: 1, title: 'Tính chất tam giác đều', explanation: 'Tam giác đều có 3 cạnh bằng nhau, 3 góc bằng 60°, có 3 trục đối xứng nhưng KHÔNG có tâm đối xứng.' }
    ],
    teacherAdvice: 'Lưu ý: Đa giác đều có số đỉnh lẻ (như tam giác đều, ngũ giác đều) thì không có tâm đối xứng.',
    estimatedSeconds: 40,
    difficultyScore: 0.5
  },
  {
    id: 'q-iv-20-01',
    chapterId: 4,
    chapterTitle: 'Chương IV: Một số hình phẳng trong thực tiễn',
    lessonId: 20,
    lessonTitle: 'Bài 20: Chu vi và diện tích của một số tứ giác đã học',
    level: 'van_dung',
    type: 'fill_in_the_blank',
    content: 'Một mảnh vườn hình thoi có độ dài hai đường chéo lần lượt là 12 m và 16 m. Tính diện tích mảnh vườn đó (đơn vị: m²).',
    correctAnswers: ['96', '96 m2', '96m2'],
    solutionSteps: [
      { step: 1, title: 'Công thức diện tích hình thoi', explanation: 'S = (1/2) · d₁ · d₂ với d₁, d₂ là độ dài hai đường chéo.' },
      { step: 2, title: 'Tính toán', explanation: 'S = (1/2) · 12 · 16 = 6 · 16 = 96 m².' }
    ],
    teacherAdvice: 'Diện tích hình thoi bằng nửa tích độ dài hai đường chéo.',
    estimatedSeconds: 50,
    difficultyScore: 0.75
  },

  // =========================================================================
  // CHƯƠNG V: TÍNH ĐỐI XỨNG CỦA HÌNH PHẲNG TRONG TỰ NHIÊN
  // =========================================================================
  {
    id: 'q-v-21-01',
    chapterId: 5,
    chapterTitle: 'Chương V: Tính đối xứng của hình phẳng trong tự nhiên',
    lessonId: 21,
    lessonTitle: 'Bài 21: Hình có trục đối xứng',
    level: 'nhan_biet',
    type: 'multiple_choice',
    content: 'Hình tròn có bao nhiêu trục đối xứng?',
    options: [
      { id: 'opt-a', label: 'A', text: '1 trục đối xứng', isCorrect: false },
      { id: 'opt-b', label: 'B', text: '2 trục đối xứng', isCorrect: false },
      { id: 'opt-c', label: 'C', text: '4 trục đối xứng', isCorrect: false },
      { id: 'opt-d', label: 'D', text: 'Vô số trục đối xứng', isCorrect: true, note: 'Mọi đường thẳng đi qua tâm đều là trục đối xứng của hình tròn' },
    ],
    solutionSteps: [
      { step: 1, title: 'Khái niệm trục đối xứng hình tròn', explanation: 'Bất kỳ đường thẳng nào đi qua tâm của đường tròn đều là một trục đối xứng của đường tròn đó. Vì vậy hình tròn có vô số trục đối xứng.' }
    ],
    teacherAdvice: 'Hình tròn có vô số trục đối xứng (mọi đường thẳng qua tâm) và có 1 tâm đối xứng (chính là tâm hình tròn).',
    estimatedSeconds: 30,
    difficultyScore: 0.5
  },
  {
    id: 'q-v-22-01',
    chapterId: 5,
    chapterTitle: 'Chương V: Tính đối xứng của hình phẳng trong tự nhiên',
    lessonId: 22,
    lessonTitle: 'Bài 22: Hình có tâm đối xứng',
    level: 'thong_hieu',
    type: 'multiple_choice',
    content: 'Trong các chữ cái in hoa sau: H, N, A, E; chữ cái nào VỪA có trục đối xứng VỪA có tâm đối xứng?',
    options: [
      { id: 'opt-a', label: 'A', text: 'Chữ H', isCorrect: true, note: 'Chữ H có 2 trục đối xứng (ngang, dọc) và 1 tâm đối xứng ở chính giữa' },
      { id: 'opt-b', label: 'B', text: 'Chữ N', isCorrect: false, note: 'Chữ N chỉ có tâm đối xứng, không có trục đối xứng' },
      { id: 'opt-c', label: 'C', text: 'Chữ A', isCorrect: false, note: 'Chữ A chỉ có trục đối xứng, không có tâm đối xứng' },
      { id: 'opt-d', label: 'D', text: 'Chữ E', isCorrect: false, note: 'Chữ E chỉ có 1 trục đối xứng nằm ngang' },
    ],
    solutionSteps: [
      { step: 1, title: 'Kiểm tra chữ H', explanation: 'Gấp theo chiều dọc hoặc ngang chữ H đều trùng khít (2 trục đối xứng). Quay 180° quanh điểm chính giữa vẫn ra chữ H (có tâm đối xứng).' }
    ],
    teacherAdvice: 'Cô Tâm khuyên các em hãy xoay giấy 180 độ: nếu chữ không đổi hình dạng thì chữ đó có tâm đối xứng!',
    estimatedSeconds: 45,
    difficultyScore: 0.65
  },

  // =========================================================================
  // CHƯƠNG VI: PHÂN SỐ
  // =========================================================================
  {
    id: 'q-vi-23-01',
    chapterId: 6,
    chapterTitle: 'Chương VI: Phân số',
    lessonId: 23,
    lessonTitle: 'Bài 23: Mở rộng phân số. Phân số bằng nhau',
    level: 'nhan_biet',
    type: 'multiple_choice',
    content: 'Trong các cách viết sau đây, cách viết nào cho ta một phân số?',
    options: [
      { id: 'opt-a', label: 'A', text: '2,5 / 4', isCorrect: false, note: 'Tử số 2,5 là số thập phân, không phải số nguyên' },
      { id: 'opt-b', label: 'B', text: '(-3) / 7', isCorrect: true, note: 'Tử số -3 ∈ ℤ và mẫu số 7 ∈ ℤ, mẫu số khác 0' },
      { id: 'opt-c', label: 'C', text: '5 / 0', isCorrect: false, note: 'Mẫu số bằng 0 là không hợp lệ' },
      { id: 'opt-d', label: 'D', text: '4 / 1,8', isCorrect: false, note: 'Mẫu số 1,8 là số thập phân, không phải số nguyên' },
    ],
    solutionSteps: [
      { step: 1, title: 'Định nghĩa phân số', explanation: 'Phân số có dạng a/b với a, b ∈ ℤ và b ≠ 0 (a là tử số, b là mẫu số).' },
      { step: 2, title: 'Kiểm tra các đáp án', explanation: 'Chỉ có (-3)/7 thỏa mãn cả hai điều kiện: -3 và 7 đều là số nguyên và mẫu số 7 ≠ 0.' }
    ],
    teacherAdvice: 'Nhớ điều kiện: Tử và mẫu PHẢI là số nguyên, và MẪU SỐ PHẢI khác 0!',
    estimatedSeconds: 45,
    difficultyScore: 0.5
  },
  {
    id: 'q-vi-23-02',
    chapterId: 6,
    chapterTitle: 'Chương VI: Phân số',
    lessonId: 23,
    lessonTitle: 'Bài 23: Mở rộng phân số. Phân số bằng nhau',
    level: 'thong_hieu',
    type: 'fill_in_the_blank',
    content: 'Tìm số nguyên x thỏa mãn đẳng thức phân số sau: x / (-5) = 12 / 20',
    mathFormula: '\\frac{x}{-5} = \\frac{12}{20}',
    correctAnswers: ['-3', '-3/1', '-3,0', '-3.0'],
    solutionSteps: [
      { step: 1, title: 'Áp dụng định nghĩa hai phân số bằng nhau', explanation: 'Nếu a/b = c/d thì a · d = b · c. Ta có tích chéo: 20 · x = 12 · (-5) = -60.' },
      { step: 2, title: 'Tìm giá trị x', explanation: 'x = (-60) : 20 = -3. Kết luận: x = -3.' }
    ],
    teacherAdvice: 'Áp dụng quy tắc nhân chéo hoặc rút gọn phân số 12/20 = 3/5 trước khi tìm x để tính toán nhanh hơn.',
    estimatedSeconds: 60,
    difficultyScore: 0.75
  },
  {
    id: 'q-vi-23-03',
    chapterId: 6,
    chapterTitle: 'Chương VI: Phân số',
    lessonId: 23,
    lessonTitle: 'Bài 23: Mở rộng phân số. Phân số bằng nhau',
    level: 'van_dung',
    type: 'fill_in_the_blank',
    content: 'Rút gọn phân số (-18) / 30 về dạng phân số tối giản có mẫu số dương.',
    mathFormula: '\\frac{-18}{30}',
    correctAnswers: ['-3/5', '-0.6', '-0,6', '-6/10'],
    solutionSteps: [
      { step: 1, title: 'Tìm ƯCLN của tử và mẫu', explanation: 'ƯCLN(18, 30) = 6.' },
      { step: 2, title: 'Chia cả tử và mẫu cho ƯCLN', explanation: '(-18 : 6) / (30 : 6) = (-3) / 5.' }
    ],
    teacherAdvice: 'Học sinh thường chỉ rút gọn 1 lần cho 2 ra (-9)/15 rồi dừng lại. Nhớ chia cho ƯCLN một lần duy nhất!',
    estimatedSeconds: 75,
    difficultyScore: 1.0
  },
  {
    id: 'q-vi-23-04',
    chapterId: 6,
    chapterTitle: 'Chương VI: Phân số',
    lessonId: 23,
    lessonTitle: 'Bài 23: Mở rộng phân số. Phân số bằng nhau',
    level: 'van_dung_cao',
    type: 'multiple_choice',
    content: 'Tìm tất cả các số nguyên n ∈ ℤ để phân số A = (2n + 3) / (n + 1) nhận giá trị là một số nguyên:',
    mathFormula: 'A = \\frac{2n + 3}{n + 1}',
    options: [
      { id: 'opt-a', label: 'A', text: 'n ∈ {0; -2}', isCorrect: true, note: 'Tách phần nguyên A = 2 + 1/(n+1)' },
      { id: 'opt-b', label: 'B', text: 'n ∈ {1; -1; 2}', isCorrect: false },
      { id: 'opt-c', label: 'C', text: 'n ∈ {0; 1; 2}', isCorrect: false },
      { id: 'opt-d', label: 'D', text: 'n ∈ {-1; -3}', isCorrect: false },
    ],
    solutionSteps: [
      { step: 1, title: 'Phương pháp tách phần nguyên', explanation: 'A = [2(n + 1) + 1] / (n + 1) = 2 + 1 / (n + 1).' },
      { step: 2, title: 'Biện luận điều kiện nguyên', explanation: 'Để A là số nguyên thì 1 / (n + 1) phải là số nguyên, tức (n + 1) là ước của 1.' },
      { step: 3, title: 'Tìm n', explanation: 'Ước của 1 là ±1. Do đó: n + 1 = 1 ⇒ n = 0; hoặc n + 1 = -1 ⇒ n = -2. Vậy n ∈ {0; -2}.' }
    ],
    teacherAdvice: 'Dạng bài tách phần nguyên là dạng toán nâng cao cốt lõi trong các kỳ thi học sinh giỏi và thi cuối kỳ!',
    estimatedSeconds: 120,
    difficultyScore: 1.0
  },
  {
    id: 'q-vi-25-01',
    chapterId: 6,
    chapterTitle: 'Chương VI: Phân số',
    lessonId: 25,
    lessonTitle: 'Bài 25: Phép cộng và phép trừ phân số',
    level: 'thong_hieu',
    type: 'fill_in_the_blank',
    content: 'Tính giá trị của phép tính: 3/8 + (-5/12)',
    mathFormula: '\\frac{3}{8} + \\frac{-5}{12}',
    correctAnswers: ['-1/24', '-1 / 24', '-0.0416'],
    solutionSteps: [
      { step: 1, title: 'Quy đồng mẫu số', explanation: 'BCNN(8, 12) = 24. 3/8 = 9/24; -5/12 = -10/24.' },
      { step: 2, title: 'Cộng hai phân số cùng mẫu', explanation: '9/24 + (-10/24) = (9 - 10) / 24 = -1/24.' }
    ],
    teacherAdvice: 'Nhớ tìm BCNN của hai mẫu số để mẫu chung nhỏ nhất, giúp việc tính toán đơn giản và tránh nhầm lẫn.',
    estimatedSeconds: 60,
    difficultyScore: 0.7
  },
  {
    id: 'q-vi-26-01',
    chapterId: 6,
    chapterTitle: 'Chương VI: Phân số',
    lessonId: 26,
    lessonTitle: 'Bài 26: Phép nhân và phép chia phân số',
    level: 'van_dung',
    type: 'fill_in_the_blank',
    content: 'Tính giá trị của biểu thức: ((-5)/9) · (3/10) : ((-1)/6)',
    mathFormula: '\\frac{-5}{9} \\cdot \\frac{3}{10} : \\frac{-1}{6}',
    correctAnswers: ['1', '1.0', '1,0'],
    solutionSteps: [
      { step: 1, title: 'Chuyển phép chia thành phép nhân nghịch đảo', explanation: '((-5)/9) · (3/10) · ((-6)/1).' },
      { step: 2, title: 'Rút gọn chéo các thừa số', explanation: '= [(-5) · 3 · (-6)] / [9 · 10 · 1] = 90 / 90 = 1.' }
    ],
    teacherAdvice: 'Chia một phân số là nhân với phân số nghịch đảo của nó. Rút gọn các thừa số trước khi nhân tích!',
    estimatedSeconds: 70,
    difficultyScore: 0.8
  },

  // =========================================================================
  // CHƯƠNG VII: SỐ THẬP PHÂN
  // =========================================================================
  {
    id: 'q-vii-28-01',
    chapterId: 7,
    chapterTitle: 'Chương VII: Số thập phân',
    lessonId: 28,
    lessonTitle: 'Bài 28: Số thập phân',
    level: 'nhan_biet',
    type: 'multiple_choice',
    content: 'Phân số thập phân (-45)/100 được viết dưới dạng số thập phân là:',
    options: [
      { id: 'opt-a', label: 'A', text: '-0,45', isCorrect: true, note: 'Đúng theo quy tắc ghi số thập phân' },
      { id: 'opt-b', label: 'B', text: '-4,5', isCorrect: false },
      { id: 'opt-c', label: 'C', text: '-0,045', isCorrect: false },
      { id: 'opt-d', label: 'D', text: '-45,0', isCorrect: false },
    ],
    solutionSteps: [
      { step: 1, title: 'Chuyển phân số thập phân sang số thập phân', explanation: 'Mẫu số 100 có 2 chữ số 0, nên phần thập phân có 2 chữ số: (-45)/100 = -0,45.' }
    ],
    teacherAdvice: 'Đếm số chữ số 0 ở mẫu để xác định số chữ số sau dấu phẩy thập phân.',
    estimatedSeconds: 30,
    difficultyScore: 0.5
  },
  {
    id: 'q-vii-29-01',
    chapterId: 7,
    chapterTitle: 'Chương VII: Số thập phân',
    lessonId: 29,
    lessonTitle: 'Bài 29: Tính toán với số thập phân',
    level: 'thong_hieu',
    type: 'fill_in_the_blank',
    content: 'Tính giá trị của phép tính: (-2,5) · 0,4 + 1,8',
    correctAnswers: ['0,8', '0.8', '4/5'],
    solutionSteps: [
      { step: 1, title: 'Thực hiện phép nhân', explanation: '(-2,5) · 0,4 = -1.' },
      { step: 2, title: 'Cộng số thập phân', explanation: '-1 + 1,8 = 0,8.' }
    ],
    teacherAdvice: 'Quy tắc thứ tự thực hiện phép tính: nhân chia trước, cộng trừ sau.',
    estimatedSeconds: 45,
    difficultyScore: 0.65
  },
  {
    id: 'q-vii-31-01',
    chapterId: 7,
    chapterTitle: 'Chương VII: Số thập phân',
    lessonId: 31,
    lessonTitle: 'Bài 31: Một số bài toán về tỉ số và tỉ số phần trăm',
    level: 'van_dung',
    type: 'fill_in_the_blank',
    content: 'Lớp 6A4 có 40 học sinh, trong đó có 24 học sinh nữ. Hỏi số học sinh nữ chiếm bao nhiêu phần trăm số học sinh cả lớp?',
    correctAnswers: ['60%', '60', '60,0%', '60.0%'],
    solutionSteps: [
      { step: 1, title: 'Lập tỉ số', explanation: 'Tỉ số học sinh nữ so với cả lớp là 24 / 40 = 3/5 = 0,6.' },
      { step: 2, title: 'Đổi ra phần trăm', explanation: '0,6 · 100% = 60%.' }
    ],
    teacherAdvice: 'Để tìm tỉ số phần trăm của a và b, ta lấy (a : b) rồi nhân với 100%.',
    estimatedSeconds: 55,
    difficultyScore: 0.75
  },

  // =========================================================================
  // CHƯƠNG VIII: NHỮNG HÌNH HÌNH HỌC CƠ BẢN
  // =========================================================================
  {
    id: 'q-viii-34-01',
    chapterId: 8,
    chapterTitle: 'Chương VIII: Những hình hình học cơ bản',
    lessonId: 34,
    lessonTitle: 'Bài 34: Đoạn thẳng. Độ dài đoạn thẳng',
    level: 'nhan_biet',
    type: 'multiple_choice',
    content: 'Cho điểm M nằm giữa hai điểm A và B. Hệ thức nào sau đây luôn đúng?',
    options: [
      { id: 'opt-a', label: 'A', text: 'AM + MB = AB', isCorrect: true, note: 'Điểm M nằm giữa A và B thì AM + MB = AB' },
      { id: 'opt-b', label: 'B', text: 'AM + AB = MB', isCorrect: false },
      { id: 'opt-c', label: 'C', text: 'AM = MB', isCorrect: false, note: 'Chỉ đúng khi M là trung điểm' },
      { id: 'opt-d', label: 'D', text: 'AB + MB = AM', isCorrect: false },
    ],
    solutionSteps: [
      { step: 1, title: 'Tính chất điểm nằm giữa', explanation: 'Nếu điểm M nằm giữa hai điểm A và B thì AM + MB = AB và ngược lại.' }
    ],
    teacherAdvice: 'Khắc ghi tính chất cơ bản: M nằm giữa A và B thì độ dài đoạn lớn bằng tổng hai đoạn nhỏ.',
    estimatedSeconds: 35,
    difficultyScore: 0.5
  },
  {
    id: 'q-viii-35-01',
    chapterId: 8,
    chapterTitle: 'Chương VIII: Những hình hình học cơ bản',
    lessonId: 35,
    lessonTitle: 'Bài 35: Trung điểm của đoạn thẳng',
    level: 'thong_hieu',
    type: 'fill_in_the_blank',
    content: 'Cho đoạn thẳng AB dài 10 cm. Điểm I là trung điểm của đoạn thẳng AB. Tính độ dài đoạn thẳng IA (đơn vị: cm).',
    correctAnswers: ['5', '5 cm', '5cm', '5,0', '5.0'],
    solutionSteps: [
      { step: 1, title: 'Định nghĩa trung điểm', explanation: 'I là trung điểm của AB nên I nằm giữa A, B và IA = IB = AB / 2.' },
      { step: 2, title: 'Tính toán', explanation: 'IA = 10 / 2 = 5 cm.' }
    ],
    teacherAdvice: 'Trung điểm chia đoạn thẳng thành hai nửa bằng nhau, mỗi nửa bằng một nửa đoạn thẳng ban đầu.',
    estimatedSeconds: 40,
    difficultyScore: 0.6
  },
  {
    id: 'q-viii-37-01',
    chapterId: 8,
    chapterTitle: 'Chương VIII: Những hình hình học cơ bản',
    lessonId: 37,
    lessonTitle: 'Bài 37: Số đo góc',
    level: 'nhan_biet',
    type: 'multiple_choice',
    content: 'Một góc có số đo bằng 125° là loại góc nào sau đây?',
    options: [
      { id: 'opt-a', label: 'A', text: 'Góc nhọn', isCorrect: false, note: 'Góc nhọn có số đo lớn hơn 0° và nhỏ hơn 90°' },
      { id: 'opt-b', label: 'B', text: 'Góc vuông', isCorrect: false, note: 'Góc vuông có số đo đúng bằng 90°' },
      { id: 'opt-c', label: 'C', text: 'Góc tù', isCorrect: true, note: 'Góc tù có số đo lớn hơn 90° và nhỏ hơn 180°' },
      { id: 'opt-d', label: 'D', text: 'Góc bẹt', isCorrect: false, note: 'Góc bẹt có số đo đúng bằng 180°' },
    ],
    solutionSteps: [
      { step: 1, title: 'Phân loại góc theo số đo', explanation: 'Vì 90° < 125° < 180° nên góc có số đo 125° là góc tù.' }
    ],
    teacherAdvice: 'Nhớ mốc 90° và 180°: Nhỏ hơn 90° là nhọn, bằng 90° là vuông, giữa 90° và 180° là tù, bằng 180° là bẹt.',
    estimatedSeconds: 30,
    difficultyScore: 0.5
  },

  // =========================================================================
  // CHƯƠNG IX: DỮ LIỆU VÀ XÁC SUẤT THỰC NGHIỆM
  // =========================================================================
  {
    id: 'q-ix-40-01',
    chapterId: 9,
    chapterTitle: 'Chương IX: Dữ liệu và xác suất thực nghiệm',
    lessonId: 40,
    lessonTitle: 'Bài 40: Biểu đồ cột',
    level: 'thong_hieu',
    type: 'multiple_choice',
    content: 'Khi đọc một biểu đồ cột biểu diễn số lượng sách quyên góp của các tổ trong lớp 6A4, chiều cao của mỗi cột biểu thị đại lượng nào?',
    options: [
      { id: 'opt-a', label: 'A', text: 'Tên của các tổ', isCorrect: false, note: 'Tên các tổ nằm ở trục ngang' },
      { id: 'opt-b', label: 'B', text: 'Số lượng sách quyên góp được của tổ tương ứng', isCorrect: true, note: 'Chiều cao cột thể hiện số liệu định lượng' },
      { id: 'opt-c', label: 'C', text: 'Thời gian các tổ quyên góp sách', isCorrect: false },
      { id: 'opt-d', label: 'D', text: 'Chiều rộng của lớp học', isCorrect: false },
    ],
    solutionSteps: [
      { step: 1, title: 'Đặc điểm biểu đồ cột', explanation: 'Trong biểu đồ cột, đáy cột thường nằm trên trục ngang biểu thị danh mục, chiều cao của cột tương ứng với số liệu trên trục thẳng đứng.' }
    ],
    teacherAdvice: 'Cột càng cao thì số lượng tương ứng càng lớn.',
    estimatedSeconds: 35,
    difficultyScore: 0.5
  },
  {
    id: 'q-ix-43-01',
    chapterId: 9,
    chapterTitle: 'Chương IX: Dữ liệu và xác suất thực nghiệm',
    lessonId: 43,
    lessonTitle: 'Bài 43: Xác suất thực nghiệm',
    level: 'van_dung',
    type: 'fill_in_the_blank',
    content: 'Gieo một đồng xu cân đối 50 lần, thấy có 28 lần xuất hiện mặt ngửa (N). Tính xác suất thực nghiệm xuất hiện mặt ngửa.',
    correctAnswers: ['0,56', '0.56', '56%', '14/25', '28/50'],
    solutionSteps: [
      { step: 1, title: 'Công thức xác suất thực nghiệm', explanation: 'Xác suất thực nghiệm = (Số lần xuất hiện sự kiện) / (Tổng số lần thực hiện).' },
      { step: 2, title: 'Tính toán', explanation: 'P = 28 / 50 = 56 / 100 = 0,56 (hay 56%).' }
    ],
    teacherAdvice: 'Lấy số lần xuất hiện chia cho tổng số lần thử nghiệm. Chấp nhận cả dạng số thập phân, phần trăm hoặc phân số tối giản.',
    estimatedSeconds: 50,
    difficultyScore: 0.75
  }
];

/**
 * Helper: Kiểm tra đáp án điền số có tương đương hay không
 * Chấp nhận: 1/2 = 0,5 = 0.5 = 2/4; số âm; dấu phẩy VN
 */
export function isEquivalentAnswer(userAnswer: string, correctList: string[]): boolean {
  if (!userAnswer || !correctList || correctList.length === 0) return false;
  const cleanUser = userAnswer.trim().toLowerCase().replace(/\s+/g, '');

  for (const correct of correctList) {
    const cleanCorrect = correct.trim().toLowerCase().replace(/\s+/g, '');
    if (cleanUser === cleanCorrect) return true;

    // Normalize comma decimal to dot
    const userNormalized = cleanUser.replace(',', '.');
    const correctNormalized = cleanCorrect.replace(',', '.');
    if (userNormalized === correctNormalized) return true;

    // Numeric comparison
    const numUser = parseFractionOrDecimal(userNormalized);
    const numCorrect = parseFractionOrDecimal(correctNormalized);

    if (numUser !== null && numCorrect !== null) {
      if (Math.abs(numUser - numCorrect) < 0.001) {
        return true;
      }
    }
  }

  return false;
}

function parseFractionOrDecimal(val: string): number | null {
  if (val.includes('%')) {
    const raw = parseFloat(val.replace('%', ''));
    if (!isNaN(raw)) return raw / 100;
  }
  if (val.includes('/')) {
    const parts = val.split('/');
    if (parts.length === 2) {
      const top = parseFloat(parts[0]);
      const bottom = parseFloat(parts[1]);
      if (!isNaN(top) && !isNaN(bottom) && bottom !== 0) {
        return top / bottom;
      }
    }
  }
  const parsed = parseFloat(val);
  return isNaN(parsed) ? null : parsed;
}
