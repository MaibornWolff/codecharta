<script lang="tsx">
import { defineComponent } from 'vue'
import type { Creature } from '../model/Creature'
import { EncounterResolver } from './EncounterResolver'
import SpeedBadge from '../../ui/SpeedBadge'

export default defineComponent({
  name: 'EncounterEdgeCasesTsx',
  props: { creatures: { type: Array as () => Creature[], required: true } },
  setup(props) {
    const resolver = new EncounterResolver()
    return () => (
      <div class="encounter-tsx">
        {/* JSX comment: the swimming fiend */}
        <h1>Swimming fiend</h1>
        {resolver.isEmpty() && <p>No encounter yet</p>}
        {props.creatures.length > 3 ? <p>Crowded dungeon</p> : <p>Quiet dungeon</p>}
        {props.creatures.map((creature) => (
          <SpeedBadge key={creature.getId().id} speed={30} />
        ))}
      </div>
    )
  }
})
</script>
