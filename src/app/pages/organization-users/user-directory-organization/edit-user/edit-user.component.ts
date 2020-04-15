import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Md5 } from 'ts-md5';
import { NbToastrService } from '@nebular/theme';
import { environment } from '../../../../../environments/environment';
import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { StatusUse } from '../../../../models/status-id-name';
import { permission } from '../../../../models/rolePermission';
import { DataService } from '../../../../data.service';
import { String } from 'typescript-string-operations';

@Component({
  selector: 'app-users-form',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss'],
})

export class EditUserComponent implements OnInit {

  usersData;
  page: string;
  id: any;
  roleId: any;
  roles: any[];
  formSubmitted = false;
  md5Password: any;
  currentUser: any;
  validEmail = true;
  validPhone = true;
  isButtonVisible = true;
  tenantId;
  userProfile;
  Userstatus = StatusUse;
  headerTitle: string;
  currentUserFirstname: any;
  permission = permission;
  checkPermission: boolean = false;
  envURL: string;
  userDetails: any;
  currentUserId: any;
  imageLink: any = '';

  constructor(private fb: FormBuilder,
    private router: Router,
    private apiService: ApiProviderService,
    private data: DataService,
    private activatedRoute: ActivatedRoute,
    private toastr: NbToastrService,
    private httpClient: HttpClient) { }

  usersForm = this.fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    userEmail: ['', Validators.required],
    userPhone: ['', Validators.required],
    position: ['', Validators.required],
    superadmin: [''],
    roles: ['', Validators.required],
  });

  ngOnInit() {

    this.envURL = environment.API.emailUrl;
    this.roleChangeAccess();
    this.userDetails = sessionStorage.user;
    const user = JSON.parse(this.userDetails);
    this.tenantId = user['userDetails'].tenantId;
    this.currentUserId = user['userDetails'].userId;
    this.page = this.activatedRoute.snapshot.url[0].path;
    this.id = this.activatedRoute.snapshot.url[1].path;

    if (this.page === 'edit') {
      this.isButtonVisible = true;
      this.getUserDetails(this.tenantId, this.id);
      this.getActiveRoles();
      this.headerTitle = 'Edit User';
    }
    if (sessionStorage.getItem('page') === 'View') {
      this.isButtonVisible = false;
      this.page = 'View';
      this.usersForm.disable();
      this.getUserDetails(this.tenantId, this.id);
    }
  }

  get form() {
    return this.usersForm.controls;
  }

  goToEdit() {
    this.usersForm.enable();
    sessionStorage.page = 'Edit';
    this.page = 'edit';
    this.ngOnInit();
  }

  emailvalidation(email) {
    const emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    if (!emailReg.test(email)) {
      this.validEmail = false;
    } else {
      this.validEmail = true;
    }
  }

  formatPhone() {
    if (this.usersForm.get('userPhone').errors) {
      this.validPhone = false;
    } else {
      this.validPhone = true;
    }
  }

  getActiveRoles() {

    this.apiService.getData(this.apiService.getAllActiveRoles).subscribe(response => {
      if (response) {
        this.roles = response['body']['roles'];
        this.roles = this.roles.filter(element => {
          return (element.id !== '81db4ad1-863b-4310-a0be-04042d2b30e0' && element.id !== '2e4606ca-7700-4578-94bd-cda3728d22ac');
        });
      }
    });
  }

  getUserDetails(tenantId, id) {

    const getUserbyIdApi = String.Format(this.apiService.getUserById, tenantId, id);
    this.apiService.getDataList(getUserbyIdApi, 1, 1, null, null, null).subscribe(response => {

      this.usersData = response['body']['users'];
      if (this.usersData.roles) {
        this.usersData.roles.forEach(elementId => {
                this.currentUser = this.usersData;
                this.roleId = elementId.id;
              });
            }
      if (this.page === 'View') {
        this.headerTitle = this.usersData.firstName + ' ' + this.usersData.lastName;
      }
      this.setDataToEdit();
    });
  }

  setDataToEdit() {

    if (this.roleId === '81db4ad1-863b-4310-a0be-04042d2b30e0' || this.roleId === 'e306b412-cf09-486f-b336-21dadaddaeed') {
      this.usersForm.get('roles').setValue(this.roleId);
      this.usersForm.get('roles').disable();
    } else {
      this.usersForm.get('roles').setValue(this.roleId);
    }
    this.usersForm.get('firstName').setValue(this.usersData.firstName);
    this.usersForm.get('lastName').setValue(this.usersData.lastName);
    this.usersForm.get('userEmail').setValue(this.usersData.emailAddress);
    this.usersForm.get('userPhone').setValue(this.usersData.phone);
    this.usersForm.get('position').setValue(this.usersData.position);
  }

  saveUser() {

    this.formSubmitted = true;
    if (this.page === 'edit') {
      this.md5Password = this.usersData.password;
    } else {
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
      userName: this.usersForm.get('userEmail').value,
      password: this.md5Password,
      isActive: true,
      imageUrl: this.imageLink,
      position: this.usersForm.get('position').value,
      createdDate: new Date(),
      modifiedDate: null,
      statusId: this.Userstatus.active.id,
      tenantId: this.tenantId,
      roles: [
        {
          id: this.usersForm.get('roles').value,

        }],
    };

    if (this.usersForm.valid) {

      const edituserApi = String.Format(this.apiService.editUser, this.tenantId);
      this.apiService.putData(edituserApi, params).subscribe((response: any) => {

        if (response.status === 200) {
          this.toastr.show('Success');
          this.router.navigate(['app/user-directory']);
        }
      }, error => {
        if (error instanceof HttpErrorResponse) {
          this.toastr.danger('', error.error.message);
        }
        else {
          this.toastr.danger('', error);
        }
      }
      );
    }
  }

  rolePrevilegeClick() {
    this.router.navigate(['app/user-directory/org-previleges']);
  }

  resetpasswordClick() {

    const params = {
      emailAddress: this.usersForm.get('userEmail').value,
      url: this.envURL + '/login/forgot-changepassword',
    };
    const postEmailApi = String.Format(this.apiService.postEmail, this.tenantId)
    this.apiService.postData(postEmailApi, params).subscribe(response => {
      if (response) {
        this.toastr.show('Check your Inbox', 'Mail Sent');
        this.router.navigate(['/app/user-directory']);
      }
    }, error => {
      this.toastr.danger('', error.error.message);
    });
  }

  deleteUser() {

    const deleteUserApi = String.Format(this.apiService.deleteUser, this.tenantId, this.id)
    this.apiService.deleteData(deleteUserApi)
      .subscribe(response => {

        this.toastr.show('User Deleted', 'Success');
        this.router.navigate(['app/user-directory']);
      },
        (error) => {
          this.toastr.show('', 'Delete User Failed');
        },
      );
  }

  cancelDelete() {
    this.router.navigate([`/app/user-directory/edit/` + this.id]);
  }

  roleChangeAccess() {
    const data = this.data.checkPermission(this.permission.Change_User_Privilege.Id);
    if (!data) {
      this.toastr.danger('You don\'t have access to change role', 'Error');
    } else {
      this.checkPermission = true;
    }
  }
}

