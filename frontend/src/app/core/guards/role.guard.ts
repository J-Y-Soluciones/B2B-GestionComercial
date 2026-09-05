import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.currentUser();
    const allowedRoles = (route.data?.['roles'] as string[]) || [];

    if (user && allowedRoles.includes(user.role)) {
        return true;
    }

    // Si es Vendedor u otro rol no autorizado, se le redirige al cotizador
    router.navigate(['/proformas/create']);
    return false;
};