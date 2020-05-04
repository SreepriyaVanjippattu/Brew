import { Component, OnInit } from '@angular/core';import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { NbToastrService } from '@nebular/theme';
import { Md5 } from 'ts-md5';

@Component({
  selector: 'user-resetpassword',
  templateUrl: './user-resetpassword.component.html',
  styleUrls: ['./user-resetpassword.component.scss']
})
export class UserResetpasswordComponent implements OnInit {

  validPwd = true;
  formSubmitted = false;
  userId: any;

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
    this.userId = this.route.snapshot.params.id;
  }

  checkPassword(pwd) {
    const passw = /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{6,16}$/;
    if (pwd.match(passw)) {
      this.validPwd = true;
    } else {
      this.validPwd = true;
    }
  }

  onCancelClick() {
    this.router.navigate(['/app/user-directory-admin']);
  }

  forgotPasswordSubmit() {
    this.formSubmitted = true;
    if (this.resetPasswordForm.valid) {
      const encryptPassword1 = new Md5();
      const encryptPassword2 = new Md5();
      let newPass = this.resetPasswordForm.get('newPassword').value;
      let confPass = this.resetPasswordForm.get('confirmPassword').value;
      if (newPass === confPass) {
        const newPassword = encryptPassword2.appendStr(this.resetPasswordForm.get('newPassword').value).end();
        const confirmPassword = encryptPassword1.appendStr(this.resetPasswordForm.get('confirmPassword').value.end());

      const params = {
        Id: this.userId,
        Password: newPassword,
        
      };

    }
      //Here need to write password for change password
      
      // this.apiService.putData(this.apiService.changeProfilePassword, params).subscribe(response => {
      //   if (response) {
      //     this.toast.success('Password Changed', 'Success');
      //     this.router.navigate(['app/login']);
      //   }
      // }, error => {
      //   this.toast.danger(error.error.Message);
      // });
    }
  }

}
