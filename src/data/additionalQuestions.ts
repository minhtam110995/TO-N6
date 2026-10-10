import { Question, CognitiveLevel } from '../types';
import { CHAPTERS_DATA, SEED_QUESTIONS } from './seedQuestions';

export const QUESTION_BANK_TARGET = 2000;
export const CHAPTER_QUESTION_TARGETS = CHAPTERS_DATA.map((chapter, i) => ({ chapterId: chapter.id, count: Math.floor(QUESTION_BANK_TARGET / CHAPTERS_DATA.length) + (i < QUESTION_BANK_TARGET % CHAPTERS_DATA.length ? 1 : 0) }));

const gcd = (a: number, b: number): number => b ? gcd(b, a % b) : Math.abs(a);
const fraction = (a: number, b: number) => { const d = gcd(a, b); return b / d === 1 ? String(a / d) : `${a / d}/${b / d}`; };
type Task = [string, string | number, string, CognitiveLevel?];

// Deterministic variants: each lesson has its own exercise and worked answer.
function exercise(lesson: number, k: number): Task {
  const a = k + 3, b = k + 5;
  switch (lesson) {
    case 1: return [`Tập hợp A gồm các số tự nhiên x thỏa mãn ${a} < x ≤ ${a + 6}. A có bao nhiêu phần tử?`, 6, `A = {${Array.from({ length: 6 }, (_, i) => a + i + 1).join('; ')}} nên có 6 phần tử.`];
    case 2: {
      const digit = (k + 2) % 9 + 1;
      const number = 10000 + digit * 1000 + (247 + k * 11) % 1000;
      return [`Trong số ${number}, chữ số ở hàng nghìn có giá trị bao nhiêu?`, digit * 1000, `Chữ số hàng nghìn là ${digit}, có giá trị ${digit} × 1000 = ${digit * 1000}.`];
    }
    case 3: return [`Có bao nhiêu số tự nhiên lớn hơn ${a * 10} và nhỏ hơn ${a * 10 + b}?`, b - 1, `Các số từ ${a * 10 + 1} đến ${a * 10 + b - 1}: có ${b} - 1 = ${b - 1} số.`];
    case 4: return [`Tính hợp lý: ${a * 10 + 7} + ${b * 10 + 3} + ${a * 10 - 7}.`, (2 * a + b) * 10 + 3, `Nhóm số thứ nhất với số thứ ba: ${a * 20}. Cộng tiếp ${b * 10 + 3} được ${(2 * a + b) * 10 + 3}.`, 'thong_hieu'];
    case 5: return [`Một lớp có ${a} nhóm, mỗi nhóm ${b} học sinh. Chia đều cả lớp thành ${a} đội khác. Mỗi đội có bao nhiêu học sinh?`, b, `Số học sinh: ${a} × ${b} = ${a * b}. Mỗi đội: ${a * b} : ${a} = ${b}.`, 'van_dung'];
    case 6: return [`Phép chia ${a * b + 2} cho ${b} có số dư bằng bao nhiêu?`, 2, `${a * b + 2} = ${b} × ${a} + 2 và 0 ≤ 2 < ${b}.`];
    case 7: return [`Trong các số ${a * 10 + 1}, ${a * 10 + 5}, ${a * 10 + 8}, ${a * 10}, có bao nhiêu số chia hết cho cả 2 và 5?`, 1, `Chia hết cho cả 2 và 5 khi tận cùng là 0. Chỉ có ${a * 10}.`];
    case 8: return [`Tìm chữ số x nhỏ nhất để số ${a % 9 + 1}${b % 10}x chia hết cho 9.`, (9 - ((a % 9 + 1 + b % 10) % 9)) % 9, `Tổng chữ số là ${a % 9 + 1 + b % 10} + x; chọn chữ số nhỏ nhất sao cho tổng chia hết cho 9.`];
    case 9: return [`Số ${a * b} là số nguyên tố hay hợp số? Nhập “hợp số” hoặc “nguyên tố”.`, 'hợp số', `${a * b} = ${a} × ${b}, cả hai thừa số đều lớn hơn 1, nên là hợp số.`];
    case 10: return [`Bội dương nhỏ nhất của ${a} lớn hơn ${a * b} là bao nhiêu?`, a * (b + 1), `Bội tiếp sau ${a} × ${b} là ${a} × ${b + 1} = ${a * (b + 1)}.`, 'thong_hieu'];
    case 11: return [`Có ${a * 4} bút và ${a * 6} vở. Chia thành nhiều nhất bao nhiêu phần quà giống nhau, dùng hết bút và vở?`, a * 2, `Số phần quà là ƯCLN(${a * 4}, ${a * 6}) = ${a} × ƯCLN(4, 6) = ${a * 2}.`, 'van_dung'];
    case 12: return [`Hai đèn nháy lần lượt sau mỗi ${a * 2} và ${a * 3} giây. Vừa nháy cùng lúc, sau ít nhất bao nhiêu giây chúng lại nháy cùng lúc?`, a * 6, `Thời gian là BCNN(${a * 2}, ${a * 3}) = ${a * 6} giây.`, 'van_dung'];
    case 13: return [`Số đối của số nguyên -${a * 7} là bao nhiêu?`, a * 7, `Hai số đối nhau có tổng bằng 0: -${a * 7} + ${a * 7} = 0.`];
    case 14: return [`Nhiệt độ là -${a}°C rồi tăng ${b}°C, sau đó giảm ${a + 1}°C. Nhiệt độ cuối cùng là bao nhiêu °C?`, b - 2 * a - 1, `-${a} + ${b} - ${a + 1} = ${b - 2 * a - 1}.`, 'van_dung'];
    case 15: return [`Tính: ${a} - (${b} - ${a + b}).`, a * 2, `Bỏ ngoặc đổi dấu: ${a} - ${b} + ${a + b} = ${a * 2}.`, 'thong_hieu'];
    case 16: return [`Tính tích (-${a}) × ${b}.`, -a * b, `Hai số khác dấu có tích âm: -(${a} × ${b}) = ${-a * b}.`];
    case 17: return [`Tìm số nguyên x: (-${a}) × x = ${a * b}.`, -b, `x = ${a * b} : (-${a}) = -${b}.`, 'thong_hieu'];
    case 18: return [`Một tam giác đều có chu vi ${a * 3} cm. Mỗi cạnh dài bao nhiêu cm?`, a, `Ba cạnh bằng nhau nên mỗi cạnh là ${a * 3} : 3 = ${a} cm.`];
    case 19: return [`Hình bình hành ABCD có AB = ${a} cm, BC = ${b} cm. Cạnh CD dài bao nhiêu cm?`, a, `Trong hình bình hành, hai cạnh đối bằng nhau: CD = AB = ${a} cm.`];
    case 20: return [`Mảnh vườn hình chữ nhật dài ${a + 7} m, rộng ${a} m. Dành ${a * 2} m² làm lối đi. Diện tích còn lại là bao nhiêu m²?`, a * (a + 5), `Diện tích vườn ${a + 7} × ${a} = ${a * (a + 7)}. Phần còn lại ${a * (a + 7)} - ${a * 2} = ${a * (a + 5)}.`, 'van_dung'];
    case 21: return [`Cho ${a} hình vuông rời nhau. Tổng số trục đối xứng của riêng từng hình là bao nhiêu?`, a * 4, `Mỗi hình vuông có 4 trục đối xứng. Tổng số là ${a} × 4 = ${a * 4}.`, 'thong_hieu'];
    case 22: return [`Trên trục số, hai điểm A, B có tọa độ -${a} và ${a + 2 * b}. Tọa độ tâm đối xứng của đoạn AB là bao nhiêu?`, b, `Tâm đối xứng là trung điểm. Tọa độ: (-${a} + ${a + 2 * b}) : 2 = ${b}.`, 'van_dung'];
    case 23: return [`Tìm x để x/${b * 2} = ${a}/${b}.`, a * 2, `Nhân cả tử và mẫu của ${a}/${b} với 2: x = ${a * 2}.`, 'thong_hieu'];
    case 24: return [`Viết hỗn số ${a} và 2/${b} thành phân số.`, fraction(a * b + 2, b), `Tử số: ${a} × ${b} + 2 = ${a * b + 2}; giữ mẫu ${b}.`, 'thong_hieu'];
    case 25: return [`Tính ${a}/${b} + 2/${b} - 1/${b}.`, fraction(a + 1, b), `Cộng/trừ tử số: ${a} + 2 - 1 = ${a + 1}. Kết quả: ${a + 1}/${b} = ${fraction(a + 1, b)}.`];
    case 26: return [`Tính ${a}/${b} : ${a}/${b + 1}.`, fraction(b + 1, b), `Nhân với phân số nghịch đảo: ${a}/${b} × ${b + 1}/${a} = ${fraction(b + 1, b)}.`, 'thong_hieu'];
    case 27: return [`Một thư viện có ${a * b * 10} cuốn sách. Sách Toán chiếm ${a}/${b} tổng số. Có bao nhiêu cuốn sách Toán?`, a * a * 10, `${a * b * 10} × ${a}/${b} = ${a * a * 10} cuốn.`, 'van_dung'];
    case 28: return [`Viết phân số ${a * 10 + 7}/100 thành số thập phân.`, (a * 10 + 7) / 100, `Chia tử cho 100: dời dấu phẩy sang trái hai chữ số, được ${(a * 10 + 7) / 100}.`];
    case 29: return [`Một cuốn vở giá ${a + 0.5} nghìn đồng. Mua ${b} cuốn và đưa ${Math.ceil((a + 0.5) * b / 10) * 10} nghìn đồng. Được trả lại bao nhiêu nghìn đồng?`, Math.ceil((a + 0.5) * b / 10) * 10 - (a + 0.5) * b, `Tiền mua: ${a + 0.5} × ${b} = ${(a + 0.5) * b}. Tiền thừa: ${Math.ceil((a + 0.5) * b / 10) * 10} - ${(a + 0.5) * b} = ${Math.ceil((a + 0.5) * b / 10) * 10 - (a + 0.5) * b}.`, 'van_dung'];
    case 30: return [`Làm tròn số ${a * 100 + 47} đến hàng chục.`, a * 100 + 50, `Chữ số hàng đơn vị là 7 ≥ 5 nên tăng hàng chục 1 đơn vị, được ${a * 100 + 50}.`];
    case 31: return [`Một chiếc áo giá ${a * 20000} đồng được giảm 15%. Giá sau giảm là bao nhiêu đồng?`, a * 17000, `Giá sau giảm bằng 85% giá ban đầu: ${a * 20000} × 85/100 = ${a * 17000}.`, 'van_dung'];
    case 32: return [`Có ${a} điểm phân biệt trên cùng một đường thẳng. Có bao nhiêu đường thẳng đi qua tất cả các điểm đó?`, 1, `Qua hai điểm phân biệt chỉ có một đường thẳng; tất cả ${a} điểm đã cùng nằm trên đường đó.`];
    case 33: return [`B nằm giữa A và C. AB = ${a} cm, BC = ${b} cm. AC bằng bao nhiêu cm?`, a + b, `Vì B nằm giữa A, C nên AC = AB + BC = ${a} + ${b} = ${a + b}.`];
    case 34: return [`Đoạn AB dài ${a + b} cm, C thuộc đoạn AB với AC = ${a} cm. CB dài bao nhiêu cm?`, b, `CB = AB - AC = ${a + b} - ${a} = ${b} cm.`];
    case 35: return [`M là trung điểm AB dài ${a * 4} cm. N là trung điểm AM. AN dài bao nhiêu cm?`, a, `AM = ${a * 4}/2 = ${a * 2}; AN = ${a * 2}/2 = ${a} cm.`, 'van_dung'];
    case 36: return [`Cho ${a} tia phân biệt chung gốc. Mỗi cặp tia xác định một góc nhỏ (không xét góc lớn hơn 180°). Có bao nhiêu góc?`, a * (a - 1) / 2, `Chọn hai tia trong ${a} tia: ${a} × ${a - 1} : 2 = ${a * (a - 1) / 2}.`, 'van_dung'];
    case 37: {
      const first = 10 + k % 12 * 5, second = 10 + Math.floor(k / 12) * 5;
      return [`Tia Oy nằm trong góc xOz bằng ${first + second}°. Góc xOy bằng ${first}°. Góc yOz bằng bao nhiêu độ?`, second, `Góc yOz = góc xOz - góc xOy = ${first + second} - ${first} = ${second}°.`, 'thong_hieu'];
    }
    case 38: return [`Một bảng khảo sát có ${a} câu trả lời hợp lệ và ${b} câu trả lời không hợp lệ. Có bao nhiêu câu trả lời được dùng để phân tích?`, a, `Chỉ dùng dữ liệu hợp lệ: ${a} câu trả lời.`];
    case 39: return [`Biểu đồ tranh có ${a} biểu tượng đầy đủ, mỗi biểu tượng ứng với ${b} học sinh. Tổng số học sinh là bao nhiêu?`, a * b, `Nhân số biểu tượng với giá trị mỗi biểu tượng: ${a} × ${b} = ${a * b}.`];
    case 40: return [`Biểu đồ cột ghi số sách ba lớp lần lượt là ${a * 3}, ${b * 3}, ${a * 3 + 6}. Ba lớp có tất cả bao nhiêu sách?`, a * 6 + b * 3 + 6, `Cộng chiều cao ba cột: ${a * 3} + ${b * 3} + ${a * 3 + 6} = ${a * 6 + b * 3 + 6}.`, 'thong_hieu'];
    case 41: return [`Biểu đồ cột kép: lớp A có ${a} nam và ${b} nữ; lớp B có ${a + 2} nam và ${b + 3} nữ. Lớp B nhiều hơn lớp A bao nhiêu học sinh?`, 5, `Lớp A: ${a + b}; lớp B: ${a + b + 5}. Chênh lệch: ${a + b + 5} - ${a + b} = 5.`, 'thong_hieu'];
    case 42: return [`Hộp có các thẻ đánh số từ 1 đến ${a * 2}. Rút một thẻ, có bao nhiêu kết quả làm xảy ra sự kiện “số trên thẻ là số chẵn”?`, a, `Các số chẵn: 2, 4, ..., ${a * 2}. Có ${a * 2}/2 = ${a} kết quả.`];
    case 43: return [`Tung đồng xu ${b * 10} lần, mặt ngửa xuất hiện ${a * 5} lần. Xác suất thực nghiệm của mặt ngửa là bao nhiêu? Nhập phân số.`, fraction(a, b * 2), `Số lần ngửa chia tổng số lần tung: ${a * 5}/${b * 10} = ${fraction(a, b * 2)}.`, 'van_dung'];
    default: throw new Error('Bài học chưa có mẫu câu hỏi.');
  }
}

export const ADDITIONAL_QUESTIONS: Question[] = /* @__PURE__ */ CHAPTERS_DATA.flatMap(chapter => Array.from({ length: CHAPTER_QUESTION_TARGETS.find(t => t.chapterId === chapter.id)!.count - SEED_QUESTIONS.filter(q => q.chapterId === chapter.id).length }, (_, i) => {
  const lesson = chapter.lessons[i % chapter.lessons.length];
  const variant = Math.floor(i / chapter.lessons.length);
  const [content, answer, explanation, level = 'nhan_biet'] = exercise(lesson.id, variant);
  return { id: `q-expanded-v1-${chapter.id}-${i + 1}`, chapterId: chapter.id, chapterTitle: chapter.title, lessonId: lesson.id, lessonTitle: lesson.title, content, level, type: 'fill_in_the_blank', correctAnswers: [String(answer)], solutionSteps: [{ step: 1, title: 'Lời giải', explanation }], estimatedSeconds: level === 'van_dung' ? 90 : 60, difficultyScore: level === 'van_dung' ? 0.8 : 0.5 };
}));
