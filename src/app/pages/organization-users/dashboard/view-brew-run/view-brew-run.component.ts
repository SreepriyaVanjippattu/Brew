import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';


import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { DataService } from '../../../../data.service';
import { StatusUse } from '../../../../models/status-id-name';
import { NbToastrService } from '@nebular/theme';
import { Observable } from 'rxjs';
import { permission } from '../../../../models/rolePermission';
import { String, StringBuilder } from 'typescript-string-operations';


@Component({
  selector: 'app-view-brew-run',
  templateUrl: './view-brew-run.component.html',
  styleUrls: ['./view-brew-run.component.scss'],
})
export class ViewBrewRunComponent implements OnInit {
  percent: number;
  generalContent;
  singleFerment;
  id;
  single: any[];
  multi: any[];
  brewContent;

  showXAxis = true;
  showYAxis = true;
  gradient = false;
  showLegend = true;
  showXAxisLabel = true;
  enterData: boolean;
  endBrewRunStatus: boolean;
  xAxisLabel = 'Country';
  showYAxisLabel = true;
  yAxisLabel = 'Population';
  tenantId;
  status = StatusUse;
  buttonDisable = false;
  permission = permission;
  archivePermission :any;

  colorScheme = {
    domain: ['#FFA500', '#0b20441a'],
  };
  autoScale = true;
  message: string;
  progressData: any;

  constructor(private router: Router,
    private apiService: ApiProviderService,
    private route: ActivatedRoute,
    private dataService: DataService,
    private toast: NbToastrService,

) {
  this.progress = this.emulateProgress();
     }

  readonly progress: Observable<number>;

  emulateProgress() {
    return new Observable<number>(observer => {
      let val = 0;
      const interval = setInterval(() => {
        if (val < 100) {
          val++;
        } else {
          val = 0;
        }

        observer.next(val);
      }, 100);

      return () => {
        clearInterval(interval);
      };
    });
  }

  ngOnInit() {
    this.dataService.currentMessage.subscribe(message => this.message = message);
    this.brewContent = this.message;
    const userDetails = JSON.parse(sessionStorage.getItem('user'));
    
    this.tenantId = userDetails["userDetails"]["tenantId"];
    this.id = this.route.snapshot.paramMap.get('id');
    this.viewBrewDetails();
    this.archivePermission = this.dataService.checkPermission(this.permission.Archive_Brew_Run.Id);
  }

  addNewData() {
    this.router.navigate(['app/dashboard/mash-in-form/' + this.id]);
  }

  addNewErrorMsg() {
    this.toast.warning('Unable to enter data, Brew not yet started');
  }

  viewBrewDetails() {
    this.brewContent = this.message;
    if (this.brewContent.statusId === '7cd88ffb-cf41-4efc-9a17-d75bcb5b3770') {
      // not started
      this.enterData = false;
      this.endBrewRunStatus = true;
    } else if (this.brewContent.statusId === '4267ae2f-4b7f-4a70-a592-878744a13900') {
      //Committed
      this.endBrewRunStatus = false;
      this.enterData = false;
    }else {
      this.enterData = true;
      this.endBrewRunStatus = true;
    }
    const totalPercent = ((this.brewContent.totalDays - this.brewContent.daysCompleted) / 100) * 100;

    this.progressData = JSON.parse(sessionStorage.getItem('progressData'));
       let single = [
        {
          'name': 'Days Compleated',
          'value': this.progressData.daysCompleted,
        },
        {
          'name': 'Days Left',
          'value': this.progressData.daysLeft,
        },
      ];
      Object.assign(this, { single });
  }

  archiveClick() {

    const changeBrewRunStatusAPI= String.Format(this.apiService.ChangeBrewRunStatus, this.tenantId,this.brewContent.id);
    const params = {
      statusId: 'fc7178dd-c5c1-4776-944a-b50fe2c37f06'
    };
    this.apiService.patchData(changeBrewRunStatusAPI, params).subscribe((response: any) => {
        if (response) {
          this.toast.success('Brew successfully archived');
          this.router.navigate(['app/dashboard/archives']);

        }
      }, error => {
        this.toast.danger('Something went wrong, Try Again');
    });
  }
  endBrewRun () {
    const params = {
      id: this.id,
      Status: this.status.Cancelled.id,
      tenantId: this.tenantId,
    };
    this.apiService.putData(this.apiService.ChangeBrewRunStatus, params).subscribe((response: any) => {
      if (response.status === 200) {
        this.toast.success('Brew successfully ended');
      }
    });
  }

  archiveToast(){
    this.toast.danger('You don\'t have access');
  }

  endBrewRunToast(){
    this.toast.warning('Unable to end brew, Brew already committed');
  }

}
