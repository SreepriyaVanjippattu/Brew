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
import { HttpErrorResponse } from '@angular/common/http';


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
    id: [''],
    name: [''],
    styleId: [''],
    totalBrews: '',
    batchSize: [''],
    batchSizeUnitId: [''],
    brewHouseEfficiency: [''],
    abv: [''],
    ibus: [''],
    tenantId: [''],
    createdDate: [''],
    modifiedDate: [''],
    yeastStrainId: [''],
    statusId: [''],
    isActive: [''],
    maltGrainBills: this.formBuilder.array([]),
    waterAdditions: this.formBuilder.array([]),
    hops: this.formBuilder.array([]),
    adjuncts: this.formBuilder.array([]),
    additionalHops: this.formBuilder.array([]),
    additionalAdjuncts: this.formBuilder.array([]),
    mashingTargets: this.formBuilder.array([]),
    recipeNotes: this.formBuilder.array([]),
    kettleTargets: this.formBuilder.array([]),
    sparges: this.formBuilder.array([]),
    whirlpoolTarget: this.formBuilder.array([]),
    coolingKnockoutTarget: this.formBuilder.array([]),
    fermentationTargets: this.formBuilder.array([]),
    aging: this.formBuilder.array([]),
    yeast: this.formBuilder.array([]),
    conditioningTargets: this.formBuilder.array([]),
    filterationTargets: this.formBuilder.array([]),
    carbonationTargets: this.formBuilder.array([]),
  });

  get form() {
    return this.recipeDetailsForm.controls;
  }

  get maltGrainBillArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('maltGrainBills');
  }

  get waterAdditionsArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('waterAdditions');
  }

  get hopsArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('hops');
  }

  get adjunctsArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('adjuncts');
  }

  get additionalHopsArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('additionalHops');
  }

  get additionalAdjunctsArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('additionalAdjuncts');
  }

  get mashingTargetsArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('mashingTargets');
  }

  get recipeNotesArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('recipeNotes');
  }

  get kettleTargetsArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('kettleTargets');
  }

  get spargeArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('sparges');
  }

  get whirlpoolTargetArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('whirlpoolTarget');
  }

  get WhirlpoolTargetForms() {
    return this.recipeDetailsForm.controls.whirlpoolTarget as FormGroup;
  }

  get coolingKnockoutTargetsArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('coolingKnockoutTarget');
  }

  get fermentationTargetsArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('fermentationTargets');
  }

  get agingArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('aging');
  }

  get yeastArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('yeast');
  }

  get conditioningTargetsArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('conditioningTargets');
  }

  get filterationTargetsArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('filterationTargets');
  }

  get carbonationTargetsArray(): FormArray {
    return <FormArray>this.recipeDetailsForm.get('carbonationTargets');
  }

  ngOnInit() {
    this.recipeId = this.route.snapshot.params.id;
    const user = JSON.parse(sessionStorage.getItem('user'));
    this.tenantId = user['userDetails'].tenantId;
    this.getRecipeDetailsEdit(this.tenantId);
    this.getAllRecipeSystemData();
    this.getYeastStrain();
    this.recipeDetailsForm.disable();
  }
  getAllRecipeSystemData() {
    const getAllRecipeSystemDataAPI = String.Format(this.apiService.getRecipeMasterDetails, this.tenantId);
    this.apiService.getDataList(getAllRecipeSystemDataAPI).subscribe(response => {
      if (response) {
        this.addins = response['body'].addIns;
        this.countries = response['body'].countries;
        this.suppliers = response['body'].suppliers;
        this.maltTypes = response['body'].maltGrainTypes;
        this.styles = response['body'].styles;
        this.units = response['body'].unitTypes;
        this.getPreferenceUsed();
      }
    });
  }

  findUnits() {
    if (this.units) {
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
        this.preference = response['body'].preferences;
        this.findUnits();
      }
    });
  }



  getYeastStrain() {
    const getAllYeastStrainsAPI = String.Format(this.apiService.getAllYeastStrains, this.tenantId);
    this.apiService.getData(getAllYeastStrainsAPI).subscribe(response => {
      if (response) {
        this.yeastStrain = response['body'].yeastStrains;
      }
    });
  }



  getRecipeDetailsEdit(tenantId) {
    const getRecipebyIdAPI = String.Format(this.apiService.getRecipebyId, this.tenantId, this.recipeId);
    this.apiService.getDataList(getRecipebyIdAPI).subscribe(response => {
      if (response && response['body']) {
        this.recipeContent = response.body.recipe;
        this.recipeName = this.recipeContent.name;

        if (this.recipeContent.kettleTargets.platoUnitId || this.recipeContent.sparges.length !== 0 &&
          this.recipeContent.sparges[0].platoUnitId ||
          this.recipeContent.conditioningTargets.platoUnitId ||
          this.recipeContent.fermentationTargets.platoUnitId) {

          this.platoUnitIdFromDb = this.recipeContent.kettleTargets.platoUnitId || this.recipeContent.sparges.length !== 0 &&
            this.recipeContent.sparges[0].platoUnitId ||
            this.recipeContent.conditioningTargets.platoUnitId ||
            this.recipeContent.fermentationTargets.platoUnitId;

          if (this.recipeContent.mashingTargets.strikeWaterTemperatureUnitTypeId ||
            this.recipeContent.mashingTargets.mashingTargetTemperatures[0].temperatureUnitTypeId
          ) {
            this.tempUnitIdFromDb = this.recipeContent.mashingTargets.strikeWaterTemperatureUnitTypeId ||
              this.recipeContent.mashingTargets.mashingTargetTemperatures[0].temperatureUnitTypeId;
          }
        }
        this.findUnits();
        this.setDataToEdit(this.recipeContent);
        this.initiateFormArrays();
      }
    });
  }

  addMaltBill() {
    const control = <FormArray>this.recipeDetailsForm.controls['maltGrainBills'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        recipeId: [this.recipeId],
        name: [''],
        maltGrainTypeId: [''],
        countryId: [''],
        supplierId: [''],
        quantity: [''],
        quantityUnitId: [''],
        grainBillPercentage: [''],
        srm: [''],
        potential: [''],
        isActive: [null],
        createdDate: ['2019-01-01T00:00:00'],
        modifiedDate: ['2019-01-01T00:00:00'],
        tenantId: [this.tenantId],
      }));
  }

  addWaterAdditions() {
    const control = <FormArray>this.recipeDetailsForm.controls['waterAdditions'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        recipeId: [this.recipeId],
        cacl2: [''],
        cacl2unitId: [''],
        gypsum: [''],
        gypsumUnitId: [''],
        tableSalt: [''],
        tableSaltUnitId: [''],
        epsomSalt: [''],
        epsomSaltUnitId: [''],
        caCo3: [''],
        caCo3unitId: [''],
        bakingSoda: [''],
        bakingSodaUnitId: [''],
        h3po4: [''],
        h3po4unitId: [''],
        isActive: [null],
        createdDate: ['2019-01-01T00:00:00'],
        modifiedDate: ['2019-01-01T00:00:00'],
        tenantId: [this.tenantId],
      }));
  }

  addHops() {
    const control = <FormArray>this.recipeDetailsForm.controls['hops'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        recipeId: [this.recipeId],
        name: [''],
        maltGrainTypeId: [''],
        countryId: [''],
        supplierId: [''],
        alpha: [''],
        quantity: [''],
        quantityUnitTypeId: [''],
        addInId: [''],
        timeIn: [''],
        timeInUnitId: [''],
        additionalHopesStatus: [false],
        isActive: [false],
        createdDate: ['2019-01-01T00:00:00'],
        modifiedDate: ['2019-01-01T00:00:00'],
        tenantId: [this.tenantId],
      }));
  }

  addAdjuncts() {
    const control = <FormArray>this.recipeDetailsForm.controls['adjuncts'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        recipeId: [this.recipeId],
        name: [''],
        supplierId: [''],
        quantity: [''],
        QuantityUnitId: [''],
        addInId: [''],
        timeIn: [''],
        timeInUnitId: [''],
        additionalAdjunctsStatus: [false],
        isActive: [null],
        createdDate: ['2019-01-01T00:00:00'],
        modifiedDate: ['2019-01-01T00:00:00'],
        tenantId: [this.tenantId],
        countryId: [''],
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
        mashingTargetTemperatures: this.formBuilder.array([this.mashingTargetsTemperature]),
      }),
    );
  }

  addRecipeNotes() {
    const control = <FormArray>this.recipeDetailsForm.controls['recipeNotes'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        recipeId: [this.recipeId],
        notes: [''],
        isActive: [''],
        createdDate: ['2019-01-01T00:00:00'],
        modifiedDate: ['2019-01-01T00:00:00'],
        tenantId: [this.tenantId],
      }),
    );
  }

  addKettleTargets() {
    const control = <FormArray>this.recipeDetailsForm.controls['kettleTargets'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        receipeId: [this.recipeId],
        boilLength: [''],
        boilLengthUnitId: [''],
        volumePreBoil: [''],
        volumePreBoilUnitId: ['1D211DBF-1A2C-470F-9795-6001C627AC44'],
        volumePostBoil: [''],
        volumePostBoilUnitId: [''],
        plato: [''],
        gravity: [''],
        ph: [''],
        notes: [''],
        isActive: [true],
        createdDate: ['2019-01-01T00:00:00'],
        modifiedDate: ['2019-01-01T00:00:00'],
        tenantId: [this.tenantId],
      }));
  }

  addSparge() {
    const control = <FormArray>this.recipeDetailsForm.controls['sparges'];
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
    const control = <FormArray>this.recipeDetailsForm.controls['whirlpoolTarget'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        recipeId: [this.recipeId],
        postBoilVolume: [''],
        postBoilVolumeUnitId: [''],
        notes: [''],
        isActive: [true],
        createdDate: ['2019-01-01T00:00:00'],
        modifiedDate: ['2019-01-01T00:00:00'],
        tenantId: [this.tenantId],
      }));
  }

  addCoolingKnockoutTargets() {
    const control = <FormArray>this.recipeDetailsForm.controls['coolingKnockoutTarget'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        recipeId: [this.recipeId],
        volumeInFermentation: [''],
        volumeInFermentationOptionId: [''],
        notes: [''],
        isActive: [true],
        createdDate: ['2019-01-01T00:00:00'],
        modifiedDate: ['2019-01-01T00:00:00'],
        tenantId: [this.tenantId],
      }));
  }

  addAdditionalHops() {
    const control = <FormArray>this.recipeDetailsForm.controls['additionalHops'];
    control.push(this.formBuilder.group({
      id: [Guid.raw()],
      recipeId: [this.recipeId],
      name: [''],
      maltGrainTypeId: [''],
      countryId: [''],
      supplierId: [''],
      alpha: [''],
      quantity: [''],
      quantityUnitTypeId: [''],
      addInId: [''],
      additionalHopesStatus: [true],
      isActive: [false],
      createdDate: ['2019-01-01T00:00:00'],
      modifiedDate: ['2019-01-01T00:00:00'],
      tenantId: [this.tenantId],
    }));
  }

  addAdditionalAdjuncts() {
    const control = <FormArray>this.recipeDetailsForm.controls['additionalAdjuncts'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        recipeId: [this.recipeId],
        name: [''],
        supplierId: [''],
        quantity: [''],
        QuantityUnitId: [''],
        addInId: [''],
        additionalAdjunctsStatus: [true],
        isActive: [null],
        createdDate: ['2019-01-01T00:00:00'],
        modifiedDate: ['2019-01-01T00:00:00'],
        tenantId: [this.tenantId],
        countryId: [''],
      }),
    );
  }

  addFermentationTargets() {
    const control = <FormArray>this.recipeDetailsForm.controls['fermentationTargets'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        recipeId: [this.recipeId],
        volumeIn: [''],
        volumeInUnitId: [''],
        temperature: [''],
        temperatureUnitId: ['29948d48-3bca-4786-a465-78e42693604f'],
        pressure: [''],
        pressureUnitId: ['29948d48-3bca-4786-a465-78e42693604f'],
        ph: [''],
        plato: [''],
        platoUnitId: [this.platoUnitId],
        isActive: [true],
        createdDate: ['2019-01-01T00:00:00'],
        modifiedDate: ['2019-01-01T00:00:00'],
        tenantId: [this.tenantId],
      }));
  }

  addAging() {
    const control = <FormArray>this.recipeDetailsForm.controls['aging'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        receipeId: [this.recipeId],
        timeDuration: [''],
        timeDurationUnitId: [''],
        temperature: [''],
        temperatureUnitId: ['29948d48-3bca-4786-a465-78e42693604f'],
        isActive: [true],
        createdDate: ['2019-01-01T00:00:00'],
        modifiedDate: ['2019-01-01T00:00:00'],
        tenantId: [this.tenantId],
      }));
  }

  addYeast() {
    const control = <FormArray>this.recipeDetailsForm.controls['yeast'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        name: [''],
        recipeId: [this.recipeId],
        yeastStrainId: [''],
        countryId: [''],
        pitchRate : [''],
        pitchRateUnitId: ['a6190eaa-8dc5-400c-a5f6-b72468fa3d5c'],
        quantityUnitId: ['a6190eaa-8dc5-400c-a5f6-b72468fa3d5c'],
        supplierId: [''],
        isActive: [true],
        createdDate: ['2019-01-01T00:00:00'],
        modifiedDate: ['2019-01-01T00:00:00'],
        tenantId: [this.tenantId],
      }));
  }

  addConditioningTargets() {
    const control = <FormArray>this.recipeDetailsForm.controls['conditioningTargets'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        recipeId: [this.recipeId],
        volumeIn: [''],
        volumeInUnitId: [''],
        temperature: [''],
        temperatureUnitId: ['1D211DBF-1A2C-470F-9795-6001C627AC44'],
        pressure: [''],
        pressureUnitId: ['1D211DBF-1A2C-470F-9795-6001C627AC44'],
        ph: [''],
        plato: [''],
        specificGravity: [''],
        co2: [''],
        co2UnitId: [''],
        notes: [''],
        isActive: [true],
        createdDate: ['2019-01-01T00:00:00'],
        modifiedDate: ['2019-01-01T00:00:00'],
        tenantId: [this.tenantId],
      }));
  }

  addFilterationTargets() {
    const control = <FormArray>this.recipeDetailsForm.controls['filterationTargets'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        recipeId: [this.recipeId],
        temperature: [''],
        temperatureUnitId: ['1D211DBF-1A2C-470F-9795-6001C627AC44'],
        notes: [''],
        isActive: [true],
        createdDate: ['2019-01-01T00:00:00'],
        modifiedDate: ['2019-01-01T00:00:00'],
        tenantId: [this.tenantId],
      }));
  }

  addCarbonationTargets() {
    const control = <FormArray>this.recipeDetailsForm.controls['carbonationTargets'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        recipeId: [this.recipeId],
        ph: [''],
        pressure: [''],
        pressureUnitId: ['1D211DBF-1A2C-470F-9795-6001C627AC44'],
        notes: [''],
        isActive: [true],
        createdDate: ['2019-01-01T00:00:00'],
        modifiedDate: ['2019-01-01T00:00:00'],
        tenantId: [this.tenantId],
      }));
  }

  initiateFormArrays() {

    if (this.recipeContent.maltGrainBills === null) {
      const maltGrainBills = (this.recipeDetailsForm.get('maltGrainBills') as FormArray);
      this.addMaltBill();
    }
    if (this.recipeContent.waterAdditions === null) {
      const waterAdditions = (this.recipeDetailsForm.get('waterAdditions') as FormArray);
      this.addWaterAdditions();
    }
    if (this.recipeContent.hops === null) {
      const hops = (this.recipeDetailsForm.get('hops') as FormArray);
      this.addHops();
      this.addAdditionalHops();
    }
    if (this.recipeContent.adjuncts === null) {
      const adjuncts = (this.recipeDetailsForm.get('adjuncts') as FormArray);
      this.addAdjuncts();
      this.addAdditionalAdjuncts();
    }
    if (this.recipeContent.mashingTargets === null) {
      const MashinTargets = (this.recipeDetailsForm.get('mashingTargets') as FormArray);
      this.addMashingTargets();
    }
    if (this.recipeContent.recipeNotes === null) {
      const recipeNotes = this.recipeDetailsForm.get('recipeNotes') as FormArray;
      this.addRecipeNotes();
    }
    if (this.recipeContent.kettleTargets === null) {
      const kettleTargets = this.recipeDetailsForm.get('kettleTargets') as FormArray;
      this.addKettleTargets();
    }
    if (this.recipeContent.sparges === null) {
      const sparges = this.recipeDetailsForm.get('sparges') as FormArray;
      this.addSparge();
    }
    if (this.recipeContent.whirlpoolTarget === null) {
      const whirlpoolTarget = this.recipeDetailsForm.get('whirlpoolTarget') as FormArray;
      this.addWhirlpoolTarget();
    }
    if (this.recipeContent.coolingKnockoutTarget === null) {
      const coolingKnockoutTarget = this.recipeDetailsForm.get('coolingKnockoutTarget') as FormArray;
      this.addCoolingKnockoutTargets();
    }
    if (this.recipeContent.fermentationTargets === null) {
      const fermentationTargetsArray = this.recipeDetailsForm.get('fermentationTargets') as FormArray;
      this.addFermentationTargets();
    }
    if (this.recipeContent.aging === null) {
      const agingArray = this.recipeDetailsForm.get('aging') as FormArray;
      this.addAging();
    }
    if (this.recipeContent.yeast === null) {
      const yeastArray = this.recipeDetailsForm.get('yeast') as FormArray;
      this.addYeast();
    }
    if (this.recipeContent.conditioningTargets === null) {
      const conditioningTargetsArray = this.recipeDetailsForm.get('conditioningTargets') as FormArray;
      this.addConditioningTargets();
    }
    if (this.recipeContent.filterationTargets === null) {
      const filterationTargetsArray = this.recipeDetailsForm.get('filterationTargets') as FormArray;
      this.addFilterationTargets();
    }
    if (this.recipeContent.carbonationTargets === null) {
      const carbonationTargetsArray = this.recipeDetailsForm.get('carbonationTargets') as FormArray;
      this.addCarbonationTargets();
    }
  }

  setDataToEdit(data) {
    if (data) {
      this.recipeDetailsForm.get('name').setValue(data.name);
      this.recipeDetailsForm.get('brewHouseEfficiency').setValue(data.brewHouseEfficiency);
      this.recipeDetailsForm.get('batchSize').setValue(data.batchSize);
      this.recipeDetailsForm.get('abv').setValue(data.abv);
      this.recipeDetailsForm.get('ibus').setValue(data.ibus);
      this.recipeDetailsForm.get('styleId').setValue(data.styleId);
      this.recipeDetailsForm.get('batchSizeUnitId').setValue(data.batchSizeUnitId);

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
        fields.get('notes').setValue(data.recipeNotes.notes);
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
          const temp = <FormArray>fields.get('mashingTargetTemperatures');
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
        fields.get('id').setValue(data.kettleTargets.id);
        fields.get('boilLength').setValue(data.kettleTargets.boilLength);
        fields.get('boilLengthUnitId').setValue(data.kettleTargets.boilLengthUnitId);
        fields.get('volumePreBoil').setValue(data.kettleTargets.volumePreBoil);
        fields.get('volumePreBoilUnitId').setValue(data.kettleTargets.volumePreBoilUnitId);
        fields.get('volumePostBoil').setValue(data.kettleTargets.volumePostBoil);
        fields.get('volumePostBoilUnitId').setValue(data.kettleTargets.volumePostBoilUnitId);
        fields.get('plato').setValue(data.kettleTargets.plato);
        fields.get('gravity').setValue(data.kettleTargets.gravity);
        fields.get('ph').setValue(data.kettleTargets.ph);
        fields.get('notes').setValue(data.kettleTargets.notes);
        fields.disable();
      });
    }

    if (data.whirlpoolTarget != null) {
      this.addWhirlpoolTarget();
      this.whirlpoolTargetArray.controls.forEach(fields => {
        fields.get('id').setValue(data.whirlpoolTarget.id);
        fields.get('postBoilVolume').setValue(data.whirlpoolTarget.postBoilVolume);
        fields.get('postBoilVolumeUnitId').setValue(data.whirlpoolTarget.postBoilVolumeUnitId);
        fields.get('notes').setValue(data.whirlpoolTarget.notes);
        fields.disable();
      });
    }

    if (data.coolingKnockoutTarget != null) {
      this.addCoolingKnockoutTargets();
      this.coolingKnockoutTargetsArray.controls.forEach(fields => {
        fields.get('id').setValue(data.coolingKnockoutTarget.id);
        fields.get('volumeInFermentation').setValue(data.coolingKnockoutTarget.volumeInFermentation);
        fields.get('volumeInFermentationOptionId').setValue(data.coolingKnockoutTarget.volumeInFermentationOptionId);
        fields.get('notes').setValue(data.coolingKnockoutTarget.notes);
        fields.disable();
      });
    }

  }

  setFermentForm(data) {
    if (data.fermentationTargets != null) {
      this.addFermentationTargets();
      this.fermentationTargetsArray.controls.forEach(fields => {
        fields.get('volumeIn').setValue(data.fermentationTargets.volumeIn);
        fields.get('volumeInUnitId').setValue(data.fermentationTargets.volumeInUnitId);
        fields.get('temperature').setValue(data.fermentationTargets.temperature);
        fields.get('temperatureUnitId').setValue(data.fermentationTargets.temperatureUnitId);
        fields.get('pressure').setValue(data.fermentationTargets.pressure);
        fields.get('pressureUnitId').setValue(data.fermentationTargets.pressureUnitId);
        fields.get('ph').setValue(data.fermentationTargets.ph);
        fields.get('plato').setValue(data.fermentationTargets.plato);
        fields.disable();
      });
    }

    if (data.aging != null) {
      this.addAging();
      this.agingArray.controls.forEach(fields => {
        fields.get('timeDuration').setValue(data.aging.timeDuration);
        fields.get('timeDurationUnitId').setValue(data.aging.timeDurationUnitId);
        fields.get('temperature').setValue(data.aging.temperature);
        fields.get('temperatureUnitId').setValue(data.aging.temperatureUnitId);
        fields.disable();
      });
    }


    if (data.yeast != null) {
      this.addYeast();
      this.yeastArray.controls.forEach(fields => {
        fields.get('name').setValue(data.yeast.name);
        fields.get('yeastStrainId').setValue(data.yeast.yeastStrainId);
        fields.get('countryId').setValue(data.yeast.countryId);
        fields.get('supplierId').setValue(data.yeast.supplierId);
        fields.get('pitchRate').setValue(data.yeast.pitchRate);
        fields.get('pitchRateUnitId').setValue(data.yeast.pitchRateUnitId);
        fields.get('quantityUnitId').setValue(data.yeast.quantityUnitId);
        fields.disable();
      });
    }
  }

  setConditioningForm(data) {
    if (data.conditioningTargets != null) {
      this.addConditioningTargets();
      this.conditioningTargetsArray.controls.forEach(fields => {
        fields.get('volumeIn').setValue(data.conditioningTargets.volumeIn);
        fields.get('volumeInUnitId').setValue(data.conditioningTargets.volumeInUnitId);
        fields.get('temperature').setValue(data.conditioningTargets.temperature);
        fields.get('temperatureUnitId').setValue(data.conditioningTargets.temperatureUnitId);
        fields.get('pressure').setValue(data.conditioningTargets.pressure);
        fields.get('pressureUnitId').setValue(data.conditioningTargets.pressureUnitId);
        fields.get('ph').setValue(data.conditioningTargets.ph);
        fields.get('plato').setValue(data.conditioningTargets.plato);
        fields.get('specificGravity').setValue(data.conditioningTargets.specificGravity);
        fields.get('co2').setValue(data.conditioningTargets.co2);
        fields.get('co2UnitId').setValue(data.conditioningTargets.co2UnitId);
        fields.get('notes').setValue(data.conditioningTargets.notes);
        fields.disable();
      });
    }

    if (data.filterationTargets != null) {
      this.addFilterationTargets();
      this.filterationTargetsArray.controls.forEach(fields => {
        fields.get('temperature').setValue(data.filterationTargets.temperature);
        fields.get('temperatureUnitId').setValue(data.filterationTargets.temperatureUnitId);
        fields.get('notes').setValue(data.filterationTargets.notes);
        fields.disable();
      });
    }

    if (data.carbonationTargets != null) {
      this.addCarbonationTargets();
      this.carbonationTargetsArray.controls.forEach(fields => {
        fields.get('ph').setValue(data.carbonationTargets.ph);
        fields.get('pressure').setValue(data.carbonationTargets.pressure);
        fields.get('pressureUnitId').setValue(data.carbonationTargets.pressureUnitId);
        fields.get('notes').setValue(data.carbonationTargets.notes);
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
