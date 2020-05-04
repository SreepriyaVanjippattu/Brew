import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { ReportsAdminRoutingModule } from './reports-admin-routing.module';
import { ReportsAdminComponent } from './reports-admin.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { LoginLogoutReportComponent } from './login-logout-report/login-logout-report.component';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { AuditTrailReportComponent } from './audit-trail-report/audit-trail-report.component';
import { ActiveClientUserReportComponent } from './active-client-user-report/active-client-user-report.component';
import { SubscriptionReportComponent } from './subscription-report/subscription-report.component';
import {NgPrintModule} from 'ng-print';

@NgModule({
  declarations: [ReportsAdminComponent,
    LoginLogoutReportComponent,
    AuditTrailReportComponent,
    ActiveClientUserReportComponent,
    SubscriptionReportComponent],
  imports: [
    CommonModule,
    ReportsAdminRoutingModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    FormsModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    NgPrintModule,
  ],
})
export class ReportsAdminModule { }
