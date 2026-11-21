export function generateVietQRUrl(
  bankId: string,
  accountNo: string,
  accountName: string,
  message: string = 'Mung cuoi',
  amount: number = 0
): string {
  const cleanBank = bankId.trim().toUpperCase();
  const cleanAccount = accountNo.trim().replace(/\s+/g, '');
  const encodedName = encodeURIComponent(accountName.trim());
  const encodedMsg = encodeURIComponent(message.trim());
  return `https://img.vietqr.io/image/${cleanBank}-${cleanAccount}-compact2.png?amount=${amount}&addInfo=${encodedMsg}&accountName=${encodedName}`;
}

export function formatDateVietnamese(dateString: string): string {
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayOfWeek = days[d.getDay()];
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${dayOfWeek}, ${day} tháng ${month}, ${year}`;
  } catch {
    return dateString;
  }
}

export function getTimeRemaining(targetDate: string) {
  const total = Date.parse(targetDate) - Date.now();
  if (total <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0, isPassed: true };
  }
  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  return { total, days, hours, minutes, seconds, isPassed: false };
}
