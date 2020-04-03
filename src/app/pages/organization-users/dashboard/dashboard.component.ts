import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { ApiProviderService } from '../../../core/api-services/api-provider.service';
import { DashboardService } from './dashboard.service';
import { ModalService } from '../../modal/modal.service';
import { NbToastrService } from '@nebular/theme';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import { DataService } from '../../../data.service';
import { permission } from '../../../models/rolePermission';
import { format } from 'ssf/types';
import { String, StringBuilder } from 'typescript-string-operations';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  day;
  month;
  hours;
  minutes;
  seconds;
  private index: number = 0;
  brewRuns;
  completionPercent: Number;
  maxSize: number = 5;
  message: String;
  next;
  previous;
  units: any;
  tenantId;
  config = {
    currentPage: 1,
    itemsPerPage: 5,
    totalItems: 20,
  };
  page: any;

  headerValue: any;
  singleDeletedBrew: any;
  timeZones: any;
  zone: any;
  startTime: string;
  endTime: string;
  showProgress:  boolean;
  hideProgress:  boolean;
  disableDelete:  boolean;
  progressId: any;
  pageControl;
  searchText: string;


  permission = permission;
  singleArchieveBrew: any;
  currentUser: any;
  toggleStatus: boolean = false;
 
  constructor(
    private apiService: ApiProviderService,
    private router: Router,
    private route: ActivatedRoute,
    private dashboardService: DashboardService,
    private modalService: ModalService,
    private toastrService: NbToastrService,
    private data:DataService
  ) {
      this.searchText = "";

   }

  ngOnInit() {
    const userDetails = JSON.parse(sessionStorage.getItem('user'));
    
    this.tenantId = userDetails["userDetails"]["tenantId"];
    this.currentUser = userDetails["userDetails"]["userId"];
    this.page = this.route.snapshot.queryParamMap.get('page');
    if (this.page) {
      this.config.currentPage = this.page 
    }
    this.searchText =  this.route.snapshot.queryParamMap.get('searchText');

    this.getDashBoardDetails();
   }

  getDashBoardDetails() {
    this.router.navigate(['app/dashboard'], {
      queryParams: {
        page: this.config.currentPage,
        searchText : this.searchText
      },
    });


    const getAllBrewRunAPI= String.Format(this.apiService.getAllBrewRun, this.tenantId);
    this.apiService.getDataByQueryParams(getAllBrewRunAPI, null, null, null, this.config.currentPage, this.config.itemsPerPage,this.searchText).subscribe(response => {
      this.brewRuns = response['body']['brewRuns'];
      const archivePermission = this.data.checkPermission(this.permission.Archive_Brew_Run.Id);
      if (this.brewRuns) {
        this.brewRuns.map((brewRun, idx) => {
          brewRun.archivePermission = archivePermission;
          this.brewProgressCalculation(brewRun);
        });
      }
     
      this.headerValue = response['body']['pagingDetails'];
      if (this.headerValue) {
      this.config.totalItems = this.headerValue.totalCount;
      if (this.config.totalItems === 0) {
        this.pageControl = true;
      }
      }
    }, error => {
      console.error(error);
    });
    this.route.queryParamMap.map(params => params.get('page')).subscribe((page: any) => {
      return this.config.currentPage = page;
    });
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

  singleFermentationClick(value, fermentationId) {
    const params = {
      percentage: value.percentage,
      daysCompleted: value.daysCompleted,
      totalDays: value.totalDays,
      daysLeft: value.daysLeft,
    };

    sessionStorage.progressData = JSON.stringify(params);
    const data = this.data.checkPermission(this.permission.View_Brew_Run.Id);
    if (!data) {
      this.toastrService.danger('You don\'t have access', 'Error');
    } else {
    this.data.changeMessage(value);
    this.router.navigate(['app/dashboard/view-brew-run/' + fermentationId]);
    }
  }

  archiveSingleBrew(fermentation) {
    this.singleArchieveBrew = fermentation;
  }

  archiveBrew() {

      const changeBrewRunStatusAPI= String.Format(this.apiService.ChangeBrewRunStatus, this.tenantId,this.singleArchieveBrew.id);
      const params = {
        statusId: 'fc7178dd-c5c1-4776-944a-b50fe2c37f06'
      };
      this.apiService.patchData(changeBrewRunStatusAPI, params).subscribe((response: any) => {
        if (response) {

          this.toastrService.success('Brew successfully archived')
          this.router.navigate(['app/dashboard/archives']);

        }
      }, error => {
        this.toastrService.danger('Something went wrong, Try Again');
      });


  }

  newBrewClick() {
    this.router.navigate(['app/dashboard/add-brew-run']);
  }

  editBrew(value, brewId) {
    this.router.navigate(['app/dashboard/edit-brew-run/' + brewId]);
  }

  archivedClick() {
    this.router.navigate(['app/dashboard/archives']);
  }

  deleteUser(fermentation) {
    this.singleDeletedBrew = fermentation;
  }

  deleteBrew() {
    const params = {
      id: this.singleDeletedBrew.Id,
      BrewRunId: this.singleDeletedBrew.brewRunId,
      status: '1625A5C1-B41A-4F6E-91AD-E4AA0C61121C',
      tenantId: this.tenantId,
      CreatedByUserId: this.currentUser,
    };
    this.apiService.putData(this.apiService.changeBrewRunStatus, params).subscribe((response) => {
      if (response) {
        this.getDashBoardDetails();
        this.toastrService.success('Brew successfully deleted');
      }
    }, error => {
      this.toastrService.danger('Something went wrong, Try Again');
    });
  }

  searchBrew(event) {
    this.searchText = event.target.value;
    this.config.currentPage = 1;
    this.getDashBoardDetails();
  
  
  }



  brewProgressCalculation(brewRun) {
   let sDate: any;
    let startDate: any;
    let eDate: any;
    let endDate: any;
    let cDate: any;
    let currentDate: any;
    const date = new Date();
    cDate = this.getDate(date);

    // Condition to show the progress bar
    if (brewRun.statusId === '7cd88ffb-cf41-4efc-9a17-d75bcb5b3770') {
      brewRun.statusField = 'notstarted';
      brewRun.disableDelete = true;
      brewRun.disableEdit = false;
    }else if (brewRun.statusId === '4267ae2f-4b7f-4a70-a592-878744a13900') {
      // commited
      brewRun.statusField = 'committed';
      brewRun.disableDelete = false;
      brewRun.disableEdit = true;
    } else if (brewRun.statusId === '9231c5f1-2235-4f7b-b5e6-80694333dd72') {
      // completed
      brewRun.statusField = 'completed';
      brewRun.disableDelete = false;
      brewRun.disableEdit = false;
    } else if (brewRun.statusId === 'c2b1d8a5-7ed2-4c45-affd-80d043f0321a') {
      // cancel
      brewRun.statusField = 'cancel';
      brewRun.disableDelete = false;
      brewRun.disableRestore = true;
    }  else {
      brewRun.statusField = 'progress';
      brewRun.disableDelete = false;
      brewRun.disableEdit = false;
    }

    brewRun.localTime = currentDate;
    if (brewRun.StartTime !== null) {
      sDate = this.getDate(new Date(brewRun.startTime));
      eDate = this.getDate(new Date(brewRun.endTime));
      startDate = new Date(sDate);
      endDate = new Date(eDate);

      currentDate = new Date(cDate);
      brewRun.startTime = new Date(brewRun.startTime);
      brewRun.endTime = new Date(brewRun.endTime);

      // Total days completed calculation
      if (endDate <= currentDate) {
        let diffTime =  Math.abs(endDate - startDate);
        brewRun.daysCompleted =  Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      } else {
        let diffTime =  Math.abs(currentDate - startDate);
        brewRun.daysCompleted =  Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }

      // Total days left calculation
      if (endDate <= currentDate) {
        brewRun.daysLeft = 0;
      } else {
        let diffTime = Math.abs(endDate - currentDate);
        brewRun.daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
      brewRun.totalDays = brewRun.daysCompleted + brewRun.daysLeft;

      // Percentage calculation
      if (brewRun.daysCompleted) {
        brewRun.percentage = Math.round(brewRun.daysCompleted / brewRun.totalDays * 100);
      } else if (brewRun.daysCompleted === 0 && brewRun.daysLeft !== 0) {
        brewRun.percentage = 0;
      } else {
        brewRun.percentage = 100;
      }

      // Progress bar color calculation
      if (brewRun.percentage <= 25 && brewRun.percentage >= 0) {
        brewRun.color = '#FB0404';
      } else if (brewRun.percentage >= 26 && brewRun.percentage <= 75) {
        brewRun.color = '#FBD204';
      } else if (brewRun.percentage >= 76 && brewRun.percentage <= 100) {
        brewRun.color = '#04FB6F';
      }

    }
  }

  getDate(date) {
    this.month = date.getMonth() + 1;
    this.day = date.getDate();
    const year = date.getFullYear();
    return this.month  + '/' + this.day + '/' +  year ;
  }

  deleteToast() {
    this.toastrService.warning('Unable to delete, Brew already started');
  }

  archiveToast() {
    this.toastrService.danger('You don\'t have access');
  }

  editToast() {
    this.toastrService.warning('Unable to edit, Brew already committed');
  }
  filter(label) {
    

    if (this.brewRuns) {
      if (this.toggleStatus === true && label === 'brewId') {
        this.brewRuns.sort((a, b) => a.brewRunId.toUpperCase() > b.brewRunId.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && label === 'brewId') {
        this.brewRuns.sort((a, b) => a.brewRunId.toUpperCase() < b.brewRunId.toUpperCase() ? 1 : -1);
      }
      if (this.toggleStatus === true && label === 'recipeName') {
        this.brewRuns.sort((a, b) => a.recipeName.toUpperCase() > b.recipeName.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && label === 'recipeName') {
        this.brewRuns.sort((a, b) => a.recipeName.toUpperCase() < b.recipeName.toUpperCase() ? 1 : -1);
      }
      if (this.toggleStatus === true && label === 'tankName') {
        this.brewRuns.sort((a, b) => a.tankName.toUpperCase() > b.tankName.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && label === 'tankName') {
        this.brewRuns.sort((a, b) => a.tankName.toUpperCase() < b.tankName.toUpperCase() ? 1 : -1);
      }
      if (this.toggleStatus === true && label === 'date') {
        this.brewRuns.sort((a, b) => a.startTime > b.startTime ? 1 : -1);
      } else if (this.toggleStatus === false && label === 'date') {
        this.brewRuns.sort((a, b) => a.startTime < b.startTime ? 1 : -1);
      }
      if (this.toggleStatus === true && label === 'status') {
        this.brewRuns.sort((a, b) => a.status.toUpperCase() > b.status.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && label === 'status') {
        this.brewRuns.sort((a, b) => a.status.toUpperCase() < b.status.toUpperCase() ? 1 : -1);
      }
    }
    this.toggleStatus = !this.toggleStatus;
  }

}

