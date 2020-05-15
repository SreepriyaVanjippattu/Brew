import { Component, OnInit } from '@angular/core';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { formData } from '../../../../models/formData';
import { NbToastrService, NbLayoutScrollService } from '@nebular/theme';
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
    private scrolltop: NbLayoutScrollService,
    private formBuilder: FormBuilder,
    private router: Router,
    private toast: NbToastrService,
    private route: ActivatedRoute) { }

  recipeFermentationForm = this.formBuilder.group({
    fermentationTargets: this.formBuilder.array([]),
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
    this.recipeId = this.route.snapshot.queryParams.recipeId;
    this.getYeastStrain();
    this.getAllRecipeSystemData();
    this.initiateFormArrays();

    if (sessionStorage.page === 'edit') {
      this.pageHeader = 'Edit Recipe';
      this.isCollapsedLauter = false;
      this.isCollapsedCooling = false;
      this.isCollapsedYeast = false;

    } else {
      this.pageHeader = 'Add New Recipe';
    }


  }
  getAllRecipeSystemData() {
    const getAllRecipeSystemDataAPI = String.Format(this.apiService.getRecipeMasterDetails, this.tenantId);
    this.apiService.getDataList(getAllRecipeSystemDataAPI).subscribe(response => {
      if (response) {
        this.addins = response['body'].addIns;
        this.countries = response['body'].countries;
        this.suppliers = response['body'].suppliers;
        this.maltTypes = response['body'].maltGrainTypes;
        this.units = response['body'].unitTypes;
        this.getPreferenceUsed();
      }
    });
  }

  getPreferenceUsed() {
    const getPreferenceSettingsAPI = String.Format(this.apiService.getPreferenceSettings, this.tenantId);
    this.apiService.getDataList(getPreferenceSettingsAPI).subscribe((response: any) => {
      if (response.status === 200) {
        this.preference = response['body'].preferenceSettings;
        if (this.recipeId) {
          this.getRecipeDetailsById(this.recipeId);
        }
        else {
          this.findUnits();
        }
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
        if (this.platoUnitIdFromDb == Guid.EMPTY && element.id === this.preference.gravityMeasurementId) {
          this.preferedPlato = element.name;
          this.platoUnitId = element.id;
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
        this.singleRecipeDetails.fermentationTargets.platoUnitId) {

        this.platoUnitIdFromDb = this.singleRecipeDetails.kettleTargets.platoUnitId || this.singleRecipeDetails.sparges.length !== 0 &&
          this.singleRecipeDetails.sparges[0].platoUnitId ||
          this.singleRecipeDetails.conditioningTargets.platoUnitId ||
          this.singleRecipeDetails.fermentationTargets.platoUnitId;

        if (this.singleRecipeDetails.mashingTargets.strikeWaterTemperatureUnitTypeId ||
          this.singleRecipeDetails.mashingTargets.mashingTargetTemperatures[0].temperatureUnitTypeId
        ) {
          this.tempUnitIdFromDb = this.singleRecipeDetails.mashingTargets.strikeWaterTemperatureUnitTypeId ||
            this.singleRecipeDetails.mashingTargets.mashingTargetTemperatures[0].temperatureUnitTypeId;
        }
      }

      this.findUnits();
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

  initiateFormArrays() {
    this.addFermentationTargets();
    this.addAging();
    this.addYeast();
  }

  getYeastStrain() {
    const getAllYeastStrainsAPI = String.Format(this.apiService.getAllYeastStrains, this.tenantId);
    this.apiService.getDataList(getAllYeastStrainsAPI).subscribe(response => {
      if (response) {
        this.yeastStrain = response['body'].yeastStrains;
      }
    });
  }

  setValueToEdit(data) {
    if (data) {

      if (data.fermentationTargets != null) {
        this.fermentationTargetsArray.controls.forEach(fields => {
          if (data.fermentationTargets.id !== Guid.EMPTY && data.fermentationTargets.id !== null) {
            fields.get('id').setValue(data.fermentationTargets.id);
          }
          fields.get('volumeIn').setValue(data.fermentationTargets.volumeIn);
          if (data.fermentationTargets.volumeInUnitId !== Guid.EMPTY && data.fermentationTargets.volumeInUnitId !== null) {
            fields.get('volumeInUnitId').setValue(data.fermentationTargets.volumeInUnitId);
          }
          fields.get('temperature').setValue(data.fermentationTargets.temperature);
          if (data.fermentationTargets.temperatureUnitId !== Guid.EMPTY && data.fermentationTargets.temperatureUnitId !== null) {
            fields.get('temperatureUnitId').setValue(data.fermentationTargets.temperatureUnitId);
          }
          fields.get('pressure').setValue(data.fermentationTargets.pressure);
          if (data.fermentationTargets.pressureUnitId !== Guid.EMPTY && data.fermentationTargets.pressureUnitId !== null) {
            fields.get('pressureUnitId').setValue(data.fermentationTargets.pressureUnitId);
          }
          fields.get('ph').setValue(data.fermentationTargets.ph);
          fields.get('plato').setValue(data.fermentationTargets.plato);
          if (data.fermentationTargets.platoUnitId !== Guid.EMPTY && data.fermentationTargets.platoUnitId !== null) {
            fields.get('platoUnitId').setValue(data.fermentationTargets.platoUnitId);
          }
        });
      }




      if (data.aging != null) {
        this.agingArray.controls.forEach(fields => {
          if (data.aging.id !== Guid.EMPTY && data.aging.id !== null) {
            fields.get('id').setValue(data.aging.id);
          }
          fields.get('timeDuration').setValue(data.aging.timeDuration);
          if (data.aging.timeDurationUnitId !== Guid.EMPTY && data.aging.timeDurationUnitId !== null) {
            fields.get('timeDurationUnitId').setValue(data.aging.timeDurationUnitId);
          }
          fields.get('temperature').setValue(data.aging.temperature);
          if (data.aging.temperatureUnitId !== Guid.EMPTY && data.aging.temperatureUnitId !== null) {
            fields.get('temperatureUnitId').setValue(data.aging.temperatureUnitId);
          }
        });
      }



      if (data.yeast != null) {

        this.yeastArray.controls.forEach(fields => {
          if (data.yeast.id !== Guid.EMPTY && data.yeast.id) {
            fields.get('id').setValue(data.yeast.id);
          }
          fields.get('name').setValue(data.yeast.name);
          if (data.yeast.yeastStrainId !== Guid.EMPTY && data.yeast.yeastStrainId) {
            fields.get('yeastStrainId').setValue(data.yeast.yeastStrainId);
          }
          if (data.yeast.countryId !== Guid.EMPTY && data.yeast.countryId) {
            fields.get('countryId').setValue(data.yeast.countryId);
          }
          if (data.yeast.supplierId !== Guid.EMPTY && data.yeast.supplierId) {
            fields.get('supplierId').setValue(data.yeast.supplierId);
          }
          fields.get('pitchRate').setValue(data.yeast.pitchRate);
          if (data.yeast.pitchRateUnitId !== Guid.EMPTY && data.yeast.pitchRateUnitId) {
            fields.get('pitchRateUnitId').setValue(data.yeast.pitchRateUnitId);
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
        createdDate: [new Date()],
        modifiedDate: [new Date()],
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
        createdDate: [new Date()],
        modifiedDate: [new Date()],
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
        pitchRate: ['', Validators.required],
        pitchRateUnitId: ['a6190eaa-8dc5-400c-a5f6-b72468fa3d5c', [Validators.required]],
        supplierId: [''],
        isActive: [true],
        createdDate: [new Date()],
        modifiedDate: [new Date()],
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
    }
    else {
      this.router.navigate(['app/recipes/recipe-mashin'], { queryParams: { recipeId: this.recipeId ? this.recipeId : '' } });
    }
  }

  brewLogClick() {
    this.brewlogClicked = true;
    if (!this.disableSave && this.recipeFermentationForm.dirty) {
      this.saveFermentation();
    }
    else {
      this.router.navigate(['/app/recipes/recipe-brewlog'], { queryParams: { recipeId: this.recipeId ? this.recipeId : '' } });
    }
  }

  fermentationClick() {
    this.fermentationClicked = true;
    if (!this.disableSave && this.recipeFermentationForm.dirty) {
      this.saveFermentation();
    }
    else {
      this.router.navigate(['app/recipes/recipe-fermentation'], { queryParams: { recipeId: this.recipeId ? this.recipeId : '' } });
    }
  }

  conditioningClick() {
    this.conditioningClicked = true;
    if (!this.disableSave && this.recipeFermentationForm.dirty) {
      this.saveFermentation();
    }
    else {
      this.router.navigate(['app/recipes/recipe-conditioning'], { queryParams: { recipeId: this.recipeId ? this.recipeId : '' } });
    }
  }

  saveFermentation() {

    if (this.singleRecipeDetails && this.recipeFermentationForm.valid) {

      this.yeastArray.controls.map(field => {
        this.singleRecipeDetails.yeastStrainId = field.get('yeastStrainId').value;
      });
      const fermentationTargets = JSON.stringify(this.recipeFermentationForm.get('fermentationTargets').value).replace(/^\[|]$/g, '');
      this.singleRecipeDetails.fermentationTargets = JSON.parse(fermentationTargets);


      const aging = JSON.stringify(this.recipeFermentationForm.get('aging').value).replace(/^\[|]$/g, '');
      this.singleRecipeDetails['aging'] = (JSON.parse(aging));

      const yeast = JSON.stringify(this.recipeFermentationForm.get('yeast').value).replace(/^\[|]$/g, '');
      this.singleRecipeDetails['yeast'] = (JSON.parse(yeast));

      const saveEditedRecipeAPI = String.Format(this.apiService.saveEditedRecipe, this.tenantId, this.recipeId);
      this.apiService.putData(saveEditedRecipeAPI, this.singleRecipeDetails).subscribe((response: any) => {
        if (response) {
          if (this.formSubmitted) {
            this.router.navigate(['/app/recipes/recipe-conditioning'], { queryParams: { recipeId: this.recipeId ? this.recipeId : '' } });
          }
          if (this.mashinClicked) {
            this.router.navigate(['app/recipes/recipe-mashin'], { queryParams: { recipeId: this.recipeId ? this.recipeId : '' } });
          }
          if (this.brewlogClicked) {
            this.router.navigate(['/app/recipes/recipe-brewlog'], { queryParams: { recipeId: this.recipeId ? this.recipeId : '' } });
          }
          if (this.fermentationClicked) {
            this.router.navigate(['app/recipes/recipe-fermentation'], { queryParams: { recipeId: this.recipeId ? this.recipeId : '' } });
          }
          if (this.conditioningClicked) {
            this.router.navigate(['app/recipes/recipe-conditioning'], { queryParams: { recipeId: this.recipeId ? this.recipeId : '' } });
          }
        }
      }, error => {
        if (error instanceof HttpErrorResponse) {
          this.toast.danger(error.error.message, 'Try Again');
        }
        else {
          this.toast.danger(error,'Try Again');
        }
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
      createdDate: new Date(),
      modifiedDate: new Date(),
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

  gotoTop() {
    this.scrolltop.scrollTo(0, 0);
  }

}
