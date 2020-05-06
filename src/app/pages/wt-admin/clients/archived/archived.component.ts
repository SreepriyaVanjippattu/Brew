import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { PhoneFormatPipe } from '../../../../core/utils/phone-format.pipe';
import { StatusUse } from '../../../../models/status-id-name';
import { String } from "typescript-string-operations";
import { NbToastrService } from '@nebular/theme';

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
    private toast: NbToastrService,
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
    this.userProfile = user['userDetails'];
    this.currentUser = this.userProfile.userId;
    this.id = this.route.snapshot.paramMap.get('id');
    this.getSingleEditUserDetails(this.id);
  }

  get form() {
    return this.clientEditForm.controls;
  }

  getSingleEditUserDetails(id) {
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
  }

  setDataToEdit() {
    this.clientEditForm.get('company').setValue(this.editClientDetails.name);
    this.clientEditForm.get('email').setValue(this.editClientDetails.contactEmail);
    this.clientEditForm.get('phone').setValue(this.editClientDetails.contactPhone);
    let startDate = this.editClientDetails.startDate;
    startDate = this.datepipe.transform(new Date(startDate), 'dd/MM/yyyy  hh:mm:ss a');
    this.clientEditForm.get('startDate').setValue(startDate);
    let expiryDate = this.editClientDetails.endDate;
    expiryDate = this.datepipe.transform(new Date(expiryDate), 'dd/MM/yyyy  hh:mm:ss a');
    this.clientEditForm.get('expiryDate').setValue(expiryDate);
    this.clientEditForm.get('street').setValue(this.editClientDetails.address1 + ' , ' + this.editClientDetails.address2);
    this.clientEditForm.get('city').setValue(this.editClientDetails.city);
    this.clientEditForm.get('state').setValue(this.editClientDetails.state);
    this.clientEditForm.get('country').setValue(this.editClientDetails.country);
    this.clientEditForm.get('postalCode').setValue(this.editClientDetails.postalcode);
    this.clientEditForm.get('firstname').setValue(this.editClientDetails.orgSuperUser.firstName);
    this.clientEditForm.get('lastname').setValue(this.editClientDetails.orgSuperUser.lastName);
    this.clientEditForm.get('userEmail').setValue(this.editClientDetails.orgSuperUser.emailAddress);
    this.clientEditForm.get('phone').setValue(this.editClientDetails.orgSuperUser.primaryPhone);
    this.clientEditForm.get('userId').setValue(this.editClientDetails.orgSuperUser.emailAddress);
    // this.clientEditForm.get('password').setValue(this.editClientDetails.OrgSuperUser.Password);
    this.imageLink = this.editClientDetails.imageUrl;
  }

  restoreClick() {
    const params = {
      clientID: this.editClientDetails.id,
      statusID: this.status.pending.id,
      currentUser: this.currentUser,
    };
    this.apiService.putData(this.apiService.editClientStatus, params).subscribe((response: any) => {
      if (response.status === 200) {
        this.toast.show('Client Restored', 'Success');
        this.router.navigate(['app/clients']);
      }
    },
      (error) => {
        if (error instanceof HttpErrorResponse) {
          this.toast.danger(error.error.message, 'Try Again');
        } else {
          this.toast.danger(error, 'Try Again');
        }
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
