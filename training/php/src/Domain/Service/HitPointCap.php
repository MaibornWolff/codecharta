<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Domain\Service;

use const De\Sots\CellarsAndCentaurs\Domain\Model\MAX_HIT_POINTS;

final class HitPointCap
{
    public function cap(int $hitPointsValue): int
    {
        return min($hitPointsValue, MAX_HIT_POINTS);
    }
}
