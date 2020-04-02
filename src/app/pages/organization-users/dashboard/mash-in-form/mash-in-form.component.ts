import { Component, OnInit, Input, ViewChild, ElementRef, ɵConsole } from '@angular/core';
import { DashboardService } from '../dashboard.service';

import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BrewRunMashin,BrewRun, MaltGrainBillDetail, WaterAdditionDetail, MashingTargetDetail, StartchTest, MashinDetailsNote, MashingTargetDetailsTemperature, StarchTestResultList } from '../../../../models/brewrun';
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

  brewRunMashin: BrewRunMashin;

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
    this.brewRunMashin = new BrewRunMashin();


    this.brewId = this.route.snapshot.paramMap.get('id');
    const userDetails = JSON.parse(sessionStorage.getItem('user'));
    
    this.tenantId = userDetails["userDetails"]["tenantId"];
    this.currentUser = userDetails["userDetails"]["userId"];

    this.units = JSON.parse(sessionStorage.getItem('units'));
    this.getMashinMasterDetails();
    this.getMashinDetails(this.tenantId , this.brewId);
  }

  getMashinMasterDetails()
  {
    const getMashinMasterDetailsAPI = String.Format(this.apiService.getBrewRunMashinMasterDetails, this.tenantId);
    this.apiService.getDataList(getMashinMasterDetailsAPI).subscribe(response => {
      if (response) {
        this.countries = response['body']['mashinMasterDetails']['countries'];
        this.addins = response['body']['mashinMasterDetails']['addIns'];
        this.suppliers = response['body']['mashinMasterDetails']['suppliers'];
        this.maltTypes = response['body']['mashinMasterDetails']['maltGrainTypes'];
        this.maltNames = response['body']['mashinMasterDetails']['maltGrainBills'];
        this.styles = response['body']['mashinMasterDetails']['style'];
        
        
      }
    });
  }

  /**
   * Function to get single brew
   * @param tenantId
   * @param brewId
   */

  getMashinDetails(tenantId, brewId) {
    const getBrewRunMashinDetailsAPI = String.Format(this.apiService.getBrewRunMashinDetails, tenantId,brewId);
      this.apiService.getDataByQueryParams(getBrewRunMashinDetailsAPI, null, tenantId, brewId).subscribe(response => {
      if (response.status === 200) {
        this.brewRunMashin = response['body']['brewRunMashin'];
        if (this.brewRunMashin.maltGrainBillDetails.length == 0) {
          this.brewRunMashin.maltGrainBillDetails.push(new MaltGrainBillDetail());
        }
        if (this.brewRunMashin.waterAdditionDetails.length == 0) {
          this.brewRunMashin.waterAdditionDetails.push(new WaterAdditionDetail());
        }
        if (this.brewRunMashin.mashingTargetDetails.length == 0) {
          this.brewRunMashin.mashingTargetDetails.push(new MashingTargetDetail());
        }
        this.brewRunMashin.mashingTargetDetails.forEach((mash: MashingTargetDetail) => {
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


        if (this.brewRunMashin.startchTest.length == 0) {
          this.brewRunMashin.startchTest.push(new StartchTest());
        } else {
          if (this.brewRunMashin.startchTest[0].PassStatus) {
            this.status = 'Pass';
          }
        }
        if (this.brewRunMashin.mashinDetailsNotes.length == 0) {
          this.brewRunMashin.mashinDetailsNotes.push(new MashinDetailsNote());
        }
        this.checkIfComplete(this.brewRunMashin);
      }
      this.mashinStartTime = this.datePipe.transform(this.brewRunMashin.mashingTargetDetails[0].StartTime, 'E, dd LLL yyyy HH:mm:ss');
      this.mashinEndTime = this.datePipe.transform(this.brewRunMashin.mashingTargetDetails[0].EndTime, 'E, dd LLL yyyy HH:mm:ss');
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
      this.brewRunMashin.waterAdditionDetails.forEach((wateraddition: WaterAdditionDetail) => {
        wateraddition.TenantId = this.tenantId;
      });
      this.brewRunMashin.maltGrainBillDetails.forEach((mash: MaltGrainBillDetail) => {
        mash.BrewId = this.brewId;
        mash.RecipeId = this.recipeId;
        mash.TenantId = this.tenantId;
      });

      this.brewRunMashin.mashingTargetDetails.forEach((mash: MashingTargetDetail) => {
        mash.BrewId = this.brewId;
        mash.RecipeId = this.recipeId;
        mash.TenantId = this.tenantId;
        mash.StartTime = this.mashinStartTime;
        mash.EndTime = this.mashinEndTime;
        mash.MashingTargetDetailsTemperature.forEach((mtdt: MashingTargetDetailsTemperature) => {
          mtdt.TenantId = this.tenantId;
        });
      });
      this.apiService.postData(this.apiService.addBrewRun, this.brewRunMashin).subscribe(response => {
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
    const getRecipebyIdAPI = String.Format(this.apiService.getRecipebyId, this.tenantId, this.recipeId);
    this.apiService.getDataList(getRecipebyIdAPI).subscribe(response => {
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
            this.modalForms.reset();
        }
      }, error => {
        this.toast.danger(error.error.Message);
      });
    }
  }

  onMaltComplete(editedSectionName) {
    this.isCollapsed = !this.isCollapsed;
    this.brewRunMashin.maltGrainBillDetails[0].IsCompleted = true;
    this.setClass = true;
    
  }

  onWaterComplete(editedSectionName) {
    this.isCollapsedWater = !this.isCollapsedWater;
    this.brewRunMashin.waterAdditionDetails[0].IsCompleted = true;
    this.setClassWater = true;
    
  }

  onMashinComplete(i, editedSectionName) {
    this.isCollapsedMashing = !this.isCollapsedMashing;
    this.brewRunMashin.mashingTargetDetails[i].IsCompleted = true;
    this.setClassMashin = true;
   
  }

  onStarchComplete(i, editedSectionName) {
    this.isCollapsedStarch = !this.isCollapsedStarch;
    this.brewRunMashin.startchTest[i].IsCompleted = true;
    this.setClassStarch = true;
    
  }

  checkIfComplete(brewRunMashin: BrewRunMashin) {
    if (brewRunMashin.maltGrainBillDetails.length !== 0) {
      brewRunMashin.maltGrainBillDetails.map(element => {
        if (element.IsCompleted === true) {
          this.isCollapsed = !this.isCollapsed;
          this.setClass = true;
        }
      });
    }

    if (brewRunMashin.waterAdditionDetails.length !== 0) {
      brewRunMashin.waterAdditionDetails.map(element => {
        if (element.IsCompleted === true) {
          this.isCollapsedWater = !this.isCollapsedWater;
          this.setClassWater = true;
        }
      });
    }

    if (brewRunMashin.mashingTargetDetails.length !== 0) {
      brewRunMashin.mashingTargetDetails.map(element => {
        if (element.IsCompleted === true) {
          this.isCollapsedMashing = !this.isCollapsedMashing;
          this.setClassMashin = true;
        }
      });
    }

    if (brewRunMashin.startchTest.length !== 0) {
      brewRunMashin.startchTest.map(element => {
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
    statusData.StarchTestId = this.brewRunMashin.startchTest[0].Id;
    statusData.TestName = 'Test ';
    statusData.TestResult = this.status;
    statusData.TimeStamp = this.statusDate;
    this.brewRunMashin.startchTest[0].StarchTestResultList.push(statusData);
  }

  get sortData() {
    if (this.brewRunMashin.startchTest[0].StarchTestResultList != null) {
      return this.brewRunMashin.startchTest[0].StarchTestResultList.sort((a, b) => {
        return <any>new Date(a.TimeStamp) - <any>new Date(b.TimeStamp);
      });
    }
  }
  
}
