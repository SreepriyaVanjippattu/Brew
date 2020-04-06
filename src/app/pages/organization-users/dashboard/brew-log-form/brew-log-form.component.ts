import {
  Component,
  OnInit,
  ViewChild,
  ElementRef
} from '@angular/core';
import {
  Router, ActivatedRoute
} from '@angular/router';
import {
  BrewRun, Vorlauf, SpargeDetail, FirstRunning, LastRunning, KettleDataEntryDetail, HopesDetail,
  AdjunctsDetail, PostBoilData, WhirlPoolDataEntry, PostWhirlpoolDetail, CoolingKnockouDetail, BrewLogDetailsNote
} from '../../../../models/brewrun';
import { DashboardService } from '../dashboard.service';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { NbToastrService } from '@nebular/theme';
import { addIn } from '../../../../models/addInConstants';
import { FormBuilder } from '@angular/forms';
import { Guid } from 'guid-typescript';
import { DatePipe } from '@angular/common';
import { String } from 'typescript-string-operations';

@Component({
  selector: 'brew-log-form',
  templateUrl: './brew-log-form.component.html',
  styleUrls: ['./brew-log-form.component.scss']
})
export class BrewLogFormComponent implements OnInit {
  @ViewChild('vorStart', { static: false }) vorStart: ElementRef;
  @ViewChild('spargeStart', { static: false }) spargeStart: ElementRef;
  @ViewChild('kettleStart', { static: false }) kettleStart: ElementRef;
  @ViewChild('whirlpoolStart', { static: false }) whirlpoolStart: ElementRef;
  @ViewChild('coolStart', { static: false }) coolStart: ElementRef;
  @ViewChild('spargeEnd', { static: false }) spargeEnd: ElementRef;
  @ViewChild('kettleEnd', { static: false }) kettleEnd: ElementRef;
  @ViewChild('coolEnd', { static: false }) coolEnd: ElementRef;

  isCollapsedVorlauf = false;
  isCollapsedSparge = false;
  isCollapsedFirstRun = false;
  isCollapsedLastRun = false;
  isCollapsedKettle = false;
  isCollapsedHops = false;
  isCollapsedAdjuncts = false;
  isCollapsedHopsWhirl = false;
  isCollapsedAdjunctsWhirl = false;
  isCollapsedPostBoil = false;
  isCollapsedWhirlpool = false;
  isCollapsedPostWhirlpool = false;
  isCollapsedCoolingKnockout = false;
  isCollapsedNotes;

  tenantId: any;
  brewId: any;

  brew: BrewRun;

  vorlaufStartTime: any = '';
  vorlaufEndTime: any = '';
  spargeStartTime: any = '';
  spargeEndTime: any = '';
  kettleStartTime: any = '';
  kettleEndTime: any = '';
  whirlStartTime: any = '';
  coolStartTime: any = '';
  coolEndTime: any = '';

  countries: any;
  addins: any;
  suppliers: any;
  maltTypes: any;
  styles: any;
  units: any;
  preference: any;
  preferedUnit: any;
  startTime: any;
  endTime: any;
  recipeId: any;
  getaddInData: any;
  addInHopsKettle: any = [];
  addInHopsWhirlpool: any = [];
  addInAdjunctsKettle: any = [];
  addInAdjunctsWhirlpool: any = [];
  addInConstants = addIn;


  modalForms = this.formBuilder.group({
    styleText: [''],
    typeText: [''],
    supplierText: [''],
  });
  recipeContent: any;
  vorlaufTarget: any;
  spargeTarget = [];
  hopsTargetKettle = [];
  hopsTargetWhirl = [];
  adjunctsTargetKettle = [];
  adjunctsTargetWhirl = [];
  firstRunTarget: any;
  lastRunTarget: any;
  postTarget: any;
  whirlpoolTarget = [];
  postWhirlTarget = [];
  coolTarget = [];
  kettleTarget = [];
  whirlpoolHopsArray = [];
  kettleHopsArray = [];
  kettleAdjunctsArray = [];
  whirlpoolAdjunctssArray = [];
  preferedPlato: any;
  platoUnitId: any;
  setClass = false;
  setClassSparge = false;
  setClassFirst = false;
  setClassLast = false;
  setClassKettle = false;
  setClassHops = false;
  setClassAdjuncts = false;
  setClassPostBoil = false;
  setClassWhirl = false;
  setClassPostWhirl = false;
  setClassCool = false;
  index: any;
  setClassHopsWhirl = false;
  setClassAdjunctsWhirl = false;
  currentUser: any;
  maltNames: any;

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
    this.getPreferenceUsed();
    this.getMashinMasterDetails();
    
  
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
  getSingleBrewDetails(tenantId, brewId) {
    this.apiService.getDataByQueryParams(this.apiService.getBrewRunById, null, tenantId, brewId).subscribe(response => {
      if (response.status === 200) {
        this.brew = response['body'];
        this.recipeId = response['body'].RecipeId;
        this.getRecipeDetailsEdit();
        this.brew.HopesDetails.forEach(element => {
          if (element.AddInId === '255ce5b1-4b1a-4da8-b269-5a0b81d9db23') {
            this.addInHopsKettle.push(element);
          }
          if (element.AddInId === '16818dea-3f57-49b7-96eb-5f6ffdc90120') {
            this.addInHopsWhirlpool.push(element);
          }
        });
        this.brew.AdjunctsDetails.forEach(element => {
          if (element.AddInId === '255ce5b1-4b1a-4da8-b269-5a0b81d9db23') {
            this.addInAdjunctsKettle.push(element);
          }
          if (element.AddInId === '16818dea-3f57-49b7-96eb-5f6ffdc90120') {
            this.addInAdjunctsWhirlpool.push(element);
          }
        });

        if (this.brew.Vorlauf.length == 0) {
          this.brew.Vorlauf.push(new Vorlauf());
        } else {
          this.brew.Vorlauf.map((vorlaufTime: Vorlauf) => {
            vorlaufTime.StartTime = this.datePipe.transform(vorlaufTime.StartTime, 'E, dd LLL yyyy HH:mm:ss');
            vorlaufTime.EndTime = this.datePipe.transform(vorlaufTime.EndTime, 'E, dd LLL yyyy HH:mm:ss');
          })
        }
        if (this.brew.SpargeDetails.length == 0) {
          this.brew.SpargeDetails.push(new SpargeDetail());
        } else {
          this.brew.SpargeDetails.map((spargeStartTimes: SpargeDetail) => {
            spargeStartTimes.StartTime = this.datePipe.transform(spargeStartTimes.StartTime, 'E, dd LLL yyyy HH:mm:ss');
            spargeStartTimes.EndTime = this.datePipe.transform(spargeStartTimes.EndTime, 'E, dd LLL yyyy HH:mm:ss');
          })
        }
        if (this.brew.FirstRunnings.length == 0) {
          this.brew.FirstRunnings.push(new FirstRunning());
        }
        if (this.brew.LastRunnings.length == 0) {
          this.brew.LastRunnings.push(new LastRunning());
        }
        if (this.brew.KettleDataEntryDetails.length == 0) {
          this.brew.KettleDataEntryDetails.push(new KettleDataEntryDetail());
        } else {
          this.brew.KettleDataEntryDetails.map((kettleTimes: KettleDataEntryDetail) => {
            kettleTimes.StartTime = this.datePipe.transform(kettleTimes.StartTime, 'E, dd LLL yyyy HH:mm:ss');
            kettleTimes.EndTime = this.datePipe.transform(kettleTimes.EndTime, 'E, dd LLL yyyy HH:mm:ss');
          })
        }
        if (this.brew.HopesDetails.length == 0) {
          this.brew.HopesDetails.push(new HopesDetail());
        }
        this.brew.HopesDetails.map((hops: HopesDetail, i) => {
          if (hops.AddInId !== this.addInConstants.Fermentation.Id) {
            if (hops.StartTime === null) {
              hops.StartTime = new Date();
            }
            let dateTime = this.timezone(new Date(hops.StartTime).toUTCString());
            dateTime = dateTime.split(' ').slice(0, 5).join(' ');
            hops.StartTime = new Date(dateTime);
          }
        });

        if (this.brew.AdjunctsDetails.length == 0) {
          this.brew.AdjunctsDetails.push(new AdjunctsDetail());
        }
        this.brew.AdjunctsDetails.map((adjuncts: AdjunctsDetail, i) => {
          if (adjuncts.AddInId !== this.addInConstants.Fermentation.Id) {
            if (adjuncts.StartTime === null) {
              adjuncts.StartTime = new Date();
            }
            let dateTime = this.timezone(new Date(adjuncts.StartTime).toUTCString());
            dateTime = dateTime.split(' ').slice(0, 5).join(' ');
            adjuncts.StartTime = new Date(dateTime);
          }
        });

        if (this.brew.PostBoilData.length == 0) {
          this.brew.PostBoilData.push(new PostBoilData());
        }
        if (this.brew.WhirlPoolDataEntry.length == 0) {
          this.brew.WhirlPoolDataEntry.push(new WhirlPoolDataEntry());
        } else {
          this.brew.WhirlPoolDataEntry.map((whrilTimes: WhirlPoolDataEntry) => {
            whrilTimes.StartTime = this.datePipe.transform(whrilTimes.StartTime, 'E, dd LLL yyyy HH:mm:ss');
          })
        }
        if (this.brew.PostWhirlpoolDetails.length == 0) {
          this.brew.PostWhirlpoolDetails.push(new PostWhirlpoolDetail());
        }
        if (this.brew.CoolingKnockouDetails.length == 0) {
          this.brew.CoolingKnockouDetails.push(new CoolingKnockouDetail());
        } else {
          this.brew.CoolingKnockouDetails.map((coolTimes: CoolingKnockouDetail) => {
            coolTimes.StartTime = this.datePipe.transform(coolTimes.StartTime, 'E, dd LLL yyyy HH:mm:ss');
            coolTimes.EndTime = this.datePipe.transform(coolTimes.EndTime, 'E, dd LLL yyyy HH:mm:ss');
          })
        }
        if (this.brew.BrewLogDetailsNotes.length == 0) {
          this.brew.BrewLogDetailsNotes.push(new BrewLogDetailsNote());
        }
        this.checkIfComplete(this.brew);
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
    this.apiService.getData(this.apiService.getAllMaltGrainName, '', '', this.tenantId).subscribe(response => {
      if (response) {
        this.maltTypes = response['body'];
        sessionStorage.setItem('maltTypes', JSON.stringify(this.maltTypes));
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

  getPreferenceUsed() {
    const getPreferenceSettingsAPI = String.Format(this.apiService.getPreferenceSettings, this.tenantId);
    this.apiService.getDataList(getPreferenceSettingsAPI).subscribe((response: any) => {
      if (response.status === 200) {
        this.preference = response['body'];
        sessionStorage.setItem('preferenceUsed', JSON.stringify(this.preference));
        this.findUnits();
      }
    }, error => {

    });
  }



  onPreviousClick() {
    this.router.navigate(['app/dashboard/mash-in-form/' + this.brewId])
  }

  mashInFormClick() {
    this.saveGo('app/dashboard/brew-log-form/' + this.brewId);
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
    this.brew.Vorlauf.forEach((vorlauf: Vorlauf) => {
      vorlauf.TenantId = this.tenantId;
    });
    this.brew.SpargeDetails.forEach((sparge: SpargeDetail) => {
      sparge.TenantId = this.tenantId;
    });
    this.brew.FirstRunnings.forEach((firstrun: FirstRunning) => {
      firstrun.TenantId = this.tenantId;
    });
    this.brew.LastRunnings.forEach((lastrun: LastRunning) => {
      lastrun.TenantId = this.tenantId;
    });
    this.brew.KettleDataEntryDetails.forEach((kettle: KettleDataEntryDetail) => {
      kettle.TenantId = this.tenantId;
    });
    this.brew.HopesDetails.forEach((hop: HopesDetail) => {
      hop.TenantId = this.tenantId;
      if (hop.AddInId !== this.addInConstants.Fermentation.Id) {
        const dateTime2 = hop.StartTime.toString().split(' ').slice(0, 5).join(' ');
        const timeZone = JSON.parse(sessionStorage.preferenceUsed);
        const preferedZone = timeZone.BaseUtcOffset;
        let zone = preferedZone.replace(/:/gi, '');
        zone = zone.slice(0, -2);
        const newDateTime = dateTime2 + ' GMT' + `${zone}`;
        hop.StartTime = new Date(newDateTime).toLocaleString();
      }
    });
    this.brew.AdjunctsDetails.forEach((adjunct: AdjunctsDetail) => {
      adjunct.TenantId = this.tenantId;
      if (adjunct.AddInId !== this.addInConstants.Fermentation.Id) {
        const dateTime2 = adjunct.StartTime.toString().split(' ').slice(0, 5).join(' ');
        const timeZone = JSON.parse(sessionStorage.preferenceUsed);
        const preferedZone = timeZone.BaseUtcOffset;
        let zone = preferedZone.replace(/:/gi, '');
        zone = zone.slice(0, -2);
        const newDateTime = dateTime2 + ' GMT' + `${zone}`;
        adjunct.StartTime = new Date(newDateTime).toLocaleString();
      }
    });
    this.brew.PostBoilData.forEach((postboil: PostBoilData) => {
      postboil.TenantId = this.tenantId;
    });
    this.brew.WhirlPoolDataEntry.forEach((whirlpool: WhirlPoolDataEntry) => {
      whirlpool.TenantId = this.tenantId;

    });
    this.brew.PostWhirlpoolDetails.forEach((postwhirlpool: PostWhirlpoolDetail) => {
      postwhirlpool.TenantId = this.tenantId;
    });
    this.brew.BrewLogDetailsNotes.forEach((note: BrewLogDetailsNote) => {
      note.TenantId = this.tenantId;
    });
    this.brew.CoolingKnockouDetails.forEach((cool: CoolingKnockouDetail) => {
      cool.TenantId = this.tenantId;

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
          this.modalForms.reset();
        }
      });
    }
  }

  getRecipeDetailsEdit() {
    const getRecipebyIdAPI = String.Format(this.apiService.getRecipebyId, this.tenantId, this.recipeId);
    this.apiService.getDataList(getRecipebyIdAPI).subscribe(response => {
      if (response && response['body']) {
        this.recipeContent = response['body'];
        this.getVorlaufTargets(this.recipeContent);
        this.getSpargeTargets(this.recipeContent);
        this.getHopsTargets(this.recipeContent);
        this.getAdjunctsTargets(this.recipeContent);
        this.getFirstRunTargets(this.recipeContent);
        this.getLastRunTargets(this.recipeContent);
        this.getPostTargets(this.recipeContent);
        this.getWhirlpoolTargets(this.recipeContent);
        this.getPostWhirlpoolTargets(this.recipeContent);
        this.getCoolingTargets(this.recipeContent);
        this.getKettleTargets(this.recipeContent);
      }
    });
  }
  getVorlaufTargets(recipeContent: any) {
    this.vorlaufTarget = recipeContent.MaltGrainBill;
  }
  getSpargeTargets(recipeContent: any) {
    if (recipeContent.Sparge.length !== 0) {
      recipeContent.Sparge.forEach(element => {
        this.spargeTarget.push(element);
      });
    }
  }
  getHopsTargets(recipeContent: any) {
    if (recipeContent.Hops.length !== 0) {
      this.hopsTargetKettle = recipeContent.Hops.filter(x => x.AddInId === this.addInConstants.Kettle.Id);
      this.hopsTargetWhirl = recipeContent.Hops.filter(x => x.AddInId === this.addInConstants.Whirlpool.Id);
    }

  }
  getAdjunctsTargets(recipeContent: any) {
    if (recipeContent.Adjuncts.length !== 0) {
      this.adjunctsTargetKettle = recipeContent.Adjuncts.filter(x => x.AddInId === this.addInConstants.Kettle.Id);
      this.adjunctsTargetWhirl = recipeContent.Adjuncts.filter(x => x.AddInId === this.addInConstants.Whirlpool.Id);
    }
  }
  getKettleTargets(recipeContent: any) {
    this.kettleTarget.push(recipeContent.KettleTargets);
  }
  getFirstRunTargets(recipeContent: any) {
    this.firstRunTarget = recipeContent.Sparge;
  }
  getLastRunTargets(recipeContent: any) {
    this.lastRunTarget = recipeContent.Sparge;
  }
  getPostTargets(recipeContent: any) {
    this.postTarget = recipeContent.MaltGrainBill;
  }
  getWhirlpoolTargets(recipeContent: any) {
    this.whirlpoolTarget.push(recipeContent.WhirlpoolTarget);
  }
  getPostWhirlpoolTargets(recipeContent: any) {
    this.postWhirlTarget.push(recipeContent.WhirlpoolTarget);
  }
  getCoolingTargets(recipeContent: any) {
    this.coolTarget.push(recipeContent.CoolingKnockoutTargets);
  }

  setVStart(i, start): any {
    this.vorlaufStartTime = this.timezone(new Date().toUTCString());
    this.vorlaufStartTime = this.vorlaufStartTime.split(' ').slice(0, 5).join(' ');
    start.StartTime = this.vorlaufStartTime;

  }

  setVEnd(i, end): any {
    this.vorlaufEndTime = this.timezone(new Date().toUTCString());
    this.vorlaufEndTime = this.vorlaufEndTime.split(' ').slice(0, 5).join(' ');
    end.EndTime = this.vorlaufEndTime;
  }

  setSpargeStart(i, start) {
    this.spargeStartTime = this.timezone(new Date().toUTCString());
    this.spargeStartTime = this.spargeStartTime.split(' ').slice(0, 5).join(' ');
    start.StartTime = this.spargeStartTime;
  }

  setSpargeEnd(i, end) {
    this.spargeEndTime = this.timezone(new Date().toUTCString());
    this.spargeEndTime = this.spargeEndTime.split(' ').slice(0, 5).join(' ');
    end.EndTime = this.spargeEndTime;
  }

  setKettleStart(i, start) {
    this.kettleStartTime = this.timezone(new Date().toUTCString());
    this.kettleStartTime = this.kettleStartTime.split(' ').slice(0, 5).join(' ');
    start.StartTime = this.kettleStartTime;
  }

  setKettleEnd(i, end) {

    this.kettleEndTime = this.timezone(new Date().toUTCString());
    this.kettleEndTime = this.kettleEndTime.split(' ').slice(0, 5).join(' ');
    end.EndTime = this.kettleEndTime;
  }

  setWhirlStart(i, start) {
    this.whirlStartTime = this.timezone(new Date().toUTCString());
    this.whirlStartTime = this.whirlStartTime.split(' ').slice(0, 5).join(' ');
    start.StartTime = this.whirlStartTime;
  }

  setCoolStart(i, start) {

    this.coolStartTime = this.timezone(new Date().toUTCString());
    this.coolStartTime = this.coolStartTime.split(' ').slice(0, 5).join(' ');
    start.StartTime = this.coolStartTime;
  }

  setCoolEnd(i, end) {
    this.coolEndTime = this.timezone(new Date().toUTCString());
    this.coolEndTime = this.coolEndTime.split(' ').slice(0, 5).join(' ');
    end.EndTime = this.coolEndTime;
  }

  timezone(dateTime) {

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


  getAdjCountWhirl(uid: string): number {
    let count = 1;
    const specials = this.brew.AdjunctsDetails.filter(x => x.AddInId === this.addInConstants.Whirlpool.Id);
    specials.forEach((adj: AdjunctsDetail, i: number) => {
      if (adj.Id === uid) {
        count = i + 1;
      }
    });
    return count;
  }

  getAdjCountKettle(uid: string): number {
    let count = 1;
    const specials = this.brew.AdjunctsDetails.filter(x => x.AddInId === this.addInConstants.Kettle.Id);
    specials.forEach((adj: AdjunctsDetail, i: number) => {
      if (adj.Id === uid) {
        count = i + 1;
      }
    });
    return count;
  }

  getAdjCountWhirlTargets(uid: string): number {
    let count = 1;
    const specials = this.recipeContent.Adjuncts.filter(x => x.AddInId === this.addInConstants.Whirlpool.Id);
    specials.forEach((adj, i: number) => {
      if (adj.Id === uid) {
        count = i + 1;
      }
    });
    return count;
  }

  getAdjCountKettleTargets(uid: string): number {
    let count = 1;
    const specials = this.recipeContent.Adjuncts.filter(x => x.AddInId === this.addInConstants.Kettle.Id);
    specials.forEach((adj, i: number) => {
      if (adj.Id === uid) {
        count = i + 1;
      }
    });
    return count;
  }

  getHopsCountWhirl(uid: string): number {
    let count = 1;
    const specials = this.brew.HopesDetails.filter(x => x.AddInId === this.addInConstants.Whirlpool.Id);
    specials.forEach((hop: HopesDetail, i: number) => {
      if (hop.Id === uid) {
        count = i + 1;
      }
    });
    return count;
  }

  getHopsCountKettle(uid: string): number {
    let count = 1;
    const specials = this.brew.HopesDetails.filter(x => x.AddInId === this.addInConstants.Kettle.Id);
    specials.forEach((hop: HopesDetail, i: number) => {
      if (hop.Id === uid) {
        count = i + 1;
      }
    });
    return count;
  }

  getHopsCountWhirlTargets(uid: string): number {
    let count = 1;
    const specials = this.recipeContent.Hops.filter(x => x.AddInId === this.addInConstants.Whirlpool.Id);
    specials.forEach((hop, i: number) => {
      if (hop.Id === uid) {
        count = i + 1;
      }
    });
    return count;
  }

  getHopsCountKettleTarget(uid: string): number {
    let count = 1;
    const specials = this.recipeContent.Hops.filter(x => x.AddInId === this.addInConstants.Kettle.Id);
    specials.forEach((hop, i: number) => {
      if (hop.Id === uid) {
        count = i + 1;
      }
    });
    return count;
  }

  activeBrewClick() { }   // build error

  onVorlauf(i, editedSectionName) {
    this.isCollapsedVorlauf = !this.isCollapsedVorlauf;
    this.brew.Vorlauf[i].IsCompleted = true;
    this.setClass = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onSpargeComplete(i, editedSectionName) {
    this.isCollapsedSparge = !this.isCollapsedSparge;
    this.brew.SpargeDetails[0].IsCompleted = true;
    this.setClassSparge = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onFirstRunComplete(i, editedSectionName) {
    this.isCollapsedFirstRun = !this.isCollapsedFirstRun;
    this.brew.FirstRunnings[i].IsCompleted = true;
    this.setClassFirst = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onLastRunComplete(i, editedSectionName) {
    this.isCollapsedLastRun = !this.isCollapsedLastRun;
    this.brew.LastRunnings[i].IsCompleted = true;
    this.setClassLast = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onKettleComplete(i, editedSectionName) {
    this.isCollapsedKettle = !this.isCollapsedKettle;
    this.brew.KettleDataEntryDetails[i].IsCompleted = true;
    this.setClassKettle = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onHopsCompleteKettle(editedSectionName) {
    this.isCollapsedHops = !this.isCollapsedHops;
    this.brew.HopesDetails.map(element => {
      if (element.AddInId === this.addInConstants.Kettle.Id) {
        element.IsCompleted = true;
      }
    });
    this.setClassHops = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onHopsCompleteWhirl(editedSectionName) {
    this.isCollapsedHopsWhirl = !this.isCollapsedHopsWhirl;
    this.brew.HopesDetails.map(element => {
      if (element.AddInId === this.addInConstants.Whirlpool.Id) {
        element.IsCompleted = true;
      }
    });
    this.setClassHopsWhirl = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onAdjunctsCompleteKettle(editedSectionName) {
    this.isCollapsedAdjuncts = !this.isCollapsedAdjuncts;
    this.brew.AdjunctsDetails.map(element => {
      if (element.AddInId === this.addInConstants.Kettle.Id) {
        element.IsCompleted = true;
      }
    });
    this.setClassAdjuncts = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onAdjunctsCompleteWhirl(editedSectionName) {
    this.isCollapsedAdjunctsWhirl = !this.isCollapsedAdjunctsWhirl;
    this.brew.AdjunctsDetails.map(element => {
      if (element.AddInId === this.addInConstants.Whirlpool.Id) {
        element.IsCompleted = true;
      }
    });
    this.setClassAdjunctsWhirl = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onPostBoilComplete(i, editedSectionName) {
    this.isCollapsedPostBoil = !this.isCollapsedPostBoil;
    this.brew.PostBoilData[i].IsCompleted = true;
    this.setClassPostBoil = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onWhirlpoolComplete(i, editedSectionName) {
    this.isCollapsedWhirlpool = !this.isCollapsedWhirlpool;
    this.brew.WhirlPoolDataEntry[i].IsCompleted = true;
    this.setClassWhirl = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onPostWhirlComplete(i, editedSectionName) {
    this.isCollapsedPostWhirlpool = !this.isCollapsedPostWhirlpool;
    this.brew.PostWhirlpoolDetails[i].IsCompleted = true;
    this.setClassPostWhirl = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onCoolingComplete(i, editedSectionName) {
    this.isCollapsedCoolingKnockout = !this.isCollapsedCoolingKnockout;
    this.brew.CoolingKnockouDetails[i].IsCompleted = true;
    this.setClassCool = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  checkIfComplete(brew: BrewRun) {

    if (brew.Vorlauf.length !== 0) {
      brew.Vorlauf.map(element => {
        if (element.IsCompleted === true) {
          this.isCollapsedVorlauf = !this.isCollapsedVorlauf;
          this.setClass = true;
        }
      });
    }

    if (brew.SpargeDetails.length !== 0) {
      brew.SpargeDetails.map(element => {
        if (element.IsCompleted === true) {
          this.isCollapsedSparge = !this.isCollapsedSparge;
          this.setClassSparge = true;
        }
      });
    }

    if (brew.FirstRunnings.length !== 0) {
      brew.FirstRunnings.map(element => {
        if (element.IsCompleted === true) {
          this.isCollapsedFirstRun = !this.isCollapsedFirstRun;
          this.setClassFirst = true;
        }
      });
    }

    if (brew.LastRunnings.length !== 0) {
      brew.LastRunnings.map(element => {
        if (element.IsCompleted === true) {
          this.isCollapsedLastRun = !this.isCollapsedLastRun;
          this.setClassLast = true;
        }
      });
    }

    if (brew.KettleDataEntryDetails.length !== 0) {
      brew.KettleDataEntryDetails.map(element => {
        if (element.IsCompleted === true) {
          this.isCollapsedKettle = !this.isCollapsedKettle;
          this.setClassKettle = true;
        }
      });
    }

    if (brew.HopesDetails.length !== 0) {
      brew.HopesDetails.map(element => {
        if (element.AddInId === this.addInConstants.Kettle.Id && element.IsCompleted === true) {
          this.isCollapsedHops = !this.isCollapsedHops;
          this.setClassHops = true;
        }
        if (element.AddInId === this.addInConstants.Whirlpool.Id && element.IsCompleted === true) {
          this.isCollapsedHopsWhirl = !this.isCollapsedHopsWhirl;
          this.setClassHopsWhirl = true;
        }
      });
    }

    if (brew.AdjunctsDetails.length !== 0) {
      brew.AdjunctsDetails.map(element => {
        if (element.AddInId === this.addInConstants.Kettle.Id && element.IsCompleted === true) {
          this.isCollapsedAdjuncts = !this.isCollapsedAdjuncts;
          this.setClassAdjuncts = true;
        }
        if (element.AddInId === this.addInConstants.Whirlpool.Id && element.IsCompleted === true) {
          this.isCollapsedAdjunctsWhirl = !this.isCollapsedAdjunctsWhirl;
          this.setClassAdjunctsWhirl = true;
        }
      });
    }

    if (brew.PostBoilData.length !== 0) {
      brew.PostBoilData.map(element => {
        if (element.IsCompleted === true) {
          this.isCollapsedPostBoil = !this.isCollapsedPostBoil;
          this.setClassPostBoil = true;
        }
      });
    }

    if (brew.WhirlPoolDataEntry.length !== 0) {
      brew.WhirlPoolDataEntry.map(element => {
        if (element.IsCompleted === true) {
          this.isCollapsedWhirlpool = !this.isCollapsedWhirlpool;
          this.setClassWhirl = true;
        }
      });
    }

    if (brew.PostWhirlpoolDetails.length !== 0) {
      brew.PostWhirlpoolDetails.map(element => {
        if (element.IsCompleted === true) {
          this.isCollapsedPostWhirlpool = !this.isCollapsedPostWhirlpool;
          this.setClassPostWhirl = true;
        }
      });
    }

    if (brew.CoolingKnockouDetails.length !== 0) {
      brew.CoolingKnockouDetails.map(element => {
        if (element.IsCompleted === true) {
          this.isCollapsedCoolingKnockout = !this.isCollapsedCoolingKnockout;
          this.setClassCool = true;
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
