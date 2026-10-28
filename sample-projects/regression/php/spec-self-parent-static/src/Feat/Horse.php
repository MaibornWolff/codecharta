<?php

namespace Game\Feat;

class Horse extends \Game\Base\Animal
{
    public function same(): self
    {
        return new self();
    }

    public function base(): parent
    {
        return parent::make();
    }
}
