import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { FormGroup, Validators, FormControl } from '@angular/forms';
import { UtilitiesService } from '../core/utils/utilities.service';
import { ApiProviderService } from '../core/api-services/api-provider.service';
import { Md5 } from 'ts-md5';
import { ToastrService } from 'ngx-toastr';
import { DataService } from '../data.service';
import * as CryptoJS from 'crypto-js';
import { CookieService } from 'ngx-cookie-service';
import { JwtHelperService } from '@auth0/angular-jwt';
import { HttpErrorResponse } from '@angular/common/http';
import { Constants } from '../models/constants';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  userProfile: string;
  message: string;
  errorValidate: boolean = false;
  constructor(
    private router: Router,
    private util: UtilitiesService,
    private apiService: ApiProviderService,
    private toast: ToastrService,
    private data: DataService,
    private cookieStore: CookieService
  ) {}

  get form() {
    return this.loginForm.controls;
  }

  @ViewChild('userNameElement', { static: true }) userNameElement: any;
  loginForm: FormGroup;
  loginError = '';
  passwordPattern = '^(?=.*d).{4,8}$';
  formSubmitted = false;
  userName;
  password;
  emailAddress = '';
  recoveryEmailSent = false;
  isGeneralUser = false;
  emailError = '';
  userAliasName;
  pwd;
  passwordKey = 'Brewers-WarriorTech';
  isEmailValid = true;
  ngOnInit() {
    this.createForm();
    if (this.cookieStore.get('rememberMe')) {
      this.loginForm.get('email').setValue(this.cookieStore.get('email'));
      const decryptedPwd = CryptoJS.AES.decrypt(
        this.cookieStore.get('password'),
        this.passwordKey.trim()
      ).toString(CryptoJS.enc.Utf8);
      this.loginForm.get('password').setValue(decryptedPwd);
      this.loginForm.get('rememberMe').setValue(true);
    }
  }

  createForm() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required]),
      rememberMe: new FormControl(),
    });
  }

  onLoginFormSubmit() {
    this.formSubmitted = true;
    this.emailAddress = this.loginForm.value.email;
    this.password = this.loginForm.value.password;

    if (this.loginForm.valid) {
      const encryptPassword = new Md5();
      if (this.loginForm.get('rememberMe').value) {
        this.cookieStore.set('email', this.loginForm.get('email').value);
        const password = CryptoJS.AES.encrypt(
          this.loginForm.get('password').value.trim(),
          this.passwordKey.trim()
        ).toString();
        this.cookieStore.set('password', password);
        this.cookieStore.set('rememberMe', 'true');
      } else {
        this.cookieStore.deleteAll();
      }

      const params = {
        email: this.emailAddress,
        password: encryptPassword.appendStr(this.password).end(),
      };
      this.apiService.postData(this.apiService.login, params).subscribe(
        (response) => {
          if (response) {
            const responseBody = response['body'];
            this.data.changeMessage(responseBody);
            sessionStorage.user = JSON.stringify(response['body']);
            this.userProfile = sessionStorage.getItem('user');
            const user = JSON.parse(sessionStorage.getItem('user'));
            const token = user['userDetails']['token'];
            localStorage.setItem('token', token);
            this.setPrivileges(token);
            var position = user['userDetails']['position'];
            if (position === Constants.Superadmin) {
              this.router.navigate([`/app/clients`]);
            } else {
              this.router.navigate([`/app/dashboard`]);
            }
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

  setPrivileges(token) {
    const helper = new JwtHelperService();
    const decodedToken = helper.decodeToken(token);
    localStorage.setItem(
      'permissions',
      JSON.stringify(decodedToken.Permissions)
    );
  }

  emailSubmit() {
    this.emailError = '';
  }

  closePwdResetModal() {
    this.emailAddress = '';
    this.recoveryEmailSent = false;
    this.isGeneralUser = false;
    this.emailError = '';
  }

  emailValid(event) {
    this.emailError = '';
    if (this.util.emailRegEx.test(event)) {
      this.emailAddress = event;
      this.isEmailValid = true;
    } else {
      this.isEmailValid = false;
    }
  }

  openPwdResetModal() {
    this.router.navigate(['login/forgot-password']);
  }
}
