import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NbToastrService } from '@nebular/theme';
import { ModalService } from '../../../modal/modal.service';
import { StatusUse } from '../../../../models/status-id-name';
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
  HttpParams,
} from '@angular/common/http';
import { environment } from '../../../../../../src/environments/environment';
import { apiConfig } from '../../../../../environments/api-config';
import * as XLSX from 'xlsx';
import { DataService } from '../../../../data.service';
import { access } from 'fs';
import { permission } from '../../../../models/rolePermission';
import { String } from "typescript-string-operations";

@Component({
  selector: 'app-archived-clients',
  templateUrl: './archived-clients.component.html',
  styleUrls: ['./archived-clients.component.scss'],
})
export class ArchivedClientsComponent implements OnInit {
  @ViewChild('TABLE', { static: false }) TABLE: ElementRef;
  title = 'Excel';
  archivedClient;
  toggleStatus: boolean;
  idNumber;
  config = {
    currentPage: 1,
    itemsPerPage: 5,
    totalItems: 10,
  };
  jsonValue: any;
  page: string;
  clientToRestore: any;
  status = StatusUse;
  Next;
  Previous;
  checkPermission = false;
  permission = permission;
  headerValue: any;
  pageControl;
  userProfile: any;
  currentUser: string;
  statusName: string;
  searchText: string;
  

  constructor(
    private modalservice: ModalService,
    private apiService: ApiProviderService,
    private toastrService: NbToastrService,
    private router: Router,
    private route: ActivatedRoute,
    private httpClient: HttpClient,
    private data_service: DataService,

  ) { }

  ngOnInit() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    this.userProfile = user['userDetails'];
    this.currentUser = this.userProfile.userId;
    this.toggleStatus = false;
    this.page = this.route.snapshot.queryParamMap.get('page');

    if (this.page) {
      this.getArchivedClientDetails(this.page, this.config.itemsPerPage, this.searchText);
    } else {
      this.getArchivedClientDetails(this.config.currentPage, this.config.itemsPerPage, this.searchText);
    }
    this.checkDeletePermission();
  }

  getArchivedClientDetails(pageNumber, pageSize, searchText) {

    this.router.navigate(['app/clients/archives'], {
      queryParams: {
        page: this.config.currentPage,
      },
    });
    this.apiService.getDataList(this.apiService.getAllArchivedClients, pageNumber, pageSize, searchText).subscribe(response => {
      const archivedClientDetails = response['body']['clientDetails'];
      if (archivedClientDetails) {
        this.getPackageContact(archivedClientDetails);
      }
      archivedClientDetails.forEach(element => {
        if (element.status === this.status.archive.id) {
          this.statusName = this.status.archive.name;
        }
      });
      this.headerValue = response["body"]["pagingDetails"];
      if (this.headerValue) {
        this.config.totalItems = this.headerValue.totalCount;
        this.pageControl = this.config.totalItems === 0 ? true : false;
      }
    },
      (error) => {
        if (error instanceof HttpErrorResponse) {
          this.toastrService.danger(error.error.message, 'Try Again');
        } else {
          this.toastrService.danger(error, 'Try Again');
        }
      });
    this.route.queryParamMap
      .map(params => params.get('page'))
      .subscribe((page: any) => {
        return this.config.currentPage = page;
      });
  }

  clear() {
    this.searchText = "";
    this.searchArchived();
  }

  getPackageContact(archivedClient) {
    this.archivedClient = archivedClient;
    this.archivedClient.map((client, idx) => {
      if (client.endDate) {
        client.localTime = client.endDate.substr(0, client.endDate.indexOf('T'));
      }
      if (client.orgSuperUser !== null) {
        // Check the FirstName and Last Name exist and convert that to uppecase in the first letter and others in lowercase
        client.contactName = client.orgSuperUser.firstName || client.orgSuperUser.lastName !== null ?
          client.orgSuperUser.firstName[0].toUpperCase() + client.orgSuperUser.firstName.substr(1).toLowerCase()
          + ' ' + client.orgSuperUser.lastName[0].toUpperCase() + client.orgSuperUser.lastName.substr(1).toLowerCase() : '';
        client.userName = client.orgSuperUser.userName;
        client.primaryPhone = client.orgSuperUser.phone;
      }
      if (client.subscriptions && client.subscriptions.length > 0) {
        client.package = client.subscriptions[0].name;
        if (client.orgSuperUser !== null && client.orgSuperUser !== null) {
          client.name = client.orgSuperUser.firstName + ' ' + client.orgSuperUser.lastName;
          client.username = client.orgSuperUser.userName;
        }
      }
    })
  }

  filter(label) {
    if (this.archivedClient) {
      if (this.toggleStatus === true && label === 'company') {
        this.archivedClient.sort((a, b) => a.name.toUpperCase() > b.name.toUpperCase() ? 1: -1);
      }
      else if (this.toggleStatus === false && label === 'company') {
        this.archivedClient.sort((a, b) => a.name.toUpperCase() < b.name.toUpperCase() ? 1: -1);
      }
      if (this.toggleStatus === true && label === 'package') {
        this.archivedClient.sort((a, b) => a.package.toUpperCase() > a.package.toUpperCase() ? 1 : -1);
      }
      else if (this.toggleStatus === false && label === 'package') {
        this.archivedClient.sort((a, b) => a.package.toUpperCase() < a.package.toUpperCase() ? 1 : -1);
      }
      if (this.toggleStatus === true && label === 'name') {
        this.archivedClient.sort((a, b) => a.orgSuperUser.firstName.toUpperCase() > b.orgSuperUser.firstName.toUpperCase() ? 1: -1);
      }
      else if (this.toggleStatus === false && label === 'name') {
        this.archivedClient.sort((a, b) => a.orgSuperUser.firstName.toUpperCase() < b.orgSuperUser.firstName.toUpperCase() ? 1: -1);
      }
      if (this.toggleStatus === true && label === 'user') {
        this.archivedClient.sort((a, b) => a.toggleStatus.toUpperCase() > b.toggleStatus.toUpperCase() ? 1: -1);
      }
      else if (this.toggleStatus === false && label === 'user') {
        this.archivedClient.sort((a, b) => a.toggleStatus.toUpperCase() < b.toggleStatus.toUpperCase() ? 1: -1);
      }
      if (this.toggleStatus === true && label === 'phone') {
        this.archivedClient.sort((a, b) => a.contactPhone < b.contactPhone ? 1: -1);
      }
      else if (this.toggleStatus === false && label === 'phone') {
        this.archivedClient.sort((a, b) => a.contactPhone > b.contactPhone? 1: -1);
      }
      if (this.toggleStatus === true && label === 'email') {
        this.archivedClient.sort((a, b) => a.contactEmail.toUpperCase() < b.contactEmail.toUpperCase() ? 1: -1);
      }
      else if (this.toggleStatus === false && label === 'email') {
        this.archivedClient.sort((a, b) => a.contactEmail.toUpperCase() > b.contactEmail.toUpperCase() ? 1: -1);
      }
      if (this.toggleStatus === true && label === 'expiry') {
        this.archivedClient.sort((a, b) => a.localTime < b.localTime ? 1: -1);
      }
      else if (this.toggleStatus === false && label === 'expiry') {
        this.archivedClient.sort((a, b) => a.localTime > b.localTime ? 1: -1);
      }
      if (this.toggleStatus === true && label === 'status') {
        this.archivedClient.sort((a, b) => this.statusName.toUpperCase() < this.statusName.toUpperCase() ? 1: -1);
      }
      else if (this.toggleStatus === false && label === 'status') {
        this.archivedClient.sort((a, b) => this.statusName.toUpperCase() > this.statusName.toUpperCase() ? 1: -1);
      }
    }
    this.toggleStatus = !this.toggleStatus;
  }

  singleArchive(id: Number) {
    this.router.navigate(['app/clients/archiveEdit/' + id]);
  }

  restoreArchive(id) {
    this.archivedClient.forEach(element => {
      if (id === element.id) {
        this.clientToRestore = element;
      }
    });
    const params = {
      clientID: this.clientToRestore.id,
      statusID: this.status.pending.id,
      currentUser: this.currentUser,
    };
    this.restoreClient(params);
  }

  restoreClient(params) {
    this.apiService.putData(this.apiService.editClientStatus, params).subscribe((response: any) => {
      if (response.status === 200) {
        this.toastrService.show('Client Restored', 'Success');
        this.router.navigate(['app/clients']);
      }
    },
      (error) => {
        if (error instanceof HttpErrorResponse) {
          this.toastrService.danger(error.error.message, 'Try Again');
        } else {
          this.toastrService.danger(error, 'Try Again');
        }
      });
  }

  checkDeletePermission() {
    const data = this.data_service.checkPermission(this.permission.Delete_Organization.Id);
    if (data) {
      this.checkPermission = true;
    } else {
      this.checkPermission = false;
    }
  }

  deleteSingleClient(id: Number) {
    this.idNumber = id;
    if (!this.checkPermission) {
      this.toastrService.danger('You don\'t have access', 'Error');
    }
  }

  deleteUser() {
    const params = {
      clientID: this.idNumber,
      statusID: this.status.pending.id,
      currentUser: this.currentUser,
    };
    this.apiService.putData(this.apiService.editClientStatus, params).subscribe((response: any) => {
      if (response.status === 200) {
        this.toastrService.show('Client Deleted', 'Success');
        this.modalservice.close('archiveClient');
        this.getArchivedClientDetails(this.config.currentPage, this.config.itemsPerPage, this.searchText);

      }
    },
      error => {
        this.modalservice.close('archiveClient');
        this.toastrService.danger(error.error.message, 'Try Again');
      });
  }


  pageSize(pageSize) {
    this.config.itemsPerPage = pageSize;
    this.getArchivedClientDetails(this.config.currentPage, this.config.itemsPerPage, this.searchText);
  }

  pageChange(pageNumber) {
    this.config.currentPage = pageNumber;
    this.getArchivedClientDetails(this.config.currentPage, this.config.itemsPerPage, this.searchText);
    this.router.navigate(['app/clients/archives'], {
      queryParams: {
        page: pageNumber,
      },
    });
  }
  searchArchived() {
    this.apiService.getData(this.apiService.getAllArchivedClients, this.config.currentPage, this.config.itemsPerPage,this.searchText).subscribe((response) => {
      if ( response && response['body'] ) {
        const archivedData = response['body'];
        this.headerValue = response["body"]["pagingDetails"];
        if (this.headerValue) {
          this.config.totalItems = this.headerValue.totalCount;
          this.pageControl = this.config.totalItems === 0 ? true : false;
        }

        this.getPackageContact(archivedData);
        // this.archivedClient.map((client, idx) => {

        // })
      }
    },
      (error) => {
        if (error instanceof HttpErrorResponse) {
          this.toastrService.danger(error.error.message, 'Try Again');
        } else {
          this.toastrService.danger(error, 'Try Again');
        }
      })

  }
  ExportToExcelsArchieved() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.TABLE.nativeElement);
    ws['!cols'] = [];
    ws['!cols'][8] = { hidden: true };
    const wb: XLSX.WorkBook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'Archived-client-list.xlsx');

  }
}
