<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Domain\Model;

final class Centaur extends Creature
{
    private int $XPValue = 0;

    public function __construct(CreatureId $id, private string $lair = 'cellar')
    {
        parent::__construct($id, CreatureType::MONSTROSITY);
        $this->setSpeed(SpeedType::WALKING, new Speed(50));
    }

    public function getLair(): string
    {
        return $this->lair;
    }

    public function getXPValue(): int
    {
        return $this->XPValue;
    }

    public function gainXP(int $XPValue): void
    {
        $this->XPValue += $XPValue;
    }
}
