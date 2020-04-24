import { Component, OnInit, ElementRef, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { ApiProviderService } from "../../../../core/api-services/api-provider.service";
import { HttpErrorResponse } from "@angular/common/http";
import { NbToastrService } from "@nebular/theme";
import { DataService } from "../../../../data.service";
import { permission } from "../../../../models/rolePermission";
import { String } from "typescript-string-operations";
import * as XLSX from "xlsx";

@Component({
  selector: "list-yeast-strains",
  templateUrl: "./list-yeast-strains.component.html",
  styleUrls: ["./list-yeast-strains.component.scss"],
})
export class ListYeastStrainsComponent implements OnInit {
  @ViewChild("TABLE", { static: false }) TABLE: ElementRef;
  yeastContent;
  config = {
    itemsPerPage: 5,
    currentPage: 1,
    totalItems: 10,
  };
  toggleStatus = false;
  page: any;
  deleteId: Number;
  currentUser: any;
  pageControl;
  permission = permission;
  checkPermission: boolean = false;
  archiveId: any;
  currentUserId: any;
  headerValue: any;
  userDetails: any;
  tenantId: any;
  searchText: any;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private apiService: ApiProviderService,
    private toastrService: NbToastrService,
    private data_service: DataService
  ) {}

  ngOnInit() {
    this.userDetails = sessionStorage.user;
    const user = JSON.parse(this.userDetails);
    this.tenantId = user["userDetails"].tenantId;
    this.currentUserId = user["userDetails"].userId;
    this.page = this.route.snapshot.queryParamMap.get("page");
    if (this.page) {
      this.getYeastDetails(this.page, this.config.itemsPerPage, this.tenantId, null);
    } else {
      this.getYeastDetails(this.config.currentPage, this.config.itemsPerPage, this.tenantId, null);
    }
  }

  getYeastDetails(pageNumber, pageSize, tenantId, searchText) {
    this.router.navigate(["app/yeast-strains"], {
      queryParams: {
        page: this.config.currentPage,
      },
    });
    const getAllYeastApi = String.Format(this.apiService.getAllYeastList, tenantId);
    this.apiService.getDataList(getAllYeastApi, pageNumber, pageSize, null, null, searchText)
      .subscribe((response) => {
        if (response) {
          this.yeastContent = response["body"].yeastStrainDetails;
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
    this.getYeastDetails(this.config.currentPage, this.config.itemsPerPage, this.tenantId, this.searchText);
    this.router.navigate(["app/yeast-strains"], {
      queryParams: { page: nextPage },
    });
  }

  pageSize(newSize) {
    this.config.itemsPerPage = newSize;
    this.getYeastDetails(this.config.currentPage, this.config.itemsPerPage, this.tenantId, null);
  }

  searchYeastStrain() {
    const getAllYeastStrainsAPI = String.Format(this.apiService.getAllYeastList, this.tenantId);
    this.apiService.getDataList(getAllYeastStrainsAPI, this.config.currentPage, this.config.itemsPerPage, null, null, this.searchText)
      .subscribe((response) => {
        if (response) {
          this.headerValue = response["body"]["pagingDetails"];
          if (this.headerValue) {
            this.config.totalItems = this.headerValue.totalCount;
            this.pageControl = this.config.totalItems === 0 ? true : false;
          }
          if (response && response["body"]) {
            this.yeastContent = response["body"].yeastStrainDetails;
          }
        }
      });
  }

  newYeastClick() {
    const data = this.data_service.checkPermission(
      this.permission.Add_New_User.Id
    );
    if (!data) {
      this.toastrService.danger("You don't have access", "Error");
    } else {
      this.router.navigate(["/app/yeast-strains/add"]);
    }
  }

  goToView(id) {
    sessionStorage.setItem("page", "View");
    this.router.navigate([`/app/yeast-strains/edit/` + id]);
  }

  goToArchive() {
    this.router.navigate(["/app/yeast-strains/archives"]);
  }

  goToYeastEdit(id) {
    sessionStorage.setItem("page", "Edit");
    this.router.navigate([`/app/yeast-strains/edit/` + id]);
  }

  filter(label) {
    if (this.yeastContent) {
      if (this.toggleStatus === true && label === "name") {
        this.yeastContent.sort((a, b) =>
          a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1
        );
      } else if (this.toggleStatus === false && label === "name") {
        this.yeastContent.sort((a, b) =>
          a.name.toUpperCase() < b.name.toUpperCase() ? 1 : -1
        );
      }
      if (this.toggleStatus === true && label === "createdDate") {
        this.yeastContent.sort((a, b) =>
          a.createdDate.toUpperCase() > b.createdDate.toUpperCase() ? 1 : -1
        );
      } else if (this.toggleStatus === false && label === "createdDate") {
        this.yeastContent.sort((a, b) =>
          a.createdDate.toUpperCase() < b.createdDate.toUpperCase() ? 1 : -1
        );
      }
      if (this.toggleStatus === true && label === "status") {
        "Active".toUpperCase() < "Active".toUpperCase() ? 1 : -1;
      } else if (this.toggleStatus === false && label === "status") {
        "Active".toUpperCase() < "Active".toUpperCase() ? 1 : -1;
      }
    }
    this.toggleStatus = !this.toggleStatus;
  }

  deletePopup(id) {
    const data = this.data_service.checkPermission(
      this.permission.Delete_User.Id
    );
    if (!data) {
      this.toastrService.danger("You don't have access", "Error");
    } else {
      this.checkPermission = true;
      this.deleteId = id;
    }
  }

  deleteYeastStrain() {
    var yeastStrain = this.yeastContent.filter((x) => x.id == this.deleteId);
    var statusId = yeastStrain[0].statusId;
    const deleteYeastStrainApi = String.Format(this.apiService.deleteYeastStrain);
    const params = {
      id: this.deleteId,
      tenantId: this.tenantId,
      statusId: statusId,
    };
    this.apiService.deleteData(deleteYeastStrainApi, params).subscribe(
      (response) => {
        this.toastrService.show("Yeast Strain Deleted", "Success");
        this.getYeastDetails(this.config.currentPage, this.config.itemsPerPage, this.tenantId, null);
      },
      (error) => {
        if (error instanceof HttpErrorResponse) {
          this.toastrService.danger("", error.error.message);
        } else {
          this.toastrService.danger("", error);
        }
      }
    );
  }

  cancelDelete() {
    this.router.navigate([`/app/yeast-strains`]);
  }

  getArchiveId(archiveId) {
    this.archiveId = archiveId;
  }

  archivedClick() {
    const archivedYeastAPI = String.Format(this.apiService.archiveYeastStrain, this.tenantId, this.archiveId);
    this.apiService.patchData(archivedYeastAPI).subscribe((response: any) => {
      if (response.status === 200) {
        this.toastrService.success("", "Yeast Strain Archived");
      }
      (error) => {
        if (error instanceof HttpErrorResponse) {
          this.toastrService.danger("", error.error.message);
        } else {
          this.toastrService.danger("", error);
        }
      };
      this.router.navigate(["app/yeast-strains/archives"]);
    });
  }

  clear() {
    this.searchText = "";
    this.searchYeastStrain();
  }

  ExportTOExcel() {
    const ws: XLSX.WorkSheet = XLSX.utils.table_to_sheet(
      this.TABLE.nativeElement
    );
    ws["!cols"] = [];
    ws["!cols"][4] = { hidden: true };
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    XLSX.writeFile(wb, "Yeast-Strains.xlsx");
  }
}
