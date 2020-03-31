import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { ElementRef, ViewChild } from '@angular/core';
import { NbLayoutScrollService, NbThemeService, NbToastrService } from '@nebular/theme';
import { Guid } from 'guid-typescript';
import { String } from 'typescript-string-operations';

import html2canvas from 'html2canvas';
import * as jsPDF from 'jspdf';


@Component({
  selector: 'app-recipe-form',
  templateUrl: './recipe-form.component.html',
  styleUrls: ['./recipe-form.component.scss'],
})
export class RecipeFormComponent implements OnInit {
  @ViewChild('pdfDiv', { static: false }) pdfDiv: ElementRef;
  recipeId: any;
  tenantId: any;
  units: any;
  userDetails: any;
  styles: any;
  addins: any;
  countries: any;
  maltTypes: any;
  suppliers: any;
  yeastStrain: any;
  recipeContent: any;
  id: string;
  preferedUnit: string;
  preferedPlato: string;
  recipeName: string;
  preference: any;
  platoUnitId: any;
  tempUnitIdFromDb: any;
  platoUnitIdFromDb: any;

  constructor(
    private scrolltop: NbLayoutScrollService,
    private themescrollTop: NbThemeService,
    private apiService: ApiProviderService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private toast: NbToastrService,
  ) { }


  recipeDetailsForm = this.formBuilder.group({

    // Receipe Details
    Id: [''],
    ReceipeName: [''],
    StyleId: [''],
    TotalBrews: '',
    BatchSize: [''],
    BatchSizeUnitId: [''],
    BrewHouseEfficiency: [''],
    Abv: [''],
    Ibus: [''],
    TenantId: [''],
    CreatedDate: [''],
    ModifiedDate: [''],
    YeastStrainId: [''],
    StatusId: [''],
    IsActive: [''],
    MaltGrainBill: this.formBuilder.array([]),
    WaterAdditions: this.formBuilder.array([]),
    Hops: this.formBuilder.array([]),
    Adjuncts: this.formBuilder.array([]),
    AdditionalHops: this.formBuilder.array([]),
    AdditionalAdjuncts: this.formBuilder.array([]),
    mashingTargets: this.formBuilder.array([]),
    RecipeNotes: this.formBuilder.array([]),
    KettleTargets: this.formBuilder.array([]),
    sparge: this.formBuilder.array([]),
    WhirlpoolTarget: this.formBuilder.array([]),
    CoolingKnockoutTargets: this.formBuilder.array([]),
    FermentationTargets: this.formBuilder.array([]),
    DiacetylRest: this.formBuilder.array([]),
    Aging: this.formBuilder.array([]),
    Yeast: this.formBuilder.array([]),
    ConditioningTargets: this.formBuilder.array([]),
    FilterationTargets: this.formBuilder.array([]),
    CarbonationTargets: this.formBuilder.array([]),
  });

  get form() {
    return this.recipeDetailsForm.controls;
  }

  get maltGrainBillArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('MaltGrainBill');
  }

  get waterAdditionsArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('WaterAdditions');
  }

  get hopsArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('Hops');
  }

  get adjunctsArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('Adjuncts');
  }

  get additionalHopsArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('AdditionalHops');
  }

  get additionalAdjunctsArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('AdditionalAdjuncts');
  }

  get mashingTargetsArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('mashingTargets');
  }

  get recipeNotesArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('RecipeNotes');
  }

  get kettleTargetsArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('KettleTargets');
  }

  get spargeArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('sparge');
  }

  get whirlpoolTargetArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('WhirlpoolTarget');
  }

  get WhirlpoolTargetForms() {
    return this.recipeDetailsForm.controls.WhirlpoolTarget as FormGroup;
  }

  get coolingKnockoutTargetsArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('CoolingKnockoutTargets');
  }

  get fermentationTargetsArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('FermentationTargets');
  }

  get diacetylRestArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('DiacetylRest');
  }

  get agingArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('Aging');
  }

  get yeastArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('Yeast');
  }

  get conditioningTargetsArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('ConditioningTargets');
  }

  get filterationTargetsArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('FilterationTargets');
  }

  get carbonationTargetsArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('CarbonationTargets');
  }

  ngOnInit() {
    this.recipeId = this.route.snapshot.params.id;
    const user = JSON.parse(sessionStorage.getItem('user'));
    this.tenantId = user['userDetails'].tenantId;
    this.units = JSON.parse(sessionStorage.getItem('units'));
    this.getRecipeDetailsEdit(this.tenantId);

    if (!sessionStorage.styles || !sessionStorage.addins ||
      !sessionStorage.suppliers || !sessionStorage.maltTypes ||
      !sessionStorage.countries || !sessionStorage.yeastStrain ||
      !sessionStorage.preferenceUsed) {
      this.getCountries();
      this.getAddIns();
      this.getMaltTypes();
      this.getStyles();
      this.getSuppliers();
      this.getYeastStrain();
      this.getUnitTypes();
      // this.getPreferenceUsed();
    } else {
      this.styles = JSON.parse(sessionStorage.styles);
      this.addins = JSON.parse(sessionStorage.addins);
      this.countries = JSON.parse(sessionStorage.countries);
      this.maltTypes = JSON.parse(sessionStorage.maltTypes);
      this.suppliers = JSON.parse(sessionStorage.suppliers);
      this.yeastStrain = JSON.parse(sessionStorage.yeastStrain);
      // this.preference = JSON.parse(sessionStorage.preferenceUsed);
    }
    this.recipeDetailsForm.disable();
  }

  findUnits() {
    if (this.units !== null || undefined) {
      this.units.forEach(element => {
        if (element.id === this.tempUnitIdFromDb) {
          this.preferedUnit = element.symbol;
        }
        if (element.id === this.platoUnitIdFromDb) {
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
        this.preference = response['body'];
        sessionStorage.setItem('preferenceUsed', JSON.stringify(this.preference));
        this.findUnits();
      }
    });
  }

  getCountries() {
    this.apiService.getDataList(this.apiService.getAllActiveCountry).subscribe(response => {
      if (response) {
        this.countries = response['body'].countrybase;
        sessionStorage.setItem('countries', JSON.stringify(this.countries));
      }
    }, error => {
      this.toast.danger(error.error.Message);
    });
  }

  getMaltTypes() {
    const getAllActiveMaltGrainTypeAPI = String.Format(this.apiService.getAllActiveMaltGrainType, this.tenantId);
    this.apiService.getDataList(getAllActiveMaltGrainTypeAPI).subscribe(response => {
      if (response) {
        this.maltTypes = response['body'].recipe;
        sessionStorage.setItem('maltTypes', JSON.stringify(this.maltTypes));

      }
    }, error => {
      this.toast.danger(error.error.Message);
    });
  }

  getAddIns() {
    const getAllActiveAddInAPI = String.Format(this.apiService.getAllActiveAddIn, this.tenantId);
    this.apiService.getDataList(getAllActiveAddInAPI).subscribe(response => {
      if (response) {
        this.addins = response['body'].addinBase;
        sessionStorage.setItem('addins', JSON.stringify(this.addins));

      }
    }, error => {
      this.toast.danger(error.error.Message);
    });
  }

  getSuppliers() {
    const getAllActiveSupplierAPI = String.Format(this.apiService.getAllActiveSupplier, this.tenantId);
    this.apiService.getDataList(getAllActiveSupplierAPI).subscribe(response => {
      if (response) {
        this.suppliers = response['body'].supplierBase;
        sessionStorage.setItem('suppliers', JSON.stringify(this.suppliers));

      }
    }, error => {
      this.toast.danger(error.error.Message);
    });
  }

  getStyles() {
    const getAllActiveStyleAPI = String.Format(this.apiService.getAllActiveStyle, this.tenantId);
    this.apiService.getData(getAllActiveStyleAPI).subscribe(response => {
      if (response) {
        this.styles = response['body'].style;
        sessionStorage.setItem('styles', JSON.stringify(this.styles));

      }
    }, error => {
      this.toast.danger(error.error.Message);
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

  getUnitTypes() {
    this.apiService.getDataList(this.apiService.getAllActiveUnitType).subscribe(response => {
      if (response) {
        this.units = response['body'].unitTypebase;
        sessionStorage.setItem('unitTypes', JSON.stringify(this.units));

      }
    }, error => {
      this.toast.danger(error);
    })
  }

  getRecipeDetailsEdit(tenantId) {
    this.apiService.getDataList(this.apiService.getRecipebyId, null, null, tenantId, this.recipeId).subscribe(response => {
      if (response && response['body']) {
        this.recipeContent = response.body.recipe;
        this.recipeName = this.recipeContent.name;

        if (this.recipeContent.kettleTargets.platoUnitId || this.recipeContent.sparges.length !== 0 &&
          this.recipeContent.sparges[0].platoUnitId ||
          this.recipeContent.conditioningTargets.platoUnitId ||
          this.recipeContent.diacetylRest.platoUnitId ||
          this.recipeContent.fermentationTargets.platoUnitId) {

          this.platoUnitIdFromDb = this.recipeContent.kettleTargets.platoUnitId || this.recipeContent.sparges.length !== 0 &&
            this.recipeContent.sparges[0].platoUnitId ||
            this.recipeContent.conditioningTargets.platoUnitId ||
            this.recipeContent.diacetylRest.platoUnitId ||
            this.recipeContent.fermentationTargets.platoUnitId;

          if (this.recipeContent.mashingTargets.strikeWaterTemperatureUnitTypeId ||
            this.recipeContent.mashingTargets.mashingTargetTemperature[0].temperatureUnitTypeId
          ) {
            this.tempUnitIdFromDb = this.recipeContent.mashingTargets.strikeWaterTemperatureUnitTypeId ||
              this.recipeContent.mashingTargets.mashingTargetTemperature[0].temperatureUnitTypeId;
          }
        }
        this.findUnits();
        this.setDataToEdit(this.recipeContent);
        this.initiateFormArrays();
      }
    });
  }

  addMaltBill() {
    const control = <FormArray>this.recipeDetailsForm.controls['MaltGrainBill'];
    control.push(
      this.formBuilder.group({
        Id: [Guid.raw()],
        RecipeId: [this.recipeId],
        Name: [''],
        MaltGrainTypeId: [''],
        CountryId: [''],
        SupplierId: [''],
        Quantity: [''],
        QuantityUnitId: [''],
        GrainBillPercentage: [''],
        Srm: [''],
        Potential: [''],
        IsActive: [null],
        CreatedDate: ['2019-01-01T00:00:00'],
        ModifiedDate: ['2019-01-01T00:00:00'],
        TenantId: [this.tenantId],
      }));
  }

  addWaterAdditions() {
    const control = <FormArray>this.recipeDetailsForm.controls['WaterAdditions'];
    control.push(
      this.formBuilder.group({
        Id: [Guid.raw()],
        RecipeId: [this.recipeId],
        Cacl2: [''],
        cacl2unitId: [''],
        Gypsum: [''],
        GypsumUnitId: [''],
        TableSalt: [''],
        TableSaltUnitId: [''],
        EpsomSalt: [''],
        EpsomSaltUnitId: [''],
        CaCo3: [''],
        CaCo3unitId: [''],
        BakingSoda: [''],
        BakingSodaUnitId: [''],
        H3po4: [''],
        H3po4unitId: [''],
        IsActive: [null],
        CreatedDate: ['2019-01-01T00:00:00'],
        ModifiedDate: ['2019-01-01T00:00:00'],
        TenantId: [this.tenantId],
      }));
  }

  addHops() {
    const control = <FormArray>this.recipeDetailsForm.controls['Hops'];
    control.push(
      this.formBuilder.group({
        Id: [Guid.raw()],
        RecipeId: [this.recipeId],
        Name: [''],
        MaltGrainTypeId: [''],
        CountryId: [''],
        SupplierId: [''],
        Alpha: [''],
        Quantity: [''],
        QuantityUnitTypeId: [''],
        AddInId: [''],
        TimeIn: [''],
        TimeInUnitId: [''],
        AdditionalHopesStatus: [false],
        IsActive: [false],
        CreatedDate: ['2019-01-01T00:00:00'],
        ModifiedDate: ['2019-01-01T00:00:00'],
        TenantId: [this.tenantId],
      }));
  }

  addAdjuncts() {
    const control = <FormArray>this.recipeDetailsForm.controls['Adjuncts'];
    control.push(
      this.formBuilder.group({
        Id: [Guid.raw()],
        RecipeId: [this.recipeId],
        Name: [''],
        SupplierId: [''],
        Quantity: [''],
        QuantityUnitId: [''],
        AddInId: [''],
        TimeIn: [''],
        TimeInUnitId: [''],
        AdditionalAdjunctsStatus: [false],
        IsActive: [null],
        CreatedDate: ['2019-01-01T00:00:00'],
        ModifiedDate: ['2019-01-01T00:00:00'],
        TenantId: [this.tenantId],
        CountryId: [''],
      }));
  }

  get mashingTargetsTemperature(): FormGroup {
    return this.formBuilder.group({
      id: [this.id],
      temperature: [''],
      temperatureUnitTypeId: [''],
      startTime: [''],
      mashingTargetId: ['00000000-0000-0000-0000-000000000000'],
      isActive: [1],
      createdDate: ['2019-01-01T00:00:00'],
      modifiedDate: ['2019-01-01T00:00:00'],
      tenantId: [this.tenantId],
    });
  }

  addMashingTargets() {
    const control = <FormArray>this.recipeDetailsForm.controls['mashingTargets'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        recipeId: [this.recipeId],
        strikeWaterVolume: [''],
        strikeWaterUnitTypeId: [''],
        strikeWaterTemperature: [''],
        strikeWaterTemperatureUnitTypeId: [''],
        mashpH: [''],
        liquortogristratio: [''],
        temperature: [''],
        isActive: [null],
        createdDate: ['2019-01-01T00:00:00'],
        modifiedDate: ['2019-01-01T00:00:00'],
        tenantId: [this.tenantId],
        tempSingle: [''],
        mashingTargetTemperature: this.formBuilder.array([this.mashingTargetsTemperature]),
      }),
    );
  }

  addRecipeNotes() {
    const control = <FormArray>this.recipeDetailsForm.controls['RecipeNotes'];
    control.push(
      this.formBuilder.group({
        Id: [Guid.raw()],
        RecipeId: [this.recipeId],
        Notes: [''],
        IsActive: [''],
        CreatedDate: ['2019-01-01T00:00:00'],
        ModifiedDate: ['2019-01-01T00:00:00'],
        TenantId: [this.tenantId],
      }),
    );
  }

  addKettleTargets() {
    const control = <FormArray>this.recipeDetailsForm.controls['KettleTargets'];
    control.push(
      this.formBuilder.group({
        Id: [Guid.raw()],
        ReceipeId: [this.recipeId],
        BoilLength: [''],
        BoilLengthUnitId: [''],
        VolumePreBoil: [''],
        VolumePreBoilUnitId: ['1D211DBF-1A2C-470F-9795-6001C627AC44'],
        VolumePostBoil: [''],
        VolumePostBoilUnitId: [''],
        Plato: [''],
        Gravity: [''],
        Ph: [''],
        Notes: [''],
        IsActive: [true],
        CreatedDate: ['2019-01-01T00:00:00'],
        ModifiedDate: ['2019-01-01T00:00:00'],
        TenantId: [this.tenantId],
      }));
  }

  addSparge() {
    const control = <FormArray>this.recipeDetailsForm.controls['sparge'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        recipeId: [this.recipeId],
        spargeWaterTemperature: [''],
        spargeWaterTemperatureUnitId: ['3545a3b4-bf2e-4b94-a06e-5eea613f0e64'],
        spargeTotalVolume: [''],
        spargeTotalVolumeUnitId: [''],
        firstRunningSpecificGravity: [1],
        firstRunningPlato: [''],
        lastRunningSpecificGravity: [1],
        lastRunningPlato: [''],
        notes: [''],
        isActive: [true],
        createdDate: ['2019-01-01T00:00:00'],
        modifiedDate: ['2019-01-01T00:00:00'],
        tenantId: [this.tenantId],
      }));
  }

  addWhirlpoolTarget() {
    const control = <FormArray>this.recipeDetailsForm.controls['WhirlpoolTarget'];
    control.push(
      this.formBuilder.group({
        Id: [Guid.raw()],
        RecipeId: [this.recipeId],
        PostBoilVolume: [''],
        PostBoilVolumeunitId: [''],
        Notes: [''],
        IsActive: [true],
        CreatedDate: ['2019-01-01T00:00:00'],
        ModifiedDate: ['2019-01-01T00:00:00'],
        TenantId: [this.tenantId],
      }));
  }

  addCoolingKnockoutTargets() {
    const control = <FormArray>this.recipeDetailsForm.controls['CoolingKnockoutTargets'];
    control.push(
      this.formBuilder.group({
        Id: [Guid.raw()],
        RecipeId: [this.recipeId],
        VolumeInFermentation: [''],
        VolumeInFermentationOptionId: [''],
        Notes: [''],
        IsActive: [true],
        CreatedDate: ['2019-01-01T00:00:00'],
        ModifiedDate: ['2019-01-01T00:00:00'],
        TenantId: [this.tenantId],
      }));
  }

  addAdditionalHops() {
    const control = <FormArray>this.recipeDetailsForm.controls['AdditionalHops'];
    control.push(this.formBuilder.group({
      Id: [Guid.raw()],
      RecipeId: [this.recipeId],
      Name: [''],
      MaltGrainTypeId: [''],
      CountryId: [''],
      SupplierId: [''],
      Alpha: [''],
      Quantity: [''],
      QuantityUnitTypeId: [''],
      AddInId: [''],
      AdditionalHopesStatus: [true],
      IsActive: [false],
      CreatedDate: ['2019-01-01T00:00:00'],
      ModifiedDate: ['2019-01-01T00:00:00'],
      TenantId: [this.tenantId],
    }));
  }

  addAdditionalAdjuncts() {
    const control = <FormArray>this.recipeDetailsForm.controls['AdditionalAdjuncts'];
    control.push(
      this.formBuilder.group({
        Id: [Guid.raw()],
        RecipeId: [this.recipeId],
        Name: [''],
        SupplierId: [''],
        Quantity: [''],
        QuantityUnitId: [''],
        AddInId: [''],
        AdditionalAdjunctsStatus: [true],
        IsActive: [null],
        CreatedDate: ['2019-01-01T00:00:00'],
        ModifiedDate: ['2019-01-01T00:00:00'],
        TenantId: [this.tenantId],
        CountryId: [''],
      }),
    );
  }

  addFermentationTargets() {
    const control = <FormArray>this.recipeDetailsForm.controls['FermentationTargets'];
    control.push(
      this.formBuilder.group({
        Id: [Guid.raw()],
        RecipeId: [this.recipeId],
        VolumeIn: [''],
        VolumeInUnitId: [''],
        Temperature: [''],
        TemperatureUnitId: ['29948d48-3bca-4786-a465-78e42693604f'],
        Pressure: [''],
        PressureUnitId: ['29948d48-3bca-4786-a465-78e42693604f'],
        Ph: [''],
        Plato: [''],
        PlatoUnitId: [this.platoUnitId],
        IsActive: [true],
        CreatedDate: ['2019-01-01T00:00:00'],
        ModifiedDate: ['2019-01-01T00:00:00'],
        TenantId: [this.tenantId],
      }));
  }

  addDiacetylRest() {
    const control = <FormArray>this.recipeDetailsForm.controls['DiacetylRest'];
    control.push(
      this.formBuilder.group({
        Id: [Guid.raw()],
        ReceipeId: [this.recipeId],
        Temperature: [''],
        TemperatureUnitId: ['29948d48-3bca-4786-a465-78e42693604f'],
        Plato: [''],
        SpecificGravity: [''],
        IsActive: [true],
        CreatedDate: ['2019-01-01T00:00:00'],
        ModifiedDate: ['2019-01-01T00:00:00'],
        TenantId: [this.tenantId],
      }));
  }

  addAging() {
    const control = <FormArray>this.recipeDetailsForm.controls['Aging'];
    control.push(
      this.formBuilder.group({
        Id: [Guid.raw()],
        ReceipeId: [this.recipeId],
        TimeDuration: [''],
        TimeDurationUnitId: [''],
        Temperature: [''],
        TemperatureUnitId: ['29948d48-3bca-4786-a465-78e42693604f'],
        IsActive: [true],
        CreatedDate: ['2019-01-01T00:00:00'],
        ModifiedDate: ['2019-01-01T00:00:00'],
        TenantId: [this.tenantId],
      }));
  }

  addYeast() {
    const control = <FormArray>this.recipeDetailsForm.controls['Yeast'];
    control.push(
      this.formBuilder.group({
        Id: [Guid.raw()],
        Name: [''],
        RecipeId: [this.recipeId],
        YeastStrainId: [''],
        CountryId: [''],
        SupplierId: [''],
        IsActive: [true],
        CreatedDate: ['2019-01-01T00:00:00'],
        ModifiedDate: ['2019-01-01T00:00:00'],
        TenantId: [this.tenantId],
      }));
  }

  addConditioningTargets() {
    const control = <FormArray>this.recipeDetailsForm.controls['ConditioningTargets'];
    control.push(
      this.formBuilder.group({
        Id: [Guid.raw()],
        RecipeId: [this.recipeId],
        VolumeIn: [''],
        VolumeInUnitId: [''],
        Temperature: [''],
        TemperatureUnitId: ['1D211DBF-1A2C-470F-9795-6001C627AC44'],
        Pressure: [''],
        PressureUnitId: ['1D211DBF-1A2C-470F-9795-6001C627AC44'],
        Ph: [''],
        Plato: [''],
        SpecificGravity: [''],
        Co2: [''],
        Co2UnitId: [''],
        Notes: [''],
        IsActive: [true],
        CreatedDate: ['2019-01-01T00:00:00'],
        ModifiedDate: ['2019-01-01T00:00:00'],
        TenantId: [this.tenantId],
      }));
  }

  addFilterationTargets() {
    const control = <FormArray>this.recipeDetailsForm.controls['FilterationTargets'];
    control.push(
      this.formBuilder.group({
        Id: [Guid.raw()],
        RecipeId: [this.recipeId],
        Temperature: [''],
        TemperatureUnitId: ['1D211DBF-1A2C-470F-9795-6001C627AC44'],
        Notes: [''],
        IsActive: [true],
        CreatedDate: ['2019-01-01T00:00:00'],
        ModifiedDate: ['2019-01-01T00:00:00'],
        TenantId: [this.tenantId],
      }));
  }

  addCarbonationTargets() {
    const control = <FormArray>this.recipeDetailsForm.controls['CarbonationTargets'];
    control.push(
      this.formBuilder.group({
        Id: [Guid.raw()],
        RecipeId: [this.recipeId],
        Ph: [''],
        Pressure: [''],
        PressureUnitId: ['1D211DBF-1A2C-470F-9795-6001C627AC44'],
        Notes: [''],
        IsActive: [true],
        CreatedDate: ['2019-01-01T00:00:00'],
        ModifiedDate: ['2019-01-01T00:00:00'],
        TenantId: [this.tenantId],
      }));
  }

  initiateFormArrays() {

    if (this.recipeContent.maltGrainBills === null) {
      const MaltGrainBill = (this.recipeDetailsForm.get('MaltGrainBill') as FormArray);
      this.addMaltBill();
    }
    if (this.recipeContent.waterAdditions === null) {
      const WaterAdditions = (this.recipeDetailsForm.get('WaterAdditions') as FormArray);
      this.addWaterAdditions();
    }
    if (this.recipeContent.hops === null) {
      const Hops = (this.recipeDetailsForm.get('Hops') as FormArray);
      this.addHops();
      this.addAdditionalHops();
    }
    if (this.recipeContent.adjuncts === null) {
      const Adjuncts = (this.recipeDetailsForm.get('Adjuncts') as FormArray);
      this.addAdjuncts();
      this.addAdditionalAdjuncts();
    }
    if (this.recipeContent.mashingTargets === null) {
      const MashinTargets = (this.recipeDetailsForm.get('mashingTargets') as FormArray);
      this.addMashingTargets();
    }
    if (this.recipeContent.recipeNotes === null) {
      const RecipeNotes = this.recipeDetailsForm.get('RecipeNotes') as FormArray;
      this.addRecipeNotes();
    }
    if (this.recipeContent.kettleTargets === null) {
      const KettleTargets = this.recipeDetailsForm.get('KettleTargets') as FormArray;
      this.addKettleTargets();
    }
    if (this.recipeContent.sparges === null) {
      const sparge = this.recipeDetailsForm.get('sparge') as FormArray;
      this.addSparge();
    }
    if (this.recipeContent.whirlpoolTarget === null) {
      const WhirlpoolTarget = this.recipeDetailsForm.get('WhirlpoolTarget') as FormArray;
      this.addWhirlpoolTarget();
    }
    if (this.recipeContent.coolingKnockoutTarget === null) {
      const CoolingKnockoutTargets = this.recipeDetailsForm.get('CoolingKnockoutTargets') as FormArray;
      this.addCoolingKnockoutTargets();
    }
    if (this.recipeContent.fermentationTargets === null) {
      const fermentationTargetsArray = this.recipeDetailsForm.get('FermentationTargets') as FormArray;
      this.addFermentationTargets();
    }
    if (this.recipeContent.diacetylRest === null) {
      const diacetylRestArray = this.recipeDetailsForm.get('DiacetylRest') as FormArray;
      this.addDiacetylRest();
    }
    if (this.recipeContent.aging === null) {
      const agingArray = this.recipeDetailsForm.get('Aging') as FormArray;
      this.addAging();
    }
    if (this.recipeContent.yeast === null) {
      const yeastArray = this.recipeDetailsForm.get('Yeast') as FormArray;
      this.addYeast();
    }
    if (this.recipeContent.conditioningTargets === null) {
      const conditioningTargetsArray = this.recipeDetailsForm.get('ConditioningTargets') as FormArray;
      this.addConditioningTargets();
    }
    if (this.recipeContent.filterationTargets === null) {
      const filterationTargetsArray = this.recipeDetailsForm.get('FilterationTargets') as FormArray;
      this.addFilterationTargets();
    }
    if (this.recipeContent.carbonationTargets === null) {
      const carbonationTargetsArray = this.recipeDetailsForm.get('CarbonationTargets') as FormArray;
      this.addCarbonationTargets();
    }
  }

  setDataToEdit(data) {
    if (data) {
      this.recipeDetailsForm.get('ReceipeName').setValue(data.name);
      this.recipeDetailsForm.get('BrewHouseEfficiency').setValue(data.brewHouseEfficiency);
      this.recipeDetailsForm.get('BatchSize').setValue(data.batchSize);
      this.recipeDetailsForm.get('Abv').setValue(data.abv);
      this.recipeDetailsForm.get('Ibus').setValue(data.ibus);
      this.recipeDetailsForm.get('StyleId').setValue(data.styleId);
      this.recipeDetailsForm.get('BatchSizeUnitId').setValue(data.batchSizeUnitId);

      this.setMashinForm(data);
      this.setBrewLogForm(data);
      this.setFermentForm(data);
      this.setConditioningForm(data);
    }
  }

  setMashinForm(data) {
    if (data.hops != null) {
      const testArray = [];
      for (let i = 0; i < data.hops.length; i++) {
        if (!data.hops[i].additionalHopesStatus) {
          this.hopsArray.insert(i, this.formBuilder.group(data.hops[i]));
          testArray.push(data.hops[i]);
        }
        this.hopsArray.disable();
      }
      if (testArray.length === 0) {
        this.addHops();
      }
    }

    if (data.adjuncts != null) {
      const testArray = [];
      for (let i = 0; i < data.adjuncts.length; i++) {
        if (!data.adjuncts[i].additionalAdjunctsStatus) {
          this.adjunctsArray.insert(i, this.formBuilder.group(data.adjuncts[i]));
          testArray.push(data.adjuncts[i]);
        }
        this.adjunctsArray.disable();
      }
      if (testArray.length === 0) {
        this.addAdjuncts();
      }
    }

    if (data.waterAdditions != null) {
      for (let i = 0; i < data.waterAdditions.length; i++) {
        this.waterAdditionsArray.insert(i, this.formBuilder.group(data.waterAdditions[i]));
        this.waterAdditionsArray.disable();
      }
    }

    if (data.maltGrainBills != null) {
      for (let i = 0; i < data.maltGrainBills.length; i++) {
        this.maltGrainBillArray.insert(i, this.formBuilder.group(data.maltGrainBills[i]));
        this.maltGrainBillArray.disable();
      }
    }

    if (data.recipeNotes != null) {
      this.addRecipeNotes();
      this.recipeNotesArray.controls.forEach(fields => {
        fields.get('Notes').setValue(data.recipeNotes.notes);
        fields.disable();
      });
    }

    if (data.mashingTargets != null) {
      this.addMashingTargets();
      this.mashingTargetsArray.controls.forEach(fields => {
        fields.get('strikeWaterVolume').setValue(data.mashingTargets.strikeWaterVolume);
        fields.get('strikeWaterUnitTypeId').setValue(data.mashingTargets.strikeWaterUnitTypeId);
        fields.get('strikeWaterTemperature').setValue(data.mashingTargets.strikeWaterTemperature);
        fields.get('strikeWaterTemperatureUnitTypeId').setValue(data.mashingTargets.strikeWaterTemperatureUnitTypeId);
        fields.get('mashpH').setValue(data.mashingTargets.mashpH);
        fields.get('liquortogristratio').setValue(data.mashingTargets.liquortoGristrRatio);
        fields.get('temperature').setValue(data.mashingTargets.temperature);
        fields.get('isActive').setValue(data.mashingTargets.isActive);

        if (data.mashingTargets.mashingTargetTemperatures != null) {
          const temp = <FormArray>fields.get('MashingTargetTemperature');
          if (data.mashingTargets.mashingTargetTemperatures.length === 1) {
            fields.get('tempSingle').setValue('single');
          } else {
            fields.get('tempSingle').setValue('multiple');
          }
          for (let i = 0; i < data.mashingTargets.mashingTargetTemperatures.length; i++) {
            temp.insert(i, this.formBuilder.group(data.mashingTargets.mashingTargetTemperatures[i]));
            temp.removeAt(data.mashingTargets.mashingTargetTemperatures.length);
          }
        }
        fields.disable();
      });
    }
  }

  setBrewLogForm(data) {
    if (data.hops != null) {
      const testArray = [];
      for (let i = 0; i < data.hops.length; i++) {
        if (data.hops[i].additionalHopesStatus) {
          this.additionalHopsArray.insert(i, this.formBuilder.group(data.hops[i]));
          testArray.push(data.adjuncts[i]);
        }
        this.additionalHopsArray.disable();
      }
      if (testArray.length === 0) {
        this.addAdditionalHops();
        this.additionalHopsArray.disable();
      }
    }

    if (data.adjuncts != null) {
      const testArray = [];
      for (let i = 0; i < data.adjuncts.length; i++) {
        if (data.adjuncts[i].additionalAdjunctsStatus) {
          this.additionalAdjunctsArray.insert(i, this.formBuilder.group(data.adjuncts[i]));
          testArray.push(data.adjuncts[i]);
        }
        this.additionalAdjunctsArray.disable();
      }
      if (testArray.length === 0) {
        this.addAdditionalAdjuncts();
        this.additionalAdjunctsArray.disable();
      }
    }

    if (data.sparges != null) {
      let spargeFlag = true;
      for (let i = 0; i < data.sparges.length; i++) {
        this.spargeArray.insert(i, this.formBuilder.group(data.sparges[i]));
        if (data.sparges[i]) {
          spargeFlag = false;
        }
        this.spargeArray.disable();
      }
      if (spargeFlag) {
        this.addSparge();
        this.spargeArray.disable();
      }
    }

    if (data.kettleTargets != null) {
      this.addKettleTargets();
      this.kettleTargetsArray.controls.forEach(fields => {
        fields.get('Id').setValue(data.kettleTargets.id);
        fields.get('BoilLength').setValue(data.kettleTargets.boilLength);
        fields.get('BoilLengthUnitId').setValue(data.kettleTargets.boilLengthUnitId);
        fields.get('VolumePreBoil').setValue(data.kettleTargets.volumePreBoil);
        fields.get('VolumePreBoilUnitId').setValue(data.kettleTargets.volumePreBoilUnitId);
        fields.get('VolumePostBoil').setValue(data.kettleTargets.volumePostBoil);
        fields.get('VolumePostBoilUnitId').setValue(data.kettleTargets.volumePostBoilUnitId);
        fields.get('Plato').setValue(data.kettleTargets.plato);
        fields.get('Gravity').setValue(data.kettleTargets.Gravity);
        fields.get('Ph').setValue(data.kettleTargets.ph);
        fields.get('Notes').setValue(data.kettleTargets.notes);
        fields.disable();
      });
    }

    if (data.whirlpoolTarget != null) {
      this.addWhirlpoolTarget();
      this.whirlpoolTargetArray.controls.forEach(fields => {
        fields.get('Id').setValue(data.whirlpoolTarget.id);
        fields.get('PostBoilVolume').setValue(data.whirlpoolTarget.postBoilVolume);
        fields.get('PostBoilVolumeunitId').setValue(data.whirlpoolTarget.postBoilVolumeUnitId);
        fields.get('Notes').setValue(data.whirlpoolTarget.notes);
        fields.disable();
      });
    }

    if (data.coolingKnockoutTarget != null) {
      this.addCoolingKnockoutTargets();
      this.coolingKnockoutTargetsArray.controls.forEach(fields => {
        fields.get('Id').setValue(data.coolingKnockoutTarget.id);
        fields.get('VolumeInFermentation').setValue(data.coolingKnockoutTarget.volumeInFermentation);
        fields.get('VolumeInFermentationOptionId').setValue(data.coolingKnockoutTarget.volumeInFermentationOptionId);
        fields.get('Notes').setValue(data.coolingKnockoutTarget.notes);
        fields.disable();
      });
    }

  }

  setFermentForm(data) {
    if (data.fermentationTargets != null) {
      this.addFermentationTargets();
      this.fermentationTargetsArray.controls.forEach(fields => {
        fields.get('VolumeIn').setValue(data.fermentationTargets.volumeIn);
        fields.get('VolumeInUnitId').setValue(data.fermentationTargets.volumeInUnitId);
        fields.get('Temperature').setValue(data.fermentationTargets.temperature);
        fields.get('TemperatureUnitId').setValue(data.fermentationTargets.temperatureUnitId);
        fields.get('Pressure').setValue(data.fermentationTargets.pressure);
        fields.get('PressureUnitId').setValue(data.fermentationTargets.pressureUnitId);
        fields.get('Ph').setValue(data.fermentationTargets.ph);
        fields.get('Plato').setValue(data.fermentationTargets.plato);
        fields.disable();
      });
    }

    if (data.diacetylRest != null) {
      this.addDiacetylRest();
      this.diacetylRestArray.controls.forEach(fields => {
        fields.get('Temperature').setValue(data.diacetylRest.temperature);
        fields.get('TemperatureUnitId').setValue(data.diacetylRest.temperatureUnitId);
        fields.get('Plato').setValue(data.diacetylRest.plato);
        fields.get('SpecificGravity').setValue(data.diacetylRest.SpecificGravity);
        fields.disable();
      });
    }

    if (data.aging != null) {
      this.addAging();
      this.agingArray.controls.forEach(fields => {
        fields.get('TimeDuration').setValue(data.aging.timeDuration);
        fields.get('TimeDurationUnitId').setValue(data.aging.timeDurationUnitId);
        fields.get('Temperature').setValue(data.aging.temperature);
        fields.get('TemperatureUnitId').setValue(data.aging.temperatureUnitId);
        fields.disable();
      });
    }


    if (data.yeast != null) {
      this.addYeast();
      this.yeastArray.controls.forEach(fields => {
        fields.get('Name').setValue(data.yeast.name);
        fields.get('YeastStrainId').setValue(data.yeast.yeastStrainId);
        fields.get('CountryId').setValue(data.yeast.countryId);
        fields.get('SupplierId').setValue(data.yeast.supplierId);
        fields.disable();
      });
    }
  }

  setConditioningForm(data) {
    if (data.conditioningTargets != null) {
      this.addConditioningTargets();
      this.conditioningTargetsArray.controls.forEach(fields => {
        fields.get('VolumeIn').setValue(data.conditioningTargets.volumeIn);
        fields.get('VolumeInUnitId').setValue(data.conditioningTargets.volumeInUnitId);
        fields.get('Temperature').setValue(data.conditioningTargets.temperature);
        fields.get('TemperatureUnitId').setValue(data.conditioningTargets.temperatureUnitId);
        fields.get('Pressure').setValue(data.conditioningTargets.pressure);
        fields.get('PressureUnitId').setValue(data.conditioningTargets.pressureUnitId);
        fields.get('Ph').setValue(data.conditioningTargets.ph);
        fields.get('Plato').setValue(data.conditioningTargets.plato);
        fields.get('SpecificGravity').setValue(data.conditioningTargets.SpecificGravity);
        fields.get('Co2').setValue(data.conditioningTargets.co2);
        fields.get('Co2UnitId').setValue(data.conditioningTargets.co2UnitId);
        fields.get('Notes').setValue(data.conditioningTargets.notes);
        fields.disable();
      });
    }

    if (data.filterationTargets != null) {
      this.addFilterationTargets();
      this.filterationTargetsArray.controls.forEach(fields => {
        fields.get('Temperature').setValue(data.filterationTargets.temperature);
        fields.get('TemperatureUnitId').setValue(data.filterationTargets.temperatureUnitId);
        fields.get('Notes').setValue(data.filterationTargets.notes);
        fields.disable();
      });
    }

    if (data.carbonationTargets != null) {
      this.addCarbonationTargets();
      this.carbonationTargetsArray.controls.forEach(fields => {
        fields.get('Ph').setValue(data.carbonationTargets.ph);
        fields.get('Pressure').setValue(data.carbonationTargets.pressure);
        fields.get('PressureUnitId').setValue(data.carbonationTargets.pressureUnitId);
        fields.get('Notes').setValue(data.carbonationTargets.notes);
        fields.disable();
      });
    }
  }

  backButtonClick() {
    this.router.navigate(['app/recipes']);
  }

  gotoTop() {
    this.scrolltop.scrollTo(0, 0);
  }

  downloadAsPDF() {
    const div = document.getElementById('pdfDiv');
    html2canvas(div).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = canvas.height * imgWidth / canvas.width;
      let heightLeft = imgHeight;
      const doc = new jsPDF('p', 'mm');
      let position = 0;
      doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      doc.save(`${this.recipeName}.pdf`);
    });
  }

  savePdf(pdf) {
    pdf.saveAs(`${this.recipeName}.pdf`);
  }
}
