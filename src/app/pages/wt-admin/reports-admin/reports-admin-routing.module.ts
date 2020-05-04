import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReportsAdminComponent } from './reports-admin.component';
import { LoginLogoutReportComponent } from './login-logout-report/login-logout-report.component';
import { AuditTrailReportComponent } from '../reports-admin/audit-trail-report/audit-trail-report.component';
import { ActiveClientUserReportComponent } from '../reports-admin/active-client-user-report/active-client-user-report.component';
import { SubscriptionReportComponent } from './subscription-report/subscription-report.component';

const routes: Routes = [
  { path: '', component: ReportsAdminComponent },
  { path: 'login-logout', component: LoginLogoutReportComponent },
  { path: 'audit-trail', component: AuditTrailReportComponent },
  { path: 'active-clients', component: ActiveClientUserReportComponent },
  { path: 'subscription-report', component: SubscriptionReportComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ReportsAdminRoutingModule { }
