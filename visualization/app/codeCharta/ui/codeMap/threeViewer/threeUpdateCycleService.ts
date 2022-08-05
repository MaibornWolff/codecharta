interface UpdateFunction {
	(): void
}

// Todo do we need this as render is the only user?
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
