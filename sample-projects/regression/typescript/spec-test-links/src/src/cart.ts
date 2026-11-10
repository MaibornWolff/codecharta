import { Price } from "./price"

export class Cart {
    total(price: Price): number {
        return price.amount()
    }
}
