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
import { String } from 'typescript-string-operations';

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
  userDetails: any;
  tenantId: any;
  searchText: any;

  constructor(
    private apiService: ApiProviderService,
    private router: Router,
    private toastrService: NbToastrService,
    private modalservice: ModalService,
    private httpClient: HttpClient,
    private data: DataService

  ) { }

  ngOnInit() {
    this.userDetails = sessionStorage.user;
    const user = JSON.parse(this.userDetails);
    this.tenantId = user['userDetails'].tenantId;
    this.currentUserId = user['userDetails'].userId;
    this.getArchivedUserDetails(this.config.currentPage, this.config.itemsPerPage, this.tenantId,'');
  }

  getArchivedUserDetails(pageNumber, pageSize, tenantId, searchText) {
    this.router.navigate(['app/user-directory/archives'], {
      queryParams: {
        page: this.config.currentPage,
      },
    });
    const getAllArchivedUsersApi = String.Format(this.apiService.getAllArchivedUsers, tenantId)
    this.apiService.getDataList(getAllArchivedUsersApi, pageNumber, pageSize, null, null, searchText).subscribe(response => {
      this.archieveContent = response['body']['users'];
      this.archieveContent.forEach(element => {
        if (element.statusId === StatusUse.archive.id) {
          this.statusName = StatusUse.archive.name;
        }
      });
      this.headerValue = response['body']['pagingDetails'];
      if (this.headerValue) {
        this.config.totalItems = this.headerValue.totalCount;
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
        if (id === element.id) {
          this.userToRestore = element;
        }
      });
      if (this.userToRestore.roles[0].id) {
        var params = {
          id: this.userToRestore.id,
          firstName: this.userToRestore.firstName,
          middleName: this.userToRestore.middleName,
          lastName: this.userToRestore.lastName,
          emailAddress: this.userToRestore.emailAddress,
          phone: this.userToRestore.phone,
          userName: this.userToRestore.userName,
          password: this.userToRestore.password,
          isActive: this.userToRestore.isActive,
          imageUrl: '',
          position: this.userToRestore.position,
          tenantId: this.userToRestore.tenantId,
          statusId: this.status.active.id,
          roles: [
            {
              id: this.userToRestore.roles[0].id,
            },
          ],
        };
      }

      this.restoreClient(params);
    }
  }

  restoreClient(params) {
    const restoreUserApi = String.Format(this.apiService.editUser, this.tenantId)
    this.apiService.putData(restoreUserApi, params).subscribe((response: any) => {
      if (response.status === 200) {
        this.toastrService.show('User Restored', 'Success');
        this.router.navigate(['app/user-directory']);
      }
    },
      error => {
        this.toastrService.danger(error.error.message, 'Error');
      });
  }

  searchClient() {
    const getAllusersListApi = String.Format(this.apiService.getAllArchivedUsers, this.tenantId);
    this.apiService.getDataList(getAllusersListApi, this.config.currentPage, this.config.itemsPerPage, null, null, this.searchText)
      .subscribe((response) => {
        this.headerValue = response['body']['pagingDetails'];
        if (this.headerValue) {
          this.config.totalItems = this.headerValue.totalCount;
          if (this.config.totalItems === 0) {
            this.pageControl = true;
          }
          else {
            this.pageControl = false;
          }
        }
        if (response && response['body']) {
          this.archieveContent = response['body']['users'];
        }
      });
  }

  pageChange(nextPage) {
    this.config.currentPage = nextPage;
    this.getArchivedUserDetails(this.config.currentPage, this.config.itemsPerPage, this.tenantId, this.searchText);
    this.router.navigate(['app/user-directory/archives'], { queryParams: { page: nextPage } });
  }

  pageSize(newSize) {
    this.config.itemsPerPage = newSize;
    this.getArchivedUserDetails(this.config.currentPage, this.config.itemsPerPage, this.tenantId, '');
  }

  deleteSingleUser(id, item) {
    this.deleteId = id;
    this.deleteUserDetails = item;
  }

  deleteUser() {
    const deleteUserApi = String.Format(this.apiService.deleteUser, this.tenantId, this.deleteId)
    this.apiService.deleteData(this.apiService.deleteUser)
      .subscribe(response => {
        this.toastrService.show('User Deleted', 'Success');
        this.getArchivedUserDetails(this.config.currentPage, this.config.itemsPerPage, this.tenantId, '');
      },
        (error) => {
          this.toastrService.danger(error.error.message);
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
