<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Domain\Service;

use De\Sots\CellarsAndCentaurs\Domain\Model\Creature;
use De\Sots\CellarsAndCentaurs\Domain\Model\CreatureId;
use De\Sots\CellarsAndCentaurs\Domain\Model\NoSuchCreatureException;

interface Creatures
{
    public function save(Creature $creature): void;

    /**
     * @throws NoSuchCreatureException when no creature with the id lives in the dungeon
     */
    public function find(CreatureId $id): Creature;
}
