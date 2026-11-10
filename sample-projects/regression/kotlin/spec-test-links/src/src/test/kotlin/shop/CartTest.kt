package shop

import io.mockk.mockk

class CartTest {
    fun totals() {
        val price = mockk<Price>()
        Cart().total(price)
        TestData.cart()
    }
}
