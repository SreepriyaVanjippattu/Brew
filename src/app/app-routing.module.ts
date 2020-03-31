import { ExtraOptions, RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';


const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('../app/login/login.module')
      .then(m => m.LoginModule),
  },
  {
    path: 'signup',
    loadChildren: () => import('../app/signup/signup.module')
      .then(m => m.SignupModule),
  },
  {
    path: 'app',
    loadChildren: () => import('../app/pages/pages.module')
      .then(m => m.PagesModule),
  },
   { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];

const config: ExtraOptions = {
  useHash: false,
};

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
