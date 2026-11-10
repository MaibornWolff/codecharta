import { Price } from "./price"

export class Cart {
    total(price = new Price()) {
        return price.amount()
    }
}
