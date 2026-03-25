import { Routes } from '@angular/router';
import { authGuard, pairedGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'diary', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register').then(m => m.RegisterComponent) },
  { path: 'pair', loadComponent: () => import('./pages/pair/pair').then(m => m.PairComponent), canActivate: [pairedGuard] },
  { path: 'diary', loadComponent: () => import('./pages/diary/diary').then(m => m.DiaryComponent), canActivate: [authGuard] },
  { path: '**', redirectTo: 'diary' }
];
