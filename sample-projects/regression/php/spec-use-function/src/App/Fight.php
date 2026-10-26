<?php

namespace App;

use function Game\Dice\roll;

class Fight
{
    public function hit(): int
    {
        return roll();
    }
}
