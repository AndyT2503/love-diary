import { Component, inject, signal, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { PairingService } from '../../services/pairing.service';
import { AppUser } from '../../models/user.model';
import { CouplePair } from '../../models/couple-pair.model';

@Component({
  selector: 'app-pair',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './pair.html',
  styleUrl: './pair.scss'
})
export class PairComponent implements OnInit, OnDestroy {
  private auth = inject(AuthService);
  private pairing = inject(PairingService);
  private router = inject(Router);

  currentUser = signal<AppUser | null>(null);
  searchUsername = '';
  foundUser = signal<AppUser | null>(null);
  searchError = signal('');
  actionMsg = signal('');
  loading = signal(false);
  pendingRequests = signal<CouplePair[]>([]);

  private sub?: Subscription;

  async ngOnInit() {
    this.auth.currentAppUser$().subscribe(async user => {
      if (!user) { this.router.navigate(['/login']); return; }
      if (user.coupleId) { this.router.navigate(['/diary']); return; }
      this.currentUser.set(user);
      this.sub = this.pairing.getPendingRequests$(user.uid).subscribe(reqs => {
        this.pendingRequests.set(reqs);
      });
    });
  }

  ngOnDestroy() { this.sub?.unsubscribe(); }

  async searchUser() {
    this.searchError.set('');
    this.foundUser.set(null);
    if (!this.searchUsername.trim()) return;
    const found = await this.auth.findUserByUsername(this.searchUsername.trim());
    if (!found) {
      this.searchError.set('User not found');
    } else if (found.uid === this.currentUser()?.uid) {
      this.searchError.set('You cannot pair with yourself');
    } else {
      this.foundUser.set(found);
    }
  }

  async sendRequest() {
    const user = this.currentUser();
    const target = this.foundUser();
    if (!user || !target) return;
    this.loading.set(true);
    try {
      await this.pairing.sendRequest(
        { uid: user.uid, username: user.username },
        { uid: target.uid, username: target.username }
      );
      this.actionMsg.set('Pairing request sent!');
      this.foundUser.set(null);
      this.searchUsername = '';
    } catch (e: any) {
      this.actionMsg.set(e.message);
    } finally {
      this.loading.set(false);
    }
  }

  async acceptRequest(pair: CouplePair) {
    this.loading.set(true);
    try {
      await this.pairing.acceptRequest(pair.id!, pair.requesterId, pair.receiverId);
      this.router.navigate(['/diary']);
    } catch (e: any) {
      this.actionMsg.set(e.message);
    } finally {
      this.loading.set(false);
    }
  }

  async declineRequest(pairId: string) {
    await this.pairing.declineRequest(pairId);
  }

  async logout() {
    await this.auth.logout();
    this.router.navigate(['/login']);
  }
}
