import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiV1 } from 'src/app/api/v1';
import { AuthService } from 'src/app/services/auth.service';
import { SettingsService } from 'src/app/services/settings.service';
import { FormStatus } from 'src/app/utils/form-status';

@Component({
  selector: 'app-login-page',
  templateUrl: './login-page.component.html',
  styleUrls: [],
  providers: [ApiV1],
})
export class LoginPageComponent implements OnInit {
  loginForm = new FormGroup({
    username: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  formSubmitted = false;
  formStatus: FormStatus = 'Initial';
  formError = '';

  constructor (
    private apiV1: ApiV1,
    private authService: AuthService,
    private settingsService: SettingsService,
    private router: Router,
  ) { }

  ngOnInit (): void {
  }

  onFormSubmit () {
    this.formSubmitted = true;

    if (!this.canSubmit) {
      return;
    }

    this.formStatus = 'Pending';
    this.formError = '';

    this.apiV1.postToken(
      this.formControls.username.value,
      this.formControls.password.value,
    ).pipe(
      catchError((error: HttpErrorResponse) => {
        this.formStatus = 'Initial';
        this.formError = error.error.message;
        return throwError(() => new Error(error.error.message));
      }),
    )
      .subscribe(async (result: any) => {
        // Save the token to use it later
        this.authService.login(result.token);

        // Load types in settings so we'll be able to manage items
        await this.settingsService.loadTypes();

        // Reset the form to its initial state
        this.formStatus = 'Initial';
        this.loginForm.reset();
        this.formSubmitted = false;

        // And redirect the user to the home page
        this.router.navigate(['/']);
      });
  }

  get formControls () {
    return this.loginForm.controls;
  }

  get canSubmit () {
    return (
      this.formStatus === 'Initial' &&
      !this.usernameIsInvalid &&
      !this.passwordIsInvalid
    );
  }

  get usernameIsInvalid () {
    return this.formControls.username?.invalid && (
      this.formControls.username?.touched ||
      this.formSubmitted
    );
  }

  get passwordIsInvalid () {
    return this.formControls.password?.invalid && (
      this.formControls.password?.touched ||
      this.formSubmitted
    );
  }
}
