import { APP_INITIALIZER, Inject, InjectionToken, ModuleWithProviders, NgModule, Optional, SkipSelf } from "@angular/core"
import { Action } from "redux"
import { Subject } from "rxjs"

export type Actions = Subject<Action>
export const ActionsToken = new InjectionToken<Actions>("Actions")

@NgModule({})
export class EffectsModule {
	static actions$ = new Subject<Action>()

	constructor(@Optional() @SkipSelf() @Inject(EffectsModule) parentModule?: EffectsModule) {
		if (parentModule) throw new Error("EffectsModule is already loaded. Import it in the AppModule only")
	}

	static forRoot(effects = []): ModuleWithProviders<EffectsModule> {
		return {
			ngModule: EffectsModule,
			providers: [
				{ provide: ActionsToken, useValue: EffectsModule.actions$ },
				effects,
				{
					provide: APP_INITIALIZER,
					deps: [effects],
					useFactory: () => () => {
						// initialized effects"
					},
					multi: true
				}
			]
		}
	}
}
