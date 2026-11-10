from unittest.mock import patch

from conftest import empty_cart
from shop.cart import Cart


@patch("shop.price.Price")
def test_total(price):
    Cart().total(price)
    empty_cart()
