import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SignUpService {
  getValue: any;
  signUpContent(value) {
    this.getValue = value;
    console.log("The content value on here is ===>",this.getValue);
  }
}

