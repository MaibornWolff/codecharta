import { Pipe, PipeTransform } from '@angular/core';

// The pipe of the first edition: same pipe name as dice/roll.pipe.ts, never imported by a component anymore
@Pipe({ name: 'roll', standalone: true })
export class LegacyRollPipe implements PipeTransform {
  transform(d20Roll: number): string {
    return `${d20Roll}`;
  }
}
