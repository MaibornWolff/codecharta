<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Domain\Model;

use RuntimeException;

final class NoSuchCreatureException extends RuntimeException
{
    public function __construct(CreatureId $id)
    {
        parent::__construct('No such creature in the dungeon: ' . $id->idAsString());
    }
}
