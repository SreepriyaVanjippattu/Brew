import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileSuperAdminRoutingModule } from './profile-super-admin-routing.module';
import { ProfileSuperAdminComponent } from './profile-super-admin.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProfileResetpasswordComponent } from './profile-resetpassword/profile-resetpassword.component';
import { NgxMaskModule, IConfig } from 'ngx-mask';


@NgModule({
  declarations: [ProfileSuperAdminComponent, ProfileResetpasswordComponent],
  imports: [
    CommonModule,
    ProfileSuperAdminRoutingModule,
    ReactiveFormsModule, 
    FormsModule,
    NgxMaskModule.forRoot(),
  ],
})
export class ProfileSuperAdminModule { }
