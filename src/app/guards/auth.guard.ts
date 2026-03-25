import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';
import { map, take } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const authGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.currentUser$.pipe(
    take(1),
    map(u => u ? true : router.createUrlTree(['/login']))
  );
};

export const pairedGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.currentAppUser$().pipe(
    take(1),
    map(u => {
      if (!u) return router.createUrlTree(['/login']);
      if (u.coupleId) return router.createUrlTree(['/diary']);
      return true;
    })
  );
};

export const dairyGuard: CanMatchFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.currentAppUser$().pipe(
    take(1),
    map(u => {
      if (!u) return router.createUrlTree(['/login']);
      if (!u.coupleId) return router.createUrlTree(['/pair']);
      return true;
    })
  );
};
