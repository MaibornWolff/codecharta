<?php

namespace Game\Base;

class Animal
{
    public static function make(): static
    {
        return new static();
    }
}
