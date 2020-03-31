import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { Router } from '@angular/router';
import { StatusUse } from '../../../../models/status-id-name';
import { NbToastrService } from '@nebular/theme';
import { ModalService } from '../../../modal';
import { environment } from '../../../../../environments/environment';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { DataService } from '../../../../data.service';
import { permission } from '../../../../models/rolePermission';

@Component({
  selector: 'app-archived-users',
  templateUrl: './archived-users.component.html',
  styleUrls: ['./archived-users.component.scss'],
})
export class ArchivedUsersComponent implements OnInit {
  @ViewChild('TABLE', { static: false }) TABLE: ElementRef;
  title = 'Excel';
  userProfile = JSON.parse(sessionStorage.getItem('user')).UserProfile;
  config = {
    itemsPerPage: 5,
    currentPage: 1,
    totalItems: 10,
  };
  previous = 'Previous';
  next = 'Next';
  archieveContent;
  statusId;
  currentUser: any;
  userToRestore: any;
  status = StatusUse;
  deleteArchivedUser: Number;
  jsonValue: any;
  statusName: string;
  deleteId: any;
  deleteUserDetails: any;
  pageControl;
  toggleStatus = false;

  permission = permission;
  checkPermission: boolean = false;
  currentUserId: any;
  headerValue: any;

  constructor(
    private apiService: ApiProviderService,
    private router: Router,
    private toastrService: NbToastrService,
    private modalservice: ModalService,
    private httpClient: HttpClient,
    private data: DataService

  ) { }

  ngOnInit() {
    this.currentUser = this.userProfile.TenantId;
    this.currentUserId = this.userProfile.Id;
    this.getArchivedUserDetails(this.config.currentPage, this.config.itemsPerPage, this.currentUser);
  }

  getArchivedUserDetails(pageNumber, pageSize, currentUser) {
    this.router.navigate(['app/user-directory/archives'], {
      queryParams: {
        page: this.config.currentPage,
      },
    });
    this.apiService.getData(this.apiService.getAllArchivedUsers, pageNumber, pageSize, currentUser).subscribe(response => {
      this.archieveContent = response['body'];
      this.archieveContent.forEach(element => {
        if (element.StatusId === StatusUse.archive.id) {
          this.statusName = StatusUse.archive.name;
        }
      });
      this.jsonValue = JSON.parse(response.headers.get('paging-headers'));
      if (this.jsonValue) {
        this.config.totalItems = this.jsonValue.TotalCount;
        if (this.config.totalItems === 0) {
          this.pageControl = true;
        }
      }
    });

  }

  restoreArchive(id) {
    const data = this.data.checkPermission(this.permission.Reinstate_User.Id);
    if (!data) {
      this.toastrService.danger('You don\'t have access', 'Error');
    } else {

      this.archieveContent.forEach(element => {
        if (id === element.Id) {
          this.userToRestore = element;
        }
      });
      const params = {
        Id: id,
        FirstName: this.userToRestore.FirstName,
        MiddleName: this.userToRestore.MiddleName,
        LastName: this.userToRestore.LastName,
        EmailAddress: this.userToRestore.EmailAddress,
        PrimaryPhone: this.userToRestore.PrimaryPhone,
        UserName: this.userToRestore.userName,
        Password: this.userToRestore.Password,
        IsActive: this.userToRestore.IsActive,
        Position: this.userToRestore.Position,
        TenantId: this.userToRestore.TenantId,
        CurrentUser: this.currentUserId,
        StatusId: this.status.active.id,
        Roles: [
          {
            Id: this.userToRestore.Roles[0].Id,
            Name: this.userToRestore.Roles[0].Name,
          },
        ],
      };

      this.restoreClient(params);
    }
  }

  restoreClient(params) {
    this.apiService.putData(this.apiService.editUser, params).subscribe((response: any) => {
      if (response.status === 200) {
        this.toastrService.show('User Restored', 'Success');
        this.router.navigate(['app/user-directory']);
      }
    },
      error => {
        this.toastrService.danger(error.error.Message, 'Error');
      });
  }

  searchClient(event) {
    const search = event.target.value;
    this.apiService.getData(this.apiService.getAllArchivedUsers + `&startwith=${search}`, this.config.currentPage, this.config.itemsPerPage,
      this.currentUser).subscribe((response) => {
        const myHeaders = response.headers;
        this.headerValue = JSON.parse(response.headers.get('paging-headers'));
        if (this.headerValue) {
          this.config.totalItems = this.headerValue.TotalCount;
        }
        if (response && response['body']) {
          this.archieveContent = response['body'];
        }
      });
  }

  pageChange(nextPage) {
    this.config.currentPage = nextPage;
    this.getArchivedUserDetails(this.config.currentPage, this.config.itemsPerPage, this.currentUser);
    this.router.navigate(['app/user-directory/archives'], { queryParams: { page: nextPage } });
  }

  pageSize(newSize) {
    this.config.itemsPerPage = newSize;
    this.getArchivedUserDetails(this.config.currentPage, this.config.itemsPerPage, this.currentUser);
  }

  deleteSingleUser(id, item) {
    this.deleteId = id;
    this.deleteUserDetails = item;
  }

  deleteUser() {
    const anyObject = {
      Id: this.deleteId,
      FirstName: this.deleteUserDetails.FirstName,
      LastName: this.deleteUserDetails.LastName,
      EmailAddress: this.deleteUserDetails.EmailAddress,
      PrimaryPhone: this.deleteUserDetails.PrimaryPhone,
      Password: this.deleteUserDetails.Password,
      ImageUrl: '',
      Position: this.deleteUserDetails.Position,
      IsActive: true,
      TenantId: this.deleteUserDetails.TenantId,
      CurrentUser: this.deleteUserDetails.CurrentUser,
      StatusId: this.status.deleted.id,
      Roles: [
        {
          Id: this.deleteUserDetails.Roles[0].Id,
          Name: this.deleteUserDetails.Roles[0].Name,
        },
      ],

    };
    const endpoint = this.apiService.deleteUsers;
    const url = new URL(`${environment.API.URL}/${endpoint}`);
    const httpOptions = {
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
      body: anyObject,
    };
    this.httpClient.delete(url.toString(), httpOptions)
      .subscribe(response => {
        this.toastrService.show('User Deleted', 'Success');
        this.getArchivedUserDetails(this.config.currentPage, this.config.itemsPerPage, this.currentUser);
      },
        (error) => {
          this.toastrService.danger(error.error.Message);
        },
      );
  }
  ExportTOExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.TABLE.nativeElement);
    ws['!cols'] = [];
    ws['!cols'][4] = { hidden: true };
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'Archived-User.xlsx');

  }

  filter(label) {
    if (this.archieveContent) {
      if (this.toggleStatus === true && label === 'name') {
        this.archieveContent.sort((a, b) => a.FirstName.toUpperCase() > b.FirstName.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && label === 'name') {
        this.archieveContent.sort((a, b) => a.FirstName.toUpperCase() < b.FirstName.toUpperCase() ? 1 : -1);
      }
      if (this.toggleStatus === true && label === 'phone') {
        this.archieveContent.sort((a, b) => a.PrimaryPhone.toUpperCase() > b.PrimaryPhone.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && label === 'phone') {
        this.archieveContent.sort((a, b) => a.PrimaryPhone.toUpperCase() < b.PrimaryPhone.toUpperCase() ? 1 : -1);
      }
      if (this.toggleStatus === true && label === 'email') {
        this.archieveContent.sort((a, b) => a.EmailAddress.toUpperCase() > b.EmailAddress.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && label === 'email') {
        this.archieveContent.sort((a, b) => a.EmailAddress.toUpperCase() < b.EmailAddress.toUpperCase() ? 1 : -1);
      }
    }
    this.toggleStatus = !this.toggleStatus;
  }
}
