<?php

namespace Game\Dice;

class Fight
{
    public function hit(): int
    {
        return roll();
    }
}
