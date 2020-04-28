import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { ApiProviderService } from '../../core/api-services/api-provider.service';
import { SignUpService } from '../sign-up.service';
import { NbToastrService } from '@nebular/theme';
import { Guid } from 'guid-typescript';
import { Md5 } from 'ts-md5/dist/md5';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'signup-plan',
  templateUrl: './signup-plan.component.html',
  styleUrls: ['./signup-plan.component.scss'],
})
export class SignupPlanComponent implements OnInit {

  @ViewChild('checkBox', { static: false }) checkBox: ElementRef;
  public plan: string;
  public subscriptionPlan;
  signUpContent;
  subScriptionParams;
  generateId: string;

  constructor(
    private apiService: ApiProviderService,
    private router: Router,
    private signupservice: SignUpService,
    private toastr: ToastrService,

  ) { }
  marked = false;

  ngOnInit() {
    this.signUpDetails();
    this.getSubscriptionDetails();
  }

  getSubscriptionDetails() {
    this.apiService.getDataList(this.apiService.getSubscriptions).subscribe(response => {
      this.subscriptionPlan = response['body'].subscriptions;
    });
  }

  toggleVisibility(e) {
    this.marked = e.target.checked;
  }

  submitClick() {
    if (this.subScriptionParams) {
      const md5 = new Md5();
      const params = {
        clientName: this.subScriptionParams.signUp.companyname,
        emailAddress: this.subScriptionParams.signUp.emailId,
        phoneNumber: this.subScriptionParams.signUp.phone,
        firstName: this.subScriptionParams.signUp.firstName,
        lastName: this.subScriptionParams.signUp.lastName,
        password: md5.appendStr(this.subScriptionParams.signUp.password).end(),
        subscriptionId: this.subScriptionParams.plan,

      };
      this.apiService.postData(this.apiService.initilizeClient, params).subscribe(response => {
        if (response) {
          this.router.navigate(['signup/signup-success']);
        }
      }, error => {
        this.toastr.error('', error.error.message);
      });
    }
  }

  selectPlan(plan: string) {
    this.subScriptionParams = {};
    this.plan = plan;
    if (this.signUpContent) {
      this.subScriptionParams = {
        plan: this.plan,
        signUp: this.signUpContent,
      };
    }
  }
  signup() {
    this.router.navigate(['signup']);
  }
  cancelClick() {
    this.router.navigate(['/']);
  }

  signUpDetails() {
    this.signUpContent = this.signupservice.getValue;
  }

  clickedAgree() {
    this.marked = true;
    this.checkBox.nativeElement.checked = true;
  }

}
