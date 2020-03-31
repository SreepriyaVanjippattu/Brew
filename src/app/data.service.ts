import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class DataService {


  private messageSource = new BehaviorSubject('default message');
  currentMessage = this.messageSource.asObservable();
  userProfile: string;
  permissionStatus: boolean;

  constructor() {
    this.permissionStatus = false;
  }

  changeMessage(message: string) {
    this.messageSource.next(message);
  }
  passData(message: string) {
    this.messageSource.next(message);
  }

  checkPermission(expectedPermission): boolean {
    const userPermissions = JSON.parse(localStorage.getItem("permissions"));
    const value = userPermissions.find(element => element === expectedPermission);
    if (value) {
      return true;
    } else {
      return false;
    }
  }
}
