import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Speed } from '../domain/model/speed';

@Component({
  selector: 'cc-speed-badge, cc-speed-tag',
  standalone: true,
  imports: [NgIf, NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault],
  templateUrl: './speed-badge.component.html',
})
export class SpeedBadgeComponent {
  @Input() speeds: Speed[] = [];
  @Output() dash = new EventEmitter<void>();
  exhausted = false;

  bySpeedType(index: number, speed: Speed): string {
    return speed.type;
  }
}
