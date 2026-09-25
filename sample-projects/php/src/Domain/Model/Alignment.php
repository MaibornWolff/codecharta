<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Domain\Model;

enum Alignment: string implements Describable
{
    case LAWFUL = 'lawful';
    case NEUTRAL = 'neutral';
    case CHAOTIC = 'chaotic';

    public function describe(): string
    {
        return 'A ' . $this->value . ' creature of the cellar';
    }
}
