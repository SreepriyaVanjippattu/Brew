import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Routes, RouterModule } from "@angular/router";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgxPaginationModule } from "ngx-pagination";
import { NgxMaskModule } from "ngx-mask";
import { SharedModule } from "../../../shared/shared.module";
import { NgPrintModule } from "ng-print";
import { ListYeastStrainsComponent } from "./list-yeast-strains/list-yeast-strains.component";
import { AddYeastStrainComponent } from "./add-yeast-strain/add-yeast-strain.component";
import { ArchivedYeastStrainsComponent } from "./archived-yeast-strains/archived-yeast-strains.component";

const routes: Routes = [
  {
    path: "",
    component: ListYeastStrainsComponent,
    data: { breadcrumb: "Yeast Strains" },
  },
  {
    path: "add",
    component: AddYeastStrainComponent,
    data: { breadcrumb: "Add" },
  },
  {
    path: "edit/:id",
    component: AddYeastStrainComponent,
    data: { breadcrumb: "Edit" },
  },
  {
    path: "archives",
    component: ArchivedYeastStrainsComponent,
    data: { breadcrumb: "Archived" },
  },
];

@NgModule({
  declarations: [
    ListYeastStrainsComponent,
    AddYeastStrainComponent,
    ArchivedYeastStrainsComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    NgxPaginationModule,
    ReactiveFormsModule,
    NgxMaskModule.forRoot(),
    SharedModule,
    NgPrintModule,
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
})
export class YeastStrainsModule {}
