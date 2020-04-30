import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import { ApiProviderService } from "../../../../core/api-services/api-provider.service";
import { NbToastrService } from "@nebular/theme";
import { StatusUse } from "../../../../models/status-id-name";
import * as XLSX from "xlsx";
import { String } from "typescript-string-operations";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: "archived-yeast-strains",
  templateUrl: "./archived-yeast-strains.component.html",
  styleUrls: ["./archived-yeast-strains.component.scss"],
})
export class ArchivedYeastStrainsComponent implements OnInit {
@ViewChild("TABLE", { static: false }) TABLE: ElementRef;
archiveContent;
next;
previous;
config = {
itemsPerPage: 5,
currentPage: 1,
totalItems: 10,
};
status = StatusUse;
tenantId: any;
pageControl;
params: any;
toggleStatus: boolean;
headerValue: any;
searchText: any;
deleteId: any;
  statusName: string;

  constructor(
    private apiService: ApiProviderService,
    private router: Router,
    private toast: NbToastrService
  ) {}
  ngOnInit() {
    const user = JSON.parse(sessionStorage.getItem("user"));
    this.tenantId = user["userDetails"].tenantId;
    this.getArchiveDetails(this.config.currentPage, this.config.itemsPerPage, this.tenantId, null);
  }

  getArchiveDetails(pageNumber, pageSize, tenantId, searchText) {
    this.router.navigate(["app/yeast-strains/archives"], {
      queryParams: {
        page: this.config.currentPage,
      },
    });
    tenantId = this.tenantId;
    const getAllArchivedYeastStrains = String.Format(this.apiService.getArchivedYeastStrains, this.tenantId);
    this.apiService.getDataList(getAllArchivedYeastStrains, pageNumber, pageSize, null, null, searchText)
      .subscribe((response) => {
        if (response) {
          this.archiveContent = response["body"].yeastStrainDetails;
          this.archiveContent.forEach(element => {
            if (element.statusId === StatusUse.archive.id) {
              this.statusName = StatusUse.archive.name;
            }
          });
          this.headerValue = response["body"]["pagingDetails"];
          if (this.headerValue) {
            this.config.totalItems = this.headerValue.totalCount;
            this.pageControl = this.config.totalItems === 0 ? true : false;
          }
        }
      });
  }

  pageChange(nextPage) {
    this.config.currentPage = nextPage;
    this.getArchiveDetails(this.config.currentPage,this.config.itemsPerPage,this.tenantId,this.searchText);
    this.router.navigate(["app/yeast-strains/archives"], {
      queryParams: { page: nextPage },
    });
  }

  pageSize(newSize) {
    this.config.itemsPerPage = newSize;
    this.getArchiveDetails(this.config.currentPage, this.config.itemsPerPage, this.tenantId, this.searchText);
  }

  deletePopup(id) {
    this.deleteId = id;
  }

  deleteArchivedYeast() {
    var yeastStrain = this.archiveContent.filter((x) => x.id == this.deleteId);
    var statusId = yeastStrain[0].statusId;
    const deleteArchivedYeastApi = String.Format(this.apiService.deleteYeastStrain);
    const params = {
      id: this.deleteId,
      tenantId: this.tenantId,
      statusId: statusId,
    };
    this.apiService.deleteData(deleteArchivedYeastApi, params).subscribe(
      (response) => {
        this.toast.show("Yeast Strain Deleted", "Success");
        this.getArchiveDetails(this.config.currentPage, this.config.itemsPerPage, this.tenantId, "");
      },
      (error) => {
        if (error instanceof HttpErrorResponse) {
          this.toast.danger(error.error.message, 'Try Again');
        } else {
          this.toast.danger(error, 'Try Again');
        }
      }
    );
  }

  restoreArchive(archiveYeast) {
    if (archiveYeast) {
      const restoreYeastStrainAPI = String.Format(this.apiService.archiveYeastStrain, this.tenantId, archiveYeast);
      this.apiService.patchData(restoreYeastStrainAPI)
        .subscribe((response: any) => {
          if (response.status === 200) {
            this.archiveContent = response["body"];
            this.toast.success("", "Yeast Strain Restored");
          }
          (error) => {
            if (error instanceof HttpErrorResponse) {
              this.toast.danger(error.error.message, "Try Again");
            } else {
              this.toast.danger( error,'Try Again');
            }
          };
          this.router.navigate(["app/yeast-strains"]);
        });
    }
  }

  onPageChange(event) {
    this.config.currentPage = event;
  }

  searchYeastStrains() {
    const getAllArchivedYeastStainsAPI = String.Format(this.apiService.getArchivedYeastStrains, this.tenantId);
    this.apiService.getDataList(getAllArchivedYeastStainsAPI, this.config.currentPage, this.config.itemsPerPage, null, null, this.searchText)
      .subscribe((response) => {
        const myHeaders = response.headers;
        this.headerValue = response["body"]["pagingDetails"];
        if (this.headerValue) {
          this.config.totalItems = this.headerValue.totalCount;
          this.pageControl = this.config.totalItems === 0 ? true : false;
        }
        if (response && response["body"]) {
          this.archiveContent = response["body"].yeastStrainDetails;
        }
      });
  }

  clear() {
    this.searchText = "";
    this.searchYeastStrains();
  }

  filter(label) {
    if (this.archiveContent) {
      if (this.toggleStatus === true && label === "name") {
        this.archiveContent.sort((a, b) =>
          a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1
        );
      } else if (this.toggleStatus === false && label === "name") {
        this.archiveContent.sort((a, b) =>
          a.name.toUpperCase() < b.name.toUpperCase() ? 1 : -1
        );
      }
      if (this.toggleStatus === true && label === "createdDate") {
        this.archiveContent.sort((a, b) =>
          a.createdDate.toUpperCase() > b.createdDate.toUpperCase() ? 1 : -1
        );
      } else if (this.toggleStatus === false && label === "createdDate") {
        this.archiveContent.sort((a, b) =>
          a.createdDate.toUpperCase() < b.createdDate.toUpperCase() ? 1 : -1
        );
      }
      if (this.toggleStatus === true && label === "status") {
        this.archiveContent.sort((a, b) =>
          "Active".toUpperCase() > "Active".toUpperCase() ? 1 : -1
        );
      } else if (this.toggleStatus === false && label === "status") {
        this.archiveContent.sort((a, b) =>
          "Active".toUpperCase() < "Active".toUpperCase() ? 1 : -1
        );
      }
    }
    this.toggleStatus = !this.toggleStatus;
  }

  ExportTOExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(
      this.TABLE.nativeElement
    );
    ws["!cols"] = [];
    ws["!cols"][5] = { hidden: true };
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "Archived-Yeast-Strains.xlsx");
  }
}
