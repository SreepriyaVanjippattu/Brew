import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import html2canvas from 'html2canvas';
import * as jsPDF from 'jspdf';
import { permission } from '../../../../models/rolePermission';
import { DataService } from '../../../../data.service';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'app-list-reports',
  templateUrl: './list-reports.component.html',
  styleUrls: ['./list-reports.component.scss'],
})
export class ListReportsComponent implements OnInit {
  fermentaionContent;
  completionPercent: Number;
  maxSize: number = 5;
  next;
  previous;
  tenantId: any;
  page: any;
  headerValue: any;
  toggleStatus: boolean = true;
  config = {
    currentPage: 1,
    itemsPerPage: 5,
    totalItems: 20,
  };
  month: any;
  day: any;
  checkPermission: boolean = false;
  pageControl;

  constructor(
    private apiService: ApiProviderService,
    private router: Router,
    private route: ActivatedRoute,
    private data: DataService,
    private toastr: NbToastrService,

  ) { }

  ngOnInit() {
    const userDetails = JSON.parse(sessionStorage.getItem('user'));
    this.tenantId = userDetails['CompanyDetails'].Id;
    this.page = this.route.snapshot.queryParamMap.get('page');
    if (this.page) {
      this.getDashBoardDetails(this.tenantId, this.page, this.config.itemsPerPage);
    } else {
      this.getDashBoardDetails(this.tenantId, this.config.currentPage, this.config.itemsPerPage);
    }

  }

  getDashBoardDetails(tenantId, pageNumber, pageSize) {
    this.router.navigate(['app/reports'], {
      queryParams: {
        page: this.config.currentPage,
      },
    });
    this.apiService.getDataByQueryParams(this.apiService.getAllBrewReportsList, null, tenantId, null, pageNumber,
      pageSize).subscribe(response => {
        this.fermentaionContent = response['body'];
        this.data.passData(this.fermentaionContent);

        if (this.fermentaionContent) {
          this.fermentaionContent.map((ferment, idx) => {
            this.brewProgressCalculation(ferment);
          });
        }
        this.headerValue = JSON.parse(response.headers.get('paging-headers'));
        if (this.headerValue) {
          this.config.totalItems = this.headerValue.TotalCount;
          if (this.config.totalItems === 0) {
            this.pageControl = true;
          }
        }
      }, error => {
        console.error(error);
      });

  }


  pageSize(newSize) {
    this.config.itemsPerPage = newSize;
    this.getDashBoardDetails(this.tenantId, this.config.currentPage, this.config.itemsPerPage);
  }

  pageChange(nextPage) {
    this.config.currentPage = nextPage;
    this.getDashBoardDetails(this.tenantId, this.config.currentPage, this.config.itemsPerPage);
    this.router.navigate(['app/reports'], {
      queryParams: {
        page: nextPage,
      },
    });
  }

  brewProgressCalculation(ferment) {
    let sDate: any;
    let startDate: any;
    let eDate: any;
    let endDate: any;
    let cDate: any;
    let currentDate: any;
    const date = new Date();
    cDate = this.getDate(date);

    // Condition to show the progress bar
    if (ferment.Status === '7cd88ffb-cf41-4efc-9a17-d75bcb5b3770') {
      ferment.statusField = 'notstarted';
      ferment.disableDelete = true;
      ferment.disableEdit = false;
    } else if (ferment.Status === '4267ae2f-4b7f-4a70-a592-878744a13900') {
      // commited
      ferment.statusField = 'committed';
      ferment.disableDelete = false;
      ferment.disableEdit = true;
    } else if (ferment.Status === '9231c5f1-2235-4f7b-b5e6-80694333dd72') {
      // completed
      ferment.statusField = 'completed';
      ferment.disableDelete = false;
      ferment.disableEdit = false;
    } else if (ferment.Status === 'c2b1d8a5-7ed2-4c45-affd-80d043f0321a') {
      // cancelled
      ferment.statusField = 'cancelled';
      ferment.disableDelete = false;
      ferment.disableEdit = false;
    } else if (ferment.Status === '1625a5c1-b41a-4f6e-91ad-e4aa0c61121c') {
      // deleted
      ferment.statusField = 'deleted';
      ferment.disableDelete = false;
      ferment.disableEdit = false;
    } else {
      ferment.statusField = 'progress';
      ferment.disableDelete = false;
      ferment.disableEdit = false;
    }

    ferment.localTime = currentDate;
    if (ferment.StartTime !== null) {
      sDate = this.getDate(new Date(ferment.StartTime));
      eDate = this.getDate(new Date(ferment.EndTime));
      startDate = new Date(sDate);
      endDate = new Date(eDate);
      currentDate = new Date(cDate);
      ferment.StartTime = new Date(ferment.StartTime);
      ferment.EndTime = new Date(ferment.EndTime);

      // Total days completed calculation
      if (endDate <= currentDate) {
        let diffTime = Math.abs(endDate - startDate);
        ferment.daysCompleted = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } else {
        let diffTime = Math.abs(currentDate - startDate);
        ferment.daysCompleted = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      // Total days left calculation
      if (endDate <= currentDate) {
        ferment.daysLeft = 0;
      } else {
        let diffTime = Math.abs(endDate - currentDate);
        ferment.daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      ferment.totalDays = ferment.daysCompleted + ferment.daysLeft;

      // Percentage calculation
      if (ferment.daysCompleted) {
        ferment.percentage = Math.round(ferment.daysCompleted / ferment.totalDays * 100);
      } else if (ferment.daysCompleted === 0 && ferment.daysLeft !== 0) {
        ferment.percentage = 0;
      } else {
        ferment.percentage = 100;
      }

      // Progress bar color calculation
      if (ferment.percentage <= 25 && ferment.percentage >= 0) {
        ferment.color = '#FB0404';
      } else if (ferment.percentage >= 26 && ferment.percentage <= 75) {
        ferment.color = '#FBD204';
      } else if (ferment.percentage >= 76 && ferment.percentage <= 100) {
        ferment.color = '#04FB6F';
      }
    }
  }

  getDate(date) {
    this.month = date.getMonth() + 1;
    this.day = date.getDate();
    const year = date.getFullYear();
    return this.month + '/' + this.day + '/' + year;
  }

  searchBrew(searchText) {
    const search = searchText;
    this.apiService.getDataByQueryParams(this.apiService.getAllBrewReportsList + `&startwith=${search}`, null,
      this.tenantId, null, this.config.currentPage, this.config.itemsPerPage).
      subscribe((response) => {
        const myHeaders = response.headers;
        this.headerValue = JSON.parse(response.headers.get('paging-headers'));
        if (this.headerValue) {
          this.config.totalItems = this.headerValue.TotalCount;
        }
        if (response && response['body']) {
          this.fermentaionContent = response['body'];
          this.fermentaionContent.map((ferment, idx) => {
            if (ferment.OrgSuperUser !== null) {
              this.brewProgressCalculation(ferment);
              ferment.RecipeName = ferment.RecipeName !== null ? ferment.RecipeName : '';
              ferment.StartTime = ferment.StartTime;
              ferment.BrewRunId = ferment.BrewRunId;
            }
          });
        }
      });
  }

  viewBrewReport(brewId) {
    const data = this.data.checkPermission(permission.View_Brew_Run.Id);
    if (!data) {
      this.toastr.danger('You don\'t have access', 'Error');
    } else {
      this.checkPermission = true;
      this.router.navigate(['app/reports/view/' + brewId]);
    }
  }

  pdfClick(brewId) {
    const data = this.data.checkPermission(permission.View_Brew_Run.Id);
    if (!data) {
      this.toastr.danger('You don\'t have access', 'Error');
    } else {
      this.checkPermission = true;
      this.router.navigate(['app/reports/view/' + brewId]);
    }
  }

  printClick(brewId) {
    this.pdfClick(brewId);
  }

  downloadAsPDF() {
    const div = document.getElementById('pdfDiv');
    html2canvas(div).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      const doc = new jsPDF('p', 'mm');
      let position = 0;
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      const filename = JSON.parse(sessionStorage.user).CompanyDetails.Name;
      doc.save(`${filename}.pdf`);
    });
  }

  filter(filterParam) {
    if (this.fermentaionContent) {
      if (this.toggleStatus === true && filterParam === 'brewId') {
        this.fermentaionContent.sort((a, b) => a.BrewRunId.toUpperCase() > b.BrewRunId.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && filterParam === 'brewId') {
        this.fermentaionContent.sort((a, b) => a.BrewRunId.toUpperCase() < b.BrewRunId.toUpperCase() ? 1 : -1);
      }
      if (this.toggleStatus === true && filterParam === 'recipeName') {
        this.fermentaionContent.sort((a, b) => a.RecipeName.toUpperCase() > b.RecipeName.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && filterParam === 'recipeName') {
        this.fermentaionContent.sort((a, b) => a.RecipeName.toUpperCase() < b.RecipeName.toUpperCase() ? 1 : -1);
      }
      if (this.toggleStatus === true && filterParam === 'tankName') {
        this.fermentaionContent.sort((a, b) => a.TankName.toUpperCase() > b.TankName.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && filterParam === 'tankName') {
        this.fermentaionContent.sort((a, b) => a.TankName.toUpperCase() < b.TankName.toUpperCase() ? 1 : -1);
      }
      if (this.toggleStatus === true && filterParam === 'starEndDate') {
        this.fermentaionContent.sort((a, b) => a.StartTime > b.StartTime ? 1 : -1);
      } else if (this.toggleStatus === false && filterParam === 'starEndDate') {
        this.fermentaionContent.sort((a, b) => a.StartTime < b.StartTime ? 1 : -1);
      }
      if (this.toggleStatus === true && filterParam === 'status') {
        this.fermentaionContent.sort((a, b) => a.Status.toUpperCase() > b.Status.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && filterParam === 'status') {
        this.fermentaionContent.sort((a, b) => a.Status.toUpperCase() < b.Status.toUpperCase() ? 1 : -1);
      }
    }
    this.toggleStatus = !this.toggleStatus;
  }
}
