import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { SignupComponent } from './signup.component';
import { SharedModule } from '../shared/shared.module';
import { SignupPlanComponent } from './signup-plan/signup-plan.component';
import { SignupSuccessComponent } from './signup-success/signup-success.component';
import { TooltipModule } from 'ng2-tooltip-directive';
import { NgxMaskModule, IConfig } from 'ngx-mask';

const routes: Routes = [
  {
     path: '', 
     component: SignupComponent 
  },
  { 
    path:'signup-plan',
    component:SignupPlanComponent
   },
  { 
    path:'signup-success',
    component:SignupSuccessComponent
   }
];

@NgModule({
  declarations: [
    SignupComponent, 
    SignupPlanComponent, 
    SignupSuccessComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    FormsModule,
    TooltipModule,
    SharedModule.forRoot(),
    NgxMaskModule.forRoot(),
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule]
})
export class SignupModule { }
