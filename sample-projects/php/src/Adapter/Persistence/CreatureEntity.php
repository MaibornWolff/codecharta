<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Adapter\Persistence;

final class CreatureEntity
{
    public string $id;

    public function __construct(?string $id = null, public string $type = 'monstrosity')
    {
        $this->id = $id ?? 'ididid';
    }

    public function getId(): string
    {
        return $this->id;
    }
}
