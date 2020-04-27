import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login.component';
import { ForgetPasswordComponent } from './forget-password/forget-password.component';
import { SharedModule } from '../shared/shared.module';
import { ShowHidePasswordModule } from 'ngx-show-hide-password';
import { CookieService } from 'ngx-cookie-service';
import { ForgotchangepasswordComponent } from './forgotchangepassword/forgotchangepassword.component';
import { ToastrModule } from 'ngx-toastr';
import { NbLayoutModule } from '@nebular/theme';
const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'forgot-password',
    component: ForgetPasswordComponent
  },
  {
    path: 'forgot-changepassword',
    component: ForgotchangepasswordComponent
  }
];

@NgModule({
  declarations: [
    LoginComponent,
    ForgetPasswordComponent,
    ForgotchangepasswordComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
    ShowHidePasswordModule,
    ToastrModule,
    RouterModule.forChild(routes)
  ],
  exports: [RouterModule],
  providers: [CookieService]
})
export class LoginModule {}
