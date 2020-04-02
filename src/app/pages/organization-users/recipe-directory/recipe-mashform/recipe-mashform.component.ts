import { Component, OnInit, LOCALE_ID } from '@angular/core';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators, FormArray, FormGroup } from '@angular/forms';
import { formData } from '../../../../models/formData';
import { Guid } from 'guid-typescript';
import { NbToastrService } from '@nebular/theme';
import { String } from 'typescript-string-operations';

@Component({
  selector: 'app-recipe-mashform',
  templateUrl: './recipe-mashform.component.html',
  styleUrls: ['./recipe-mashform.component.scss'],
})

export class RecipeMashformComponent implements OnInit {

  isCollapsedReceipe = false;
  isCollapsedMalt = true;
  isCollapsedWater = true;
  isCollapsedHops = true;
  isCollapsedMashing = true;
  isCollapsedNotes = true;
  isCollapsedAdjuncts = true;
  formSubmitted = false;
  showMultiTemps = false;

  units: any;
  userDetails: string;
  tenantId: string;
  countryId: string;
  recipeId: string;
  statusId: any;
  preferedUnit: any;
  recipeMashForm = this.formBuilder.group({
    maltGrainBill: this.formBuilder.array([]),
    waterAdditions: this.formBuilder.array([]),
    hops: this.formBuilder.array([]),
    adjuncts: this.formBuilder.array([]),
    mashingTargets: this.formBuilder.array([]),
    recipeNotes: this.formBuilder.array([]),
    id: [''],
    name: ['', [Validators.required]],
    styleId: ['', [Validators.required]],
    totalBrews: '',
    batchSize: ['', [Validators.required]],
    batchSizeUnitId: ['58c07c47-a13e-4464-bec8-628fe11f027a'],
    brewHouseEfficiency: ['', [Validators.required]],
    abv: ['', [Validators.required]],
    ibus: ['', [Validators.required]],
    tenantId: [''],
    createdDate: ['2019-01-01T00:00:00'],
    modifiedDate: ['2019-01-01T00:00:00'],
    yeastStrainId: [''],
    statusId: [''],
    isActive: [''],
  });

  modalForms = this.formBuilder.group({
    styleText: [''],
    typeText: [''],
    supplierText: [''],
  });

  countries: any;
  addins: any;
  suppliers: any;
  maltTypes: any;
  styles: any;
  indexHops = [];
  indexAdjuncts = [];
  page: any;
  singleRecipeDetails: any;
  mashinClicked = false;
  brewlogClicked = false;
  fermentationClicked = false;
  conditioningClicked = false;
  disableSave = false;
  preference: any;
  pageHeader: string;
  id: string;
  newHopsArray: any = [];
  newAdjunctsArray: any = [];
  newWaterArray: any = [];
  newMaltArray: any = [];
  removeStatus: boolean = false;
  tempUnitIdFromDb: any;
  preferedTempUnit: any;
  styleName: any;

  constructor(private apiService: ApiProviderService,
    private formBuilder: FormBuilder,
    private toast: NbToastrService,
    private router: Router,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.page = this.route.snapshot.url[0].path;
    this.userDetails = sessionStorage.user;
    const user = JSON.parse(this.userDetails);
    this.tenantId = user['userDetails'].tenantId;
    if (sessionStorage.page === 'edit') {
      this.pageHeader = 'Edit Recipe';
      this.isCollapsedMalt = false;
      this.isCollapsedWater = false;
      this.isCollapsedHops = false;
      this.isCollapsedMashing = false;
      this.isCollapsedNotes = false;
      this.isCollapsedAdjuncts = false;
    } else {
      this.pageHeader = 'Add New Recipe';
    }
    if (this.page === 'edit-recipe') {
      this.recipeId = this.route.snapshot.params.id;
      sessionStorage.RecipeId = this.route.snapshot.params.id;
      this.getRecipeDetailsById(this.recipeId);
    } else if (sessionStorage.RecipeId) {
      this.recipeId = sessionStorage.RecipeId;
      this.getRecipeDetailsById(this.recipeId);
    } else {
      this.recipeId = Guid.raw();
      this.statusId = '966F3F12-E4E4-45EA-A6BF-3AE312BE0CCB';
    }

    if (!sessionStorage.styles || !sessionStorage.addins ||
      !sessionStorage.suppliers || !sessionStorage.maltTypes ||
      !sessionStorage.countries || !sessionStorage.unitTypes) {
      this.getCountries();
      this.getAddIns();
      this.getMaltTypes();
      this.getStyles();
      this.getSuppliers();
      this.getUnitTypes();
    } else {
      this.styles = JSON.parse(sessionStorage.styles);
      this.addins = JSON.parse(sessionStorage.addins);
      this.countries = JSON.parse(sessionStorage.countries);
      this.maltTypes = JSON.parse(sessionStorage.maltTypes);
      this.suppliers = JSON.parse(sessionStorage.suppliers);
      this.units = JSON.parse(sessionStorage.unitTypes);
    }
    this.getPreferenceUsed()
  }

  getPreferenceUsed() {
    const getPreferenceSettingsAPI = String.Format(this.apiService.getPreferenceSettings, this.tenantId);
    this.apiService.getDataList(getPreferenceSettingsAPI).subscribe((response: any) => {
      if (response.status === 200) {
        this.preference = response['body'].preferenceSettings;
        sessionStorage.setItem('preferenceUsed', JSON.stringify(this.preference));
        this.findUnits();
        this.initiateFormArrays();
      }
    });
  }

  findUnits() {
    this.units.forEach(element => {
      if (!this.tempUnitIdFromDb && element.id === this.preference.temperatureId) {
        this.preferedUnit = element.symbol;
        this.preferedTempUnit = element.id;
      }
      if (this.tempUnitIdFromDb && element.id === this.tempUnitIdFromDb) {
        this.preferedUnit = element.symbol;
        this.preferedTempUnit = element.id;
      }
    });
  }

  styleChange() {
    let styleId = this.recipeMashForm.value.styleId;
    this.styleName = this.styles.find(element => element.id === styleId).name;
  }

  getRecipeDetailsById(recipeId) {
    const getRecipebyIdAPI = String.Format(this.apiService.getRecipebyId, this.tenantId, recipeId);
    this.apiService.getDataList(getRecipebyIdAPI).subscribe(response => {
      this.singleRecipeDetails = response['body'].recipe;
      if (this.singleRecipeDetails.mashingTargets.strikeWaterTemperatureUnitTypeId ||
        this.singleRecipeDetails.mashingTargets.mashingTargetTemperatures[0].temperatureUnitTypeId
      ) {
        this.tempUnitIdFromDb = this.singleRecipeDetails.mashingTargets.strikeWaterTemperatureUnitTypeId ||
          this.singleRecipeDetails.mashingTargets.mashingTargetTemperatures[0].temperatureUnitTypeId;
      }

      this.setValueToEdit(this.singleRecipeDetails);
      if (sessionStorage.preferenceUsed != undefined && sessionStorage.preferenceUsed !== null) {
        this.preference = JSON.parse(sessionStorage.preferenceUsed);
      }
      this.findUnits();
      this.styleName = this.singleRecipeDetails.styleName;
      this.statusId = this.singleRecipeDetails.statusId;
      if (this.singleRecipeDetails.statusId === '4267ae2f-4b7f-4a70-a592-878744a13900') { // commit status
        // disable save and commit
        this.disableSave = true;
      } else {
        this.disableSave = false;
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
    }, error => {
      this.toast.danger(error.error.message);
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
      this.toast.danger(error.error.message);
    });
  }

  getStyles() {
    const getAllActiveStyleAPI = String.Format(this.apiService.getAllActiveStyle, this.tenantId);
    this.apiService.getDataList(getAllActiveStyleAPI).subscribe(response => {
      if (response) {
        this.styles = response['body'].style;
        sessionStorage.setItem('styles', JSON.stringify(this.styles));

      }
    }, error => {
      this.toast.danger(error.error.message);
    });
  }

  getUnitTypes() {
    this.apiService.getDataList(this.apiService.getAllActiveUnitType).subscribe(response => {
      if (response) {
        this.units = response['body'].unitTypebase;
        sessionStorage.setItem('unitTypes', JSON.stringify(this.units));
      }
    }, error => {
      this.toast.danger(error.error.message);
    })
  }

  get form() {
    return this.recipeMashForm.controls;
  }
  get waterAdditionsArray(): FormArray {
    return <FormArray>this.recipeMashForm.get('waterAdditions');
  }

  get adjunctsArray(): FormArray {
    return <FormArray>this.recipeMashForm.get('adjuncts');
  }

  get maltBillArray(): FormArray {
    return <FormArray>this.recipeMashForm.get('maltGrainBill');
  }

  get hopsArray(): FormArray {
    return <FormArray>this.recipeMashForm.get('hops');
  }

  get mashinTargetsArray(): FormArray {
    return <FormArray>this.recipeMashForm.controls['mashingTargets'];
  }

  get recipeNotesArray(): FormArray {
    return <FormArray>this.recipeMashForm.get('recipeNotes');
  }


  initiateFormArrays() {
    if (!sessionStorage.RecipeId) {
      this.addMaltBill();
      this.addWaterAdditions();
      this.addHops();
      this.addAdjuncts();
      this.addMashingTargets();
      this.addRecipeNotes();
    }

  }

  addRecipeNotes() {
    const control = <FormArray>this.recipeMashForm.controls['recipeNotes'];
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

  addMashingTargets() {
    const control = <FormArray>this.recipeMashForm.controls['mashingTargets'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        recipeId: [this.recipeId],
        strikeWaterVolume: ['', [Validators.required]],
        strikeWaterUnitTypeId: ['58c07c47-a13e-4464-bec8-628fe11f027a'],
        strikeWaterTemperature: ['', [Validators.required]],
        strikeWaterTemperatureUnitTypeId: [this.preferedTempUnit],
        mashpH: ['', [Validators.required]],
        liquortoGristrRatio: [''],
        temperature: [this.showMultiTemps, [Validators.required]],
        isActive: [null],
        createdDate: ['2019-01-01T00:00:00'],
        modifiedDate: ['2019-01-01T00:00:00'],
        tenantId: [this.tenantId],
        tempSingle: ['single'],
        mashingTargetTemperatures: this.formBuilder.array([this.mashingTargetTemperatures]),
      }),
    );
  }

  addMashingTargetsTemperature(mashins): void {
    const control = mashins.get('mashingTargetTemperatures') as FormArray;
    control.push(this.mashingTargetTemperatures);
  }

  get mashingTargetTemperatures(): FormGroup {
    return this.formBuilder.group({
      id: [Guid.raw()],
      temperature: ['', Validators.required],
      temperatureUnitTypeId: [this.preferedTempUnit],
      startTime: [''],
      mashingTargetId: ['00000000-0000-0000-0000-000000000000'],
      isActive: [1],
      createdDate: ['2019-01-01T00:00:00'],
      modifiedDate: ['2019-01-01T00:00:00'],
      tenantId: [this.tenantId],
    });
  }

  addMaltBill() {
    const control = <FormArray>this.recipeMashForm.controls['maltGrainBill'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        recipeId: [this.recipeId],
        name: ['', [Validators.required]],
        maltGrainTypeId: [''],
        countryId: ['bcab5d2f-32c6-48c2-880b-ec4eb214fe30'],
        supplierId: [''],
        quantity: ['', [Validators.required]],
        quantityUnitId: ['a6190eaa-8dc5-400c-a5f6-b72468fa3d5c', [Validators.required]],
        grainBillPercentage: [''],
        srm: [''],
        potential: [''],
        isActive: [null],
        createdDate: ['2019-01-01T00:00:00'],
        modifiedDate: ['2019-01-01T00:00:00'],
        tenantId: [this.tenantId],
      }));
  }

  removeMaltBill(i: number) {
    const control = <FormArray>this.recipeMashForm.controls['maltGrainBill'];
    control.removeAt(i);
    this.removeStatus = true;
  }

  addWaterAdditions() {
    const control = <FormArray>this.recipeMashForm.controls['waterAdditions'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        recipeId: [this.recipeId],
        cacl2: [''],
        cacl2unitId: ['a6190eaa-8dc5-400c-a5f6-b72468fa3d5c'],
        gypsum: [''],
        gypsumUnitId: ['a6190eaa-8dc5-400c-a5f6-b72468fa3d5c'],
        tableSalt: [''],
        tableSaltUnitId: ['a6190eaa-8dc5-400c-a5f6-b72468fa3d5c'],
        epsomSalt: [''],
        epsomSaltUnitId: ['a6190eaa-8dc5-400c-a5f6-b72468fa3d5c'],
        caCo3: [''],
        caCo3unitId: ['a6190eaa-8dc5-400c-a5f6-b72468fa3d5c'],
        bakingSodaName: [''],
        bakingSoda: [''],
        bakingSodaUnitId: ['a6190eaa-8dc5-400c-a5f6-b72468fa3d5c'],
        h3po4: [''],
        h3po4unitId: ['a6190eaa-8dc5-400c-a5f6-b72468fa3d5c'],
        isActive: [null],
        createdDate: ['2019-01-01T00:00:00'],
        modifiedDate: ['2019-01-01T00:00:00'],
        tenantId: [this.tenantId],
      }));
  }

  removeWaterAdditions(i: number, controls?: any) {
    const control = <FormArray>this.recipeMashForm.controls['waterAdditions'];
    control.removeAt(i);
    this.removeStatus = true;
  }

  addHops() {
    const control = <FormArray>this.recipeMashForm.controls['hops'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        recipeId: [this.recipeId],
        name: ['', [Validators.required]],
        maltGrainTypeId: ['', [Validators.required]],
        countryId: ['bcab5d2f-32c6-48c2-880b-ec4eb214fe30'],
        supplierId: [''],
        alpha: ['', [Validators.required]],
        quantity: ['', [Validators.required]],
        quantityUnitTypeId: ['a6190eaa-8dc5-400c-a5f6-b72468fa3d5c', [Validators.required]],
        addInId: ['', [Validators.required]],
        timeIn: ['', [Validators.required]],
        timeInUnitId: ['944db4fe-e508-43a6-b599-e11556cfc844', [Validators.required]],
        additionalHopesStatus: [false],
        isActive: [false],
        createdDate: ['2019-01-01T00:00:00'],
        modifiedDate: ['2019-01-01T00:00:00'],
        tenantId: [this.tenantId],
      }));
  }

  removeHops(i: number) {
    const control = <FormArray>this.recipeMashForm.controls['hops'];
    control.removeAt(i);
    this.removeStatus = true;
  }

  addAdjuncts() {
    const control = <FormArray>this.recipeMashForm.controls['adjuncts'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        recipeId: [this.recipeId],
        name: [''],
        supplierId: [''],
        quantity: [''],
        quantityUnitId: ['a6190eaa-8dc5-400c-a5f6-b72468fa3d5c'],
        addInId: [''],
        timeIn: [''],
        timeInUnitId: ['944db4fe-e508-43a6-b599-e11556cfc844'],
        additionalAdjunctsStatus: [false],
        isActive: [null],
        createdDate: ['2019-01-01T00:00:00'],
        modifiedDate: ['2019-01-01T00:00:00'],
        tenantId: [this.tenantId],
        countryId: ['bcab5d2f-32c6-48c2-880b-ec4eb214fe30'],
      }));
  }

  removeAdjuncts(i: number) {
    const control = <FormArray>this.recipeMashForm.controls['adjuncts'];
    control.removeAt(i);
    this.removeStatus = true;
  }


  setValueToEdit(data) {
    if (data) {
      this.recipeMashForm.get('name').setValue(data.name);
      this.recipeMashForm.get('styleId').setValue(data.styleId);
      this.recipeMashForm.get('batchSize').setValue(data.batchSize);
      this.recipeMashForm.get('batchSizeUnitId').setValue(data.batchSizeUnitId);
      this.recipeMashForm.get('brewHouseEfficiency').setValue(data.brewHouseEfficiency);
      this.recipeMashForm.get('abv').setValue(data.abv);
      this.recipeMashForm.get('ibus').setValue(data.ibus);

      if (data.hops != null) {
        const testArray = [];
        for (let i = 0; i < data.hops.length; i++) {
          if (!data.hops[i].additionalHopesStatus) {
            this.hopsArray.insert(i, this.formBuilder.group(data.hops[i]));
            testArray.push(data.hops[i]);
          }
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
        }
        if (testArray.length === 0) {
          this.addAdjuncts();
        }
      }

      if (data.waterAdditions != null) {
        for (let i = 0; i < data.waterAdditions.length; i++) {
          this.waterAdditionsArray.insert(i, this.formBuilder.group(data.waterAdditions[i]));
        }
      }

      if (data.maltGrainBills != null) {
        for (let i = 0; i < data.maltGrainBills.length; i++) {
          this.maltBillArray.insert(i, this.formBuilder.group(data.maltGrainBills[i]));
        }
      }
      if (data.recipeNotes != null) {
        this.addRecipeNotes();
        this.recipeNotesArray.controls.forEach(fields => {
          fields.get('notes').setValue(data.recipeNotes.notes);
        });
      } else {
        this.addRecipeNotes();
      }

      if (data.mashingTargets != null) {
        this.addMashingTargets();
        this.mashinTargetsArray.controls.map((fields) => {
          fields.get('id').setValue(data.mashingTargets.id);
          fields.get('strikeWaterVolume').setValue(data.mashingTargets.strikeWaterVolume);
          fields.get('strikeWaterUnitTypeId').setValue(data.mashingTargets.strikeWaterUnitTypeId);
          fields.get('strikeWaterTemperature').setValue(data.mashingTargets.strikeWaterTemperature);
          fields.get('strikeWaterTemperatureUnitTypeId').setValue(data.mashingTargets.strikeWaterTemperatureUnitTypeId);
          fields.get('mashpH').setValue(data.mashingTargets.mashpH);
          fields.get('liquortoGristrRatio').setValue(data.mashingTargets.liquortoGristrRatio);
          fields.get('temperature').setValue(data.mashingTargets.temperature);
          fields.get('isActive').setValue(data.mashingTargets.isActive);

          if (data.mashingTargets.mashingTargetTemperatures != null) {
            const temp = <FormArray>fields.get('mashingTargetTemperatures');
            if (!data.mashingTargets.temperature) {
              fields.get('tempSingle').setValue('single');
              this.showMultiTemps = false;
              fields.get('temperature').setValue(this.showMultiTemps);
            } else {
              fields.get('tempSingle').setValue('multiple');
              this.showMultiTemps = true;
              fields.get('temperature').setValue(this.showMultiTemps);
            }
            for (let i = 0; i < data.mashingTargets.mashingTargetTemperatures.length; i++) {
              temp.insert(i, this.formBuilder.group(data.mashingTargets.mashingTargetTemperatures[i]));
              temp.removeAt(data.mashingTargets.mashingTargetTemperatures.length);
            }
          }
        });
      } else {
        this.addMashingTargets();
      }
    }
  }

  mashInClick() {
    this.mashinClicked = true;
    if (!this.disableSave && this.recipeMashForm.dirty) {
      this.saveMashinForm();
    } else {
      this.router.navigate(['app/recipes/recipe-mashin']);
    }
  }

  brewLogClick() {
    this.brewlogClicked = true;
    if (!this.disableSave && this.recipeMashForm.dirty) {
      this.saveMashinForm();
    } else {
      this.router.navigate(['/app/recipes/recipe-brewlog']);
    }
  }

  fermentationClick() {
    this.fermentationClicked = true;
    if (!this.disableSave && this.recipeMashForm.dirty) {
      this.saveMashinForm();
    } else {
      this.router.navigate(['app/recipes/recipe-fermentation']);
    }
  }

  conditioningClick() {
    this.conditioningClicked = true;
    if (!this.disableSave && this.recipeMashForm.dirty) {
      this.saveMashinForm();
    } else {
      this.router.navigate(['app/recipes/recipe-conditioning']);
    }
  }

  nextStepClick() {
    this.formSubmitted = true;
    if (!this.disableSave) {
      this.saveMashinForm();
    }
    if (this.recipeMashForm.invalid) {
      document.getElementById('openModalButton').click();
      this.findValidationErrors();
    }
  }

  findValidationErrors() {
    if (this.recipeMashForm.invalid) {
      this.isCollapsedReceipe = false;
    }
    if (this.maltBillArray.invalid) {
      this.isCollapsedMalt = false;
    }
    if (this.hopsArray.invalid) {
      this.isCollapsedHops = false;
    }
    if (this.adjunctsArray.invalid) {
      this.isCollapsedAdjuncts = false;
    }
    if (this.mashinTargetsArray.invalid) {
      this.isCollapsedMashing = false;
    }
  }

  saveMashinForm() {

    if (formData && this.recipeMashForm.valid || this.removeStatus && this.recipeMashForm.valid) {
      this.recipeMashForm.get('id').setValue(this.recipeId);

      if (sessionStorage.RecipeId) {
        // set data from get-api to formData
        formData.kettleTargets = this.singleRecipeDetails.kettleTargets;
        formData.sparges = this.singleRecipeDetails.sparges;
        formData.whirlpoolTarget = this.singleRecipeDetails.whirlpoolTarget;
        formData.coolingKnockoutTarget = this.singleRecipeDetails.coolingKnockoutTarget;
        formData.fermentationTargets = this.singleRecipeDetails.fermentationTargets;
        formData.diacetylRest = this.singleRecipeDetails.diacetylRest;
        formData.aging = this.singleRecipeDetails.aging;
        formData.yeast = this.singleRecipeDetails.yeast;
        formData.conditioningTargets = this.singleRecipeDetails.conditioningTargets;
        formData.filterationTargets = this.singleRecipeDetails.filterationTargets;
        formData.carbonationTargets = this.singleRecipeDetails.carbonationTargets;
      }
      // Recipe Details
      formData.id = this.recipeId;
      formData.name = this.recipeMashForm.value.name;
      formData.styleId = this.recipeMashForm.value.styleId;
      formData.styleName = this.styleName;
      formData.batchSize = this.recipeMashForm.value.batchSize;
      formData.batchSizeUnitId = this.recipeMashForm.value.batchSizeUnitId;
      formData.brewHouseEfficiency = this.recipeMashForm.value.brewHouseEfficiency;
      formData.abv = this.recipeMashForm.value.abv;
      formData.ibus = this.recipeMashForm.value.ibus;
      formData.tenantId = this.tenantId;
      formData.yeastStrainId = this.recipeMashForm.value.yeastStrainId;
      formData.statusId = this.statusId;

      // Malt/Grain Bill
      this.newMaltArray = [];
      const maltbill = (this.recipeMashForm.get('maltGrainBill').value);
      maltbill.forEach(element => {
        if (element.id === '') {
          element.id = Guid.raw();
        }
      });
      formData.maltGrainBills = maltbill;

      //  Water Additions
      const wateradditions = (this.recipeMashForm.get('waterAdditions').value);
      wateradditions.forEach(element => {
        if (element.id === '') {
          element.id = Guid.raw();
        }
      });
      formData.waterAdditions = wateradditions;

      // Hops
      const hops = (this.recipeMashForm.get('hops').value);
      hops.forEach((element) => {
        if (element.id === '') {
          element.id = Guid.raw();
        }
      });
      
      if (!sessionStorage.RecipeId) {
        formData.hops = hops;
      } else {
        formData.hops = hops;
        if (this.singleRecipeDetails != null) {
          this.singleRecipeDetails.hops.forEach((element) => {
            if (element.additionalHopesStatus === true) {
              formData.hops.push(element);
            }
          });
        }
      }

      // Adjuncts
      const adjuncts = (this.recipeMashForm.get('adjuncts').value);
      adjuncts.forEach((element) => {
        if (element.id === '') {
          element.id = Guid.raw();
        }
      });
      if (!sessionStorage.RecipeId) {
        formData.adjuncts = adjuncts;
      } else {
        formData.adjuncts = adjuncts;
        if (this.singleRecipeDetails != null) {
          this.singleRecipeDetails.adjuncts.forEach((element) => {
            if (element.additionalAdjunctsStatus === true) {
              formData.adjuncts.push(element);
            }
          });
        }
      }

      // MashingTargets
      const mashintargets = JSON.stringify(this.recipeMashForm.get('mashingTargets').value).replace(/^\[|]$/g, '');
      formData.mashingTargets = (JSON.parse(mashintargets));

      // RecipeNotes
      const recipeNotes = JSON.stringify(this.recipeMashForm.get('recipeNotes').value).replace(/^\[|]$/g, '');
      formData.recipeNotes = (JSON.parse(recipeNotes));

      if (this.page === 'edit-recipe' || sessionStorage.RecipeId) {
        const saveEditedRecipeAPI = String.Format(this.apiService.saveEditedRecipe, this.tenantId, this.recipeId);
        this.apiService.putData(saveEditedRecipeAPI, formData).subscribe((response: any) => {
          if (response) {
            sessionStorage.setItem('RecipeId', this.recipeId);
            if (this.formSubmitted) {
              this.router.navigate(['/app/recipes/recipe-brewlog']);
            }
            if (this.mashinClicked) {
              this.router.navigate(['app/recipes/recipe-mashin']);
            }
            if (this.brewlogClicked) {
              this.router.navigate(['/app/recipes/recipe-brewlog']);
            }
            if (this.fermentationClicked) {
              this.router.navigate(['app/recipes/recipe-fermentation']);
            }
            if (this.conditioningClicked) {
              this.router.navigate(['app/recipes/recipe-conditioning']);
            }
          }
        }, error => {
          this.toast.danger(error.error.message);
        });
      }
      else {
        const addRecipeAPI = String.Format(this.apiService.addRecipe, this.tenantId, this.recipeId);
        this.apiService.postData(addRecipeAPI, formData).subscribe((response: any) => {
          if (response) {
            this.recipeId = response['body'].recipeId;
            sessionStorage.setItem('RecipeId', this.recipeId);
            if (this.formSubmitted) {
              this.router.navigate(['/app/recipes/recipe-brewlog']);
            }
            if (this.mashinClicked) {
              this.router.navigate(['app/recipes/recipe-mashin']);
            }
            if (this.brewlogClicked) {
              this.router.navigate(['/app/recipes/recipe-brewlog']);
            }
            if (this.fermentationClicked) {
              this.router.navigate(['app/recipes/recipe-fermentation']);
            }
            if (this.conditioningClicked) {
              this.router.navigate(['app/recipes/recipe-conditioning']);
            }
          }
        }, error => {
          this.toast.danger(error.error.message);
        });
      }
    }
  }
  singleTempChange(mashForm) {
    const control = <FormArray>mashForm.get('mashingTargetTemperatures');

    if (mashForm.get('tempSingle').value === 'single') {
      this.showMultiTemps = false;
      mashForm.get('temperature').setValue(this.showMultiTemps);
      let i = 0;
      i++;
      while (i < control.length) {
        control.removeAt(i);
      }
    } else {
      this.showMultiTemps = true;
      mashForm.get('temperature').setValue(this.showMultiTemps);
    }
  }
  removeMashingTargetsTemperature(mashForm, i) {
    const control = <FormArray>mashForm.get('mashingTargetTemperatures');
    control.removeAt(i);
    this.removeStatus = true;
  }

  cancelClick() {
    this.router.navigate(['/app/recipes']);
  }

  showRatio(event, mashins) {
    let ratio = event.target.value;
    ratio = ratio.replace(/[^\d:]/g, '');
    mashins.get('liquortoGristrRatio').setValue(ratio);
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
          this.getSuppliers();
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
          // this.getStyles();
          this.styles= response.body.style;
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
          this.getMaltTypes();
          this.modalForms.reset();
        }
      });
    }
  }
}
