import { Component } from '@angular/core';

import { MENU_ITEMS_SUPER_USER, MENU_ITEMS_ORGANIZATION } from './pages-menu';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { Router } from '@angular/router';
import { ApiProviderService } from '../core/api-services/api-provider.service';
import { NbIconLibraries } from '@nebular/theme';
import {RoleName} from '../models/roleName';

@Component({
  selector: 'app-pages',
  styleUrls: ['pages.component.scss'],
  template: `
    <app-layout>
      <nb-menu [items]="menu"></nb-menu>
      <router-outlet></router-outlet>
    </app-layout>
  `,
})
export class PagesComponent {
  userProfile: any;
  menu;
  idleState = 'Not started.';
  timedOut = false;
  roleName = RoleName;

  constructor(private idle: Idle,
    private route: Router,
    private apiService: ApiProviderService,
    private iconLibraries: NbIconLibraries) {

    this.userProfile = sessionStorage.getItem('user');
    let user = JSON.parse(sessionStorage.getItem('user'));
    this.iconLibraries.registerFontPack('nebular', { iconClassPrefix: 'nb' });
    this.iconLibraries.setDefaultPack('nebular');
    
    this.userProfile = user['userDetails']['position'];
    if (this.userProfile === this.roleName.Superadmin) {
      this.menu = MENU_ITEMS_SUPER_USER;
    } else if (this.userProfile === this.roleName.Brewer || this.userProfile === this.roleName.OrgSuperUser || this.userProfile === this.roleName.OrgAdminUser || this.userProfile === this.roleName.OrgDashboardUser || this.userProfile === this.roleName.DemoUser) {
      this.menu = MENU_ITEMS_ORGANIZATION;
    }
    
    idle.setIdle(1200);
    idle.setTimeout(5);
    idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    idle.onIdleEnd.subscribe(() => this.idleState = 'No longer idle.');
    idle.onTimeout.subscribe(() => {
      this.idleState = 'Timed out!';
      this.timedOut = true;
      this.logout();
    });
    
    idle.onIdleStart.subscribe(() => this.idleState = 'You\'ve gone idle!');
    idle.onTimeoutWarning.subscribe((countdown) => {
      this.idleState = 'You will time out in ' + countdown + ' seconds!',
        console.log(this.idleState);
    });

    this.reset();
  }
  reset() {
    this.idle.watch();
    this.idleState = 'Started.';
    this.timedOut = false;
  }

  logout() {
    console.log(this.idleState);
    this.logoutPostApi();
  }

  logoutPostApi() {
    const email = JSON.parse(sessionStorage.user).UserProfile.EmailAddress;
    const params = {
      email: email,
    };
    this.apiService.postData(this.apiService.logoutApi, params).subscribe((response: any) => {
      if (response) {
        sessionStorage.clear();
        localStorage.clear();
        this.route.navigate(['/login']);
      }
    },
      error => {
        console.log(error.error.message);
      });
  }

}
