<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Domain\Model;

use De\Sots\CellarsAndCentaurs\Application\CreatureFacade;

/**
 * A creature that roams the cellar. Centaurs, beasts and dragons all share hit points, armor class and speeds.
 */
class Creature implements Fightable
{
    use HasSpeeds;

    private ?ArmorClass $armorClass = null;
    private ?HitPoints $hitPoints = null;

    public function __construct(
        private CreatureId $id,
        private CreatureType $type = CreatureFacade::STANDARD_CREATURE_TYPE
    ) {
    }

    public function getId(): CreatureId
    {
        return $this->id;
    }

    public function getType(): CreatureType
    {
        return $this->type;
    }

    public function setType(CreatureType $type): void
    {
        $this->type = $type;
    }

    public function getArmorClass(): ?ArmorClass
    {
        return $this->armorClass;
    }

    public function setArmorClass(ArmorClass $armorClass): void
    {
        $this->armorClass = $armorClass;
    }

    public function getHitPoints(): ?HitPoints
    {
        return $this->hitPoints;
    }

    public function setHitPoints(HitPoints $hitPoints): void
    {
        $this->hitPoints = $hitPoints;
    }

    public function takeDamage(int $damage): void
    {
        $this->hitPoints = $this->hitPoints?->damage($damage);
    }

    public function rollInitiative(): int
    {
        return rollD20()->getTotal();
    }
}
