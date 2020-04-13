import { Component, OnInit } from '@angular/core';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators, FormArray } from '@angular/forms';
import { NbToastrService } from '@nebular/theme';
import { Guid } from 'guid-typescript';
import { permission } from '../../../../models/rolePermission';
import { DataService } from '../../../../data.service';
import { String } from 'typescript-string-operations';

@Component({
  selector: 'recipe-conditioning',
  templateUrl: './recipe-conditioning.component.html',
  styleUrls: ['./recipe-conditioning.component.scss']
})
export class RecipeConditioningComponent implements OnInit {


  isCollapsedConditioning = false;
  isCollapsedFiltration = true;
  isCollapsedDiacetyl = true;
  isCollapsedCooling = true;
  isCollapsedCarbonation = true;
  units: any;
  userDetails: any;
  tenantId: any;
  recipeId: any;
  singleRecipeDetails: any;
  formSubmitted = false;
  mashinClicked = false;
  brewlogClicked = false;
  fermentationClicked = false;
  conditioningClicked = false;
  commitClicked = false;
  disableSave = false;
  preferedUnit: any;
  preferedPlato: any;
  pageHeader;
  preference: any;
  validateGravity: any;
  platoUnitId: any;
  platoUnitIdFromDb: any;
  tempUnitIdFromDb: any;
  preferedTempUnit: any;
  permission = permission;
  checkPermission: boolean = false;

  constructor(private apiService: ApiProviderService,
    private router: Router,
    private formBuilder: FormBuilder,
    private toast: NbToastrService,
    private data: DataService,
    private route: ActivatedRoute
  ) { }

  recipeConditioningForm = this.formBuilder.group({
    conditioningTargets: this.formBuilder.array([]),
    filterationTargets: this.formBuilder.array([]),
    carbonationTargets: this.formBuilder.array([]),
  });

  get form() {
    return this.recipeConditioningForm.controls;
  }
  get conditioningTargetsArray(): FormArray {
    return <FormArray>this.recipeConditioningForm.get('conditioningTargets');
  }
  get filterationTargetsArray(): FormArray {
    return <FormArray>this.recipeConditioningForm.get('filterationTargets');
  }
  get carbonationTargetsArray(): FormArray {
    return <FormArray>this.recipeConditioningForm.get('carbonationTargets');
  }

  ngOnInit() {
    this.userDetails = sessionStorage.user;
    const user = JSON.parse(this.userDetails);
    this.tenantId = user['userDetails'].tenantId;
    this.recipeId = this.route.snapshot.queryParams.recipeId;
    this.getAllRecipeSystemData();
    this.initiateFormArrays();

    if (sessionStorage.page === 'edit') {
      this.pageHeader = 'Edit Recipe';
      this.isCollapsedFiltration = false;
      this.isCollapsedDiacetyl = false;
      this.isCollapsedCooling = false;
      this.isCollapsedCarbonation = false;
    } else {
      this.pageHeader = 'Add New Recipe';
    }


  }
  getAllRecipeSystemData() {
    const getAllRecipeSystemDataAPI = String.Format(this.apiService.getRecipeMasterDetails, this.tenantId);
    this.apiService.getDataList(getAllRecipeSystemDataAPI).subscribe(response => {
      if (response) {
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
          this.preferedTempUnit = element.id;
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
          this.validateGravity = [];
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
            this.singleRecipeDetails.MashingTargets.mashingTargetTemperatures[0].temperatureUnitTypeId;
        }
      }

      this.findUnits();
      this.setValueToEdit(this.singleRecipeDetails);
      if (this.singleRecipeDetails.StatusId === '4267ae2f-4b7f-4a70-a592-878744a13900') {
        // commit status
        // disable save and commit
        this.disableSave = true;
      } else {
        this.disableSave = false;
      }
    });
  }

  initiateFormArrays() {
    this.addConditioningTargets();
    this.addFilterationTargets();
    this.addCarbonationTargets();
  }

  setValueToEdit(data) {
    if (data) {

      if (data.conditioningTargets != null) {
        this.conditioningTargetsArray.controls.forEach(fields => {
          if (data.conditioningTargets.id !== Guid.EMPTY && data.conditioningTargets.id !== null) {
            fields.get('id').setValue(data.conditioningTargets.id);
          }
          fields.get('volumeIn').setValue(data.conditioningTargets.volumeIn);
          if (data.conditioningTargets.volumeInUnitId !== Guid.EMPTY && data.conditioningTargets.volumeInUnitId !== null) {
            fields.get('volumeInUnitId').setValue(data.conditioningTargets.volumeInUnitId);
          }
          fields.get('temperature').setValue(data.conditioningTargets.temperature);
          if (data.conditioningTargets.temperatureUnitId !== Guid.EMPTY && data.conditioningTargets.temperatureUnitId !== null) {
            fields.get('temperatureUnitId').setValue(data.conditioningTargets.temperatureUnitId);
          }
          fields.get('pressure').setValue(data.conditioningTargets.pressure);
          if (data.conditioningTargets.pressureUnitId !== Guid.EMPTY && data.conditioningTargets.pressureUnitId !== null) {
            fields.get('pressureUnitId').setValue(data.conditioningTargets.pressureUnitId);
          }
          fields.get('ph').setValue(data.conditioningTargets.ph);
          fields.get('plato').setValue(data.conditioningTargets.plato);
          fields.get('co2').setValue(data.conditioningTargets.co2);
          if (data.conditioningTargets.co2UnitId !== Guid.EMPTY && data.conditioningTargets.co2UnitId !== null) {
            fields.get('co2UnitId').setValue(data.conditioningTargets.co2UnitId);
          }
          fields.get('notes').setValue(data.conditioningTargets.notes);

        });
      }

      if (data.filterationTargets != null) {
        this.filterationTargetsArray.controls.forEach(fields => {
          if (data.filterationTargets.id !== Guid.EMPTY && data.filterationTargets.id !== null) {
            fields.get('id').setValue(data.filterationTargets.id);
          }
          fields.get('temperature').setValue(data.filterationTargets.temperature);
          if (data.filterationTargets.temperatureUnitId !== Guid.EMPTY && data.filterationTargets.temperatureUnitId !== null) {
            fields.get('temperatureUnitId').setValue(data.filterationTargets.temperatureUnitId);
          }
          fields.get('notes').setValue(data.filterationTargets.notes);
        });
      }

      if (data.carbonationTargets != null) {
        this.carbonationTargetsArray.controls.forEach(fields => {
          if (data.carbonationTargets.id !== Guid.EMPTY && data.carbonationTargets.id !== null) {
            fields.get('id').setValue(data.carbonationTargets.id);
          }
          fields.get('ph').setValue(data.carbonationTargets.ph);
          fields.get('pressure').setValue(data.carbonationTargets.pressure);
          if (data.carbonationTargets.pressureUnitId !== Guid.EMPTY && data.carbonationTargets.pressureUnitId !== null) {
            fields.get('pressureUnitId').setValue(data.carbonationTargets.pressureUnitId);
          }
          fields.get('notes').setValue(data.carbonationTargets.notes);
        });
      }
    }
  }


  addConditioningTargets() {
    const control = <FormArray>this.recipeConditioningForm.controls['conditioningTargets'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        recipeId: [this.recipeId],
        volumeIn: [''],
        volumeInUnitId: ['58c07c47-a13e-4464-bec8-628fe11f027a'],
        temperature: [''],
        temperatureUnitId: [this.tempUnitIdFromDb],
        pressure: [''],
        pressureUnitId: ['1D211DBF-1A2C-470F-9795-6001C627AC44'],
        ph: [''],
        plato: ['', this.validateGravity],
        platoUnitId: [this.platoUnitId],
        co2: [''],
        co2UnitId: ['e05e1543-9b78-413a-bbd5-2621901ba3b9'],
        notes: [''],
        isActive: [true],
        createdDate: [new Date()],
        modifiedDate: [new Date()],
        tenantId: [this.tenantId],
      }));
  }

  addFilterationTargets() {
    const control = <FormArray>this.recipeConditioningForm.controls['filterationTargets'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        recipeId: [this.recipeId],
        temperature: [''],
        temperatureUnitId: [this.tempUnitIdFromDb],
        notes: [''],
        isActive: [true],
        createdDate: [new Date()],
        modifiedDate: [new Date()],
        tenantId: [this.tenantId],
      }));
  }

  addCarbonationTargets() {
    const control = <FormArray>this.recipeConditioningForm.controls['carbonationTargets'];
    control.push(
      this.formBuilder.group({
        id: [Guid.raw()],
        recipeId: [this.recipeId],
        ph: [''],
        pressure: [''],
        pressureUnitId: ['1D211DBF-1A2C-470F-9795-6001C627AC44'],
        notes: [''],
        isActive: [true],
        createdDate: [new Date()],
        modifiedDate: [new Date()],
        tenantId: [this.tenantId],
      }));
  }
  saveConditioning() {
    if (this.commitClicked) {
      this.singleRecipeDetails.StatusId = '4267AE2F-4B7F-4A70-A592-878744A13900'; // commit id
    }

    if (this.singleRecipeDetails && this.recipeConditioningForm.valid) {
      const conditioningtargets = JSON.stringify(this.recipeConditioningForm.get('conditioningTargets').value).replace(/^\[|]$/g, '');
      this.singleRecipeDetails.conditioningTargets = (JSON.parse(conditioningtargets));

      const filterationtargets = JSON.stringify(this.recipeConditioningForm.get('filterationTargets').value).replace(/^\[|]$/g, '');
      this.singleRecipeDetails.filterationTargets = (JSON.parse(filterationtargets));

      const carbonationtargets = JSON.stringify(this.recipeConditioningForm.get('carbonationTargets').value).replace(/^\[|]$/g, '');
      this.singleRecipeDetails.carbonationTargets = (JSON.parse(carbonationtargets));

      const saveEditedRecipeAPI = String.Format(this.apiService.saveEditedRecipe, this.tenantId, this.recipeId);
      this.apiService.putData(saveEditedRecipeAPI, this.singleRecipeDetails).subscribe((response: any) => {
        if (response.status === 200) {
          if (this.formSubmitted) {
            this.router.navigate(['app/recipes']);
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
      });

    } else {
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
  }

  commitRecipe() {

    const data = this.data.checkPermission(this.permission.Commit_Recipe.Id);
    if (!data) {
      this.toast.danger('You don\'t have access', 'Error');
    } else {
      if (this.recipeConditioningForm.valid) {
        const commitRecipeAPI = String.Format(this.apiService.commitRecipe, this.tenantId, this.recipeId);
        this.apiService.patchData(commitRecipeAPI).subscribe((response: any) => {
          if (response.status === 200) {
            this.router.navigate(['app/recipes']);
          }
        });
      }
    }

  }

  nextStepClick() {
    this.formSubmitted = true;
    if (!this.disableSave) {
      this.saveConditioning();
    }
  }

  mashInClick() {
    this.mashinClicked = true;
    if (!this.disableSave && this.recipeConditioningForm.dirty) {
      this.saveConditioning();
    }
    else {
      this.router.navigate(['app/recipes/recipe-mashin'], { queryParams: { recipeId: this.recipeId ? this.recipeId : '' } });
    }
  }

  brewLogClick() {
    this.brewlogClicked = true;
    if (!this.disableSave && this.recipeConditioningForm.dirty) {
      this.saveConditioning();
    } else {
      this.router.navigate(['/app/recipes/recipe-brewlog'], { queryParams: { recipeId: this.recipeId ? this.recipeId : '' } });
    }
  }

  fermentationClick() {
    this.fermentationClicked = true;
    if (!this.disableSave && this.recipeConditioningForm.dirty) {
      this.saveConditioning();
    }
    else {
      this.router.navigate(['app/recipes/recipe-fermentation'], { queryParams: { recipeId: this.recipeId ? this.recipeId : '' } });
    }
  }

  conditioningClick() {
    this.conditioningClicked = true;
    if (!this.disableSave && this.recipeConditioningForm.dirty) {
      this.saveConditioning();
    }
    else {
      this.router.navigate(['app/recipes/recipe-conditioning'], { queryParams: { recipeId: this.recipeId ? this.recipeId : '' } });
    }
  }

  cancelClick() {
    this.router.navigate(['/app/recipes']);
  }

  previewClick() {
    this.router.navigate(['/app/recipes/view/' + this.recipeId]);
  }
}
