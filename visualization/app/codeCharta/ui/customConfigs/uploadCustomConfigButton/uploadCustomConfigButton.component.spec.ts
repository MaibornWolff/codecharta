import { render, screen } from "@testing-library/angular"
import { UploadCustomConfigButtonComponent } from "./uploadCustomConfigButton.component"

describe("uploadCustomConfigButtonComponent", () => {
    it("should render", async () => {
        await render(UploadCustomConfigButtonComponent)
        expect(screen.getByRole("button")).toBeTruthy()
    })
})
