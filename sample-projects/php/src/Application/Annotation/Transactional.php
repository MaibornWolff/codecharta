<?php

declare(strict_types=1);

namespace De\Sots\CellarsAndCentaurs\Application\Annotation;

use Attribute;

#[Attribute(Attribute::TARGET_METHOD)]
final class Transactional
{
    public function __construct(public readonly bool $readOnly = false)
    {
    }
}
