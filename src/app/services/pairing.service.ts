import { Injectable, inject } from '@angular/core';
import {
  Firestore, collection, addDoc, query, where, getDocs,
  doc, updateDoc, deleteDoc, onSnapshot
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { CouplePair } from '../models/couple-pair.model';

@Injectable({ providedIn: 'root' })
export class PairingService {
  private firestore = inject(Firestore);

  async sendRequest(requester: { uid: string; username: string }, receiver: { uid: string; username: string }): Promise<void> {
    // Check no existing pair/request
    const existing = await this.getExistingPair(requester.uid, receiver.uid);
    if (existing) throw new Error('A pairing request already exists');

    const pair: Omit<CouplePair, 'id'> = {
      requesterId: requester.uid,
      requesterUsername: requester.username,
      receiverId: receiver.uid,
      receiverUsername: receiver.username,
      status: 'pending',
      createdAt: new Date()
    };
    await addDoc(collection(this.firestore, 'couplePairs'), pair);
  }

  async acceptRequest(pairId: string, user1Id: string, user2Id: string): Promise<string> {
    const coupleId = [user1Id, user2Id].sort().join('_');
    await updateDoc(doc(this.firestore, 'couplePairs', pairId), { status: 'accepted', coupleId });
    await updateDoc(doc(this.firestore, 'users', user1Id), { coupleId });
    await updateDoc(doc(this.firestore, 'users', user2Id), { coupleId });
    return coupleId;
  }

  async declineRequest(pairId: string): Promise<void> {
    await deleteDoc(doc(this.firestore, 'couplePairs', pairId));
  }

  getPendingRequests$(userId: string): Observable<CouplePair[]> {
    return new Observable(observer => {
      const q = query(
        collection(this.firestore, 'couplePairs'),
        where('receiverId', '==', userId),
        where('status', '==', 'pending')
      );
      return onSnapshot(q, snap => {
        const pairs = snap.docs.map(d => ({ id: d.id, ...d.data() } as CouplePair));
        observer.next(pairs);
      }, err => observer.error(err));
    });
  }

  private async getExistingPair(uid1: string, uid2: string): Promise<boolean> {
    const q1 = query(collection(this.firestore, 'couplePairs'),
      where('requesterId', '==', uid1), where('receiverId', '==', uid2));
    const q2 = query(collection(this.firestore, 'couplePairs'),
      where('requesterId', '==', uid2), where('receiverId', '==', uid1));
    const [s1, s2] = await Promise.all([getDocs(q1), getDocs(q2)]);
    return !s1.empty || !s2.empty;
  }
}
