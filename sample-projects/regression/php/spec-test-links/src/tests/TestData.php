<?php

namespace Shop\Tests;

use Shop\Cart;

class TestData
{
    public static function cart(): Cart
    {
        return new Cart();
    }
}
