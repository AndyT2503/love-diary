import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DiaryEntry } from '../../models/diary-entry.model';
import { DiaryService } from '../../services/diary.service';

@Component({
  selector: 'app-entry-card',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './entry-card.html',
  styleUrl: './entry-card.scss',
})
export class EntryCardComponent implements OnInit {
  @Input() entry!: DiaryEntry;
  @Input() currentUserId!: string;

  private diary = inject(DiaryService);

  loading = signal(false);
  unlocked = signal(false);
  showQuestion = signal(false);
  wrongAnswer = signal(false);
  options = signal<string[]>([]);
  selectedOption = signal<string | null>(null);

  get isOwn(): boolean {
    return this.entry.authorId === this.currentUserId;
  }

  ngOnInit(): void {
    this.getLockedStatus();
  }

  getLockedStatus() {
    this.unlocked.set(!this.entry.isLocked);
  }

  async onCardClick() {
    if (this.isOwn || this.unlocked()) return;

    this.showQuestion.set(true);

    const opts = await this.getOptions();
    this.options.set(opts);
  }

  getOptions() {
    if (this.entry.options?.length) {
      return this.entry.options;
    }
    return [];
  }

  selectOption(opt: string) {
    this.selectedOption.set(opt);
    this.wrongAnswer.set(false);
  }

  async submitAnswer() {
    if (!this.selectedOption()) return;

    const correct =
      this.selectedOption()!.toLowerCase() === this.entry.correctAnswer.trim().toLowerCase();

    if (correct) {
      try {
        this.loading.set(true);
        await this.diary.updateIsLockedStatus(this.entry.id!, false);
        this.entry.isLocked = false;
        this.unlocked.set(true);
        this.showQuestion.set(false);
        this.wrongAnswer.set(false);
        this.loading.set(false);
      } catch (e) {
        console.error(e);
        this.wrongAnswer.set(true);
      }
    } else {
      this.wrongAnswer.set(true);
      this.selectedOption.set(null);
    }
  }

  cancelUnlock() {
    this.showQuestion.set(false);
    this.selectedOption.set(null);
    this.wrongAnswer.set(false);
  }
}
