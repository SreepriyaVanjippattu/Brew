import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { BrewRun, ConditioningDetail, FilterationDetail, CarbonationDetail, ConditioningDetailsNote } from '../../../../models/brewrun';
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

  brew: BrewRun;

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
    this.brew = new BrewRun();

    this.brewId = this.route.snapshot.paramMap.get('id');
    const userDetails = JSON.parse(sessionStorage.getItem('user'));
    this.tenantId = userDetails['CompanyDetails'].Id;
    this.currentUser = userDetails['UserProfile'].Id;
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
        this.brew = response['body'];
        this.recipeId = response['body'].RecipeId;
        this.getRecipeDetailsEdit();
        if (this.brew.ConditioningDetails.length == 0) {
          this.brew.ConditioningDetails.push(new ConditioningDetail());
          this.brew.ConditioningDetails[this.brew.ConditioningDetails.length - 1].TenantId = this.tenantId;

        } else {
          this.brew.ConditioningDetails.map((conTimes: ConditioningDetail) => {
            conTimes.StartTime = this.datePipe.transform(conTimes.StartTime, 'E, dd LLL yyyy HH:mm:ss');
            conTimes.EndTime = this.datePipe.transform(conTimes.EndTime, 'E, dd LLL yyyy HH:mm:ss');
          })
        }
        if (this.brew.FilterationDetails.length === 0) {
          this.brew.FilterationDetails.push(new FilterationDetail());
        }
        if (this.brew.CarbonationDetails.length == 0) {
          this.brew.CarbonationDetails.push(new CarbonationDetail());
          this.brew.CarbonationDetails[this.brew.CarbonationDetails.length - 1].TenantId = this.tenantId;

        } else {
          this.brew.CarbonationDetails.map((carTimes: CarbonationDetail) => {
            carTimes.StartTime = this.datePipe.transform(carTimes.StartTime, 'E, dd LLL yyyy HH:mm:ss');
            carTimes.EndTime = this.datePipe.transform(carTimes.EndTime, 'E, dd LLL yyyy HH:mm:ss');
          })
        }
        if (this.brew.ConditioningDetailsNotes.length == 0) {
          this.brew.ConditioningDetailsNotes.push(new ConditioningDetailsNote());
          this.brew.ConditioningDetailsNotes[this.brew.ConditioningDetailsNotes.length - 1].TenantId = this.tenantId;

        }
        this.checkIfComplete(this.brew);
      }
      this.conStartTime = this.datePipe.transform(this.brew.ConditioningDetails[0].StartTime, 'E, dd LLL yyyy HH:mm:ss');
      this.conEndTime = this.datePipe.transform(this.brew.ConditioningDetails[0].EndTime, 'E, dd LLL yyyy HH:mm:ss');
      this.carStartTime = this.datePipe.transform(this.brew.CarbonationDetails[0].StartTime, 'E, dd LLL yyyy HH:mm:ss');
      this.carEndTime = this.datePipe.transform(this.brew.CarbonationDetails[0].EndTime, 'E, dd LLL yyyy HH:mm:ss');

    });
  }

  findUnits() {
    this.units.forEach(element => {
      if (element.Id === this.preference.TemperatureId) {
        this.preferedUnit = element.Symbol;
      }
      if (element.Id === this.preference.GravityMeasurementId) {
        this.preferedPlato = element.Name;
        this.platoUnitId = element.Id;
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
      this.brew.Status = this.status.commited.id;
      this.committed = true;
      this.saveGo('app/dashboard');
    }
  }

  completeBrewRun() {
    this.brew.Status = this.status.Compleated.id;
    this.saveGo('app/dashboard/view-brew-run/' + this.brewId);
  }
  saveGo(url: string) {

    this.brew.ConditioningDetails.forEach((con: ConditioningDetail) => {
      con.TenantId = this.tenantId;
    });
    this.brew.CarbonationDetails.forEach((car: CarbonationDetail) => {
      car.TenantId = this.tenantId;
    });

    this.apiService.postData(this.apiService.addBrewRun, this.brew).subscribe(response => {
      if (response) {
        if (this.committed) {
          this.toast.success('The Brew Run' + '' + this.brew.BrewRunId + ' ' + 'Successfully Committed');
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
    start.StartTime = this.conStartTime;
  }

  setConEnd(i, end) {
    this.conEndTime = this.timezone(new Date().toUTCString());
    this.conEndTime = this.conEndTime.split(' ').slice(0, 5).join(' ');
    end.EndTime = this.conEndTime;
  }

  setCarbStart(i, start) {
    this.carStartTime = this.timezone(new Date().toUTCString());
    this.carStartTime = this.carStartTime.split(' ').slice(0, 5).join(' ');
    start.StartTime = this.carStartTime;
  }

  setCarbEnd(i, end) {
    this.carEndTime = this.timezone(new Date().toUTCString());
    this.carEndTime = this.carEndTime.split(' ').slice(0, 5).join(' ');
    end.EndTime = this.carEndTime;
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
    this.apiService.getDataList(this.apiService.getRecipebyId, null, null, this.tenantId, this.recipeId).subscribe(response => {
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
    this.brew.FilterationDetails[i].IsCompleted = true;
    this.setClass = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onCarbonationComplete(i, editedSectionName) {
    this.isCollapsedCarbonation = !this.isCollapsedCarbonation;
    this.brew.CarbonationDetails[i].IsCompleted = true;
    this.setClassCarb = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onConditioningComplete(i, editedSectionName) {
    this.isCollapsedConditioning = !this.isCollapsedConditioning;
    this.brew.ConditioningDetails[i].IsCompleted = true;
    this.setClassCond = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  checkIfComplete(brew: BrewRun) {
    if (brew.FilterationDetails.length !== 0) {
      brew.FilterationDetails.map(element => {
        if (element.IsCompleted === true) {
          this.isCollapsedFiltration = !this.isCollapsedFiltration;
          this.setClass = true;
        }
      });
    }

    if (brew.CarbonationDetails.length !== 0) {
      brew.CarbonationDetails.map(element => {
        if (element.IsCompleted === true) {
          this.isCollapsedCarbonation = !this.isCollapsedCarbonation;
          this.setClassCarb = true;
        }
      });
    }

    if (brew.ConditioningDetails.length !== 0) {
      brew.ConditioningDetails.map(element => {
        if (element.IsCompleted === true) {
          this.isCollapsedConditioning = !this.isCollapsedConditioning;
          this.setClassCond = true;
        }
      });
    }
  }

  addbrewUserAuditTrail(editedSectionName) {
    const params = {
      Id: this.brew.Id,
      BrewRunId: this.brew.BrewRunId,
      CreatedDate: this.brew.CreatedDate,
      CreatedByUserId: this.currentUser,
      TenantId: this.brew.TenantId,
      CurrentEditedSectionName: editedSectionName,
    };
    this.apiService.postData(this.apiService.addBrewUserAuditTrail, params).subscribe((response: any) => {
    }, error => {
      console.log(error);
    });
  }
}
