<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Application;

use De\Sots\CellarsAndCentaurs\Domain\Model\Centaur;
use De\Sots\CellarsAndCentaurs\Domain\Model\CreatureId;

final class CreatureFactory
{
    public function centaurFor(CreatureId $id): object
    {
        $className = Centaur::class;

        return new $className($id);
    }
}
