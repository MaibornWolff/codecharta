import { OnChanges } from "@angular/core"
import { ComponentFixture } from "@angular/core/testing"

/** Updates an Angular component and calls change detection with a call to ngOnChanges.
 * Note that @testing-library/angular's `rerender` destroys and re-creates the component
 * since version 11. Therefore it doesn't correctly simulate on changes behavior, which
 * depends on previous value.
 */
export function updateProperties<T extends object>(fixture: ComponentFixture<T>, properties: Record<string, unknown>) {
	const component = fixture.componentInstance
	const changes = {}
	for (const [key, value] of Object.entries(properties)) {
		changes[key] = {
			previousValue: component[key],
			currentValue: value
		}
		component[key] = value
	}

	if (implementsOnChanges(component)) {
		component.ngOnChanges(changes)
	}

	fixture.detectChanges(false)
}

function implementsOnChanges(component: object): component is OnChanges {
	return "ngOnChanges" in component
}
