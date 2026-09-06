<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Domain\Model;

trait HasSpeeds
{
    /** @var array<string, Speed> */
    private array $speeds = [];

    /** @param array<string, Speed> $speeds */
    public function setSpeeds(array $speeds): void
    {
        $this->speeds = [];
        foreach ($speeds as $speedKey => $speed) {
            $this->setSpeed(SpeedType::from($speedKey), $speed);
        }
    }

    public function setSpeed(SpeedType $speedType, Speed $speed): void
    {
        $this->speeds[$speedType->value] = $speed;
    }

    /** @return array<string, Speed> */
    public function getSpeeds(): array
    {
        return $this->speeds;
    }
}
