import type { FunctionalComponent } from 'vue'
import { Speed } from '../domain/model/Speed'

/* A functional component in a plain .tsx file. */
export const SpeedBadge: FunctionalComponent<{ speed: number }> = (props) => {
  const flyingSpeed = new Speed(props.speed)
  if (flyingSpeed.getSpeed() > 60) {
    return <strong class="speed-badge">Flying dragon</strong>
  }
  return <span class="speed-badge">{flyingSpeed.getSpeed()} feet</span>
}

export default SpeedBadge
