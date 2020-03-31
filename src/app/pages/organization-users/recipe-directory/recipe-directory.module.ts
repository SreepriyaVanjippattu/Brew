import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Routes, RouterModule } from '@angular/router';
import { ListRecipeComponent } from './list-recipe/list-recipe.component';
import { RecipeFormComponent } from './recipe-form/recipe-form.component';
import { ArchivedRecipesComponent } from './archived-recipes/archived-recipes.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RecipeMashformComponent } from './recipe-mashform/recipe-mashform.component';
import { RecipeBrewlogComponent } from './recipe-brewlog/recipe-brewlog.component';
import { RecipeConditioningComponent } from './recipe-conditioning/recipe-conditioning.component';
import { RecipeFermentationComponent } from './recipe-fermentation/recipe-fermentation.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {NgPrintModule} from 'ng-print';
import { PDFExportModule } from '@progress/kendo-angular-pdf-export';

const routes: Routes = [
  {
    path: '',
    component: ListRecipeComponent,
    data: { breadcrumb: 'recipe'},
  },
  {
    path: 'add',
    component: RecipeFormComponent,
    data: { breadcrumb: 'add'},
  },
  {
    path: 'view/:id',
    component: RecipeFormComponent,
    data: { breadcrumb: 'view'},
  },
  {
    path: 'archives',
    component: ArchivedRecipesComponent,
    data: { breadcrumb: 'archived'},
  },
  {
    path: 'newbrew',
    component: RecipeFormComponent,
    data: { breadcrumb: 'newbrew' },
  },
  {
    path: 'edit-recipe/:id',
    component: RecipeMashformComponent,
    data: { breadcrumb: 'recipe-mashin'},
   },
  {
    path: 'recipe-mashin',
    component: RecipeMashformComponent,
    data: { breadcrumb: 'recipe-mashin'},
   },
  {
    path: 'recipe-brewlog',
    component: RecipeBrewlogComponent,
    data: { breadcrumb: 'recipe-brew'},
  },
  {
    path: 'recipe-fermentation',
    component: RecipeFermentationComponent,
    data: { breadcrumb: 'recipe-fermentation' },
   },
  {
    path: 'recipe-conditioning',
    component: RecipeConditioningComponent,
    data: { breadcrumb: 'recipe-conditioning' },
   }
];

@NgModule({
  declarations: [   
    ListRecipeComponent, 
    RecipeFormComponent, 
    ArchivedRecipesComponent, 
    RecipeMashformComponent, 
    RecipeBrewlogComponent, 
    RecipeConditioningComponent, 
    RecipeFermentationComponent
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgxPaginationModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    NgPrintModule,
    PDFExportModule,
  ],
  exports: [RouterModule]
})
export class RecipeDirectoryModule { }
