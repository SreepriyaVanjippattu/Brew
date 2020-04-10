import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Guid } from 'guid-typescript';
import { NbToastrService } from '@nebular/theme';
import { Md5 } from 'ts-md5';
import { UploadConfig, UploadParams, BlobService } from 'angular-azure-blob-service';
import { environment } from '../../../../../environments/environment';
import { StatusUse } from '../../../../models/status-id-name';
import { String } from 'typescript-string-operations';
@Component({
  selector: 'app-users-form',
  templateUrl: './users-form.component.html',
  styleUrls: ['./users-form.component.scss'],
})
export class UsersFormComponent implements OnInit {
  usersData;
  page: string;
  formSubmitted = false;
  id;
  md5Password: any;
  tenantId: any;
  roleId: string;
  roles;
  validPhone = true;
  validEmail = true;
  config: UploadConfig;
  currentFile: File;
  percent: number;
  Config: UploadParams = {
    sas: environment.sasToken,
    storageAccount: environment.storageAccount,
    containerName: environment.containerNameUser,
  };
  imageError = false;
  imageUrlCreated = false;
  imageLink = '';
  status = StatusUse;
  userDetails: any;
  currentUserId: any;

  constructor(private fb: FormBuilder,
    private router: Router,
    private apiService: ApiProviderService,
    private activatedRoute: ActivatedRoute,
    private toast: NbToastrService,
    private blob: BlobService) { }

  usersForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    userEmail: ['', Validators.required],
    userPhone: ['', Validators.required],
    position: ['', Validators.required],
    role: ['', Validators.required],
    image: [''],
    fileUpload: [''],
    superadmin: [''],
  });
  get form() {
    return this.usersForm.controls;
  }

  ngOnInit() {
    this.userDetails = sessionStorage.user;
    const user = JSON.parse(this.userDetails);
    this.tenantId = user['userDetails'].tenantId;
    this.currentUserId = user['userDetails'].userId;
    this.page = this.activatedRoute.snapshot.url[0].path;
    this.getActiveRoles();
  }

  formatPhone() {
    if (this.usersForm.get('userPhone').errors) {
      this.validPhone = false;
    } else {
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
    this.apiService.getDataList(this.apiService.getAllActiveRoles).subscribe(response => {
      if (response) {
        this.roles = response['body']['roles'];
        this.roles = this.roles.filter(element => {
          return (element.id !== '81db4ad1-863b-4310-a0be-04042d2b30e0' && element.id !== '2e4606ca-7700-4578-94bd-cda3728d22ac' &&
            element.id !== 'e306b412-cf09-486f-b336-21dadaddaeed');
        });
      }
    });
  }

  rolePrevilegeClick() {
    this.router.navigate(['app/user-directory/org-previleges']);
  }

  resetPasswordClick() {
    this.router.navigate(['app/profile-organization/change-password']);
  }
  userFormSubmit() {
    if (this.usersForm.get('image').value) {
      this.postImage();
    }
    this.id = Guid.raw();
    this.formSubmitted = true;
    if (this.page === 'add') {
      const md5 = new Md5();
      this.md5Password = md5.appendStr('password@' + this.usersForm.get('firstName').value).end();
    }
    const params = {
      id: this.id,
      firstName: this.usersForm.get('firstName').value,
      middleName: '',
      lastName: this.usersForm.get('lastName').value,
      emailAddress: this.usersForm.get('userEmail').value,
      phone: this.usersForm.get('userPhone').value,
      userName: 'nyc',
      password: this.md5Password,
      isActive: true,
      imageUrl: this.imageLink,
      position: this.usersForm.get('position').value,
      createdDate: new Date(),
      modifiedDate: '',
      tenantId: this.tenantId,
      statusId: this.status.active.id,
      currentUserId: this.currentUserId,
      roles: [
        {
          id: this.usersForm.get('role').value,
          tenantId: "8ef705b9-6ecd-4edf-83d8-0c16f72009cf",
			    roleId: "B25107AF-B2C7-4319-9D6D-6355C658EC0C",
			    createdDate: new Date(),
			    modifiedDate: new Date()
        }],
    };
    if (this.usersForm.valid) {
      const addUserApi = String.Format(this.apiService.addUser, this.tenantId);
      this.apiService.postData(addUserApi, params).subscribe((response: any) => {
        if (response.status === 200) {
          this.toast.show('Success');
          this.router.navigate(['app/user-directory']);
        }
        error => {
          this.toast.danger(error.error.message);
        };
      });
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
    } else {
      this.imageError = true;
    }
  }

  deleteImage() {
    this.imageLink = '';
    this.usersForm.get('image').reset();
  }

}
