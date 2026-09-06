<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Domain\Model;

final class CreatureId
{
    public function __construct(public readonly string $id)
    {
    }

    public function idAsString(): string
    {
        return $this->id;
    }
}
