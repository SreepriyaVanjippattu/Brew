import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BrewRunConditioning, ConditioningDetail, FilterationDetail, CarbonationDetail, ConditioningDetailsNote } from '../../../../models/brewrun';
import { DashboardService } from '../dashboard.service';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { NbToastrService } from '@nebular/theme';
import { permission } from '../../../../models/rolePermission';
import { DataService } from '../../../../data.service';
import { StatusUse } from '../../../../models/status-id-name';
import { DatePipe } from '@angular/common';
import { String } from 'typescript-string-operations';
import { Observable,of as observableOf, throwError } from 'rxjs';

@Component({
  selector: 'condition-form',
  templateUrl: './condition-form.component.html',
  styleUrls: ['./condition-form.component.scss']
})

export class ConditionFormComponent implements OnInit {
  @ViewChild('carbStart', { static: false }) carbStart: ElementRef;
  @ViewChild('conStart', { static: false }) conStart: ElementRef;
  isCollapsedConditioning = false;
  isCollapsedFiltration = false;
  isCollapsedCarbonation = false;
  isCollapsedNotes;

  tenantId: any;
  brewId: any;

  brewRunConditioning: BrewRunConditioning;

  conStartTime: any = '';
  conEndTime: any = '';
  carStartTime: any = '';
  carEndTime: any = '';

  units: any;
  preference: any;
  preferedUnit: any;
  permission = permission;
  preferedPlato: any;
  platoUnitId: any;
  recipeContent: any;
  conditionTarget = [];
  filterTarget = [];
  carbonTarget = [];
  recipeId: any;
  status = StatusUse;
  currentUser: any;
  setClass = false;
  setClassCarb = false;
  setClassCond = false;
  committed = false;
  conditioningAvailable:boolean;
  brewerName:string;

  constructor(
    private dataService: DashboardService,
    private apiService: ApiProviderService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: NbToastrService,
    private data: DataService,
    private datePipe: DatePipe,
  ) { }

  ngOnInit() {
   this.brewRunConditioning = new BrewRunConditioning();

   this.brewId = this.route.snapshot.paramMap.get('id');
   const userDetails = JSON.parse(sessionStorage.getItem('user'));
   
   this.tenantId = userDetails["userDetails"]["tenantId"];
   this.currentUser = userDetails["userDetails"]["userId"];
   this.brewerName = userDetails["userDetails"]["firstName"] + ' ' + userDetails["userDetails"]["lastName"];
    this.getPreferenceUsed();
    this.getConditioningMasterDetails();
    this.getConditioningDetails();
    
  }

  getConditioningMasterDetails()
  {
    const getConditioningMasterDetailsAPI = String.Format(this.apiService.getConditioningMasterDetails, this.tenantId);
    this.apiService.getDataList(getConditioningMasterDetailsAPI).subscribe(response => {
      if (response) {
        this.units = response['body']['conditioningMasterDetails']['units']
        this.findUnits();
      }
    });
  }



  /**
   * Function to get single brew
   * @param tenantId
   * @param brewId
   */
  getConditioningDetails() {
    const getConditioningDetailsAPI = String.Format(this.apiService.getConditioningDetails, this.tenantId,this.brewId);
    this.apiService.getDataByQueryParams(getConditioningDetailsAPI, null, this.tenantId,this.brewId).subscribe(response => {
      if (response.status === 200) {
        this.brewRunConditioning = response['body']['brewRunConditioning'];
        this.conditioningAvailable =response['body']['conditioningAvailable']
        this.recipeContent = response['body']['recipe'];
        this.getConditionTargets(this.recipeContent);
        this.getFilterTargets(this.recipeContent);
        this.getCarbonTargets(this.recipeContent);
        if (this.brewRunConditioning.conditioningDetails.length == 0) {
         this.brewRunConditioning.conditioningDetails.push(new ConditioningDetail());
         this.brewRunConditioning.conditioningDetails[this.brewRunConditioning.conditioningDetails.length - 1].tenantId = this.tenantId;

        } else {
         this.brewRunConditioning.conditioningDetails.map((conTimes: ConditioningDetail) => {
            conTimes.startTime = this.datePipe.transform(conTimes.startTime, 'E, dd LLL yyyy HH:mm:ss');
            conTimes.endTime = this.datePipe.transform(conTimes.endTime, 'E, dd LLL yyyy HH:mm:ss');
          })
        }
        if (this.brewRunConditioning.filterationDetails.length === 0) {
         this.brewRunConditioning.filterationDetails.push(new FilterationDetail());
        }
        if (this.brewRunConditioning.carbonationDetails.length == 0) {
         this.brewRunConditioning.carbonationDetails.push(new CarbonationDetail());
         this.brewRunConditioning.carbonationDetails[this.brewRunConditioning.carbonationDetails.length - 1].tenantId = this.tenantId;

        } else {
         this.brewRunConditioning.carbonationDetails.map((carTimes: CarbonationDetail) => {
            carTimes.startTime = this.datePipe.transform(carTimes.startTime, 'E, dd LLL yyyy HH:mm:ss');
            carTimes.endTime = this.datePipe.transform(carTimes.endTime, 'E, dd LLL yyyy HH:mm:ss');
          })
        }
        if (this.brewRunConditioning.conditioningDetailsNotes.length == 0) {
         this.brewRunConditioning.conditioningDetailsNotes.push(new ConditioningDetailsNote());
         this.brewRunConditioning.conditioningDetailsNotes[this.brewRunConditioning.conditioningDetailsNotes.length - 1].tenantId = this.tenantId;

        }
        this.checkIfComplete(this.brewRunConditioning);
      }
      this.conStartTime = this.datePipe.transform(this.brewRunConditioning.conditioningDetails[0].startTime, 'E, dd LLL yyyy HH:mm:ss');
      this.conEndTime = this.datePipe.transform(this.brewRunConditioning.conditioningDetails[0].endTime, 'E, dd LLL yyyy HH:mm:ss');
      this.carStartTime = this.datePipe.transform(this.brewRunConditioning.carbonationDetails[0].startTime, 'E, dd LLL yyyy HH:mm:ss');
      this.carEndTime = this.datePipe.transform(this.brewRunConditioning.carbonationDetails[0].endTime, 'E, dd LLL yyyy HH:mm:ss');

    });
  }

  findUnits() {
    if (!this.preference)
    {
      this.getPreferenceUsed();
    }
   
    this.units.forEach(element => {
      if (element.id === this.preference.temperatureId) {
        this.preferedUnit = element.symbol;
      }
      if (element.id === this.preference.gravityMeasurementId) {
        this.preferedPlato = element.name;
        this.platoUnitId = element.id;
      }
    });
  }

  getPreferenceUsed() {
    const getPreferenceSettingsAPI = String.Format(this.apiService.getPreferenceSettings, this.tenantId);
    this.apiService.getDataList(getPreferenceSettingsAPI).subscribe((response: any) => {
     
      if (response.status === 200) {
        this.preference = response['body']['preferenceSettings'];
      }
    }, error => {

    });
  }

  brewLogClick() {
    this.saveGo('app/dashboard/brew-log-form/' + this.brewId);
  }
  mashInClick() {
    this.saveGo('app/dashboard/mash-in-form/' + this.brewId);
  }

  fermentationClick() {
    this.saveGo('app/dashboard/fermentation-form/' + this.brewId);
  }

  conditioningClick() {
    this.saveGo('app/dashboard/condition-form/' + this.brewId);
  }

  activeBrewClick() {
  }

  commitBrewRun() {
    const data = this.data.checkPermission(this.permission.Commit_Brew_Run.Id);

    if (!data) {
      this.toast.danger('You don\'t have access', 'Error');
    } else {
     this.brewRunConditioning.status = this.status.commited.id;
     this.committed = true;
     this.saveGo('app/dashboard');
    }
  }

  completeBrewRun() {
   this.brewRunConditioning.status = this.status.completed.id;
   this.saveGo('app/dashboard/view-brew-run/' + this.brewId);
  }
  saveGo(url: string) {

    this.saveData().subscribe(response => {
      if (this.committed) {
        this.toast.success('The Brew Run' + '' +this.brewRunConditioning.brewRunId + ' ' + 'Successfully Committed');
      }
      this.router.navigate([url]);
    }, error => {
      this.toast.danger(error.error.message);
    });
  }

  setConStart(i, start) {
    this.conStartTime = this.timezone().toString();
    this.conStartTime = this.conStartTime.split(' ').slice(0, 5).join(' ');
    start.startTime = this.conStartTime;
  }

  setConEnd(i, end) {
    this.conEndTime = this.timezone().toString();
    this.conEndTime = this.conEndTime.split(' ').slice(0, 5).join(' ');
    end.endTime = this.conEndTime;
  }

  setCarbStart(i, start) {
    this.carStartTime = this.timezone().toString();
    this.carStartTime = this.carStartTime.split(' ').slice(0, 5).join(' ');
    start.startTime = this.carStartTime;
  }

  setCarbEnd(i, end) {
    this.carEndTime = this.timezone().toString();
    this.carEndTime = this.carEndTime.split(' ').slice(0, 5).join(' ');
    end.endTime = this.carEndTime;
  }

  timezone() {
    // Timezone convertion
    const preferedZone = this.preference.baseUtcOffset;
    if (preferedZone !== undefined && preferedZone !== null) {
      let zone = preferedZone.split(':');
      const now = new Date();
      var utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));

      var hours = utc.getHours() + Number(zone[0]);
      var minutes = utc.getMinutes() + Number(zone[1]);
      var seconds = utc.getSeconds() + Number(zone[2]);

      return new Date(utc.setHours(hours,minutes,seconds));
    }
  }

 

  getConditionTargets(recipeContent: any) {
    if (recipeContent.ConditioningTargets !== null) {
      this.conditionTarget.push(recipeContent.conditioningTargets);
    }
  }
  getFilterTargets(recipeContent: any) {
    if (recipeContent.FilterationTargets !== null) {
      this.filterTarget.push(recipeContent.filterationTargets);
    }
  }
  getCarbonTargets(recipeContent: any) {
    if (recipeContent.CarbonationTargets !== null) {
      this.carbonTarget.push(recipeContent.carbonationTargets);
    }
  }

  onFiltrationComplete(i, editedSectionName) {
    this.isCollapsedFiltration = !this.isCollapsedFiltration;
    this.brewRunConditioning.filterationDetails.map(element => {
      element.isCompleted = true;
    });
    this.saveData().subscribe(response => {
      this.setClass = true;
    }, error => {
      this.setClass = false;
      this.toast.danger(error.error.message);
    });

  }

  onCarbonationComplete(i, editedSectionName) {
    this.isCollapsedCarbonation = !this.isCollapsedCarbonation;
    this.brewRunConditioning.carbonationDetails.map(element => {
      element.isCompleted = true;
    });
    this.saveData().subscribe(response => {
      this.setClassCarb = true;
    }, error => {
      this.setClassCarb = false;
      this.toast.danger(error.error.message);
    });

  }

  onConditioningComplete(i, editedSectionName) {
    this.isCollapsedConditioning = !this.isCollapsedConditioning;
    this.brewRunConditioning.conditioningDetails.map(element => {
      element.isCompleted = true;
    });
    this.saveData().subscribe(response => {
      this.setClassCond = true;
    }, error => {
      this.setClassCond = false;
      this.toast.danger(error.error.message);
    });
  }

  checkIfComplete(brew: BrewRunConditioning) {
    if (brew.filterationDetails.length !== 0) {
      brew.filterationDetails.map(element => {
        if (element.isCompleted === true) {
          this.isCollapsedFiltration = !this.isCollapsedFiltration;
          this.setClass = true;
        }
      });
    }

    if (brew.carbonationDetails.length !== 0) {
      brew.carbonationDetails.map(element => {
        if (element.isCompleted === true) {
          this.isCollapsedCarbonation = !this.isCollapsedCarbonation;
          this.setClassCarb = true;
        }
      });
    }

    if (brew.conditioningDetails.length !== 0) {
      brew.conditioningDetails.map(element => {
        if (element.isCompleted === true) {
          this.isCollapsedConditioning = !this.isCollapsedConditioning;
          this.setClassCond = true;
        }
      });
    }
  }

  saveData(): Observable<boolean>{
    const conditioningDetailsAPI = String.Format(this.apiService.getConditioningDetails, this.tenantId,this.brewId);
    if (!this.conditioningAvailable) {
        this.apiService.postData(conditioningDetailsAPI, this.brewRunConditioning).subscribe(response => {
          this.conditioningAvailable = response['body']['conditioningAvailable'];
          return observableOf(true);
        }, error => {
        return throwError(error);
      });
    }
    else {
       this.apiService.putData(conditioningDetailsAPI, this.brewRunConditioning).subscribe(response => {
        this.conditioningAvailable =  response['body']['conditioningAvailable'];
        return observableOf(true);
        }, error => {
          return throwError(error);
      });
    }
    return observableOf(false);
  }

}
