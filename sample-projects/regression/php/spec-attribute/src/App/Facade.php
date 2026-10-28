<?php

namespace Game\App;

use Game\Ann\Transactional;

#[\Game\Ann\Cached]
class Facade
{
    #[Transactional]
    public function save(): void
    {
    }
}
