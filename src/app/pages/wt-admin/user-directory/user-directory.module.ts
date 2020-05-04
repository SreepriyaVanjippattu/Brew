import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UserDirectoryRoutingModule } from './user-directory-routing.module';
import { SuperAdminUsersListComponent } from './super-admin-users-list/super-admin-users-list.component';
import { SuperAdminUsersFormComponent } from './super-admin-users-form/super-admin-users-form.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NewuserComponent } from './newuser/newuser.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { SharedModule } from '../../../shared/shared.module';
import { ModalModule } from '../../modal';
import { UserResetpasswordComponent } from './user-resetpassword/user-resetpassword.component';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import {NgPrintModule} from 'ng-print';

@NgModule({
  declarations: [SuperAdminUsersListComponent, SuperAdminUsersFormComponent, NewuserComponent, UserResetpasswordComponent],
  imports: [
    CommonModule,
    UserDirectoryRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    NgxPaginationModule,
    ModalModule,
    SharedModule.forRoot(),
    NgxMaskModule.forRoot(),
    NgPrintModule,
  ],
})
export class UserDirectoryModule { }
