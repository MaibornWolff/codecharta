<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Application\Dto;

final class Creature
{
    public function __construct(
        public readonly string $id,
        public readonly string $type,
        public readonly int $hitPoints,
        public readonly int $armorClass
    ) {
    }
}
