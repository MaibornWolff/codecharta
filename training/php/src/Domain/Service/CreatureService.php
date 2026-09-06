<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Domain\Service;

use De\Sots\CellarsAndCentaurs\Domain\Model\Creature;
use De\Sots\CellarsAndCentaurs\Domain\Model\CreatureId;
use Psr\Log\LoggerInterface;

final class CreatureService
{
    public function __construct(private Creatures $creatures, private LoggerInterface $logger)
    {
    }

    public function save(Creature $creature): void
    {
        $this->logger->info('Saving creature ' . $creature->getId()->idAsString());
        $this->creatures->save($creature);
    }

    public function find(CreatureId $id): Creature
    {
        return $this->creatures->find($id);
    }
}
