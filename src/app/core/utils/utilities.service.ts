import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilitiesService {

  constructor() { }

  public emailRegEx = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

  isNumberKey(event) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode !== 40 && charCode !== 41 && charCode !== 43 && charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }
  key;
  value;
  saveData(key, value) {
    if (key && value) {
      this.key = key;
      this.value = value;
    } else {
      this.key = '';
      this.value = '';

    }
  }
}
