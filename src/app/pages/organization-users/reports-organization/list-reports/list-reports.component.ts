import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import html2canvas from 'html2canvas';
import * as jsPDF from 'jspdf';
import { permission } from '../../../../models/rolePermission';
import { DataService } from '../../../../data.service';
import { NbToastrService, NbLayoutScrollService } from '@nebular/theme';
import { String } from 'typescript-string-operations';

@Component({
  selector: 'app-list-reports',
  templateUrl: './list-reports.component.html',
  styleUrls: ['./list-reports.component.scss'],
})
export class ListReportsComponent implements OnInit {
  brewRuns;
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
  searchText: any;
  currentUser: any;

  constructor(
    private apiService: ApiProviderService,
    private router: Router,
    private route: ActivatedRoute,
    private data: DataService,
    private toastr: NbToastrService,
    private scrolltop: NbLayoutScrollService,

  ) { }

  ngOnInit() {
    const userDetails = JSON.parse(sessionStorage.getItem('user'));
    this.tenantId = userDetails["userDetails"]["tenantId"];
    this.currentUser = userDetails["userDetails"]["userId"];
    this.page = this.route.snapshot.queryParamMap.get('page');
    if (this.page) {
      this.config.currentPage = this.page
    }
    this.searchText = this.route.snapshot.queryParamMap.get('searchText');

    this.getDashBoardDetails();
  }

  getDashBoardDetails() {
    this.router.navigate(['app/reports'], {
      queryParams: {
        page: this.config.currentPage,
        searchText: this.searchText
      },
    });

    const getAllBrewReportsListAPI = String.Format(this.apiService.getAllBrewReportsList, this.tenantId);
    this.apiService.getDataByQueryParams(getAllBrewReportsListAPI, null, null, null, this.config.currentPage, this.config.itemsPerPage, this.searchText).subscribe(
      response => {
      this.brewRuns = response['body']['brewRuns'];
      this.data.passData(this.brewRuns);

      if (this.brewRuns) {
        this.brewRuns.map((ferment, idx) => {
          this.brewProgressCalculation(ferment);
        });
      }
      this.headerValue = response['body']['pagingDetails'];
      if (this.headerValue) {
        this.config.totalItems = this.headerValue.totalCount;
        this.pageControl = (this.config.totalItems === 0) ? true : false;
      }
    }, error => {
      console.error(error);
    });

  }
  clear() {
    this.searchText = "";
    this.searchBrew();
  }

  pageSize(newSize) {
    this.config.itemsPerPage = newSize;
    this.config.currentPage = 1;
    this.getDashBoardDetails();
  }

  pageChange(nextPage) {
    this.config.currentPage = nextPage;
    this.getDashBoardDetails();
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
    if (ferment.statusId === '7cd88ffb-cf41-4efc-9a17-d75bcb5b3770') {
      ferment.statusField = 'notstarted';
      ferment.disableDelete = true;
      ferment.disableEdit = false;
    } else if (ferment.statusId === '4267ae2f-4b7f-4a70-a592-878744a13900') {
      // commited
      ferment.statusField = 'committed';
      ferment.disableDelete = false;
      ferment.disableEdit = true;
    } else if (ferment.statusId === '9231c5f1-2235-4f7b-b5e6-80694333dd72') {
      // completed
      ferment.statusField = 'completed';
      ferment.disableDelete = false;
      ferment.disableEdit = false;
    } else if (ferment.statusId === 'c2b1d8a5-7ed2-4c45-affd-80d043f0321a') {
      // cancelled
      ferment.statusField = 'cancelled';
      ferment.disableDelete = false;
      ferment.disableEdit = false;
    } else if (ferment.statusId === '1625a5c1-b41a-4f6e-91ad-e4aa0c61121c') {
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
    if (ferment.startTime !== null) {
      sDate = this.getDate(new Date(ferment.startTime));
      eDate = this.getDate(new Date(ferment.endTime));
      startDate = new Date(sDate);
      endDate = new Date(eDate);
      currentDate = new Date(cDate);
      ferment.startTime = new Date(ferment.startTime);
      ferment.endTime = new Date(ferment.endTime);

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

  goToTop() {
    this.scrolltop.scrollTo(0, 0);
  }

  getDate(date) {
    this.month = date.getMonth() + 1;
    this.day = date.getDate();
    const year = date.getFullYear();
    return this.month + '/' + this.day + '/' + year;
  }

  searchBrew() {

    this.config.currentPage = 1;
    this.getDashBoardDetails();
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
    if (this.brewRuns) {
      if (this.toggleStatus === true && filterParam === 'brewId') {
        this.brewRuns.sort((a, b) => a.brewRunId.toUpperCase() > b.brewRunId.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && filterParam === 'brewId') {
        this.brewRuns.sort((a, b) => a.brewRunId.toUpperCase() < b.brewRunId.toUpperCase() ? 1 : -1);
      }
      if (this.toggleStatus === true && filterParam === 'recipeName') {
        this.brewRuns.sort((a, b) => a.recipeName.toUpperCase() > b.recipeName.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && filterParam === 'recipeName') {
        this.brewRuns.sort((a, b) => a.recipeName.toUpperCase() < b.recipeName.toUpperCase() ? 1 : -1);
      }
      if (this.toggleStatus === true && filterParam === 'tankName') {
        this.brewRuns.sort((a, b) => a.tankName.toUpperCase() > b.tankName.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && filterParam === 'tankName') {
        this.brewRuns.sort((a, b) => a.tankName.toUpperCase() < b.tankName.toUpperCase() ? 1 : -1);
      }
      if (this.toggleStatus === true && filterParam === 'starEndDate') {
        this.brewRuns.sort((a, b) => a.startTime > b.startTime ? 1 : -1);
      } else if (this.toggleStatus === false && filterParam === 'starEndDate') {
        this.brewRuns.sort((a, b) => a.startTime < b.startTime ? 1 : -1);
      }
      if (this.toggleStatus === true && filterParam === 'status') {
        this.brewRuns.sort((a, b) => a.status.toUpperCase() > b.status.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && filterParam === 'status') {
        this.brewRuns.sort((a, b) => a.status.toUpperCase() < b.status.toUpperCase() ? 1 : -1);
      }
    }
    this.toggleStatus = !this.toggleStatus;
  }
}
