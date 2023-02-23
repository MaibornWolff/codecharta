import { render, screen } from "@testing-library/angular"
import userEvent from "@testing-library/user-event"
import { ArtificialIntelligenceModule } from "../artificialIntelligence.module"
import { HighRiskProfileComponent } from "./highRiskProfile.component"

describe("HighRiskProfileComponent", () => {
	it("should render profile with an analyzed programming properties", async () => {
		await render(HighRiskProfileComponent, {
			excludeComponentDeclaration: true,
			imports: [ArtificialIntelligenceModule],
			componentProperties: {
				data: {
					analyzedProgrammingLanguage: "ts",
					riskProfile: {
						lowRisk: 0,
						moderateRisk: 80,
						highRisk: 16,
						veryHighRisk: 4
					}
				}
			}
		})

		await userEvent.click(screen.getByTitle("Open High Risk Profile"))

		expect(screen.queryByText("Could not calculate Risk Profile. Metrics rloc and mcc not available.")).toBe(null)

		expect(screen.getByText("0% of overall code is in files with low complexity")).toBeTruthy()
		expect(screen.getByText("80% of overall code is in files with moderate complexity")).toBeTruthy()
		expect(screen.getByText("16% of overall code is in files with high complexity")).toBeTruthy()
		expect(screen.getByText("4% of overall code is in files with extreme complexity")).toBeTruthy()

		const lowRiskBar = screen.queryByTitle("Low Risk 0% of code")
		expect(lowRiskBar).toBe(null)
		const moderateRiskBar = screen.getByTitle("Moderate Risk (80% of code)")
		expect(moderateRiskBar.style.width).toBe("80%")
		expect(moderateRiskBar.style.color).toBe("black")
		const highRiskBar = screen.getByTitle("High Risk (16% of code)")
		expect(highRiskBar.style.width).toBe("16%")
		expect(highRiskBar.style.color).toBe("black")
		const veryHighRiskBar = screen.getByTitle("Very High Risk (4% of code)")
		expect(veryHighRiskBar.style.width).toBe("4%")
		expect(veryHighRiskBar.style.color).toBe("rgba(0, 0, 0, 0)")
	})

	it("should explain that there couldn't be analyzed a risk profile", async () => {
		await render(HighRiskProfileComponent, {
			excludeComponentDeclaration: true,
			imports: [ArtificialIntelligenceModule],
			componentProperties: {
				data: {
					analyzedProgrammingLanguage: "",
					riskProfile: undefined
				}
			}
		})

		await userEvent.click(screen.getByTitle("Open High Risk Profile"))

		expect(
			screen.getByText(
				"Could not calculate Risk Profile. Metrics rloc(Real lines of code) and mcc(Cyclomatic complexity) not available."
			)
		).toBeTruthy()
	})

	it("should explain that there couldn't be analyzed a risk profile even when analyzedProgrammingLanguage is undefined", async () => {
		await render(HighRiskProfileComponent, {
			excludeComponentDeclaration: true,
			imports: [ArtificialIntelligenceModule],
			componentProperties: {
				data: {
					analyzedProgrammingLanguage: undefined,
					riskProfile: undefined
				}
			}
		})

		await userEvent.click(screen.getByTitle("Open High Risk Profile"))

		expect(
			screen.getByText(
				"Could not calculate Risk Profile. Metrics rloc(Real lines of code) and mcc(Cyclomatic complexity) not available."
			)
		).toBeTruthy()
	})
})
