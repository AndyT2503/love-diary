export interface DiaryEntry {
  id?: string;
  coupleId: string;
  authorId: string;
  authorUsername: string;
  date: string; // YYYY-MM-DD
  content: string;
  lockQuestion: string;
  correctAnswer: string;
  options: string[];
  createdAt: Date;
  isLocked: boolean;
}
