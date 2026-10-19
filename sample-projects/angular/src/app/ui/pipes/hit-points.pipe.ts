import { Pipe, PipeTransform } from '@angular/core';
import { HitPoints } from '../../domain/model/hit-points';

@Pipe({ name: 'hitPoints', standalone: true })
export class HitPointsPipe implements PipeTransform {
  transform(hitPoints: HitPoints): string {
    return `${hitPoints.current} / ${hitPoints.maximum} hit points`;
  }
}
