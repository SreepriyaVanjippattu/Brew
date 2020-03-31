import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { ViewBrewRunComponent } from './view-brew-run/view-brew-run.component';
import { ArchivedBrewsComponent } from './archived-brews/archived-brews.component';
import { BrewRunFormComponent } from './brew-run-form/brew-run-form.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MashInFormComponent } from './mash-in-form/mash-in-form.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { BrewLogFormComponent } from './brew-log-form/brew-log-form.component';
import { FermentationFormComponent } from './fermentation-form/fermentation-form.component';
import { ConditionFormComponent } from './condition-form/condition-form.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalModule } from '../../modal/modal.module';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { EditBrewRunComponent } from './edit-brew-run/edit-brew-run.component';
import { NbLayoutModule, NbDatepickerModule } from '@nebular/theme';
import { ProgressComponent } from './progress/progress.component';
import { NgPrintModule } from 'ng-print';



const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    data: { breadcrumb: 'Dashboard' }
  },
  {
    path: 'view-brew-run/:id',
    component: ViewBrewRunComponent,
    data: { breadcrumb: 'view-brew-run' }
  },
  {
    path: 'add-brew-run',
    component: BrewRunFormComponent,
    data: { breadcrumb: 'add-brew-run' }
  },
  {
    path: 'edit-brew-run/:id',
    component: EditBrewRunComponent,
    data: { breadcrumb: 'edit-brew-run' }
  },
  {
    path: 'archives',
    component: ArchivedBrewsComponent,
    data: { breadcrumb: 'Dashboard' }
  },
  {
    path: 'mash-in-form/:id',
    component: MashInFormComponent,
    data: { breadcrumb: 'mash-in-form' }
  },
  {
    path: 'brew-log-form/:id',
    component: BrewLogFormComponent,
    data: { breadcrumb: 'brew-log-form' }
  },
  {
    path: 'fermentation-form/:id',
    component: FermentationFormComponent,
    data: { breadcrumb: 'fermentation-form' }
  },
  {
    path: 'condition-form/:id',
    component: ConditionFormComponent,
    data: { breadcrumb: 'condition-form' }
  }
];

@NgModule({
  declarations: [DashboardComponent,
    ViewBrewRunComponent,
    ArchivedBrewsComponent,
    BrewRunFormComponent,
    MashInFormComponent,
    BrewLogFormComponent,
    FermentationFormComponent,
    ConditionFormComponent,
    EditBrewRunComponent,
    ProgressComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgxPaginationModule,
    FormsModule,
    NgxChartsModule,
    NgbModule,
    ModalModule,
    ReactiveFormsModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    NbDatepickerModule,
    NbLayoutModule,
    NgPrintModule,
  ],
  exports: [RouterModule]
})
export class DashboardModule {
  static components = [
    DashboardComponent,
    ViewBrewRunComponent,
    ArchivedBrewsComponent,
    MashInFormComponent,
    BrewLogFormComponent,
    FermentationFormComponent,
    ConditionFormComponent
  ]
}
