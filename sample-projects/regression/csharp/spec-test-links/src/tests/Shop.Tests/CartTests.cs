using Moq;
using Shop;

namespace Shop.Tests;

public class CartTests
{
    public void Totals()
    {
        var price = new Mock<Price>();
        new Cart().Total(price.Object);
        TestData.Cart();
    }
}
