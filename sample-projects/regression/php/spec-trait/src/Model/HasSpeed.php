<?php

namespace Game\Model;

trait HasSpeed
{
    public function speed(): Speed
    {
        return new Speed();
    }
}
