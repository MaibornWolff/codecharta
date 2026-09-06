<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Domain\Service;

use De\Sots\CellarsAndCentaurs\Domain\Model\Centaur;

final class CentaurSpotter
{
    public function isCentaur(object $candidate): bool
    {
        return $candidate instanceof Centaur;
    }
}
