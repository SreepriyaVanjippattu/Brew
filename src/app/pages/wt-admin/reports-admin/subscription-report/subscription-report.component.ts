import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { DatePipe } from '@angular/common';
// import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
// import 'jspdf-autotable';
import { Router, ActivatedRoute } from '@angular/router';
// declare var jsPDF: any;
declare const require: any;
const jsPDF = require('jspdf');
require('jspdf-autotable');

@Component({
  selector: 'subscription-report',
  templateUrl: './subscription-report.component.html',
  styleUrls: ['./subscription-report.component.scss']
})
export class SubscriptionReportComponent implements OnInit {
  subscriptionLists;
  tenantId;
  subscriptionReport: FormGroup;
  minStartDate;
  maxStartDate;
  minEndDate;
  maxEndDate;
  startDate;
  endDate;
  isValidDate: any;
  dateError: any;
  isError: any;
  status: string;
  package: string;
  currentUser: any;
  subList = [];

  constructor(private forms: FormBuilder, private apiService: ApiProviderService, private datepipe: DatePipe, private router: Router) { }
  @ViewChild('pdfDiv', { static: false }) pdfDiv: ElementRef;
  createForm() {
    this.subscriptionReport = this.forms.group({
      startDate: [''],
      endDate: [''],
      status: [''],
      package: [''],
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

    this.subscriptionReport.get('startDate').setValue(firstDate);
    this.subscriptionReport.get('endDate').setValue(secDate);
    this.minEndDate = new Date (this.subscriptionReport.get('startDate').value);
    this.maxStartDate = new Date (this.subscriptionReport.get('endDate').value);
    this.subscriptionList(firstDate, secDate);
  }
  startDateChange() {
    this.minEndDate = new Date (this.subscriptionReport.get('startDate').value);
  }
  endDateChange() {
    this.maxStartDate = new Date (this.subscriptionReport.get('endDate').value);
  }

  validateDates(sDate: string, eDate: string) {
    this.isValidDate = true;
    this.dateError = '';
    this.isError = false;
    const startDate = this.subscriptionReport.get('startDate').value;
    const endDate = this.subscriptionReport.get('endDate').value;

    if ((startDate === null || endDate === null ) || (startDate === '' || endDate === '')) {
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

  subscriptionList(minStartDate, minEndDate) {
    this.validateDates(minStartDate, minEndDate);
    if (this.isValidDate === true) {
      const startDate = this.datepipe.transform(new Date(this.subscriptionReport.get('startDate').value), 'd/MMM/y');
      const endDate = this.datepipe.transform(new Date(this.subscriptionReport.get('endDate').value), 'd/MMM/y');

      this.status = this.subscriptionReport.get('status').value;
      this.package =  this.subscriptionReport.get('package').value;
      this.apiService.loginUserList(this.apiService.getAllTenantSubscriptionReport, this.currentUser, startDate, endDate,
       this.package, this.status)
    .subscribe((response) => {
      if (response && response['body']) {
        this.subscriptionLists = response['body'];
        this.subscriptionLists.map(client => {
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

    var doc = new jsPDF('p', 'pt');

    var res = doc.autoTableHtmlToJson(document.getElementById('table'));
    var height = doc.internal.pageSize.height;
    doc.text('Subscription Report', 50, 50);
    const startDate = this.datepipe.transform(new Date(this.subscriptionReport.get('startDate').value), 'd/MMM/y');
    const endDate = this.datepipe.transform(new Date(this.subscriptionReport.get('endDate').value), 'd/MMM/y');
    var sub_package = (this.package) ? this.package : 'All';
    var status = (this.status) ? this.status : 'All';
    doc.setFontSize(12);
    doc.text(50, 70, 'From: ' + startDate);
    doc.setFontSize(12);
    doc.text(50, 90, 'To: ' + endDate);
    doc.setFontSize(12);
    doc.text(50, 110, 'Package: ' + sub_package);
    doc.setFontSize(12);
    doc.text(50, 130, 'Status: ' + status);

    doc.autoTable(res.columns, res.data, {
      startY: 140, theme: 'grid',
      tableWidth: 'auto', cellWidth: 'wrap',
      //  showHeader: 'everyPage',
      tableLineColor: 200, tableLineWidth: 0,
      columnStyles: {
        0: { cellWidth: 30 }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 'auto' }, 3:
          { cellWidth: 'auto' }, 4: { cellWidth: 'auto' },
        5: { cellWidth: 'auto' }, 6: { cellWidth: 'auto' },
         7: { cellWidth: 'auto' },
      },
      headStyles: { theme: 'grid' },
      styles: {
        overflow: 'linebreak', cellWidth: 'wrap', font: 'arial',
        fontSize: 10,
        cellPadding: 2, overflowColumns: 'linebreak'
      },
    });
    doc.save('Subscription.pdf');

  }
  getSubscriptions() {
    this.apiService.getData(this.apiService.getSubscriptions).subscribe((response: any) => {
      this.subList = response['body'];
    });
  }
}
