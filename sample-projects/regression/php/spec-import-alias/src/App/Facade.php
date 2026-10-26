<?php

namespace Game\App;

use Game\Dto\Creature as CreatureDto;
use Game\Model\Creature;

class Facade
{
    public CreatureDto $view;

    public function save(Creature $creature): void
    {
    }
}
