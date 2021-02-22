interface UpdateFunction {
	(): void
}

export class ThreeUpdateCycleService {
	private updatables: UpdateFunction[] = []

	register(onUpdate: UpdateFunction) {
		this.updatables.push(onUpdate)
	}

	update() {
		for (const updatable of this.updatables) {
			updatable()
		}
	}
}
