import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

//format tiền tệ khớp với DB total_amount
export function formatVND(amount: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

//format ngày tháng từ DB (due_date)
export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('vi-VN');
}