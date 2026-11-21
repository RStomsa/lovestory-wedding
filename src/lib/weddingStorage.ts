import { WeddingData } from '@/types/wedding';
import { defaultWeddingData } from '@/data/defaultWedding';

const STORAGE_KEY = 'lovestory_wedding_data';

/**
 * Lấy dữ liệu thiệp cưới đã lưu từ LocalStorage trên trình duyệt
 * Trả về dữ liệu mặc định nếu đang chạy ở môi trường SSR hoặc chưa lưu
 */
export function getStoredWeddingData(): WeddingData {
  if (typeof window === 'undefined') {
    return defaultWeddingData;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultWeddingData;
    const parsed = JSON.parse(raw);
    return { ...defaultWeddingData, ...parsed };
  } catch (err) {
    console.warn('Failed to parse stored wedding data from localStorage:', err);
    return defaultWeddingData;
  }
}

/**
 * Lưu dữ liệu thiệp cưới vào LocalStorage
 */
export function saveStoredWeddingData(data: WeddingData): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.warn('Failed to save wedding data to localStorage:', err);
  }
}

/**
 * Khôi phục dữ liệu gốc mặc định của LoveStory Studio
 */
export function resetWeddingData(): WeddingData {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('Failed to reset wedding data in localStorage:', err);
    }
  }
  return defaultWeddingData;
}
