import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { ToastrService } from 'ngx-toastr';
import { NbToastrService } from '@nebular/theme';
import * as XLSX from 'xlsx';


import { StatusUse } from '../../../../models/status-id-name';
import { Message } from '@angular/compiler/src/i18n/i18n_ast';
import { permission } from '../../../../models/rolePermission';
import { DataService } from '../../../../data.service';
import { String } from 'typescript-string-operations';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-list-recipe',
  templateUrl: './list-recipe.component.html',
  styleUrls: ['./list-recipe.component.scss'],
})


export class ListRecipeComponent implements OnInit {
  @ViewChild('TABLE', { static: false }) TABLE: ElementRef;
  title = 'Excel';
  favourite = true;
  config = {
    currentPage: 1,
    itemsPerPage: 5,
    totalItems: 20,
  };
  previous = 'Previous';
  next = 'Next';
  recipeContent;
  completionPercent: Number;
  page: string;
  headerValues: any;
  toggleStatus = false;
  favouriteId: any;
  index: any;
  params: any;
  userCompany: any;
  tenantId: any;
  changeData: any;
  favouriteRecipe: any;
  status = StatusUse;
  singleRecipeDelete: any;
  copyContent: any = [];
  singleRecipeData: any;
  commitedRecipe = false;
  committedStatus: String;

  permission = permission;
  checkPermission: boolean = false;
  headerValue: any;
  pageControl;
  recipeStatus: any = [];

  constructor(
    private apiService: ApiProviderService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: NbToastrService,
    private data: DataService
  ) {

  }

  ngOnInit() {
    const user = JSON.parse(sessionStorage.getItem('user'));
    this.userCompany = user['userDetails'];
    this.tenantId = this.userCompany.tenantId;
    this.page = this.route.snapshot.queryParamMap.get('page');
    if (this.page) {
      this.getRecipeDetails(this.page, this.config.itemsPerPage, this.tenantId);
    } else {
      this.getRecipeDetails(this.config.currentPage, this.config.itemsPerPage, this.tenantId);
    }
  }

  getRecipeDetails(pageNumber, pageSize, tenantId) {
    this.router.navigate(['app/recipes'], {
      queryParams: {
        page: this.config.currentPage,
      },
    });
    tenantId = this.tenantId;

    const getAllRecipeByTenantAPI = String.Format(this.apiService.getAllRecipeByTenant, tenantId);
    this.apiService.getDataList(getAllRecipeByTenantAPI, pageNumber, pageSize, null, null, null).subscribe(response => {
      if (response['body']) {
        this.recipeContent = response['body'].recipes;

      }
      this.headerValue = response['body']['pagingDetails'];
      if (this.headerValue) {
        this.config.totalItems = this.headerValue.totalCount;
        if (this.config.totalItems === 0) {
          this.pageControl = true;
        }
      }
    });
  }

  pageChange(nextPage) {
    this.config.currentPage = nextPage;
    this.getRecipeDetails(this.config.currentPage, this.config.itemsPerPage, this.tenantId);
    this.router.navigate(['app/recipes'], {
      queryParams: {
        page: nextPage,
      },
    });
  }

  singleRecipeClick(Id) {
    const data = this.data.checkPermission(this.permission.View_Recipe.Id);
    if (!data) {
      this.toast.danger('You don\'t have access', 'Error');
    } else {
      this.router.navigate(['app/recipes/view/' + Id]);
    }
  }

  pageSize(pagesize) {
    this.config.itemsPerPage = pagesize;
    this.getRecipeDetails(this.config.currentPage, this.config.itemsPerPage, this.tenantId);
  }

  editRecipe(recipeId, recipelist) {

    const data = this.data.checkPermission(this.permission.Modify_Recipe.Id);
    if (!data) {
      this.toast.danger('You don\'t have access', 'Error');
    } else {

      if (recipelist.StatusId === '4267ae2f-4b7f-4a70-a592-878744a13900') {
        this.toast.warning('Already Committed', 'Recipe');
      } else {
        sessionStorage.setItem('page', 'edit');
        this.router.navigate(['app/recipes/edit-recipe/' + recipeId]);
      }
    }
  }

  recipeArchivedClick() {
    this.router.navigate(['app/recipes/archives']);
  }

  singleRecipeArchived(archivedRecipe) {

    const data = this.data.checkPermission(this.permission.Archive_Recipe.Id);
    if (!data) {
      this.toast.danger('You don\'t have access', 'Error');
    } else {
      this.singleRecipeData = archivedRecipe;
      const recipeStatus = this.singleRecipeData.statusName;
      sessionStorage.setItem('recipeStatus', recipeStatus);
    }
  }

  archivedClick() {
    if (this.singleRecipeData) {
      const archivedRecipeAPI = String.Format(this.apiService.archivedRecipe, this.tenantId, this.singleRecipeData.id);
      this.apiService.patchData(archivedRecipeAPI).subscribe((response: any) => {
        if (response.status === 200) {
          this.changeData = response['body'];
          this.toast.success('Recipe Archived');
        } error => {
          if (error instanceof HttpErrorResponse) {
            this.toast.danger(error.error.message);
          }
          else {
            this.toast.danger(error);
          }
        }
        this.router.navigate(['app/recipes/archives']);
      });
    }
  }

  deleteClick(recipe) {
    this.singleRecipeDelete = recipe;
  }

  deleteRecipe() {
    this.committedStatus = this.singleRecipeDelete.statusId.toLowerCase();
    if (this.committedStatus !== this.status.commited.id.toLowerCase()) {

      const deleteRecipeAPI = String.Format(this.apiService.deleteRecipe, this.tenantId, this.singleRecipeDelete.id);
      this.apiService.deleteData(deleteRecipeAPI).subscribe((response: any) => {
        if (response.status === "SUCCESS") {
          this.recipeContent = response['body'];
          this.toast.success('Recipe Deleted');
          this.getRecipeDetails(this.config.currentPage, this.config.itemsPerPage, this.tenantId);
        } error => {
          if (error instanceof HttpErrorResponse) {
            this.toast.danger(error.error.message);
          }
          else {
            this.toast.danger(error);
          }
        }
      });
    } else {
      this.toast.danger('Committed Recipe Cannot Delete');
    }
  }

  newRecipeClick() {

    const data = this.data.checkPermission(this.permission.Create_New_Recipe.Id);
    if (!data) {
      this.toast.danger('You don\'t have access', 'Error');
    }
    else {
      sessionStorage.setItem('page', 'add');
      sessionStorage.removeItem('RecipeId');
      sessionStorage.removeItem('receipeDetails');
      this.router.navigate(['app/recipes/recipe-mashin']);
    }
  }

  searchRecipe(event) {

    const search = event.target.value;

    const getAllRecipeByTenantAPI = String.Format(this.apiService.getAllRecipeByTenant, this.tenantId);
    this.apiService.getDataList(getAllRecipeByTenantAPI, this.config.currentPage, this.config.itemsPerPage, null, null, search)
      .subscribe((response) => {
        const myHeaders = response.headers;
        this.headerValue = JSON.parse(response.headers.get('paging-headers'));
        if (this.headerValue) {
          this.config.totalItems = this.headerValue.TotalCount;
        }
        if (response && response['body']) {
          this.recipeContent = response['body'].recipes;

          this.recipeContent.map((recipes, id) => {
            if (recipes !== null) {
              recipes.name = recipes.name !== null ? recipes.name : '';
              recipes.styleName = recipes.styleName;
              recipes.yeast.name = recipes.yeast.name;
            }
          });
        }
      });
  }

  filter(label) {
    if (this.recipeContent) {
      if (this.toggleStatus === true && label === 'recipe') {
        this.recipeContent.sort((a, b) => a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && label === 'recipe') {
        this.recipeContent.sort((a, b) => a.name.toUpperCase() < b.name.toUpperCase() ? 1 : -1);
      }
      if (this.toggleStatus === true && label === 'style') {
        this.recipeContent.sort((a, b) => a.styleName.toUpperCase() > b.styleName.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && label === 'style') {
        this.recipeContent.sort((a, b) => a.styleName.toUpperCase() < b.styleName.toUpperCase() ? 1 : -1);
      }
      if (this.toggleStatus === true && label === 'yeast') {
        this.recipeContent.sort((a, b) => a.yeast.name.toUpperCase() > b.yeast.name.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && label === 'yeast') {
        this.recipeContent.sort((a, b) => a.yeast.name.toUpperCase() < b.yeast.name.toUpperCase() ? 1 : -1);
      }
      if (this.toggleStatus === true && label === 'status') {
        this.recipeContent.sort((a, b) => a.statusName.toUpperCase() > b.statusName.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && label === 'status') {
        this.recipeContent.sort((a, b) => a.statusName.toUpperCase() < b.statusName.toUpperCase() ? 1 : -1);
      }
      if (this.toggleStatus === true && label === 'brews') {
        this.recipeContent.sort((a, b) => a.totalBrews.toUpperCase() > b.totalBrews.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && label === 'brews') {
        this.recipeContent.sort((a, b) => a.totalBrews.toUpperCase() < b.totalBrews.toUpperCase() ? 1 : -1);
      }
    }
    this.toggleStatus = !this.toggleStatus;
  }

  favouriteClick(recipe) {
    this.favouriteRecipe = recipe;
    recipe.expanded = !recipe.expanded;

    const favoriteRecipeAPI = String.Format(this.apiService.favoriteRecipe, this.tenantId, recipe.id);
    this.apiService.patchData(favoriteRecipeAPI).subscribe((response: any) => {
      if (response === 200) {
        this.changeData = response['body'];
      }
      this.getRecipeDetails(this.config.currentPage, this.config.itemsPerPage, this.tenantId);
    }, error => {
      if (error instanceof HttpErrorResponse) {
        this.toast.danger(error.error.message);
      }
      else {
        this.toast.danger(error);
      }
    });
  }

  unFavouriteClick(recipe) {
    const favoriteRecipeAPI = String.Format(this.apiService.favoriteRecipe, this.tenantId, recipe.id);
    this.apiService.patchData(favoriteRecipeAPI).subscribe((response: any) => {
      this.changeData = response['body'];
      this.getRecipeDetails(this.config.currentPage, this.config.itemsPerPage, this.tenantId);
    });
  }

  copyRecipe(recipeId) {

    const data = this.data.checkPermission(this.permission.Modify_Recipe.Id);
    if (!data) {
      this.toast.danger('You don\'t have access', 'Error');
    } else {

      const cloneRecipeAPI = String.Format(this.apiService.cloneRecipe, this.tenantId, recipeId);
      this.apiService.postData(cloneRecipeAPI).subscribe(response => {
        if (response) {
          this.toast.show('', 'New Recipe Created');
          this.getRecipeDetails(this.config.currentPage, this.config.itemsPerPage, this.tenantId);
        }
      },
        error => {
          if (error instanceof HttpErrorResponse) {
            this.toast.danger(error.error.message);
          }
          else {
            this.toast.danger(error);
          }
        });
    }
  }

  ExportToExcelRecipeDirectory() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.TABLE.nativeElement);
    ws['!cols'] = [];
    ws['!cols'][5] = { hidden: true };
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'Recipe-Directory.xlsx');

  }
}
