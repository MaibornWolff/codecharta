import { Cart } from "./cart"
import { Price } from "./__mocks__/price"

jest.mock("./price")

test("should total", () => {
    new Cart().total(new Price())
})
