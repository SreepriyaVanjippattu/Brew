import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, PRIMARY_OUTLET, RoutesRecognized } from '@angular/router';
import { filter } from 'rxjs/operators';
import { map, mergeMap } from 'rxjs/internal/operators';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html'
})
export class BreadcrumbComponent implements OnInit {
  displayBreadcrumbList;
  breadcrumbs;
  masterBreadcrumbList;
  route;
  initialUrl;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.getBreadCrumbList();
  }

  getBreadCrumbList() {
    this.router.events.subscribe((val) => {
      this.displayBreadcrumbList = [];
      if (location.pathname !== '') {
        this.route = location.pathname;
        this.masterBreadcrumbList = this.route.split('/');
        this.masterBreadcrumbList = this.masterBreadcrumbList.slice(1, this.masterBreadcrumbList.length);
        for (let i = 0; i < this.masterBreadcrumbList.length; i++) {
          if (i !== 0) {
            this.initialUrl = this.displayBreadcrumbList[i - 1];
          } else {
            this.initialUrl = '/';
          }
          if (this.masterBreadcrumbList[i] !== 'app' && this.masterBreadcrumbList[i] !== 'dashboard') {
            let breadCrumbObj = {
              name: this.masterBreadcrumbList[i],
              url: this.initialUrl + this.masterBreadcrumbList[i],
              id: i
            };
            this.displayBreadcrumbList.push(breadCrumbObj);
          }
        }
      } else {

      }

    });
  }
}