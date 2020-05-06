import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

import { FormBuilder, Validators } from '@angular/forms';
import { ApiProviderService } from '../../../core/api-services/api-provider.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  settingDetails = JSON.parse(sessionStorage.getItem('user'));
  settingData: any;
  data: any;
  formSubmitted = false;
  clientData: any;
  subDetails: any;
  addData: any;
  generalSettings: any;
  settingsDate: any;
  currentUserMail: any;
  userProfile: any;
  userId: any;
  constructor(
    private apiService: ApiProviderService,
    private router: Router,
    private forms: FormBuilder,
    private toast: NbToastrService,
  ) { }
  emailSubscriptionForm = this.forms.group({
    subscriptionEmail: ['', Validators.required],
    supportEmail: ['', Validators.required],
    // password: ['', Validators.required],
    demoLivePeriod: ['', Validators.required],
    orgAccLivPeriod: ['', Validators.required],
    demoPeriod: ['', Validators.required],
    orgAccSubPeriod: ['', Validators.required],
  });
  ngOnInit() {
    this.userProfile = JSON.parse(sessionStorage.getItem('user'));
    this.userId = this.userProfile['UserProfile'].Id;
    this.getSubscriptionSettings();
    this.getSettingsDetails();
  }

  get form() {
    return this.emailSubscriptionForm.controls;
  }

  getSettingsDetails() {
    this.settingData = this.settingDetails['SystemSettings'];
    this.generalSettings = this.settingDetails['CompanyDetails'].GeneralSetting;
    this.settingsDate = this.settingDetails['CompanyDetails'];
    this.addData = this.settingData[0].CreatedDate;
    this.subDetails = this.settingDetails['SystemSettings'][0];
    this.data = this.settingData[0]['EmailSetting'];
  }

  getSubscriptionSettings() {

    const sessionData = this.userProfile['SystemSettings'][0].EmailSetting;
    const sessionSubscriptionData = this.userProfile['CompanyDetails'].GeneralSetting;
    this.apiService.getDataList(this.apiService.getAllActiveClients).subscribe((response: any) => {
      if (response.status === 200) {
        this.clientData = response['body'];
        const data = this.clientData.filter(element => element.Id === this.settingDetails['UserProfile'].TenantId);
        this.clientData = data[0].GeneralSetting;
        this.currentUserMail = data[0].SystemSetting[0].EmailSetting;
      }
      this.emailSubscriptionForm.get('subscriptionEmail').setValue(this.currentUserMail.SubscriptionEmail);
      this.emailSubscriptionForm.get('supportEmail').setValue(this.currentUserMail.SupportEmail);

      this.emailSubscriptionForm.get('demoLivePeriod').setValue(this.clientData.DemoLivePeriod);
      this.emailSubscriptionForm.get('orgAccLivPeriod').setValue(this.clientData.OrganizationAccountSubscriptionLivePeriod);
      this.emailSubscriptionForm.get('demoPeriod').setValue(this.clientData.DemoGracePeriodBeforeDelete);
      this.emailSubscriptionForm.get('orgAccSubPeriod').setValue(this.clientData.OrganizationAccountSubscriptionGracePeriod);
    });
  }

  saveSettings() {
    this.formSubmitted = true;
    if (this.emailSubscriptionForm.valid) {
      const paramsEmail = {
        Id: this.settingData[0].Id,
        Name: this.settingData[0].Name,
        EmailSettingId: this.data.Id,
        SubscriptionId: this.subDetails.SubscriptionId,
        TenantId: this.subDetails.TenantId,
        CreatedDate: this.addData,
        ModifiedDate: this.subDetails.ModifiedDate,
        StartDate: this.settingsDate.StartDate,
        EndDate: this.settingsDate.EndDate,
        IsUserLoggedIn: false,
        UserId: this.userId,
        EmailSetting: {
          Id: this.data.Id,
          ServerAddress: '',
          UserName: '',
          Password: '',
          CreatedDate: this.addData,
          ModifiedDate: this.subDetails.ModifiedDate,
          TenantId: this.subDetails.TenantId,
          SubscriptionEmail: this.emailSubscriptionForm.get('subscriptionEmail').value,
          SupportEmail: this.emailSubscriptionForm.get('supportEmail').value,
        },
      };
      const paramsSubscriptions = {
        Id: this.generalSettings.Id,
        DemoLivePeriod: this.emailSubscriptionForm.get('demoLivePeriod').value,
        OrganizationAccountSubscriptionLivePeriod: this.emailSubscriptionForm.get('orgAccLivPeriod').value,
        DemoGracePeriodBeforeDelete: this.emailSubscriptionForm.get('demoPeriod').value,
        OrganizationAccountSubscriptionGracePeriod: this.emailSubscriptionForm.get('orgAccSubPeriod').value,
        CurrentUser: JSON.parse(sessionStorage.user).UserProfile.Id,
      };
      this.apiService.putData(this.apiService.editClientSettings, paramsEmail).subscribe((response: any) => {
        if (response.status === 200) {
          this.apiService.putData(this.apiService.editGeneralSettings, paramsSubscriptions).subscribe((res: any) => {
            if (res.status === 200) {
              this.toast.success('Edited !,Success');
            }
          }, error => {
            this.toast.danger(error.error.message, 'Error!');
          });
        }
      }, error => {
        this.toast.danger(error.error.message, 'Error!');
      });
    }
  }

  cancelSettings() {
    this.router.navigate(['app/clients']);
  }
}
