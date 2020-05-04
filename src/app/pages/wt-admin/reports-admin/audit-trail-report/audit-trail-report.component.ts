import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { DatePipe } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
declare const require: any;
const jsPDF = require('jspdf');
require('jspdf-autotable');

@Component({
  selector: 'audit-trail-report',
  templateUrl: './audit-trail-report.component.html',
  styleUrls: ['./audit-trail-report.component.scss']
})
export class AuditTrailReportComponent implements OnInit {
  formSubmitted = false;
  auditTrailReport: FormGroup;
  auditTrailList;
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
  createForm() {
    this.auditTrailReport = this.forms.group({
      startDate: [''],
      endDate: [''],
      activity: ['ALL'],

    });
  }
  ngOnInit() {
    const userDetails = JSON.parse(sessionStorage.getItem('user'));
    this.currentUser = userDetails['UserProfile'].Id;
    this.createForm();

    const firstDate = new Date(new Date().setDate(1));
    let secDate = new Date(new Date().setMonth(firstDate.getMonth() + 1));
    secDate = new Date(secDate.setDate(1));
    secDate =  new Date(secDate.setDate(secDate.getDate() - 1));

    this.auditTrailReport.get('startDate').setValue(firstDate);
    this.auditTrailReport.get('endDate').setValue(secDate);
    this.minEndDate = new Date (this.auditTrailReport.get('startDate').value);
    this.maxStartDate = new Date (this.auditTrailReport.get('endDate').value);
    this.auditTrailLists();
  }
  startDateChange() {
    this.minEndDate = new Date (this.auditTrailReport.get('startDate').value);
  }
  endDateChange() {
    this.maxStartDate = new Date (this.auditTrailReport.get('endDate').value);
  }

  validateDates() {
    this.isValidDate = true;
    this.dateError = '';
    this.isError = false;
    const startDate = this.auditTrailReport.get('startDate').value;
    const endDate = this.auditTrailReport.get('endDate').value;

    if ((startDate === null || endDate === null ) || (startDate === '' || endDate === '')) {
      this.dateError = 'Date is required.';
      this.isValidDate = false;
      this.isError = true;
    }
    return this.isValidDate;
  }


  auditTrailLists() {
    this.validateDates();
    if (this.isValidDate === true) {
      const startDate = this.datepipe.transform(new Date(this.auditTrailReport.get('startDate').value), 'd/MMM/y');
      const endDate = this.datepipe.transform(new Date(this.auditTrailReport.get('endDate').value), 'd/MMM/y');
      const activity = this.auditTrailReport.get('activity').value;
    this.apiService.auditTrailList(this.apiService.getAllAuditTrailReport, startDate, endDate,
      this.currentUser, activity).subscribe((response) => {
      if (response && response['body']) {
        this.auditTrailList = response['body'];
      }
    });
  }
  }


  onCancelClick() {
    this.router.navigate(['app/reports-admin']);
  }

  downloadAsPDF() {

    const doc = new jsPDF('p', 'pt');

    const res = doc.autoTableHtmlToJson(document.getElementById('table'));
    const height = doc.internal.pageSize.height;
    doc.text('Audit-Trail Report', 50, 50);
    const startDate = this.datepipe.transform(new Date(this.auditTrailReport.get('startDate').value), 'd/MMM/y');
    const endDate = this.datepipe.transform(new Date(this.auditTrailReport.get('endDate').value), 'd/MMM/y');
    const activity = this.auditTrailReport.get('activity').value;

    const from = (startDate) ? startDate : 'All';
    const to = (endDate) ? endDate : 'All';
    const activityi = (activity) ? activity : 'All';
    doc.setFontSize(12);
    doc.text(50, 70, 'From: ' + from);
    doc.setFontSize(12);
    doc.text(50, 90, 'To: ' + to);
    doc.setFontSize(12);
    doc.text(50, 110, 'Activity: ' + activityi);

    doc.autoTable(res.columns, res.data, {
      startY: 140, theme: 'grid',
      tableWidth: 'auto', cellWidth: 'wrap',
      //  showHeader: 'everyPage',
      tableLineColor: 200, tableLineWidth: 0,
      columnStyles: {
        0: { cellWidth: 50 }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 'auto' }, 3:
          { cellWidth: 'auto' }, 4: { cellWidth: 'auto' },
        5: { cellWidth: 'auto' }, 6: { cellWidth: 'auto' }, 7: { cellWidth: 'auto' },
      },
      headStyles: { theme: 'grid' },
      styles: {
        overflow: 'linebreak', cellWidth: 'wrap', font: 'arial',
        fontSize: 10,
        cellPadding: 8, overflowColumns: 'linebreak'
      },
    });
    doc.save('Audit-Trail.pdf');

  }


}
