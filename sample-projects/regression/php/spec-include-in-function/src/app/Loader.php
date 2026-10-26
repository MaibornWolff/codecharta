<?php

namespace App;

class Loader
{
    public function load(): void
    {
        require __DIR__ . '/../plugins/plugin.php';
    }
}
