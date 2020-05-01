import { Component, OnInit } from '@angular/core';
import {
  BrewRun, MaltGrainBillDetail, WaterAdditionDetail, MashingTargetDetail, StartchTest, MashinDetailsNote, MashingTargetDetailsTemperature,
  FermentationDetailsNote, FermentationDataEntry, YeastDataDetail, DiacetylRestDataDetail, AgingDetail,
  EnterFermentationData, Vorlauf, SpargeDetail, FirstRunning, LastRunning, KettleDataEntryDetail, HopesDetail, AdjunctsDetail,
  PostBoilData, WhirlPoolDataEntry, PostWhirlpoolDetail, CoolingKnockouDetail, BrewLogDetailsNote, ConditioningDetail, FilterationDetail,
  CarbonationDetail, ConditioningDetailsNote, BrewRunCompletionDetail
} from '../../../../models/brewrun';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NbToastrService, NbLayoutScrollService } from '@nebular/theme';
import { DataService } from '../../../../data.service';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { String } from 'typescript-string-operations';


@Component({
  selector: 'app-view-reports',
  templateUrl: './view-reports.component.html',
  styleUrls: ['./view-reports.component.scss'],
})
export class ViewReportsComponent implements OnInit {
  brew: BrewRun;
  brewId: string;
  tenantId: any;
  units: any;
  currentBrewId: string;
  currentTenantName: any;
  addressOne = '';
  addressTwo: any;
  city = '';
  country = '';
  postalCode = '';
  state = '';
  styles: any;
  addins: any;
  countries: any;
  maltTypes: any;
  suppliers: any;
  maltNames: any;
  preference: any;
  preferedUnit: any;
  recipeId: any;
  kettleAdjuncts = [];
  whirlpoolAdjunct = [];
  fermentAdjuncts = [];
  kettleHops = [];
  whirlpoolHops = [];
  fermentHops = [];
  brewContent: any;
  message: string;
  fermentaionContent: any;
  tenantLogo: any;
  statusField = '';
  preferedPlato: any;
  platoUnitId: any;
  maltGrainBillDetailsCompletion: BrewRunCompletionDetail;
  waterAdditionsCompletion: BrewRunCompletionDetail;
  mashinDetailsCompletion: BrewRunCompletionDetail;
  spargeDetailsCompletion: BrewRunCompletionDetail;
  kettleDataCompletion: BrewRunCompletionDetail;
  kettleHopeCompletion: BrewRunCompletionDetail;
  kettleAdjunctDetailsCompletion: BrewRunCompletionDetail;
  whirlPoolDetailsCompletion: BrewRunCompletionDetail;
  whirlPoolHopeCompletion: BrewRunCompletionDetail;
  whirlPoolAdjunctDetailsCompletion: BrewRunCompletionDetail;
  fermentationDataEntryCompletion: BrewRunCompletionDetail;
  fermentationHopDetailsCompletion: BrewRunCompletionDetail;
  fermentationAdjunctDetailsCompletion: BrewRunCompletionDetail;
  coolingKnockOutDetailsCompletion: BrewRunCompletionDetail;
  enterFermentationDataCompletion: BrewRunCompletionDetail;
  conditionDetailsCompletion: BrewRunCompletionDetail;
  filterationDetailsCompletion: BrewRunCompletionDetail;
  carbonationDetailsCompletion: BrewRunCompletionDetail;
  userDetails: any;

  constructor(
    private apiService: ApiProviderService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: NbToastrService,
    private scrolltop: NbLayoutScrollService,
    private dataService: DataService,
  ) {
  }

  ngOnInit() {
    this.dataService.currentMessage.subscribe(message => this.message = message);
    this.brewContent = this.message;
    this.brew = new BrewRun();
    this.brewId = this.route.snapshot.paramMap.get('id');


    this.statusCheck();
    this.userDetails = sessionStorage.user;
    const user = JSON.parse(this.userDetails);
    this.tenantId = user['userDetails'].tenantId;
    const company = user['userDetails'].companyName;
    this.getUnits();
    if (company.Name !== '' && company.Name !== null) {
      this.currentTenantName = company.Name;
    }
    if (company.Address1 !== '' && company.Address1 !== null) {
      this.addressOne = company.Address1 + ' ,';
    }
    if (company.City !== '' && company.City !== null) {
      this.city = company.City + ' ,';
    }
    if (company.State !== '' && company.State !== null) {
      this.state = company.State;
    }
    if (company.Country !== '' && company.Country !== '') {
      this.country = company.Country + ' ,';
    }
    if (company.Postalcode !== '' && company.Postalcode !== null) {
      this.postalCode = 'Postalcode - ' + company.Postalcode;
    }
    this.tenantLogo = user['userDetails'].imageUrl;
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

  statusCheck() {
    if (this.brewContent !== 'default message') {
      this.brewContent.forEach(element => {
        if (element.id === this.brewId) {
          if (element.status === '7cd88ffb-cf41-4efc-9a17-d75bcb5b3770') {
            this.statusField = 'Not Started';
          } else if (element.status === '4267ae2f-4b7f-4a70-a592-878744a13900') {
            this.statusField = 'Committed';
          } else if (element.status === '9231c5f1-2235-4f7b-b5e6-80694333dd72') {
            this.statusField = 'Completed';
          } else {
            this.statusField = 'Progress';
          }
        }

      });
    }
  }
  getCountries() {
    this.apiService.getDataList(this.apiService.getAllActiveCountry).subscribe(response => {
      if (response) {
        this.countries = response['body'].countrybase;
        sessionStorage.setItem('countries', JSON.stringify(this.countries));
      }
    });
  }

  getUnits() {
    const getUnitsApi = String.Format(this.apiService.getAllActiveUnitType);
    this.apiService.getDataList(getUnitsApi).subscribe(response => {
      if (response) {
        this.units = response['body'].unitTypes;
      }
    })
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
    if (this.units) {
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

  getSingleBrewDetails(tenantId, brewId) {
    this.apiService.getDataByQueryParams(this.apiService.getBrewRunById, null, tenantId, brewId).subscribe(response => {
      if (response.status === 200) {

        this.brew = response['body'];

        this.currentBrewId = this.brew.brewRunId;
        this.recipeId = response['body'].RecipeId;

        this.maltGrainBillDetailsCompletion = this.isCompleted("MaltGrainBill");
        this.waterAdditionsCompletion = this.isCompleted("Water Additions");
        this.mashinDetailsCompletion = this.isCompleted("Mashing");
        this.spargeDetailsCompletion = this.isCompleted("Sparge");
        this.kettleDataCompletion = this.isCompleted("Kettle Data Entry");
        this.kettleHopeCompletion = this.isCompleted("Kettle Hopes");
        this.kettleAdjunctDetailsCompletion = this.isCompleted("Kettle Adjuncts");
        this.whirlPoolDetailsCompletion = this.isCompleted("Whirlpool Data Entry");
        this.whirlPoolHopeCompletion = this.isCompleted("Whirlpool Hopes");
        this.whirlPoolAdjunctDetailsCompletion = this.isCompleted("Whirlpool Adjuncts");
        this.fermentationDataEntryCompletion = this.isCompleted("Fermentation Data Entry");
        this.fermentationHopDetailsCompletion = this.isCompleted("Fermentation Hopes");
        this.fermentationAdjunctDetailsCompletion = this.isCompleted("Fermentation Adjuncts");
        this.coolingKnockOutDetailsCompletion = this.isCompleted("Cooling - Knockout Data Entry");
        this.enterFermentationDataCompletion = this.isCompleted("Enter Fermentation Data");
        this.conditionDetailsCompletion = this.isCompleted("Conditioning Data Entry");
        this.filterationDetailsCompletion = this.isCompleted("Filtration Data Entry");
        this.carbonationDetailsCompletion = this.isCompleted("Carbonation Data Entry");


        if (this.brew.maltGrainBillDetails.length === 0) {
          this.brew.maltGrainBillDetails.push(new MaltGrainBillDetail());
        }
        if (this.brew.waterAdditionDetails.length === 0) {
          this.brew.waterAdditionDetails.push(new WaterAdditionDetail());
        }
        if (this.brew.mashingTargetDetails.length === 0) {
          this.brew.mashingTargetDetails.push(new MashingTargetDetail());
        }
        this.brew.mashingTargetDetails.forEach((mash: MashingTargetDetail) => {
          if (!mash.mashingTargetDetailsTemperature) {
            mash.mashingTargetDetailsTemperature = [];
            mash.mashingTargetDetailsTemperature.push(new MashingTargetDetailsTemperature());
          }
        });

        if (this.brew.vorlauf.length === 0) {
          this.brew.vorlauf.push(new Vorlauf());
        }
        if (this.brew.spargeDetails.length === 0) {
          this.brew.spargeDetails.push(new SpargeDetail());
        }
        if (this.brew.firstRunnings.length === 0) {
          this.brew.firstRunnings.push(new FirstRunning());
        }
        if (this.brew.lastRunnings.length === 0) {
          this.brew.lastRunnings.push(new LastRunning());
        }
        if (this.brew.kettleDataEntryDetails.length === 0) {
          this.brew.kettleDataEntryDetails.push(new KettleDataEntryDetail());
        }
        if (this.brew.hopesDetails.length === 0 && this.brew.adjunctsDetails.length === 0) {
          this.brew.hopesDetails.push(new HopesDetail());
          this.brew.adjunctsDetails.push(new AdjunctsDetail());
        } else {
          this.findByAddins();
        }
        if (this.brew.postBoilData.length === 0) {
          this.brew.postBoilData.push(new PostBoilData());
        }
        if (this.brew.whirlPoolDataEntry.length === 0) {
          this.brew.whirlPoolDataEntry.push(new WhirlPoolDataEntry());
        }
        if (this.brew.postWhirlpoolDetails.length === 0) {
          this.brew.postWhirlpoolDetails.push(new PostWhirlpoolDetail());
        }
        if (this.brew.coolingKnockouDetails.length === 0) {
          this.brew.coolingKnockouDetails.push(new CoolingKnockouDetail());
        }
        if (this.brew.brewLogDetailsNotes.length === 0) {
          this.brew.brewLogDetailsNotes.push(new BrewLogDetailsNote());
        }

        if (this.brew.startchTest.length === 0) {
          this.brew.startchTest.push(new StartchTest());
        }
        if (this.brew.mashinDetailsNotes.length === 0) {
          this.brew.mashinDetailsNotes.push(new MashinDetailsNote());
        }
        if (this.brew.fermentationDataEntry.length === 0) {
          this.brew.fermentationDataEntry.push(new FermentationDataEntry());
        }
        if (this.brew.yeastDataDetails.length === 0) {
          this.brew.yeastDataDetails.push(new YeastDataDetail());
          this.brew.yeastDataDetails[this.brew.yeastDataDetails.length - 1].tenantId = this.tenantId;
        }
        if (this.brew.diacetylRestDataDetails.length === 0) {
          this.brew.diacetylRestDataDetails.push(new DiacetylRestDataDetail());
          this.brew.diacetylRestDataDetails[this.brew.diacetylRestDataDetails.length - 1].tenantId = this.tenantId;

        }
        if (this.brew.agingDetails.length === 0) {
          this.brew.agingDetails.push(new AgingDetail());
          this.brew.agingDetails[this.brew.agingDetails.length - 1].tenantId = this.tenantId;

        }
        if (this.brew.enterFermentationData.length === 0) {
          this.brew.enterFermentationData.push(new EnterFermentationData());
          this.brew.enterFermentationData[this.brew.enterFermentationData.length - 1].tenantId = this.tenantId;

        }

        this.brew.enterFermentationData.map((enter: EnterFermentationData, i) => {
          let dateTime = this.timezone(enter.dateAndTime).toString();
          dateTime = dateTime.split(' ').slice(0, 5).join(' ');
          enter.dateAndTime = new Date(dateTime);
        });

        if (this.brew.fermentationDetailsNotes.length === 0) {
          this.brew.fermentationDetailsNotes.push(new FermentationDetailsNote());
          this.brew.fermentationDetailsNotes[this.brew.fermentationDetailsNotes.length - 1].tenantId = this.tenantId;

        }

        if (this.brew.conditioningDetails.length === 0) {
          this.brew.conditioningDetails.push(new ConditioningDetail());
          this.brew.conditioningDetails[this.brew.conditioningDetails.length - 1].tenantId = this.tenantId;

        }
        if (this.brew.filterationDetails.length === 0) {
          this.brew.filterationDetails.push(new FilterationDetail());
        }
        if (this.brew.carbonationDetails.length === 0) {
          this.brew.carbonationDetails.push(new CarbonationDetail());
          this.brew.carbonationDetails[this.brew.carbonationDetails.length - 1].tenantId = this.tenantId;

        }
        if (this.brew.conditioningDetailsNotes.length === 0) {
          this.brew.conditioningDetailsNotes.push(new ConditioningDetailsNote());
          this.brew.conditioningDetailsNotes[this.brew.conditioningDetailsNotes.length - 1].tenantId = this.tenantId;

        }



      }

    });
  }

  goToTop() {
    this.scrolltop.scrollTo(0, 0);
  }

  findByAddins() {

    this.brew.adjunctsDetails.forEach(element => {
      let dateTime = this.timezone(element.startTime).toString();
      dateTime = dateTime.split(' ').slice(0, 5).join(' ');
      element.startTime = new Date(dateTime).toLocaleString();
      if (element.addInId === '255ce5b1-4b1a-4da8-b269-5a0b81d9db23') { // kettle
        this.kettleAdjuncts.push(element);
      }
      if (element.addInId === '16818dea-3f57-49b7-96eb-5f6ffdc90120') { // whirlpool
        this.whirlpoolAdjunct.push(element);
      }
      if (element.addInId === 'b8ef016e-148e-4a42-b2e8-e4b1dfbc9660') { // ferment
        this.fermentAdjuncts.push(element);
      }
    });
    if (this.kettleAdjuncts.length === 0) {
      this.kettleAdjuncts.push(new AdjunctsDetail());
      this.kettleAdjuncts[0].startTime = (this.kettleAdjuncts[0].startTime).toLocaleString();
    }
    if (this.whirlpoolAdjunct.length === 0) {
      this.whirlpoolAdjunct.push(new AdjunctsDetail());
      this.whirlpoolAdjunct[0].startTime = (this.whirlpoolAdjunct[0].startTime).toLocaleString();
    }
    if (this.fermentAdjuncts.length === 0) {
      this.fermentAdjuncts.push(new AdjunctsDetail());
      this.fermentAdjuncts[0].startTime = (this.fermentAdjuncts[0].startTime).toLocaleString();
    }

    this.brew.hopesDetails.forEach(element => {
      let dateTime = this.timezone(element.startTime).toString();
      dateTime = dateTime.split(' ').slice(0, 5).join(' ');
      element.startTime = new Date(dateTime).toLocaleString();
      if (element.addInId === '255ce5b1-4b1a-4da8-b269-5a0b81d9db23') { // kettle
        this.kettleHops.push(element);
      }
      if (element.addInId === '16818dea-3f57-49b7-96eb-5f6ffdc90120') { // whirlpool
        this.whirlpoolHops.push(element);
      }
      if (element.addInId === 'b8ef016e-148e-4a42-b2e8-e4b1dfbc9660') { // ferment
        this.fermentHops.push(element);
      }
    });
    if (this.kettleHops.length === 0) {
      this.kettleHops.push(new HopesDetail());
      this.kettleHops[0].startTime = (this.kettleHops[0].startTime).toLocaleString();
    }
    if (this.whirlpoolHops.length === 0) {
      this.whirlpoolHops.push(new HopesDetail());
      this.whirlpoolHops[0].startTime = (this.whirlpoolHops[0].startTime).toLocaleString();
    }
    if (this.fermentHops.length === 0) {
      this.fermentHops.push(new HopesDetail());
      this.fermentHops[0].startTime = (this.fermentHops[0].startTime).toLocaleString();
    }
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

      return new Date(utc.setHours(hours, minutes, seconds));
    }
  }

  isCompleted(sectionName) {
    let returnValue: BrewRunCompletionDetail;
    if (this.brew.brewRunCompletionDetails.length > 0) {
      for (let brewRunCompletionDetail of this.brew.brewRunCompletionDetails) {
        if (brewRunCompletionDetail.section === sectionName) {
          returnValue = brewRunCompletionDetail;
          returnValue.createdDateTimeString = this.timezone(returnValue.CompletedDateTime).toString();
          break;
        }
      }
    }
    return returnValue;

  }

  saveAs(pdf) {
    pdf.saveAs(this.currentBrewId + '.pdf');
  }

  print() {
    window.print();
  }
}
