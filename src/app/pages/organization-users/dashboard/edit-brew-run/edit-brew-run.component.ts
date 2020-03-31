import { Component, OnInit } from '@angular/core';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { NbToastrService } from '@nebular/theme';
import { StatusUse } from '../../../../models/status-id-name';
import { DataService } from '../../../../data.service';
import { permission } from '../../../../models/rolePermission';
import { String, StringBuilder } from 'typescript-string-operations';

@Component({
  selector: 'edit-brew-run',
  templateUrl: './edit-brew-run.component.html',
  styleUrls: ['./edit-brew-run.component.scss'],
})
export class EditBrewRunComponent implements OnInit {

  tenantId: any;
  brewId: any;
  singleBrew: any;
  recipeList: any;
  tankList: any;
  brewerList: any;
  startTime: any;
  endTime: any;
  formSubmitted = false;
  error: any= {isError: false, errorMessage: ''};
  status = StatusUse;
  message: string;
  permission = permission;
  currentUser;
  minStarTime;
  maxStartTime;
  minEndTime;
  maxEndTime;

  constructor(
    private apiService: ApiProviderService,
    private router: Router,
    private route: ActivatedRoute,
    private formbuilder: FormBuilder,
    private toast: NbToastrService,
    private dataService: DataService,
  ) { }
  editBrewForm = this.formbuilder.group({
    brewRunId: ['', Validators.required],
    startTime: [''],
    endTime: [''],
    recipe: ['', Validators.required],
    tank: ['', Validators.required],
    brewer: ['', Validators.required],
  });
  get form() {
    return this.editBrewForm.controls;
   }

  ngOnInit() {
    const userDetails = JSON.parse(sessionStorage.getItem('user'));
    
    this.brewId = this.route.snapshot.url[1].path;
    this.tenantId = userDetails["userDetails"]["tenantId"];
    this.currentUser = userDetails["userDetails"]["userId"];
    this.getBrewRunMasterDetails(this.tenantId);
    this.getAllActiveUsers(this.tenantId);
    this.getSingleBrewDetails(this.tenantId,this.currentUser);
  }

  /**
   * Function to get single brew
   * @param tenantId
   * @param brewId
   */

  compareTwoDates() {
    if (new Date(this.editBrewForm.get('endTime').value) < new Date(this.editBrewForm.get('startTime').value)) {
       this.error = {isError: true};
    } else {
      this.error = {isError: false};
    }
  }
  getSingleBrewDetails(tenantId, brewId) {
    const  getBrewDetailsById= String.Format(this.apiService.getBrewDetailsById, this.tenantId, this.brewId);
    console.log(getBrewDetailsById);
    this.apiService.getDataByQueryParams(getBrewDetailsById, null, null, null).subscribe(response => {
      if (response) {
        this.singleBrew = response['body']['brewRun'];
        this.dataService.changeMessage(this.singleBrew );
        this.setDataToEdit();
      }
    });
  }

  getBrewRunMasterDetails(tenantId)
  {
    const  getBrewRunMasterDetailsAPI= String.Format(this.apiService.getBrewRunMasterDetails, this.tenantId);
    console.log(getBrewRunMasterDetailsAPI);
    this.apiService.getData(getBrewRunMasterDetailsAPI).subscribe(response => {
      console.log(response)
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
  

  setDataToEdit() {
    if (this.singleBrew) {
      this.editBrewForm.get('brewRunId').setValue(this.singleBrew.brewRunId);
      this.editBrewForm.get('startTime').setValue(this.singleBrew.startTime);
      this.editBrewForm.get('endTime').setValue(this.singleBrew.endTime);
      this.editBrewForm.get('recipe').setValue(this.singleBrew.recipeId);
      this.editBrewForm.get('tank').setValue(this.singleBrew.tankId);
      this.editBrewForm.get('brewer').setValue(this.singleBrew.userId);
     }
    }

  saveBrew() {
    this.formSubmitted = true;
    if (this.editBrewForm.valid) {
      const userDetails = JSON.parse(sessionStorage.getItem('user'));

      const params = {
        startTime: this.editBrewForm.get('startTime').value,
        endTime: this.editBrewForm.get('endTime').value,
        userId: this.editBrewForm.get('brewer').value,
        userName :userDetails["userDetails"]["firstName"] + ' ' + userDetails["userDetails"]["lastName"]
      };
      const editBrewRunAPI= String.Format(this.apiService.editBrewRun, this.tenantId,this.brewId);
      
      this.apiService.putData(editBrewRunAPI, params).subscribe(response => {
        if (response) {
          this.toast.show('Brew successfully updated');
          this.router.navigate(['app/dashboard']);
        }
      }, error => {
        this.toast.danger(error.error.Message);
      });
    }
  }

  startBrew() {

    const data = this.dataService.checkPermission(this.permission.Start_Brew_Run.Id);

    if (!data) {
      this.toast.danger('You don\'t have access', 'Error');
    } else{
    if (this.singleBrew.statusId.toLowerCase() === this.status.inProgress.id.toLowerCase()) {
      this.toast.danger('Already Started the Brew');

    } else {
      const changeBrewRunStatusAPI= String.Format(this.apiService.ChangeBrewRunStatus, this.tenantId,this.brewId);
      const params = {
        statusId: this.status.inProgress.id
      };
      this.apiService.patchData(changeBrewRunStatusAPI, params).subscribe((response: any) => {
        if (response.status === 200) {
          this.toast.success('Brew successfully started');
          this.router.navigate(['app/dashboard']);
        }
      });
  }
}
  }
  startTimeChange() {
    this.startTime = this.editBrewForm.get('startTime').value;
  }

  endTimeChange() {
    this.endTime = this.editBrewForm.get('endTime').value;
  }

}
