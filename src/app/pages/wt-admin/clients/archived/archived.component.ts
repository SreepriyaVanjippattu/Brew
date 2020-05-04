import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PhoneFormatPipe } from '../../../../core/utils/phone-format.pipe';
import { StatusUse } from '../../../../models/status-id-name';

@Component({
  selector: 'archived',
  templateUrl: './archived.component.html',
  styleUrls: ['./archived.component.scss'],
})
export class ArchivedComponent implements OnInit {

  id: string;
  beginDate;
  editClientDetails;
  validPhone = true;
  validEmail: boolean;
  status = StatusUse;
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
    private phonePipe: PhoneFormatPipe,
  ) { }

  clientEditForm = this.forms.group({
    company: [''],
    email: ['', [Validators.required]],
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
    phone: ['', [Validators.required]],
    userId: [''],
    password: [''],
  });

  ngOnInit() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    this.userProfile = user['UserProfile'];
    this.currentUser = this.userProfile.Id;
    this.id = this.route.snapshot.paramMap.get('id');
    this.getSingleEditUserDetails(this.id);
  }

  get form() {
    return this.clientEditForm.controls;
  }

  getSingleEditUserDetails(id) {
    this.apiService.getData(this.apiService.getAllArchivedClients).subscribe(response => {
      this.editClientDetails = response['body'];

      this.editClientDetails.forEach(element => {
        if (element.Id === id) {
          this.editClientDetails = element;
        }
      });
      this.setDataToEdit();
    }, error => {
      console.error(error);
    });
  }

  setDataToEdit() {
    this.clientEditForm.get('company').setValue(this.editClientDetails.Name);
    this.clientEditForm.get('email').setValue(this.editClientDetails.ContactEmail);
    this.clientEditForm.get('phone').setValue(this.editClientDetails.OrgSuperUser.PrimaryPhone);
    this.clientEditForm.get('startDate').setValue(this.editClientDetails.startDate);
    this.clientEditForm.get('expiryDate').setValue(this.editClientDetails.expiry);
    this.clientEditForm.get('street').setValue(this.editClientDetails.Address1 + ' , ' + this.editClientDetails.Address2);
    this.clientEditForm.get('city').setValue(this.editClientDetails.City);
    this.clientEditForm.get('state').setValue(this.editClientDetails.State);
    this.clientEditForm.get('country').setValue(this.editClientDetails.Country);
    this.clientEditForm.get('postalCode').setValue(this.editClientDetails.Postalcode);
    this.clientEditForm.get('firstname').setValue(this.editClientDetails.OrgSuperUser.FirstName);
    this.clientEditForm.get('lastname').setValue(this.editClientDetails.OrgSuperUser.LastName);
    this.clientEditForm.get('userEmail').setValue(this.editClientDetails.OrgSuperUser.EmailAddress);
    this.clientEditForm.get('phone').setValue(this.editClientDetails.OrgSuperUser.PrimaryPhone);
    this.clientEditForm.get('userId').setValue(this.editClientDetails.OrgSuperUser.EmailAddress);
    // this.clientEditForm.get('password').setValue(this.editClientDetails.OrgSuperUser.Password);
    this.imageLink = this.editClientDetails.ImageUrl;
  }

  restoreClick() {
    const archiveForm = this.clientEditForm.controls;

    const params = {
      Id: this.id,
      Name: archiveForm.company.value,
      ContactEmail: archiveForm.email.value,
      ContactPhone: archiveForm.phone.value,
      Address1: this.editClientDetails.Address1,
      Address2: this.editClientDetails.Address2,
      State: archiveForm.state.value,
      Country: archiveForm.country.value,
      City: archiveForm.city.value,
      Postalcode: archiveForm.postalCode.value,
      IsActive: true,
      // ImageUrl: this.editClientDetails.ImageUrl,
      Status: this.status.pending.name,
      StatusId: this.status.pending.id,
      CurrentUser: this.currentUser,
    };
    this.apiService.putData(this.apiService.editClient, params).subscribe(response => {
      if (response) {
        this.router.navigate(['app/clients']);
      }
    }, error => {
    });
  }

  clientSave() {
    this.router.navigate(['app/clients']);
  }

  subscriptionPlanClick() {
    this.router.navigate(['app/clients/subscription']);
  }

  formatPhone(value) {
    if (this.clientEditForm.get('phone').valid) {
      const transformPhone = this.phonePipe.transform(value);
      this.clientEditForm.get('phone').setValue(transformPhone);
      this.validPhone = true;
    } else {
      this.validPhone = false;
    }
  }

  unformatPhone() {
    let phone = this.clientEditForm.get('phone').value;
    if (phone) {
      phone = phone.replace(/\s+/g, '').replace(/[^-\w]+/g, '').toLowerCase();
      phone = phone.replace('-', '').toLowerCase();
      this.clientEditForm.get('phone').setValue(phone);
      if (phone.length >= 10) {
        phone = phone.substr(phone.length - 10);
        this.clientEditForm.get('phone').setValue(phone);
      }
    }
  }

  emailvalidation(email) {
    const emailReg = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
    if (!emailReg.test(email)) {
      this.validEmail = false;
    } else {
      this.validEmail = true;
    }
  }
}
