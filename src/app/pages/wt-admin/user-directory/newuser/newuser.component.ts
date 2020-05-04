import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NbToastrService } from '@nebular/theme';

@Component({
  selector: 'newuser',
  templateUrl: './newuser.component.html',
  styleUrls: ['./newuser.component.scss']
})
export class NewuserComponent implements OnInit {
  private index: number = 0;

  constructor(
    private router: Router,
    private toastrService: NbToastrService
  ) { }

  ngOnInit() {
  }

 

  saveSuperAdmin(position, status) {
    this.index += 1;
    this.toastrService.show(
      status || 'Success',
      `Toast ${this.index}`,
      { position, status });
    this.router.navigate(['app/user-directory-admin']);
  }
}
