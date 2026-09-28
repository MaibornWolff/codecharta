<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Domain\Model;

const MAX_HIT_POINTS = 999;

/**
 * Hit points drop when the creature takes damage and recover when it rests in its lair.
 */
final class HitPoints
{
    public const MAX_HIT_POINTS = 999;

    public function __construct(private int $current, private int $max, private int $temporary = 0)
    {
    }

    public static function init(int $max): self
    {
        return new self($max, min($max, self::MAX_HIT_POINTS), 0);
    }

    public function getCurrent(): int
    {
        return $this->current;
    }

    public function getMax(): int
    {
        return $this->max;
    }

    public function getTemporary(): int
    {
        return $this->temporary;
    }

    public function damage(int $amount): self
    {
        return new self(max(0, $this->current - $amount), $this->max, $this->temporary);
    }

    public function rest(): self
    {
        return new self($this->max, $this->max, 0);
    }
}
