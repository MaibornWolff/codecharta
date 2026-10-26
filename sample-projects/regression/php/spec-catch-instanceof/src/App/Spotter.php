<?php

namespace Game\App;

use Game\Model\{NotFound, Centaur};

class Spotter
{
    public function spot(object $candidate): bool
    {
        try {
            return $candidate instanceof Centaur;
        } catch (NotFound | \RuntimeException $failure) {
            return false;
        }
    }
}
