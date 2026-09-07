<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Domain\Model;

use De\Sots\CellarsAndCentaurs\Application\CreatureUtil;

final class ArmorClass
{
    private int $total;

    public function __construct(
        private int $base,
        private int $bonus,
        private string $description = CreatureUtil::STANDARD_ARMOR_CLASS_DESCRIPTION
    ) {
        $this->total = $base + $bonus;
    }

    public function getBase(): int
    {
        return $this->base;
    }

    public function setBase(int $base): void
    {
        $this->base = $base;
        $this->updateTotal();
    }

    public function getBonus(): int
    {
        return $this->bonus;
    }

    public function getTotal(): int
    {
        return $this->total;
    }

    public function getDescription(): string
    {
        return $this->description;
    }

    private function updateTotal(): void
    {
        $this->total = $this->base + $this->bonus;
    }
}
