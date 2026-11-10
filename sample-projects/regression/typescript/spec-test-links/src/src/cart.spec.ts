import { Cart } from "./cart"
import { cartWithNothing } from "./cart.mocks"
import { Price } from "./price"

jest.mock("./price")

describe("Cart", () => {
    it("should total", () => {
        const cart: Cart = cartWithNothing()
        cart.total(new Price())
    })
})
