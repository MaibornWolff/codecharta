import { getReadableColorForBackground, hasValidHexLength, isSameHexColor, normalizeHex } from './colorHelper'

describe('colorHelper', () => {
	describe('normalizeHex', () => {
		it('should transform a 3 digit hex into a 6 digit hex', () => {
			expect(normalizeHex('#f01')).toBe('#ff0011')
		})

		it('should return identity for a 6 digit hex', () => {
			expect(normalizeHex('#ff0011')).toBe('#ff0011')
		})
	})

	describe('isSameHexColor', () => {
		it('should recognize 3 digit and 6 digit hex as equal if they represent the same color', () => {
			expect(isSameHexColor('#f01', '#ff0011')).toBe(true)
		})

		it('should recognize 3 digit and 6 digit hex as different if they represent different colors', () => {
			expect(isSameHexColor('#f01', '#000f01')).toBe(false)
		})
	})

	describe('hasValidHexLength', () => {
		it('should verify 3 digit hex as valid', () => {
			expect(hasValidHexLength('#ff0')).toBe(true)
		})

		it('should verify 6 digit hex as valid', () => {
			expect(hasValidHexLength('#ff0123')).toBe(true)
		})

		it('should verify 4 digit hex as invalid', () => {
			expect(hasValidHexLength('#ff01')).toBe(false)
		})
	})

	describe('getReadableColorForBackground', () => {
		it("should decide 'black' for orange", () => {
			expect(getReadableColorForBackground('#ffa500')).toBe('black')
		})

		it("should decide 'white' for red", () => {
			expect(getReadableColorForBackground('ff0000')).toBe('white')
		})
	})
})
