import { MarkedPackagesActions } from "../../store/fileSettings/markedPackages/markedPackages.actions"
import { actionsRequiringRerender } from "./actionsRequiringRerender"

describe("actionsRequiringRerender", () => {
	it("should include marked packages actions", () => {
		expect(actionsRequiringRerender).toContain(MarkedPackagesActions)
	})
})
