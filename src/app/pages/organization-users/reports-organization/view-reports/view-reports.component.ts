import { Component, OnInit } from '@angular/core';
import { BrewRun, MaltGrainBillDetail, WaterAdditionDetail, MashingTargetDetail, StartchTest, MashinDetailsNote, MashingTargetDetailsTemperature, FermentationDetailsNote, FermentationDataEntry, YeastDataDetail, DiacetylRestDataDetail, AgingDetail, EnterFermentationData, Vorlauf, SpargeDetail, FirstRunning, LastRunning, KettleDataEntryDetail, HopesDetail, AdjunctsDetail, PostBoilData, WhirlPoolDataEntry, PostWhirlpoolDetail, CoolingKnockouDetail, BrewLogDetailsNote, ConditioningDetail, FilterationDetail, CarbonationDetail, ConditioningDetailsNote, BrewRunCompletionDetail } from '../../../../models/brewrun';
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
    const userDetails = JSON.parse(sessionStorage.getItem('user'));
    this.tenantId = userDetails['CompanyDetails'].Id;
    const company = JSON.parse(sessionStorage.user).CompanyDetails;
    this.units = JSON.parse(sessionStorage.getItem('units'));
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
    this.tenantLogo = company.ImageUrl;
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
    this.brewContent.forEach(element => {
      if (element.Id === this.brewId) {
        if (element.Status === '7cd88ffb-cf41-4efc-9a17-d75bcb5b3770') {
          this.statusField = 'Not Started';
        } else if (element.Status === '4267ae2f-4b7f-4a70-a592-878744a13900') {
          this.statusField = 'Committed';
        } else if (element.Status === '9231c5f1-2235-4f7b-b5e6-80694333dd72') {
          this.statusField = 'Completed';
        } else {
          this.statusField = 'Progress';
        }
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

  getSingleBrewDetails(tenantId, brewId) {
    this.apiService.getDataByQueryParams(this.apiService.getBrewRunById, null, tenantId, brewId).subscribe(response => {
      if (response.status === 200) {

        this.brew = response['body'];

        this.currentBrewId = this.brew.BrewRunId;
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


        if (this.brew.MaltGrainBillDetails.length === 0) {
          this.brew.MaltGrainBillDetails.push(new MaltGrainBillDetail());
        }
        if (this.brew.WaterAdditionDetails.length === 0) {
          this.brew.WaterAdditionDetails.push(new WaterAdditionDetail());
        }
        if (this.brew.MashingTargetDetails.length === 0) {
          this.brew.MashingTargetDetails.push(new MashingTargetDetail());
        }
        this.brew.MashingTargetDetails.forEach((mash: MashingTargetDetail) => {
          if (!mash.MashingTargetDetailsTemperature) {
            mash.MashingTargetDetailsTemperature = [];
            mash.MashingTargetDetailsTemperature.push(new MashingTargetDetailsTemperature());
          }
        });

        if (this.brew.Vorlauf.length === 0) {
          this.brew.Vorlauf.push(new Vorlauf());
        }
        if (this.brew.SpargeDetails.length === 0) {
          this.brew.SpargeDetails.push(new SpargeDetail());
        }
        if (this.brew.FirstRunnings.length === 0) {
          this.brew.FirstRunnings.push(new FirstRunning());
        }
        if (this.brew.LastRunnings.length === 0) {
          this.brew.LastRunnings.push(new LastRunning());
        }
        if (this.brew.KettleDataEntryDetails.length === 0) {
          this.brew.KettleDataEntryDetails.push(new KettleDataEntryDetail());
        }
        if (this.brew.HopesDetails.length === 0 && this.brew.AdjunctsDetails.length === 0) {
          this.brew.HopesDetails.push(new HopesDetail());
          this.brew.AdjunctsDetails.push(new AdjunctsDetail());
        } else {
          this.findByAddins();
        }
        if (this.brew.PostBoilData.length === 0) {
          this.brew.PostBoilData.push(new PostBoilData());
        }
        if (this.brew.WhirlPoolDataEntry.length === 0) {
          this.brew.WhirlPoolDataEntry.push(new WhirlPoolDataEntry());
        }
        if (this.brew.PostWhirlpoolDetails.length === 0) {
          this.brew.PostWhirlpoolDetails.push(new PostWhirlpoolDetail());
        }
        if (this.brew.CoolingKnockouDetails.length === 0) {
          this.brew.CoolingKnockouDetails.push(new CoolingKnockouDetail());
        }
        if (this.brew.BrewLogDetailsNotes.length === 0) {
          this.brew.BrewLogDetailsNotes.push(new BrewLogDetailsNote());
        }

        if (this.brew.StartchTest.length === 0) {
          this.brew.StartchTest.push(new StartchTest());
        }
        if (this.brew.MashinDetailsNotes.length === 0) {
          this.brew.MashinDetailsNotes.push(new MashinDetailsNote());
        }
        if (this.brew.FermentationDataEntry.length === 0) {
          this.brew.FermentationDataEntry.push(new FermentationDataEntry());
        }
        if (this.brew.YeastDataDetails.length === 0) {
          this.brew.YeastDataDetails.push(new YeastDataDetail());
          this.brew.YeastDataDetails[this.brew.YeastDataDetails.length - 1].TenantId = this.tenantId;
        }
        if (this.brew.DiacetylRestDataDetails.length === 0) {
          this.brew.DiacetylRestDataDetails.push(new DiacetylRestDataDetail());
          this.brew.DiacetylRestDataDetails[this.brew.DiacetylRestDataDetails.length - 1].TenantId = this.tenantId;

        }
        if (this.brew.AgingDetails.length === 0) {
          this.brew.AgingDetails.push(new AgingDetail());
          this.brew.AgingDetails[this.brew.AgingDetails.length - 1].TenantId = this.tenantId;

        }
        if (this.brew.EnterFermentationData.length === 0) {
          this.brew.EnterFermentationData.push(new EnterFermentationData());
          this.brew.EnterFermentationData[this.brew.EnterFermentationData.length - 1].TenantId = this.tenantId;

        }

        this.brew.EnterFermentationData.map((enter: EnterFermentationData, i) => {
          let dateTime = this.timezone(new Date(enter.DateAndTime).toUTCString());
          dateTime = dateTime.split(' ').slice(0, 5).join(' ');
          enter.DateAndTime = new Date(dateTime);
        });

        if (this.brew.FermentationDetailsNotes.length === 0) {
          this.brew.FermentationDetailsNotes.push(new FermentationDetailsNote());
          this.brew.FermentationDetailsNotes[this.brew.FermentationDetailsNotes.length - 1].TenantId = this.tenantId;

        }

        if (this.brew.ConditioningDetails.length === 0) {
          this.brew.ConditioningDetails.push(new ConditioningDetail());
          this.brew.ConditioningDetails[this.brew.ConditioningDetails.length - 1].TenantId = this.tenantId;

        }
        if (this.brew.FilterationDetails.length === 0) {
          this.brew.FilterationDetails.push(new FilterationDetail());
        }
        if (this.brew.CarbonationDetails.length === 0) {
          this.brew.CarbonationDetails.push(new CarbonationDetail());
          this.brew.CarbonationDetails[this.brew.CarbonationDetails.length - 1].TenantId = this.tenantId;

        }
        if (this.brew.ConditioningDetailsNotes.length === 0) {
          this.brew.ConditioningDetailsNotes.push(new ConditioningDetailsNote());
          this.brew.ConditioningDetailsNotes[this.brew.ConditioningDetailsNotes.length - 1].TenantId = this.tenantId;

        }



      }

    });
  }

  goToTop() {
    this.scrolltop.scrollTo(0, 0);
  }

  findByAddins() {

    this.brew.AdjunctsDetails.forEach(element => {
      let dateTime = this.timezone(new Date(element.StartTime).toUTCString());
      dateTime = dateTime.split(' ').slice(0, 5).join(' ');
      element.StartTime = new Date(dateTime).toLocaleString();
      if (element.AddInId === '255ce5b1-4b1a-4da8-b269-5a0b81d9db23') { // kettle
        this.kettleAdjuncts.push(element);
      }
      if (element.AddInId === '16818dea-3f57-49b7-96eb-5f6ffdc90120') { // whirlpool
        this.whirlpoolAdjunct.push(element);
      }
      if (element.AddInId === 'b8ef016e-148e-4a42-b2e8-e4b1dfbc9660') { // ferment
        this.fermentAdjuncts.push(element);
      }
    });
    if (this.kettleAdjuncts.length === 0) {
      this.kettleAdjuncts.push(new AdjunctsDetail());
      this.kettleAdjuncts[0].StartTime = (this.kettleAdjuncts[0].StartTime).toLocaleString();
    }
    if (this.whirlpoolAdjunct.length === 0) {
      this.whirlpoolAdjunct.push(new AdjunctsDetail());
      this.whirlpoolAdjunct[0].StartTime = (this.whirlpoolAdjunct[0].StartTime).toLocaleString();
    }
    if (this.fermentAdjuncts.length === 0) {
      this.fermentAdjuncts.push(new AdjunctsDetail());
      this.fermentAdjuncts[0].StartTime = (this.fermentAdjuncts[0].StartTime).toLocaleString();
    }

    this.brew.HopesDetails.forEach(element => {
      let dateTime = this.timezone(new Date(element.StartTime).toUTCString());
      dateTime = dateTime.split(' ').slice(0, 5).join(' ');
      element.StartTime = new Date(dateTime).toLocaleString();
      if (element.AddInId === '255ce5b1-4b1a-4da8-b269-5a0b81d9db23') { // kettle
        this.kettleHops.push(element);
      }
      if (element.AddInId === '16818dea-3f57-49b7-96eb-5f6ffdc90120') { // whirlpool
        this.whirlpoolHops.push(element);
      }
      if (element.AddInId === 'b8ef016e-148e-4a42-b2e8-e4b1dfbc9660') { // ferment
        this.fermentHops.push(element);
      }
    });
    if (this.kettleHops.length === 0) {
      this.kettleHops.push(new HopesDetail());
      this.kettleHops[0].StartTime = (this.kettleHops[0].StartTime).toLocaleString();
    }
    if (this.whirlpoolHops.length === 0) {
      this.whirlpoolHops.push(new HopesDetail());
      this.whirlpoolHops[0].StartTime = (this.whirlpoolHops[0].StartTime).toLocaleString();
    }
    if (this.fermentHops.length === 0) {
      this.fermentHops.push(new HopesDetail());
      this.fermentHops[0].StartTime = (this.fermentHops[0].StartTime).toLocaleString();
    }
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

  isCompleted(sectionName) {
    let returnValue: BrewRunCompletionDetail;
    if (this.brew.BrewRunCompletionDetails.length > 0) {
      for (let brewRunCompletionDetail of this.brew.BrewRunCompletionDetails) {
        if (brewRunCompletionDetail.Section === sectionName) {
          returnValue = brewRunCompletionDetail;
          returnValue.CreatedDateTimeString = this.timezone(new Date(returnValue.CompletedDateTime).toUTCString());
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
