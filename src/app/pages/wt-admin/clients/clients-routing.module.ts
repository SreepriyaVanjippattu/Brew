import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListClientsComponent } from './list-clients/list-clients.component';
import { EditClientsComponent } from './edit-clients/edit-clients.component';
import { ArchivedClientsComponent } from './archived-clients/archived-clients.component';
import { SubscriptionPlanComponent } from './subscription-plan/subscription-plan.component';
import { ArchivedComponent } from './archived/archived.component';
import { ViewclientComponent } from './view-client/view-client.component';


const routes: Routes = [
  {
    path: '',
    component: ListClientsComponent,
    data: { breadcrumb: 'List' },
  },
  {
    path: 'edit/:id',
    component: EditClientsComponent,
    data: { breadcrumb: 'Edit' },
  },
  {
    path: 'archives',
    component: ArchivedClientsComponent,
    data: { breadcrumb: 'Archived' },
  },
  {
    path: 'subscription/:id',
    component: SubscriptionPlanComponent,
    data: { breadcrumb: 'subscription' },
  },
  {
    path: 'archiveEdit/:id',
    component: ArchivedComponent,
    data: { breadcrumb: 'ArchiveEdit'},
  },
  {
    path: 'viewClient/:id',
    component: ViewclientComponent,
    data: { breadcrumb: 'viewClient'},
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ClientsRoutingModule { }
