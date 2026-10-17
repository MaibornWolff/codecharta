import { SpeedType } from './speed-type';

export class Speed {
  constructor(
    readonly type: SpeedType,
    readonly feet: number,
  ) {}
}
