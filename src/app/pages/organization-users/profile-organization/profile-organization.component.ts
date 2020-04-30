import { Component, OnInit, OnDestroy } from '@angular/core';

import { FormBuilder, Validators } from '@angular/forms';
import { ApiProviderService } from '../../../core/api-services/api-provider.service';
import { Router } from '@angular/router';
import { NbToastrService, NbLayoutScrollService } from '@nebular/theme';
import { PhoneFormatPipe } from '../../../core/utils/phone-format.pipe';
import { UploadConfig, UploadParams, BlobService } from 'angular-azure-blob-service';
import { environment } from '../../../../environments/environment';


@Component({
  selector: 'app-profile-organization',
  templateUrl: './profile-organization.component.html',
  styleUrls: ['./profile-organization.component.scss'],
})
export class ProfileOrganizationComponent implements OnInit, OnDestroy {
  userDetailsContent;
  userProfile: any;
  userCompany: any;
  validEmail: boolean;
  validCompanyPhone = true;
  systemSetting: any;
  roleId: string;
  responseUser: boolean = true;
  responseCompany: boolean = true;
  validUserPhone = true;
  formSubmitted = false;

  config: UploadConfig;
  currentFile: File;
  currentLogo: File;
  percent: number;
  percentCompany: number;
  ConfigUser: UploadParams = {
    sas: environment.sasToken,
    storageAccount: environment.storageAccount,
    containerName: environment.containerNameUser,
  };
  ConfigCompany: UploadParams = {
    sas: environment.sasToken,
    storageAccount: environment.storageAccount,
    containerName: environment.containerNameCompanyLogo,
  };
  imageLink = '';
  imageLinkCompany = '';
  imageError = false;
  imageErrorCompany = false;
  currentUser: any;
  constructor(
    private router: Router,
    private form: FormBuilder,
    private apiService: ApiProviderService,
    private toast: NbToastrService,
    private phonePipe: PhoneFormatPipe,
    private blob: BlobService,
    private scrolltop: NbLayoutScrollService,
  ) { }


  profileOrgForm = this.form.group({
    company: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    companyPhone: ['', [Validators.required]],
    city: [''],
    street: [''],
    state: [''],
    country: [''],
    postalcode: [''],

    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    userEmail: [''],
    userPhone: ['', [Validators.required]],
    userId: [''],
    imageUser: [''],
    imageCompany: [''],
  });

  get forms() { return this.profileOrgForm.controls; }

  ngOnInit() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    this.userProfile = user['UserProfile'];
    this.currentUser = this.userProfile.Id;
    this.userCompany = user['CompanyDetails'];
    this.roleId = this.userProfile.Roles[0].Id;
    this.setUserEditDetails();
    this.setCompanyEditDetails();
  }


  setUserEditDetails() {
    this.profileOrgForm.get('firstName').setValue(this.userProfile.FirstName);
    this.profileOrgForm.get('lastName').setValue(this.userProfile.LastName);
    this.profileOrgForm.get('userEmail').setValue(this.userProfile.EmailAddress);
    this.profileOrgForm.get('userPhone').setValue(this.userProfile.PrimaryPhone);
    this.imageLink = this.userProfile.ImageUrl;
  }

  setCompanyEditDetails() {
    this.profileOrgForm.get('company').setValue(this.userCompany.Name);
    this.profileOrgForm.get('email').setValue(this.userCompany.ContactEmail);
    this.profileOrgForm.get('companyPhone').setValue(this.userCompany.ContactPhone);
    this.profileOrgForm.get('city').setValue(this.userCompany.City);
    this.profileOrgForm.get('street').setValue(this.userCompany.Address1);
    this.profileOrgForm.get('state').setValue(this.userCompany.State);
    this.profileOrgForm.get('country').setValue(this.userCompany.Country);
    this.profileOrgForm.get('postalcode').setValue(this.userCompany.Postalcode);
    this.imageLinkCompany = this.userCompany.ImageUrl;
    if (this.roleId !== 'e306b412-cf09-486f-b336-21dadaddaeed') {
      this.profileOrgForm.get('company').disable();
      this.profileOrgForm.get('email').disable();
      this.profileOrgForm.get('companyPhone').disable();
      this.profileOrgForm.get('city').disable();
      this.profileOrgForm.get('street').disable();
      this.profileOrgForm.get('state').disable();
      this.profileOrgForm.get('country').disable();
      this.profileOrgForm.get('postalcode').disable();
      this.profileOrgForm.get('imageCompany').disable();
      document.getElementById('subButton').setAttribute('disabled', 'true');
    }
  }

  emailvalidation(email) {
    const emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    if (!emailReg.test(email)) {
      this.validEmail = false;
    } else {
      this.validEmail = true;
    }
  }

  formatCompanyPhone() {
    if (this.profileOrgForm.get('companyPhone').errors) {
      this.validCompanyPhone = false;
    } else {
      this.validCompanyPhone = true;
    }
  }

  formatUserPhone() {
    if (this.profileOrgForm.get('userPhone').errors) {
      this.validUserPhone = false;
    } else {
      this.validUserPhone = true;
    }
  }

  gotoTop() {
    this.scrolltop.scrollTo(0, 0);
  }


  saveProfile() {
    this.formSubmitted = true;
    if (this.profileOrgForm.valid) {
      if (this.roleId === 'e306b412-cf09-486f-b336-21dadaddaeed') {
        this.editCompanyDetails();
      }
      this.editUserDetails();
    }
  }

  editCompanyDetails() {
    if (this.profileOrgForm.get('imageCompany').value) {
      this.editCompanyLogo();
    } else {
      this.saveCompany();
    }
  }

  saveCompany() {
    const params = {
      Id: this.userCompany.Id,
      Name: this.profileOrgForm.get('company').value,
      ContactEmail: this.profileOrgForm.get('email').value,
      ContactPhone: this.profileOrgForm.get('companyPhone').value,
      Address1: this.profileOrgForm.get('street').value,
      Address2: null,
      State: this.profileOrgForm.get('state').value,
      Country: this.profileOrgForm.get('country').value,
      City: this.profileOrgForm.get('city').value,
      Postalcode: this.profileOrgForm.get('postalcode').value,
      IsActive: this.userCompany.IsActive,
      ImageUrl: this.imageLinkCompany,
      Status: this.userCompany.Status,
      StatusId: this.userCompany.StatusId,
      CurrentUser: this.currentUser,
    };
    this.apiService.putData(this.apiService.editClient, params).subscribe(response => {
      if (response) {
        this.responseCompany = true;
        this.updateSession();
      }
    }, error => {
        this.toast.danger(error.error.message, 'Try Again');
      this.responseCompany = false;
    });
  }

  editUserDetails() {
    if (this.profileOrgForm.get('imageUser').value) {
      this.editUserImage();
    } else {
      this.saveUser();
    }
  }

  saveUser() {
    const params = {
      Id: this.userProfile.Id,
      FirstName: this.profileOrgForm.get('firstName').value,
      LastName: this.profileOrgForm.get('lastName').value,
      EmailAddress: this.profileOrgForm.get('userEmail').value,
      PrimaryPhone: this.profileOrgForm.get('userPhone').value,
      Password: this.userProfile.Password,
      IsActive: this.userProfile.IsActive,
      ImageUrl: this.imageLink,
      Position: this.userProfile.Position,
      CreatedDate: this.userProfile.CreatedDate,
      ModifiedDate: this.userProfile.ModifiedDate,
      TenantId: this.userProfile.TenantId,
      StatusId: this.userCompany.OrgSuperUser.StatusId,
      CurrentUser: this.userProfile.Id,
      Roles: [
        {
          Id: this.userProfile.Roles[0].Id,
        },
      ],
    };
    this.apiService.putData(this.apiService.editUser, params).subscribe(response => {
      if (response) {
        this.responseUser = true;
        this.updateSession();
      }
    }, error => {
      this.toast.danger(error.error.message, 'Try Again');
      this.responseUser = false;
    });
  }

  updateSession() {
    this.userProfile = sessionStorage.getItem('user');
    const updateUser = JSON.parse(sessionStorage.getItem('user'));
    this.userProfile = updateUser['UserProfile'];
    this.userCompany = updateUser['CompanyDetails'];
    this.systemSetting = updateUser['SystemSettings'];

    const updateValue = [];
    const userProfileValue = {
      Id: this.userProfile.Id,
      FirstName: this.profileOrgForm.get('firstName').value,
      LastName: this.profileOrgForm.get('lastName').value,
      EmailAddress: this.profileOrgForm.get('userEmail').value,
      PrimaryPhone: this.profileOrgForm.get('userPhone').value,
      Password: this.userProfile.Password,
      IsActive: this.userProfile.IsActive,
      ImageUrl: this.imageLink,
      Position: this.userProfile.Position,
      CreatedDate: this.userProfile.CreatedDate,
      ModifiedDate: this.userProfile.ModifiedDate,
      TenantId: this.userProfile.TenantId,
      Roles: this.userProfile.Roles,
    };
    const companyValue = {
      Id: this.userCompany.Id,
      Name: this.profileOrgForm.get('company').value,
      ContactEmail: this.profileOrgForm.get('email').value,
      ContactPhone: this.profileOrgForm.get('companyPhone').value,
      Address1: this.profileOrgForm.get('street').value,
      Address2: null,
      State: this.profileOrgForm.get('state').value,
      Country: this.profileOrgForm.get('country').value,
      City: this.profileOrgForm.get('city').value,
      Postalcode: this.profileOrgForm.get('postalcode').value,
      IsActive: this.userCompany.IsActive,
      ImageUrl: this.imageLinkCompany,
      Status: this.userCompany.Status,
      StatusId: this.userCompany.StatusId,
      GeneralSetting: this.userCompany.GeneralSetting,
      OrgSuperUser: this.userCompany.OrgSuperUser,
      Subscriptions: this.userCompany.Subscriptions,
      SystemSetting: this.userCompany.SystemSetting,
      EndDate: this.userCompany.EndDate,
      StartDate: this.userCompany.StartDate,
    };
    updateValue.push({
      UserProfile: userProfileValue,
      CompanyDetails: companyValue,
      SystemSettings: this.systemSetting,
    });

    sessionStorage.user = JSON.stringify(updateValue[0]);
  }

  cancelClick() {
    this.router.navigate(['app/dashboard']);
  }

  changePasswordClick() {
    this.router.navigate(['app/profile-organization/change-password']);
  }

  subscriptionPlanClick() {
    this.router.navigate(['app/profile-organization/subscription-plan']);
  }

  imageUploadUser(event) {
    this.currentFile = event.target.files[0];
    if (this.currentFile.type === 'image/jpg' ||
      this.currentFile.type === 'image/png' ||
      this.currentFile.type === 'image/jpeg') {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageLink = e.target.result;
      };
      reader.readAsDataURL(this.currentFile);
      this.imageError = false;
    } else {
      this.imageError = true;
    }
  }

  logoUploadCompany(event) {
    this.currentLogo = event.target.files[0];
    if (this.currentLogo.type === 'image/jpg' ||
      this.currentLogo.type === 'image/png' ||
      this.currentLogo.type === 'image/jpeg') {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imageLinkCompany = e.target.result;
      };
      reader.readAsDataURL(this.currentLogo);
      this.imageErrorCompany = false;
    } else {
      this.imageErrorCompany = true;
    }
  }

  editCompanyLogo() {
    if (this.currentLogo !== null && !this.imageErrorCompany) {
      const baseUrl = this.blob.generateBlobUrl(this.ConfigCompany, this.userCompany.Id);
      this.config = {
        baseUrl: baseUrl,
        blockSize: 1024 * 32,
        sasToken: this.ConfigCompany.sas,
        file: this.currentLogo,
        complete: () => {
          const timeStamp = new Date().getTime();
          this.imageLinkCompany = environment.storageUrlCompanyLogo + this.userCompany.Id + `?${timeStamp}`;
          this.toast.show('Logo', 'Uploaded');
          this.saveCompany();
        },
        error: (err) => {
        },
        progress: (percent) => {
          this.percentCompany = percent;
        },
      },
        this.blob.upload(this.config);
    }
  }

  editUserImage() {
    if (this.currentFile !== null && !this.imageError) {
      const baseUrl = this.blob.generateBlobUrl(this.ConfigUser, this.userProfile.Id);
      this.config = {
        baseUrl: baseUrl,
        blockSize: 1024 * 32,
        sasToken: this.ConfigUser.sas,
        file: this.currentFile,
        complete: () => {
          const timeStamp = new Date().getTime();
          this.imageLink = environment.storageUrlUser + this.userProfile.Id + `?${timeStamp}`;
          this.toast.show('Image', 'Uploaded');
          this.saveUser();
        },
        error: (err) => {
        },
        progress: (percent) => {
          this.percent = percent;
        },
      },
        this.blob.upload(this.config);
    }
  }

  deleteImage() {
    this.imageLink = '';
    this.percent = 0;
    this.profileOrgForm.get('imageUser').reset();
  }

  deleteImageCompany() {
    if (this.roleId === 'e306b412-cf09-486f-b336-21dadaddaeed') {
      this.imageLinkCompany = '';
      this.percentCompany = 0;
      this.profileOrgForm.get('imageCompany').reset();
    }
  }

  ngOnDestroy() {
    if ((this.imageLink !== '') && this.profileOrgForm.dirty) {
      window.location.reload();
    }
  }
}
