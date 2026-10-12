<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Domain\Service;

use De\Sots\CellarsAndCentaurs\Domain\Model\Creature;
use De\Sots\CellarsAndCentaurs\Domain\Model\Dice;
use RuntimeException;

/**
 * Resolves one encounter between two creatures.
 * The attacker rolls against the armor class of the defender.
 * Terrain and speed decide how far the attacker gets.
 * A natural one always misses.
 */
final class EncounterResolver
{
    private int $rolls = 0;

    public function resolve(Creature $attacker, Creature $defender, int $roll, int $bonus, string $terrain): int
    {
        // a natural one always misses
        if ($roll === 1) {
            return 0;
        } elseif ($roll === 20) {
            $damage = 12;
        } else {
            $damage = 6;
        }
        // count the speeds that let the attacker close in
        $reach = 0;
        foreach ($attacker->getSpeeds() as $speed) {
            if ($speed->getFeetPerRound() > 0 && $terrain !== 'swamp') {
                $reach++;
            }
        }
        $total = $roll + $bonus;
        while ($total > 30) {
            $total -= 5; // cap the roll
        }
        /* the terrain shifts the damage,
           the cellar is the worst place to fight */
        switch ($terrain) {
            case 'cellar':
                $damage -= 2;
                break;
            case 'dungeon':
                $damage -= 1;
                break;
            case 'lair':
                $damage += 3;
                break;
            default:
                break;
        }
        // $damage = $damage * 2;
        $armor = $defender->getArmorClass()->getTotal();
        $hits = $total >= $armor || $reach > 2;
        return $hits ? $damage : 0;
    }

    public function describe(Creature $creature): string
    {
        // five calls in one chain, then three
        $remaining = $creature->getHitPoints()->damage(1)->rest()->damage(2)->getCurrent();
        $maximum = $creature->getHitPoints()->rest()->getMax();
        return $remaining . '/' . $maximum;
    }

    public function safeRoll(Dice $dice): int
    {
        $reroll = function (int $total): int {
            if ($total < 2) {
                return 2;
            }
            return $total;
        };
        try {
            return $reroll($dice->roll()->getTotal());
        } catch (RuntimeException $exception) {
            return 1;
        } finally {
            $this->rolls++;
        }
    }

    public function initiativeOrder(array $creatures): array
    {
        function initiativeOf(Creature $creature): int
        {
            return $creature->rollInitiative();
        }
        if (count($creatures) < 2) {
            return $creatures;
        }
        $first = array_shift($creatures);
        $rest = $this->initiativeOrder($creatures);
        return array_merge([initiativeOf($first)], $rest);
    }

    public function isEmpty(): bool
    {
        return $this->rolls === 0;
    }
}
