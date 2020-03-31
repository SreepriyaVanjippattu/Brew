import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Routes, RouterModule } from '@angular/router';
import { ProfileOrganizationComponent } from './profile-organization.component';
import { SubscriptionPlanComponent } from './subscription-plan/subscription-plan.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { SharedModule } from '../../../shared/shared.module';
import { NgxMaskModule, IConfig } from 'ngx-mask';

const routes: Routes = [
  { 
    path: '',
    component: ProfileOrganizationComponent,
    data: { breadcrumb: 'profile'}
  },
  { 
    path: 'subscription-plan', 
    component: SubscriptionPlanComponent,
    data: { breadcrumb: 'subscription-plan'}
  },
  { 
    path: 'change-password', 
    component:ChangePasswordComponent,
    data: { breadcrumb: 'success'}
  }
];

@NgModule({
  declarations: [
    ProfileOrganizationComponent, 
    SubscriptionPlanComponent, 
    ChangePasswordComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
    SharedModule.forRoot(),
    NgxMaskModule.forRoot(),
  ],
  exports: [RouterModule],
})
export class ProfileOrganizationModule { }
