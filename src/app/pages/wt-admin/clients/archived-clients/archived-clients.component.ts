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
    this.userProfile = user['UserProfile'];
    this.currentUser = this.userProfile.Id;
    this.page = this.route.snapshot.queryParamMap.get('page');

    if (this.page) {
      this.getArchivedClientDetails(this.page, this.config.itemsPerPage);
    } else {
      this.getArchivedClientDetails(this.config.currentPage, this.config.itemsPerPage);
    }
    this.checkDeletePermission();
  }

  getArchivedClientDetails(pageNumber, pageSize) {

    this.router.navigate(['app/clients/archives'], {
      queryParams: {
        page: this.config.currentPage,
      },
    });
    this.apiService.getData(this.apiService.getAllArchivedClients, pageNumber, pageSize).subscribe(response => {
      const archivedClientDetails = response['body'];
      if (archivedClientDetails) {
        this.getPackageContact(archivedClientDetails);
      }
      this.jsonValue = JSON.parse(response.headers.get('paging-headers'));
      if (this.jsonValue) {
        this.config.totalItems = this.jsonValue.TotalCount;
        if (this.config.totalItems === 0) {
          this.pageControl = true;
        }
      }
    });
    this.route.queryParamMap
      .map(params => params.get('page'))
      .subscribe((page: any) => {
        return this.config.currentPage = page;
      });
  }

  getPackageContact(archivedClient) {
     this.archivedClient = archivedClient;
     this.archivedClient.map((client, idx) => {
      client.localTime = client.EndDate.substr(0, client.EndDate.indexOf('T'));
      if (client.OrgSuperUser !== null) { 
        // Check the FirstName and Last Name exist and convert that to uppecase in the first letter and others in lowercase
        client.contactName = client.OrgSuperUser.FirstName || client.OrgSuperUser.LastName !== null ? 
        client.OrgSuperUser.FirstName[0].toUpperCase() + client.OrgSuperUser.FirstName.substr(1).toLowerCase() 
        + ' ' + client.OrgSuperUser.LastName[0].toUpperCase() + client.OrgSuperUser.LastName.substr(1).toLowerCase(): '';
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
    })
  }

  filter(label) {
    if (this.archivedClient) {
      if (this.toggleStatus === true && label === 'company') {
        this.archivedClient.sort((a, b) => a.Name.toUpperCase() > b.Name.toUpperCase() ? 1: -1);
      }
      else if (this.toggleStatus === false && label === 'company') {
        this.archivedClient.sort((a, b) => a.Name.toUpperCase() < b.Name.toUpperCase() ? 1: -1);
      }
      if (this.toggleStatus === true && label === 'package') {
        this.archivedClient.sort((a, b) => a.package.toUpperCase() > b.package.toUpperCase() ? 1: -1);
      }
      else if (this.toggleStatus === false && label === 'package'){
        this.archivedClient.sort((a, b) => a.package.toUpperCase() < b.package.toUpperCase() ? 1: -1);
      }
      if (this.toggleStatus === true && label === 'name') {
        this.archivedClient.sort((a, b) => a.OrgSuperUser.FirstName.toUpperCase() > b.OrgSuperUser.FirstName.toUpperCase() ? 1: -1);
      }
      else if (this.toggleStatus === false && label === 'name') {
        this.archivedClient.sort((a, b) => a.OrgSuperUser.FirstName.toUpperCase() < b.OrgSuperUser.FirstName.toUpperCase() ? 1: -1);
      }
      if (this.toggleStatus === true && label === 'user') {
        this.archivedClient.sort((a, b) => a.toggleStatus.toUpperCase() > b.toggleStatus.toUpperCase() ? 1: -1);
      }
      else if (this.toggleStatus === false && label === 'user') {
        this.archivedClient.sort((a, b) => a.toggleStatus.toUpperCase() < b.toggleStatus.toUpperCase() ? 1: -1);
      }
      if (this.toggleStatus === true && label === 'phone') {
        this.archivedClient.sort((a, b) => a.ContactPhone < b.ContactPhone ? 1: -1);
      }
      else if (this.toggleStatus === false && label === 'phone') {
        this.archivedClient.sort((a, b) => a.ContactPhone > b.ContactPhone? 1: -1);
      }
      if (this.toggleStatus === true && label === 'email') {
        this.archivedClient.sort((a, b) => a.ContactEmail.toUpperCase() < b.ContactEmail.toUpperCase() ? 1: -1);
      }
      else if (this.toggleStatus === false && label === 'email') {
        this.archivedClient.sort((a, b) => a.ContactEmail.toUpperCase() > b.ContactEmail.toUpperCase() ? 1: -1);
      }
      if (this.toggleStatus === true && label === 'expiry') {
        this.archivedClient.sort((a, b) => a.localTime < b.localTime ? 1: -1);
      }
      else if (this.toggleStatus === false && label === 'expiry') {
        this.archivedClient.sort((a, b) => a.localTime > b.localTime ? 1: -1);
      }
      if (this.toggleStatus === true && label === 'status') {
        this.archivedClient.sort((a, b) => a.Status.toUpperCase() < b.Status.toUpperCase() ? 1: -1);
      }
      else if (this.toggleStatus === false && label === 'status') {
        this.archivedClient.sort((a, b) => a.Status.toUpperCase() > b.Status.toUpperCase() ? 1: -1);
      }
    }
    this.toggleStatus = !this.toggleStatus;
  }

  singleArchive(id: Number) {
    this.router.navigate(['app/clients/archiveEdit/' + id]);
  }

  restoreArchive(id) {
    this.archivedClient.forEach(element => {
      if (id === element.Id) {
        this.clientToRestore = element;
      }
    });
    const params = {
      Id: this.clientToRestore.Id,
      Name: this.clientToRestore.Name,
      ContactEmail: this.clientToRestore.ContactEmail,
      ContactPhone: this.clientToRestore.ContactPhone,
      Address1: this.clientToRestore.Address1,
      Address2: this.clientToRestore.Address2,
      State: this.clientToRestore.State,
      Country: this.clientToRestore.Country,
      City: this.clientToRestore.City,
      Postalcode: this.clientToRestore.Postalcode,
      IsActive: true,
      Status: this.status.pending.name,
      StatusId: this.status.pending.id,
      CurrentUser: this.currentUser,
    };
    this.restoreClient(params);
  }

  restoreClient(params) {
    this.apiService.putData(this.apiService.editClient, params).subscribe((response: any) => {
      if (response.status === 200) {
        this.toastrService.show('Client Restored', 'Success');
        this.router.navigate(['app/clients']);
      }
    },
      error => {
        this.toastrService.danger(error.error.Message, 'Error');
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

  deleteUser(id) {
    const params = {
      'ClientID': this.idNumber,
      'StatusID': '1625A5C1-B41A-4F6E-91AD-E4AA0C61121C',
      'CurrentUser': JSON.parse(sessionStorage.user).UserProfile.Id,
    };
    this.apiService.putData(this.apiService.editClientStatus, params).subscribe((response: any) => {
      if (response.status === 200) {
        this.toastrService.show('Client Deleted', 'Success');
        this.modalservice.close('archiveClient');
        this.getArchivedClientDetails(this.config.currentPage, this.config.itemsPerPage);

      }
    },
      error => {
        this.modalservice.close('archiveClient');
        this.toastrService.danger(error.error.Message, 'Error');
      });
  }


  pageSize(pageSize) {
    this.config.itemsPerPage = pageSize;
    this.getArchivedClientDetails(this.config.currentPage, this.config.itemsPerPage);
  }

  pageChange(pageNumber) {
    this.config.currentPage = pageNumber;
    this.getArchivedClientDetails(this.config.currentPage, this.config.itemsPerPage);
    this.router.navigate(['app/clients/archives'], {
      queryParams: {
        page: pageNumber,
      },
    });
  }
  searchArchived(event) {
    const search = event.target.value;
    // const url = new URL(`${apiConfig.url.archived}startwith=${search}`);
    this.apiService.getData(this.apiService.getAllArchivedClients+`&startwith=${search}`, this.config.currentPage, this.config.itemsPerPage).subscribe((response) => {
      const myHeaders = response.headers;
      this.headerValue = JSON.parse(response.headers.get('paging-headers'));
      if (this.headerValue) {
        this.config.totalItems = this.headerValue.TotalCount;
      }
      if ( response && response['body'] ) {
        const archivedData = response['body'];
        this.getPackageContact(archivedData);
        // this.archivedClient.map((client, idx) => {

        // })
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
