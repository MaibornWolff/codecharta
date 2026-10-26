<?php

namespace Game\App;

use Game\Model\{Factory, SpeedType, Centaur, Counter};

class Herd
{
    public function all(): array
    {
        return [Factory::make(), SpeedType::WALKING, Centaur::class, Counter::$count];
    }
}
