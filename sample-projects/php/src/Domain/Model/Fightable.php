<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Domain\Model;

interface Fightable
{
    public function takeDamage(int $damage): void;

    public function rollInitiative(): int;
}
