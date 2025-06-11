import { describe, it, expect } from 'vitest'
import { toRoman, fromRoman, formatNumber } from './romanNumerals.js'

describe('Roman Numeral Conversion', () => {
  describe('toRoman', () => {
    it('converts basic numbers correctly', () => {
      expect(toRoman(1)).toBe('I')
      expect(toRoman(5)).toBe('V')
      expect(toRoman(10)).toBe('X')
      expect(toRoman(50)).toBe('L')
      expect(toRoman(100)).toBe('C')
      expect(toRoman(500)).toBe('D')
      expect(toRoman(1000)).toBe('M')
    })

    it('converts subtractive notation correctly', () => {
      expect(toRoman(4)).toBe('IV')
      expect(toRoman(9)).toBe('IX')
      expect(toRoman(40)).toBe('XL')
      expect(toRoman(90)).toBe('XC')
      expect(toRoman(400)).toBe('CD')
      expect(toRoman(900)).toBe('CM')
    })

    it('converts the specified test cases', () => {
      expect(toRoman(745)).toBe('DCCXLV')
      expect(toRoman(846)).toBe('DCCCXLVI')
    })

    it('converts complex numbers', () => {
      expect(toRoman(1994)).toBe('MCMXCIV')
      expect(toRoman(2023)).toBe('MMXXIII')
      expect(toRoman(3999)).toBe('MMMCMXCIX')
    })

    it('converts large numbers with vinculum notation', () => {
      expect(toRoman(5000)).toBe('V̄')
      expect(toRoman(10000)).toBe('X̄')
      expect(toRoman(50000)).toBe('L̄')
      expect(toRoman(100000)).toBe('C̄')
      expect(toRoman(123456)).toBe('C̄X̄X̄MMMCDLVI')
    })

    it('handles edge cases', () => {
      expect(toRoman(0)).toBe('')
      expect(() => toRoman(400000)).toThrow('Numerus nimis magnus')
    })
  })

  describe('fromRoman', () => {
    it('converts basic Roman numerals correctly', () => {
      expect(fromRoman('I')).toBe(1)
      expect(fromRoman('V')).toBe(5)
      expect(fromRoman('X')).toBe(10)
      expect(fromRoman('L')).toBe(50)
      expect(fromRoman('C')).toBe(100)
      expect(fromRoman('D')).toBe(500)
      expect(fromRoman('M')).toBe(1000)
    })

    it('handles subtractive notation', () => {
      expect(fromRoman('IV')).toBe(4)
      expect(fromRoman('IX')).toBe(9)
      expect(fromRoman('XL')).toBe(40)
      expect(fromRoman('XC')).toBe(90)
    })

    it('handles empty input', () => {
      expect(fromRoman('')).toBe(0)
      expect(fromRoman(null)).toBe(0)
    })
  })

  describe('formatNumber', () => {
    it('formats numbers for display', () => {
      expect(formatNumber(745)).toBe('DCCXLV')
      expect(formatNumber(846)).toBe('DCCCXLVI')
      expect(formatNumber(0)).toBe('')
    })

    it('handles invalid input', () => {
      expect(formatNumber(null)).toBe('')
      expect(formatNumber(undefined)).toBe('')
      expect(formatNumber(NaN)).toBe('')
    })

    it('handles negative numbers by showing the sign', () => {
      expect(formatNumber(-745)).toBe('-DCCXLV')
    })
  })

  describe('Round-trip conversion', () => {
    it('converts numbers to Roman and back correctly', () => {
      const testNumbers = [1, 4, 5, 9, 10, 40, 50, 90, 100, 400, 500, 900, 1000, 1994, 2023]
      
      testNumbers.forEach(num => {
        const roman = toRoman(num)
        const backToNumber = fromRoman(roman)
        expect(backToNumber).toBe(num)
      })
    })
  })
}) 