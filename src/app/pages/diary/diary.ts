import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { DiaryService } from '../../services/diary.service';
import { AppUser } from '../../models/user.model';
import { DiaryEntry } from '../../models/diary-entry.model';
import { EntryCardComponent } from '../../components/entry-card/entry-card';
import { WriteEntryComponent } from '../../components/write-entry/write-entry';

@Component({
  selector: 'app-diary',
  standalone: true,
  imports: [EntryCardComponent, WriteEntryComponent],
  templateUrl: './diary.html',
  styleUrl: './diary.scss'
})
export class DiaryComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private diary = inject(DiaryService);
  private router = inject(Router);

  currentUser = signal<AppUser | null>(null);
  groupedEntries = signal<{ date: string; entries: DiaryEntry[] }[]>([]);
  showWriteForm = signal(false);
  hasWrittenToday = signal(false);
  loading = signal(true);

  private userSub?: Subscription;
  private entriesSub?: Subscription;

  ngOnInit() {
    this.userSub = this.auth.currentAppUser$().subscribe(user => {
      if (!user) { this.router.navigate(['/login']); return; }
      if (!user.coupleId) { this.router.navigate(['/pair']); return; }
      this.currentUser.set(user);

      this.entriesSub?.unsubscribe();
      this.entriesSub = this.diary.getEntriesForCouple$(user.coupleId).subscribe(entries => {
        this.groupedEntries.set(this.diary.groupByDate(entries));
        const today = this.diary.todayString();
        this.hasWrittenToday.set(entries.some(e => e.authorId === user.uid && e.date === today));
        this.loading.set(false);
      });
    });
  }

  ngOnDestroy() {
    this.userSub?.unsubscribe();
    this.entriesSub?.unsubscribe();
  }

  onEntryWritten() {
    this.showWriteForm.set(false);
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}
