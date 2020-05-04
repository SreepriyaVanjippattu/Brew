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
  selector: 'login-logout-report',
  templateUrl: './login-logout-report.component.html',
  styleUrls: ['./login-logout-report.component.scss']
})
export class LoginLogoutReportComponent implements OnInit {

  loginLogoutLists;
  tenantId;
  loginLogoutReport: FormGroup;
  minStartDate;
  maxStartDate;
  minEndDate;
  maxEndDate;
  startDate;
  endDate;
  isValidDate: any;
  dateError: any;
  isError: any;
  currentUser: any;

  constructor(private forms: FormBuilder, private apiService: ApiProviderService, private datepipe: DatePipe, private router: Router) { }
  @ViewChild('pdfDiv', { static: false }) pdfDiv: ElementRef;
  title = 'Excel';
  createForm() {
    this.loginLogoutReport = this.forms.group({
      startDate: [''],
      endDate: [''],

    });
  }
  ngOnInit() {
    this.createForm();
    const userDetails = JSON.parse(sessionStorage.getItem('user'));
    this.currentUser = userDetails['UserProfile'].Id;

    const firstDate = new Date(new Date().setDate(1));
    let secDate = new Date(new Date().setMonth(firstDate.getMonth() + 1));
    secDate = new Date(secDate.setDate(1));
    secDate =  new Date(secDate.setDate(secDate.getDate() - 1));

    this.loginLogoutReport.get('startDate').setValue(firstDate);
    this.loginLogoutReport.get('endDate').setValue(secDate);
    this.minEndDate = new Date (this.loginLogoutReport.get('startDate').value);
    this.maxStartDate = new Date (this.loginLogoutReport.get('endDate').value);
    this.loginLogoutList(firstDate, secDate);

  }
  startDateChange() {
    this.minEndDate = new Date (this.loginLogoutReport.get('startDate').value);

  }
  endDateChange() {
    this.maxStartDate = new Date (this.loginLogoutReport.get('endDate').value);
  }

  validateDates(sDate: string, eDate: string) {
    this.isValidDate = true;
    this.dateError = '';
    this.isError = false;
    const startDate = this.loginLogoutReport.get('startDate').value;
    const endDate = this.loginLogoutReport.get('endDate').value;
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

  loginLogoutList(minStartDate, minEndDate) {
    this.validateDates(minStartDate, minEndDate);
    if (this.isValidDate === true) {
      const startDate = this.datepipe.transform(new Date(this.loginLogoutReport.get('startDate').value), 'd/MMM/y');
      const endDate = this.datepipe.transform(new Date(this.loginLogoutReport.get('endDate').value), 'd/MMM/y');
      const CurrentUser = this.currentUser;
    this.apiService.loginUserList(this.apiService.getAllLoginLogoutReport, CurrentUser, startDate, endDate).subscribe((response) => {
      if (response && response['body']) {
        this.loginLogoutLists = response['body'];
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
    doc.text('Login-Logout Report', 50, 50);
    const startDate = this.datepipe.transform(new Date(this.loginLogoutReport.get('startDate').value), 'd/MMM/y');
    const endDate = this.datepipe.transform(new Date(this.loginLogoutReport.get('endDate').value), 'd/MMM/y');
    doc.setFontSize(12);
    doc.text(50, 70, 'From: ' + startDate);
    doc.setFontSize(12);
    doc.text(50, 90, 'To: ' + endDate);

    doc.autoTable(res.columns, res.data, {
      startY: 120, theme: 'grid',
      tableWidth: 'auto', cellWidth: 'wrap',
      //  showHeader: 'everyPage',
      tableLineColor: 200, tableLineWidth: 0,
      columnStyles: {
        0: { cellWidth: 50 }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 'auto' }, 3:
          { cellWidth: 'auto' }, 4: { cellWidth: 'auto' },
        5: { cellWidth: 'auto' }, 6: { cellWidth: 'auto' },
      },
      headStyles: { theme: 'grid' },
      styles: {
        overflow: 'linebreak', cellWidth: 'wrap', font: 'arial',
        fontSize: 10,
        cellPadding: 8, overflowColumns: 'linebreak'
      },
    });
    doc.save('Login-Logout.pdf');

  }
}
