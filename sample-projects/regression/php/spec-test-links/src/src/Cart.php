<?php

namespace Shop;

class Cart
{
    public function total(Price $price): int
    {
        return $price->amount();
    }
}
