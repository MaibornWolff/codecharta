from shop.price import Price


class Cart:
    def total(self, price: Price) -> int:
        return price.amount()
