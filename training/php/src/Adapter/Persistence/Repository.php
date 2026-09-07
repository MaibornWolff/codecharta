<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Adapter\Persistence;

use Countable;

/**
 * @template T of object
 */
abstract class Repository implements Countable
{
    /** @var array<string, T> */
    private array $items = [];

    /** @param T $item */
    public function save(object $item): void
    {
        $this->items[$this->idOf($item)] = $item;
    }

    /** @return T|null */
    public function findOne(string $id): ?object
    {
        return $this->items[$id] ?? null;
    }

    /** @return list<T> */
    public function findAll(): array
    {
        return array_values($this->items);
    }

    public function count(): int
    {
        return count($this->items);
    }

    /** @param T $item */
    abstract protected function idOf(object $item): string;
}
