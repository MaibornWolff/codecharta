<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Domain\Model;

enum SpeedType: string
{
    case WALKING = 'walking';
    case FLYING = 'flying';
    case SWIMMING = 'swimming';
    case BURROWING = 'burrowing';
    case CLIMBING = 'climbing';
}
