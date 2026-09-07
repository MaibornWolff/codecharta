<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Adapter\Persistence;

require_once '../../Application/bootstrap.php';

use De\Sots\CellarsAndCentaurs\Application\CreatureFacade;
use De\Sots\CellarsAndCentaurs\Domain\Model\Creature;
use De\Sots\CellarsAndCentaurs\Domain\Model\CreatureId;
use De\Sots\CellarsAndCentaurs\Domain\Model\CreatureType;
use De\Sots\CellarsAndCentaurs\Domain\Model\NoSuchCreatureException;
use De\Sots\CellarsAndCentaurs\Domain\Service\Creatures;

final class PersistedCreatures implements Creatures
{
    public function __construct(private CreatureRepository $repository)
    {
    }

    public function save(Creature $creature): void
    {
        $this->repository->save(new CreatureEntity($creature->getId()->idAsString(), $creature->getType()->value));
    }

    public function find(CreatureId $id): Creature
    {
        $creatureEntity = $this->repository->findOne($id->idAsString());
        if ($creatureEntity === null) {
            throw new NoSuchCreatureException($id);
        }

        $type = CreatureType::tryFrom($creatureEntity->type) ?? CreatureFacade::STANDARD_CREATURE_TYPE;

        return new Creature(new CreatureId($creatureEntity->getId()), $type);
    }
}
