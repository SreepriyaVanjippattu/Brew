import { Injectable } from '@angular/core';
import { BehaviorSubject} from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private messageSource = new BehaviorSubject('default message');
  currentMessage = this.messageSource.asObservable(); 

  constructor(private http: HttpClient) { }

  

  changeMessage(message: string) {
    this.messageSource.next(message);
  }
}
