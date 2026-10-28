<?php

namespace Game\Model;

class Creature
{
    public ?Creature $mate = null;
    public ?\Game\Model\Creature $rival = null;
}
