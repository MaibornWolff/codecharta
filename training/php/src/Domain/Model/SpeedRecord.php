<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Domain\Model;

final class SpeedRecord
{
    /** @var Speed */
    private $fastest;

    public function __construct($fastest)
    {
        $this->fastest = $fastest;
    }

    public function getFastest()
    {
        return $this->fastest;
    }
}
