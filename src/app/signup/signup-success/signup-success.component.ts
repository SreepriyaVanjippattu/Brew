import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiProviderService } from '../../core/api-services/api-provider.service';
@Component({
  selector: 'signup-success',
  templateUrl: './signup-success.component.html',
  styleUrls: ['./signup-success.component.scss']
})
export class SignupSuccessComponent implements OnInit {

  constructor(private apiService: ApiProviderService, private router: Router) { }

  ngOnInit() {
  }



  login() {
    this.router.navigate(['app/login']);
  }
  signup() {
    this.router.navigate(['signup']);
  }
}
