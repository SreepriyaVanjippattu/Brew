import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiProviderService } from '../../core/api-services/api-provider.service';
import { Md5 } from 'ts-md5';
import { HttpErrorResponse } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'forgotchangepassword',
  templateUrl: './forgotchangepassword.component.html',
  styleUrls: ['./forgotchangepassword.component.scss'],
})
export class ForgotchangepasswordComponent implements OnInit {
  validPwd = true;
  formSubmitted = false;
  userId: any;
  validMatch = true;
  validConPwd = true;
  formValid: boolean;
  validOldMatch = true;
  token;
  recoveryEmailSent;
  isGeneralUser;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiProviderService,
    private toast: ToastrService
  ) {}

  forgotPasswordForm = this.formBuilder.group({
    newPassword: ['', [Validators.required]],
    confirmPassword: ['', [Validators.required]],
  });

  get form() {
    return this.forgotPasswordForm.controls;
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.token = params['Token'];
    });
    this.userId = this.route.snapshot.params.id;
  }

  checkPassword(pwd) {
    const passwordExp = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    if (pwd.match(passwordExp)) {
      this.validPwd = true;
    } else {
      this.validPwd = false;
    }
  }

  checkConPassword() {
    if (
      this.forgotPasswordForm.get('newPassword').value ===
      this.forgotPasswordForm.get('confirmPassword').value
    ) {
      this.validMatch = true;
    } else {
      this.validMatch = false;
    }
  }

  onCancelClick() {
    this.router.navigate(['app/login']);
  }

  forgotPasswordSubmit() {
    this.checkConPassword();
    this.formSubmitted = true;
    if (this.validConPwd && this.validPwd && this.validMatch) {
      this.formValid = true;
    } else {
      this.formValid = false;
    }
    if (this.forgotPasswordForm.valid && this.formValid) {
      const encryptPassword2 = new Md5();
      const newPassword = encryptPassword2
        .appendStr(this.forgotPasswordForm.get('newPassword').value)
        .end();

      const params = {
        Password: newPassword,
        Token: this.token,
      };

      this.apiService
        .putData(this.apiService.editForgotPassword, params)
        .subscribe(
          (response) => {
            if (response) {
              this.router.navigate(['app/login']);
            }
          },
          (error) => {
            if (error instanceof HttpErrorResponse) {
              this.toast.error('', error.error.message);
            } else {
              this.toast.error('', error);
            }
          }
        );
    }
  }
}
