import { Component, OnInit } from '@angular/core';
import { ApiProviderService } from '../../../core/api-services/api-provider.service';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NbToastrService, NbLayoutScrollService } from '@nebular/theme';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { String } from 'typescript-string-operations';
import { Guid } from 'guid-typescript';

@Component({
  selector: 'app-preferences',
  templateUrl: './preferences.component.html',
  styleUrls: ['./preferences.component.scss'],
})

export class PreferencesComponent implements OnInit {

  gravityMeasurement = [];
  temperatureUnits = [];
  unitTypes: any;
  generalDetails: any;
  timeZoneList: any;
  tenantId: any;
  formSubmittedGenSet: boolean;


  newTank: FormArray;
  savenewTankEnabled: boolean;
  enablenewTankValidation: any;
  enableTankEdit: any;
  enableeditTankIndex: boolean;

  formSubmitted: boolean;
  unitTypeList: any;
  tankTypeList: any;
  tankConfiguration: any;
  isactive: boolean;
  toggleOn: boolean;
  searchText: any;

  constructor(
    private apiService: ApiProviderService,
    private form: FormBuilder,
    private httpClient: HttpClient,
    private toast: NbToastrService,
    private router: Router,
    private datePipe: DatePipe,
    private scrolltop: NbLayoutScrollService,

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


  get forms() {
    return this.preferencesForm.controls;
  }

  get tankForms() {
    return this.tankForm.controls.listTank as FormGroup;
  }

  get newTankForms() {
    return this.tankForm.controls.newTank as FormGroup;
  }

  get newTankArray(): FormArray {
    return <FormArray>this.tankForm.get('newTank');
  }

  newTankForm(): FormGroup {
    return this.form.group({
      tankName: ['', Validators.required],
      tankType: ['', Validators.required],
      capacity: ['', Validators.required],
      unit: ['', Validators.required],
      isActive: [false]
    });
  }

  editTankForm(): FormGroup {
    return this.form.group({
      name: ['', Validators.required],
      tankTypeId: ['', Validators.required],
      capacity: ['', Validators.required],
      unit: ['', Validators.required],
    });
  }

  ngOnInit() {
    const userProfileDetails = JSON.parse(sessionStorage.getItem('user'));
    this.tenantId = userProfileDetails['userDetails'].tenantId;
    this.getPreferenceSettings();
    this.getAllPreferenceSystemData();
  }

  getPreferenceSettings() {

    const getPreferenceSettingsAPI = String.Format(this.apiService.getPreferenceSettings, this.tenantId);
    this.apiService.getDataList(getPreferenceSettingsAPI).subscribe((response: any) => {

      this.generalDetails = response['body'].preferenceSettings;

      if (this.generalDetails) {
        this.preferencesForm.get('timeZone').setValue(this.generalDetails.timeZoneId);
        this.preferencesForm.get('temperature').setValue(this.generalDetails.temperatureId);
        this.preferencesForm.get('gravityMeasurement').setValue(this.generalDetails.gravityMeasurementId);
      }

    });
  }

  getAllPreferenceSystemData() {

    const getAllPreferenceMasterDetailsAPI = String.Format(this.apiService.getAllPreferenceMasterDetails, this.tenantId);
    this.apiService.getDataList(getAllPreferenceMasterDetailsAPI).subscribe(response => {

      this.unitTypes = response['body'].unitTypes;

      this.unitTypes.map(units => {
        if (units.id === '29948d48-3bca-4786-a465-78e42693604f' || units.id == '0b1cc404-b982-451a-85b3-8fec59baf09a') {
          this.gravityMeasurement.push(units);
        }
        if (units.id === '2881d968-1c0e-4ca2-9819-c15b0dd7924d' || units.id == '3545a3b4-bf2e-4b94-a06e-5eea613f0e64') {
          this.temperatureUnits.push(units);
        }
      });

      this.tankTypeList = response['body'].tankType;

      this.timeZoneList = response['body'].timeZone;

      this.tankConfiguration = response['body'].tanks;
      this.listTankItems(this.tankConfiguration);

    });
  }

  saveGeneralSettings() {

    this.formSubmittedGenSet = true;
    if (this.preferencesForm.valid) {

      let preferenceId = 'bbd2266e-5b12-4f8e-8e20-38d21a2afe43'
      let id = this.generalDetails ? this.generalDetails.id : preferenceId;

      const params = {
        id: id,
        gravityMeasurementId: this.preferencesForm.get('gravityMeasurement').value,
        temperatureId: this.preferencesForm.get('temperature').value,
        isActive: "true",
        timeZoneId: this.preferencesForm.get('timeZone').value,
        tenantId: this.tenantId,
        CreatedDate: new Date(),
        ModifiedDate: new Date()
      };

      const addPreferenceAPI = String.Format(this.apiService.addPreference, this.tenantId);
      this.apiService.postData(addPreferenceAPI, params).subscribe((response: any) => {
        if (response.status === 200) {
          this.toast.show('General Settings Added', 'Success');
        }
      }, error => {
        this.toast.danger('', 'Something went wrong, Try Again');
      });
    }

  }

  newTankItem(): void {

    this.savenewTankEnabled = true;
    this.newTank = this.tankForm.get('newTank') as FormArray;
    if (!this.newTankForm().get('isActive')) {
      this.isactive = false;
    }
    this.newTank.push(this.newTankForm());
  }

  listTankItems(tankConfig) {

    let controls = <FormArray>this.tankForm.controls.listTank;

    controls.controls = [];

    tankConfig.forEach(element => {
      controls.push(this.form.group({
        id: [element.id],
        name: [element.name, Validators.required],
        capacity: [element.capacity, Validators.required],
        tankTypeId: [element.tankTypeId, Validators.required],
        unit: [element.unitId, Validators.required],
        isActive: [element.isActive],
      }));
    });
  }

  searchTank() {

    const getAllTankTypesListApi = String.Format(this.apiService.getAllTankConfigurationList, this.tenantId);
    this.apiService.getDataList(getAllTankTypesListApi, null, null, null, null, this.searchText).subscribe(response => {

      if (response.status === 200) {
        this.tankConfiguration = response['body'].tankDetails;
        this.listTankItems(this.tankConfiguration);
      }
    });
  }

  savenewTank(e, i) {

    this.formSubmitted = true;
    this.enablenewTankValidation = i;
    let controlNewTank = <FormArray>this.tankForm.controls.newTank;
    let controlListTank = <FormArray>this.tankForm.controls.listTank;

    if (controlNewTank.controls[i].status === 'VALID') {
      this.savenewTankEnabled = false;
      const params = {
        id: Guid.raw(),
        name: controlNewTank.controls[i].value.tankName,
        capacity: controlNewTank.controls[i].value.capacity,
        unitId: controlNewTank.controls[i].value.unit,
        tankTypeId: controlNewTank.controls[i].value.tankType,
        tenantId: this.tenantId,
        isActive: controlNewTank.controls[i].value.isActive,
        createdDate: new Date(),
        modifiedDate: new Date()
      };

      const addTankConfigurationApi = String.Format(this.apiService.addTankConfiguration, this.tenantId)
      this.apiService.postData(addTankConfigurationApi, params).subscribe((response: any) => {
        if (response.status === 200) {
          controlListTank.controls = [];
          controlNewTank.removeAt(i);
          this.listTankItems(response.body.tankDetails);

          this.toast.show('Tank Configuration Added', 'Success');
        }
      }, error => {
        this.toast.danger(error.error.message, ' Try Again');
      });
    }
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
      let tankId = control.controls[i].value.id;
      const params = {
        id: control.controls[i].value.id,
        name: control.controls[i].value.name,
        capacity: control.controls[i].value.capacity,
        tankTypeId: control.controls[i].value.tankTypeId,
        unitId: control.controls[i].value.unit,
        isActive: control.controls[i].value.isActive,
        modifiedDate: new Date()
      };

      const editTankConfigurationApi = String.Format(this.apiService.editTankConfiguration, this.tenantId, tankId)
      this.apiService.putData(editTankConfigurationApi, params).subscribe((response: any) => {

        if (response.status === 200) {
          control.controls = [];
          control.removeAt(i);
          this.listTankItems(response.body.tankDetails);
          this.toast.show('Tank Configuration Edited', 'Success');
        }
      }, error => {
        this.toast.danger(error.error.message);
      });

    }
  }
  clear(text: string) {
    this.searchText = "";
    if (text == "tank") {
      this.searchTank();
    }
  }

  statusClickEdit(status, i) {
    this.isactive = !this.isactive;
  }

  statusClick(status, i) {
    this.isactive = !this.isactive;
  }

  gotoTop() {
    this.scrolltop.scrollTo(0, 0);
  }
}
