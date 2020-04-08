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
    this.tenantId = userDetails['CompanyDetails'].id;
    this.currentUser = userDetails['UserProfile'].id;
    this.units = JSON.parse(sessionStorage.getItem('units'));
    this.getPreferenceUsed();

    this.getSingleBrewDetails(this.tenantId, this.brewId);
  }

  /**
   * Function to get single brew
   * @param tenantId
   * @param brewId
   */
  getSingleBrewDetails(tenantId, brewId) {
    this.apiService.getDataByQueryParams(this.apiService.getBrewRunById, null, tenantId, brewId).subscribe(response => {
      if (response.status === 200) {
        console.log('MashEdit', response['body']);
       this.brewRunConditioning = response['body'];
        this.recipeId = response['body'].RecipeId;
        this.getRecipeDetailsEdit();
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
    this.units.forEach(element => {
      if (element.id === this.preference.TemperatureId) {
        this.preferedUnit = element.Symbol;
      }
      if (element.id === this.preference.GravityMeasurementId) {
        this.preferedPlato = element.Name;
        this.platoUnitId = element.id;
      }
    });
  }

  getPreferenceUsed() {
    const getPreferenceSettingsAPI = String.Format(this.apiService.getPreferenceSettings, this.tenantId);
    this.apiService.getDataList(getPreferenceSettingsAPI).subscribe((response: any) => {
      if (response.status === 200) {
        this.preference = response['body'];
        sessionStorage.setItem('preferenceUsed', JSON.stringify(this.preference));
        this.findUnits();
      }
    }, error => {
      console.error(error);
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
   this.brewRunConditioning.status = this.status.Compleated.id;
    this.saveGo('app/dashboard/view-brew-run/' + this.brewId);
  }
  saveGo(url: string) {

   this.brewRunConditioning.conditioningDetails.forEach((con: ConditioningDetail) => {
      con.tenantId = this.tenantId;
    });
   this.brewRunConditioning.carbonationDetails.forEach((car: CarbonationDetail) => {
      car.tenantId = this.tenantId;
    });

    this.apiService.postData(this.apiService.addBrewRun,this.brewRunConditioning).subscribe(response => {
      if (response) {
        if (this.committed) {
          this.toast.success('The Brew Run' + '' +this.brewRunConditioning.brewRunId + ' ' + 'Successfully Committed');
        }
        this.router.navigate([url]);
      }
    }, error => {
      this.toast.danger(error.error.Message);
    });
  }

  setConStart(i, start) {
    this.conStartTime = this.timezone(new Date().toUTCString());
    this.conStartTime = this.conStartTime.split(' ').slice(0, 5).join(' ');
    start.startTime = this.conStartTime;
  }

  setConEnd(i, end) {
    this.conEndTime = this.timezone(new Date().toUTCString());
    this.conEndTime = this.conEndTime.split(' ').slice(0, 5).join(' ');
    end.endTime = this.conEndTime;
  }

  setCarbStart(i, start) {
    this.carStartTime = this.timezone(new Date().toUTCString());
    this.carStartTime = this.carStartTime.split(' ').slice(0, 5).join(' ');
    start.startTime = this.carStartTime;
  }

  setCarbEnd(i, end) {
    this.carEndTime = this.timezone(new Date().toUTCString());
    this.carEndTime = this.carEndTime.split(' ').slice(0, 5).join(' ');
    end.endTime = this.carEndTime;
  }

  timezone(dateTime) {
    // Timezone convertion
    const timeZone = JSON.parse(sessionStorage.preferenceUsed);
    const preferedZone = timeZone.BaseUtcOffset;
    if (preferedZone !== undefined && preferedZone !== null) {
      let zone = preferedZone.replace(/:/gi, '');
      zone = zone.slice(0, -2);
      if (zone.includes('-')) {
        zone = zone.replace(/-/gi, '+');
      } else if (zone.includes('+')) {
        zone = zone.replace(/\+/gi, '-');
      }
      const newDateTime = dateTime + ' ' + `${zone}`;
      return new Date(newDateTime).toUTCString();
    }
  }

  getRecipeDetailsEdit() {
    const getRecipebyIdAPI = String.Format(this.apiService.getRecipebyId, this.tenantId, this.recipeId);
    this.apiService.getDataList(getRecipebyIdAPI).subscribe(response => {
      if (response && response['body']) {
        this.recipeContent = response['body'];
        this.getConditionTargets(this.recipeContent);
        this.getFilterTargets(this.recipeContent);
        this.getCarbonTargets(this.recipeContent);
      }
    });
  }

  getConditionTargets(recipeContent: any) {
    if (recipeContent.ConditioningTargets !== null) {
      this.conditionTarget.push(recipeContent.ConditioningTargets);
    }
  }
  getFilterTargets(recipeContent: any) {
    if (recipeContent.FilterationTargets !== null) {
      this.filterTarget.push(recipeContent.FilterationTargets);
    }
  }
  getCarbonTargets(recipeContent: any) {
    if (recipeContent.CarbonationTargets !== null) {
      this.carbonTarget.push(recipeContent.CarbonationTargets);
    }
  }

  onFiltrationComplete(i, editedSectionName) {
    this.isCollapsedFiltration = !this.isCollapsedFiltration;
   this.brewRunConditioning.filterationDetails[i].isCompleted = true;
    this.setClass = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onCarbonationComplete(i, editedSectionName) {
    this.isCollapsedCarbonation = !this.isCollapsedCarbonation;
   this.brewRunConditioning.carbonationDetails[i].isCompleted = true;
    this.setClassCarb = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onConditioningComplete(i, editedSectionName) {
    this.isCollapsedConditioning = !this.isCollapsedConditioning;
   this.brewRunConditioning.conditioningDetails[i].isCompleted = true;
    this.setClassCond = true;
    this.addbrewUserAuditTrail(editedSectionName);
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

  addbrewUserAuditTrail(editedSectionName) {
    const params = {
      Id:this.brewRunConditioning.id,
      brewRunId:this.brewRunConditioning.brewRunId,
       CreatedByUserId: this.currentUser,
      tenantId:this.brewRunConditioning.tenantId,
      CurrentEditedSectionName: editedSectionName,
    };
    this.apiService.postData(this.apiService.addBrewUserAuditTrail, params).subscribe((response: any) => {
    }, error => {
      console.log(error);
    });
  }
}
