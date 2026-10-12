import React from "react";
import type { Creature } from "../../domain/model/Creature";
import { SpeedType } from "@model/SpeedType";
import { SpeedBadge } from "./SpeedBadge";

type CreatureCardProps = {
    creature: Creature;
    wandering?: boolean;
};

export default function CreatureCard({ creature, wandering }: CreatureCardProps): React.JSX.Element {
    const walkingSpeed = creature.getSpeeds().get(SpeedType.WALKING);
    const speeds = [...creature.getSpeeds().values()];
    return (
        <article className="creature-card">
            {/* The heading shows the creature id. */}
            <h2>{creature.getId().id}</h2>
            {wandering && <p>Wandering centaur</p>}
            <p>Hit points: {creature.getHitPoints() ? creature.getHitPoints()?.current : "unknown"}</p>
            <p>Walking speed: {walkingSpeed?.getSpeed()}</p>
            <ul>
                {speeds.map((speed) => (
                    <li key={speed.getSpeed()}>
                        <SpeedBadge speed={speed} />
                    </li>
                ))}
            </ul>
        </article>
    );
}
