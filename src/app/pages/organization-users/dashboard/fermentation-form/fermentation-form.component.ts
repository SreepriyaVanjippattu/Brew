import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  BrewRun, FermentationDataEntry, YeastDataDetail, DiacetylRestDataDetail, AgingDetail,
  EnterFermentationData, FermentationDetailsNote, AdjunctsDetail, HopesDetail,
} from '../../../../models/brewrun';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { DashboardService } from '../dashboard.service';
import { NbToastrService } from '@nebular/theme';
import { addIn } from '../../../../models/addInConstants';
import { Guid } from 'guid-typescript';
import { FormBuilder } from '@angular/forms';
import { ThrowStmt } from '@angular/compiler';
import { ModalService } from '../../../modal';
import { DatePipe } from '@angular/common';
import { String } from 'typescript-string-operations';

@Component({
  selector: 'fermentation-form',
  templateUrl: './fermentation-form.component.html',
  styleUrls: ['./fermentation-form.component.scss'],
})
export class FermentationFormComponent implements OnInit {
  @ViewChild('startTemp', { static: false }) startTemp: ElementRef;
  @ViewChild('startDia', { static: false }) startDia: ElementRef;

  isCollapsedFermentation = false;
  isCollapsedYeast = false;
  isCollapsedHops = false;
  isCollapsedDiacetyl = false;
  isCollapsedCooling = false;
  isCollapsedFermentationPrevious = false;
  isCollapsedFermentationEnter = false;
  isCollapsedNotes;
  isCollapsedAdjuncts;
  tenantId: any;
  brewId: any;

  brew: BrewRun;

  diaStartTime: any = '';
  diaEndTime: any = '';
  coolStartTime: any = '';
  coolEndTime: any = '';
  units: any;
  preference: any;
  preferedUnit: any;
  yeastStrain: any;
  countries: any;
  addins: any;
  suppliers: any;
  maltTypes: any;
  styles: any;
  maltNames: any;

  selectedPos: number = -1;
  recipeId: any;
  addInHopsKettle: any = [];
  addInHopsWhirlpool: any = [];
  addInHopsFermentation: any = [];

  addInAdjunctsKettle: any = [];
  addInAdjunctsWhirlpool: any = [];
  addInAdjunctsFermentation: any = [];
  getaddInData: any;
  addInConstants = addIn;


  modalForms = this.formBuilder.group({
    styleText: [''],
    typeText: [''],
    supplierText: [''],
  });
  validateForm = this.formBuilder.group({
    tank: [''],
  });
  preferedPlato: any;
  platoUnitId: any;
  recipeContent: any;
  fermentTarget = [];
  yeastTarget = [];
  hopsTarget = [];
  adjunctsTarget = [];
  diacetylTarget = [];
  coolTarget = [];
  tankList: any;
  currentTank: string;
  changeValue: any;
  dataTarget: boolean = false;
  setClass = false;
  setClassYeast = false;
  setClassHops = false;
  setClassAdjuncts = false;
  setClassDia = false;
  setClassCool = false;
  setClassPrevFerm = false;
  currentUser: any;

  constructor(
    private dataService: DashboardService,
    private apiService: ApiProviderService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: NbToastrService,
    private formBuilder: FormBuilder,
    private modalService: ModalService,
    private datePipe: DatePipe,

  ) { }

  ngOnInit() {
    this.brew = new BrewRun();
    this.brewId = this.route.snapshot.paramMap.get('id');
    const userDetails = JSON.parse(sessionStorage.getItem('user'));
    this.currentUser = userDetails['UserProfile'].Id;
    this.tenantId = userDetails['CompanyDetails'].Id;
    this.units = JSON.parse(sessionStorage.getItem('units'));
    this.getAllActiveTank(this.tenantId, this.brewId);

    this.getPreferenceUsed();
    if (!sessionStorage.styles || !sessionStorage.addins ||
      !sessionStorage.suppliers || !sessionStorage.maltTypes || !sessionStorage.maltNames || !sessionStorage.yeastStrain ||
      !sessionStorage.countries) {
      this.getCountries();
      this.getAddIns();
      this.getMaltTypes();
      this.getStyles();
      this.getSuppliers();
      this.getMaltName();
      this.getYeastStrain();
    } else {
      this.styles = JSON.parse(sessionStorage.styles);
      this.addins = JSON.parse(sessionStorage.addins);
      this.countries = JSON.parse(sessionStorage.countries);
      this.maltTypes = JSON.parse(sessionStorage.maltTypes);
      this.suppliers = JSON.parse(sessionStorage.suppliers);
      this.maltNames = JSON.parse(sessionStorage.maltNames);
      this.yeastStrain = JSON.parse(sessionStorage.yeastStrain);

    }

    this.getSingleBrewDetails(this.tenantId, this.brewId);
  }
  currentValue(event) {
    this.changeValue = event.target.value;
    if (this.currentTank !== this.changeValue) {
      this.dataTarget = true;
    }

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
        this.currentTank = this.brew.TankName;
        this.recipeId = response['body'].RecipeId;
        this.getRecipeDetailsEdit();
        this.brew.HopesDetails.forEach(element => {
          // fermentation data
          if (element.AddInId === this.addInConstants.Fermentation.Id) {
            if (element.StartTime === null) {
              element.StartTime = new Date();
            }
            let dateTime = this.timezone(new Date(element.StartTime).toUTCString());
            dateTime = dateTime.split(' ').slice(0, 5).join(' ');
            element.StartTime = new Date(dateTime);
            this.addInHopsFermentation.push(element);
          }
        });

        this.brew.AdjunctsDetails.forEach(element => {
          // fermentation data
          if (element.AddInId === this.addInConstants.Fermentation.Id) {
            if (element.StartTime === null) {
              element.StartTime = new Date();
            }

            let dateTime = this.timezone(new Date(element.StartTime).toUTCString());
            dateTime = dateTime.split(' ').slice(0, 5).join(' ');
            element.StartTime = new Date(dateTime);
            this.addInAdjunctsFermentation.push(element);
          }
        });

        if (this.brew.FermentationDataEntry.length == 0) {
          this.brew.FermentationDataEntry.push(new FermentationDataEntry());
        }
        if (this.brew.YeastDataDetails.length == 0) {

          this.brew.YeastDataDetails.push(new YeastDataDetail());
          this.brew.YeastDataDetails[this.brew.YeastDataDetails.length - 1].TenantId = this.tenantId;
        }
        if (this.brew.DiacetylRestDataDetails.length == 0) {
          this.brew.DiacetylRestDataDetails.push(new DiacetylRestDataDetail());
          this.brew.DiacetylRestDataDetails[this.brew.DiacetylRestDataDetails.length - 1].TenantId = this.tenantId;

        } else {
          this.brew.DiacetylRestDataDetails.map((diaTimes: DiacetylRestDataDetail) => {
            diaTimes.StartTime = this.datePipe.transform(diaTimes.StartTime, 'E, dd LLL yyyy HH:mm:ss');
            diaTimes.EndTime = this.datePipe.transform(diaTimes.EndTime, 'E, dd LLL yyyy HH:mm:ss');
          });
        }
        if (this.brew.AgingDetails.length == 0) {
          this.brew.AgingDetails.push(new AgingDetail());
          this.brew.AgingDetails[this.brew.AgingDetails.length - 1].TenantId = this.tenantId;

        } else {
          this.brew.AgingDetails.map((agingTimes: AgingDetail) => {
            agingTimes.StartTime = this.datePipe.transform(agingTimes.StartTime, 'E, dd LLL yyyy HH:mm:ss');
            agingTimes.EndTime = this.datePipe.transform(agingTimes.EndTime, 'E, dd LLL yyyy HH:mm:ss');
          });
        }
        this.brew.EnterFermentationData.push(new EnterFermentationData);
        this.brew.EnterFermentationData[this.brew.EnterFermentationData.length - 1].TenantId = this.tenantId;
        this.selectedPos = this.brew.EnterFermentationData.length - 1;
        this.brew.EnterFermentationData.map((enter: EnterFermentationData, i) => {

          let dateTime = this.timezone(new Date(enter.DateAndTime).toUTCString());
          dateTime = dateTime.split(' ').slice(0, 5).join(' ');
          enter.DateAndTime = new Date(dateTime);
        });
        if (this.brew.FermentationDetailsNotes.length == 0) {
          this.brew.FermentationDetailsNotes.push(new FermentationDetailsNote());
          this.brew.FermentationDetailsNotes[this.brew.FermentationDetailsNotes.length - 1].TenantId = this.tenantId;

        }
        this.checkIfComplete(this.brew);
      }

    });
  }

  getYeastStrain() {
    const getAllYeastStrainsAPI = String.Format(this.apiService.getAllYeastStrains, this.tenantId);
    this.apiService.getData(getAllYeastStrainsAPI).subscribe(response => {
      if (response) {
        this.yeastStrain = response['body'].yeastStrainBase;
        sessionStorage.setItem('yeastStrain', JSON.stringify(this.yeastStrain));
      }
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
    this.apiService.getData(getAllActiveMaltGrainTypeAPI).subscribe(response => {
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
      if (element.Id === this.preference.GravityMeasurementId) {
        this.preferedPlato = element.Name;
        this.platoUnitId = element.Id;
      }
    });
  }

  getAllActiveTank(tenantId, brewId) {
    this.apiService.getDataByQueryParams(this.apiService.GetAllAvailableTankListInFermentation, null, tenantId, brewId, null, null).subscribe(response => {
      if (response.status === 200) {
        this.tankList = response['body'];
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

  conditioningClick() {
    this.saveGo('app/dashboard/condition-form/' + this.brewId);
  }
  onPreviousClick() {
    this.saveGo('app/dashboard/brew-log-form/' + this.brewId);
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
  editClientDirectory(pos: number) {
    this.selectedPos = pos;
  }
  addClientDirectory() {
    this.brew.EnterFermentationData.push(new EnterFermentationData());
    this.brew.EnterFermentationData[this.brew.EnterFermentationData.length - 1].TenantId = this.tenantId;
    this.selectedPos = this.brew.EnterFermentationData.length - 1;
    let dateTime = this.timezone(new Date(this.brew.EnterFermentationData[this.selectedPos].DateAndTime).toUTCString());
    dateTime = dateTime.split(' ').slice(0, 5).join(' ');
    this.brew.EnterFermentationData[this.selectedPos].DateAndTime = new Date(dateTime);
  }
  activeBrewClick() {

  }

  saveGo(url: string) {
    this.brew.DiacetylRestDataDetails.forEach((dia: DiacetylRestDataDetail) => {
      dia.TenantId = this.tenantId;

    });
    this.brew.AgingDetails.forEach((cool: AgingDetail) => {
      cool.TenantId = this.tenantId;

    });

    this.brew.HopesDetails.map((hop: HopesDetail) => {
      if (hop.AddInId === this.addInConstants.Fermentation.Id) {
        const dateTime2 = hop.StartTime.toString().split(' ').slice(0, 5).join(' ');
        const timeZone = JSON.parse(sessionStorage.preferenceUsed);
        const preferedZone = timeZone.BaseUtcOffset;
        let zone = preferedZone.replace(/:/gi, '');
        zone = zone.slice(0, -2);
        const newDateTime = dateTime2 + ' GMT' + `${zone}`;
        hop.StartTime = new Date(newDateTime).toLocaleString();
      }
    });
    this.brew.AdjunctsDetails.map((adjunct: AdjunctsDetail) => {
      if (adjunct.AddInId === this.addInConstants.Fermentation.Id) {
        const dateTime2 = adjunct.StartTime.toString().split(' ').slice(0, 5).join(' ');
        const timeZone = JSON.parse(sessionStorage.preferenceUsed);
        const preferedZone = timeZone.BaseUtcOffset;
        let zone = preferedZone.replace(/:/gi, '');
        zone = zone.slice(0, -2);
        const newDateTime = dateTime2 + ' GMT' + `${zone}`;
        adjunct.StartTime = new Date(newDateTime).toLocaleString();
      }
    });

    this.brew.EnterFermentationData.map((enter: EnterFermentationData, i) => {
      if (enter.Plato === null && enter.Temperature === null && enter.Ph === null) {
        this.brew.EnterFermentationData.splice(i, 1);
      }
      const dateTime2 = enter.DateAndTime.toString().split(' ').slice(0, 5).join(' ');
      const timeZone = JSON.parse(sessionStorage.preferenceUsed);
      const preferedZone = timeZone.BaseUtcOffset;
      let zone = preferedZone.replace(/:/gi, '');
      zone = zone.slice(0, -2);
      const newDateTime = dateTime2 + ' GMT' + `${zone}`;
      enter.DateAndTime = new Date(newDateTime).toLocaleString();
    });

    this.apiService.postData(this.apiService.addBrewRun, this.brew).subscribe(response => {
      if (response) {
        this.router.navigate([url]);
      }
    }, error => {
      this.toast.danger(error.error.Message);
    });
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
          this.modalForms.get('styleText').setValue('');
          this.modalForms.reset();
        }
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
          this.modalForms.get('typeText').setValue('');
          this.modalForms.reset();
        }
      });
    }
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
          this.modalForms.get('supplierText').setValue('');
          this.modalForms.reset();
        }
      });
    }
  }

  setStartTemp(i, start) {
    this.coolStartTime = this.timezone(new Date().toUTCString());
    this.coolStartTime = this.coolStartTime.split(' ').slice(0, 5).join(' ');
    start.StartTime = this.coolStartTime;
  }

  endTemp(i, end) {
    this.coolEndTime = this.timezone(new Date().toUTCString());
    this.coolEndTime = this.coolEndTime.split(' ').slice(0, 5).join(' ');
    end.EndTime = this.coolEndTime;
  }

  setStartDia(i, start) {
    this.diaStartTime = this.timezone(new Date().toUTCString());
    this.diaStartTime = this.diaStartTime.split(' ').slice(0, 5).join(' ');
    start.StartTime = this.diaStartTime;
  }

  setEndDia(i, end) {
    this.diaEndTime = this.timezone(new Date().toUTCString());
    this.diaEndTime = this.diaEndTime.split(' ').slice(0, 5).join(' ');
    end.EndTime = this.diaEndTime;
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
        this.getFermentTargets(this.recipeContent);
        this.getYeastTargets(this.recipeContent);
        this.getHopsTargets(this.recipeContent);
        this.getAdjunctsTargets(this.recipeContent);
        this.getDiacetylTargets(this.recipeContent);
        this.getCoolingTargets(this.recipeContent);
      }
    });
  }
  getFermentTargets(recipeContent: any) {
    if (recipeContent.FermentationTargets !== null) {
      this.fermentTarget.push(recipeContent.FermentationTargets);
    }
  }
  getYeastTargets(recipeContent: any) {
    if (recipeContent.Yeast !== null) {
      this.yeastTarget.push(recipeContent.Yeast);
    }
  }
  getHopsTargets(recipeContent: any) {
    if (recipeContent.Hops.length !== 0) {
      this.hopsTarget = recipeContent.Hops.filter(x => x.AddInId === this.addInConstants.Fermentation.Id);
    }
  }
  getAdjunctsTargets(recipeContent: any) {
    if (recipeContent.Adjuncts.length !== 0) {
      this.adjunctsTarget = recipeContent.Adjuncts.filter(x => x.AddInId === this.addInConstants.Fermentation.Id);
    }
  }
  getDiacetylTargets(recipeContent: any) {
    if (recipeContent.DiacetylRest !== null) {
      this.diacetylTarget.push(recipeContent.DiacetylRest);
    }
  }
  getCoolingTargets(recipeContent: any) {
    if (recipeContent.Aging !== null) {
      this.coolTarget.push(recipeContent.Aging);
    }
  }

  getAdjCountFerm(uid: string): number {
    let count = 1;
    const specials = this.brew.AdjunctsDetails.filter(x => x.AddInId === this.addInConstants.Fermentation.Id);
    specials.forEach((adj: AdjunctsDetail, i: number) => {
      if (adj.Id === uid) {
        count = i + 1;
      }
    });
    return count;
  }

  getAdjCountFermTargets(uid: string): number {
    let count = 1;
    const specials = this.recipeContent.Adjuncts.filter(x => x.AddInId === this.addInConstants.Fermentation.Id);
    specials.forEach((adj, i: number) => {
      if (adj.Id === uid) {
        count = i + 1;
      }
    });
    return count;
  }

  getHopsCountFerm(uid: string): number {
    let count = 1;
    const specials = this.brew.HopesDetails.filter(x => x.AddInId === this.addInConstants.Fermentation.Id);
    specials.forEach((hop: HopesDetail, i: number) => {
      if (hop.Id === uid) {
        count = i + 1;
      }
    });
    return count;
  }

  getHopsCountFermTargets(uid: string): number {
    let count = 1;
    const specials = this.recipeContent.Hops.filter(x => x.AddInId === this.addInConstants.Fermentation.Id);
    specials.forEach((hop, i: number) => {
      if (hop.Id === uid) {
        count = i + 1;
      }
    });
    return count;
  }

  onFermentComplete(i, editedSectionName) {
    this.isCollapsedFermentation = !this.isCollapsedFermentation;
    this.brew.FermentationDataEntry[i].IsCompleted = true;
    this.setClass = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onYeastComplete(i, editedSectionName) {
    this.isCollapsedYeast = !this.isCollapsedYeast;
    this.brew.YeastDataDetails[i].IsCompleted = true;
    this.setClassYeast = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onHopsComplete(editedSectionName) {
    this.isCollapsedHops = !this.isCollapsedHops;
    this.brew.HopesDetails.map(element => {
      if (element.AddInId === this.addInConstants.Fermentation.Id) {
        element.IsCompleted = true;
      }
    });
    this.setClassHops = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onAdjunctsComplete(editedSectionName) {
    this.isCollapsedAdjuncts = !this.isCollapsedAdjuncts;
    this.brew.AdjunctsDetails.map(element => {
      if (element.AddInId === this.addInConstants.Fermentation.Id) {
        element.IsCompleted = true;
      }
    });
    this.setClassAdjuncts = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onDiacetylComplete(i, editedSectionName) {
    this.isCollapsedDiacetyl = !this.isCollapsedDiacetyl;
    this.brew.DiacetylRestDataDetails[i].IsCompleted = true;
    this.setClassDia = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onCoolingComplete(i, editedSectionName) {
    this.isCollapsedCooling = !this.isCollapsedCooling;
    this.brew.AgingDetails[i].IsCompleted = true;
    this.setClassCool = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onPrevFermComplete(length, editedSectionName) {
    this.isCollapsedFermentationPrevious = !this.isCollapsedFermentationPrevious;
    this.brew.EnterFermentationData.map(element => {
      element.IsCompleted = true;
    });
    this.setClassPrevFerm = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  checkIfComplete(brew: BrewRun) {
    if (brew.FermentationDataEntry.length !== 0) {
      brew.FermentationDataEntry.map(element => {
        if (element.IsCompleted === true) {
          this.isCollapsedFermentation = !this.isCollapsedFermentation;
          this.setClass = true;
        }
      });
    }

    if (brew.YeastDataDetails.length !== 0) {
      brew.YeastDataDetails.map(element => {
        if (element.IsCompleted === true) {
          this.isCollapsedYeast = !this.isCollapsedYeast;
          this.setClassYeast = true;
        }
      });
    }

    if (brew.HopesDetails.length !== 0) {
      brew.HopesDetails.map(element => {
        if (element.AddInId === this.addInConstants.Fermentation.Id && element.IsCompleted === true) {
          this.isCollapsedHops = !this.isCollapsedHops;
          this.setClassHops = true;
        }
      });
    }

    if (brew.AdjunctsDetails.length !== 0) {
      brew.AdjunctsDetails.map(element => {
        if (element.AddInId === this.addInConstants.Fermentation.Id && element.IsCompleted === true) {
          this.isCollapsedAdjuncts = !this.isCollapsedAdjuncts;
          this.setClassAdjuncts = true;
        }
      });
    }

    if (brew.DiacetylRestDataDetails.length !== 0) {
      brew.DiacetylRestDataDetails.map(element => {
        if (element.IsCompleted === true) {
          this.isCollapsedDiacetyl = !this.isCollapsedDiacetyl;
          this.setClassDia = true;
        }
      });
    }

    if (brew.AgingDetails.length !== 0) {
      brew.AgingDetails.map(element => {
        if (element.IsCompleted === true) {
          this.isCollapsedCooling = !this.isCollapsedCooling;
          this.setClassCool = true;
        }
      });
    }

    if (brew.EnterFermentationData.length !== 0) {
      brew.EnterFermentationData.map(element => {
        if (element.IsCompleted === true) {
          this.isCollapsedFermentationPrevious = !this.isCollapsedFermentationPrevious;
          this.setClassPrevFerm = true;
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
