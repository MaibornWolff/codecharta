<?php

namespace App;

use Game\Dice;

class Fight
{
    public function hit(): int
    {
        return Dice\roll();
    }
}
