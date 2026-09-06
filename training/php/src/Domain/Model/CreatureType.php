<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Domain\Model;

enum CreatureType: string
{
    case MONSTROSITY = 'monstrosity';
    case BEAST = 'beast';
    case ABERRATION = 'aberration';
    case CELESTIAL = 'celestial';
    case DRAGON = 'dragon';
    case FIEND = 'fiend';
    case HUMANOID = 'humanoid';
    case UNDEAD = 'undead';
}
