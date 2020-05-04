import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SuperAdminUsersListComponent } from './super-admin-users-list/super-admin-users-list.component';
import { SuperAdminUsersFormComponent } from './super-admin-users-form/super-admin-users-form.component';
import { NewuserComponent } from './newuser/newuser.component';
import { UserResetpasswordComponent } from './user-resetpassword/user-resetpassword.component';

const routes: Routes = [
  { path: '', component: SuperAdminUsersListComponent },
  { path: 'add', component: SuperAdminUsersFormComponent },
  { path: 'edit/:id', component: SuperAdminUsersFormComponent },
  { path: 'addUser', component: NewuserComponent },
  { path: 'user-resetPassword', component: UserResetpasswordComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserDirectoryRoutingModule { }
