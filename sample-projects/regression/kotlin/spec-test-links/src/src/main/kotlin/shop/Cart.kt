package shop

class Cart {
    fun total(price: Price): Int = price.amount()
}
