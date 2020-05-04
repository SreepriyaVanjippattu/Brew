import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { ApiProviderService } from '../../../../core/api-services/api-provider.service';
import { NbToastrService } from '@nebular/theme';
import { UtilitiesService } from '../../../../core/utils/utilities.service';

@Component({
  selector: 'subscription-plan',
  templateUrl: './subscription-plan.component.html',
  styleUrls: ['./subscription-plan.component.scss']
})
export class SubscriptionPlanComponent implements OnInit {
  public subscriptionPlan;
  id: any;
  clientDetail: any;
  clientName: string;
  subId: any;
  subName: any;
  constructor(private apiService: ApiProviderService,
              private router: Router,
              private route: ActivatedRoute,
              private toast: NbToastrService,
              private dataTransfer: UtilitiesService,
              ) {}

  ngOnInit() {
    this.id = this.route.snapshot.url[1].path;
    this.getSubscriptionDetails();
    this.getClientDetails();
  }

  getSubscriptionDetails() {
    this.apiService.getData(this.apiService.getSubscriptions).subscribe(response => {
      if (response) {
        this.subscriptionPlan = response['body'];
      }
    });
  }

  getClientDetails() {
    if (!sessionStorage.clientList || sessionStorage.clientList === '') {
    this.apiService.getData(this.apiService.getAllActiveClients).subscribe(response => {
      if (response) {
        response['body'].forEach(element => {
          if (element.Id === this.id ) {
            this.clientDetail = element;
          }
        });
        this.clientName = this.clientDetail.Name;
        this.subId = this.clientDetail.Subscriptions[0].Id;
      }
    });
  } else {
    JSON.parse(sessionStorage.clientList).forEach(element => {
      if (element.Id === this.id ) {
        this.clientDetail = element;
      }
    });
    this.clientName = this.clientDetail.Name;
    this.subId = this.clientDetail.Subscriptions[0].Id;
  }
  }

  selectPlan(plan: string) {
    this.subId = plan;
  }

  packageClick() {
    this.subscriptionPlan.forEach(element => {
      if (element.Id === this.subId) {
        this.subName = element.Name;
      }
    });
    this.dataTransfer.saveData(this.subId, this.subName);
    // sessionStorage.setItem('SubscriptionId', this.subId);
    // sessionStorage.setItem('SubscriptionId', this.subId);
    this.router.navigate(['app/clients/edit/' + this.id]);
  }

}
