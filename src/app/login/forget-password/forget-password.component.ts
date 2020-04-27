import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { String } from 'typescript-string-operations';
import { Guid } from 'guid-typescript';
import { environment } from '../../../../src/environments/environment';
import { ApiProviderService } from '../../core/api-services/api-provider.service';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss'],
})
export class ForgetPasswordComponent implements OnInit {
  emailAddress;
  envURL;
  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiProviderService,
    private toastr: ToastrService
  ) {
    this.userId = this.activatedRoute.snapshot.params.id;
  }

  uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  userId = '';
  resetPasswordForm: FormGroup;
  formSubmitted = false;
  passwordMismatchError = '';
  isGeneralUser;
  recoveryEmailSent;
  ngOnInit() {
    this.envURL = environment.API.emailUrl;
    this.createForm();
  }

  createForm() {
    this.resetPasswordForm = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  get form() {
    return this.resetPasswordForm.controls;
  }

  passwordChange() {
    this.passwordMismatchError = '';
  }

  resetPassword(password) {
    const formData = new FormData();
    formData.append('Id', this.userId);
    formData.append('Password', password);
  }

  getEmailAddress(email: any) {
    this.emailAddress = email;
  }

  forgotPasswordSubmit() {
    this.formSubmitted = true;
    if (this.resetPasswordForm.valid) {
      const params = {
        emailAddress: this.emailAddress,
        url: this.envURL + '/login/forgot-changepassword',
      };
      var tenantId = Guid.raw();
      const postEmailApi = String.Format(this.apiService.postEmail, tenantId);
      this.apiService.postData(postEmailApi, params).subscribe(
        (response) => {
          if (response && response['status'] === 200) {
            this.toastr.success('Check your Inbox', 'Mail Sent');
            this.resetPasswordForm.reset();
            this.formSubmitted = false;
          }
        },
        (error) => {
          if (error instanceof HttpErrorResponse) {
            this.toastr.error('', error.error.message);
          } else {
            this.toastr.error('', error);
          }
        }
      );
    }
  }
}
