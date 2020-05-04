import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { StatusUse } from '../../../../models/status-id-name';
import { NbToastrService } from '@nebular/theme';

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
    this.userProfile = user['UserProfile'];
    this.currentUser = this.userProfile.Id;
    this.id = this.route.snapshot.url[1].path;
    this.page = this.route.snapshot.url[0].path;
    this.getSingleEditUserDetails(this.id);
  }

  getSingleEditUserDetails(id) {
    if (!sessionStorage.clientList || sessionStorage.clientList === '') {
      const clientDetails = this.apiService.getData(this.apiService.getAllActiveClients).
      subscribe((response) => {
        this.editClientDetails = response['body'];
        this.editClientDetails.forEach(element => {
          if (element.Id === id) {
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
          if (element.Id === id) {
            this.editClientDetails = element;
            this.setDataToEdit();
          }
        });
    }
  }

  setDataToEdit() {
    if (this.editClientDetails) {
      if (this.editClientDetails.Subscriptions && this.editClientDetails.Subscriptions.length > 0) {
        this.package = this.editClientDetails.Subscriptions[0].Name;
      }
      if (this.editClientDetails.Name !== null) {
        this.viewClientForm.get('company').setValue(this.editClientDetails.Name[0].toUpperCase() + this.editClientDetails.Name.substr(1).toUpperCase());
      }
      if (this.editClientDetails.ContactEmail !== null) {
        this.viewClientForm.get('email').setValue(this.editClientDetails.ContactEmail);
      }
      if (this.editClientDetails.OrgSuperUser !== null) {
        if (this.editClientDetails.OrgSuperUser.EmailAddress !== null) {
          this.viewClientForm.get('userEmail').setValue(this.editClientDetails.OrgSuperUser.EmailAddress);
        }
        if (this.editClientDetails.OrgSuperUser.PrimaryPhone !== null) {
          this.viewClientForm.get('phone').setValue(this.editClientDetails.OrgSuperUser.PrimaryPhone);
        }
        if (this.editClientDetails.OrgSuperUser.CreatedDate !== null) {
          let startDate = this.editClientDetails.StartDate;
         startDate = this.datepipe.transform(new Date(startDate), 'dd/MM/yyyy  hh:mm:ss a');
          this.viewClientForm.get('startDate').setValue(startDate);
        }
        if (this.editClientDetails.OrgSuperUser.ModifiedDate !== null) {
          let expiryDate = this.editClientDetails.EndDate;
          expiryDate = this.datepipe.transform(new Date(expiryDate), 'dd/MM/yyyy  hh:mm:ss a')
          this.viewClientForm.get('expiryDate').setValue(expiryDate);
        }
        if (this.editClientDetails.OrgSuperUser.FirstName !== null) {
          this.viewClientForm.get('firstname').setValue(this.editClientDetails.OrgSuperUser.FirstName);
        }
        if (this.editClientDetails.OrgSuperUser.LastName !== null) {
          this.viewClientForm.get('lastname').setValue(this.editClientDetails.OrgSuperUser.LastName);
        }
      }

      if (this.editClientDetails.Address1 !== null && this.editClientDetails.Address2 !== null) {
        this.viewClientForm.get('street').setValue(this.editClientDetails.Address1[0].toUpperCase() + this.editClientDetails.Address1.substr(1).toLowerCase() + ' , '
          + this.editClientDetails.Address2[0].toUpperCase() + this.editClientDetails.Address2.substr(1).toLowerCase());
      }
      if (this.editClientDetails.Country !== null) {
        this.viewClientForm.get('country').setValue(this.editClientDetails.Country[0].toUpperCase() + this.editClientDetails.Country.substr(1).toLowerCase());
      }
      if (this.editClientDetails.State !== null) {
        this.viewClientForm.get('state').setValue(this.editClientDetails.State[0].toUpperCase() + this.editClientDetails.State.substr(1).toLowerCase());
      }
      if (this.editClientDetails.City !== null) {
        this.viewClientForm.get('city').setValue(this.editClientDetails.City[0].toUpperCase() + this.editClientDetails.City.substr(1).toLowerCase());
      }
      if (this.editClientDetails.Postalcode !== null) {
        this.viewClientForm.get('postalCode').setValue(this.editClientDetails.Postalcode);
      }
      if (this.editClientDetails.OrgSuperUser !== null) {
        this.viewClientForm.get('userPhone').setValue(this.editClientDetails.OrgSuperUser.PrimaryPhone);
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
