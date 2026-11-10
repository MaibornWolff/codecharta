#include "../src/cart.h"

class MockPrice : public Price {
public:
    int amount() const override { return 0; }
};

void totals() {
    MockPrice price;
    Cart cart;
    cart.total(price);
}
