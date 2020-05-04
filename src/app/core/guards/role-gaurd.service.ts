import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class RoleGaurdService implements CanActivate {
  userProfile: string;

  constructor( private authService: AuthService, private router: Router) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // this will be passed from the route config
    // on the data property
  
    // const token = localStorage.getItem('token');
    // // decode the token to get its payload
    // const tokenPayload = (token);
    const expectedRole  = route.data.expectedRole;
   


    this.userProfile = sessionStorage.getItem('user');
    const user = JSON.parse(sessionStorage.getItem('user'));
    const roleName = user['userDetails']['position'];
    var checkRole = expectedRole.includes(roleName)

    // console.log(checkRole);
    if (!this.authService.isAuthenticated() || !checkRole) {
      localStorage.clear();
      sessionStorage.clear();
      this.router.navigate(['login']);

      return false;
    }
    return true;
  }

  canActivateChild(route: ActivatedRouteSnapshot): boolean {
    const expectedRole  = route.data.expectedPermission;
    console.log('role hereee',expectedRole);
    
    return true;
  }

}
