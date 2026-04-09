import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateMiddle(str: string, length: number = 30) {
  if (str.length <= length) return str;
  const sep = '...';
  const mid = Math.ceil(length / 2);
  return str.substring(0, mid) + sep + str.substring(str.length - (length - mid));
}
