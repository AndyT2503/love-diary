import { Component, inject, signal, ChangeDetectorRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  username = '';
  error = signal('');
  loading = signal(false);

  async onSubmit() {
    this.error.set('');
    if (this.username.length < 3) {
      this.error.set('Username must be at least 3 characters');
      return;
    }
    this.loading.set(true);
    try {
      await this.auth.register(this.email, this.password, this.username);
      this.router.navigate(['/diary']);
    } catch (e: any) {
      this.error.set(e.message || 'Registration failed');
    } finally {
      this.loading.set(false);
    }
  }
}
