import { Component, OnInit, Input, ViewChild, ElementRef, ɵConsole } from '@angular/core';
import { DashboardService } from '../dashboard.service';

import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { Router, ActivatedRoute } from '@angular/router';
import { BrewRunMashin, BrewRun, MaltGrainBillDetail, WaterAdditionDetail, MashingTargetDetail, StartchTest, MashinDetailsNote, MashingTargetDetailsTemperature, StarchTestResultList } from '../../../../models/brewrun';
import { NbToastrService } from '@nebular/theme';
import { FormBuilder } from '@angular/forms';
import { Guid } from 'guid-typescript';
import { DatePipe } from '@angular/common';
import * as moment from 'moment';
import { String } from 'typescript-string-operations';
import { Observable,of as observableOf } from 'rxjs';

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
  brewerName: any;
  mashinAvailable: boolean

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
    this.brewerName = userDetails["userDetails"]["firstName"] + ' ' + userDetails["userDetails"]["lastName"];

    this.getPreferenceUsed();
    this.getMashinMasterDetails();

    this.getMashinDetails(this.tenantId, this.brewId);

  }

  getMashinMasterDetails() {
    const getMashinMasterDetailsAPI = String.Format(this.apiService.getBrewRunMashinMasterDetails, this.tenantId);
    this.apiService.getDataList(getMashinMasterDetailsAPI).subscribe(response => {
      if (response) {
        this.countries = response['body']['mashinMasterDetails']['countries'];
        this.addins = response['body']['mashinMasterDetails']['addIns'];
        this.suppliers = response['body']['mashinMasterDetails']['suppliers'];
        this.maltTypes = response['body']['mashinMasterDetails']['maltGrainTypes'];
        this.maltNames = response['body']['mashinMasterDetails']['maltGrainBills'];
        this.styles = response['body']['mashinMasterDetails']['styles'];
        this.units = response['body']['mashinMasterDetails']['units']
        this.findUnits();

      }
    });
  }

  /**
   * Function to get single brew
   * @param tenantId
   * @param brewId
   */

  getMashinDetails(tenantId, brewId) {
    const getBrewRunMashinDetailsAPI = String.Format(this.apiService.getBrewRunMashinDetails, tenantId, brewId);
    this.apiService.getDataByQueryParams(getBrewRunMashinDetailsAPI, null, tenantId, brewId).subscribe(response => {
      if (response.status === 200) {
        this.brewRunMashin = response['body']['brewRunMashin'];
        this.maltTarget = response['body']['recipe']['maltGrainBills'];
        this.waterTarget = response['body']['recipe']['waterAdditions'];
        this.mashinTarget.push(response['body']['recipe']['mashingTargets']);
        this.starchTarget = response['body']['recipe'];
        this.mashinAvailable = response['body']['mashinAvailable'];

        if (this.brewRunMashin.maltGrainBillDetails.length == 0) {
          this.brewRunMashin.maltGrainBillDetails.push(new MaltGrainBillDetail());
        }
        if (this.brewRunMashin.waterAdditionDetails.length == 0) {
          this.brewRunMashin.waterAdditionDetails.push(new WaterAdditionDetail());
        }
        if (this.brewRunMashin.mashingTargetDetails.length == 0) {
          this.brewRunMashin.mashingTargetDetails.push(new MashingTargetDetail());
        }
        this.brewRunMashin.mashingTargetDetails.forEach((mash: any) => {
          if (!mash.mashingTargetDetailsTemperature) {
            mash.mashingTargetDetailsTemperature = [];
            mash.mashingTargetDetailsTemperature.push(new MashingTargetDetailsTemperature());
          } else {
            mash.mashingTargetDetailsTemperature.map((tempStartTimes: any) => {
              tempStartTimes.startTime = this.datePipe.transform(tempStartTimes.startTime, 'E, dd LLL yyyy HH:mm:ss');
            }

            )
          }
        });


        if (this.brewRunMashin.startchTest.length == 0) {
          this.brewRunMashin.startchTest.push(new StartchTest());
        } else {
          for(let startchTest of this.brewRunMashin.startchTest[0].starchTestResultList)
          {
              if (startchTest.testResult === 'Pass') {
                this.status = 'Pass';
              }
          }
          
        }

        if (this.brewRunMashin.mashinDetailsNotes.length == 0) {
          this.brewRunMashin.mashinDetailsNotes.push(new MashinDetailsNote());
        }
        this.checkIfComplete(this.brewRunMashin);
      }
      this.mashinStartTime = this.datePipe.transform(this.brewRunMashin.mashingTargetDetails[0].startTime, 'E, dd LLL yyyy HH:mm:ss');
      this.mashinEndTime = this.datePipe.transform(this.brewRunMashin.mashingTargetDetails[0].endTime, 'E, dd LLL yyyy HH:mm:ss');
    });

  }

  findUnits() {
    this.units.forEach(element => {
      if (element.id === this.preference.temperatureId) {
        this.preferedUnit = element.symbol;
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
      console.error(error);
    });
  }

  addMashingTemp(mash: MashingTargetDetail) {
    mash.mashingTargetDetailsTemperature.push(new MashingTargetDetailsTemperature());
  }

  removeMashingTemp(mash: MashingTargetDetail, pos: number) {
    mash.mashingTargetDetailsTemperature.splice(pos, 1);
  }

  changeTemperatureType(mash: MashingTargetDetail, pos: number) {
    if (pos == 0) {
      mash.mashingTargetDetailsTemperature = [];
      mash.mashingTargetDetailsTemperature.push(new MashingTargetDetailsTemperature());
      mash.temperature = false;
    } else {
      mash.temperature = true;
    }
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
      this.brewRunMashin.mashingTargetDetails.forEach((mash: any) => {
        mash.startTime = this.mashinStartTime;
        mash.endTime = this.mashinEndTime;

      });
      
      this.saveData().subscribe(response => {
        this.router.navigate([url])
      }, error => {
        this.toast.danger(error.error.message);
      });
    } else {
      document.getElementById('openModalButton').click();
    }
  }



  setStartTime(): any {
    var startTime = this.timezone(new Date().toUTCString());
    this.mashinStartTime = moment(startTime).toDate();
    this.mashinStartTime = moment(this.mashinStartTime).format('MMMM Do YYYY, h:mm:ss a');
    document.getElementById('mashinStart').setAttribute('value', this.mashinStartTime);
    document.getElementById('mashinStartTime').setAttribute('value', this.mashinStartTime);
  }

  setEndTime(): any {
    var endTime = this.timezone(new Date().toUTCString());
    this.mashinEndTime = moment(endTime).toDate();
    this.mashinEndTime = moment(this.mashinEndTime).format('MMMM Do YYYY, h:mm:ss a');
    document.getElementById('mashinEnd').setAttribute('value', this.mashinEndTime);
    document.getElementById('mashinEndTime').setAttribute('value', this.mashinEndTime);
  }



  timezone(dateTime) {
    // Timezone convertion
    const preferedZone = this.preference.baseUtcOffset;
    if (preferedZone !== undefined && preferedZone !== null) {
      let zone = preferedZone.replace(/:/gi, '');
      zone = zone.slice(0, -2);
      if (zone.includes('-')) {
        zone = zone.replace(/-/gi, '+');
      } else if (zone.includes('+')) {
        zone = zone.replace(/\+/gi, '-');
      }
      const newDateTime = dateTime + ' ' + `${zone}`;
      return new Date(newDateTime).toISOString();
    }
  }

  setTempStartTime(i, start) {
    this.tempStartTime = this.timezone(new Date().toUTCString());
    this.tempStartTime = moment(this.tempStartTime).toDate();
    this.tempStartTime = moment(this.tempStartTime).format('MMMM Do YYYY, h:mm:ss a');
    let elementId = 'tempStart'+i;
    document.getElementById(elementId).setAttribute('value', this.tempStartTime);
    start.startTime = this.tempStartTime;
  }

  addNewSupplier() {
    const params = {
      id: Guid.raw(),
      name: this.modalForms.get('supplierText').value,
      isActive: true,
      createdDate: '2019-12-16T06:55:05.243',
      modifiedDate: '2019-12-16T06:55:05.243',
      tenantId: this.tenantId
    };
    if (this.modalForms.get('supplierText').value) {
      const addStyleAPI = String.Format(this.apiService.addSupplier, this.tenantId);
      this.apiService.postData(addStyleAPI, params).subscribe((response: any) => {
        if (response) {
          this.suppliers = response.body.suppliers;
          this.modalForms.reset();
        }
      });
    }
  }

  addNewStyle() {
    const params = {
      id: Guid.raw(),
      name: this.modalForms.get('styleText').value,
      isActive: true,
      createdDate: '2019-12-16T06:55:05.243',
      modifiedDate: '2019-12-16T06:55:05.243',
      tenantId: this.tenantId
    };
    if (this.modalForms.get('styleText').value) {
      const addStyleAPI = String.Format(this.apiService.addStyle, this.tenantId);
      this.apiService.postData(addStyleAPI, params).subscribe((response: any) => {
        if (response) {
          this.styles = response.body.styles;
          this.modalForms.reset();
        }
      });
    }
  }




  addNewType() {
    const params = {
      id: Guid.raw(),
      name: this.modalForms.get('typeText').value,
      isActive: true,
      createdDate: '2019-12-16T06:55:05.243',
      modifiedDate: '2019-12-16T06:55:05.243',
      tenantId: this.tenantId
    };
    if (this.modalForms.get('typeText').value) {
      const addTypeAPI = String.Format(this.apiService.addType, this.tenantId);
      this.apiService.postData(addTypeAPI, params).subscribe((response: any) => {
        if (response) {
          this.maltTypes = response.body.maltTypes;
          this.modalForms.reset();
        }
      });
    }
  }

  getMaltTypeName(maltTypeId) {
    let maltTypeName = '';
    for (var maltType of this.maltTypes) {
      if (maltType.id === maltTypeId) {
        maltTypeName = maltType.name;
        break;
      }
    }
    return maltTypeName;
  }

  getCountryName(countryId) {
    let countryName = '';
    for (var country of this.countries) {
      if (country.id === countryId) {
        countryName = country.countryName;
        break;
      }
    }
    return countryName;
  }


  getSupplierName(supplierId) {
    let supplierName = '';
    for (var supplier of this.suppliers) {
      if (supplier.id === supplierId) {
        supplierName = supplier.name;
        break;
      }
    }
    return supplierName;
  }

  getUnitName(unitId) {
    let unitName = '';
    for (var unit of this.units) {
      if (unit.id === unitId) {
        unitName = unit.name;
        break;
      }
    }
    return unitName;
  }

  onMaltComplete(editedSectionName) {
    this.isCollapsed = !this.isCollapsed;
    this.brewRunMashin.maltGrainBillDetails.forEach(maltGrainBillDetail => {
      maltGrainBillDetail.isCompleted = true;
      maltGrainBillDetail.maltGrainType = this.getMaltTypeName(maltGrainBillDetail.maltGrainTypeId);
      maltGrainBillDetail.country = this.getCountryName(maltGrainBillDetail.countryId);
      maltGrainBillDetail.supplier = this.getSupplierName(maltGrainBillDetail.supplierId);
      maltGrainBillDetail.quantityUnit = this.getUnitName(maltGrainBillDetail.quantityUnitId)
      maltGrainBillDetail.completedUserId = this.currentUser;
      maltGrainBillDetail.completedUserName = this.brewerName;
    });
    this.saveData().subscribe(response => {
      this.setClass = true;
      }, error => {
        this.setClass = false;
        this.toast.danger(error.error.message);
    });
  }


  onWaterComplete(editedSectionName) {
    this.isCollapsedWater = !this.isCollapsedWater;
    this.brewRunMashin.waterAdditionDetails.forEach(waterAdditionDetail => {
      waterAdditionDetail.isCompleted = true;
      waterAdditionDetail.completedUserId = this.currentUser;
      waterAdditionDetail.completedUserName = this.brewerName;
      waterAdditionDetail.cacl2unit = this.getUnitName(waterAdditionDetail.cacl2unitId);
      waterAdditionDetail.gypsumUnit = this.getUnitName(waterAdditionDetail.gypsumUnitId);
      waterAdditionDetail.tableSaltUnit = this.getUnitName(waterAdditionDetail.tableSaltUnitId);
      waterAdditionDetail.epsomSaltUnit = this.getUnitName(waterAdditionDetail.epsomSaltUnitId);
      waterAdditionDetail.caCo3unit = this.getUnitName(waterAdditionDetail.caCo3unitId);
      waterAdditionDetail.bakingSodaUnit = this.getUnitName(waterAdditionDetail.bakingSodaUnitId);
      waterAdditionDetail.h3po4unit = this.getUnitName(waterAdditionDetail.h3po4unitId);

    });
    this.saveData().subscribe(response => {
      this.setClassWater = true;
      }, error => {
        this.setClassWater = false;
        this.toast.danger(error.error.message);
    });

  }

  onMashinComplete(i, editedSectionName) {
    this.isCollapsedMashing = !this.isCollapsedMashing;
    this.brewRunMashin.mashingTargetDetails.forEach(mashingTargetDetail => {
      mashingTargetDetail.isCompleted = true;
      mashingTargetDetail.completedUserId = this.currentUser;
      mashingTargetDetail.completedUserName = this.brewerName;
      mashingTargetDetail.strikeWaterUnitType = this.getUnitName(mashingTargetDetail.strikeWaterTemperatureUnitTypeId);
      mashingTargetDetail.strikeWaterTemperatureUnitType = this.getUnitName(mashingTargetDetail.strikeWaterTemperatureUnitTypeId);
      if (mashingTargetDetail.mashingTargetDetailsTemperature !== null) {
        mashingTargetDetail.mashingTargetDetailsTemperature.forEach(temperature => {
          temperature.temperatureUnitType = this.getUnitName(temperature.temperatureUnitTypeId)
        });
      }
    });
    this.saveData().subscribe(response => {
      this.setClassMashin = true;
      }, error => {
        this.setClassMashin = false;
        this.toast.danger(error.error.message);
    });


  }

  onStarchComplete(i, editedSectionName) {
    this.isCollapsedStarch = !this.isCollapsedStarch;
    this.brewRunMashin.startchTest.forEach(test => {
      test.isCompleted = true;
      test.completedUserId = this.currentUser;
      test.completedUserName = this.brewerName;
    });
    this.saveData().subscribe(response => {
      this.setClassStarch = true;
      }, error => {
        this.setClassStarch = false;
        this.toast.danger(error.error.message);
    });

  }

  checkIfComplete(brewRunMashin: BrewRunMashin) {
    if (brewRunMashin.maltGrainBillDetails.length !== 0) {
      brewRunMashin.maltGrainBillDetails.map(element => {
        if (element.isCompleted === true) {
          this.isCollapsed = !this.isCollapsed;
          this.setClass = true;
        }
      });
    }

    if (brewRunMashin.waterAdditionDetails.length !== 0) {
      brewRunMashin.waterAdditionDetails.map(element => {
        if (element.isCompleted === true) {
          this.isCollapsedWater = !this.isCollapsedWater;
          this.setClassWater = true;
        }
      });
    }

    if (brewRunMashin.mashingTargetDetails.length !== 0) {
      brewRunMashin.mashingTargetDetails.map(element => {
        if (element.isCompleted === true) {
          this.isCollapsedMashing = !this.isCollapsedMashing;
          this.setClassMashin = true;
        }
      });
    }

    if (brewRunMashin.startchTest.length !== 0) {
      brewRunMashin.startchTest.map(element => {
        if (element.isCompleted === true) {
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
    this.statusDate = new Date();
    const statusData = new StarchTestResultList();
    statusData.starchTestId = this.brewRunMashin.startchTest[0].id;
    statusData.testName = 'Test ';
    statusData.testResult = this.status;
    statusData.timeStamp = this.statusDate;
    this.brewRunMashin.startchTest[0].starchTestResultList.push(statusData);
  }

  get sortData() {
    if (this.brewRunMashin.startchTest[0].starchTestResultList != null) {
      return this.brewRunMashin.startchTest[0].starchTestResultList.sort((a, b) => {
        return <any>new Date(a.timeStamp) - <any>new Date(b.timeStamp);
      });
    }
  }

  saveData(): Observable<boolean>{
    const mashinAPI = String.Format(this.apiService.mashin, this.tenantId, this.brewId);
    if (!this.mashinAvailable) {
       this.apiService.postData(mashinAPI, this.brewRunMashin).subscribe(response => {
        this.mashinAvailable = response['body']['mashinAvailable'];
        return observableOf(true);
      }, error => {
        this.toast.danger(error.error.message);
      });
    }
    else {
       this.apiService.putData(mashinAPI, this.brewRunMashin).subscribe(response => {
        this.mashinAvailable = response['body']['mashinAvailable'];
        return observableOf(true);
      }, error => {
        this.toast.danger(error.error.message);
      });
      return observableOf(false);
    }
  }

}
