import { Directive, HostBinding } from '@angular/core';

@Directive({ selector: '[ccGlow]', standalone: true })
export class GlowDirective {
  @HostBinding('class.glowing') readonly glowing = true;
}
