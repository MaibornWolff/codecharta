<?php

namespace Game\App;

use Game\Model\{A, B, C, D, E, F, G, H};

class Svc
{
    public ?H $h = null;

    public function __construct(private G $g)
    {
    }

    public function take(?A $a, B|C $bc, D&E $de, F ...$fs): void
    {
    }
}
