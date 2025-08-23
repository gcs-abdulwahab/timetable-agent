// Format time string as 'h:mm AM/PM'
export function formatTime(time: string) {
  let t = time;
  if (t.includes(' ')) t = t.split(' ')[1];
  if (t.includes(':')) {
    const [h, m] = t.split(':');
    const hour = parseInt(h, 10);
    const minute = parseInt(m, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 === 0 ? 12 : hour % 12;
    return `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`;
  }
  return time;
}
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
