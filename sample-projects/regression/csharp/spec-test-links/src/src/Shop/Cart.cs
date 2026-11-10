namespace Shop;

public class Cart
{
    public int Total(Price price) => price.Amount();
}
