<?php

namespace Shop\Tests;

use PHPUnit\Framework\TestCase;
use Shop\Cart;
use Shop\Price;

class CartTest extends TestCase
{
    public function testTotal(): void
    {
        $price = $this->createMock(Price::class);
        (new Cart())->total($price);
        TestData::cart();
    }
}
