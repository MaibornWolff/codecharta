package de.sots.cellarsandcentaurs.application;

import de.sots.cellarsandcentaurs.domain.model.ArmorClass;
import de.sots.cellarsandcentaurs.domain.model.Creature;
import de.sots.cellarsandcentaurs.domain.model.CreatureId;
import de.sots.cellarsandcentaurs.domain.model.CreatureType;
import de.sots.cellarsandcentaurs.domain.model.HitPoints;
import de.sots.cellarsandcentaurs.domain.model.Speed;
import de.sots.cellarsandcentaurs.domain.model.SpeedType;
import de.sots.cellarsandcentaurs.domain.service.CreatureService;

import java.util.Map;
import java.util.UUID;

public class CreatureFacade {
    public static final CreatureType STANDARD_CREATURE_TYPE = CreatureType.MONSTROSITY;

    private final CreatureService creatureService;

    public CreatureFacade(CreatureService creatureService) {
        this.creatureService = creatureService;
    }

    public void create(
            CreatureType type,
            Speed walkSpeed,
            Speed flySpeed,
            Speed swimSpeed,
            Speed burrowSpeed,
            Speed climbSpeed,
            ArmorClass armorClass,
            int hitPointsValue
    ) {
        var creature = new Creature(new CreatureId(UUID.randomUUID()));
        creature.setArmorClass(armorClass);
        creature.setHitPoints(HitPoints.init(hitPointsValue));
        creature.setType(type);
        creature.setSpeeds(
                Map.of(
                        SpeedType.WALKING, walkSpeed,
                        SpeedType.FLYING, flySpeed,
                        SpeedType.SWIMMING, swimSpeed,
                        SpeedType.BURROWING, burrowSpeed,
                        SpeedType.CLIMBING, climbSpeed
                )
        );
        creatureService.save(creature);
    }
}
