import {CanActivateFn} from '@angular/router';
import {inject} from "@angular/core";
import {AuthService} from "./auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  // const router = inject(Router);
  const _snackBar = inject(MatSnackBar);

  if (authService.getIsLoggedIn()) {
    return true;
  }
  _snackBar.open('Вам надо авторизоваться');
  // router.navigate(['/login']);   // сделали модификацию если не авторизовано и запрашивается отсылать на login страницу.
  return false;
};
