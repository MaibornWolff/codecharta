import { Pipe, PipeTransform } from '@angular/core';
import { ArmorClass } from '../../domain/model/armor-class';

@Pipe({ name: 'armorClass', standalone: true })
export class ArmorClassPipe implements PipeTransform {
  transform(armorClass: ArmorClass): string {
    return `AC ${armorClass.value}`;
  }
}
