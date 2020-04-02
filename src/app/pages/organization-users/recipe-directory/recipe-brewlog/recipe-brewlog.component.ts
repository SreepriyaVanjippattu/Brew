import { Component, OnInit } from '@angular/core';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { Router } from '@angular/router';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { Guid } from 'guid-typescript';
import { NbToastrService } from '@nebular/theme';
import { String } from 'typescript-string-operations';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'recipe-brewlog',
  templateUrl: './recipe-brewlog.component.html',
  styleUrls: ['./recipe-brewlog.component.scss'],
})
export class RecipeBrewlogComponent implements OnInit {

  isCollapsedKettle = false;
  isCollapsedLauter = true;
  isCollapsedWhirlpool = true;
  isCollapsedCoolingKnockout = true;
  formSubmitted = false;
  units;
  userDetails: any;
  tenantId: any;
  addins: any;
  countries: any;
  maltTypes: any;
  suppliers: any;
  recipeId: any;
  preferredUnit: any;
  singleRecipeDetails: any;
  mashinClicked = false;
  brewlogClicked = false;
  fermentationClicked = false;
  conditioningClicked = false;
  gravity = false;
  disableSave = false;
  preferedUnit: any;
  preferedPlato: any;
  preference: any;
  id: string;
  newSpargeArray: any = [];
  removeStatus: boolean = false;
  platoUnitId: any;
  validateGravity: any;
  platoUnitIdFromDb: any;
  tempUnitIdFromDb: any;
  preferedTempUnit: any;
  pageHeader: string;


  constructor(private apiService: ApiProviderService,
    private formBuilder: FormBuilder,
    private router: Router,
    private toast: NbToastrService) { }

  brewLogForm = this.formBuilder.group({
    kettleTargets: this.formBuilder.array([]),
    sparges: this.formBuilder.array([]),
    whirlpoolTarget: this.formBuilder.array([]),
    coolingKnockoutTarget: this.formBuilder.array([]),
  });
  modalForms = this.formBuilder.group({
    styleText: [''],
    typeText: [''],
    supplierText: [''],
  });


  get form() {
    return this.brewLogForm.controls;
  }
  get kettleTargetsArray(): FormArray {
    return <FormArray>this.brewLogForm.get('kettleTargets');
  }
  get spargeArray(): FormArray {
    return <FormArray>this.brewLogForm.get('sparges');
  }
  get whirlpoolTargetArray(): FormArray {
    return <FormArray>this.brewLogForm.get('whirlpoolTarget');
  }
  get coolingKnockoutTargetsArray(): FormArray {
    return <FormArray>this.brewLogForm.get('coolingKnockoutTarget');
  }

  ngOnInit() {
    this.userDetails = sessionStorage.user;
    const user = JSON.parse(this.userDetails);
    this.tenantId = user['userDetails'].tenantId;

    this.getCountries();
    this.getAddIns();
    this.getMaltTypes();
    this.getSuppliers();
    this.getUnitTypes();
    this.getPreferenceUsed();

    if (sessionStorage.page === 'edit') {
      this.pageHeader = 'Edit Recipe';
      this.isCollapsedLauter = false;
      this.isCollapsedWhirlpool = false;
      this.isCollapsedCoolingKnockout = false;
    } else {
      this.pageHeader = 'Add New Recipe';
    }

    if (sessionStorage.RecipeId) {
      this.recipeId = sessionStorage.RecipeId;
      this.getRecipeDetailsById(this.recipeId);
    }
  }

  getPreferenceUsed() {
    const getPreferenceSettingsAPI = String.Format(this.apiService.getPreferenceSettings, this.tenantId);
    this.apiService.getDataList(getPreferenceSettingsAPI).subscribe((response: any) => {
      if (response.status === 200) {
        this.preference = response['body'].preferenceSettings;
        this.findUnits();
      }
    });
  }

  findUnits() {
    if (this.units) {
      this.units.forEach(element => {
        if (!this.tempUnitIdFromDb && element.id === this.preference.temperatureId) {
          this.preferedUnit = element.symbol;
          this.preferedTempUnit = element.id;
        }
        if (this.tempUnitIdFromDb && element.id === this.tempUnitIdFromDb) {
          this.preferedUnit = element.symbol;
          this.preferedTempUnit = element.id;
        }
        if (!this.platoUnitIdFromDb && element.id === this.preference.gravityMeasurementId) {
          this.preferedPlato = element.name;
          this.platoUnitId = element.id;
        }
        if (element.id === this.platoUnitIdFromDb) {
          this.preferedPlato = element.name;
          this.platoUnitId = element.id;
        }
        if (this.preferedPlato === 'Plato') {
          this.validateGravity = [Validators.required];
        } else {
          this.validateGravity = [Validators.min(1), Validators.max(1.100)];
        }
      });
    }
    this.initiateFormArrays();
  }

  getRecipeDetailsById(recipeId) {
    const getRecipebyIdAPI = String.Format(this.apiService.getRecipebyId, this.tenantId, recipeId);
    this.apiService.getDataList(getRecipebyIdAPI).subscribe(response => {
      this.singleRecipeDetails = response['body'].recipe;
      if (this.singleRecipeDetails.kettleTargets.platoUnitId || this.singleRecipeDetails.sparges.length !== 0 &&
        this.singleRecipeDetails.sparges[0].platoUnitId ||
        this.singleRecipeDetails.conditioningTargets.platoUnitId ||
        this.singleRecipeDetails.diacetylRest.platoUnitId ||
        this.singleRecipeDetails.fermentationTargets.platoUnitId) {

        this.platoUnitIdFromDb = this.singleRecipeDetails.kettleTargets.platoUnitId || this.singleRecipeDetails.sparges.length !== 0 &&
          this.singleRecipeDetails.sparges[0].platoUnitId ||
          this.singleRecipeDetails.conditioningTargets.platoUnitId ||
          this.singleRecipeDetails.diacetylRest.platoUnitId ||
          this.singleRecipeDetails.fermentationTargets.platoUnitId;
      }

      if (this.singleRecipeDetails.mashingTargets.strikeWaterTemperatureUnitTypeId ||
        this.singleRecipeDetails.mashingTargets.mashingTargetTemperatures[0].temperatureUnitTypeId
      ) {
        this.tempUnitIdFromDb = this.singleRecipeDetails.mashingTargets.strikeWaterTemperatureUnitTypeId ||
          this.singleRecipeDetails.mashingTargets.mashingTargetTemperatures[0].temperatureUnitTypeId;
      }

      this.setValueToEdit(this.singleRecipeDetails);
      if (this.singleRecipeDetails.statusId === '4267ae2f-4b7f-4a70-a592-878744a13900') {
        // commit status
        this.disableSave = true;
      } else {
        this.disableSave = false;
      }
    });
  }

  initiateFormArrays() {
    if (!sessionStorage.RecipeId) {
      const sparges = (this.brewLogForm.get('sparges') as FormArray);
      this.addSparge();
    }
    const kettleTargets = (this.brewLogForm.get('kettleTargets') as FormArray);
    this.addKettleTargets();

    const whirlpoolTarget = (this.brewLogForm.get('whirlpoolTarget') as FormArray);
    this.addWhirlpoolTarget();

    const coolingKnockoutTarget = (this.brewLogForm.get('coolingKnockoutTarget') as FormArray);
    this.addCoolingKnockoutTargets();
  }

  getCountries() {
    this.apiService.getDataList(this.apiService.getAllActiveCountry).subscribe(response => {
      if (response) {
        this.countries = response['body'].countrybase;
      }
    });
  }

  getAddIns() {
    const getAllActiveAddInAPI = String.Format(this.apiService.getAllActiveAddIn, this.tenantId);
    this.apiService.getDataList(getAllActiveAddInAPI).subscribe(response => {
      if (response) {
        this.addins = response['body'].addinBase;
      }
    });
  }

  getSuppliers() {
    const getAllActiveSupplierAPI = String.Format(this.apiService.getAllActiveSupplier, this.tenantId);
    this.apiService.getDataList(getAllActiveSupplierAPI).subscribe(response => {
      if (response) {
        this.suppliers = response['body'].supplierBase;
      }
    });
  }

  getMaltTypes() {
    const getAllActiveMaltGrainTypeAPI = String.Format(this.apiService.getAllActiveMaltGrainType, this.tenantId);
    this.apiService.getDataList(getAllActiveMaltGrainTypeAPI).subscribe(response => {
      if (response) {
        this.maltTypes = response['body'];
      }
    }, error => {
      if (error instanceof HttpErrorResponse) {
        this.toast.danger(error.error.message);
        }
        this.toast.danger(error);
    });
  }

  getUnitTypes() {
    this.apiService.getDataList(this.apiService.getAllActiveUnitType).subscribe(response => {
      if (response) {
        this.units = response['body'].unitTypebase;
      }
    }, error => {
      if (error instanceof HttpErrorResponse) {
        this.toast.danger(error.error.message);
        }
        this.toast.danger(error);
    });
  }

  setValueToEdit(data) {

    if (data) {
      if (data.sparges != null) {
        let spargeFlag = true;
        for (let i = 0; i < data.sparges.length; i++) {
          this.spargeArray.insert(i, this.formBuilder.group(data.sparges[i]));
          if (data.sparges[i]) {
            spargeFlag = false;
          }
        }
        if (spargeFlag) {
          this.addSparge();
        }
      }

      if (data.kettleTargets != null) {
        this.kettleTargetsArray.controls.forEach(fields => {
          fields.get('boilLength').setValue(data.kettleTargets.boilLength);
          fields.get('boilLengthUnitId').setValue(data.kettleTargets.boilLengthUnitId);
          fields.get('volumePreBoil').setValue(data.kettleTargets.volumePreBoil);
          fields.get('volumePreBoilUnitId').setValue(data.kettleTargets.volumePreBoilUnitId);
          fields.get('volumePostBoil').setValue(data.kettleTargets.volumePostBoil);
          fields.get('volumePostBoilUnitId').setValue(data.kettleTargets.volumePostBoilUnitId);
          fields.get('plato').setValue(data.kettleTargets.plato);
          fields.get('platoUnitId').setValue(data.kettleTargets.platoUnitId);
          fields.get('ph').setValue(data.kettleTargets.ph);
          fields.get('notes').setValue(data.kettleTargets.notes);
        });
      }

      if (data.whirlpoolTarget != null) {
        this.whirlpoolTargetArray.controls.forEach(fields => {
          fields.get('postBoilVolume').setValue(data.whirlpoolTarget.postBoilVolume);
          fields.get('postBoilVolumeUnitId').setValue(data.whirlpoolTarget.postBoilVolumeUnitId);
          fields.get('notes').setValue(data.whirlpoolTarget.notes);
        });
      }

      if (data.coolingKnockoutTarget != null) {
        this.coolingKnockoutTargetsArray.controls.forEach(fields => {
          fields.get('volumeInFermentation').setValue(data.coolingKnockoutTarget.volumeInFermentation);
          fields.get('volumeInFermentationOptionId').setValue(data.coolingKnockoutTarget.volumeInFermentationOptionId);
          fields.get('notes').setValue(data.coolingKnockoutTarget.notes);
        });
      }

    }
  }


  addKettleTargets() {
    const control = <FormArray>this.brewLogForm.controls['kettleTargets'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        recipeId: [this.recipeId],
        boilLength: ['', Validators.required],
        boilLengthUnitId: ['944db4fe-e508-43a6-b599-e11556cfc844'],
        volumePreBoil: ['', Validators.required],
        volumePreBoilUnitId: ['d9d14065-4034-4c37-b433-4d28fdda761a', Validators.required],
        volumePostBoil: ['', Validators.required],
        volumePostBoilUnitId: ['d9d14065-4034-4c37-b433-4d28fdda761a', Validators.required],
        plato: ['', this.validateGravity],
        platoUnitId: [this.platoUnitId],
        ph: ['', Validators.required],
        notes: [''],
        isActive: [true],
        createdDate: ['2019-01-01T00:00:00'],
        modifiedDate: ['2019-01-01T00:00:00'],
        tenantId: [this.tenantId],
      }));
  }

  addSparge() {
    const control = <FormArray>this.brewLogForm.controls['sparges'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        recipeId: [this.recipeId],
        spargeWaterTemperature: ['', [Validators.required]],
        spargeWaterTemperatureUnitId: [this.preferedTempUnit],
        spargeTotalVolume: ['', [Validators.required]],
        spargeTotalVolumeUnitId: ['58c07c47-a13e-4464-bec8-628fe11f027a', [Validators.required]],
        firstRunningPlato: ['', this.validateGravity],
        lastRunningPlato: ['', this.validateGravity],
        platoUnitId: [this.platoUnitId],
        notes: [''],
        isActive: [true],
        createdDate: ['2019-01-01T00:00:00'],
        modifiedDate: ['2019-01-01T00:00:00'],
        tenantId: [this.tenantId],
      }));
  }
  removeSparge(i: number) {
    const control = <FormArray>this.brewLogForm.controls['sparges'];
    control.removeAt(i);
    this.removeStatus = true;
  }

  addWhirlpoolTarget() {
    const control = <FormArray>this.brewLogForm.controls['whirlpoolTarget'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        recipeId: [this.recipeId],
        postBoilVolume: ['', Validators.required],
        postBoilVolumeUnitId: ['58c07c47-a13e-4464-bec8-628fe11f027a', Validators.required],
        notes: [''],
        isActive: [true],
        createdDate: ['2019-01-01T00:00:00'],
        modifiedDate: ['2019-01-01T00:00:00'],
        tenantId: [this.tenantId],
      }));
  }

  addCoolingKnockoutTargets() {
    const control = <FormArray>this.brewLogForm.controls['coolingKnockoutTarget'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        recipeId: [this.recipeId],
        volumeInFermentation: ['', Validators.required],
        volumeInFermentationOptionId: ['d9d14065-4034-4c37-b433-4d28fdda761a', Validators.required],
        notes: [''],
        isActive: [true],
        createdDate: ['2019-01-01T00:00:00'],
        modifiedDate: ['2019-01-01T00:00:00'],
        tenantId: [this.tenantId],
      }));
  }

  saveBrewLog() {

    this.formSubmitted = true;
    if (this.singleRecipeDetails && this.brewLogForm.valid || this.removeStatus && this.brewLogForm.valid) {

      const kettletargets = JSON.stringify(this.brewLogForm.get('kettleTargets').value).replace(/^\[|]$/g, '');
      this.singleRecipeDetails.kettleTargets = JSON.parse(kettletargets);

      const whirlpooltarget = JSON.stringify(this.brewLogForm.get('whirlpoolTarget').value).replace(/^\[|]$/g, '');
      this.singleRecipeDetails.whirlpoolTarget = JSON.parse(whirlpooltarget);

      // Sparge
      const sparge = (this.brewLogForm.get('sparges').value);
      sparge.forEach(element => {
        if (element.id === '') {
          element.id = Guid.raw();
        }
        element.platoUnitId = this.platoUnitId;
      });
      this.singleRecipeDetails.sparges = sparge;
      const coolingKnockoutTarget = JSON.stringify(this.brewLogForm.get('coolingKnockoutTarget').value).replace(/^\[|]|$/g, '');
      this.singleRecipeDetails.coolingKnockoutTarget = JSON.parse(coolingKnockoutTarget);

      const saveEditedRecipeAPI = String.Format(this.apiService.saveEditedRecipe, this.tenantId, this.recipeId);
      this.apiService.putData(saveEditedRecipeAPI, this.singleRecipeDetails).subscribe((response: any) => {
        if (response) {
          if (this.formSubmitted) {
            this.router.navigate(['/app/recipes/recipe-fermentation']);
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
      });
    } else {
      if (this.formSubmitted && this.brewLogForm.valid) {
        this.router.navigate(['/app/recipes/recipe-fermentation']);
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
  }

  mashInClick() {
    this.mashinClicked = true;
    if (!this.disableSave && this.brewLogForm.dirty) {
      this.saveBrewLog();
    } else {
      this.router.navigate(['app/recipes/recipe-mashin']);
    }
  }

  brewLogClick() {
    this.brewlogClicked = true;
    if (!this.disableSave && this.brewLogForm.dirty) {
      this.saveBrewLog();
    } else {
      this.router.navigate(['/app/recipes/recipe-brewlog']);
    }
  }

  fermentationClick() {
    this.fermentationClicked = true;
    if (!this.disableSave && this.brewLogForm.dirty) {
      this.saveBrewLog();
    } else {
      this.router.navigate(['app/recipes/recipe-fermentation']);
    }
  }

  conditioningClick() {
    this.conditioningClicked = true;
    if (!this.disableSave && this.brewLogForm.dirty) {
      this.saveBrewLog();
    } else {
      this.router.navigate(['app/recipes/recipe-conditioning']);
    }
  }

  nextStepClick() {
    this.formSubmitted = true;
    if (!this.disableSave) {
      this.saveBrewLog();
    } if (this.brewLogForm.invalid) {
      document.getElementById('openModalButton').click();
      this.findValidationErrors();
    }
  }

  findValidationErrors() {
    if (this.kettleTargetsArray.invalid) {
      this.isCollapsedKettle = false;
    }
    if (this.spargeArray.invalid) {
      this.isCollapsedLauter = false;
    }
    if (this.whirlpoolTargetArray.invalid) {
      this.isCollapsedWhirlpool = false;
    }
    if (this.coolingKnockoutTargetsArray.invalid) {
      this.isCollapsedCoolingKnockout = false;
    }
  }

  cancelClick() {
    this.router.navigate(['/app/recipes']);
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
          this.getSuppliers();
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
          this.getMaltTypes();
          this.modalForms.reset();
        }
      });
    }
  }

}
