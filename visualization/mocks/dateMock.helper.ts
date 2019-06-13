export const stubDate = fixedDate => {
	let _originalDate

	beforeAll(() => {
		_originalDate = Date

		global["Date"] = class extends Date {
			constructor() {
				super()

				return fixedDate
			}
		} as DateConstructor
	})

	afterAll(() => {
		global["Date"] = _originalDate
	})
}
