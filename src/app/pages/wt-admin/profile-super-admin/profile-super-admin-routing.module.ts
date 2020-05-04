import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ProfileSuperAdminComponent } from './profile-super-admin.component';
import { ProfileResetpasswordComponent } from './profile-resetpassword/profile-resetpassword.component';


const routes: Routes = [
  { path: '', component: ProfileSuperAdminComponent },
  { path: 'profile/change-password/:id', component: ProfileResetpasswordComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProfileSuperAdminRoutingModule { }
