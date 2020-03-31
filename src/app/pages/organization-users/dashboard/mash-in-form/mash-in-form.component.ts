import { Component, OnInit, Input, ViewChild, ElementRef, ɵConsole } from '@angular/core';
import { DashboardService } from '../dashboard.service';

import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BrewRun, MaltGrainBillDetail, WaterAdditionDetail, MashingTargetDetail, StartchTest, MashinDetailsNote, MashingTargetDetailsTemperature, StarchTestResultList } from '../../../../models/brewrun';
import { NbToastrService } from '@nebular/theme';
import { FormBuilder } from '@angular/forms';
import { Guid } from 'guid-typescript';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { String } from 'typescript-string-operations';

@Component({
  selector: 'app-mash-in-form',
  templateUrl: './mash-in-form.component.html',
  styleUrls: ['./mash-in-form.component.scss'],
})
export class MashInFormComponent implements OnInit {
  @ViewChild('mashinStart', { static: false }) mashinStart: ElementRef;
  @ViewChild('mashinEnd', { static: false }) mashinEnd: ElementRef;
  isCollapsed = false;
  isCollapsedWater = false;
  isCollapsedMashing = false;
  isCollapsedStarch = false;
  isCollapsedNotes = false;
  @Input() fermentationId: Number;

  tenantId: any;
  brewId: any;

  brew: BrewRun;

  mashinStartTime: any = '';
  mashinEndTime: any = '';
  tempStartTime: any = '';
  countries: any;
  addins: any;
  suppliers: any;
  maltTypes: any;
  styles: any;
  units: any;
  preference: any;
  preferedUnit: any;
  maltNames: any;
  recipeId: any;
  getaddInData: any;
  recipeContent: any;
  maltTarget: any;
  waterTarget: any;
  mashinTarget = [];
  starchTarget: any;
  modalForms = this.formBuilder.group({
    styleText: [''],
    typeText: [''],
    supplierText: [''],
  });
  setClass = false;
  setClassWater = false;
  setClassMashin = false;
  setClassStarch = false;
  status: string;
  statusDate;
  starchStatus = [];
  currentUser: any;

  constructor(
    private dataService: DashboardService,
    private apiService: ApiProviderService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: NbToastrService,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
  ) { }

  ngOnInit() {
    this.brew = new BrewRun();


    this.brewId = this.route.snapshot.paramMap.get('id');
    const userDetails = JSON.parse(sessionStorage.getItem('user'));
    this.currentUser = userDetails['UserProfile'].Id;
    this.tenantId = userDetails['CompanyDetails'].Id;

    this.units = JSON.parse(sessionStorage.getItem('units'));

    this.getPreferenceUsed();
    if (!sessionStorage.styles || !sessionStorage.addins ||
      !sessionStorage.suppliers || !sessionStorage.maltTypes || !sessionStorage.maltNames ||
      !sessionStorage.countries) {
      this.getCountries();
      this.getAddIns();
      this.getMaltTypes();
      this.getStyles();
      this.getSuppliers();
      this.getMaltName();
    } else {
      this.styles = JSON.parse(sessionStorage.styles);
      this.addins = JSON.parse(sessionStorage.addins);
      this.countries = JSON.parse(sessionStorage.countries);
      this.maltTypes = JSON.parse(sessionStorage.maltTypes);
      this.suppliers = JSON.parse(sessionStorage.suppliers);
      this.maltNames = JSON.parse(sessionStorage.maltNames);

    }

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
        this.brew = response['body'];
        this.recipeId = response['body'].RecipeId;
        this.getRecipeDetailsEdit();
        if (this.brew.MaltGrainBillDetails.length == 0) {
          this.brew.MaltGrainBillDetails.push(new MaltGrainBillDetail());
        }
        if (this.brew.WaterAdditionDetails.length == 0) {
          this.brew.WaterAdditionDetails.push(new WaterAdditionDetail());
        }
        if (this.brew.MashingTargetDetails.length == 0) {
          this.brew.MashingTargetDetails.push(new MashingTargetDetail());
        }
        this.brew.MashingTargetDetails.forEach((mash: MashingTargetDetail) => {
          if (!mash.MashingTargetDetailsTemperature) {
            mash.MashingTargetDetailsTemperature = [];
            mash.MashingTargetDetailsTemperature.push(new MashingTargetDetailsTemperature());
          } else {
            mash.MashingTargetDetailsTemperature.map((tempStartTimes: MashingTargetDetailsTemperature) => {
              tempStartTimes.StartTime = this.datePipe.transform(tempStartTimes.StartTime, 'E, dd LLL yyyy HH:mm:ss');
            }

            )
          }
        });


        if (this.brew.StartchTest.length == 0) {
          this.brew.StartchTest.push(new StartchTest());
        } else {
          if (this.brew.StartchTest[0].PassStatus) {
            this.status = 'Pass';
          }
        }
        if (this.brew.MashinDetailsNotes.length == 0) {
          this.brew.MashinDetailsNotes.push(new MashinDetailsNote());
        }
        this.checkIfComplete(this.brew);
      }
      this.mashinStartTime = this.datePipe.transform(this.brew.MashingTargetDetails[0].StartTime, 'E, dd LLL yyyy HH:mm:ss');
      this.mashinEndTime = this.datePipe.transform(this.brew.MashingTargetDetails[0].EndTime, 'E, dd LLL yyyy HH:mm:ss');
    });

  }


  getCountries() {
    this.apiService.getDataList(this.apiService.getAllActiveCountry).subscribe(response => {
      if (response) {
        this.countries = response['body'].countrybase;
        sessionStorage.setItem('countries', JSON.stringify(this.countries));
      }
    });
  }

  getAddIns() {
    const getAllActiveAddInAPI = String.Format(this.apiService.getAllActiveAddIn, this.tenantId);
    this.apiService.getDataList(getAllActiveAddInAPI).subscribe(response => {
      if (response) {
        this.addins = response['body'].addinBase;
        sessionStorage.setItem('addins', JSON.stringify(this.addins));

      }
    });
  }

  getSuppliers() {
    const getAllActiveSupplierAPI = String.Format(this.apiService.getAllActiveSupplier, this.tenantId);
    this.apiService.getDataList(getAllActiveSupplierAPI).subscribe(response => {
      if (response) {
        this.suppliers = response['body'].supplierBase;
        sessionStorage.setItem('suppliers', JSON.stringify(this.suppliers));

      }
    });
  }

  getMaltTypes() {
    const getAllActiveMaltGrainTypeAPI = String.Format(this.apiService.getAllActiveMaltGrainType, this.tenantId);
    this.apiService.getDataList(getAllActiveMaltGrainTypeAPI).subscribe(response => {
      if (response) {
        this.maltTypes = response['body'];
        sessionStorage.setItem('maltTypes', JSON.stringify(this.maltTypes));

      }
    });
  }
  getMaltName() {
    this.apiService.getData(this.apiService.getAllMaltGrainName, '', '', this.tenantId).subscribe(response => {
      if (response) {
        this.maltNames = response['body'];
        sessionStorage.setItem('maltNames', JSON.stringify(this.maltNames));

      }
    });
  }
  getStyles() {
    const getAllActiveStyleAPI = String.Format(this.apiService.getAllActiveStyle, this.tenantId);
    this.apiService.getData(getAllActiveStyleAPI).subscribe(response => {
      if (response) {
        this.styles = response['body'].style;
        sessionStorage.setItem('styles', JSON.stringify(this.styles));

      }
    });
  }

  findUnits() {
    this.units.forEach(element => {
      if (element.Id === this.preference.TemperatureId) {
        this.preferedUnit = element.Symbol;
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

  addMashingTemp(mash: MashingTargetDetail) {
    mash.MashingTargetDetailsTemperature.push(new MashingTargetDetailsTemperature());
  }

  removeMashingTemp(mash: MashingTargetDetail, pos: number) {
    mash.MashingTargetDetailsTemperature.splice(pos, 1);
  }

  changeTemperatureType(mash: MashingTargetDetail, pos: number) {
    if (pos == 0) {
      mash.MashingTargetDetailsTemperature = [];
      mash.MashingTargetDetailsTemperature.push(new MashingTargetDetailsTemperature());
      mash.Temperature = false;
    } else {
      mash.Temperature = true;
    }
  }

  activeBrewClick() {
    this.dataService.changeMessage('Hello from sibling');
  }

  mashInFormClick() {
    this.saveGo('app/dashboard/brew-log-form/' + this.brewId);
  }

  onCancelClick() {
    this.router.navigate(['app/dashboard']);
  }

  brewLogClick() {
    this.saveGo('app/dashboard/brew-log-form/' + this.brewId);
  }
  mashInClick() {
    this.router.navigate(['app/dashboard/mash-in-form/' + this.brewId])
  }

  fermentationClick() {
    this.saveGo('app/dashboard/fermentation-form/' + this.brewId);
  }

  conditioningClick() {
    this.saveGo('app/dashboard/condition-form/' + this.brewId);
  }

  saveGo(url: string) {
    if (this.status === 'Pass') {
      this.brew.WaterAdditionDetails.forEach((wateraddition: WaterAdditionDetail) => {
        wateraddition.TenantId = this.tenantId;
      });
      this.brew.MaltGrainBillDetails.forEach((mash: MaltGrainBillDetail) => {
        mash.BrewId = this.brewId;
        mash.RecipeId = this.recipeId;
        mash.TenantId = this.tenantId;
      });

      this.brew.MashingTargetDetails.forEach((mash: MashingTargetDetail) => {
        mash.BrewId = this.brewId;
        mash.RecipeId = this.recipeId;
        mash.TenantId = this.tenantId;
        mash.StartTime = this.mashinStartTime;
        mash.EndTime = this.mashinEndTime;
        mash.MashingTargetDetailsTemperature.forEach((mtdt: MashingTargetDetailsTemperature) => {
          mtdt.TenantId = this.tenantId;
        });
      });
      this.apiService.postData(this.apiService.addBrewRun, this.brew).subscribe(response => {
        if (response) {
          this.router.navigate([url]);
        }
      }, error => {
        this.toast.danger(error.error.Message);
      });
    } else {
      document.getElementById('openModalButton').click();
    }
  }

  setStartTime(): any {
    var startTime = this.timezone(new Date().toUTCString());
    this.mashinStartTime = startTime.split(' ').slice(0, 5).join(' ');
    this.mashinStartTime = moment(this.mashinStartTime).format('MMMM Do YYYY, h:mm:ss a');
    document.getElementById('mashinStart').setAttribute('value', this.mashinStartTime);
    document.getElementById('mashinStartTime').setAttribute('value', this.mashinStartTime);

  }

  setEndTime(): any {
    var endTime = this.timezone(new Date().toUTCString());
    this.mashinEndTime = endTime.split(' ').slice(0, 5).join(' ');
    this.mashinEndTime = moment(this.mashinEndTime).format('MMMM Do YYYY, h:mm:ss a');
    document.getElementById('mashinEnd').setAttribute('value', this.mashinEndTime);
    document.getElementById('mashinStartTime').setAttribute('value', this.mashinEndTime);

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


  setTempStartTime(i, start) {
    this.tempStartTime = this.timezone(new Date().toUTCString());
    this.tempStartTime = this.tempStartTime.split(' ').slice(0, 5).join(' ');

    document.getElementById(`tempStart${i}`).setAttribute('value', this.tempStartTime);
    start.StartTime = this.tempStartTime;
    console.log('start.StartTime', start.StartTime);

  }

  getRecipeDetailsEdit() {
    this.apiService.getDataList(this.apiService.getRecipebyId, null, null, this.tenantId, this.recipeId).subscribe(response => {
      if (response && response['body']) {
        this.recipeContent = response['body'];
        this.getMaltTargets(this.recipeContent);
        this.getWaterTargets(this.recipeContent);
        this.getMashinTargets(this.recipeContent);
        this.getStarchTargets(this.recipeContent);

      }
    });
  }

  getMaltTargets(recipe) {
    this.maltTarget = recipe.MaltGrainBill;
  }

  getWaterTargets(recipe) {
    this.waterTarget = recipe.WaterAdditions;
  }

  getMashinTargets(recipe) {
    this.mashinTarget.push(recipe.MashingTargets);
  }

  getStarchTargets(recipe) {
    this.starchTarget = recipe;
  }

  addNewSupplier() {
    const params = {
      Id: Guid.raw(),
      Name: this.modalForms.get('supplierText').value,
      IsActive: true,
      CreatedDate: '2019-12-16T06:55:05.243',
      ModifiedDate: '2019-12-16T06:55:05.243',
      TenantId: this.tenantId,
    };
    if (this.modalForms.get('supplierText').value) {
      this.apiService.postData(this.apiService.addSupplier, params).subscribe((response: any) => {
        if (response) {
          this.getSuppliers();
          this.modalForms.reset();
        }
      }, error => {
        this.toast.danger(error.error.Message);
      });
    }
  }

  addNewStyle() {
    const params = {
      Id: Guid.raw(),
      StyleName: this.modalForms.get('styleText').value,
      IsActive: true,
      CreatedDate: '2019-12-16T06:55:05.243',
      ModifiedDate: '2019-12-16T06:55:05.243',
      TenantId: this.tenantId,
    };
    if (this.modalForms.get('styleText').value) {
      this.apiService.postData(this.apiService.addStyle, params).subscribe((response: any) => {
        if (response) {
          this.getStyles();
          this.modalForms.reset();
        }
      }, error => {
        this.toast.danger(error.error.Message);
      });
    }
  }

  addNewType() {
    const params = {
      Id: Guid.raw(),
      TypeName: this.modalForms.get('typeText').value,
      IsActive: true,
      CreatedDate: '2019-12-16T06:55:05.243',
      ModifiedDate: '2019-12-16T06:55:05.243',
      TenantId: this.tenantId,
    };
    if (this.modalForms.get('typeText').value) {
      this.apiService.postData(this.apiService.addType, params).subscribe((response: any) => {
        if (response) {
          this.getMaltTypes();
          this.modalForms.reset();
        }
      }, error => {
        this.toast.danger(error.error.Message);
      });
    }
  }

  onMaltComplete(editedSectionName) {
    this.isCollapsed = !this.isCollapsed;
    this.brew.MaltGrainBillDetails[0].IsCompleted = true;
    this.setClass = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onWaterComplete(editedSectionName) {
    this.isCollapsedWater = !this.isCollapsedWater;
    this.brew.WaterAdditionDetails[0].IsCompleted = true;
    this.setClassWater = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onMashinComplete(i, editedSectionName) {
    this.isCollapsedMashing = !this.isCollapsedMashing;
    this.brew.MashingTargetDetails[i].IsCompleted = true;
    this.setClassMashin = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onStarchComplete(i, editedSectionName) {
    this.isCollapsedStarch = !this.isCollapsedStarch;
    this.brew.StartchTest[i].IsCompleted = true;
    this.setClassStarch = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  checkIfComplete(brew: BrewRun) {
    if (brew.MaltGrainBillDetails.length !== 0) {
      brew.MaltGrainBillDetails.map(element => {
        if (element.IsCompleted === true) {
          this.isCollapsed = !this.isCollapsed;
          this.setClass = true;
        }
      });
    }

    if (brew.WaterAdditionDetails.length !== 0) {
      brew.WaterAdditionDetails.map(element => {
        if (element.IsCompleted === true) {
          this.isCollapsedWater = !this.isCollapsedWater;
          this.setClassWater = true;
        }
      });
    }

    if (brew.MashingTargetDetails.length !== 0) {
      brew.MashingTargetDetails.map(element => {
        if (element.IsCompleted === true) {
          this.isCollapsedMashing = !this.isCollapsedMashing;
          this.setClassMashin = true;
        }
      });
    }

    if (brew.StartchTest.length !== 0) {
      brew.StartchTest.map(element => {
        if (element.IsCompleted === true) {
          this.isCollapsedStarch = !this.isCollapsedStarch;
          this.setClassStarch = true;
        }
      });
    }
  }

  radioChange(status) {
    this.statusDate = new Date();
    if (status === 'Pass') {
      this.status = 'Pass';
    } else {
      this.status = 'Fail';
    }
    let dateTime = this.timezone(new Date(this.statusDate).toUTCString());
    dateTime = dateTime.split(' ').slice(0, 5).join(' ');
    this.statusDate = new Date(dateTime).toLocaleString();
    const statusData = new StarchTestResultList();
    statusData.StarchTestId = this.brew.StartchTest[0].Id;
    statusData.TestName = 'Test ';
    statusData.TestResult = this.status;
    statusData.TimeStamp = this.statusDate;
    this.brew.StartchTest[0].StarchTestResultList.push(statusData);
  }

  get sortData() {
    if (this.brew.StartchTest[0].StarchTestResultList != null) {
      return this.brew.StartchTest[0].StarchTestResultList.sort((a, b) => {
        return <any>new Date(a.TimeStamp) - <any>new Date(b.TimeStamp);
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
