import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { environment } from '../../../../src/environments/environment';
import { ApiProviderService } from '../../core/api-services/api-provider.service';
import { NbToastrService } from '@nebular/theme';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss'],
})
export class ForgetPasswordComponent implements OnInit {
  emailAddress;
  envURL;
  constructor(private activatedRoute: ActivatedRoute,
    private router: Router,
    private apiService: ApiProviderService,
    private toastr: ToastrService,
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

  submitForm() {
    this.formSubmitted = true;
    if (this.resetPasswordForm.valid) {
      const newPassword = this.resetPasswordForm.get('newPassword').value;
      const confirmPassword = this.resetPasswordForm.get('confirmPassword').value;
      if (newPassword === confirmPassword) {
        this.resetPassword(newPassword);
      } else {
        this.passwordMismatchError = 'Passwords does not match';
      }
    }
  }

  resetPassword(password) {
    const formData = new FormData();
    formData.append('Id', this.userId);
    formData.append('Password', password);
  }

  getEmailAddress(email: any) {
    this.emailAddress = email;
  }


  forgotPasswordClick() {

    const params = {
      EmailAddress: this.emailAddress,
      Url: this.envURL + '/login/forgot-changepassword',
    }

    this.apiService.putData(this.apiService.postEmail, params).subscribe(response => {
      if (response && response['status'] === 200) {
        this.toastr.success('Check your Inbox', 'Mail Sent');
      }
    }, error => {

    });
  }

  forgotPasswordSubmit() {

  }
}
