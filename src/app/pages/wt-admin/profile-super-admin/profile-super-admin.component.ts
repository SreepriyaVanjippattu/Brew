  import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { ApiProviderService } from '../../../core/api-services/api-provider.service';
import { NbToastrService } from '@nebular/theme';
import { PhoneFormatPipe } from '../../../core/utils/phone-format.pipe';
import { UploadConfig, UploadParams, BlobService } from 'angular-azure-blob-service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-profile-super-admin',
  templateUrl: './profile-super-admin.component.html',
  styleUrls: ['./profile-super-admin.component.scss'],
})
export class ProfileSuperAdminComponent implements OnInit, OnDestroy {
  imageLink = '';
  userRoleId: any;
  rolesList: any;
  userCompany: any;
  userProfile: any;
  validPhone = true;
  phone = null;
  companynameValue: string;
  validPassword = true;
  validEmail = true;
  success: boolean;
  formSubmitted: boolean = false;
  blur = false;
  SystemSetting: any;

  config: UploadConfig;
  currentFile: File;
  percent: number;
  Config: UploadParams = {
    sas: environment.sasToken,
    storageAccount: environment.storageAccount,
    containerName: environment.containerNameUser,
  };
  imageError = false;

  constructor(
    private router: Router,
    private form: FormBuilder,
    private apiService: ApiProviderService,
    private toast: NbToastrService,
    private phonePipe: PhoneFormatPipe,
    private blob: BlobService,
  ) { }


  profileSuperForm = this.form.group({
    firstName: ['', [Validators.required]],
    lastName: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required]],
    roles: [''],
    image: [''],
  });

  get forms() { return this.profileSuperForm.controls; }

  ngOnInit() {

    this.userProfile = sessionStorage.getItem('user');
    const user = JSON.parse(sessionStorage.getItem('user'));
    this.userProfile = user['UserProfile'];
    this.userCompany = user['CompanyDetails'];
    this.userRoleId = user['UserProfile'].Roles[0].Id;
    this.getActiveRoles();
    this.editUserDetails();
  }

  editUserDetails() {
    this.setUserEditDetails();
  }

  getActiveRoles() {
    this.apiService.getData(this.apiService.getAllActiveRoles).subscribe(response => {
      if (response) {
        this.rolesList = response['body'];
        // var arr = response['body'];
        // this.rolesList =  arr.slice(1);
      }
    });
  }

  setUserEditDetails() {
    if (this.userRoleId === '81db4ad1-863b-4310-a0be-04042d2b30e0') {
      this.profileSuperForm.get('roles').disable();
    }
    this.profileSuperForm.get('firstName').setValue(this.userProfile.FirstName);
    this.profileSuperForm.get('lastName').setValue(this.userProfile.LastName);
    this.profileSuperForm.get('email').setValue(this.userProfile.EmailAddress);
    this.profileSuperForm.get('phone').setValue(this.userProfile.PrimaryPhone);
    this.profileSuperForm.get('roles').setValue(this.userRoleId);
    this.imageLink = this.userProfile.ImageUrl;
  }

  emailvalidation(email) {
    // tslint:disable-next-line: prefer-const
    let emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    if (!emailReg.test(email)) {
      this.validEmail = false;
    } else {
      this.validEmail = true;
    }

  }

  test() {
  }

  formatPhone() {
    if (this.profileSuperForm.get('phone').errors) {
      this.validPhone = false;
    }else {
      this.validPhone = true;
    }
  }

  saveSuperAdmin() {
    this.formSubmitted = true;
    if (this.profileSuperForm.valid) {
      if (this.profileSuperForm.get('image').value) {
        this.postImage();
      }else {
        this.saveAdminProfile();
      }
    }
  }

  saveAdminProfile() {
    const params = {
      Id: this.userProfile.Id,
      FirstName: this.profileSuperForm.get('firstName').value,
      LastName: this.profileSuperForm.get('lastName').value,
      EmailAddress: this.profileSuperForm.get('email').value,
      PrimaryPhone: this.profileSuperForm.get('phone').value,
      Password: this.userProfile.Password,
      IsActive: this.userProfile.IsActive,
      ImageUrl: this.imageLink,
      Position: this.userProfile.Position,
      CreatedDate:  this.userProfile.CreatedDate,
      ModifiedDate:  this.userProfile.ModifiedDate,
      TenantId: this.userProfile.TenantId,
      CurrentUser: this.userProfile.Id,
      StatusId: this.userCompany.OrgSuperUser.StatusId,
      Roles: [
        {
          Id: this.profileSuperForm.get('roles').value,
        },
      ],
    };
    this.apiService.putData(this.apiService.editUser, params).subscribe(response => {
      if (response) {
         this.toast.success('Edited Successfully!', 'Profile');
         this.updateSession();
      }
    }, error => {
      this.toast.danger(error.error.Message);
    });
  }

updateSession() {
  this.userProfile = sessionStorage.getItem('user');
  const updateUser = JSON.parse(sessionStorage.getItem('user'));
  this.userProfile = updateUser['UserProfile'];
  this.userCompany = updateUser['CompanyDetails'];
  this.SystemSetting = updateUser['SystemSettings'];

    const  updateValue = [];
    const userProfileValue = {
      CompanyName: this.userProfile.CompanyName,
      EmailAddress: this.userProfile.EmailAddress,
      FirstName: this.profileSuperForm.get('firstName').value,
      Id: this.userProfile.Id ,
      ImageUrl:  this.imageLink,
      IsActive: this.userProfile.IsActive,
      LastName: this.profileSuperForm.get('lastName').value,
      Password: this.userProfile.Password,
      Position: this.userProfile.Position,
      PrimaryPhone: this.profileSuperForm.get('phone').value,
      Roles: updateUser['UserProfile'].Roles,
      CreatedDate:  this.userProfile.CreatedDate,
      ModifiedDate:  this.userProfile.ModifiedDate,
      TenantId: this.userProfile.TenantId,
      UserName: this.userProfile.UserName,
    };
    updateValue.push({
    UserProfile: userProfileValue,
    CompanyDetails: this.userCompany,
    SystemSettings: this.SystemSetting,
  });
  sessionStorage.UpdatedProfile =  JSON.stringify(updateValue);
  const UpdatedProfile = JSON.parse(sessionStorage.getItem('UpdatedProfile'));
  sessionStorage.user = JSON.stringify(UpdatedProfile[0]);
}
  resetpasswordClick() {
    this.router.navigate(['/app/profile-wt-admin/profile/change-password/' + this.userProfile.Id]);

  }

  imageUploadChange(event) {
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
        }else {
          this.imageError = true;
        }
  }

  postImage() {
    if (this.currentFile !== null && !this.imageError) {
      const baseUrl = this.blob.generateBlobUrl(this.Config, this.userProfile.Id);
      this.config = {
        baseUrl: baseUrl,
        blockSize: 1024 * 32,
        sasToken: this.Config.sas,
        file: this.currentFile,
        complete: () => {
          const timeStamp = new Date().getTime();
          this.imageLink = environment.storageUrlUser + this.userProfile.Id + `?${timeStamp}`;
          this.toast.show('Image', 'Uploaded');
          this.saveAdminProfile();
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
    this.profileSuperForm.get('image').reset();
  }


  cancelClick() {
    this.router.navigate(['/app/clients']);
  }

  ngOnDestroy() {
    if (this.profileSuperForm.dirty && this.imageLink !== '') {
      window.location.reload();
    }
  }
}
