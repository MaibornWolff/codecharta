import { APP_INITIALIZER, InjectionToken, ModuleWithProviders, NgModule } from "@angular/core"
import { Action } from "redux"
import { Observable, Subject } from "rxjs"

export type Actions = Observable<Action>
export const ActionsToken = new InjectionToken<Actions>("Actions")

/** Simple placeholder for NgRx's EffectsModule. The goal is to provide the
 * same api as NgRx, so that we can switch to NgRx in the long run.
 */
@NgModule({})
export class EffectsModule {
	static actions$ = new Subject<Action>()

	static forRoot(effects = []): ModuleWithProviders<EffectsModule> {
		return {
			ngModule: EffectsModule,
			providers: [
				{ provide: ActionsToken, useValue: EffectsModule.actions$ },
				effects,
				{
					provide: APP_INITIALIZER,
					deps: effects,
					useFactory: () => () => {
						// initialized effects"
					},
					multi: true
				}
			]
		}
	}
}
