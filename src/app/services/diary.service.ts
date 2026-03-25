import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { DiaryEntry } from '../models/diary-entry.model';

@Injectable({ providedIn: 'root' })
export class DiaryService {
  private firestore = inject(Firestore);

  async addEntry(entry: Omit<DiaryEntry, 'id'>): Promise<void> {
    // Check user hasn't already written for this date
    const q = query(
      collection(this.firestore, 'diaryEntries'),
      where('coupleId', '==', entry.coupleId),
      where('authorId', '==', entry.authorId),
      where('date', '==', entry.date),
    );
    const snap = await getDocs(q);
    if (!snap.empty) throw new Error('You already wrote an entry for today');
    await addDoc(collection(this.firestore, 'diaryEntries'), entry);
  }

  async updateIsLockedStatus(id: string, isLocked: boolean): Promise<void> {
    if (!id) throw new Error('Entry id is required');

    const docRef = doc(this.firestore, 'diaryEntries', id);

    await updateDoc(docRef, {
      isLocked,
    });
  }

  getEntriesForCouple$(coupleId: string): Observable<DiaryEntry[]> {
    return new Observable((observer) => {
      const q = query(
        collection(this.firestore, 'diaryEntries'),
        where('coupleId', '==', coupleId),
        orderBy('date', 'desc'),
      );
      return onSnapshot(
        q,
        (snap) => {
          const entries = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as DiaryEntry);
          observer.next(entries);
        },
        (err) => observer.error(err),
      );
    });
  }

  groupByDate(entries: DiaryEntry[]): { date: string; entries: DiaryEntry[] }[] {
    const map = new Map<string, DiaryEntry[]>();
    for (const e of entries) {
      if (!map.has(e.date)) map.set(e.date, []);
      map.get(e.date)!.push(e);
    }
    return Array.from(map.entries())
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([date, entries]) => ({ date, entries }));
  }

  todayString(): string {
    return new Date().toISOString().split('T')[0];
  }
}
