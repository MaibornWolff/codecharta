<?php

namespace App\Mine;

use App\Other;

class Node
{
    public function other(): int
    {
        return Other\node();
    }
}
