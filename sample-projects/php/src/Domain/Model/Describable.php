<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Domain\Model;

interface Describable
{
    public function describe(): string;
}
