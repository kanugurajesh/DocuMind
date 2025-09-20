import { type ClassValue, clsx } from "clsx";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  File,
  FileText,
  Loader2,
} from "lucide-react";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function getStatusVariant(
  status: string,
): "success" | "processing" | "destructive" | "warning" {
  switch (status) {
    case "completed":
      return "success";
    case "processing":
      return "processing";
    case "failed":
      return "destructive";
    default:
      return "warning";
  }
}

export function getStatusIcon(status: string) {
  switch (status) {
    case "completed":
      return CheckCircle;
    case "processing":
      return Loader2;
    case "failed":
      return AlertCircle;
    default:
      return Clock;
  }
}

export function getFileIcon(fileType: string) {
  if (fileType.includes("pdf")) {
    return { icon: FileText, className: "text-red-500" };
  }

  if (fileType.includes("word") || fileType.includes("document")) {
    return { icon: FileText, className: "text-blue-500" };
  }

  return { icon: File, className: "text-muted-foreground" };
}
