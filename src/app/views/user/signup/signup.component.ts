import { Component } from '@angular/core';
import {FormBuilder, Validators} from "@angular/forms";
import {AuthService} from "../../../core/auth/auth.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {Router} from "@angular/router";
import {LoginResponseType} from "../../../../types/login-response.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {HttpErrorResponse} from "@angular/common/http";

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent {
  signupForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)]],
    passwordRepeat: ['', [Validators.required, Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/)]],
    agree: [false, [Validators.requiredTrue]],

  })

  get email() {
    return this.signupForm.get('email');
  }
  get password() {
    return this.signupForm.get('password');
  }
  get passwordRepeat() {
    return this.signupForm.get('passwordRepeat');
  }
  get agree() {
    return this.signupForm.get('password');
  }

  constructor(private fb: FormBuilder, private authService: AuthService, private _snackBar: MatSnackBar,
              private router: Router) { }


  signup() {
    console.log('Полетели')
    if (this.signupForm.valid && this.signupForm.value.email && this.signupForm.value.password
      && this.signupForm.value.passwordRepeat && this.signupForm.value.agree) {
      this.authService.signup(this.signupForm.value.email, this.signupForm.value.password, this.signupForm.value.passwordRepeat)
        .subscribe({
            next: (data: LoginResponseType | DefaultResponseType) => {
              let error = null;
              if ((data as DefaultResponseType) !== undefined ) {
                error = (data as DefaultResponseType).message;
              }

              const loginResponse = data as LoginResponseType;
              if (!loginResponse.accessToken || !loginResponse.refreshToken || !loginResponse.userId ) {
                error = 'Ошибка регистрации';
              }
              if (error) {
                this._snackBar.open(error);
                throw new Error(error);
              }

              this.authService.setTokens(loginResponse.accessToken, loginResponse.refreshToken);
              this.authService.userId = loginResponse.userId;
              this._snackBar.open('Вы успешно зарегистрировались');
              this.router.navigate(['/']);




            },
            error: (err: HttpErrorResponse) => {
              if(err.error && err.error.message) {
                this._snackBar.open(err.error.message);
                console.log(err.error.message);
              } else  {
                this._snackBar.open('Ошибка регистрации');
                console.log('Ошибка регистрации');
              }
            }
          }
        )
    }
  }


}
