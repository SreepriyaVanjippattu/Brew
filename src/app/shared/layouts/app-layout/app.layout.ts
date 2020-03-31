import { Component, OnInit } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';

@Component({
  selector: 'app-layout',
  styleUrls: ['./app.layout.scss'],
  template: `
    <nb-layout windowMode>
      <nb-layout-header [class.generalUser]="isGeneralUser" fixed>
        <app-header></app-header>
      </nb-layout-header>

      <nb-sidebar
      [class.superAdminIcon]="superAdminIcon"
      [class.generalUserIcon]="generalUserIcon"
      class="menu-sidebar" tag="menu-sidebar"
       responsive start>
      <a (click)="toggleSidebar()" href="#" class="sidebar-toggle d-flex justify-content-end">
        <img src="assets/images/toggle.svg">
      </a>
        <ng-content select="nb-menu"></ng-content>
      </nb-sidebar>

      <nb-layout-column>
        <ng-content select="router-outlet"></ng-content>
      </nb-layout-column>

      <nb-layout-footer fixed>
        <app-footer></app-footer>
      </nb-layout-footer>
    </nb-layout>
  `,
})
export class AppLayoutComponent implements OnInit {
  isGeneralUser: Boolean = false;
  generalUserIcon: Boolean;
  toggle: Boolean;
  superAdminIcon: Boolean;
  constructor(
    private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private themeService: NbThemeService,
    private breakpointService: NbMediaBreakpointsService,
  ) { }
  ngOnInit() {
    const currentUrl = window.location.pathname;
    if (currentUrl.includes('dashboard') || currentUrl === '/app/reports' || currentUrl.includes('app/reports/view')
      || currentUrl.includes('recipes')
      || currentUrl === '/app/user-directory' || currentUrl.includes('user-directory/')
      || currentUrl.includes('user-directory/org-previleges')
      || currentUrl.includes('preferences') || currentUrl.includes('profile-organization')) {
      this.isGeneralUser = true;
      this.generalUserIcon = true;
      this.superAdminIcon = false;
    } else {
      this.isGeneralUser = false;
      this.generalUserIcon = false;
      this.superAdminIcon = true;
    }
  }
  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    return false;
  }
}
