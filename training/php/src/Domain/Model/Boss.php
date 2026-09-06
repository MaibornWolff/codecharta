<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Domain\Model;

interface Boss extends Fightable, Describable
{
    public function treasureHoard(): int;
}
