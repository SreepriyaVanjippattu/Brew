import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { StatusUse } from '../../../../models/status-id-name';
import { NbToastrService } from '@nebular/theme';
import { String } from "typescript-string-operations";

@Component({
  selector: 'view-client',
  templateUrl: './view-client.component.html',
  styleUrls: ['./view-client.component.scss']
})
export class ViewclientComponent implements OnInit {
  status = StatusUse;
  phone: any;
  page: string;
  id: any;
  levelNum: number;
  beginDate;
  editClientDetails;
  package;
  formSubmitted;
  validEmail;
  getTenantContent;
  currentStatus: Number;
  tenantList: any[] = [];
  imageLink = '';
  userProfile: any;
  currentUser: any;
  constructor(
    private httpService: HttpClient,
    private apiService: ApiProviderService,
    private router: Router,
    private forms: FormBuilder,
    private datepipe: DatePipe,
    private route: ActivatedRoute,
    private toast: NbToastrService,

  ) { }

  viewClientForm = this.forms.group({
    company: [''],
    email: [''],
    phone: [],
    status: [''],
    startDate: [''],
    expiryDate: [''],
    street: [''],
    city: [''],
    state: [''],
    country: [''],
    postalCode: [''],
    firstname: [''],
    lastname: [''],
    userEmail: [''],
    userPhone: [''],
    userId: [''],
    password: [''],
  });

  ngOnInit() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    this.userProfile = user['userDetails'];
    this.currentUser = this.userProfile.userId;
    this.id = this.route.snapshot.url[1].path;
    this.page = this.route.snapshot.url[0].path;
    this.getSingleEditUserDetails(this.id);
  }

  getSingleEditUserDetails(id) {
    if (!sessionStorage.clientList || sessionStorage.clientList === '') {
      const clientDetails = String.Format(this.apiService.getClientDetailById, id);
      this.apiService.getDataList(clientDetails, 1, 1, null, null, null).
        subscribe((response) => {
        this.editClientDetails = response['body'];
        this.editClientDetails.forEach(element => {
          if (element.id === id) {
            this.editClientDetails = element;
            this.setDataToEdit();
          }
        });
      }, error => {
        console.error(error);
      });
    }else {
      this.editClientDetails = JSON.parse(sessionStorage.clientList);
        this.editClientDetails.forEach(element => {
          if (element.id === id) {
            this.editClientDetails = element;
            this.setDataToEdit();
          }
        });
    }
  }

  setDataToEdit() {
    if (this.editClientDetails) {
      if (this.editClientDetails.subscriptions && this.editClientDetails.subscriptions.length > 0) {
        this.package = this.editClientDetails.subscriptions[0].name;
      }
      if (this.editClientDetails.name !== null) {
        this.viewClientForm.get('company').setValue(this.editClientDetails.name[0].toUpperCase() + this.editClientDetails.name.substr(1).toUpperCase());
      }
      if (this.editClientDetails.contactEmail !== null) {
        this.viewClientForm.get('email').setValue(this.editClientDetails.contactEmail);
      }
      if (this.editClientDetails.orgSuperUser !== null) {
        if (this.editClientDetails.orgSuperUser.EmailAddress !== null) {
          this.viewClientForm.get('userEmail').setValue(this.editClientDetails.orgSuperUser.emailAddress);
        }
        if (this.editClientDetails.orgSuperUser.PrimaryPhone !== null) {
          this.viewClientForm.get('phone').setValue(this.editClientDetails.orgSuperUser.primaryPhone);
        }
        if (this.editClientDetails.orgSuperUser.CreatedDate !== null) {
          let startDate = this.editClientDetails.startDate;
         startDate = this.datepipe.transform(new Date(startDate), 'dd/MM/yyyy  hh:mm:ss a');
          this.viewClientForm.get('startDate').setValue(startDate);
        }
        if (this.editClientDetails.orgSuperUser.modifiedDate !== null) {
          let expiryDate = this.editClientDetails.endDate;
          expiryDate = this.datepipe.transform(new Date(expiryDate), 'dd/MM/yyyy  hh:mm:ss a')
          this.viewClientForm.get('expiryDate').setValue(expiryDate);
        }
        if (this.editClientDetails.orgSuperUser.firstName !== null) {
          this.viewClientForm.get('firstname').setValue(this.editClientDetails.orgSuperUser.firstName);
        }
        if (this.editClientDetails.orgSuperUser.lastName !== null) {
          this.viewClientForm.get('lastname').setValue(this.editClientDetails.orgSuperUser.lastName);
        }
      }

      if (this.editClientDetails.address1 !== null && this.editClientDetails.address2 !== null) {
        this.viewClientForm.get('street').setValue(this.editClientDetails.address1[0].toUpperCase() + this.editClientDetails.address1.substr(1).toLowerCase() + ' , '
          + this.editClientDetails.address2[0].toUpperCase() + this.editClientDetails.address2.substr(1).toLowerCase());
      }
      if (this.editClientDetails.country !== null) {
        this.viewClientForm.get('country').setValue(this.editClientDetails.country[0].toUpperCase() + this.editClientDetails.country.substr(1).toLowerCase());
      }
      if (this.editClientDetails.state !== null) {
        this.viewClientForm.get('state').setValue(this.editClientDetails.state[0].toUpperCase() + this.editClientDetails.state.substr(1).toLowerCase());
      }
      if (this.editClientDetails.city !== null) {
        this.viewClientForm.get('city').setValue(this.editClientDetails.city[0].toUpperCase() + this.editClientDetails.city.substr(1).toLowerCase());
      }
      if (this.editClientDetails.postalCode !== null) {
        this.viewClientForm.get('postalCode').setValue(this.editClientDetails.postalCode);
      }
      if (this.editClientDetails.orgSuperUser !== null) {
        this.viewClientForm.get('userPhone').setValue(this.editClientDetails.orgSuperUser.primaryPhone);
      }
      this.imageLink = this.editClientDetails.ImageUrl;
    }
  }

  archivedClick() {
    const clientForm = this.viewClientForm.controls;
    const str_client = this.viewClientForm.value.street.split(',');
    const params = {
      Id: this.id,
      Name: clientForm.company.value,
      ContactEmail: clientForm.email.value,
      ContactPhone: clientForm.phone.value,
      Address1: str_client[0],
      Address2: str_client[1],
      State: clientForm.state.value,
      Country: clientForm.country.value,
      City: clientForm.city.value,
      Postalcode: clientForm.postalCode.value,
      IsActive: true,
      Status: this.status.archive.name,
      StatusId: this.status.archive.id,
      CurrentUser: this.currentUser,
      Subscriptions: [
        {
          Id: this.editClientDetails.Subscriptions[0].Id,
          StartDate: this.viewClientForm.get('startDate').value,
          EndDate: this.viewClientForm.get('expiryDate').value,
        },
      ],
    };
    this.apiService.putData(this.apiService.editClient, params).subscribe(response => {
      if (response) {
        this.toast.show('Client Archived', 'Success');
        this.router.navigate(['app/clients/archives']);
      }
    }, error => {
      this.toast.danger(error.error.Message);
    });

  }

  goToEdit() {
    this.router.navigate(['app/clients/edit/' + this.id]);
  }
}
