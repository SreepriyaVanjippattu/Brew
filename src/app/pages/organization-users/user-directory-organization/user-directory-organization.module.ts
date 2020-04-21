import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ListUsersComponent } from './list-users/list-users.component';
import { ArchivedUsersComponent } from './archived-users/archived-users.component';
import { UsersFormComponent } from './users-form/users-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { OrganizationPrevilegesComponent } from './organization-previleges/organization-previleges.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { SharedModule } from '../../../shared/shared.module';
import { NgPrintModule } from 'ng-print';

const routes: Routes = [
  {
    path: '',
    component: ListUsersComponent,
    data: { breadcrumb: 'Users' },
  },
  {
    path: 'add',
    component: UsersFormComponent,
    data: { breadcrumb: 'Add' },
  },
  {
    path: 'edit/:id',
    component: EditUserComponent,
    data: { breadcrumb: 'Edit' },
  },
  {
    path: 'archives',
    component: ArchivedUsersComponent,
    data: { breadcrumb: 'Archived' },
  },
  {
    path: 'org-previleges',
    component: OrganizationPrevilegesComponent,
    data: { breadcrumb: 'Org-previleges' },
  },
];

@NgModule({
  declarations: [
    ListUsersComponent, 
    ArchivedUsersComponent, 
    UsersFormComponent, 
    OrganizationPrevilegesComponent, 
    EditUserComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    NgxMaskModule.forRoot(),
    SharedModule,
    NgPrintModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class UserDirectoryOrganizationModule { }
