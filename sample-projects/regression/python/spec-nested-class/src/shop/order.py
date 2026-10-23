from shop.product import Product


class Order:
    class Line:
        def __init__(self, product: Product):
            self.product = product

    def total(self):
        return 0
