import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { ApiProviderService } from "../../../../core/api-services/api-provider.service";
import { NbToastrService } from "@nebular/theme";
import { permission } from "../../../../models/rolePermission";
import { String } from "typescript-string-operations";
import { Guid } from "guid-typescript";
import { HttpErrorResponse } from "@angular/common/http";
import { DatePipe } from "@angular/common";
@Component({
  selector: "add-yeast-strain",
  templateUrl: "./add-yeast-strain.component.html",
  styleUrls: ["./add-yeast-strain.component.scss"],
})
export class AddYeastStrainComponent implements OnInit {
  permission = permission;
  userDetails: any;
  roleId: any;
  tenantId;
  yeastContent;
  page: string;
  id: any;
  isButtonVisible: boolean = false;
  headerTitle: string;
  formSubmitted: boolean;
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private apiService: ApiProviderService,
    private activatedRoute: ActivatedRoute,
    private toastr: NbToastrService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.userDetails = sessionStorage.user;
    const user = JSON.parse(this.userDetails);
    this.tenantId = user["userDetails"].tenantId;
    this.page = this.activatedRoute.snapshot.url[0].path;
    let date = new Date();
    this.yeastForm.get("createdDate").setValue(this.datePipe.transform(date, "dd-MM-yyyy"));
    if (this.page === "edit") {
      this.id = this.activatedRoute.snapshot.url[1].path;
      this.getYeastDetails(this.tenantId, this.id);
      this.headerTitle = "Edit Yeast Strain";
    } else {
      this.headerTitle = "Add Yeast Strain";
    }
    if (sessionStorage.getItem("page") === "View") {
      this.isButtonVisible = true;
      this.page = "View";
      this.yeastForm.disable();
      this.getYeastDetails(this.tenantId, this.id);
    }
  }

  yeastForm = this.formBuilder.group({
    yeastName: ["", Validators.required],
    createdDate: [""],
  });

  get form() {
    return this.yeastForm.controls;
  }

  getYeastDetails(tenantId, id) {
    this.id = id;
    const getYeastStrainbyIdApi = String.Format(this.apiService.getYeastStrainById, tenantId, id);
    this.apiService.getDataList(getYeastStrainbyIdApi, 1, 1, null, null, null)
      .subscribe((response) => {
        if (response) {
          this.yeastContent = response["body"].yeastStrainDetails;
          if (this.page === "View") {
            this.headerTitle = this.yeastContent[0].name;
          }
          this.setDataToEdit();
        }
      });
  }

  goToEdit() {
    this.yeastForm.get("yeastName").enable();
    sessionStorage.page = "Edit";
    this.page = "edit";
    this.ngOnInit();
  } 

  setDataToEdit() {
    this.yeastForm.get("yeastName").setValue(this.yeastContent[0].name);
    this.yeastForm.get("createdDate").setValue(this.datePipe.transform(this.yeastContent[0].createdDate, "dd-MM-yyyy"));
  }

  yeastFormSubmit() {
    this.page == "add" ? (this.id = Guid.raw()) : this.id;
    this.formSubmitted = true;
    const params = {
      id: this.id,
      name: this.yeastForm.get("yeastName").value,
      tenantId: this.tenantId,
      isActive: "true",
      createdDate: this.datePipe.transform(new Date(), "yyyy/MM/dd HH:mm:ss"),
      statusId:
        this.yeastContent != null
          ? this.yeastContent[0].statusId
          : "7cd88ffb-cf41-4efc-9a17-d75bcb5b3770",
    };
    if (this.yeastForm.valid) {
      if (this.page === "add") {
        const addYeastStrainApi = String.Format(this.apiService.addYeastStrain, this.tenantId);
        this.apiService.postData(addYeastStrainApi, params).subscribe(
          (response: any) => {
            if (response.status === 200) {
              this.toastr.show("", "Success");
              this.router.navigate(["app/yeast-strains"]);
            }
          },
          (error) => {
            if (error instanceof HttpErrorResponse) {
              this.toastr.danger("", error.error.message);
            } else {
              this.toastr.danger("", error);
            }
          }
        );
      } else {
        const updateYeastStrainApi = String.Format(this.apiService.editYeastStrain, this.tenantId, this.id);
        this.apiService.putData(updateYeastStrainApi, params).subscribe(
          (response: any) => {
            if (response.status === 200) {
              this.toastr.show("", "Success");
              this.router.navigate(["app/yeast-strains"]);
            }
          },
          (error) => {
            if (error instanceof HttpErrorResponse) {
              this.toastr.danger("", error.error.message);
            } else {
              this.toastr.danger("", error);
            }
          }
        );
      }
    }
  }
}
