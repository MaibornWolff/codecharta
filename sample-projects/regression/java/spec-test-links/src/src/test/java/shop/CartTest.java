package shop;

import static org.mockito.Mockito.mock;

class CartTest {
    void totals() {
        Price price = mock(Price.class);
        new Cart().total(price);
        TestData.cart();
    }
}
