import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppUser } from '../../models/user.model';
import { DiaryService } from '../../services/diary.service';

@Component({
  selector: 'app-write-entry',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './write-entry.html',
  styleUrl: './write-entry.scss',
})
export class WriteEntryComponent {
  @Input() currentUser!: AppUser;
  @Output() entrySaved = new EventEmitter<void>();

  private diary = inject(DiaryService);

  content = '';
  lockQuestion = '';
  correctAnswer = '';
  options = ['', '', ''];
  error = signal('');
  loading = signal(false);

  async save() {
    this.error.set('');
    if (!this.content.trim()) {
      this.error.set('Please write something');
      return;
    }
    if (!this.lockQuestion.trim()) {
      this.error.set('Please add a lock question');
      return;
    }
    if (!this.correctAnswer.trim()) {
      this.error.set('Please add the answer');
      return;
    }
    if (this.options.some((o) => !o.trim())) {
      this.error.set('Please fill all options');
      return;
    }

    this.loading.set(true);
    try {
      await this.diary.addEntry({
        coupleId: this.currentUser.coupleId!,
        authorId: this.currentUser.uid,
        authorUsername: this.currentUser.username,
        date: this.diary.todayString(),
        content: this.content.trim(),
        lockQuestion: this.lockQuestion.trim(),
        correctAnswer: this.correctAnswer.trim(),
        options: this.shuffleOptions(),
        createdAt: new Date(),
        isLocked: true,
      });
      this.entrySaved.emit();
    } catch (e: any) {
      this.error.set(e.message);
    } finally {
      this.loading.set(false);
    }
  }

  private shuffleOptions(): string[] {
    const all = [this.correctAnswer, ...this.options];
    return all.sort(() => Math.random() - 0.5);
  }
}
