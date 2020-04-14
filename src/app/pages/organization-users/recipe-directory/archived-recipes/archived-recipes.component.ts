import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { NbToastrService } from '@nebular/theme';
import { StatusUse } from '../../../../models/status-id-name';
import * as XLSX from 'xlsx';
import { String } from 'typescript-string-operations';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-archived-recipes',
  templateUrl: './archived-recipes.component.html',
  styleUrls: ['./archived-recipes.component.scss'],
})
export class ArchivedRecipesComponent implements OnInit {
  @ViewChild('TABLE', { static: false }) TABLE: ElementRef;
  title = 'Excel';
  archieveContent;
  maxSize: number = 5;
  archiveId;
  next;
  previous;
  config = {
    itemsPerPage: 5,
    currentPage: 1,
    totalItems: 10,
  };
  status = StatusUse;
  userProfile;
  tenantId: any;
  jsonValue: any;
  pageControl;
  singleRecipeDelete: any;
  params: any;
  toggleStatus: boolean;
  copyContent: any = [];
  committedStatus: String;
  commitedRecipe = false;
  statusName: any;
  recipeStatusName: any;
  headerValue: any;
  searchText: any;
  constructor(
    private apiService: ApiProviderService,
    private router: Router,
    private toast: NbToastrService,
  ) { }

  ngOnInit() {
    this.recipeStatusName = sessionStorage.getItem('recipeStatus');
    const user = JSON.parse(sessionStorage.getItem('user'));
    this.tenantId = user['userDetails'].tenantId;
    this.getArchieveDetails(this.config.currentPage, this.config.itemsPerPage, this.tenantId, null);
  }

  getArchieveDetails(pageNumber, pageSize, tenantId, searchText) {
    this.router.navigate(['app/recipes/archives'], {
      queryParams: {
        page: this.config.currentPage,
      },
    });
    tenantId = this.tenantId;
    const getAllArchivedRecipesAPI = String.Format(this.apiService.getAllArchivedRecipes, this.tenantId);
    this.apiService.getDataList(getAllArchivedRecipesAPI, pageNumber, pageSize, null, null, searchText).subscribe(response => {
      this.archieveContent = response['body'].recipes;

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
    this.getArchieveDetails(this.config.currentPage, this.config.itemsPerPage, this.tenantId, this.searchText);
    this.router.navigate(['app/recipes/archives'], { queryParams: { page: nextPage } });
  }

  pageSize(newSize) {
    this.config.itemsPerPage = newSize;
    this.getArchieveDetails(this.config.currentPage, this.config.itemsPerPage, this.tenantId, null);
  }

  deleteClick(recipe) {
    this.singleRecipeDelete = recipe;
  }

  deleteArchieve() {
    this.committedStatus = this.singleRecipeDelete.statusId.toLowerCase();
    if (this.recipeStatusName !== 'Committed') {

      const deleteRecipeAPI = String.Format(this.apiService.deleteRecipe, this.tenantId, this.singleRecipeDelete.id);
      this.apiService.deleteData(deleteRecipeAPI).subscribe((response: any) => {
        if (response.status === "SUCCESS") {
          this.archieveContent = response['body'];
          this.toast.success('', 'Recipe Deleted');
          this.getArchieveDetails(this.config.currentPage, this.config.itemsPerPage, this.tenantId, null);
        } error => {
          if (error instanceof HttpErrorResponse) {
            this.toast.danger(error.error.message, 'Failed');
          }
          else {
            this.toast.danger('', error);
          }
        }
      });
    } else {
      this.toast.danger('', 'Committed Recipe Cannot Delete');
    }
  }

  restoreArchieve(archiveRecipe) {
    if (archiveRecipe) {
      const archivedRecipeAPI = String.Format(this.apiService.archivedRecipe, this.tenantId, archiveRecipe.id);
      this.apiService.patchData(archivedRecipeAPI).subscribe((response: any) => {
        if (response.status === 200) {
          this.archieveContent = response['body'];
          this.toast.success('', 'Recipe Restored');
        } error => {
          if (error instanceof HttpErrorResponse) {
            this.toast.danger(error.error.message, 'Failed');
          }
          else {
            this.toast.danger('', error);
          }
        }
        this.router.navigate(['app/recipes']);
      });
    }
  }

  onPageChange(event) {
    this.config.currentPage = event;
  }

  searchRecipe() {
    const getAllArchivedRecipesAPI = String.Format(this.apiService.getAllArchivedRecipes, this.tenantId);
    this.apiService.getDataList(getAllArchivedRecipesAPI, this.config.currentPage, this.config.itemsPerPage, null, null, this.searchText)
      .subscribe((response) => {
        const myHeaders = response.headers;
        this.headerValue = response['body']['pagingDetails'];
        if (this.headerValue) {
          this.config.totalItems = this.headerValue.totalCount;
          if (this.config.totalItems === 0) {
            this.pageControl = true;
          } else {
            this.pageControl = false;
          }
        }
        if (response && response['body']) {
          this.archieveContent = response['body'].recipes;
          this.archieveContent.map((recipe, idx) => {
            if (recipe !== null) {
              recipe.name = recipe.name !== null ? recipe.name : '';
              recipe.styleName = recipe.styleName;
              recipe.yeast.name = recipe.yeast.name;
            }
          });
        }
      });
  }

  filter(label) {
    if (this.archieveContent) {
      if (this.toggleStatus === true && label === 'recipe') {
        this.archieveContent.sort((a, b) => a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && label === 'recipe') {
        this.archieveContent.sort((a, b) => a.name.toUpperCase() < b.name.toUpperCase() ? 1 : -1);
      }
      if (this.toggleStatus === true && label === 'style') {
        this.archieveContent.sort((a, b) => a.Roles[0].styleName.toUpperCase() > b.Roles[0].styleName.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && label === 'style') {
        this.archieveContent.sort((a, b) => a.styleName.toUpperCase() < b.styleName.toUpperCase() ? 1 : -1);
      }
      if (this.toggleStatus === true && label === 'yeastStrain') {
        this.archieveContent.sort((a, b) => a.yeast.name.toUpperCase() > b.yeast.name.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && label === 'yeastStrain') {
        this.archieveContent.sort((a, b) => a.yeast.name.toUpperCase() < b.yeast.name.toUpperCase() ? 1 : -1);
      }
      if (this.toggleStatus === true && label === 'status') {
        this.archieveContent.sort((a, b) => a.statusName.toUpperCase() > b.statusName.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && label === 'status') {
        this.archieveContent.sort((a, b) => a.statusName.toUpperCase() < b.statusName.toUpperCase() ? 1 : -1);
      }
      if (this.toggleStatus === true && label === 'brews') {
        this.archieveContent.sort((a, b) => a.totalBrews.toUpperCase() > b.totalBrews.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && label === 'brews') {
        this.archieveContent.sort((a, b) => a.totalBrews.toUpperCase() < b.totalBrews.toUpperCase() ? 1 : -1);
      }
    }
    this.toggleStatus = !this.toggleStatus;
  }

  copyRecipe(recipeId) {
    const cloneRecipeAPI = String.Format(this.apiService.cloneRecipe, this.tenantId, recipeId);
    this.apiService.postData(cloneRecipeAPI).subscribe(response => {
      if (response) {
        const recipeConent = response['body'];
        this.toast.show('', 'Recipe Copied');
        this.getArchieveDetails(this.config.currentPage, this.config.itemsPerPage, this.tenantId, null);
      }
    }, error => {
      if (error instanceof HttpErrorResponse) {
        this.toast.danger('', error.error.message);
      }
      else {
        this.toast.danger('', error);
      }
    });
  }
  makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }
  ExportTOExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(this.TABLE.nativeElement);
    ws['!cols'] = [];
    ws['!cols'][5] = { hidden: true };
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'Archived-Recipes.xlsx');

  }
}
