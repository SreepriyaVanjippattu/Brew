import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ListReportsComponent } from './list-reports/list-reports.component';
import { ViewReportsComponent } from './view-reports/view-reports.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PDFExportModule } from '@progress/kendo-angular-pdf-export';
import { NgPrintModule } from 'ng-print';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';

const routes: Routes = [
  {
    path: '',
    component: ListReportsComponent,
    data: { breadcrumb: 'Report' }
  },
  {
    path: 'view/:id',
    component: ViewReportsComponent,
    data: { breadcrumb: 'view' }
  },
];

@NgModule({
  declarations: [ListReportsComponent, ViewReportsComponent],
  imports: [
    CommonModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    PDFExportModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    NgPrintModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
})
export class ReportsOrganizationModule { }
