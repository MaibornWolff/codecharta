<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Application;

use De\Sots\CellarsAndCentaurs\Domain\Model;
use De\Sots\CellarsAndCentaurs\Domain\Model\Fightable;

final class CreatureUtil
{
    public const STANDARD_ARMOR_CLASS_DESCRIPTION = 'Natural Armor';
    public const MAX_HIT_POINTS = Model\HitPoints::MAX_HIT_POINTS;

    /*
     * Counts the treasure hoard a creature guards.
     */
    public static function treasureHoardOf(Model\Creature $creature): int
    {
        $hitPoints = $creature->getHitPoints();

        return $hitPoints === null ? 0 : $hitPoints->getMax() * 10;
    }

    /** @param list<Model\Creature> $creatures */
    public static function totalHitPoints(array $creatures): int
    {
        $total = 0;
        foreach ($creatures as $creature) {
            $total += $creature->getHitPoints()?->getCurrent() ?? 0;
        }

        return min($total, self::MAX_HIT_POINTS);
    }
}
