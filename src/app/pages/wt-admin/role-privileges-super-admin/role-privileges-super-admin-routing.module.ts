import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RolePrivilegesSuperAdminComponent } from './role-privileges-super-admin.component';

const routes: Routes = [
  { path: '', component: RolePrivilegesSuperAdminComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RolePrivilegesSuperAdminRoutingModule { }
