<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Domain\Model;

final class Speed
{
    public function __construct(private int $feetPerRound)
    {
    }

    public function getFeetPerRound(): int
    {
        return $this->feetPerRound;
    }

    public function setFeetPerRound(int $feetPerRound): void
    {
        $this->feetPerRound = $feetPerRound;
    }
}
