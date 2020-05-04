import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ClientsRoutingModule } from './clients-routing.module';
import { ListClientsComponent } from './list-clients/list-clients.component';
import { EditClientsComponent } from './edit-clients/edit-clients.component';
import { ArchivedClientsComponent } from './archived-clients/archived-clients.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { SubscriptionPlanComponent } from './subscription-plan/subscription-plan.component';
import { ArchivedComponent } from './archived/archived.component';
import { ModalModule } from '../../modal';
import { ViewclientComponent } from './view-client/view-client.component';
import { SharedModule } from '../../../shared/shared.module';
import { OwlDateTimeModule, OwlNativeDateTimeModule } from 'ng-pick-datetime';
import { NbDatepickerModule, NbLayoutModule } from '@nebular/theme';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import {NgPrintModule} from 'ng-print';

@NgModule({
  declarations: [
    ListClientsComponent,
    EditClientsComponent,
    ArchivedClientsComponent,
    SubscriptionPlanComponent,
    ArchivedComponent,
    ViewclientComponent,
  ],
  imports: [
    CommonModule,
    ClientsRoutingModule,
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule,
    SharedModule,
    OwlDateTimeModule,
    OwlNativeDateTimeModule,
    NbLayoutModule,
    NgxMaskModule.forRoot(),
    NgPrintModule,
  ],
})
export class ClientsModule { }
