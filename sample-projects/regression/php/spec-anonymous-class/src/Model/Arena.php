<?php

namespace Game\Model;

class Arena
{
    public function spawn(): object
    {
        return new class extends Base implements Fightable {};
    }
}
