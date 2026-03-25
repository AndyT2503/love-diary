import { Injectable, inject } from '@angular/core';
import {
  Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, user, User
} from '@angular/fire/auth';
import { Firestore, doc, setDoc, getDoc, collection, query, where, getDocs, onSnapshot } from '@angular/fire/firestore';
import { Observable, switchMap, of } from 'rxjs';
import { AppUser } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  currentUser$: Observable<User | null> = user(this.auth);

  async register(email: string, password: string, username: string): Promise<void> {
    const taken = await this.isUsernameTaken(username);
    if (taken) throw new Error('Username already taken');

    const cred = await createUserWithEmailAndPassword(this.auth, email, password);
    const appUser: AppUser = {
      uid: cred.user.uid,
      email,
      username: username.toLowerCase(),
      createdAt: new Date()
    };
    await setDoc(doc(this.firestore, 'users', cred.user.uid), appUser);
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password);
  }

  logout() {
    return signOut(this.auth);
  }

  async getAppUser(uid: string): Promise<AppUser | null> {
    const snap = await getDoc(doc(this.firestore, 'users', uid));
    return snap.exists() ? (snap.data() as AppUser) : null;
  }

  async isUsernameTaken(username: string): Promise<boolean> {
    const q = query(collection(this.firestore, 'users'), where('username', '==', username.toLowerCase()));
    const snap = await getDocs(q);
    return !snap.empty;
  }

  async findUserByUsername(username: string): Promise<AppUser | null> {
    const q = query(collection(this.firestore, 'users'), where('username', '==', username.toLowerCase()));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return snap.docs[0].data() as AppUser;
  }

  currentAppUser$(): Observable<AppUser | null> {
    return this.currentUser$.pipe(
      switchMap(u => {
        if (!u) return of(null);
        return new Observable<AppUser | null>(observer => {
          const ref = doc(this.firestore, 'users', u.uid);
          return onSnapshot(ref, snap => {
            observer.next(snap.exists() ? (snap.data() as AppUser) : null);
          }, err => observer.error(err));
        });
      })
    );
  }
}
