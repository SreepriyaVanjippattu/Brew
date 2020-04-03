import { Component, OnInit } from '@angular/core';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { formData } from '../../../../models/formData';
import { NbToastrService } from '@nebular/theme';
import { Guid } from 'guid-typescript';
import { String } from 'typescript-string-operations';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'recipe-fermentation',
  templateUrl: './recipe-fermentation.component.html',
  styleUrls: ['./recipe-fermentation.component.scss'],
})
export class RecipeFermentationComponent implements OnInit {

  formSubmitted = false;
  isCollapsedFermentation = false;
  isCollapsedLauter = true;
  isCollapsedDiacetyl = true;
  isCollapsedCooling = true;
  isCollapsedYeast = true;
  units: any;
  statusId: string;
  userDetails: any;
  tenantId: any;
  addins: any;
  countries: any;
  maltTypes: any;
  suppliers: any;
  recipeId: any;
  yeastStrain: any;
  singleRecipeDetails: any;
  mashinClicked = false;
  brewlogClicked = false;
  fermentationClicked = false;
  conditioningClicked = false;
  disableSave = false;
  preferedUnit: any;
  preferedPlato: any;
  pageHeader: string;
  preference: any;
  platoUnitId: any;
  validateGravity: any;
  platoUnitIdFromDb: any;
  tempUnitIdFromDb: any;
  preferedTempUnit: any;
  page: any;
  id: string;

  constructor(private apiService: ApiProviderService,
    private formBuilder: FormBuilder,
    private router: Router,
    private toast: NbToastrService,
    private route: ActivatedRoute) { }

  recipeFermentationForm = this.formBuilder.group({
    fermentationTargets: this.formBuilder.array([]),
    diacetylRest: this.formBuilder.array([]),
    aging: this.formBuilder.array([]),
    yeast: this.formBuilder.array([]),
  });
  modalForms = this.formBuilder.group({
    supplierText: [''],
  });

  get form() {
    return this.recipeFermentationForm.controls;
  }
  get fermentationTargetsArray(): FormArray {
    return <FormArray>this.recipeFermentationForm.get('fermentationTargets');
  }
  get diacetylRestArray(): FormArray {
    return <FormArray>this.recipeFermentationForm.get('diacetylRest');
  }
  get agingArray(): FormArray {
    return <FormArray>this.recipeFermentationForm.get('aging');
  }
  get yeastArray(): FormArray {
    return <FormArray>this.recipeFermentationForm.get('yeast');
  }

  ngOnInit() {
    this.statusId = '949A12EA-878E-4310-8DD8-3002FD4464F5';
    this.userDetails = sessionStorage.user;
    const user = JSON.parse(this.userDetails);
    this.tenantId = user['userDetails'].tenantId;
    this.getCountries();
    this.getAddIns();
    this.getMaltTypes();
    this.getSuppliers();
    this.getYeastStrain();
    this.getUnitTypes();
    this.initiateFormArrays();

    if (sessionStorage.page === 'edit') {
      this.pageHeader = 'Edit Recipe';
      this.isCollapsedLauter = false;
      this.isCollapsedDiacetyl = false;
      this.isCollapsedCooling = false;
      this.isCollapsedYeast = false;

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
          this.preferedTempUnit = element.Id;
        }
        if (!this.platoUnitIdFromDb && element.id === this.preference.gravityMeasurementId) {
          this.preferedPlato = element.name;
          this.platoUnitId = element.id;
        }
        if (this.platoUnitIdFromDb && element.id === this.platoUnitIdFromDb) {
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

        if (this.singleRecipeDetails.mashingTargets.strikeWaterTemperatureUnitTypeId ||
          this.singleRecipeDetails.mashingTargets.mashingTargetTemperatures[0].temperatureUnitTypeId
        ) {
          this.tempUnitIdFromDb = this.singleRecipeDetails.mashingTargets.strikeWaterTemperatureUnitTypeId ||
            this.singleRecipeDetails.mashingTargets.mashingTargetTemperatures[0].temperatureUnitTypeId;
        }
      }
      this.setValueToEdit(this.singleRecipeDetails);
      if (this.singleRecipeDetails.statusId === '4267ae2f-4b7f-4a70-a592-878744a13900') {
        // commit status
        // disable save and commit
        this.disableSave = true;
      } else {
        this.disableSave = false;
      }
    });
  }

  getUnitTypes() {
    this.apiService.getDataList(this.apiService.getAllActiveUnitType).subscribe(response => {
      if (response) {
        this.units = response['body'].unitTypebase;
        this.getPreferenceUsed();
      }
    }, error => {
      if (error instanceof HttpErrorResponse) {
        this.toast.danger(error.error.message);
      }
      this.toast.danger(error);
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

  getAddIns() {
    const getAllActiveAddInAPI = String.Format(this.apiService.getAllActiveAddIn, this.tenantId);
    this.apiService.getDataList(getAllActiveAddInAPI).subscribe(response => {
      if (response) {
        this.addins = response['body'].addinBase;
      }
    });
  }

  initiateFormArrays() {
    this.addFermentationTargets();
    this.addDiacetylRest();
    this.addAging();
    this.addYeast();
  }

  getYeastStrain() {
    const getAllYeastStrainsAPI = String.Format(this.apiService.getAllYeastStrains, this.tenantId);
    this.apiService.getData(getAllYeastStrainsAPI).subscribe(response => {
      if (response) {
        this.yeastStrain = response['body'].yeastStrainBase;
      }
    });
  }

  getCountries() {
    this.apiService.getDataList(this.apiService.getAllActiveCountry).subscribe(response => {
      if (response) {
        this.countries = response['body'].countrybase;
      }
    });
  }

  getSuppliers() {
    const getAllActiveSupplierAPI = String.Format(this.apiService.getAllActiveSupplier, this.tenantId);
    this.apiService.getDataList(getAllActiveSupplierAPI).subscribe(response => {
      if (response) {
        this.suppliers = response['body'].supplierBase;
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

      if (data.fermentationTargets != null) {
        this.fermentationTargetsArray.controls.forEach(fields => {
          fields.get('id').setValue(data.fermentationTargets.id);
          fields.get('volumeIn').setValue(data.fermentationTargets.volumeIn);
          fields.get('volumeInUnitId').setValue(data.fermentationTargets.volumeInUnitId);
          fields.get('temperature').setValue(data.fermentationTargets.temperature);
          fields.get('temperatureUnitId').setValue(data.fermentationTargets.temperatureUnitId);
          fields.get('pressure').setValue(data.fermentationTargets.pressure);
          fields.get('pressureUnitId').setValue(data.fermentationTargets.pressureUnitId);
          fields.get('ph').setValue(data.fermentationTargets.ph);
          fields.get('plato').setValue(data.fermentationTargets.plato);
          fields.get('platoUnitId').setValue(data.fermentationTargets.platoUnitId);
        });
      }

      if (data.diacetylRest != null) {
        this.diacetylRestArray.controls.forEach(fields => {
          fields.get('id').setValue(data.diacetylRest.id);
          fields.get('temperature').setValue(data.diacetylRest.temperature);
          fields.get('temperatureUnitId').setValue(data.diacetylRest.TemperatureUnitId);
          fields.get('plato').setValue(data.diacetylRest.plato);
          fields.get('platoUnitId').setValue(data.diacetylRest.platoUnitId);
        });
      }

      if (data.aging != null) {
        this.agingArray.controls.forEach(fields => {
          fields.get('id').setValue(data.aging.id);
          fields.get('timeDuration').setValue(data.aging.timeDuration);
          fields.get('timeDurationUnitId').setValue(data.aging.timeDurationUnitId);
          fields.get('temperature').setValue(data.aging.temperature);
          fields.get('temperatureUnitId').setValue(data.aging.temperatureUnitId);
        });
      }


      if (data.yeast != null) {

        this.yeastArray.controls.forEach(fields => {
          fields.get('id').setValue(data.yeast.id);
          fields.get('name').setValue(data.yeast.name);
          fields.get('yeastStrainId').setValue(data.yeast.yeastStrainId);
          fields.get('countryId').setValue(data.yeast.countryId);
          fields.get('supplierId').setValue(data.yeast.supplierId);
          if (data.yeast.countryId === null) {
            fields.get('countryId').setValue('bcab5d2f-32c6-48c2-880b-ec4eb214fe30');
          }
        });
      }
    }
  }

  addFermentationTargets() {
    const control = <FormArray>this.recipeFermentationForm.controls['fermentationTargets'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        recipeId: [this.recipeId],
        volumeIn: ['', Validators.required],
        volumeInUnitId: ['58c07c47-a13e-4464-bec8-628fe11f027a', Validators.required],
        temperature: ['', Validators.required],
        temperatureUnitId: [this.tempUnitIdFromDb],
        pressure: [''],
        pressureUnitId: ['29948d48-3bca-4786-a465-78e42693604f'],
        ph: [''],
        plato: ['', this.validateGravity],
        platoUnitId: [this.platoUnitId],
        isActive: [true],
        createdDate: ['2019-01-01T00:00:00'],
        modifiedDate: ['2019-01-01T00:00:00'],
        tenantId: [this.tenantId],
      }));
  }
  addDiacetylRest() {
    const control = <FormArray>this.recipeFermentationForm.controls['diacetylRest'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        receipeId: [this.recipeId],
        temperature: ['', Validators.required],
        temperatureUnitId: [this.tempUnitIdFromDb],
        plato: ['', this.validateGravity],
        platoUnitId: [this.platoUnitId],
        isActive: [true],
        createdDate: ['2019-01-01T00:00:00'],
        modifiedDate: ['2019-01-01T00:00:00'],
        tenantId: [this.tenantId],
      }));
  }
  addAging() {
    const control = <FormArray>this.recipeFermentationForm.controls['aging'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        receipeId: [this.recipeId],
        timeDuration: ['', Validators.required],
        timeDurationUnitId: ['944db4fe-e508-43a6-b599-e11556cfc844', Validators.required],
        temperature: ['', Validators.required],
        temperatureUnitId: [this.tempUnitIdFromDb],
        isActive: [true],
        createdDate: ['2019-01-01T00:00:00'],
        modifiedDate: ['2019-01-01T00:00:00'],
        tenantId: [this.tenantId],
      }));
  }

  addYeast() {
    const control = <FormArray>this.recipeFermentationForm.controls['yeast'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        name: ['', Validators.required],
        recipeId: [this.recipeId],
        yeastStrainId: ['', Validators.required],
        countryId: ['bcab5d2f-32c6-48c2-880b-ec4eb214fe30'],
        supplierId: [''],
        isActive: [true],
        createdDate: ['2019-01-01T00:00:00'],
        modifiedDate: ['2019-01-01T00:00:00'],
        tenantId: [this.tenantId],
      }));
  }


  nextStepClick() {
    this.formSubmitted = true;
    if (!this.disableSave) {
      this.saveFermentation();
    }
    if (this.recipeFermentationForm.invalid) {
      document.getElementById('openModalButton').click();
      this.findValidationErrors();
    }
  }

  findValidationErrors() {
    if (this.fermentationTargetsArray.invalid) {
      this.isCollapsedFermentation = false;
    }
    if (this.diacetylRestArray.invalid) {
      this.isCollapsedDiacetyl = false;
    }
    if (this.agingArray.invalid) {
      this.isCollapsedCooling = false;
    }
    if (this.yeastArray.invalid) {
      this.isCollapsedYeast = false;
    }
  }
  mashInClick() {
    this.mashinClicked = true;
    if (!this.disableSave && this.recipeFermentationForm.dirty) {
      this.saveFermentation();
    } else {
      this.router.navigate(['app/recipes/recipe-mashin']);
    }
  }

  brewLogClick() {
    this.brewlogClicked = true;
    if (!this.disableSave && this.recipeFermentationForm.dirty) {
      this.saveFermentation();
    } else {
      this.router.navigate(['/app/recipes/recipe-brewlog']);
    }
  }

  fermentationClick() {
    this.fermentationClicked = true;
    if (!this.disableSave && this.recipeFermentationForm.dirty) {
      this.saveFermentation();
    } else {
      this.router.navigate(['app/recipes/recipe-fermentation']);
    }
  }

  conditioningClick() {
    this.conditioningClicked = true;
    if (!this.disableSave && this.recipeFermentationForm.dirty) {
      this.saveFermentation();
    } else {
      this.router.navigate(['app/recipes/recipe-conditioning']);
    }
  }

  saveFermentation() {

    if (this.singleRecipeDetails && this.recipeFermentationForm.valid) {

      this.yeastArray.controls.map(field => {
        this.singleRecipeDetails.yeastStrainId = field.get('yeastStrainId').value;
      });
      const fermentationTargets = JSON.stringify(this.recipeFermentationForm.get('fermentationTargets').value).replace(/^\[|]$/g, '');
      this.singleRecipeDetails.fermentationTargets = JSON.parse(fermentationTargets);

      const diacetylrest = JSON.stringify(this.recipeFermentationForm.get('diacetylRest').value).replace(/^\[|]$/g, '');
      this.singleRecipeDetails['diacetylRest'] = (JSON.parse(diacetylrest));

      const aging = JSON.stringify(this.recipeFermentationForm.get('aging').value).replace(/^\[|]$/g, '');
      this.singleRecipeDetails['aging'] = (JSON.parse(aging));

      const yeast = JSON.stringify(this.recipeFermentationForm.get('yeast').value).replace(/^\[|]$/g, '');
      this.singleRecipeDetails['yeast'] = (JSON.parse(yeast));

      const saveEditedRecipeAPI = String.Format(this.apiService.saveEditedRecipe, this.tenantId, this.recipeId);
      this.apiService.putData(saveEditedRecipeAPI, this.singleRecipeDetails).subscribe((response: any) => {
        if (response) {
          sessionStorage.setItem('RecipeId', this.recipeId);
          if (this.formSubmitted) {
            this.router.navigate(['/app/recipes/recipe-conditioning']);
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
        if (error instanceof HttpErrorResponse) {
          this.toast.danger(error.error.message);
        }
        this.toast.danger(error);
      });
    }
  }

  cancelClick() {
    this.router.navigate(['app/recipes']);
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

}
