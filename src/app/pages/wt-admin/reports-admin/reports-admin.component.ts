import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ApiProviderService } from '../../../core/api-services/api-provider.service'

@Component({
  selector: 'app-reports-admin',
  templateUrl: './reports-admin.component.html',
  styleUrls: ['./reports-admin.component.scss'],
})
export class ReportsAdminComponent implements OnInit {
  reportList;
  maxSize: number = 5;
  next;
  previous;
  config = {
    itemsPerPage: 5,
    currentPage: 1,
    totalItems: this.reportList,
  };
  lastRundate: any;

  constructor(
    private httpService: HttpClient,
    private apiService: ApiProviderService,
    private router: Router,
  ) { }

  ngOnInit() {
   this.getAllLastRunReportList();
  }
  getReportList() {
    this.apiService.getData('./assets/json_data/reportPlan.json').subscribe(response => {
      this.reportList = response['body'];

    }, error => {
      console.error(error);
    });
  }

  goToReportDetails() {
  }

  reportPdfGernerate() {
  }

  reportPrintGenerate() {
  }

  onPageChange(event) {
    this.config.currentPage = event;
  }
  searchClient(event) { }

  goToActiveClientReports() {
    this.router.navigate(['app/reports-admin/active-clients']);
  }

  goToLoginUserReports() {
    this.router.navigate(['app/reports-admin/login-logout']);
  }

  goToSubscriptionReports() {
    this.router.navigate(['app/reports-admin/subscription-report']);
  }

  goToAuditTrailReports() {
    this.router.navigate(['app/reports-admin/audit-trail']);
  }
  getAllLastRunReportList() {
    this.apiService.getData(this.apiService.getAllLastRunReportList).subscribe((response: any) => {
      this.lastRundate = response['body'];
    });

  }
  reportRedirect(name) {
    if (name.includes('Audit')) {
      this.goToAuditTrailReports();
    }
    if (name.includes('Subscriptions')) {
      this.goToSubscriptionReports();
    }
    if (name.includes('Login/Logout')) {
      this.goToLoginUserReports();
    }
    if (name.includes('Active Clients')) {
      this.goToActiveClientReports();
    }

  }
}
