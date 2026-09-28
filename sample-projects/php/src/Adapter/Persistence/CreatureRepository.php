<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Adapter\Persistence;

use De\Sots\CellarsAndCentaurs\Adapter\Persistence\CreatureEntity as Entity;

/**
 * @extends Repository<Entity>
 */
final class CreatureRepository extends Repository
{
    protected function idOf(object $item): string
    {
        return $item->getId();
    }

    public function findByType(string $type): ?Entity
    {
        foreach ($this->findAll() as $entity) {
            if ($entity->type === $type) {
                return $entity;
            }
        }

        return null;
    }
}
