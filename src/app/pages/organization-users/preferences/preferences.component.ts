import { Component, OnInit } from '@angular/core';
import { ApiProviderService } from '../../../core/api-services/api-provider.service';
import { FormBuilder, FormGroup, FormArray, Validators, FormControl } from '@angular/forms';
import { LoginComponent } from '../../../login/login.component';
import { HttpClient, HttpHeaders, HttpRequest } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { NbToastrService } from '@nebular/theme';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { String } from 'typescript-string-operations';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss'],
})
export class PreferencesComponent implements OnInit {
  gravityMeasurement = [];
  temperatureUnits = [];
  preferenceDetails;
  generalDetails;
  timeZoneList: any;
  TenantId: any;
  formSubmittedGenSet = false;
  //General Settings
  newYeast: FormArray;
  listYeast: FormArray;
  enableeditYeastIndex: boolean;
  enablenewYeastValidation: any;
  savenewYeastEnabled: boolean = false;
  yeastStrain: any;
  enableYeastEdit: any;
  //Yeast Strain
  newTank: FormArray;
  savenewTankEnabled: boolean = false;
  enablenewTankValidation: any;
  enableTankEdit: any;
  enableeditTankIndex: boolean;
  //Tank Configuration
  formSubmitted = false;
  unitTypeList: any;
  tankTypeList: any;
  tankConfiguration: any;
  isactive: boolean = false;
  toggleOn = false;
  //Common Variables

  constructor(
    private apiService: ApiProviderService,
    private form: FormBuilder,
    private httpClient: HttpClient,
    private toast: NbToastrService,
    private router: Router,
    private datePipe: DatePipe,

  ) { }


  preferencesForm = this.form.group({
    gravityMeasurement: ['', [Validators.required]],
    temperature: ['', [Validators.required]],
    timeZone: ['', [Validators.required]],

  });

  tankForm = this.form.group({
    newTank: this.form.array([]),
    listTank: this.form.array([]),
  });

  tankyeastForm = this.form.group({
    newYeast: this.form.array([]),
    listYeast: this.form.array([])
  });

  get forms() {
    return this.preferencesForm.controls;
  }

  get tankForms() {
    return this.tankForm.controls.listTank as FormGroup;
  }

  get newTankForms() {
    return this.tankForm.controls.newTank as FormGroup;
  }
  get yeastForms() {
    return this.tankyeastForm.controls.listYeast as FormGroup;
  }

  get newYeastForms() {
    return this.tankyeastForm.controls.newYeast as FormGroup;
  }
  ngOnInit() {
    const userProfileDetails = JSON.parse(sessionStorage.getItem('user'));
    this.TenantId = userProfileDetails['userDetails'].tenantId;
    this.getGeneraalSettings(this.TenantId);
    this.getGeneralMeasurements();
    this.unitType();
    this.tankTypeById(this.TenantId);
    //general settings
    this.listYeastItems();
    //yeast strain
    this.listTankItems();
    //tank strain

  }
  get listTankArray(): FormArray {
    return <FormArray>this.tankyeastForm.get('listTank');
  }
  get newTankArray(): FormArray {
    return <FormArray>this.tankForm.get('newTank');
  }
  get listYeastArray(): FormArray {
    return <FormArray>this.tankyeastForm.get('listYeast');
  }
  get newYeastArray(): FormArray {
    return <FormArray>this.tankyeastForm.get('newYeast');
  }
  newYeastForm(): FormGroup {
    return this.form.group({
      yeastStrain: ['', Validators.required],
      yeastDate: ['']
    });
  }

  EditYeastForm(): FormGroup {
    return this.form.group({
      Name: ['', Validators.required],
      CreatedDate: ['']
    });
  }

  newTankForm(): FormGroup {
    return this.form.group({
      tankname: ['', Validators.required],
      tanktype: ['', Validators.required],
      capacity: ['', Validators.required],
      unit: ['', Validators.required],
      isActive: [false]
    });
  }

  EditTankForm(): FormGroup {
    return this.form.group({
      Name: ['', Validators.required],
      tankTypeId: ['', Validators.required],
      capacity: ['', Validators.required],
      unit: ['', Validators.required],
    });
  }


  //General Settings
  getGeneraalSettings(TenantId) {
    const getPreferenceSettingsAPI = String.Format(this.apiService.getPreferenceSettings, TenantId);
    this.apiService.getDataList(getPreferenceSettingsAPI).subscribe((response: any) => {
      this.generalDetails = response['body'];
      if (this.generalDetails) {
        this.preferencesForm.get('timeZone').setValue(this.generalDetails.timeZoneId);
        this.preferencesForm.get('temperature').setValue(this.generalDetails.temperatureId);
        this.preferencesForm.get('gravityMeasurement').setValue(this.generalDetails.gravityMeasurementId);
      }

    });
  }
  getGeneralMeasurements() {
    this.apiService.getDataList(this.apiService.getAllActiveUnitType).subscribe(response => {
      this.preferenceDetails = response['body'];
      this.preferenceDetails.map(units => {
        if (units.id === '29948d48-3bca-4786-a465-78e42693604f' || units.id == '0b1cc404-b982-451a-85b3-8fec59baf09a') {
          this.gravityMeasurement.push(units);
        }
        if (units.id === '2881d968-1c0e-4ca2-9819-c15b0dd7924d' || units.id == '3545a3b4-bf2e-4b94-a06e-5eea613f0e64') {
          this.temperatureUnits.push(units);
        }
      });
    });
    this.apiService.getDataList(this.apiService.getAllTimeZone).subscribe(response => {
      this.timeZoneList = response['body'].timeZone;
    });
  }

  saveGeneralSettings() {
    this.formSubmittedGenSet = true;
    if (this.preferencesForm.valid) {

      let preferenceId = 'bbd2266e-5b12-4f8e-8e20-38d21a2afe43'
      let Id = this.generalDetails ? this.generalDetails.Id : preferenceId;

      const params = {
        Id: Id,
        GravityMeasurementId: this.preferencesForm.get('gravityMeasurement').value,
        TemperatureId: this.preferencesForm.get('temperature').value,
        IsActive: "true",
        TimeZoneId: this.preferencesForm.get('timeZone').value,
        TenantId: this.TenantId
      };
      this.apiService.postData(this.apiService.addPreference, params).subscribe((response: any) => {
        if (response.status === 200) {
          this.toast.show('General Settings Added', 'Success');
        }
      }, error => {
        this.toast.danger('Something went wrong, Try Again');
      });
    }
  }


  SearchYeast(event) {
    const search = event.target.value;
    if (search.length == 0) {
      let controls = <FormArray>this.tankyeastForm.controls.listYeast;
      controls.controls = [];
      this.listYeastItems();
    } else {

      const getAllYeastStrainsAPI = String.Format(this.apiService.getAllYeastStrains, this.TenantId);
      this.apiService.getData(getAllYeastStrainsAPI, null, null, null, null, search).subscribe(response => {
        if (response.status === 200) {
          this.yeastStrain = response['body'].yeastStrainBase;
          let controls = <FormArray>this.tankyeastForm.controls.listYeast;
          this.yeastStrain.forEach(element => {
            controls.controls = [];
            controls.push(this.form.group({
              Name: [element.Name, Validators.required],
              CreatedDate: [element.CreatedDate, Validators.required]
            }));

          });
        }
      });
    }
  }
  newYeastItem(): void {
    this.savenewYeastEnabled = true;
    this.newYeast = this.tankyeastForm.get('newYeast') as FormArray;
    this.newYeast.push(this.newYeastForm());
  }

  listYeastItems() {
    const getAllYeastStrainsAPI = String.Format(this.apiService.getAllYeastStrains, this.TenantId);
    this.apiService.getData(getAllYeastStrainsAPI).subscribe(response => {
      this.yeastStrain = response['body'];
      sessionStorage.yeastStrain = JSON.stringify(this.yeastStrain);
      let controls = <FormArray>this.tankyeastForm.controls.listYeast;
      this.yeastStrain.forEach(element => {
        let date = new Date(element.CreatedDate).toString();
        date = this.datePipe.transform(date, 'yyyy-MM-dd');
        controls.push(this.form.group({
          Id: [element.Id],
          Name: [element.Name, Validators.required],
          CreatedDate: [date, Validators.required]
        }));

      });
    });
  }


  savenewYeast(e, i) {

    this.formSubmitted = true;
    this.enablenewYeastValidation = i;
    let controlNewYeast = <FormArray>this.tankyeastForm.controls.newYeast;
    let controlListYeast = <FormArray>this.tankyeastForm.controls.listYeast;

    if (controlNewYeast.controls[i].status === 'VALID') {
      this.savenewYeastEnabled = false;
      const params = {
        name: controlNewYeast.controls[i].value.yeastStrain,
        TenantId: this.TenantId,
        isActive: "true",
      };
      this.apiService.postData(this.apiService.addYeastStrain, params).subscribe((response: any) => {
        if (response.status === 200) {
          this.listYeastItems();
          controlListYeast.controls = [];
          controlNewYeast.removeAt(i);
          this.toast.show('Yeast Strain Added', 'Success');
        }
      }, error => {
        this.toast.danger('Something went wrong, Try Again');
      });
    }
  }

  editYeast(e, i) {
    this.enableeditYeastIndex = true;
    this.enableYeastEdit = i;
  }
  saveEditYeast(e, i) {
    this.enableYeastEdit = i;
    this.formSubmitted = true;

    let control = <FormArray>this.tankyeastForm.controls.listYeast;
    if (this.yeastForms.controls[i].status === 'VALID') {
      this.enableeditYeastIndex = false;
      const params = {
        Id: control.controls[i].value.Id,
        Name: control.controls[i].value.Name,
        IsActive: 'True',
      };

      this.apiService.putData(this.apiService.editYeastStrain, params).subscribe((response: any) => {
        if (response.status === 200) {
          this.listYeastItems();
          control.controls = [];
          control.removeAt(i);
          this.toast.show('Yeast Strain Edited', 'Success');
        }
      }, error => {
        this.toast.danger('Something went wrong, Try Again');
      });

    }
  }
  //Tank Configuration
  newTankItem(): void {
    this.savenewTankEnabled = true;
    this.newTank = this.tankForm.get('newTank') as FormArray;
    if (!this.newTankForm().get('IsActive')) {
      this.isactive = false;
    }
    this.newTank.push(this.newTankForm());
    console.log('this.newTank', this.newTankForm());

  }
  savenewTank(e, i) {
    this.formSubmitted = true;
    this.enablenewTankValidation = i;
    let controlNewTank = <FormArray>this.tankForm.controls.newTank;
    let controlListTank = <FormArray>this.tankForm.controls.listTank;

    if (controlNewTank.controls[i].status === 'VALID') {
      this.savenewTankEnabled = false;
      const params = {
        name: controlNewTank.controls[i].value.tankname,
        capacity: controlNewTank.controls[i].value.capacity,
        unitId: controlNewTank.controls[i].value.unit,
        tankTypeId: controlNewTank.controls[i].value.tanktype,
        TenantId: this.TenantId,
        isActive: controlNewTank.controls[i].value.isActive,
      };


      this.apiService.postData(this.apiService.addTankConfiguration, params).subscribe((response: any) => {
        if (response.status === 200) {
          controlListTank.controls = [];
          controlNewTank.removeAt(i);
          this.listTankItems();

          this.toast.show('Tank Configuration Added', 'Success');
        }
      }, error => {
        this.toast.danger(error.error.Message, ' Try Again');
      });
    }
  }

  listTankItems() {
    this.apiService.getData(this.apiService.getAllTankConfigurationList, null, null, this.TenantId).subscribe(response => {
      this.tankConfiguration = response['body'];
      let controls = <FormArray>this.tankForm.controls.listTank;

      this.tankConfiguration.forEach(element => {

        controls.push(this.form.group({
          Id: [element.Id],
          name: [element.Name, Validators.required],
          capacity: [element.Capacity, Validators.required],
          tankTypeId: [element.TankTypeId, Validators.required],
          unit: [element.UnitId, Validators.required],
          isActive: [element.IsActive],
        }));

      });
    });
  }

  editTank(e, i) {
    this.enableeditTankIndex = true;
    this.enableTankEdit = i;
  }

  saveEditTank(e, i) {
    this.enableTankEdit = i;
    this.formSubmitted = true;

    let control = <FormArray>this.tankForm.controls.listTank;
    if (this.tankForms.controls[i].status === 'VALID') {
      this.enableeditTankIndex = false;
      const params = {
        Id: control.controls[i].value.Id,
        Name: control.controls[i].value.name,
        Capacity: control.controls[i].value.capacity,
        TankTypeId: control.controls[i].value.tankTypeId,
        UnitId: control.controls[i].value.unit,
        IsActive: control.controls[i].value.isActive,
      };

      this.apiService.putData(this.apiService.editTankConfiguration, params).subscribe((response: any) => {
        if (response.status === 200) {
          this.listTankItems();
          control.controls = [];
          control.removeAt(i);
          this.toast.show('Tank Configuration Edited', 'Success');
        }
      }, error => {
        this.toast.danger(error.error.Message);
      });

    }
  }

  SearchTank(event) {
    const search = event.target.value;
    if (search.length === 0) {
      let controls = <FormArray>this.tankForm.controls.listTank;
      controls.controls = [];
      this.listTankItems();
    } else {
      this.apiService.getDataByParams(this.apiService.getAllTankConfigurationList, this.TenantId, search).subscribe(response => {
        if (response.status === 200) {
          this.tankConfiguration = response['body'];
          let controls = <FormArray>this.tankForm.controls.listTank;
          this.tankConfiguration.forEach(element => {
            controls.controls = [];
            controls.push(this.form.group({
              Id: [element.Id],
              name: [element.Name, Validators.required],
              capacity: [element.Capacity, Validators.required],
              tankTypeId: [element.TankTypeId, Validators.required],
              unit: [element.UnitId, Validators.required],
            }));

          });
        }
      });
    }
  }
  unitType() {
    this.unitTypeList = JSON.parse(sessionStorage.getItem('units'));
  }
  tankTypeById(tenantId) {
    this.apiService.getData(this.apiService.getAllActiveTankType, null, null, tenantId).subscribe(response => {
      this.tankTypeList = response['body'];
    });
  }

  statusClickEdit(status, i) {
    this.isactive = !this.isactive;
  }
  statusClick(status, i) {
    this.isactive = !this.isactive;
  }
}
