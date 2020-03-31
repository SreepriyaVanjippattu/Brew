import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbMediaBreakpointsService, NbMenuService, NbSidebarService, NbThemeService } from '@nebular/theme';
import { Router } from '@angular/router';

import { map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { DataService } from '../../../data.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ApiProviderService } from '../../../core/api-services/api-provider.service';
import { createOfflineCompileUrlResolver } from '@angular/compiler';

@Component({
  selector: 'app-header',
  styleUrls: ['./header.component.scss'],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, OnDestroy {
  userProfile: any;
  profilePic: any;
  message: string;
  private destroy$: Subject<void> = new Subject<void>();
  userPictureOnly: boolean = false;
  user: any;
  headerActive;
  currentDate = new Date();
  currentTheme = 'default';


  constructor(private sidebarService: NbSidebarService,
    private menuService: NbMenuService,
    private themeService: NbThemeService,
    private breakpointService: NbMediaBreakpointsService,
    private router: Router,
    private data: DataService,
    private modalService: NgbModal,
    private apiService: ApiProviderService,
  ) {
  }

  ngOnInit() {
    var userDetails = JSON.parse(sessionStorage.getItem('user'));
    this.userProfile = userDetails["userDetails"]
    this.profilePic = this.userProfile.imageUrl;
    this.data.currentMessage.subscribe(message => this.message = message);
    const currentUrl = window.location.pathname;
    if (currentUrl.includes('/app/clients') || currentUrl.includes('/app/reports-admin') || currentUrl.includes('/app/user-directory-admin') || currentUrl.includes('/app/settings')
      || currentUrl.includes('/app/profile-wt-admin') || currentUrl.includes('/app/role-privileges')
      || currentUrl.includes('/app/reset-password')) {
      this.headerActive = true;
    }
    else {
      this.headerActive = false;
    }
    const { xl } = this.breakpointService.getBreakpointsMap();
    this.themeService.onMediaQueryChange()
      .pipe(
        map(([, currentBreakpoint]) => currentBreakpoint.width < xl),
        takeUntil(this.destroy$),
      )
      .subscribe((isLessThanXl: boolean) => this.userPictureOnly = isLessThanXl);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  navigateHome() {
    this.menuService.navigateHome();
    return false;
  }

  logoutClick() {
    if (!sessionStorage.user || sessionStorage.user === '') {
      sessionStorage.clear();
      localStorage.clear();
      this.router.navigate(['/login']);
    } else {
      this.logoutPostApi();
    }
  }

  logOutModalOpen(confirmModal) {
    this.modalService.open(confirmModal, { ariaLabelledBy: 'modal-basic-title' }).result.then((result) => {
    }, (reason) => {
    });
  }

  toggleSidebar(): boolean {
    this.sidebarService.toggle(true, 'menu-sidebar');
    return false;
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
        this.router.navigate(['/login']);
      }
    },
      error => {
        console.log(error.error.Message);
      });
  }
}
