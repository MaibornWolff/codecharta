<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Application;

use De\Sots\CellarsAndCentaurs\Application\Annotation\Transactional;
use De\Sots\CellarsAndCentaurs\Application\Dto\Creature as CreatureDto;
use De\Sots\CellarsAndCentaurs\Domain\Model\{ArmorClass, Creature, CreatureId, CreatureType, HitPoints, SpeedType};
use De\Sots\CellarsAndCentaurs\Domain\Service\CreatureService;
use Ramsey\Uuid\Uuid;
use function De\Sots\CellarsAndCentaurs\Domain\Model\rollD20;

final class CreatureFacade
{
    public const STANDARD_CREATURE_TYPE = CreatureType::MONSTROSITY;
    private const STABLE_NAME = 'centaur-stable';

    public function __construct(private CreatureService $creatureService)
    {
    }

    #[Transactional]
    public function create(
        CreatureType $type,
        \De\Sots\CellarsAndCentaurs\Domain\Model\Speed $walkingSpeed,
        \De\Sots\CellarsAndCentaurs\Domain\Model\Speed $flyingSpeed,
        \De\Sots\CellarsAndCentaurs\Domain\Model\Speed $swimmingSpeed,
        \De\Sots\CellarsAndCentaurs\Domain\Model\Speed $burrowingSpeed,
        \De\Sots\CellarsAndCentaurs\Domain\Model\Speed $climbingSpeed,
        ArmorClass $armorClass,
        int $hitPointsValue
    ): CreatureDto {
        $creature = new Creature(new CreatureId(Uuid::uuid4()->toString()));
        $creature->setArmorClass($armorClass);
        $creature->setHitPoints(HitPoints::init($hitPointsValue));
        $creature->setType($type);
        $creature->setSpeeds([
            SpeedType::WALKING->value => $walkingSpeed,
            SpeedType::FLYING->value => $flyingSpeed,
            SpeedType::SWIMMING->value => $swimmingSpeed,
            SpeedType::BURROWING->value => $burrowingSpeed,
            SpeedType::CLIMBING->value => $climbingSpeed,
        ]);

        // Rolls initiative for every creature in the dungeon before the encounter starts.
        $initiative = rollD20()->getTotal();
        $this->creatureService->save($creature);

        return $this->toDto($creature, $initiative);
    }

    public function stableName(): string
    {
        return self::STABLE_NAME;
    }

    private function toDto(Creature $creature, int $initiative): CreatureDto
    {
        return new CreatureDto(
            $creature->getId()->idAsString(),
            $creature->getType()->value,
            $creature->getHitPoints()?->getCurrent() ?? $initiative,
            $creature->getArmorClass()?->getTotal() ?? 0
        );
    }
}
