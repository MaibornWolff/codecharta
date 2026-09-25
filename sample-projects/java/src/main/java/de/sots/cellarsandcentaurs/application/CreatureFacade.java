package de.sots.cellarsandcentaurs.application;

import de.sots.cellarsandcentaurs.domain.model.ArmorClass;
import de.sots.cellarsandcentaurs.domain.model.Centaur;
import de.sots.cellarsandcentaurs.domain.model.Creature;
import de.sots.cellarsandcentaurs.domain.model.CreatureId;
import de.sots.cellarsandcentaurs.domain.model.CreatureType;
import de.sots.cellarsandcentaurs.domain.model.HitPoints;
import de.sots.cellarsandcentaurs.domain.model.SpeedType;
import de.sots.cellarsandcentaurs.domain.service.CreatureService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Map;

import static de.sots.cellarsandcentaurs.domain.model.Dice.rollD20;

public class CreatureFacade {
    public static final CreatureType STANDARD_CREATURE_TYPE = CreatureType.MONSTROSITY;
    private static final String CENTAUR_STABLE = "centaur-stable";
    private static final Logger LOGGER = LoggerFactory.getLogger(CreatureFacade.class);

    private final CreatureService creatureService;

    public CreatureFacade(CreatureService creatureService) {
        this.creatureService = creatureService;
    }

    public Creature create(
            CreatureType type,
            de.sots.cellarsandcentaurs.domain.model.Speed walkingSpeed,
            de.sots.cellarsandcentaurs.domain.model.Speed flyingSpeed,
            de.sots.cellarsandcentaurs.domain.model.Speed swimmingSpeed,
            de.sots.cellarsandcentaurs.domain.model.Speed burrowingSpeed,
            de.sots.cellarsandcentaurs.domain.model.Speed climbingSpeed,
            ArmorClass armorClass,
            int hitPointsValue
    ) {
        // Rolls initiative for every creature in the dungeon before the encounter starts.
        var d20Roll = rollD20();
        LOGGER.debug("Initiative roll {} for stable {}", d20Roll, CENTAUR_STABLE);
        var creature = new Creature(CreatureId.random());
        creature.setArmorClass(armorClass);
        creature.setHitPoints(HitPoints.init(hitPointsValue));
        creature.setType(type);
        creature.setSpeeds(
                Map.of(
                        SpeedType.WALKING, walkingSpeed,
                        SpeedType.FLYING, flyingSpeed,
                        SpeedType.SWIMMING, swimmingSpeed,
                        SpeedType.BURROWING, burrowingSpeed,
                        SpeedType.CLIMBING, climbingSpeed
                )
        );
        creatureService.save(creature);
        return creature;
    }

    public Creature createCentaur() {
        var centaur = new Centaur(CreatureId.random());
        creatureService.save(centaur);
        return centaur;
    }

    public de.sots.cellarsandcentaurs.application.dto.Creature toDto(Creature creature) {
        return new de.sots.cellarsandcentaurs.application.dto.Creature(
                creature.getId().id().toString(),
                creature.getType().name(),
                creature.getHitPoints().getCurrent()
        );
    }

    public static final class Builder {
        private CreatureService creatureService;

        public Builder creatureService(CreatureService creatureService) {
            this.creatureService = creatureService;
            return this;
        }

        public CreatureFacade build() {
            return new CreatureFacade(creatureService);
        }
    }
}
