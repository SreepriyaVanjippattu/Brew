import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
declare const require: any;
const jsPDF = require('jspdf');
require('jspdf-autotable');
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';

@Component({
  selector: 'active-client-user-report',
  templateUrl: './active-client-user-report.component.html',
  styleUrls: ['./active-client-user-report.component.scss']
})
export class ActiveClientUserReportComponent implements OnInit {

  formSubmitted = false;
  activeClientReport: FormGroup;
  minStartDate;
  maxStartDate;
  minEndDate;
  maxEndDate;
  startDate;
  endDate;
  isValidDate: any;
  dateError: any;
  isError: any;
  package_city;
  minExpiryDate;
  maxExpiryDate;
  activeClients: any;
  package_pack: any;
  package_province: any;
  currentUser: any;
  subList: [];
  startDateCheck;

  constructor(private forms: FormBuilder, private apiService: ApiProviderService, private datepipe: DatePipe, private router: Router) { }
  @ViewChild('pdfDiv', { static: false }) pdfDiv: ElementRef;
  createForm() {
    this.activeClientReport = this.forms.group({
      startDate: [''],
      endDate: [''],
      package_pack: [''],
      package_city: [''],
      package_province: [''],
      expiryDate: [''],

    });
  }
  ngOnInit() {
    const userDetails = JSON.parse(sessionStorage.getItem('user'));
    this.currentUser = userDetails['UserProfile'].Id;
    this.createForm();
    this.getSubscriptions();
    const firstDate = new Date(new Date().setDate(1));
    let secDate = new Date(new Date().setMonth(firstDate.getMonth() + 1));
    secDate = new Date(secDate.setDate(1));
    secDate =  new Date(secDate.setDate(secDate.getDate() - 1));

    this.activeClientReport.get('startDate').setValue(firstDate);
    this.activeClientReport.get('endDate').setValue(secDate);
    this.minEndDate = new Date (this.activeClientReport.get('startDate').value);
    this.maxStartDate = new Date (this.activeClientReport.get('endDate').value);
    this.activeClientLists(firstDate,secDate,this.package_pack);
  }
  startDateChange() {
    this.minEndDate = new Date (this.activeClientReport.get('startDate').value);

  }
  endDateChange() {
    this.maxStartDate = new Date (this.activeClientReport.get('endDate').value);
  }

  expiryDateChange() {
    this.minExpiryDate = this.datepipe.transform(new Date(this.activeClientReport.get('expiryDate').value), 'd/MMM/y');
  }
  validateDates(sDate: string, eDate: string) {
    this.isValidDate = true;
    this.dateError = '';
    this.isError = false;
    const startDate = this.activeClientReport.get('startDate').value;
    const endDate = this.activeClientReport.get('endDate').value;
    if ((startDate === undefined || endDate === undefined) || startDate === '' || endDate === '') {
      this.dateError = 'Date is required.';
      this.isValidDate = false;
      this.isError = true;
    }

    // if ((sDate != null && eDate != null) && (eDate) < (sDate)) {
    //   this.dateError = 'To date should be greater than from date.';
    //   this.isError = true;
    //   this.isValidDate = false;
    // }
    return this.isValidDate;
  }


  activeClientLists(minStartDate, minEndDate, package_pack) {

    this.validateDates(minStartDate, minEndDate);
    if (this.isValidDate === true) {
      const startDate = this.datepipe.transform(new Date(this.activeClientReport.get('startDate').value), 'd/MMM/y');
      const endDate = this.datepipe.transform(new Date(this.activeClientReport.get('endDate').value), 'd/MMM/y');
      this.package_pack = this.activeClientReport.get('package_pack').value;
      this.package_city = this.activeClientReport.get('package_city').value;
      this.package_province = this.activeClientReport.get('package_province').value;
      this.apiService.activeClientList(
        this.apiService.getAllActiveClientsReport, this.currentUser, startDate, endDate, this.package_pack, this.package_city,
        this.package_province,
        // minExpiryDate,
      ).subscribe((response) => {
        if (response && response['body']) {
          this.activeClients = response['body'];

          this.activeClients.map(client => {
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
  }


  onCancelClick() {
    this.router.navigate(['app/reports-admin']);
  }

  downloadAsPDF() {

    var doc = new jsPDF('p', 'pt','a4');

    var res = doc.autoTableHtmlToJson(document.getElementById('table'));
    var height = doc.internal.pageSize.height;
    doc.text('Active-Client Report', 50, 50);
    const startDate = this.datepipe.transform(new Date(this.activeClientReport.get('startDate').value), 'd/MMM/y');
    const endDate = this.datepipe.transform(new Date(this.activeClientReport.get('endDate').value), 'd/MMM/y');
    var package_pack = (this.package_pack) ? this.package_pack : 'All';
    // var package_city = (this.package_city) ? this.package_city : 'All';
    // var package_province = (this.package_province) ? this.package_province : 'All';
    // var expiryDate = (this.minExpiryDate) ? this.minExpiryDate : 'All';

    doc.setFontSize(12);
    doc.text(50, 70, 'From: ' + startDate);
    doc.setFontSize(12);
    doc.text(50, 90, 'To: ' + endDate);
    doc.setFontSize(12);
    doc.text(50, 110, 'Package: ' + package_pack);
    // doc.setFontSize(12);
    // doc.text(50, 130, 'City: ' + package_city);
    // doc.setFontSize(12);
    // doc.text(50, 150, 'Province: ' + package_province);
    // doc.setFontSize(12);
    // doc.text(50, 170, 'Expiry Date: ' + expiryDate);

    doc.autoTable(res.columns, res.data, {
      startY: 140, theme: 'grid',
     // tableWidth: 'auto', cellWidth: 'wrap',
      //  showHeader: 'everyPage',
      tableLineColor: 200, tableLineWidth: 0,
      columnStyles: {
        0: { cellWidth: 50 }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 50 }, 3:
          { cellWidth: 'auto' }, 4: { cellWidth: 'auto' },
        5: { cellWidth: 'auto' }, 6: { cellWidth: 'auto' }, 7: { cellWidth: 'auto' },
        8: { cellWidth: 'auto' },
      },
      headStyles: { theme: 'grid' },
      styles: {
        overflow: 'linebreak', cellWidth: 'wrap', font: 'arial',
        fontSize: 10,
        cellPadding: 5, overflowColumns: 'linebreak',
      },
    });
    doc.save('Active-Client.pdf');

  }

  getSubscriptions() {
    this.apiService.getData(this.apiService.getSubscriptions).subscribe((response: any) => {
      this.subList = response['body'];
    });
  }

//   startTimeValidate() {
//     console.log('start', this.activeClientReport.get('startDate').value);
// if (this.activeClientReport.get('startDate').value > this.activeClientReport.get('endDate').value) {
//   this.startDateCheck = true;
// } else {
//   this.startDateCheck = false;
// }
// console.log(' this.startDateCheck',  this.startDateCheck);
//   }

}
