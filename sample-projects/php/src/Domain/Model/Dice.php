<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Domain\Model;

final class Dice
{
    public function __construct(private int $sides)
    {
    }

    public function roll(): DiceRoll
    {
        return new DiceRoll($this->sides, random_int(1, $this->sides));
    }
}

final class DiceRoll
{
    public function __construct(private int $sides, private int $total)
    {
    }

    public function getSides(): int
    {
        return $this->sides;
    }

    public function getTotal(): int
    {
        return $this->total;
    }
}

function rollD20(): DiceRoll
{
    $d20Roll = (new Dice(20))->roll();

    return $d20Roll;
}
