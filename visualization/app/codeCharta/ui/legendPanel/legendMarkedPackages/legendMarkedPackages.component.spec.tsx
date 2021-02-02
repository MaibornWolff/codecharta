import '../legendPanel.module'

import { getService, instantiateModule } from '../../../../../mocks/ng.mockhelper'
import { IScope, IControllerService, ICompileService, ITimeoutService } from 'angular'
import { LegendMarkedPackagesController } from './legendMarkedPackages.component'
import { CodeMapActionsService } from '../../codeMap/codeMap.actions.service'
import { MarkedPackagesService } from '../../../state/store/fileSettings/markedPackages/markedPackages.service'

describe('LegendMarkedPackagesController', () => {
	let createController: () => LegendMarkedPackagesController

	beforeEach(() => {
		instantiateModule('app.codeCharta.ui.legendPanel')

		const $rootScope = getService<IScope>('$rootScope')
		const $compile = getService<ICompileService>('$compile')
		const $controller = getService<IControllerService>('$controller')

		createController = () => {
			return $controller(LegendMarkedPackagesController, {
				$rootScope,
				$scope: $rootScope.$new(),
				$element: $compile('<cc-legend-marked-packages></cc-legend-marked-packages')($rootScope),
				$timeout: getService<ITimeoutService>('$timeout'),
				codeMapActionsService: getService<CodeMapActionsService>('codeMapActionsService')
			})
		}
	})

	afterEach(() => {
		jest.restoreAllMocks()
	})

	describe('constructor', () => {
		it('should subscribe to MarkedPackagesService', () => {
			const markedPackagesServiceSpy = jest.spyOn(MarkedPackagesService, 'subscribe')

			createController()

			expect(markedPackagesServiceSpy).toHaveBeenCalled()
		})
	})

	describe('onMarkedPackagesChanged', () => {
		it('should update its _viewModel.packageLists', () => {
			const controller = createController()

			controller.onMarkedPackagesChanged([{ color: '#ffffff', path: '/a/b' }])

			expect(controller['_viewModel'].packageLists).toEqual({ '#ffffff': ['/a/b'] })
		})

		it('should update its _colorPickerScopes', () => {
			const controller = createController()

			controller.onMarkedPackagesChanged([{ color: '#ffffff', path: '/a/b' }])

			expect(controller['_colorPickerScopes']).toEqual({ '/a/b': '#ffffff' })
		})

		it("should update brushes icon's color", () => {
			const controller = createController()
			const updateBrushesColorSpy = jest.spyOn<any, any>(controller, 'updateBrushesColor')

			controller.onMarkedPackagesChanged([])

			expect(updateBrushesColorSpy).toHaveBeenCalled()
		})
	})

	describe("color-picker's on change", () => {
		const oldColor = '#000000'
		const newColor = '#ffffff'
		const mockedApi = {
			getElement: () => ({
				scope: () => ({
					color: oldColor
				})
			})
		}

		it("should hook into coler-picker's event api", () => {
			const controller = createController()
			controller.$onInit()

			expect(typeof controller['$scope'].colorPickerEventApi.onChange).toBe('function')
		})

		it('should call updateViewModelPackageList', () => {
			const controller = createController()
			controller.$onInit()
			controller['_viewModel'].packageLists = {
				[newColor]: ['/a', '/b/c']
			}
			const updateViewModelPackageListSpy = jest
				.spyOn<any, any>(controller, 'updateViewModelPackageList')
				.mockImplementation(jest.fn())

			controller['$scope'].colorPickerEventApi.onChange(mockedApi, newColor)

			expect(updateViewModelPackageListSpy).toHaveBeenCalled()
			expect(updateViewModelPackageListSpy.mock.calls[0][0]).toBe(oldColor)
			expect(updateViewModelPackageListSpy.mock.calls[0][1]).toBe(newColor)
		})

		it('should mark the related folder', () => {
			const controller = createController()
			controller.$onInit()
			controller['_viewModel'].packageLists = {
				[newColor]: ['/a', '/b/c']
			}
			jest.spyOn<any, any>(controller, 'updateViewModelPackageList').mockImplementation(jest.fn())
			const markFolderSpy = jest.spyOn(controller['codeMapActionsService'], 'markFolder').mockImplementation(jest.fn())

			controller['$scope'].colorPickerEventApi.onChange(mockedApi, newColor)

			expect(markFolderSpy).toHaveBeenCalledTimes(2)

			expect(markFolderSpy.mock.calls[0][0]).toEqual({ path: '/a' })
			expect(markFolderSpy.mock.calls[0][1]).toBe(newColor)

			expect(markFolderSpy.mock.calls[1][0]).toEqual({ path: '/b/c' })
			expect(markFolderSpy.mock.calls[1][1]).toBe(newColor)
		})

		it('should not delete its _viewModel.packageLists entry, if old and new color are the same', () => {
			const controller = createController()
			controller.$onInit()
			controller['_viewModel'].packageLists = {
				[oldColor]: ['/a', '/b/c']
			}

			controller['$scope'].colorPickerEventApi.onChange(mockedApi, oldColor)

			expect(controller['_viewModel'].packageLists[oldColor]).toEqual(['/a', '/b/c'])
		})
	})
})
