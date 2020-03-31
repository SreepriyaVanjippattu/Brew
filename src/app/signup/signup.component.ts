import { Component, OnInit, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ApiProviderService } from '../core/api-services/api-provider.service';
import { FormBuilder } from '@angular/forms';
import { FormGroup, Validators, FormControl } from '@angular/forms';
import { EventEmitter } from 'events';
import { SignUpService } from './sign-up.service';

@Component({
  selector: 'signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
  timer = null;

  validPhone = true;
  phone = null;
  companynameValue: string;
  validPassword = true;
  validEmail = true;
  success: boolean;
  formSubmitted: boolean = false;
  blur = false;
  buttonDisabled = true;
  @ViewChild('tooltip', { static: true }) toolTip: ElementRef;
  CompanyName: any;
  constructor(
    private router: Router,
    private apiService: ApiProviderService,
    private forms: FormBuilder,
    private signupservice: SignUpService,
  ) { }

  passwordPattern = '^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$';
  signUpForm = this.forms.group({
    companyname: ['', [Validators.required]],
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    emailId: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    password: ['', [Validators.required, Validators.pattern(this.passwordPattern)]],
  });

  get form() { return this.signUpForm.controls; }

  ngOnInit() {
  }
  emailvalidation(email) {
    const emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    if (!emailReg.test(email)) {
      this.validEmail = false;
    } else {
      this.validEmail = true;
    }
  }
  passwordValidation(value) {
    const passwordExp = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
    if (passwordExp.test(value)) {
      this.validPassword = true;
    } else {
      this.validPassword = false;
      this.toolTip.nativeElement.click();
    }
  }
  selectPackage() {
    this.CompanyName = this.signUpForm.get('companyname').value;
    this.signupservice.signUpContent(this.signUpForm.value);
    this.formSubmitted = true;
    if (this.signUpForm.valid && this.blur === true) {
      this.router.navigate(['signup/signup-plan']);
    }
  }


  formatPhone() {
    if (this.signUpForm.get('phone').errors) {
      this.validPhone = false;
    } else {
      this.validPhone = true;
    }
  }

  cancelClick() {
    this.router.navigate(['/']);
  }
  keydown(companyname) {
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.IsCompanynamesAvailable(companyname), 1000);
  }
  IsCompanynamesAvailable(companyname: string) {
    if (this.signUpForm.get('companyname')) {
      const clientDetails = this.apiService.getData(this.apiService.isCompanyNameAvailable + '&companyname=' + companyname).
        subscribe((response) => {
          if (response.status === 200) {
            this.blur = true;
            this.companynameValue = companyname;
          }
        },
          error => {
            this.blur = false;
            this.companynameValue = '';
          });
    } else {
      this.signUpForm.get('companyname').invalid;
    }
  }
}

