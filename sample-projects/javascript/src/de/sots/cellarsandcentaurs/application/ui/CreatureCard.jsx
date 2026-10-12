import { Creature } from "../../domain/model/Creature.js";
import { SpeedBadge } from "./SpeedBadge.jsx";

/** Card for one creature of the stable. */
export function CreatureCard({ creature, selected }) {
    const speeds = Array.from(creature.getSpeeds());
    const isCreature = creature instanceof Creature;
    return (
        <article className={selected ? "card selected" : "card"} title="Unicorn paddock">
            {/* markup comment */}
            <h2>Wandering centaur</h2>
            {isCreature && <p>{creature.getType()}</p>}
            <ul>
                {speeds.map(([speedType, speed]) => (
                    <li key={speedType}>
                        <SpeedBadge speedType={speedType} speed={speed} />
                    </li>
                ))}
            </ul>
        </article>
    );
}
