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
import { NbToastrService, NbLayoutScrollService } from '@nebular/theme';
import { addIn } from '../../../../models/addInConstants';
import { FormBuilder } from '@angular/forms';
import { Guid } from 'guid-typescript';
import { DatePipe } from '@angular/common';
import { String } from 'typescript-string-operations';
import { throwError } from 'rxjs/internal/observable/throwError';
import { Observable,of as observableOf } from 'rxjs';

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
  targetStartTime: any = '';
  max = new Date();
 

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
  brewLogAvailable:boolean;
  

  constructor(
    private dataService: DashboardService,
    private apiService: ApiProviderService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: NbToastrService,
    private formBuilder: FormBuilder,
    private datePipe: DatePipe,
    private scrolltop: NbLayoutScrollService,

  ) { }

  ngOnInit() {
    this.brewRunLog = new BrewRunLog();
    this.brewId = this.route.snapshot.paramMap.get('id');
    const userDetails = JSON.parse(sessionStorage.getItem('user'));
    this.tenantId = userDetails["userDetails"]["tenantId"];
    this.currentUser = userDetails["userDetails"]["userId"];
    this.brewerName = userDetails["userDetails"]["firstName"] + ' ' + userDetails["userDetails"]["lastName"];
    this.getBrewLogMasterDetails();
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
        this.getPreferenceUsed();
        
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
        this.brewLogAvailable = response['body']['brewLogAvailable']
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
        this.findUnits();

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
            let dateTime = this.timezone(hops.startTime).toString();
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
            let dateTime = this.timezone(adjuncts.startTime).toString();
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
   
    if(this.preference && this.units) {
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
  }

  getPreferenceUsed() {
    const getPreferenceSettingsAPI = String.Format(this.apiService.getPreferenceSettings, this.tenantId);
    this.apiService.getDataList(getPreferenceSettingsAPI).subscribe((response: any) => {
      if (response.status === 200) {
        this.preference = response['body']['preferenceSettings'];
        this.getBrewLogDetails();
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

    this.brewRunLog.hopesDetails.forEach((hop: HopesDetail) => {
      if (hop.addInId !== this.addInConstants.Fermentation.Id) {
        hop.startTime = hop.startTime.toString().split(' ').slice(0, 5).join(' ');
      }
    });
    this.brewRunLog.adjunctsDetails.forEach((adjunct: AdjunctsDetail) => {
      if (adjunct.addInId !== this.addInConstants.Fermentation.Id) {
        adjunct.startTime = adjunct.startTime.toString().split(' ').slice(0, 5).join(' ');
      }
    });
    this.saveData().subscribe(response => {
      this.router.navigate([url]);
    }, error => {
      this.toast.danger(error.error.message,'Try Again');
    });
  }

  addNewStyle() {
    const params = {
      id: Guid.raw(),
      name: this.modalForms.get('styleText').value,
      isActive: true,
      createdDate: '2019-12-16T06:55:05.243',
      modifiedDate: '2019-12-16T06:55:05.243',
      tenantId: this.tenantId,
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
      tenantId: this.tenantId,
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
      tenantId: this.tenantId,
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
    if (recipeContent.whirlpoolTarget.createdDate) {
      this.setTargetWhirlStart(recipeContent.whirlpoolTarget.createdDate);
    }
    this.whirlpoolTarget.push(recipeContent.whirlpoolTarget);
  }
  getPostWhirlpoolTargets(recipeContent: any) {
    this.postWhirlTarget.push(recipeContent.whirlpoolTarget);
  }
  getCoolingTargets(recipeContent: any) {
    this.coolTarget.push(recipeContent.coolingKnockoutTarget);
  }

  setVStart(i, start): any {
    this.vorlaufstartTime = this.timezone();
    this.vorlaufstartTime = this.vorlaufstartTime.toString().split(' ').slice(0, 5).join(' ');
    start.startTime = this.vorlaufstartTime;

  }

  setVEnd(i, end): any {
    this.vorlaufEndTime = this.timezone();
    this.vorlaufEndTime = this.vorlaufEndTime.toString().split(' ').slice(0, 5).join(' ');
    end.endTime = this.vorlaufEndTime;
  }

  setSpargeStart(i, start) {
    this.spargestartTime = this.timezone();
    this.spargestartTime = this.spargestartTime.toString().split(' ').slice(0, 5).join(' ');
    start.startTime = this.spargestartTime;
  }

  setSpargeEnd(i, end) {
    this.spargeEndTime = this.timezone();
    this.spargeEndTime = this.spargeEndTime.toString().split(' ').slice(0, 5).join(' ');
    end.endTime = this.spargeEndTime;
  }

  setKettleStart(i, start) {
    this.kettlestartTime = this.timezone();
    this.kettlestartTime = this.kettlestartTime.toString().split(' ').slice(0, 5).join(' ');
    start.startTime = this.kettlestartTime;
  }

  setKettleEnd(i, end) {

    this.kettleEndTime = this.timezone();
    this.kettleEndTime = this.kettleEndTime.toString().split(' ').slice(0, 5).join(' ');
    end.endTime = this.kettleEndTime;
  }

  setWhirlStart(i, start) {
    this.whirlstartTime = this.timezone();
    this.whirlstartTime = this.whirlstartTime.toString().split(' ').slice(0, 5).join(' ');
    start.startTime = this.whirlstartTime;
  }

  setTargetWhirlStart(dateTime) {
    this.targetStartTime = this.timezone(dateTime);
    this.targetStartTime = this.targetStartTime.toString().split(' ').slice(0, 5).join(' ');
    this.recipeContent.whirlpoolTarget.createdDate = this.targetStartTime;
  }

  setCoolStart(i, start) {

    this.coolstartTime = this.timezone();
    this.coolstartTime = this.coolstartTime.toString().split(' ').slice(0, 5).join(' ');
    start.startTime = this.coolstartTime;
  }

  setCoolEnd(i, end) {
    this.coolEndTime = this.timezone();
    this.coolEndTime = this.coolEndTime.toString().split(' ').slice(0, 5).join(' ');
    end.endTime = this.coolEndTime;
  }

  timezone(datetime?) {
    // Timezone convertion
    const preferedZone = this.preference.baseUtcOffset;
    if (preferedZone !== undefined && preferedZone !== null) {
      let zone = preferedZone.split(':');

      var date = (datetime != undefined) ? new Date(datetime) : new Date();
      var utc = new Date(date.getTime() + (date.getTimezoneOffset() * 60000));

      var hours = utc.getHours() + Number(zone[0]);
      var minutes = utc.getMinutes() + Number(zone[1]);
      var seconds = utc.getSeconds() + Number(zone[2]);

      return new Date(utc.setHours(hours,minutes,seconds));
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
    this.brewRunLog.vorlauf.map(element => {
       element.isCompleted = true;
     });
    this.saveData().subscribe(response => {
      this.setClass = true;
      }, error => {
        this.setClass = false;
        this.toast.danger(error.error.message,'Try Again');
    });
  }

  onSpargeComplete(i, editedSectionName) {
    this.isCollapsedSparge = !this.isCollapsedSparge;
    this.brewRunLog.spargeDetails.map(element => {
      element.isCompleted = true;
    });
    this.saveData().subscribe(response => {
        this.setClassSparge = true;
      }, error => {
        this.setClassSparge = false;
        this.toast.danger(error.error.message,'Try Again');
    });
  }

  onFirstRunComplete(i, editedSectionName) {
    this.isCollapsedFirstRun = !this.isCollapsedFirstRun;
    this.brewRunLog.firstRunnings.map(element => {
      element.isCompleted = true;
    });
   
    this.saveData().subscribe(response => {
      this.setClassFirst = true;
    }, error => {
      this.setClassFirst = false;
      this.toast.danger(error.error.message,'Try Again');
    });
  }

  onLastRunComplete(i, editedSectionName) {
    this.isCollapsedLastRun = !this.isCollapsedLastRun;
    this.brewRunLog.lastRunnings.map(element => {
      element.isCompleted = true;
    });
    this.saveData().subscribe(response => {
      this.setClassLast = true;
    }, error => {
      this.setClassLast = false;
      this.toast.danger(error.error.message,'Try Again');
    });
  }

  onKettleComplete(i, editedSectionName) {
    this.isCollapsedKettle = !this.isCollapsedKettle;
    this.brewRunLog.kettleDataEntryDetails.map(element => {
      element.isCompleted = true;
    });
    this.saveData().subscribe(response => {
      this.setClassKettle = true;
    }, error => {
      this.setClassKettle = false;
      this.toast.danger(error.error.message,'Try Again');
    });
  }

  onHopsCompleteKettle(editedSectionName) {
    this.isCollapsedHops = !this.isCollapsedHops;
    this.brewRunLog.hopesDetails.map(element => {
      if (element.addInId === this.addInConstants.Kettle.Id) {
        element.isCompleted = true;
      }
    });
   
    this.saveData().subscribe(response => {
      this.setClassHops = true;
    }, error => {
      this.setClassHops = false;
      this.toast.danger(error.error.message,'Try Again');
    });
  }

  onHopsCompleteWhirl(editedSectionName) {
    this.isCollapsedHopsWhirl = !this.isCollapsedHopsWhirl;
    this.brewRunLog.hopesDetails.map(element => {
      if (element.addInId === this.addInConstants.Whirlpool.Id) {
        element.isCompleted = true;
      }
    });
    
    this.saveData().subscribe(response => {
      this.setClassHopsWhirl = true;
    }, error => {
      this.setClassHopsWhirl = false;
      this.toast.danger(error.error.message,'Try Again');
    });
  }

  onAdjunctsCompleteKettle(editedSectionName) {
    this.isCollapsedAdjuncts = !this.isCollapsedAdjuncts;
    this.brewRunLog.adjunctsDetails.map(element => {
      if (element.addInId === this.addInConstants.Kettle.Id) {
        element.isCompleted = true;
      }
    });
    this.saveData().subscribe(response => {
      this.setClassAdjuncts = true;
    }, error => {
      this.setClassAdjuncts = false;
      this.toast.danger(error.error.message,'Try Again');
    });
  }

  onAdjunctsCompleteWhirl(editedSectionName) {
    this.isCollapsedAdjunctsWhirl = !this.isCollapsedAdjunctsWhirl;
    this.brewRunLog.adjunctsDetails.map(element => {
      if (element.addInId === this.addInConstants.Whirlpool.Id) {
        element.isCompleted = true;
      }
    });
    this.saveData().subscribe(response => {
      this.setClassAdjunctsWhirl = true;
    }, error => {
      this.setClassAdjunctsWhirl = false;
      this.toast.danger(error.error.message,'Try Again');
    });
  }

  onPostBoilComplete(i, editedSectionName) {
    this.isCollapsedPostBoil = !this.isCollapsedPostBoil;
    this.brewRunLog.postBoilData.map(element => {
      element.isCompleted = true;
    });
    
    this.saveData().subscribe(response => {
      this.setClassPostBoil = true;
    }, error => {
      this.setClassPostBoil = false;
      this.toast.danger(error.error.message,'Try Again');
    });
  }

  onWhirlpoolComplete(i, editedSectionName) {
    this.isCollapsedWhirlpool = !this.isCollapsedWhirlpool;
    this.brewRunLog.whirlPoolDataEntry.map(element => {
      element.isCompleted = true;
    });
    
    this.saveData().subscribe(response => {
      this.setClassWhirl = true;
    }, error => {
      this.setClassWhirl = false;
      this.toast.danger(error.error.message,'Try Again');
    });
  }

  onPostWhirlComplete(i, editedSectionName) {
    this.isCollapsedPostWhirlpool = !this.isCollapsedPostWhirlpool;
    this.brewRunLog.postWhirlpoolDetails.map(element => {
      element.isCompleted = true;
    });
    
    this.saveData().subscribe(response => {
      this.setClassPostWhirl = true;
    }, error => {
      this.setClassPostWhirl = false;
      this.toast.danger(error.error.message,'Try Again');
    });
  }

  onCoolingComplete(i, editedSectionName) {
    this.isCollapsedCoolingKnockout = !this.isCollapsedCoolingKnockout;
    this.brewRunLog.coolingKnockouDetails.map(element => {
      element.isCompleted = true;
    });
    this.saveData().subscribe(response => {
      this.setClassCool = true;
    }, error => {
      this.setClassCool = false;
      this.toast.danger(error.error.message,'Try Again');
    });
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

  saveData(): Observable<boolean>{
    const brewLogAPI = String.Format(this.apiService.getBrewLogDetails, this.tenantId,this.brewId);
    if (!this.brewLogAvailable) {
        this.apiService.postData(brewLogAPI, this.brewRunLog).subscribe(response => {
          this.brewLogAvailable = response['body']['brewLogAvailable'];
          return observableOf(true);
        }, error => {
        return throwError(error);
      });
    }
    else {
       this.apiService.putData(brewLogAPI, this.brewRunLog).subscribe(response => {
        this.brewLogAvailable =  response['body']['brewLogAvailable'];
        return observableOf(true);
        }, error => {
          return throwError(error);
      });
    }
    return observableOf(false);
  }
  gotoTop() {
    this.scrolltop.scrollTo(0, 0);
  }

}
