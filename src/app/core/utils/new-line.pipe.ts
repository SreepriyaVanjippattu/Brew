import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'newLine',
})
export class NewLinePipe implements PipeTransform {
    transform(text: string): string {
        return text.replace(/\\n/g, '<li><i class="material-icons tic-ico">done</i>');
    }
}
