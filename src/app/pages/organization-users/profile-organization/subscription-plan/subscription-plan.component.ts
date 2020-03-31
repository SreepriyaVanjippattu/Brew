import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { NbToastrService } from '@nebular/theme';
import { UtilitiesService } from '../../../../core/utils/utilities.service';

@Component({
  selector: 'app-subscription-plan',
  templateUrl: './subscription-plan.component.html',
  styleUrls: ['./subscription-plan.component.scss'],
})
export class SubscriptionPlanComponent implements OnInit {

  subscriptionPlan;
  id: any;
  clientDetail: any;
  clientName: string;
  subId: any;
  subName: any;
  expiryDate = new Date();
  userDetails: any;
  userProfile: string;
  userCompany: any;
  systemSetting: any;
  profileSuperForm: any;
  imageName: any;
  userId: any;
  subscriptionName: any;
  constructor(private apiService: ApiProviderService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: NbToastrService,
    private dataTransfer: UtilitiesService,
  ) { }

  ngOnInit() {
    this.getSubscriptionDetails();
    this.getUserDetails();
  }

  getUserDetails() {
    this.userDetails = JSON.parse(sessionStorage.getItem('user'));
    this.expiryDate = this.userDetails.CompanyDetails.EndDate;
    this.subId = this.userDetails.SystemSettings[0].SubscriptionId;
    this.userId = this.userDetails['UserProfile'].Id;
  }

  getSubscriptionDetails() {
    this.apiService.getData(this.apiService.getSubscriptions).subscribe(response => {
      if (response) {
        this.subscriptionPlan = response['body'];
        this.subscriptionPlan.forEach(element => {
          if (element.Id === this.subId) {
            this.subscriptionName = element.Name;
          }
        });
      }
    });
  }

  selectPlan(plan: string) {
    this.subId = plan;
  }

  packageClick() {
    this.subscriptionPlan.forEach(element => {
      if (element.Id === this.subId) {
        this.subName = element.Name;
      }
    });
    sessionStorage.setItem('SubscriptionId', this.subId);
  }

  sendRequest() {
    const paramSettings = {
      Id: this.userDetails.SystemSettings[0].Id,
      Name: this.userDetails.SystemSettings[0].Name,
      EmailSettingId: this.userDetails.SystemSettings[0].EmailSettingId,
      SubscriptionId: this.subId,
      TenantId: this.userDetails.CompanyDetails.Id,
      IsUserLoggedIn: true,
      UserId: this.userId,
      EmailSetting: {},
    };
    this.apiService.putData(this.apiService.editClientSettings, paramSettings).subscribe(response => {
      if (response) {
        this.toast.success('You have successfully send subscription update request');
        this.router.navigate(['app/profile-organization']);
      }
    }, error => {
      this.toast.danger('', error.error.Message);
    });
  }


  clickCancel() {
    this.router.navigate(['app/profile-organization']);
  }

}
