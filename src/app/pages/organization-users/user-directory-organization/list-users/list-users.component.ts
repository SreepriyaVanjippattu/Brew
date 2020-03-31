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
    this.currentUser = this.userProfile.TenantId;
    this.currentUserId = this.userProfile.Id;
    this.page = this.route.snapshot.queryParamMap.get('page');
    if (this.page) {
      this.getuserDetails(this.page, this.config.itemsPerPage, this.currentUser);
    } else {
      this.getuserDetails(this.config.currentPage, this.config.itemsPerPage, this.currentUser);
    }
  }

  getuserDetails(pageNumber, pageSize, currentUser) {
    this.router.navigate(['app/user-directory'], {
      queryParams: {
        page: this.config.currentPage,
      },
    });
    this.apiService.getData(this.apiService.getAllActiveUsers, pageNumber, pageSize, currentUser).subscribe(response => {
      this.userContent = response['body'];
      this.jsonValue = JSON.parse(response.headers.get('paging-headers'));
      if (this.jsonValue) {
        this.config.totalItems = this.jsonValue.TotalCount;
        if (this.config.totalItems === 0) {
          this.pageControl = true;
        }
      }
    });
  }

  pageChange(nextPage) {
    this.config.currentPage = nextPage;
    this.getuserDetails(this.config.currentPage, this.config.itemsPerPage, this.currentUser);
    this.router.navigate(['app/user-directory'], { queryParams: { page: nextPage } });
  }
  pageSize(newSize) {
    this.config.itemsPerPage = newSize;
    this.getuserDetails(this.config.currentPage, this.config.itemsPerPage, this.currentUser);
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

  deleteSingleUser(id, item) {
    const data = this.data_service.checkPermission(this.permission.Delete_User.Id);
    if (!data) {
      this.toastrService.danger('You don\'t have access', 'Error');
    } else {
      this.checkPermission = true;
      this.deleteId = id;
      this.deleteUserDetails = item;
    }
  }

  deleteUser() {
    const anyObject = {
      Id: this.deleteId,
      FirstName: this.deleteUserDetails.FirstName,
      LastName: this.deleteUserDetails.LastName,
      EmailAddress: this.deleteUserDetails.EmailAddress,
      PrimaryPhone: this.deleteUserDetails.PrimaryPhone,
      CompanyName: this.deleteUserDetails.CompanyName,
      Password: this.deleteUserDetails.Password,
      ImageUrl: '',
      Position: this.deleteUserDetails.Position,
      IsActive: true,
      TenantId: this.deleteUserDetails.TenantId,

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
        this.getuserDetails(this.config.currentPage, this.config.itemsPerPage, this.currentUser);
      },
        (error) => {
          this.toastrService.danger(error.error.Message);
        },
      );
  }

  cancelDelete() {
    this.router.navigate([`/app/user-directory`]);
  }

  searchUser(event) {
    const search = event.target.value;
    this.apiService.getData(this.apiService.getAllActiveUsers + `&startwith=${search}`,
      this.config.currentPage, this.config.itemsPerPage, this.currentUser).subscribe((response) => {
        const myHeaders = response.headers;
        this.headerValue = JSON.parse(response.headers.get('paging-headers'));
        if (this.headerValue) {
          this.config.totalItems = this.headerValue.TotalCount;
        }
        if (response && response['body']) {
          this.userContent = response['body'];
          this.userContent.map((user, idx) => {
            if (user !== null) {
              user.Name = user.FirstName !== null ? user.FirstName : '';
              user.UserName = user.UserName;
              user.PrimaryPhone = user.PrimaryPhone;
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
      if (element.Id === this.archiveId) {
        this.archivedUserList = element;
      }
    });
    const params = {
      Id: this.archivedUserList.Id,
      FirstName: this.archivedUserList.FirstName,
      MiddleName: this.archivedUserList.MiddleName,
      LastName: this.archivedUserList.LastName,
      EmailAddress: this.archivedUserList.EmailAddress,
      PrimaryPhone: this.archivedUserList.PrimaryPhone,
      UserName: this.archivedUserList.userName,
      Password: this.archivedUserList.Password,
      IsActive: this.archivedUserList.IsActive,
      Position: this.archivedUserList.Position,
      TenantId: this.archivedUserList.TenantId,
      CurrentUser: this.currentUserId,
      StatusId: this.status.archive.id,
      Roles: [
        {
          Id: this.archivedUserList.Roles[0].Id,
          Name: this.archivedUserList.Roles[0].Name,
        },
      ],
    };
    if (this.archivedUserList.Roles[0].Id !== 'e306b412-cf09-486f-b336-21dadaddaeed') {
      this.editArchivedUser(params);
    } else {
      this.toastrService.danger('Cannot Archive Organization Super User');
    }
  }

  editArchivedUser(params) {
    this.apiService.putData(this.apiService.editUser, params).subscribe((response: any) => {
      if (response.status === 200) {
        this.toastrService.show('User Archived', 'Success');
        this.goToArchive();
      }
    },
      error => {
        this.toastrService.danger(error.error.Message, 'Error');
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

