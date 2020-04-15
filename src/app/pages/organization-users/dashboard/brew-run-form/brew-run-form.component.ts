import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { NbToastrService } from '@nebular/theme';
import { StatusUse } from '../../../../models/status-id-name';
import { permission } from '../../../../models/rolePermission';
import { DataService } from '../../../../data.service';
import { String, StringBuilder } from 'typescript-string-operations';

@Component({
  selector: 'app-brew-run-form',
  templateUrl: './brew-run-form.component.html',
  styleUrls: ['./brew-run-form.component.scss'],
})
export class BrewRunFormComponent implements OnInit {

  formSubmitted = false;

  getAllRecipe;
  recipeListComplete: any;
  recipeList: any;
  tankList: any;
  brewerList: any;
  tenantId: any;
  startTime;
  endTime;
  error: any = { isError: false, errorMessage: '' };
  status = StatusUse;
  brewBody: any;
  permission = permission;
  currentUser: any;
  minStarTime;
  maxStartTime;
  minEndTime;
  maxEndTime;

  constructor(private router: Router,
    private formbuilder: FormBuilder,
    private apiService: ApiProviderService,
    private toast: NbToastrService,
    private data: DataService

  ) { }
  newBrewForm = this.formbuilder.group({
    brewRunId: ['', Validators.required],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
    recipe: ['', Validators.required],
    tank: ['', Validators.required],
    brewer: ['', Validators.required],
  });
  get form() {
    return this.newBrewForm.controls;
  }

  ngOnInit() {
    const userDetails = JSON.parse(sessionStorage.getItem('user'));
    this.tenantId = userDetails["userDetails"]["tenantId"];
    this.currentUser = userDetails["userDetails"]["userId"];
    this.getBrewRunMasterDetails(this.tenantId);
    this.getAllActiveUsers(this.tenantId);
  }

  /**
   * Function to get all recipe by tenant
   * @param tenantId
   */

  compareTwoDates() {
    if (new Date(this.newBrewForm.get('endTime').value) < new Date(this.newBrewForm.get('startTime').value)) {
      this.error = { isError: true, errorMessage: 'End Date can\'t be before start date' };
    } else {
      this.error = { isError: false };
    }
  }

  getBrewRunMasterDetails(tenantId)
  {
    const  getBrewRunMasterDetailsAPI= String.Format(this.apiService.getBrewRunMasterDetails, this.tenantId);
    this.apiService.getData(getBrewRunMasterDetailsAPI).subscribe(response => {
       if (response.status === 200) {
        this.recipeList = response['body']['recipeDetails'];
        this.tankList = response['body']['tankDetails'];
      }
    });

  }

  /**
   * Function to get all active users
   * @param tenantId
   */
  getAllActiveUsers(tenantId) {
    const getAllBrewRunAPI= String.Format(this.apiService.getAllActiveBrewUsers, this.tenantId);
    this.apiService.getData(getAllBrewRunAPI).subscribe(response => {
  
      if (response.status === 200) {
        this.brewerList = response['body']['brewers'];

      }
    });
  }

  getRecipeName(selectedRecipeId){
    let recipeName ='';
    for (var recipe of this.recipeList) {
      if (recipe["id"] === selectedRecipeId)
      {
          recipeName = recipe["name"]
          break;
      }
    }
    console.log(recipeName);
    return recipeName;
  }

  getTankName(selectedTankId){
    let tankName ='';
    for (var tank of this.tankList) {
      if (tank["id"] === selectedTankId)
      {
         tankName = tank["name"]
         break;
      }
    }
    return tankName;
  }

  saveBrew() {
    this.formSubmitted = true;
    const userDetails = JSON.parse(sessionStorage.getItem('user'));
    if (this.newBrewForm.valid && this.error.isError === false) {
      const params = {
        brewRunId: this.newBrewForm.get('brewRunId').value,
        startTime: this.newBrewForm.get('startTime').value,
        endTime: this.newBrewForm.get('endTime').value,
        recipeId: this.newBrewForm.get('recipe').value,
        recipeName: this.getRecipeName(this.newBrewForm.get('recipe').value),
        tankId: this.newBrewForm.get('tank').value,
        tankName: this.getTankName(this.newBrewForm.get('tank').value),
        userId: this.newBrewForm.get('brewer').value,
        userName: userDetails["userDetails"]["firstName"] + ' ' + userDetails["userDetails"]["lastName"],
        tenantId: this.tenantId
      };
      const addBrewRunAPI= String.Format(this.apiService.addBrewRun, this.tenantId);
      this.apiService.postData(addBrewRunAPI, params).subscribe(response => {
        if (response) {
          this.brewBody = response['body']['brewRun'];
          this.toast.show('Brew successfully added');
        }
      }, error => {
           this.toast.danger(error.error.message);
      });
    }
  }

  start() {

    const data = this.data.checkPermission(this.permission.Start_Brew_Run.Id);

    if (!data) {
      this.toast.danger('You don\'t have access', 'Error');
    } else {
      if (this.brewBody == null) {
        this.toast.danger('save the brew to start', 'Error');
        return false;
      }
      const params = {
        statusId: this.status.inProgress.id
      };
      const changeBrewRunStatusAPI= String.Format(this.apiService.ChangeBrewRunStatus, this.tenantId,this.brewBody.id);
      
      this.apiService.patchData(changeBrewRunStatusAPI, params).subscribe((response: any) => {
        if (response.status === 200) {
          this.toast.success('Brew successfully started');
          this.router.navigate(['app/dashboard']);
        }
      });
    }
  }

  startTimeChange() {
    this.startTime = this.newBrewForm.get('startTime').value;
  }

  endTimeChange() {
    this.endTime = this.newBrewForm.get('endTime').value;
  }
}
