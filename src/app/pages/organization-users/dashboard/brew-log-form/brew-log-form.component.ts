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
  BrewRunLog, Vorlauf, SpargeDetail, FirstRunning, LastRunning, KettleDataEntryDetail, HopesDetail,
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

  brewRunLog: BrewRunLog;

  vorlaufstartTime: any = '';
  vorlaufEndTime: any = '';
  spargestartTime: any = '';
  spargeEndTime: any = '';
  kettlestartTime: any = '';
  kettleEndTime: any = '';
  whirlstartTime: any = '';
  coolstartTime: any = '';
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
  brewerName : string;

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
    this.brewRunLog = new BrewRunLog();
    this.brewId = this.route.snapshot.paramMap.get('id');
    const userDetails = JSON.parse(sessionStorage.getItem('user'));
    
    this.tenantId = userDetails["userDetails"]["tenantId"];
    this.currentUser = userDetails["userDetails"]["userId"];
    this.brewerName = userDetails["userDetails"]["firstName"] + ' ' + userDetails["userDetails"]["lastName"];
    this.getPreferenceUsed();
    this.getBrewLogMasterDetails();
    this.getBrewLogDetails();
    
  
  }
  getBrewLogMasterDetails()
  {
    const getBrewDetailsMasterAPI = String.Format(this.apiService.getBrewLogMasterDetails, this.tenantId);
    this.apiService.getDataList(getBrewDetailsMasterAPI).subscribe(response => {
      if (response) {
        this.countries = response['body']['brewLogMasterDetails']['countries'];
        this.addins = response['body']['brewLogMasterDetails']['addIns'];
        this.suppliers = response['body']['brewLogMasterDetails']['suppliers'];
        this.maltTypes = response['body']['brewLogMasterDetails']['maltGrainTypes'];
        this.styles = response['body']['brewLogMasterDetails']['styles'];
        this.units = response['body']['brewLogMasterDetails']['units']
        
        this.findUnits();
        
      }
    });
  }

  /**
   * Function to get single brew
   * @param tenantId
   * @param brewId
   */
  getBrewLogDetails() {

    const getBrewLogDetailsAPI = String.Format(this.apiService.getBrewLogDetails, this.tenantId,this.brewId);
  
    this.apiService.getDataByQueryParams(getBrewLogDetailsAPI, null, this.tenantId, this.brewId).subscribe(response => {
      if (response.status === 200) {
        this.brewRunLog = response['body']['brewRunLog'];

        this.recipeContent = response['body']['recipe'];
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
        this.brewRunLog.hopesDetails.forEach(element => {
          if (element.addInId === '255ce5b1-4b1a-4da8-b269-5a0b81d9db23') {
            this.addInHopsKettle.push(element);
          }
          if (element.addInId === '16818dea-3f57-49b7-96eb-5f6ffdc90120') {
            this.addInHopsWhirlpool.push(element);
          }
        });
        this.brewRunLog.adjunctsDetails.forEach(element => {
          if (element.addInId === '255ce5b1-4b1a-4da8-b269-5a0b81d9db23') {
            this.addInAdjunctsKettle.push(element);
          }
          if (element.addInId === '16818dea-3f57-49b7-96eb-5f6ffdc90120') {
            this.addInAdjunctsWhirlpool.push(element);
          }
        });

        if (this.brewRunLog.vorlauf.length == 0) {
          this.brewRunLog.vorlauf.push(new Vorlauf());
        } else {
          this.brewRunLog.vorlauf.map((vorlaufTime: Vorlauf) => {
            vorlaufTime.startTime = this.datePipe.transform(vorlaufTime.startTime, 'E, dd LLL yyyy HH:mm:ss');
            vorlaufTime.endTime = this.datePipe.transform(vorlaufTime.endTime, 'E, dd LLL yyyy HH:mm:ss');
          })
        }
        if (this.brewRunLog.spargeDetails.length == 0) {
          this.brewRunLog.spargeDetails.push(new SpargeDetail());
        } else {
          this.brewRunLog.spargeDetails.map((spargestartTimes: SpargeDetail) => {
            spargestartTimes.startTime = this.datePipe.transform(spargestartTimes.startTime, 'E, dd LLL yyyy HH:mm:ss');
            spargestartTimes.endTime = this.datePipe.transform(spargestartTimes.endTime, 'E, dd LLL yyyy HH:mm:ss');
          })
        }
        if (this.brewRunLog.firstRunnings.length == 0) {
          this.brewRunLog.firstRunnings.push(new FirstRunning());
        }
        if (this.brewRunLog.lastRunnings.length == 0) {
          this.brewRunLog.lastRunnings.push(new LastRunning());
        }
        if (this.brewRunLog.kettleDataEntryDetails.length == 0) {
          this.brewRunLog.kettleDataEntryDetails.push(new KettleDataEntryDetail());
        } else {
          this.brewRunLog.kettleDataEntryDetails.map((kettleTimes: KettleDataEntryDetail) => {
            kettleTimes.startTime = this.datePipe.transform(kettleTimes.startTime, 'E, dd LLL yyyy HH:mm:ss');
            kettleTimes.endTime = this.datePipe.transform(kettleTimes.endTime, 'E, dd LLL yyyy HH:mm:ss');
          })
        }
        if (this.brewRunLog.hopesDetails.length == 0) {
          this.brewRunLog.hopesDetails.push(new HopesDetail());
        }
        this.brewRunLog.hopesDetails.map((hops: HopesDetail, i) => {
          if (hops.addInId !== this.addInConstants.Fermentation.Id) {
            if (hops.startTime === null) {
              hops.startTime = new Date();
            }
            let dateTime = this.timezone(new Date(hops.startTime).toUTCString());
            dateTime = dateTime.split(' ').slice(0, 5).join(' ');
            hops.startTime = new Date(dateTime);
          }
        });

        if (this.brewRunLog.adjunctsDetails.length == 0) {
          this.brewRunLog.adjunctsDetails.push(new AdjunctsDetail());
        }
        this.brewRunLog.adjunctsDetails.map((adjuncts: AdjunctsDetail, i) => {
          if (adjuncts.addInId !== this.addInConstants.Fermentation.Id) {
            if (adjuncts.startTime === null) {
              adjuncts.startTime = new Date();
            }
            let dateTime = this.timezone(new Date(adjuncts.startTime).toUTCString());
            dateTime = dateTime.split(' ').slice(0, 5).join(' ');
            adjuncts.startTime = new Date(dateTime);
          }
        });

        if (this.brewRunLog.postBoilData.length == 0) {
          this.brewRunLog.postBoilData.push(new PostBoilData());
        }
        if (this.brewRunLog.whirlPoolDataEntry.length == 0) {
          this.brewRunLog.whirlPoolDataEntry.push(new WhirlPoolDataEntry());
        } else {
          this.brewRunLog.whirlPoolDataEntry.map((whrilTimes: WhirlPoolDataEntry) => {
            whrilTimes.startTime = this.datePipe.transform(whrilTimes.startTime, 'E, dd LLL yyyy HH:mm:ss');
          })
        }
        if (this.brewRunLog.postWhirlpoolDetails.length == 0) {
          this.brewRunLog.postWhirlpoolDetails.push(new PostWhirlpoolDetail());
        }
        if (this.brewRunLog.coolingKnockouDetails.length == 0) {
          this.brewRunLog.coolingKnockouDetails.push(new CoolingKnockouDetail());
        } else {
          this.brewRunLog.coolingKnockouDetails.map((coolTimes: CoolingKnockouDetail) => {
            coolTimes.startTime = this.datePipe.transform(coolTimes.startTime, 'E, dd LLL yyyy HH:mm:ss');
            coolTimes.endTime = this.datePipe.transform(coolTimes.endTime, 'E, dd LLL yyyy HH:mm:ss');
          })
        }
        if (this.brewRunLog.brewLogDetailsNotes.length == 0) {
          this.brewRunLog.brewLogDetailsNotes.push(new BrewLogDetailsNote());
        }
        this.checkIfComplete(this.brewRunLog);
      }
    });
  }



  findUnits() {
    console.log(this.units);
    this.units.forEach(element => {
      if (element.Id === this.preference.temperatureId) {
        this.preferedUnit = element.Symbol;
      }
      if (element.Id === this.preference.gravityMeasurementId) {
        this.preferedPlato = element.Name;
        this.platoUnitId = element.Id;
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
    this.brewRunLog.vorlauf.forEach((vorlauf: Vorlauf) => {
      vorlauf.tenantId = this.tenantId;
    });
    this.brewRunLog.spargeDetails.forEach((sparge: SpargeDetail) => {
      sparge.tenantId = this.tenantId;
    });
    this.brewRunLog.firstRunnings.forEach((firstrun: FirstRunning) => {
      firstrun.tenantId = this.tenantId;
    });
    this.brewRunLog.lastRunnings.forEach((lastrun: LastRunning) => {
      lastrun.tenantId = this.tenantId;
    });
    this.brewRunLog.kettleDataEntryDetails.forEach((kettle: KettleDataEntryDetail) => {
      kettle.tenantId = this.tenantId;
    });
    this.brewRunLog.hopesDetails.forEach((hop: HopesDetail) => {
      hop.tenantId = this.tenantId;
      if (hop.addInId !== this.addInConstants.Fermentation.Id) {
        const dateTime2 = hop.startTime.toString().split(' ').slice(0, 5).join(' ');
        const timeZone = JSON.parse(sessionStorage.preferenceUsed);
        const preferedZone = timeZone.BaseUtcOffset;
        let zone = preferedZone.replace(/:/gi, '');
        zone = zone.slice(0, -2);
        const newDateTime = dateTime2 + ' GMT' + `${zone}`;
        hop.startTime = new Date(newDateTime).toLocaleString();
      }
    });
    this.brewRunLog.adjunctsDetails.forEach((adjunct: AdjunctsDetail) => {
      adjunct.tenantId = this.tenantId;
      if (adjunct.addInId !== this.addInConstants.Fermentation.Id) {
        const dateTime2 = adjunct.startTime.toString().split(' ').slice(0, 5).join(' ');
        const timeZone = JSON.parse(sessionStorage.preferenceUsed);
        const preferedZone = timeZone.BaseUtcOffset;
        let zone = preferedZone.replace(/:/gi, '');
        zone = zone.slice(0, -2);
        const newDateTime = dateTime2 + ' GMT' + `${zone}`;
        adjunct.startTime = new Date(newDateTime).toLocaleString();
      }
    });
    this.brewRunLog.postBoilData.forEach((postboil: PostBoilData) => {
      postboil.tenantId = this.tenantId;
    });
    this.brewRunLog.whirlPoolDataEntry.forEach((whirlpool: WhirlPoolDataEntry) => {
      whirlpool.tenantId = this.tenantId;

    });
    this.brewRunLog.postWhirlpoolDetails.forEach((postwhirlpool: PostWhirlpoolDetail) => {
      postwhirlpool.tenantId = this.tenantId;
    });
    this.brewRunLog.brewLogDetailsNotes.forEach((note: BrewLogDetailsNote) => {
      note.tenantId = this.tenantId;
    });
    this.brewRunLog.coolingKnockouDetails.forEach((cool: CoolingKnockouDetail) => {
      cool.tenantId = this.tenantId;

    });



    this.apiService.postData(this.apiService.addBrewRun, this.brewRunLog).subscribe(response => {
      if (response) {

        this.router.navigate([url]);
      }
    }, error => {
      this.toast.danger(error.error.Message);
    });
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

  
  getVorlaufTargets(recipeContent: any) {
    this.vorlaufTarget = recipeContent.MaltGrainBill;
  }
  getSpargeTargets(recipeContent: any) {
    if (recipeContent.sparges.length !== 0) {
      recipeContent.sparges.forEach(element => {
        this.spargeTarget.push(element);
      });
    }
  }
  getHopsTargets(recipeContent: any) {
    if (recipeContent.hops.length !== 0) {
      this.hopsTargetKettle = recipeContent.hops.filter(x => x.addInId === this.addInConstants.Kettle.Id);
      this.hopsTargetWhirl = recipeContent.hops.filter(x => x.addInId === this.addInConstants.Whirlpool.Id);
    }

  }
  getAdjunctsTargets(recipeContent: any) {
    if (recipeContent.adjuncts.length !== 0) {
      this.adjunctsTargetKettle = recipeContent.adjuncts.filter(x => x.addInId === this.addInConstants.Kettle.Id);
      this.adjunctsTargetWhirl = recipeContent.adjuncts.filter(x => x.addInId === this.addInConstants.Whirlpool.Id);
    }
  }
  getKettleTargets(recipeContent: any) {
    this.kettleTarget.push(recipeContent.kettleTargets);
  }
  getFirstRunTargets(recipeContent: any) {
    this.firstRunTarget = recipeContent.sparges;
  }
  getLastRunTargets(recipeContent: any) {
    this.lastRunTarget = recipeContent.sparges;
  }
  getPostTargets(recipeContent: any) {
    this.postTarget = recipeContent.maltGrainBills;
  }
  getWhirlpoolTargets(recipeContent: any) {
    this.whirlpoolTarget.push(recipeContent.whirlpoolTarget);
  }
  getPostWhirlpoolTargets(recipeContent: any) {
    this.postWhirlTarget.push(recipeContent.whirlpoolTarget);
  }
  getCoolingTargets(recipeContent: any) {
    this.coolTarget.push(recipeContent.coolingKnockoutTarget);
  }

  setVStart(i, start): any {
    this.vorlaufstartTime = this.timezone(new Date().toUTCString());
    this.vorlaufstartTime = this.vorlaufstartTime.split(' ').slice(0, 5).join(' ');
    start.startTime = this.vorlaufstartTime;

  }

  setVEnd(i, end): any {
    this.vorlaufEndTime = this.timezone(new Date().toUTCString());
    this.vorlaufEndTime = this.vorlaufEndTime.split(' ').slice(0, 5).join(' ');
    end.EndTime = this.vorlaufEndTime;
  }

  setSpargeStart(i, start) {
    this.spargestartTime = this.timezone(new Date().toUTCString());
    this.spargestartTime = this.spargestartTime.split(' ').slice(0, 5).join(' ');
    start.startTime = this.spargestartTime;
  }

  setSpargeEnd(i, end) {
    this.spargeEndTime = this.timezone(new Date().toUTCString());
    this.spargeEndTime = this.spargeEndTime.split(' ').slice(0, 5).join(' ');
    end.EndTime = this.spargeEndTime;
  }

  setKettleStart(i, start) {
    this.kettlestartTime = this.timezone(new Date().toUTCString());
    this.kettlestartTime = this.kettlestartTime.split(' ').slice(0, 5).join(' ');
    start.startTime = this.kettlestartTime;
  }

  setKettleEnd(i, end) {

    this.kettleEndTime = this.timezone(new Date().toUTCString());
    this.kettleEndTime = this.kettleEndTime.split(' ').slice(0, 5).join(' ');
    end.EndTime = this.kettleEndTime;
  }

  setWhirlStart(i, start) {
    this.whirlstartTime = this.timezone(new Date().toUTCString());
    this.whirlstartTime = this.whirlstartTime.split(' ').slice(0, 5).join(' ');
    start.startTime = this.whirlstartTime;
  }

  setCoolStart(i, start) {

    this.coolstartTime = this.timezone(new Date().toUTCString());
    this.coolstartTime = this.coolstartTime.split(' ').slice(0, 5).join(' ');
    start.startTime = this.coolstartTime;
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
    const specials = this.brewRunLog.adjunctsDetails.filter(x => x.addInId === this.addInConstants.Whirlpool.Id);
    specials.forEach((adj: AdjunctsDetail, i: number) => {
      if (adj.id === uid) {
        count = i + 1;
      }
    });
    return count;
  }

  getAdjCountKettle(uid: string): number {
    let count = 1;
    const specials = this.brewRunLog.adjunctsDetails.filter(x => x.addInId === this.addInConstants.Kettle.Id);
    specials.forEach((adj: AdjunctsDetail, i: number) => {
      if (adj.id === uid) {
        count = i + 1;
      }
    });
    return count;
  }

  getAdjCountWhirlTargets(uid: string): number {
    let count = 1;
    const specials = this.recipeContent.adjuncts.filter(x => x.addInId === this.addInConstants.Whirlpool.Id);
    specials.forEach((adj, i: number) => {
      if (adj.id === uid) {
        count = i + 1;
      }
    });
    return count;
  }

  getAdjCountKettleTargets(uid: string): number {
    let count = 1;
    const specials = this.recipeContent.adjuncts.filter(x => x.addInId === this.addInConstants.Kettle.Id);
    specials.forEach((adj, i: number) => {
      if (adj.id === uid) {
        count = i + 1;
      }
    });
    return count;
  }

  getHopsCountWhirl(uid: string): number {
    let count = 1;
    const specials = this.brewRunLog.hopesDetails.filter(x => x.addInId === this.addInConstants.Whirlpool.Id);
    specials.forEach((hop: HopesDetail, i: number) => {
      if (hop.id === uid) {
        count = i + 1;
      }
    });
    return count;
  }

  getHopsCountKettle(uid: string): number {
    let count = 1;
    const specials = this.brewRunLog.hopesDetails.filter(x => x.addInId === this.addInConstants.Kettle.Id);
    specials.forEach((hop: HopesDetail, i: number) => {
      if (hop.id === uid) {
        count = i + 1;
      }
    });
    return count;
  }

  getHopsCountWhirlTargets(uid: string): number {
    let count = 1;
    const specials = this.recipeContent.hops.filter(x => x.addInId === this.addInConstants.Whirlpool.Id);
    specials.forEach((hop, i: number) => {
      if (hop.Id === uid) {
        count = i + 1;
      }
    });
    return count;
  }

  getHopsCountKettleTarget(uid: string): number {
    let count = 1;
    const specials = this.recipeContent.hops.filter(x => x.addInId === this.addInConstants.Kettle.Id);
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
    this.brewRunLog.vorlauf[i].isCompleted = true;
    this.setClass = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onSpargeComplete(i, editedSectionName) {
    this.isCollapsedSparge = !this.isCollapsedSparge;
    this.brewRunLog.spargeDetails[0].isCompleted = true;
    this.setClassSparge = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onFirstRunComplete(i, editedSectionName) {
    this.isCollapsedFirstRun = !this.isCollapsedFirstRun;
    this.brewRunLog.firstRunnings[i].isCompleted = true;
    this.setClassFirst = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onLastRunComplete(i, editedSectionName) {
    this.isCollapsedLastRun = !this.isCollapsedLastRun;
    this.brewRunLog.lastRunnings[i].isCompleted = true;
    this.setClassLast = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onKettleComplete(i, editedSectionName) {
    this.isCollapsedKettle = !this.isCollapsedKettle;
    this.brewRunLog.kettleDataEntryDetails[i].isCompleted = true;
    this.setClassKettle = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onHopsCompleteKettle(editedSectionName) {
    this.isCollapsedHops = !this.isCollapsedHops;
    this.brewRunLog.hopesDetails.map(element => {
      if (element.addInId === this.addInConstants.Kettle.Id) {
        element.isCompleted = true;
      }
    });
    this.setClassHops = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onHopsCompleteWhirl(editedSectionName) {
    this.isCollapsedHopsWhirl = !this.isCollapsedHopsWhirl;
    this.brewRunLog.hopesDetails.map(element => {
      if (element.addInId === this.addInConstants.Whirlpool.Id) {
        element.isCompleted = true;
      }
    });
    this.setClassHopsWhirl = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onAdjunctsCompleteKettle(editedSectionName) {
    this.isCollapsedAdjuncts = !this.isCollapsedAdjuncts;
    this.brewRunLog.adjunctsDetails.map(element => {
      if (element.addInId === this.addInConstants.Kettle.Id) {
        element.isCompleted = true;
      }
    });
    this.setClassAdjuncts = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onAdjunctsCompleteWhirl(editedSectionName) {
    this.isCollapsedAdjunctsWhirl = !this.isCollapsedAdjunctsWhirl;
    this.brewRunLog.adjunctsDetails.map(element => {
      if (element.addInId === this.addInConstants.Whirlpool.Id) {
        element.isCompleted = true;
      }
    });
    this.setClassAdjunctsWhirl = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onPostBoilComplete(i, editedSectionName) {
    this.isCollapsedPostBoil = !this.isCollapsedPostBoil;
    this.brewRunLog.postBoilData[i].isCompleted = true;
    this.setClassPostBoil = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onWhirlpoolComplete(i, editedSectionName) {
    this.isCollapsedWhirlpool = !this.isCollapsedWhirlpool;
    this.brewRunLog.whirlPoolDataEntry[i].isCompleted = true;
    this.setClassWhirl = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onPostWhirlComplete(i, editedSectionName) {
    this.isCollapsedPostWhirlpool = !this.isCollapsedPostWhirlpool;
    this.brewRunLog.postWhirlpoolDetails[i].isCompleted = true;
    this.setClassPostWhirl = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  onCoolingComplete(i, editedSectionName) {
    this.isCollapsedCoolingKnockout = !this.isCollapsedCoolingKnockout;
    this.brewRunLog.coolingKnockouDetails[i].isCompleted = true;
    this.setClassCool = true;
    this.addbrewUserAuditTrail(editedSectionName);
  }

  checkIfComplete(brewRunLog: BrewRunLog) {

    if (brewRunLog.vorlauf.length !== 0) {
      brewRunLog.vorlauf.map(element => {
        if (element.isCompleted === true) {
          this.isCollapsedVorlauf = !this.isCollapsedVorlauf;
          this.setClass = true;
        }
      });
    }

    if (brewRunLog.spargeDetails.length !== 0) {
      brewRunLog.spargeDetails.map(element => {
        if (element.isCompleted === true) {
          this.isCollapsedSparge = !this.isCollapsedSparge;
          this.setClassSparge = true;
        }
      });
    }

    if (brewRunLog.firstRunnings.length !== 0) {
      brewRunLog.firstRunnings.map(element => {
        if (element.isCompleted === true) {
          this.isCollapsedFirstRun = !this.isCollapsedFirstRun;
          this.setClassFirst = true;
        }
      });
    }

    if (brewRunLog.lastRunnings.length !== 0) {
      brewRunLog.lastRunnings.map(element => {
        if (element.isCompleted === true) {
          this.isCollapsedLastRun = !this.isCollapsedLastRun;
          this.setClassLast = true;
        }
      });
    }

    if (brewRunLog.kettleDataEntryDetails.length !== 0) {
      brewRunLog.kettleDataEntryDetails.map(element => {
        if (element.isCompleted === true) {
          this.isCollapsedKettle = !this.isCollapsedKettle;
          this.setClassKettle = true;
        }
      });
    }

    if (brewRunLog.hopesDetails.length !== 0) {
      brewRunLog.hopesDetails.map(element => {
        if (element.addInId === this.addInConstants.Kettle.Id && element.isCompleted === true) {
          this.isCollapsedHops = !this.isCollapsedHops;
          this.setClassHops = true;
        }
        if (element.addInId === this.addInConstants.Whirlpool.Id && element.isCompleted === true) {
          this.isCollapsedHopsWhirl = !this.isCollapsedHopsWhirl;
          this.setClassHopsWhirl = true;
        }
      });
    }

    if (brewRunLog.adjunctsDetails.length !== 0) {
      brewRunLog.adjunctsDetails.map(element => {
        if (element.addInId === this.addInConstants.Kettle.Id && element.isCompleted === true) {
          this.isCollapsedAdjuncts = !this.isCollapsedAdjuncts;
          this.setClassAdjuncts = true;
        }
        if (element.addInId === this.addInConstants.Whirlpool.Id && element.isCompleted === true) {
          this.isCollapsedAdjunctsWhirl = !this.isCollapsedAdjunctsWhirl;
          this.setClassAdjunctsWhirl = true;
        }
      });
    }

    if (brewRunLog.postBoilData.length !== 0) {
      brewRunLog.postBoilData.map(element => {
        if (element.isCompleted === true) {
          this.isCollapsedPostBoil = !this.isCollapsedPostBoil;
          this.setClassPostBoil = true;
        }
      });
    }

    if (brewRunLog.whirlPoolDataEntry.length !== 0) {
      brewRunLog.whirlPoolDataEntry.map(element => {
        if (element.isCompleted === true) {
          this.isCollapsedWhirlpool = !this.isCollapsedWhirlpool;
          this.setClassWhirl = true;
        }
      });
    }

    if (brewRunLog.postWhirlpoolDetails.length !== 0) {
      brewRunLog.postWhirlpoolDetails.map(element => {
        if (element.isCompleted === true) {
          this.isCollapsedPostWhirlpool = !this.isCollapsedPostWhirlpool;
          this.setClassPostWhirl = true;
        }
      });
    }

    if (brewRunLog.coolingKnockouDetails.length !== 0) {
      brewRunLog.coolingKnockouDetails.map(element => {
        if (element.isCompleted === true) {
          this.isCollapsedCoolingKnockout = !this.isCollapsedCoolingKnockout;
          this.setClassCool = true;
        }
      });
    }
  }

  addbrewUserAuditTrail(editedSectionName) {
    const params = {
      Id: this.brewRunLog.id,
      BrewRunId: this.brewRunLog.brewRunId,
      CreatedByUserId: this.currentUser,
      tenantId: this.brewRunLog.tenantId,
      CurrentEditedSectionName: editedSectionName,
    };
    this.apiService.postData(this.apiService.addBrewUserAuditTrail, params).subscribe((response: any) => {
    }, error => {
      console.log(error);
    });
  }

}
