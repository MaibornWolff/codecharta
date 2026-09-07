<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Application;

use De\Sots\CellarsAndCentaurs\Domain\Model\Creature;
use De\Sots\CellarsAndCentaurs\Domain\Model\CreatureId;
use De\Sots\CellarsAndCentaurs\Domain\Model\NoSuchCreatureException;
use De\Sots\CellarsAndCentaurs\Domain\Service\CreatureService;

final class CreatureLookup
{
    private CreatureService $creatureService;

    public function __construct(CreatureService $creatureService)
    {
        $this->creatureService = $creatureService;
    }

    public function findOrNull(CreatureId $id): ?Creature
    {
        try {
            return $this->creatureService->find($id);
        } catch (NoSuchCreatureException $e) {
            return null;
        }
    }
}
