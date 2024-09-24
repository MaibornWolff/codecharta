import { ValidatorFn, AbstractControl, ValidationErrors } from "@angular/forms"
import { ScenarioHelper } from "../../scenarioHelper"

export function customScenarioNameValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        if (control.value.length === 0) {
            return { Error: "Scenario name is required" }
        }
        if (ScenarioHelper.isScenarioExisting(control.value)) {
            return { Error: "A Scenario with this name already exists" }
        }
        return null
    }
}
