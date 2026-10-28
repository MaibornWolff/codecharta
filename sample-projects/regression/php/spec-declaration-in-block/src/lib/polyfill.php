<?php

namespace Lib;

if (!function_exists('Lib\\slug')) {
    function slug(string $text): string
    {
        return $text;
    }
}
