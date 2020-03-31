import { Component, OnInit } from '@angular/core';
import { SPINNER } from 'ngx-ui-loader';

@Component({
  selector: 'app-root',
  template: ` <ngx-ui-loader
                fgsColor="#FFA11B"
                [hasProgressBar]="false"
                fgsType="square-loader"
                overlayColor="rgba(236,231,231,0.2)">
              </ngx-ui-loader>
              <router-outlet></router-outlet>`,
})
export class AppComponent implements OnInit {
  constructor() { }

  ngOnInit() {
  }
}
