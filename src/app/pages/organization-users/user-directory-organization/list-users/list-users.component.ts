import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { ModalService } from '../../../modal/modal.service';
import { environment } from '../../../../../environments/environment';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { NbToastrService } from '@nebular/theme';
import { apiConfig } from '../../../../../environments/api-config';
import { StatusUse } from '../../../../models/status-id-name';
import * as XLSX from 'xlsx';
import { DataService } from '../../../../data.service';
import { permission } from '../../../../models/rolePermission';
import { String } from 'typescript-string-operations';

@Component({
  selector: 'app-list-users',
  templateUrl: './list-users.component.html',
  styleUrls: ['./list-users.component.scss'],
})
export class ListUsersComponent implements OnInit {
  @ViewChild('TABLE', { static: false }) TABLE: ElementRef;
  title = 'Excel';
  userProfile = JSON.parse(sessionStorage.getItem('user')).UserProfile;
  toggleStatus = false;
  id: string;
  userContent;
  config = {
    itemsPerPage: 5,
    currentPage: 1,
    totalItems: 10,
  };
  next: any;
  previous: any;
  filterData: any;
  page: any;
  jsonValue: any;
  deleteId: Number;
  archivedUserList: any;
  status = StatusUse;
  deleteUserDetails;
  currentUser: any;
  userc: [];
  pageControl;

  permission = permission;
  checkPermission: boolean = false;
  archiveId: any;
  currentUserId: any;
  headerValue: any;
  userDetails: any;
  tenantId: any;
  searchText: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiProviderService,
    private modalservice: ModalService,
    private httpClient: HttpClient,
    private toastrService: NbToastrService,
    private data_service: DataService

  ) { }

  ngOnInit() {
    this.userDetails = sessionStorage.user;
    const user = JSON.parse(this.userDetails);
    this.tenantId = user['userDetails'].tenantId;
    this.currentUserId = user['userDetails'].userId;
    this.page = this.route.snapshot.queryParamMap.get('page');
    if (this.page) {
      this.getuserDetails(this.page, this.config.itemsPerPage, this.tenantId, null);
    } else {
      this.getuserDetails(this.config.currentPage, this.config.itemsPerPage, this.tenantId, null);
    }
  }

  getuserDetails(pageNumber, pageSize, tenantId, searchText) {
    this.router.navigate(['app/user-directory'], {
      queryParams: {
        page: this.config.currentPage,
      },
    });
    const getAllActiveUsersApi = String.Format(this.apiService.getAllActiveUsers,tenantId);
    this.apiService.getDataList(getAllActiveUsersApi, pageNumber, pageSize, null,null, searchText).subscribe(response => {
      this.userContent = response['body']['users'];
      this.headerValue = response['body']['pagingDetails'];
      if (this.headerValue) {
        this.config.totalItems = this.headerValue.totalCount;
        if (this.config.totalItems === 0) {
          this.pageControl = true;
        }
      }
    });
  }

  pageChange(nextPage) {
    this.config.currentPage = nextPage;
    this.getuserDetails(this.config.currentPage, this.config.itemsPerPage, this.tenantId, this.searchText);
    this.router.navigate(['app/user-directory'], { queryParams: { page: nextPage } });
  }
  pageSize(newSize) {
    this.config.itemsPerPage = newSize;
    this.getuserDetails(this.config.currentPage, this.config.itemsPerPage, this.tenantId, null);
  }

  goToArchive() {
    this.router.navigate(['/app/user-directory/archives']);
  }

  newUserClick() {

    const data = this.data_service.checkPermission(this.permission.Add_New_User.Id);
    if (!data) {
      this.toastrService.danger('You don\'t have access', 'Error');
    } else {
      this.router.navigate(['/app/user-directory/add']);
    }

  }

  goToView(id) {
    sessionStorage.setItem('page', 'View');
    this.router.navigate([`/app/user-directory/edit/` + id]);
  }

  goToUsersEdit(id) {
    sessionStorage.setItem('page', 'Edit');
    this.router.navigate([`/app/user-directory/edit/` + id]);
  }

  deleteSingleUser(id) {
    const data = this.data_service.checkPermission(this.permission.Delete_User.Id);
    if (!data) {
      this.toastrService.danger('You don\'t have access', 'Error');
    } else {
      this.checkPermission = true;
      this.deleteId = id;
    }
  }

  deleteUser() {
    this.apiService.deleteData(this.apiService.deleteUser, this.deleteId)
      .subscribe(response => {
        this.toastrService.show('User Deleted', 'Success');
        this.getuserDetails(this.config.currentPage, this.config.itemsPerPage, this.tenantId, null);
      },
        (error) => {
          this.toastrService.danger(error.error.message);
        },
      );
  }

  cancelDelete() {
    this.router.navigate([`/app/user-directory`]);
  }

  searchUser() {
    const getAllusersListApi = String.Format(this.apiService.getAllActiveUsers, this.tenantId);
    this.apiService.getDataList(getAllusersListApi, this.config.currentPage, this.config.itemsPerPage, null, null, this.searchText)
    .subscribe((response) => {
        this.headerValue = response['body']['pagingDetails'];
      if (this.headerValue) {
        this.config.totalItems = this.headerValue.totalCount;
        if (this.config.totalItems === 0) {
          this.pageControl = true;
        }
      }
        if (response && response['body']) {
          this.userContent = response['body']['users'];
          this.userContent.map((user, idx) => {
            if (user !== null) {
              user.name = user.firstName !== null ? user.firstName : '';
              user.userName = user.userName;
              user.phone = user.phone;
            }
          });
        }
      });
  }

  filter(label) {
    if (this.userContent) {
      if (this.toggleStatus === true && label === 'name') {
        this.userContent.sort((a, b) => a.FirstName.toUpperCase() > b.FirstName.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && label === 'name') {
        this.userContent.sort((a, b) => a.FirstName.toUpperCase() < b.FirstName.toUpperCase() ? 1 : -1);
      }
      if (this.toggleStatus === true && label === 'role') {
        this.userContent.sort((a, b) => a.Roles[0].Name.toUpperCase() > b.Roles[0].Name.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && label === 'role') {
        this.userContent.sort((a, b) => a.Roles[0].Name.toUpperCase() < b.Roles[0].Name.toUpperCase() ? 1 : -1);
      }
      if (this.toggleStatus === true && label === 'phone') {
        this.userContent.sort((a, b) => a.PrimaryPhone.toUpperCase() > b.PrimaryPhone.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && label === 'phone') {
        this.userContent.sort((a, b) => a.PrimaryPhone.toUpperCase() < b.PrimaryPhone.toUpperCase() ? 1 : -1);
      }
      if (this.toggleStatus === true && label === 'email') {
        this.userContent.sort((a, b) => a.EmailAddress.toUpperCase() > b.EmailAddress.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && label === 'email') {
        this.userContent.sort((a, b) => a.EmailAddress.toUpperCase() < b.EmailAddress.toUpperCase() ? 1 : -1);
      }
    }
    this.toggleStatus = !this.toggleStatus;
  }

  getArchiveId(archiveId) {
    this.archiveId = archiveId;
  }

  archivedClick() {
    this.userContent.forEach(element => {
      if (element.id === this.archiveId) {
        this.archivedUserList = element;
      }
    });
    const params = {
      id: this.archivedUserList.id,
      firstName: this.archivedUserList.firstName,
      middleName: this.archivedUserList.middleName,
      lastName: this.archivedUserList.lastName,
      emailAddress: this.archivedUserList.emailAddress,
      phone: this.archivedUserList.phone,
      userName: this.archivedUserList.userName,
      password: this.archivedUserList.password,
      isActive: this.archivedUserList.isActive,
      position: this.archivedUserList.position,
      tenantId: this.archivedUserList.tenantId,
      currentUser: this.currentUserId,
      statusId: this.status.archive.id,
      roles: [
        {
          id: this.archivedUserList.roles[0].id,
        },
      ],
    };
    if (this.archivedUserList.roles[0].id !== 'e306b412-cf09-486f-b336-21dadaddaeed') {
      this.editArchivedUser(params);
    } else {
      this.toastrService.danger('Cannot Archive Organization Super User');
    }
  }

  editArchivedUser(params) {
    const editArchivedUser = String.Format(this.apiService.editUser, this.tenantId)
    this.apiService.putData(editArchivedUser, params).subscribe((response: any) => {
      if (response.status === 200) {
        this.toastrService.show('User Archived', 'Success');
        this.goToArchive();
      }
    },
      error => {
        this.toastrService.danger(error.error.message, 'Error');
      });
  }
  ExportTOExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.TABLE.nativeElement);
    ws['!cols'] = [];
    ws['!cols'][4] = { hidden: true };
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'User-Directory.xlsx');

  }

}

