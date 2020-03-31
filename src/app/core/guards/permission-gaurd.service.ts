import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionGaurdService implements CanActivate {
  userProfile: string;

  constructor(private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {

    const expectedPermissions = route.data.expectedPermissions;
    const userPermissions = JSON.parse(localStorage.getItem("permissions"));
    let hasPermission = userPermissions.some(v => expectedPermissions.indexOf(v) !== -1);
    if (!this.authService.isAuthenticated() || !hasPermission) {
      localStorage.clear();
      sessionStorage.clear();
      this.router.navigate(['login']);
      return false;
    }
    return true;
  }

  canActivateChild(route: ActivatedRouteSnapshot): boolean {
    const expectedRole = route.data.expectedPermission;
    console.log('role hereee', expectedRole);

    return true;
  }

}
