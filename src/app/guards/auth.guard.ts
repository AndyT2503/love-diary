import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.currentUser$.pipe(
    take(1),
    map(u => u ? true : router.createUrlTree(['/login']))
  );
};

export const pairedGuard: CanActivateFn = () => {
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
