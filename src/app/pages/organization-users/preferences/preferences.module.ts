import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Routes, RouterModule } from '@angular/router';
import { PreferencesComponent } from './preferences.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

const routes: Routes = [
  {
    path: '',
    component: PreferencesComponent,
    data: { breadcrumb: 'preference' }
  },
];

@NgModule({
  declarations: [PreferencesComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    ReactiveFormsModule,
    FormsModule,
  ],
  exports: [RouterModule]
})
export class PreferencesModule { }
