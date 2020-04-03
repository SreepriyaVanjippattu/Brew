import { Component, OnInit } from '@angular/core';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { Router } from '@angular/router';
import { DashboardService } from '../dashboard.service';
import { ModalService } from '../../../modal/modal.service';

import { NbToastrService } from '@nebular/theme';
import { String, StringBuilder } from 'typescript-string-operations';

@Component({
  selector: 'app-archived-brews',
  templateUrl: './archived-brews.component.html',
  styleUrls: ['./archived-brews.component.scss'],
})
export class ArchivedBrewsComponent implements OnInit {
  idNumber;
  archivedContent;
  completionPercent: Number;
  maxSize: number = 5;
  message: String;
  next;
  previous;
  day;
  month;
  hours;
  minutes;
  seconds;
  tenantId;
  deleteId;
  deleteBrewRunId;
  pageControl;

  config = {
    itemsPerPage: 5,
    currentPage: 1,
    totalItems: 0,
  };
  currentUser: any;
  toggleStatus: boolean = false;
  headerValue: any;
  jsonValue: any;
  searchText :string;

  constructor(
    private apiService: ApiProviderService,
    private router: Router,
    private dashboardService: DashboardService,
    private modalservice: ModalService,
    private toastrService: NbToastrService,

  ) { }

  ngOnInit() {
    this.dashboardService.currentMessage.subscribe(message => this.message = message);
    const userDetails = JSON.parse(sessionStorage.getItem('user'));
    this.tenantId = userDetails["userDetails"]["tenantId"];
    this.currentUser = userDetails["userDetails"]["userId"];
    this.getDashBoardDetails();
  }

  getDashBoardDetails() {
    this.router.navigate(['dashboard/archives'], {
      queryParams: {
        page: this.config.currentPage,
      },
    });
    let daysCompleted;
      let daysLeft;
      let startDateTime:any;
      let endDateTime:any;
      let currentDateTime:any;
      let d = new Date();
      this.month = d.getMonth() + 1;
      this.day = d.getDate();
      let year = d.getFullYear();
      let time = d.getTime();
      let currentDate: any;
      if (this.day < 10) {
        this.day = '0'+ this.day;
      }
      if (this.month < 10) {
        this.month = '0'+ this.month;
      }
      if (d.getHours() < 10) {
        this.hours = '0'+ d.getHours();
      }
      else {
        this.hours = d.getHours();
      }
      if (d.getMinutes() < 10) {
        this.minutes = '0'+ d.getMinutes();
      }
      else {
        this.minutes = d.getMinutes();
      }
      if (d.getSeconds() < 10) {
        this.seconds = '0'+ d.getSeconds();
      }
      else {
        this.seconds = d.getSeconds();
      }
      this.router.navigate(['app/dashboard/archives'], {
        queryParams: {
          page: this.config.currentPage,
        },
      });

      currentDate = year + "-" + this.month + "-" + this.day +"T"+this.hours+":"+this.minutes+":"+this.seconds;
      const getAllArchievedBrewRunAPI= String.Format(this.apiService.getAllArchievedBrewRun, this.tenantId);

      this.apiService.getDataByQueryParams(getAllArchievedBrewRunAPI, null, null, null,  this.config.currentPage, this.config.itemsPerPage,this.searchText).subscribe(response => {
        this.config.totalItems = response['body']['pagingDetails']['totalCount'];
        this.archivedContent = response['body']['brewRuns'];
        if (this.archivedContent) {
          this.jsonValue = response['body']['pagingDetails'];
          if (this.jsonValue) {
            this.config.totalItems = this.jsonValue.totalCount;
            if (this.config.totalItems === 0) {
              this.pageControl = true;
            }
          }
          this.archivedContent.map((archivedBrew, idx) => {
        
            this.brewProgressCalculation(archivedBrew);
          });
        }
      }, error => {
        console.error(error);
    });



  }

  pageSize(newSize) {
    this.config.itemsPerPage = newSize;
    this.config.currentPage = 1;
    this.getDashBoardDetails();
  }

  onPageChange(event) {
    this.config.currentPage = event;
    this.getDashBoardDetails();
  
  }

  deleteItem(id, brewRunId){
    this.deleteId = id;
    this.deleteBrewRunId = brewRunId;
  }

  searchBrew(event) {
    this.searchText = event.target.value;
    this.getDashBoardDetails();
  
  }

  restoreArchivedBrew(fermentationId, brewRunId) {
    const params = {
      statusId: '5BB309CA-1C1E-444E-9BC8-645686D7F66A'
    };
    const changeBrewRunStatusAPI= String.Format(this.apiService.ChangeBrewRunStatus, this.tenantId,fermentationId);
    this.apiService.patchData(changeBrewRunStatusAPI, params).subscribe((response: any) => {
      if (response) {
        this.toastrService.show('Restored', 'Success');
        this.router.navigate(['app/dashboard']);
      }
    }, error => {
      this.toastrService.danger('Something went wrong, Try Again');
    });
  }

  deleteArchivedBrew() {
    const params = {
      statusId: "1625A5C1-B41A-4F6E-91AD-E4AA0C61121C"
    };
    const changeBrewRunStatusAPI= String.Format(this.apiService.ChangeBrewRunStatus, this.tenantId,this.deleteId);
    
    this.apiService.patchData(changeBrewRunStatusAPI, params).subscribe((response: any) =>  {
      if (response) {
        this.toastrService.show('Deleted', 'Success');
        this.router.navigate(['app/dashboard']);
      }
    }, error => {
      this.toastrService.danger('Something went wrong, Try Again');
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

   
    if (ferment.statusId === '7cd88ffb-cf41-4efc-9a17-d75bcb5b3770') {
      ferment.statusField = 'notstarted';
      ferment.disableDelete = true;
      ferment.disableRestore = false;
    }else if (ferment.statusId === '4267ae2f-4b7f-4a70-a592-878744a13900') {
      // commited
      ferment.statusField = 'committed';
      ferment.disableDelete = false;
      ferment.disableRestore = false;
    } else if (ferment.statusId === '9231c5f1-2235-4f7b-b5e6-80694333dd72') {
      // completed
      ferment.statusField = 'completed';
      ferment.disableDelete = false;
      ferment.disableRestore = false;
    } else if (ferment.statusId === 'c2b1d8a5-7ed2-4c45-affd-80d043f0321a') {
      // cancel
      ferment.statusField = 'cancel';
      ferment.disableDelete = false;
      ferment.disableRestore = true;
    }else if (ferment.statusId === 'fc7178dd-c5c1-4776-944a-b50fe2c37f06') {
     
      if (ferment.previousStatusId === '9231c5f1-2235-4f7b-b5e6-80694333dd72') {
        // completed
        ferment.statusField = 'completed';
        ferment.disableDelete = false;
        ferment.disableRestore = false;
      } else if (ferment.previousStatusId === '7cd88ffb-cf41-4efc-9a17-d75bcb5b3770') {
        ferment.statusField = 'notstarted';
        ferment.disableDelete = true;
        ferment.disableRestore = false;
      }else if (ferment.previousStatusId === '4267ae2f-4b7f-4a70-a592-878744a13900') {
        // commited
        ferment.statusField = 'committed';
        ferment.disableDelete = false;
        ferment.disableRestore = false;
      }else {
        ferment.statusField = 'progress';
        ferment.disableDelete = false;
        ferment.disableRestore = false;
      }
    }else {
      ferment.statusField = 'progress';
      ferment.disableDelete = false;
      ferment.disableRestore = false;
    }

     ferment.localTime = currentDate;
     if (ferment.StartTime !== null) {
       sDate = this.getDate(new Date(ferment.startTime));
       eDate = this.getDate(new Date(ferment.endTime));
       startDate = new Date(sDate);
       endDate = new Date(eDate);
       currentDate = new Date(cDate);
       ferment.StartTime = new Date(ferment.startTime);
       ferment.EndTime = new Date(ferment.endTime);

       // console.log('ferment', ferment, sDate, eDate, 'sd', startDate, 'ed', endDate, 'cd', currentDate);

       // Total days completed calculation
       if (endDate <= currentDate) {
         let diffTime =  Math.abs(endDate - startDate);
         ferment.daysCompleted =  Math.ceil(diffTime / (1000 * 60 * 60 * 24));
       } else if(startDate > currentDate) {
         ferment.daysCompleted = 0;
       }
       else {
         let diffTime =  Math.abs(currentDate - startDate);
         ferment.daysCompleted =  Math.ceil(diffTime / (1000 * 60 * 60 * 24));
       }

       // Total days left calculation
       if (endDate <= currentDate) {
         ferment.daysLeft = 0;
       }
       else{
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

   getDate(date){
    this.month = date.getMonth() + 1;
    this.day = date.getDate();
    const year = date.getFullYear();
    return this.month  + '/' + this.day + '/' +  year ;
  }

  restoreToast(){
    this.toastrService.warning('Unable to restore, Brew already canceled');
  }

  filter(label) {
    if (this.archivedContent) {
      if (this.toggleStatus === true && label === 'brewId') {
        this.archivedContent.sort((a, b) => a.brewRunId.toUpperCase() > b.brewRunId.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && label === 'brewId') {
        this.archivedContent.sort((a, b) => a.brewRunId.toUpperCase() < b.brewRunId.toUpperCase() ? 1 : -1);
      }
      if (this.toggleStatus === true && label === 'recipeName') {
        this.archivedContent.sort((a, b) => a.recipeName.toUpperCase() > b.recipeName.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && label === 'recipeName') {
        this.archivedContent.sort((a, b) => a.recipeName.toUpperCase() < b.recipeName.toUpperCase() ? 1 : -1);
      }
      if (this.toggleStatus === true && label === 'tankName') {
        this.archivedContent.sort((a, b) => a.tankName.toUpperCase() > b.tankName.toUpperCase() ? 1 : -1);
      } else if (this.toggleStatus === false && label === 'tankName') {
        this.archivedContent.sort((a, b) => a.tankName.toUpperCase() < b.tankName.toUpperCase() ? 1 : -1);
      }
    }
    this.toggleStatus = !this.toggleStatus;
  }

}

