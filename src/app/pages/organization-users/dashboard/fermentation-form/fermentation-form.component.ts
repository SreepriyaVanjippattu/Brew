import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  BrewRunFermentation, FermentationDataEntry, YeastDataDetail, DiacetylRestDataDetail, AgingDetail,
  EnterFermentationData, FermentationDetailsNote, AdjunctsDetail, HopesDetail,
} from '../../../../models/brewrun';
import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { DashboardService } from '../dashboard.service';
import { NbToastrService } from '@nebular/theme';
import { addIn } from '../../../../models/addInConstants';
import { Guid } from 'guid-typescript';
import { FormBuilder } from '@angular/forms';
import { ThrowStmt } from '@angular/compiler';
import { ModalService } from '../../../modal';
import { DatePipe } from '@angular/common';
import { String } from 'typescript-string-operations';
import { Observable, throwError,of as observableOf  } from 'rxjs';

@Component({
  selector: 'fermentation-form',
  templateUrl: './fermentation-form.component.html',
  styleUrls: ['./fermentation-form.component.scss'],
})
export class FermentationFormComponent implements OnInit {
  @ViewChild('startTemp', { static: false }) startTemp: ElementRef;
  @ViewChild('startDia', { static: false }) startDia: ElementRef;

  isCollapsedFermentation = false;
  isCollapsedYeast = false;
  isCollapsedHops = false;
  isCollapsedDiacetyl = false;
  isCollapsedCooling = false;
  isCollapsedFermentationPrevious = false;
  isCollapsedFermentationEnter = false;
  isCollapsedNotes;
  isCollapsedAdjuncts;
  tenantId: any;
  brewId: any;

  brewRunFermentation: BrewRunFermentation;

  diaStartTime: any = '';
  diaEndTime: any = '';
  coolStartTime: any = '';
  coolEndTime: any = '';
  units: any;
  preference: any;
  preferedUnit: any;
  yeastStrain: any;
  countries: any;
  addins: any;
  suppliers: any;
  maltTypes: any;
  styles: any;
  maltNames: any;
  brewerName:string;
  fermentationAvailable: boolean;

  selectedPos: number = -1;
  recipeId: any;
  addInHopsKettle: any = [];
  addInHopsWhirlpool: any = [];
  addInHopsFermentation: any = [];

  addInAdjunctsKettle: any = [];
  addInAdjunctsWhirlpool: any = [];
  addInAdjunctsFermentation: any = [];
  getaddInData: any;
  addInConstants = addIn;


  modalForms = this.formBuilder.group({
    styleText: [''],
    typeText: [''],
    supplierText: [''],
  });
  validateForm = this.formBuilder.group({
    tank: [''],
  });
  preferedPlato: any;
  platoUnitId: any;
  recipeContent: any;
  fermentTarget = [];
  yeastTarget = [];
  hopsTarget = [];
  adjunctsTarget = [];
  diacetylTarget = [];
  coolTarget = [];
  tankList: any;
  currentTank: string;
  changeValue: any;
  dataTarget: boolean = false;
  setClass = false;
  setClassYeast = false;
  setClassHops = false;
  setClassAdjuncts = false;
  setClassDia = false;
  setClassCool = false;
  setClassPrevFerm = false;
  currentUser: any;

  constructor(
    private dataService: DashboardService,
    private apiService: ApiProviderService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: NbToastrService,
    private formBuilder: FormBuilder,
    private modalService: ModalService,
    private datePipe: DatePipe,

  ) { }

  ngOnInit() {
    this.brewRunFermentation = new BrewRunFermentation();
    this.brewId = this.route.snapshot.paramMap.get('id');
    const userDetails = JSON.parse(sessionStorage.getItem('user'));

    this.tenantId = userDetails["userDetails"]["tenantId"];
    this.currentUser = userDetails["userDetails"]["userId"];
    this.brewerName = userDetails["userDetails"]["firstName"] + ' ' + userDetails["userDetails"]["lastName"];
    this.getPreferenceUsed();
    this.getFermentationMasterDetails();
    this.getFermentationDetails();
  }
  currentValue(event) {
    this.changeValue = event.target.value;
    if (this.currentTank !== this.changeValue) {
      this.dataTarget = true;
    }

  }
  getFermentationMasterDetails()
  {
    const getFermentationMasterDetailsAPI = String.Format(this.apiService.getFermentationMasterDetails, this.tenantId);
    this.apiService.getDataList(getFermentationMasterDetailsAPI).subscribe(response => {
      if (response) {
        this.countries = response['body']['fermentationMasterDetails']['countries'];
        this.addins = response['body']['fermentationMasterDetails']['addIns'];
        this.suppliers = response['body']['fermentationMasterDetails']['suppliers'];
        this.maltTypes = response['body']['fermentationMasterDetails']['maltGrainTypes'];
        this.styles = response['body']['fermentationMasterDetails']['styles'];
        this.units = response['body']['fermentationMasterDetails']['units']
        this.yeastStrain = response['body']['fermentationMasterDetails']['yeastStrains'];
        this.tankList = response['body']['fermentationMasterDetails']['tanks']
        this.findUnits();
        
      }
    });
  }

  /**
   * Function to get single brew
   * @param tenantId
   * @param brewId
   */
  getFermentationDetails() {

     const getFermentationgDetailsAPI = String.Format(this.apiService.getFermentationDetails, this.tenantId,this.brewId);
      this.apiService.getDataByQueryParams(getFermentationgDetailsAPI, null, this.tenantId,this.brewId).subscribe(response => {
      if (response.status === 200) {
        this.brewRunFermentation = response['body']['brewRunFermentation'];
        this.currentTank = this.brewRunFermentation.tankName;
        this.recipeContent = response['body']['recipe'];
        this.fermentationAvailable = response['body']['fermentationAvailable'];
        this.getFermentTargets(this.recipeContent);
        this.getYeastTargets(this.recipeContent);
        this.getHopsTargets(this.recipeContent);
        this.getAdjunctsTargets(this.recipeContent);
        this.getDiacetylTargets(this.recipeContent);
        this.getCoolingTargets(this.recipeContent);
        this.brewRunFermentation.hopesDetails.forEach(element => {
          // fermentation data
          if (element.addInId === this.addInConstants.Fermentation.Id) {
            if (element.startTime === null) {
              element.startTime = new Date();
            }
            let dateTime = this.timezone(new Date(element.startTime).toUTCString());
            dateTime = dateTime.split(' ').slice(0, 5).join(' ');
            element.startTime = new Date(dateTime);
            this.addInHopsFermentation.push(element);
          }
        });

        this.brewRunFermentation.adjunctsDetails.forEach(element => {
          // fermentation data
          if (element.addInId === this.addInConstants.Fermentation.Id) {
            if (element.startTime === null) {
              element.startTime = new Date();
            }

            let dateTime = this.timezone(new Date(element.startTime).toUTCString());
            dateTime = dateTime.split(' ').slice(0, 5).join(' ');
            element.startTime = new Date(dateTime);
            this.addInAdjunctsFermentation.push(element);
          }
        });

        if (this.brewRunFermentation.fermentationDataEntry.length == 0) {
          this.brewRunFermentation.fermentationDataEntry.push(new FermentationDataEntry());
        }
        if (this.brewRunFermentation.yeastDataDetails.length == 0) {

          this.brewRunFermentation.yeastDataDetails.push(new YeastDataDetail());
          this.brewRunFermentation.yeastDataDetails[this.brewRunFermentation.yeastDataDetails.length - 1].tenantId = this.tenantId;
        }
        if (this.brewRunFermentation.diacetylRestDataDetails.length == 0) {
          this.brewRunFermentation.diacetylRestDataDetails.push(new DiacetylRestDataDetail());
          this.brewRunFermentation.diacetylRestDataDetails[this.brewRunFermentation.diacetylRestDataDetails.length - 1].tenantId = this.tenantId;

        } else {
          this.brewRunFermentation.diacetylRestDataDetails.map((diaTimes: DiacetylRestDataDetail) => {
            diaTimes.startTime = this.datePipe.transform(diaTimes.startTime, 'E, dd LLL yyyy HH:mm:ss');
            diaTimes.endTime = this.datePipe.transform(diaTimes.endTime, 'E, dd LLL yyyy HH:mm:ss');
          });
        }
        if (this.brewRunFermentation.agingDetails.length == 0) {
          this.brewRunFermentation.agingDetails.push(new AgingDetail());
          this.brewRunFermentation.agingDetails[this.brewRunFermentation.agingDetails.length - 1].tenantId = this.tenantId;

        } else {
          this.brewRunFermentation.agingDetails.map((agingTimes: AgingDetail) => {
            agingTimes.startTime = this.datePipe.transform(agingTimes.startTime, 'E, dd LLL yyyy HH:mm:ss');
            agingTimes.endTime = this.datePipe.transform(agingTimes.endTime, 'E, dd LLL yyyy HH:mm:ss');
          });
        }
        this.brewRunFermentation.enterFermentationData.push(new EnterFermentationData());
        this.brewRunFermentation.enterFermentationData[this.brewRunFermentation.enterFermentationData.length - 1].tenantId = this.tenantId;
        this.selectedPos = this.brewRunFermentation.enterFermentationData.length - 1;
        this.brewRunFermentation.enterFermentationData.map((enter: EnterFermentationData, i) => {

          let dateTime = this.timezone(new Date(enter.dateAndTime).toUTCString());
          dateTime = dateTime.split(' ').slice(0, 5).join(' ');
          enter.dateAndTime = new Date(dateTime);
        });
        if (this.brewRunFermentation.fermentationDetailsNotes.length == 0) {
          this.brewRunFermentation.fermentationDetailsNotes.push(new FermentationDetailsNote());
          this.brewRunFermentation.fermentationDetailsNotes[this.brewRunFermentation.fermentationDetailsNotes.length - 1].tenantId = this.tenantId;

        }
        this.checkIfComplete(this.brewRunFermentation);
      }

    });
  }


  findUnits() {
    this.units.forEach(element => {
      if (element.id === this.preference.temperatureId) {
        this.preferedUnit = element.symbol;
      }
      if (element.id === this.preference.gravityMeasurementId) {
        this.preferedPlato = element.name;
        this.platoUnitId = element.id;
      }
    });
  }

  getPreferenceUsed() {
    const getPreferenceSettingsAPI = String.Format(this.apiService.getPreferenceSettings, this.tenantId);
    this.apiService.getDataList(getPreferenceSettingsAPI).subscribe((response: any) => {
      if (response.status === 200) {
        this.preference = response['body']['preferenceSettings'];

      }
    }, error => {

    });
  }
  conditioningClick() {
    this.saveGo('app/dashboard/condition-form/' + this.brewId);
  }
  onPreviousClick() {
    this.saveGo('app/dashboard/brew-log-form/' + this.brewId);
  }
  brewLogClick() {
    this.saveGo('app/dashboard/brew-log-form/' + this.brewId);
  }
  mashInClick() {
    this.saveGo('app/dashboard/mash-in-form/' + this.brewId);
  }

  fermentationClick() {
    this.saveGo('app/dashboard/fermentation-form/' + this.brewId);
  }
  editClientDirectory(pos: number) {
    this.selectedPos = pos;
  }
  addFermentationData() {
    this.brewRunFermentation.enterFermentationData.push(new EnterFermentationData());
    this.brewRunFermentation.enterFermentationData[this.brewRunFermentation.enterFermentationData.length - 1].tenantId = this.tenantId;
    this.selectedPos = this.brewRunFermentation.enterFermentationData.length - 1;
    let dateTime = this.timezone(new Date(this.brewRunFermentation.enterFermentationData[this.selectedPos].dateAndTime).toUTCString());
    dateTime = dateTime.split(' ').slice(0, 5).join(' ');
    this.brewRunFermentation.enterFermentationData[this.selectedPos].dateAndTime = new Date(dateTime);
  }
 

  saveGo(url: string) {
    this.brewRunFermentation.hopesDetails.map((hop: HopesDetail) => {
      if (hop.addInId === this.addInConstants.Fermentation.Id) {
        const dateTime2 = hop.startTime.toString().split(' ').slice(0, 5).join(' ');
        const preferedZone = this.preference.baseUtcOffset;
        let zone = preferedZone.replace(/:/gi, '');
        zone = zone.slice(0, -2);
        const newDateTime = dateTime2 + ' GMT' + `${zone}`;
        hop.startTime = new Date(newDateTime).toLocaleString();
      }
    });
    this.brewRunFermentation.adjunctsDetails.map((adjunct: AdjunctsDetail) => {
      if (adjunct.addInId === this.addInConstants.Fermentation.Id) {
        const dateTime2 = adjunct.startTime.toString().split(' ').slice(0, 5).join(' ');
        const preferedZone = this.preference.baseUtcOffset;
        let zone = preferedZone.replace(/:/gi, '');
        zone = zone.slice(0, -2);
        const newDateTime = dateTime2 + ' GMT' + `${zone}`;
        adjunct.startTime = new Date(newDateTime).toLocaleString();
      }
    });

    this.brewRunFermentation.enterFermentationData.map((enter: EnterFermentationData, i) => {
      if (enter.plato === null && enter.temperature === null && enter.ph === null) {
        this.brewRunFermentation.enterFermentationData.splice(i, 1);
      }
      const dateTime2 = enter.dateAndTime.toString().split(' ').slice(0, 5).join(' ');
      const preferedZone = this.preference.baseUtcOffset;
      let zone = preferedZone.replace(/:/gi, '');
      zone = zone.slice(0, -2);
      const newDateTime = dateTime2 + ' GMT' + `${zone}`;
      enter.dateAndTime = new Date(newDateTime).toLocaleString();
    });
    this.saveData().subscribe(response => {
      this.router.navigate([url])
    }, error => {
      this.toast.danger(error.error.message);
    });
    
   
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
          this.styles = response.body.styles;
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
          this.maltTypes = response.body.maltTypes;
          this.modalForms.reset();
        }
      });
    }
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
          this.suppliers = response.body.suppliers;
          this.modalForms.reset();
        }
      });
    }
  }
  setStartTemp(i, start) {
    this.coolStartTime = this.timezone(new Date().toUTCString());
    this.coolStartTime = this.coolStartTime.split(' ').slice(0, 5).join(' ');
    start.startTime = this.coolStartTime;
  }

  endTemp(i, end) {
    this.coolEndTime = this.timezone(new Date().toUTCString());
    this.coolEndTime = this.coolEndTime.split(' ').slice(0, 5).join(' ');
    end.endTime = this.coolEndTime;
  }

  setStartDia(i, start) {
    this.diaStartTime = this.timezone(new Date().toUTCString());
    this.diaStartTime = this.diaStartTime.split(' ').slice(0, 5).join(' ');
    start.startTime = this.diaStartTime;
  }

  setEndDia(i, end) {
    this.diaEndTime = this.timezone(new Date().toUTCString());
    this.diaEndTime = this.diaEndTime.split(' ').slice(0, 5).join(' ');
    end.endTime = this.diaEndTime;
  }

  timezone(dateTime) {
    // Timezone convertion
    const preferedZone = this.preference.baseUtcOffset;
    if (preferedZone !== undefined && preferedZone !== null) {
      let zone = preferedZone.replace(/:/gi, '');
      zone = zone.slice(0, -2);
      if (zone.includes('-')) {
        zone = zone.replace(/-/gi, '+');
      } else if (zone.includes('+')) {
        zone = zone.replace(/\+/gi, '-');
      }
      const newDateTime = dateTime + ' ' + `${zone}`;
      return new Date(newDateTime).toUTCString();
    }
  }


  getFermentTargets(recipeContent: any) {
    if (recipeContent.fermentationTargets !== null) {
      this.fermentTarget.push(recipeContent.fermentationTargets);
    }
  }
  getYeastTargets(recipeContent: any) {
    if (recipeContent.yeast !== null) {
      this.yeastTarget.push(recipeContent.yeast);
    }
  }
  getHopsTargets(recipeContent: any) {
    if (recipeContent.hops.length !== 0) {
      this.hopsTarget = recipeContent.hops.filter(x => x.addInId === this.addInConstants.Fermentation.Id);
    }
  }
  getAdjunctsTargets(recipeContent: any) {
    if (recipeContent.adjuncts.length !== 0) {
      this.adjunctsTarget = recipeContent.adjuncts.filter(x => x.addInId === this.addInConstants.Fermentation.Id);
    }
  }
  getDiacetylTargets(recipeContent: any) {
    if (recipeContent.diacetylRest !== null) {
      this.diacetylTarget.push(recipeContent.diacetylRest);
    }
  }
  getCoolingTargets(recipeContent: any) {
    if (recipeContent.aging !== null) {
      this.coolTarget.push(recipeContent.aging);
    }
  }

  getAdjCountFerm(uid: string): number {
    let count = 1;
    const specials = this.brewRunFermentation.adjunctsDetails.filter(x => x.addInId === this.addInConstants.Fermentation.Id);
    specials.forEach((adj: AdjunctsDetail, i: number) => {
      if (adj.id === uid) {
        count = i + 1;
      }
    });
    return count;
  }

  getAdjCountFermTargets(uid: string): number {
    let count = 1;
    const specials = this.recipeContent.adjuncts.filter(x => x.addInId === this.addInConstants.Fermentation.Id);
    specials.forEach((adj, i: number) => {
      if (adj.Id === uid) {
        count = i + 1;
      }
    });
    return count;
  }

  getHopsCountFerm(uid: string): number {
    let count = 1;
    const specials = this.brewRunFermentation.hopesDetails.filter(x => x.addInId === this.addInConstants.Fermentation.Id);
    specials.forEach((hop: HopesDetail, i: number) => {
      if (hop.id === uid) {
        count = i + 1;
      }
    });
    return count;
  }

  getHopsCountFermTargets(uid: string): number {
    let count = 1;
    const specials = this.recipeContent.hops.filter(x => x.addInId === this.addInConstants.Fermentation.Id);
    specials.forEach((hop, i: number) => {
      if (hop.id === uid) {
        count = i + 1;
      }
    });
    return count;
  }

  onFermentComplete(i, editedSectionName) {
    this.isCollapsedFermentation = !this.isCollapsedFermentation;
    this.brewRunFermentation.fermentationDataEntry.map(element => {
      element.isCompleted = true;
    });
    this.saveData().subscribe(response => {
      this.setClass = true;
    }, error => {
      this.setClass = false;
      this.toast.danger(error.error.message);
     });
  }

  onYeastComplete(i, editedSectionName) {
    this.isCollapsedYeast = !this.isCollapsedYeast;
    this.brewRunFermentation.yeastDataDetails.map(element => {
      element.isCompleted = true;
    });
    this.saveData().subscribe(response => {
      this.setClassYeast = true;
    }, error => {
      this.setClassYeast = false;
      this.toast.danger(error.error.message);
     });
  }

  onHopsComplete(editedSectionName) {
    this.isCollapsedHops = !this.isCollapsedHops;
    this.brewRunFermentation.hopesDetails.map(element => {
      if (element.addInId === this.addInConstants.Fermentation.Id) {
        element.isCompleted = true;
      }
    });
    this.saveData().subscribe(response => {
      this.setClassHops = true;
    }, error => {
      this.setClassHops = false;
      this.toast.danger(error.error.message);
     });
  }

  onAdjunctsComplete(editedSectionName) {
    this.isCollapsedAdjuncts = !this.isCollapsedAdjuncts;
    this.brewRunFermentation.adjunctsDetails.map(element => {
      if (element.addInId === this.addInConstants.Fermentation.Id) {
        element.isCompleted = true;
      }
    });
    this.saveData().subscribe(response => {
      this.setClassAdjuncts = true;
    }, error => {
      this.setClassAdjuncts = false;
      this.toast.danger(error.error.message);
     });
  }

  onDiacetylComplete(i, editedSectionName) {
    this.isCollapsedDiacetyl = !this.isCollapsedDiacetyl;
    this.brewRunFermentation.diacetylRestDataDetails.map(element => {
      element.isCompleted = true;
    });

    this.saveData().subscribe(response => {
      this.setClassDia = true;
    }, error => {
      this.setClassDia = false;
      this.toast.danger(error.error.message);
     });
  }

  onCoolingComplete(i, editedSectionName) {
    this.isCollapsedCooling = !this.isCollapsedCooling;
    this.brewRunFermentation.agingDetails.map(element => {
      element.isCompleted = true;
    });
    this.saveData().subscribe(response => {
      this.setClassCool = true;
    }, error => {
      this.setClassCool = false;
      this.toast.danger(error.error.message);
     });
  }

  onPrevFermComplete(length, editedSectionName) {
    this.isCollapsedFermentationPrevious = !this.isCollapsedFermentationPrevious;
    this.brewRunFermentation.enterFermentationData.map(element => {
      element.isCompleted = true;
    });
    this.saveData().subscribe(response => {
      this.setClassPrevFerm = true;
    }, error => {
      this.setClassPrevFerm = false;
      this.toast.danger(error.error.message);
     });
  }

  checkIfComplete(brew: BrewRunFermentation) {
    if (brew.fermentationDataEntry.length !== 0) {
      brew.fermentationDataEntry.map(element => {
        if (element.isCompleted === true) {
          this.isCollapsedFermentation = !this.isCollapsedFermentation;
          this.setClass = true;
        }
      });
    }

    if (brew.yeastDataDetails.length !== 0) {
      brew.yeastDataDetails.map(element => {
        if (element.isCompleted === true) {
          this.isCollapsedYeast = !this.isCollapsedYeast;
          this.setClassYeast = true;
        }
      });
    }

    if (brew.hopesDetails.length !== 0) {
      brew.hopesDetails.map(element => {
        if (element.addInId === this.addInConstants.Fermentation.Id && element.isCompleted === true) {
          this.isCollapsedHops = !this.isCollapsedHops;
          this.setClassHops = true;
        }
      });
    }

    if (brew.adjunctsDetails.length !== 0) {
      brew.adjunctsDetails.map(element => {
        if (element.addInId === this.addInConstants.Fermentation.Id && element.isCompleted === true) {
          this.isCollapsedAdjuncts = !this.isCollapsedAdjuncts;
          this.setClassAdjuncts = true;
        }
      });
    }

    if (brew.diacetylRestDataDetails.length !== 0) {
      brew.diacetylRestDataDetails.map(element => {
        if (element.isCompleted === true) {
          this.isCollapsedDiacetyl = !this.isCollapsedDiacetyl;
          this.setClassDia = true;
        }
      });
    }

    if (brew.agingDetails.length !== 0) {
      brew.agingDetails.map(element => {
        if (element.isCompleted === true) {
          this.isCollapsedCooling = !this.isCollapsedCooling;
          this.setClassCool = true;
        }
      });
    }

    if (brew.enterFermentationData.length !== 0) {
      brew.enterFermentationData.map(element => {
        if (element.isCompleted === true) {
          this.isCollapsedFermentationPrevious = !this.isCollapsedFermentationPrevious;
          this.setClassPrevFerm = true;
        }
      });
    }
  }

 
  saveData(): Observable<boolean>{
    const getFermentationgDetailsAPI = String.Format(this.apiService.getFermentationDetails, this.tenantId,this.brewId);
    if (!this.fermentationAvailable) {
        this.apiService.postData(getFermentationgDetailsAPI, this.brewRunFermentation).subscribe(response => {
          this.fermentationAvailable = response['body']['fermentationAvailable'];
          return observableOf(true);
        }, error => {
        return throwError(error);
      });
    }
    else {
       this.apiService.putData(getFermentationgDetailsAPI, this.brewRunFermentation).subscribe(response => {
        this.fermentationAvailable =  response['body']['fermentationAvailable'];
        return observableOf(true);
        }, error => {
          return throwError(error);
      });
    }
    return observableOf(false);
  }
}