import React from "react";
import type { Creature } from "../../domain/model/Creature";
import { SpeedType } from "@model/SpeedType";

type CreatureCardProps = {
    creature: Creature;
};

export default function CreatureCard({ creature }: CreatureCardProps): React.JSX.Element {
    const walkingSpeed = creature.getSpeeds().get(SpeedType.WALKING);
    return (
        <article className="creature-card">
            <h2>{creature.getId().id}</h2>
            <p>Hit points: {creature.getHitPoints()?.current}</p>
            <p>Walking speed: {walkingSpeed?.getSpeed()}</p>
        </article>
    );
}
