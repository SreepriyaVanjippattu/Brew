import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { NbToastrService } from '@nebular/theme';
import { Guid } from 'guid-typescript';
import { Md5 } from 'ts-md5/dist/md5';
import { JsonPipe } from '@angular/common';
import { PhoneFormatPipe } from '../../../../core/utils/phone-format.pipe';
import { ModalService } from '../../../modal/modal.service';
import {
  HttpClient,
  HttpHeaders,
} from '@angular/common/http';
import { environment } from '../../../../../../src/environments/environment';
import { UtilitiesService } from '../../../../core/utils/utilities.service';
import { UploadConfig, BlobService, UploadParams } from 'angular-azure-blob-service';
import { retryWhen } from 'rxjs/operators';
import { StatusUse } from '../../../../models/status-id-name';


@Component({
  selector: 'app-super-admin-users-form',
  templateUrl: './super-admin-users-form.component.html',
  styleUrls: ['./super-admin-users-form.component.scss'],
})
export class SuperAdminUsersFormComponent implements OnInit {
  pageHeader = '';
  status: any;
  imageLink = '';
  tenantId: any;
  companyList: any;
  userDetailsForm: FormGroup;
  companyDropdown: boolean = false;
  userCompany: any;
  userProfile: string;
  savedUserData: any;
  md5Password: string | Int32Array;
  singleUser;
  roles;
  id;
  formSubmitted = false;
  page: string;
  generateId: string;
  phone = '';
  validPhone = true;
  validEmail = true;
  roleId: any;
  roleName: any;
  idNumber: Number;
  Userstatus = StatusUse;

  config: UploadConfig;
  currentFile: File;
  percent: number;
  Config: UploadParams = {
    sas: environment.sasToken,
    storageAccount: environment.storageAccount,
    containerName: environment.containerNameUser,
  };
  oldRoleId: any;
  currentRoleId: any;
  roleStatus: boolean;
  imageError = false;
  imageUrlCreated = false;
  envURL: string;
  constructor(
    private forms: FormBuilder,
    private apiService: ApiProviderService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: NbToastrService,
    private phonePipe: PhoneFormatPipe,
    private modalservice: ModalService,
    private httpClient: HttpClient,
    private util: UtilitiesService,
    private blob: BlobService) { }

  createForm() {
    this.userDetailsForm = this.forms.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      userName: [''],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(10)]],
      userId: [''],
      roles: ['', Validators.required],
      status: [''],
      image: [''],
      company: ['', Validators.required],
      position: [''],
      password: [''],
    });
  }
  get form() {
    return this.userDetailsForm.controls;
  }

  ngOnInit() {
    this.envURL = environment.API.emailUrl;
    this.getActiveRoles();
    this.getClientsList();
    this.userProfile = sessionStorage.getItem('user');
    const user = JSON.parse(sessionStorage.getItem('user'));
    this.userProfile = user['UserProfile'].Roles[0].Id;
    this.savedUserData = user['CompanyDetails'];

    if (this.userProfile === '81db4ad1-863b-4310-a0be-04042d2b30e0' && this.page !== 'edit') { // checking wt admin or not
      this.companyDropdown = true;
      this.createForm();
    }

    this.page = this.route.snapshot.url[0].path;
    if (this.page === 'edit') {
      this.pageHeader = 'Edit User';
      this.companyDropdown = false;
      this.createForm();
      this.id = this.route.snapshot.url[1].path;
      this.getSingleUserEditPage(this.id);
    } else {
      this.pageHeader = 'Add New User';
      this.id = Guid.raw();
      this.createForm();
    }
    if (sessionStorage.getItem('page') === 'View') {
      this.page = 'View';
      this.pageHeader = 'User Detailed Page';
      this.userDetailsForm.disable();
    }
  }

  formatPhone() {
    if (this.userDetailsForm.get('phone').errors) {
      this.validPhone = false;
    }else {
      this.validPhone = true;
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



  getActiveRoles() {
    this.apiService.getData(this.apiService.getAllActiveRoles).subscribe(response => {
      if (response) {

        const array = [];
        if (this.roleId !== '81db4ad1-863b-4310-a0be-04042d2b30e0') {

          for (let i = 0; i < response['body'].length; i++) {
            const body = response['body'][i];
            if (body['Id'] !== '81db4ad1-863b-4310-a0be-04042d2b30e0') {

              array.push({
                'Name': body['Name'],
                'Id': body['Id'],
              });

              this.roles = array;
            }
          }
        } else {
          this.roles = response['body'];
        }
      }
    });
    // console.log("Roles =====>",this.roles);
  }

  getSingleUserEditPage(id) {
    if (!sessionStorage.usersList || sessionStorage.usersList === '') {
      this.apiService.getData(this.apiService.getAllActiveUsers).subscribe(response => {
        if (response) {
          this.singleUser = response['body'];
          this.singleUser.forEach(element => {
            if (element.Id === id) {
              this.singleUser = element;
              this.tenantId = element.TenantId;
              element.Roles.forEach(elementId => {
                this.roleId = elementId.Id;
                this.oldRoleId = elementId.Id;
              });
            }
          });
          this.setSuperUserEditPage();
        }

      }, error => {
      });
    } else {
      this.singleUser = JSON.parse(sessionStorage.usersList);
          this.singleUser.forEach(element => {
            if (element.Id === id) {
              this.singleUser = element;
              this.tenantId = element.TenantId;
              element.Roles.forEach(elementId => {
                this.roleId = elementId.Id;
                this.oldRoleId = elementId.Id;
              });
            }
          });
          this.setSuperUserEditPage();
    }
  }

  setSuperUserEditPage() {
    this.userDetailsForm.get('firstName').setValue(this.singleUser.FirstName);
    this.userDetailsForm.get('lastName').setValue(this.singleUser.LastName);
    this.userDetailsForm.get('email').setValue(this.singleUser.EmailAddress);
    this.userDetailsForm.get('phone').setValue(this.singleUser.PrimaryPhone);
    this.userDetailsForm.get('userName').setValue(this.singleUser.UserName);
    this.userDetailsForm.get('status').setValue(this.singleUser.status);

    if (this.roleId === '81db4ad1-863b-4310-a0be-04042d2b30e0' || this.roleId === 'e306b412-cf09-486f-b336-21dadaddaeed') {
      this.userDetailsForm.get('roles').setValue(this.roleId);
      this.userDetailsForm.get('roles').disable();
    } else {
      this.userDetailsForm.get('roles').setValue(this.roleId);
    }
    this.userDetailsForm.get('status').setValue(this.singleUser.IsActive);
    this.userDetailsForm.get('position').setValue(this.singleUser.Position);
    // this.userDetailsForm.get('password').setValue(this.singleUser.Password);
    // this.userDetailsForm.get('company').setValue(this.savedUserData.Name);
    this.userDetailsForm.get('company').setValue(this.singleUser.tenantId);
    this.userDetailsForm.get('company').disable();
    this.userDetailsForm.get('company').setValue(this.tenantId);
    this.userDetailsForm.get('company').disable();
    this.userDetailsForm.get('email').disable();
    this.imageLink = this.singleUser.ImageUrl;
  }

  validateAndSaveForm() {
    this.formSubmitted = true;
    if (this.userDetailsForm.valid) {
      if (this.userDetailsForm.get('image').value) {
        this.postImage();
      } else {
        this.saveUser();
      }
    }
  }

  saveUser() {
    if (this.page === 'edit') {
      this.md5Password = this.singleUser.Password;
    } else {
      const md5 = new Md5();
      this.md5Password = md5.appendStr('password@' + this.userDetailsForm.get('firstName').value).end();
    }
    const currentUser = JSON.parse(sessionStorage.getItem('user')).UserProfile.Id;
    const params = {
      Id: this.id,
      FirstName: this.userDetailsForm.get('firstName').value,
      LastName: this.userDetailsForm.get('lastName').value,
      EmailAddress: this.userDetailsForm.get('email').value,
      PrimaryPhone: this.userDetailsForm.get('phone').value,
      UserName: '',
      Password: this.md5Password,
      IsActive: this.userDetailsForm.get('status').value,
      ImageUrl: this.imageLink,
      Position: this.userDetailsForm.get('position').value,
      createdDate: null,
      modifiedDate: null,
      tenantId: this.userDetailsForm.get('company').value,
      CurrentUser: currentUser,
      StatusId: this.Userstatus.active.id,
      Roles: [{
        Id: this.userDetailsForm.get('roles').value,
      }],
    };

    if (this.page === 'edit') {
      this.currentRoleId = params.Roles[0].Id;
      if (this.currentRoleId === this.oldRoleId) {
        this.roleStatus = false;
      }else {
        this.roleStatus = true;
      }
      this.apiService.putData(this.apiService.editUser + '&rolestatus=' + this.roleStatus , params).subscribe(response => {
        if (response) {
          this.toast.success('User Edited', 'Success');
          this.router.navigate(['/app/user-directory-admin']);
        }
      }, error => {
        this.toast.danger(error.error.Message);
      });
    } else {
      this.apiService.postData(this.apiService.addUser, params).subscribe((response: any) => {
        if (response.status === 200) {
          this.toast.success('User Added', 'Success');
          this.router.navigate(['/app/user-directory-admin']);
        }
      }, error => {
        // this.toast.danger(error.error.Message);
      });
    }
  }

  getClientsList() {
    if (!sessionStorage.allActiveClients || sessionStorage.allActiveClients === '') {
      const clientDetails = this.apiService.getDataList(this.apiService.getAllActiveClients).
      subscribe((response) => {
        if (response) {
          this.companyList = response['body'];
          sessionStorage.allActiveClients = JSON.stringify(this.companyList);
        }
      });
    } else {
      this.companyList = JSON.parse(sessionStorage.allActiveClients);
    }
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
      this.imageUrlCreated = true;
      const baseUrl = this.blob.generateBlobUrl(this.Config, this.id);
      this.config = {
        baseUrl: baseUrl,
        blockSize: 1024 * 32,
        sasToken: this.Config.sas,
        file: this.currentFile,
        complete: () => {
          const timeStamp = new Date().getTime();
          this.imageLink = environment.storageUrlUser + this.id + `?${timeStamp}`;
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



  deleteSingleUser() {
    if (this.id) {
      this.modalservice.open(this.id);
    }
  }

  deleteUser(event) {
    let userData = [];
    userData.push(this.singleUser);
    let result = userData.filter(item => item.Id === this.id);
    const anyObject = {
      Id: this.id,
      FirstName: result[0].FirstName,
      LastName: result[0].LastName,
      EmailAddress: result[0].EmailAddress,
      PrimaryPhone: result[0].PrimaryPhone,
      CompanyName: result[0].CompanyName,
      Password: result[0].Password,
      ImageUrl: result[0].ImageUrl,
      Position: result[0].Position,
      IsActive: result[0].IsActive,
      TenantId: result[0].TenantId,
    };
    const endpoint = this.apiService.deleteUser;
    const url = new URL(`${environment.API.URL}/${endpoint}`);

    // const httpOptions = {
    //   headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    //   body: anyObject,

    // };

    // this.apiService.deleteData(url.toString(), httpOptions)
    this.apiService.deleteData(this.apiService.deleteUser,anyObject)
      .subscribe((res) => {
        this.toast.show('User Deleted', 'Success');
        this.router.navigate(['app/user-directory-admin']);
        this.modalservice.close('singleUser.Id');
      }, err => {
        this.toast.danger('Something went wrong!', 'Error');
        this.modalservice.close('singleUser.Id');
      });

  }
  saveSuperAdmin() {
    this.formSubmitted = true;
    this.validateAndSaveForm();
  }

  cancelForm() {
    this.router.navigate(['app/user-directory-admin']);
  }

  resetpasswordClick() {
    const params = {
        EmailAddress: this.userDetailsForm.get('email').value,
        Url: this.envURL + '/login/forgot-changepassword',
    };
    this.apiService.putData(this.apiService.postEmail, params).subscribe(response => {
      if (response) {
        this.toast.show('Check your Inbox', 'Mail Sent');
        this.router.navigate(['/app/user-directory-admin']);
      }
    }, error => {
      this.toast.danger(error.error.Message);
    });
  }

  deleteImage() {
    this.imageLink = '';
    this.userDetailsForm.get('image').reset();
  }

  goToEdit() {
    this.userDetailsForm.enable();
    sessionStorage.page = 'Edit';
    this.page = 'edit';
    this.ngOnInit();
  }
}
