
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ModalComponent } from './modal.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@NgModule({
    imports: [CommonModule, ReactiveFormsModule, FormsModule],
    declarations: [ModalComponent],
    exports: [ModalComponent]
})
export class ModalModule { }