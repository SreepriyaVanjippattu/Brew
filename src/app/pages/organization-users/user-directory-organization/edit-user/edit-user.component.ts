import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Md5 } from 'ts-md5';
import { NbToastrService } from '@nebular/theme';
import { environment } from '../../../../../environments/environment';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { StatusUse } from '../../../../models/status-id-name';
import { permission } from '../../../../models/rolePermission';
import { DataService } from '../../../../data.service';


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
    this.userProfile = JSON.parse(sessionStorage.getItem('user')).UserProfile;
    this.tenantId = this.userProfile.TenantId;
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
        this.roles = response['body'];
        this.roles = this.roles.filter(element => {
          return (element.Id !== '81db4ad1-863b-4310-a0be-04042d2b30e0' && element.Id !== '2e4606ca-7700-4578-94bd-cda3728d22ac');
        });
      }
    });
  }

  getUserDetails(tenantId, id) {
    this.apiService.getData(this.apiService.getAllActiveUsers, '', '', tenantId).subscribe((response: any) => {
      this.usersData = response['body'];
      this.usersData.forEach(element => {
        if (element.Id === id) {
          this.usersData = element;
          this.tenantId = element.TenantId;
          if (this.page === 'View') {
            this.headerTitle = element.FirstName + ' ' + element.LastName;
          }
          element.Roles.forEach(elementId => {
            this.currentUser = element;
            this.roleId = elementId.Id;
          });
          this.setDataToEdit();
        }
      });
    });
  }

  setDataToEdit() {
    if (this.roleId === '81db4ad1-863b-4310-a0be-04042d2b30e0' || this.roleId === 'e306b412-cf09-486f-b336-21dadaddaeed') {
      this.usersForm.get('roles').setValue(this.roleId);
      this.usersForm.get('roles').disable();
    } else {
      this.usersForm.get('roles').setValue(this.roleId);
    }
    this.usersForm.get('firstName').setValue(this.usersData.FirstName);
    this.usersForm.get('lastName').setValue(this.usersData.LastName);
    this.usersForm.get('userEmail').setValue(this.usersData.EmailAddress);
    this.usersForm.get('userPhone').setValue(this.usersData.PrimaryPhone);
    this.usersForm.get('position').setValue(this.usersData.Position);
  }

  saveUser() {
    this.formSubmitted = true;
    if (this.page === 'edit') {
      this.md5Password = this.usersData.Password;
    } else {
      const md5 = new Md5();
      this.md5Password = md5.appendStr('password@' + this.usersForm.get('firstName').value).end();

    }
    const params = {
      Id: this.id,
      FirstName: this.usersForm.get('firstName').value,
      MiddleName: '',
      LastName: this.usersForm.get('lastName').value,
      EmailAddress: this.usersForm.get('userEmail').value,
      PrimaryPhone: this.usersForm.get('userPhone').value,
      UserName: '',
      Password: this.md5Password,
      IsActive: true,
      Position: this.usersForm.get('position').value,
      CreatedDate: null,
      ModifiedDate: null,
      StatusId: this.Userstatus.active.id,
      TenantId: this.userProfile.TenantId,
      CurrentUser: this.userProfile.Id,
      Roles: [
        {
          Id: this.usersForm.get('roles').value,
        }],
    };
    if (this.usersForm.valid) {

      this.apiService.putData(this.apiService.editUser, params).subscribe((response: any) => {
        if (response.status === 200) {
          this.toastr.show('Success');
          this.router.navigate(['app/user-directory']);
        } error => {
          this.toastr.danger(error.error.message, 'Error!');
        };
      });
    }
  }

  rolePrevilegeClick() {
    this.router.navigate(['app/user-directory/org-previleges']);
  }

  resetpasswordClick() {
    const params = {
      EmailAddress: this.usersForm.get('userEmail').value,
      Url: this.envURL + '/login/forgot-changepassword',
    };
    this.apiService.putData(this.apiService.postEmail, params).subscribe(response => {
      if (response) {
        this.toastr.show('Check your Inbox', 'Mail Sent');
        this.router.navigate(['/app/user-directory']);
      }
    }, error => {
      this.toastr.danger(error.error.Message);
    });
  }

  deleteUser() {
    const anyObject = {
      Id: this.id,
      FirstName: this.usersData.FirstName,
      MiddleName: '',
      LastName: this.usersData.LastName,
      EmailAddress: this.usersData.EmailAddress,
      PrimaryPhone: this.usersData.PrimaryPhone,
      UserName: '',
      Password: this.usersData.Password,
      ImageUrl: '',
      Position: this.usersData.Position,
      IsActive: true,
      TenantId: this.usersData.TenantId,
      Roles: [
        {
          Id: this.usersForm.get('roles').value,
        }],

    };
    const endpoint = this.apiService.deleteUsers;
    const url = new URL(`${environment.API.URL}/${endpoint}`);
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: anyObject,
    };
    this.httpClient.delete(url.toString(), httpOptions)
      .subscribe(response => {
        this.toastr.show('User Deleted', 'Success');
        this.router.navigate(['app/user-directory']);
      },
        (error) => {
          this.toastr.show('Delete User Failed');
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

