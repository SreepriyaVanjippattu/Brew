import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';

import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Tenant } from '../../../../models/tenant';
import { PhoneFormatPipe } from '../../../../core/utils/phone-format.pipe';
import { StatusUse } from '../../../../models/status-id-name';
import { NbToastrService } from '@nebular/theme';
import { UtilitiesService } from '../../../../core/utils/utilities.service';
import { String } from "typescript-string-operations";

@Component({
  selector: 'app-edit-clients',
  templateUrl: './edit-clients.component.html',
  styleUrls: ['./edit-clients.component.scss'],
})
export class EditClientsComponent implements OnInit {

  @ViewChild('statusElement', { static: true }) statusElement: ElementRef;
  subStatus: any;
  statusContent: any[];
  phone: any;
  page: string;
  id: any;
  levelNum: number;
  beginDate;
  editClientDetails;
  package;
  formSubmitted = false;
  validEmail = true;
  getTenantContent;
  currentStatus: Number;
  currentStatusText: string;
  selectedTenant: Tenant;
  tenantList: any[];
  currentStatusValue;
  validPhone = true;
  status = StatusUse;
  minStartDate;
  maxStartDate;
  minExpiryDate;
  maxExpiryDate;
  validUserEmail = true;
  subId: any;
  subName: any;
  validUserPhone = true;
  imageLink = '';
  userProfile: any;
  userId: any;
  constructor(
    private httpService: HttpClient,
    private apiService: ApiProviderService,
    private router: Router,
    private forms: FormBuilder,
    private datepipe: DatePipe,
    private route: ActivatedRoute,
    private phonePipe: PhoneFormatPipe,
    private toast: NbToastrService,
    private dataTransfer: UtilitiesService,
  ) { }

  clientEditForm = this.forms.group({
    company: [''],
    email: ['', Validators.required],
    phone: ['', [Validators.required, Validators.minLength(10)]],
    startDate: [''],
    expiryDate: [''],
    street: [''],
    city: [''],
    state: [''],
    country: [''],
    postalCode: [''],
    firstname: ['', Validators.required],
    lastname: [''],
    userEmail: ['', Validators.required],
    userPhone: ['', [Validators.required, Validators.minLength(10)]],
    userId: [''],
    password: [''],
    status: [''],
  });


  ngOnInit() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    this.userProfile = user['userDetails'];
    this.userId = this.userProfile.userId;
    this.id = this.route.snapshot.url[1].path;
    this.page = this.route.snapshot.url[0].path;
    if (this.page === 'edit') {
      this.getAllTenantStatus();
      this.getSingleEditUserDetails(this.id, status);
    }
  }

  get form() {
    return this.clientEditForm.controls;
  }

  // tenantChange(event: any) {
  //   this.currentStatus = event.target.value;
  //   this.selectedTenant = this.tenantList.find(x => x.Id === this.currentStatus);
  // }

  getAllTenantStatus() {

    const status = [
      {
        'Id': '7cd88ffb-cf41-4efc-9a17-d75bcb5b3770',
        'Name': 'Active',
        'status': [
          {
            'Id': '7cd88ffb-cf41-4efc-9a17-d75bcb5b3770',
            'StatusName': 'Active',
          },
          {
            'Id': 'fc7178dd-c5c1-4776-944a-b50fe2c37f06',
            'StatusName': 'Archive',
          },
          {
            'Id': '4d2ba3c3-132e-489f-9c43-47a3996f74fa',
            'StatusName': 'Inactive',
          },
        ],
      },
      {
        'Id': '6e7df31b-5f6a-4029-91e0-5561807164da',
        'Name': 'Pending',
        'status': [
          {
            'Id': '7cd88ffb-cf41-4efc-9a17-d75bcb5b3770',
            'StatusName': 'Active',
          },
          {
            'Id': 'fc7178dd-c5c1-4776-944a-b50fe2c37f06',
            'StatusName': 'Archieve',
          },
          {
            'Id': '1625a5c1-b41a-4f6e-91ad-e4aa0c61121c',
            'StatusName': 'Deleted',
          },
          {
            'Id': '6e7df31b-5f6a-4029-91e0-5561807164da',
            'StatusName': 'Pending',
          },
        ],
      },
      {
        'Id': '4d2ba3c3-132e-489f-9c43-47a3996f74fa',
        'Name': 'Inactive',
        'status': [
          {
            'Id': '7cd88ffb-cf41-4efc-9a17-d75bcb5b3770',
            'StatusName': 'Active',
          },
          {
            'Id': 'fc7178dd-c5c1-4776-944a-b50fe2c37f06',
            'StatusName': 'Archieve',
          },
          {
            'Id': '4d2ba3c3-132e-489f-9c43-47a3996f74fa',
            'StatusName': 'Inactive',
          },
        ],
      },
      {
        'Id': '1625a5c1-b41a-4f6e-91ad-e4aa0c61121c',
        'Name': 'Deleted',
        'status': [],
      },
      {
        'Id': 'fc7178dd-c5c1-4776-944a-b50fe2c37f06',
        'Name': 'Archived',
        'status':
          [
            {
              'Id': '6e7df31b-5f6a-4029-91e0-5561807164da',
              'StatusName': 'Pending',
            },
            {
              'Id': 'fc7178dd-c5c1-4776-944a-b50fe2c37f06',
              'StatusName': 'Archieve',
            },
            {
              'Id': '1625a5c1-b41a-4f6e-91ad-e4aa0c61121c',
              'StatusName': 'Deleted',
            },
          ],
      },
    ];

    this.tenantList = status;

    // const getAllTenant = this.apiService.getData(this.apiService.getAllTenantContent).subscribe((response) => {
    //   this.tenantList = response['body'];
    // })
    // const getAllTenant = this.apiService.getJsonData('assets/json_data/status.json').
    //   subscribe((response) => {
    //   this.tenantList = response['body'];
    // });

  }

  selectedValue() {
    const selectValue = this.selectedValue;
  }

  getSingleEditUserDetails(id, status) {
    if (!sessionStorage.clientList || sessionStorage.clientList === "") {
      const getClientDetailsbyIdApi = String.Format(this.apiService.getClientDetailById, id);
      this.apiService.getDataList(getClientDetailsbyIdApi, 1, 1, null, null, null).
        subscribe((response) => {
          this.editClientDetails = response['body'];
          this.setDataToEdit();
        }, (error) => {
          if (error instanceof HttpErrorResponse) {
            this.toast.danger(error.error.message, 'Try Again');
          } else {
            this.toast.danger(error, 'Try Again');
          }
        });
    } else {
      this.editClientDetails = JSON.parse(sessionStorage.clientList);
      this.setDataToEdit();
    }
  }

  setDataToEdit() {
    if (this.editClientDetails) {
      if (this.editClientDetails.Subscriptions && this.editClientDetails.Subscriptions.length > 0) {
        this.package = this.editClientDetails.Subscriptions[0].Name;
      }
      if (this.editClientDetails.Name !== null) {
        this.clientEditForm.get('company').setValue(
          this.editClientDetails.Name[0].toUpperCase() + this.editClientDetails.Name.substr(1).toUpperCase());
      }
      if (this.editClientDetails.ContactEmail !== null) {
        this.clientEditForm.get('email').setValue(this.editClientDetails.ContactEmail);
      }
      if (this.editClientDetails.OrgSuperUser !== null) {
        if (this.editClientDetails.OrgSuperUser.EmailAddress !== null) {
          this.clientEditForm.get('userEmail').setValue(this.editClientDetails.OrgSuperUser.EmailAddress);
        }
        if (this.editClientDetails.ContactPhone !== null) {
          this.clientEditForm.get('phone').setValue(this.editClientDetails.ContactPhone);
        }
        if (this.editClientDetails.OrgSuperUser.PrimaryPhone !== null) {
          this.clientEditForm.get('userPhone').setValue(this.editClientDetails.OrgSuperUser.PrimaryPhone);
        }
        if (this.editClientDetails.StartDate !== null) {
          const startDate = this.editClientDetails.StartDate;
          this.clientEditForm.controls.startDate.setValue(startDate);
          const createdDate = this.editClientDetails.SystemSetting[0].CreatedDate;
          this.minStartDate = createdDate;
          this.maxStartDate = this.editClientDetails.EndDate;
        }
        if (this.editClientDetails.EndDate !== null) {
          const expiryDate = this.editClientDetails.EndDate;
          this.clientEditForm.get('expiryDate').setValue(expiryDate);
          this.minExpiryDate = this.clientEditForm.get('startDate').value;
        }
        if (this.editClientDetails.OrgSuperUser.FirstName !== null) {
          this.clientEditForm.get('firstname').setValue(this.editClientDetails.OrgSuperUser.FirstName);
        }
        if (this.editClientDetails.OrgSuperUser.LastName !== null) {
          this.clientEditForm.get('lastname').setValue(this.editClientDetails.OrgSuperUser.LastName);
        }
      }

      if (this.editClientDetails.Address1 !== null && this.editClientDetails.Address1 !== '') {
        if (this.editClientDetails.Address2 !== null && this.editClientDetails.Address2 !== '') {
          this.clientEditForm.get('street').setValue(
            this.editClientDetails.Address1[0].toUpperCase() + this.editClientDetails.Address1.substr(1).toLowerCase() + ' , '
          + this.editClientDetails.Address2[0].toUpperCase() + this.editClientDetails.Address2.substr(1).toLowerCase());
        } else {
          this.clientEditForm.get('street').setValue(
            this.editClientDetails.Address1[0].toUpperCase() + this.editClientDetails.Address1.substr(1).toLowerCase());
        }
      }
      if (this.editClientDetails.Country) {
        this.clientEditForm.get('country').setValue(
          this.editClientDetails.Country[0] + this.editClientDetails.Country.substr(1).toLowerCase());
      }
      if (this.editClientDetails.State) {
        this.clientEditForm.get('state').setValue(
          this.editClientDetails.State[0].toUpperCase() + this.editClientDetails.State.substr(1).toLowerCase());
      }
      if (this.editClientDetails.City) {
        this.clientEditForm.get('city').setValue(
          this.editClientDetails.City[0].toUpperCase() + this.editClientDetails.City.substr(1).toLowerCase());
      }
      if (this.editClientDetails.Postalcode !== null) {
        this.clientEditForm.get('postalCode').setValue(this.editClientDetails.Postalcode);
      }
      if (this.editClientDetails.OrgSuperUser !== null) {
        this.clientEditForm.get('userPhone').setValue(this.editClientDetails.OrgSuperUser.PrimaryPhone);
      }
      this.tenantList.map((element: any) => {
        if (element.Id === this.editClientDetails.StatusId) {
          this.subStatus = element.status;
        }
      });
      this.clientEditForm.get('status').setValue(this.editClientDetails.StatusId);
      if (this.dataTransfer.key && this.dataTransfer.value) {
        this.subId = this.dataTransfer.key;
        this.subName = this.dataTransfer.value;
        this.dataTransfer.key = '';
        this.dataTransfer.value = '';
      } else {
        this.subId = this.editClientDetails.Subscriptions[0].Id;
        this.subName = this.editClientDetails.Subscriptions[0].Name;
      }
      this.clientEditForm.get('userEmail').disable();
      this.imageLink = this.editClientDetails.ImageUrl;
    }
  }

  saveForm() {

    if (this.clientEditForm.valid) {
      const str_client = this.clientEditForm.value.street.split(',');
      const select = this.statusElement.nativeElement;
      const statusText = select.options[select.selectedIndex].innerText;
      const paramsClient = {
        Id: this.id,
        Name: this.editClientDetails.Name,
        ContactEmail: this.clientEditForm.get('email').value,
        ContactPhone: this.clientEditForm.get('phone').value,
        Address1: str_client[0],
        Address2: str_client[1],
        State: this.clientEditForm.get('state').value,
        Country: this.clientEditForm.get('country').value,
        City: this.clientEditForm.get('city').value,
        Postalcode: this.clientEditForm.get('postalCode').value,
        IsActive: true,
        Status: statusText,
        StatusId: this.clientEditForm.get('status').value,
        CurrentUser: this.userId,
      };

      const paramsUser = {
        Id: this.editClientDetails.OrgSuperUser.Id,
        FirstName: this.clientEditForm.get('firstname').value,
        LastName: this.clientEditForm.get('lastname').value,
        EmailAddress: this.clientEditForm.get('userEmail').value,
        PrimaryPhone: this.clientEditForm.get('userPhone').value,
        Password: this.editClientDetails.OrgSuperUser.Password,
        TenantId: this.id,
        IsActive: this.editClientDetails.OrgSuperUser.IsActive,
        ImageUrl: this.editClientDetails.OrgSuperUser.ImageUrl,
        Position: this.editClientDetails.OrgSuperUser.Position,
        StatusId: this.editClientDetails.OrgSuperUser.StatusId,
        CurrentUser: this.userId,
        Roles: [{
          Id: this.editClientDetails.OrgSuperUser.Roles[0].Id,
        }],
      };
      const paramSettings = {
        Id: this.editClientDetails.SystemSetting[0].Id,
        Name: this.editClientDetails.SystemSetting[0].Name,
        EmailSettingId: this.editClientDetails.SystemSetting[0].EmailSetting.Id,
        SubscriptionId: this.subId,
        TenantId: this.id,
        StartDate: (new Date(this.clientEditForm.get('startDate').value)).toLocaleString(),
        EndDate: (new Date(this.clientEditForm.get('expiryDate').value)).toLocaleString(),
        EmailSetting: {},
        IsUserLoggedIn: false,
        UserId: this.userId,
      };
      this.editClient(paramsClient, paramsUser, paramSettings);
    }
  }

  editClient(paramsClient, paramsUser, paramSettings) {
    this.apiService.putData(this.apiService.editClient, paramsClient).subscribe(response => {
      if (response) {
        this.editSubscriptions(paramSettings, paramsUser);
      }
    }, error => {
      this.toast.danger('', error.error.Message);
    });
  }

  editSubscriptions(paramSettings, paramsUser) {
    this.apiService.putData(this.apiService.editClientSettings, paramSettings).subscribe(response => {
      if (response) {
        this.editUser(paramsUser);
      }
    }, error => {
      this.toast.danger('', error.error.Message);
    });
  }

  editUser(user) {
    this.apiService.putData(this.apiService.editUser + '&rolestatus=false', user).subscribe(response => {
      if (response) {
        this.toast.success('Client Edited', 'Success');
        this.router.navigate(['app/clients']);
      }
    }, error => {
      this.toast.danger('', error.error.Message);
    });
  }


  emailvalidation(email) {

    const emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    if (!emailReg.test(email)) {
      if (email === this.clientEditForm.get('email').value) {
        this.validEmail = false;
      }
      if (email === this.clientEditForm.get('userEmail').value) {
        this.validUserEmail = false;
      }
    } else {
      this.validEmail = true;
      this.validUserEmail = true;
    }
  }

  formatPhone() {
    if (this.clientEditForm.get('phone').errors) {
      this.validPhone = false;
    } else {
      this.validPhone = true;
    }
  }

  formatUserPhone() {
    if (this.clientEditForm.get('userPhone').errors) {
      this.validUserPhone = false;
    } else {
      this.validUserPhone = true;
    }
  }

  archivedClick() {
    const clientForm = this.clientEditForm.controls;
    const str_client = this.clientEditForm.value.street.split(',');
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
      CurrentUser: this.userId,
      Subscriptions: [
        {
          Id: this.editClientDetails.Subscriptions[0].Id,
          StartDate: this.clientEditForm.get('startDate').value,
          EndDate: this.clientEditForm.get('expiryDate').value,
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

  clientSave() {
    this.formSubmitted = true;
    this.saveForm();
  }

  subscriptionPlanClick() {
    this.router.navigate(['app/clients/subscription/' + this.id]);
  }

  startDateChange() {
    this.minExpiryDate = this.clientEditForm.get('startDate').value;
  }

  expiryDateChange() {
    this.maxStartDate = this.clientEditForm.get('expiryDate').value;
  }
}
