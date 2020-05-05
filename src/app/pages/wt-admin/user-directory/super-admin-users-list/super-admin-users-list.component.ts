import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import {
  HttpClient,
} from '@angular/common/http';
import { environment } from '../../../../../../src/environments/environment';
import { NbToastrService } from '@nebular/theme';
import { ModalService } from '../../../modal/modal.service';
import { UtilitiesService } from '../../../../core/utils/utilities.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-super-admin-users-list',
  templateUrl: './super-admin-users-list.component.html',
  styleUrls: ['./super-admin-users-list.component.scss'],
})
export class SuperAdminUsersListComponent implements OnInit {

  @ViewChild('TABLE', { static: false }) TABLE: ElementRef;
  title = 'Excel';

  idNumber: Number;
  userDetails: any;
  toggleStatus: Boolean;
  page: string;
  currentPageNumber: Number;
  jsonValue: any;
  next;
  previous;
  config = {
    currentPage: 1,
    itemsPerPage: 5,
    totalItems: 20,
  };
  getTenantContent;
  currentStatus: Number;
  tenantList: any[] = [];
  headerValue: any;
  searchList: any;
  pageControl;

  constructor(
    private apiService: ApiProviderService,
    private router: Router,
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private toastrService: NbToastrService,
    private modalservice: ModalService,
    private util: UtilitiesService,
    private modalService: NgbModal,
  ) { }

  ngOnInit() {
    this.currentPageNumber = this.config.currentPage;
    this.page = this.route.snapshot.queryParamMap.get('page');
    if (this.page) {
      this.getUserDirectoryDetails(this.page, this.config.itemsPerPage);
    } else {
      this.getAllTenantStatus();
      this.getUserDirectoryDetails(this.config.currentPage, this.config.itemsPerPage);
    }
  }

  getAllTenantStatus() {
    const getAllTenant = this.apiService.getData(this.apiService.getAllTenantContent).subscribe((response) => {
      this.getTenantContent = response['body'];
      if (this.getTenantContent) {
        this.getTenantContent.map(tenant => {
          this.tenantList.push({
            'name': tenant.Name,
            'id': tenant.Id,
          });
        });
      }
    });
  }

  getUserDirectoryDetails(pageNumber, pageSize) {
    this.router.navigate(['app/user-directory-admin'], {
      queryParams: {
        page: this.config.currentPage,
      },
    });
    const clientDetails = this.apiService.getData(this.apiService.getAllActiveUsers, pageNumber, pageSize).
      subscribe((response) => {
        if (response && response['body']) {
          this.userDetails = response['body'];
          sessionStorage.usersList = JSON.stringify(this.userDetails);
          this.jsonValue = JSON.parse(response.headers.get('paging-headers'));
          if (this.jsonValue) {
            this.config.totalItems = this.jsonValue.TotalCount;
            if (this.config.totalItems === 0) {
              this.pageControl = true;
            }
          }
        }
      });
    this.route.queryParamMap
      .map(params => params.get('page'))
      .subscribe((page: any) => {
        return this.config.currentPage = page;
      });
  }

  pageSize(newSize) {
    this.config.itemsPerPage = newSize;
    this.getUserDirectoryDetails(this.config.currentPage, this.config.itemsPerPage);
  }

  pageChange(nextPage) {
    this.config.currentPage = nextPage;
    this.getUserDirectoryDetails(this.config.currentPage, this.config.itemsPerPage);
    this.router.navigate(['app/user-directory-admin'], { queryParams: { page: nextPage } });
  }

  goToSingleUser(user) {
    sessionStorage.setItem('page', 'Edit');
    this.router.navigate(['app/user-directory-admin/edit/' + user.Id]);
  }

  gotoView(user) {
    sessionStorage.setItem('page', 'View');
    this.router.navigate(['app/user-directory-admin/edit/' + user.Id]);
  }

  newUserClick() {
    sessionStorage.page = 'Add';
    this.router.navigate(['app/user-directory-admin/add']);
  }

  deleteSingleUser(id: Number) {
    this.idNumber = id;
    if (id) {
      this.modalservice.open('singleUser.Id');
    }
  }

  filter(label) {
    if (this.userDetails) {
      if (this.toggleStatus === true && label === 'name') {
        this.userDetails.sort((a, b) => a.FirstName.toUpperCase() > b.FirstName.toUpperCase() ? 1 : -1);
      }
      else if (this.toggleStatus === false && label === 'name') {
        this.userDetails.sort((a, b) => a.FirstName.toUpperCase() < b.FirstName.toUpperCase() ? 1 : -1);
      }
      if (this.toggleStatus === true && label === 'company') {
        this.userDetails.sort((a, b) => a.CompanyName.toUpperCase() > b.CompanyName.toUpperCase() ? 1 : -1);
      }
      else if (this.toggleStatus === false && label === 'company') {
        this.userDetails.sort((a, b) => a.CompanyName.toUpperCase() < b.CompanyName.toUpperCase() ? 1 : -1);
      }
      if (this.toggleStatus === true && label === 'role') {
        this.userDetails.sort((a, b) => a.Roles[0].Name.toUpperCase() > b.Roles[0].Name.toUpperCase() ? 1 : -1);
      }
      else if (this.toggleStatus === false && label === 'role') {
        this.userDetails.sort((a, b) => a.Roles[0].Name.toUpperCase() < b.Roles[0].Name.toUpperCase() ? 1 : -1);
      }
      if (this.toggleStatus === true && label === 'phone') {
        this.userDetails.sort((a, b) => a.PrimaryPhone > b.PrimaryPhone ? 1 : -1);
      }
      else if (this.toggleStatus === false && label === 'phone') {
        this.userDetails.sort((a, b) => a.PrimaryPhone < b.PrimaryPhone ? 1 : -1);
      }
      if (this.toggleStatus === true && label === 'email') {
        this.userDetails.sort((a, b) => a.EmailAddress.toUpperCase() < b.EmailAddress.toUpperCase() ? 1 : -1);
      }
      else if (this.toggleStatus === false && label === 'email') {
        this.userDetails.sort((a, b) => a.EmailAddress.toUpperCase() > b.EmailAddress.toUpperCase() ? 1 : -1);
      }
    }
    this.toggleStatus = !this.toggleStatus;
  }

  deleteUser(event) {
    const result = this.userDetails.filter(item => item.Id === this.idNumber);
    const anyObject = {
      'Id': this.idNumber,
      'FirstName': result[0].FirstName,
      'LastName': result[0].LastName,
      'EmailAddress': result[0].EmailAddress,
      'PrimaryPhone': result[0].PrimaryPhone,
      'CompanyName': result[0].CompanyName,
      'Password': result[0].Password,
      'ImageUrl': result[0].ImageUrl,
      'Position': result[0].Position,
      'IsActive': result[0].IsActive,
      'TenantId': result[0].TenantId,
    };

    const endpoint = this.apiService.deleteUser;
    const url = new URL(`${environment.API.URL}/${endpoint}`);
    this.modalservice.close('singleUser.Id');

    // this.httpClient.delete(url.toString(), httpOptions)
    this.apiService.deleteData(this.apiService.deleteUser, anyObject)
      .subscribe((res) => {
        this.toastrService.show('User Deleted', 'Success');
        this.getUserDirectoryDetails(this.currentPageNumber, this.config.itemsPerPage);
        this.modalservice.close('singleUser.Id');
      }, (err) => {
        this.toastrService.danger(err.error.Message);
        this.modalservice.close('singleUser.Id');
      });
  }

  searchUser(event) {
    const search = event.target.value;
    this.apiService.getData(this.apiService.getAllActiveUsers + `&startwith=${search}`, this.config.currentPage, this.config.itemsPerPage).subscribe((response) => {

      const myHeaders = response.headers;
      this.headerValue = JSON.parse(response.headers.get('paging-headers'));
      if (this.headerValue) {
        this.config.totalItems = this.headerValue.TotalCount;
      }

      if (response && response['body']) {
        this.userDetails = response['body'];
        sessionStorage.usersList = JSON.stringify(this.userDetails);
        this.userDetails.map((user, idx) => {
          if (user.OrgSuperUser !== null) {
            user.contactName = user.OrgSuperUser !== undefined && user.OrgSuperUser.FirstName !== null ? user.OrgSuperUser.FirstName : '';
            user.userName = user.OrgSuperUer !== undefined ? user.OrgSuperUser.UserName : '';
            user.PrimaryPhone = user.OrgSuperUser.PrimaryPhone !== undefined ? user.OrgSuperUer.PrimaryPhone : '';
          }
          if (user.Subscriptions && user.Subscriptions.length > 0) {
            user.package = user.Subscriptions[0].Name;
            if (user.OrgSuperUser !== null && user.OrgSuperUser !== null) {
              user.name = user.OrgSuperUser.FirstName + ' ' + user.OrgSuperUser.LastName;
              user.username = user.OrgSuperUser.UserName;
            }
          }
        });
      }
    });
  }


  ExportTOExcelUserList() {
  const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.TABLE.nativeElement);
  ws['!cols'] = [];
  ws['!cols'][5] = { hidden: true };
  const wb: XLSX.WorkBook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, 'User-list.xlsx');

}
}

