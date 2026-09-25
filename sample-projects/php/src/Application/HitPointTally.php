<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Application;

use De\Sots\CellarsAndCentaurs\Domain\Model\HitPoints;

final class HitPointTally
{
    public function currentOf(array $hitPointsList): array
    {
        return array_map(function (HitPoints $hitPoints): int {
            return $hitPoints->getCurrent();
        }, $hitPointsList);
    }
}
