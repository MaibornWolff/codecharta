const localStorageMock = {
	getItem: jest.fn().mockReturnValue("[]"),
	setItem: jest.fn(),
	clear: jest.fn()
}
global.localStorage = localStorageMock
