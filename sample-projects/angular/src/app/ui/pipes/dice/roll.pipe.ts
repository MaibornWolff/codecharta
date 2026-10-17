import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'roll', standalone: true })
export class RollPipe implements PipeTransform {
  transform(d20Roll: number): string {
    return `rolled a ${d20Roll}`;
  }
}
