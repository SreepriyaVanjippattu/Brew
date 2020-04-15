import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { NbToastrService } from '@nebular/theme';
import { Md5 } from 'ts-md5';

@Component({
  selector: 'change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  validPwd = true;
  formSubmitted = false;
  userId: any;
  validMatch = true;
  validConPwd = true;
  formValid: boolean;
  validOldMatch = true;

  constructor(private formBuilder: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiProviderService,
    private toast: NbToastrService) { }

  resetPasswordForm = this.formBuilder.group({
    oldPassword: ['', [Validators.required]],
    newPassword: ['', [Validators.required]],
    confirmPassword: ['', [Validators.required]],
  });
  get form() {
    return this.resetPasswordForm.controls;
  }
  ngOnInit() {
  }

  checkPassword(pwd) {
    const passw = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
    if (pwd.match(passw)) {
      this.validPwd = true;
    } else {
      this.validPwd = false;
    }
    if (this.resetPasswordForm.get('oldPassword').value !== this.resetPasswordForm.get('newPassword').value) {
      this.validOldMatch = true;
    } else {
      this.validOldMatch = false;
    }
  }

  checkConPassword() {
    if (this.resetPasswordForm.get('newPassword').value === this.resetPasswordForm.get('confirmPassword').value) {
      this.validMatch = true;
    } else {
      this.validMatch = false;
    }
  }


  onCancelClick() {
    this.router.navigate(['app/profile-organization']);
  }

  changePasswordSubmit() {
    this.checkConPassword();
    this.formSubmitted = true;
    if (this.validConPwd && this.validPwd && this.validMatch && this.validOldMatch) {
      this.formValid = true;
    } else {
      this.formValid = false;
    }
    if (this.resetPasswordForm.valid && this.formValid) {
      this.validMatch = true;
      const encryptPassword1 = new Md5();
      const encryptPassword2 = new Md5();

      const oldPassword = encryptPassword1.appendStr(this.resetPasswordForm.get('oldPassword').value).end();
      const newPassword = encryptPassword2.appendStr(this.resetPasswordForm.get('confirmPassword').value).end();
      this.userId = JSON.parse(sessionStorage.getItem('user')).UserProfile.Id;
      const params = {
        Id: this.userId,
        Password: newPassword,
        OldPassword: oldPassword,
      };
      this.apiService.putData(this.apiService.changeProfilePassword, params).subscribe(response => {
        if (response) {
          this.toast.success('Use new Password to login', 'Password Changed');
          this.router.navigate(['app/login']);
        }
      }, error => {
        this.toast.danger(error.error.message);
      });
    }
  }

}
