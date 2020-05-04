import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RolePrivilegesSuperAdminRoutingModule } from './role-privileges-super-admin-routing.module';
import { RolePrivilegesSuperAdminComponent } from './role-privileges-super-admin.component';

@NgModule({
  declarations: [RolePrivilegesSuperAdminComponent],
  imports: [
    CommonModule,
    RolePrivilegesSuperAdminRoutingModule,
  ],
})
export class RolePrivilegesSuperAdminModule { }
