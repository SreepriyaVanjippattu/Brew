import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { ModalService } from '../.../../../../modal';
import { NbToastrService } from '@nebular/theme';
import { StatusUse } from '../../../../models/status-id-name';
import { apiConfig } from '../../../../../environments/api-config';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-list-clients',
  templateUrl: './list-clients.component.html',
  styleUrls: ['./list-clients.component.scss'],
})
export class ListClientsComponent implements OnInit {
  @ViewChild('TABLE', { static: false }) TABLE: ElementRef;
  title = 'Excel';
  toggleStatus: Boolean;
  clientToArchive: any;
  headerValue: any;
  clientList;
  resultContent;
  levelNum;
  next;
  previous;
  config = {
    currentPage: 1,
    itemsPerPage: 5,
    totalItems: 20,
    searchPage: 1,
  };
  page: any;
  status = StatusUse;
  archiveId: any;
  pageControl;
  tenantId: string;
  tenantStatus: any;
  userProfile: any;
  currentUser: any;
  statusName: string;
  constructor(
    private httpService: HttpClient,
    private apiService: ApiProviderService,
    private router: Router,
    private modalService: ModalService,
    private toastrService: NbToastrService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
   
    const user = JSON.parse(sessionStorage.getItem('user'));
    this.userProfile = user['userDetails'];
    this.currentUser = this.userProfile.userId;
    this.toggleStatus = false;
    this.page = this.route.snapshot.queryParamMap.get('page');
    if (this.page) {
      this.getClientsList(this.page, this.config.itemsPerPage);
    } else {
      this.getClientsList(this.config.currentPage, this.config.itemsPerPage);
    }
  }

  openModal(id) {
    if (id) {
      this.modalService.open(id);
    }
  }

  editClientDirectory(clientId) {
    this.router.navigate(['app/clients/edit/' + clientId]);
  }


  goToViewDetails(clientId) {
    this.router.navigate(['app/clients/viewClient/' + clientId]);
  }

  archiveClientDirectory() {
    this.router.navigate(['app/clients/archives']);
  }

  filter(label) {
    if (this.clientList) {
      if (this.toggleStatus === true && label === 'company') {
        this.clientList.sort((a, b) => a.Name.toUpperCase() > b.Name.toUpperCase() ? 1: -1);
      }
      else if (this.toggleStatus === false && label === 'company') {
        this.clientList.sort((a, b) => a.Name.toUpperCase() < b.Name.toUpperCase() ? 1: -1);
      }
      if (this.toggleStatus === true && label === 'package') {
        this.clientList.sort((a, b) => a.package.toUpperCase() > b.package.toUpperCase() ? 1: -1);
      }
      else if (this.toggleStatus === false && label === 'package'){
        this.clientList.sort((a, b) => a.package.toUpperCase() < b.package.toUpperCase()? 1: -1);
      }
      if (this.toggleStatus === true && label === 'name') {
        this.clientList.sort((a, b) => a.OrgSuperUser.FirstName.toUpperCase() > b.OrgSuperUser.FirstName.toUpperCase() ? 1: -1);
      }
      else if (this.toggleStatus === false && label === 'name') {
        this.clientList.sort((a, b) => a.OrgSuperUser.FirstName.toUpperCase() < b.OrgSuperUser.FirstName.toUpperCase() ? 1: -1);
      }
      if (this.toggleStatus === true && label === 'user') {
        this.clientList.sort((a, b) => a.OrgSuperUser.EmailAddress.toUpperCase() > b.OrgSuperUser.EmailAddress.toUpperCase() ? 1: -1);
      }
      else if (this.toggleStatus === false && label === 'user') {
        this.clientList.sort((a, b) => a.OrgSuperUser.EmailAddress.toUpperCase() < b.OrgSuperUser.EmailAddress.toUpperCase() ? 1: -1);
      }
      if (this.toggleStatus === true && label === 'phone') {
        this.clientList.sort((a, b) => a.ContactPhone < b.ContactPhone ? 1: -1);
      }
      else if (this.toggleStatus === false && label === 'phone') {
        this.clientList.sort((a, b) => a.ContactPhone > b.ContactPhone? 1: -1);
      }
      if (this.toggleStatus === true && label === 'email') {
        this.clientList.sort((a, b) => a.ContactEmail.trim().toUpperCase() < b.ContactEmail.trim().toUpperCase() ? 1: -1);
      }
      else if (this.toggleStatus === false && label === 'email') {
        this.clientList.sort((a, b) => a.ContactEmail.trim().toUpperCase() > b.ContactEmail.trim().toUpperCase() ? 1: -1);
      }
      if (this.toggleStatus === true && label === 'expiry') {
        this.clientList.sort((a, b) => a.localTime < b.localTime ? 1: -1);
      }
      else if (this.toggleStatus === false && label === 'expiry') {
        this.clientList.sort((a, b) => a.localTime > b.localTime ? 1: -1);
      }
      if (this.toggleStatus === true && label === 'status') {
        this.clientList.sort((a, b) => a.Status.toUpperCase() < b.Status.toUpperCase() ? 1: -1);
      }
      else if (this.toggleStatus === false && label === 'status') {
        this.clientList.sort((a, b) => a.Status.toUpperCase() > b.Status.toUpperCase() ? 1: -1);
      }
    }
    this.toggleStatus = !this.toggleStatus;
  }

  getClientsList(pageNumber, pageSize) {
    this.router.navigate(['app/clients'], {
      queryParams: {
        page: this.config.currentPage,
      },
    });
    const clientDetails = this.apiService.getDataList(this.apiService.getAllActiveClients, pageNumber, pageSize).
      subscribe((response) => {
        if (response && response['body']) {
          this.clientList = response['body']['clientDetails'];
          sessionStorage.clientList = JSON.stringify(this.clientList);
          this.clientList.map((client, idx) => {
            client.localTime = client.EndDate.substr(0, client.EndDate.indexOf('T'));
            let d = new Date(client.EndDate);
            let e = d.toLocaleString();
            client.startDate = +(e);
            if (client.orgSuperUser !== null) {
              client.contactName = client.orgSuperUser.firstName !== null ? client.orgSuperUser.firstName : '';
              client.userName = client.orgSuperUser.userName;
              client.PrimaryPhone = client.orgSuperUser.phone;
            }

            if (client.subscriptions && client.subscriptions.length > 0) {
              client.package = client.subscriptions[0].name;
              if (client.orgSuperUser !== null && client.orgSuperUser !== null) {
                client.name = client.orgSuperUser.firstName + ' ' + client.orgSuperUser.lastName;
                client.username = client.orgSuperUser.userName;
              }
            }
          });
          const myHeaders = response.headers;
          this.headerValue = JSON.parse(response.headers.get('paging-headers'));
          if (this.headerValue) {
            this.config.totalItems = this.headerValue.TotalCount;
            if (this.headerValue === 0) {
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
    this.getClientsList(this.config.currentPage, this.config.itemsPerPage);
  }

  pageChange(nextPage) {
    this.config.currentPage = nextPage;
    this.getClientsList(this.config.currentPage, this.config.itemsPerPage);
    this.router.navigate(['app/clients'], {
      queryParams: {
        page: nextPage,
      },
    });
  }

  printClient() {

  }

  goToArchive() {
    this.router.navigate(['app/clients/archives']);
  }

  goToClientDetails(client) {
    this.router.navigate(['app/clients/edit/' + client]);
  }

  searchClient(event) {
    const search = event.target.value;
    this.apiService.getData(this.apiService.getAllActiveClients + `&startwith=${search}`, this.config.currentPage, this.config.itemsPerPage).subscribe((response) => {
      const myHeaders = response.headers;
      this.headerValue = JSON.parse(response.headers.get('paging-headers'));
      if (this.headerValue) {
        this.config.totalItems = this.headerValue.TotalCount;
      }
      if (response && response['body']) {
        this.clientList = response['body'];
        sessionStorage.clientList = JSON.stringify(this.clientList);
        this.clientList.map((client, idx) => {
          if (client.OrgSuperUser !== null) {
            client.contactName = client.OrgSuperUser.FirstName !== null ? client.OrgSuperUser.FirstName : '';
            client.userName = client.OrgSuperUser.UserName;
            client.PrimaryPhone = client.OrgSuperUser.PrimaryPhone;
          }
          if (client.Subscriptions && client.Subscriptions.length > 0) {
            client.package = client.Subscriptions[0].Name;
            if (client.OrgSuperUser !== null && client.OrgSuperUser !== null) {
              client.name = client.OrgSuperUser.FirstName + ' ' + client.OrgSuperUser.LastName;
              client.username = client.OrgSuperUser.UserName;
            }
          }
        });
      }
    });
  }

  getArchiveId(archiveId) {
    this.archiveId = archiveId;
  }

  archivedClick() {
    this.clientList.forEach(element => {
      if (this.archiveId === element.Id) {
        this.clientToArchive = element;
      }
    });
    const params = {
      Id: this.clientToArchive.Id,
      Name: this.clientToArchive.Name,
      ContactEmail: this.clientToArchive.ContactEmail,
      ContactPhone: this.clientToArchive.ContactPhone,
      Address1: this.clientToArchive.Address1,
      Address2: this.clientToArchive.Address2,
      State: this.clientToArchive.State,
      Country: this.clientToArchive.Country,
      City: this.clientToArchive.City,
      Postalcode: this.clientToArchive.Postalcode,
      IsActive: true,
      Status: this.status.archive.name,
      StatusId: this.status.archive.id,
      CurrentUser: this.currentUser,
    };
    this.archiveClient(params);
  }

  archiveClient(params) {
    this.apiService.putData(this.apiService.editClient, params).subscribe((response: any) => {
      if (response.status === 200) {
        this.toastrService.show('Client Archived', 'Success');
        this.goToArchive();
      }
    },
      error => {
        this.toastrService.danger(error.error.Message, 'Error');
      });
  }

  ExportToExcelClientList() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.TABLE.nativeElement);
    ws['!cols'] = [];
    ws['!cols'][8] = { hidden: true };
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'Client-list.xlsx');

  }

  resetpasswordClick(id, email, tenantId) {
    const params = {
      EmailAddress: email,
      Url: window.location.origin + '/login/forgot-changepassword',
  };
  this.apiService.putData(this.apiService.postEmail, params).subscribe(response => {
    if (response) {
      this.toastrService.show('', 'Mail Sent');
    }
  }, error => {
    this.toastrService.danger(error.error.Message);
  });
  }

  changeStatusClick(tenantId, status) {
   this.tenantId = tenantId;
   this.tenantStatus = status;
  }

  activateClientDirectory() {
    if (this.tenantStatus !== 'Active') {
      const params = {
        ClientId: this.tenantId,
        StatusId: '7cd88ffb-cf41-4efc-9a17-d75bcb5b3770',
        CurrentUser: JSON.parse(sessionStorage.user).UserProfile.Id,
      };
      this.apiService.putData(this.apiService.editClientStatus, params).subscribe((response: any) => {
        if (response.status === 200) {
          this.toastrService.success('Client Activated', 'Success');
          this.ngOnInit();
        }
      },
        error => {
          this.toastrService.danger(error.error.Message, 'Error');
        });
    } else {
      this.toastrService.show('Already Active', 'Client');
     }
  }
}
