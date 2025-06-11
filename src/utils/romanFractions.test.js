import { describe, it, expect } from 'vitest'
import { toRomanFraction, getFractionName, roundToTwelfths, hasFraction } from './romanFractions.js'

describe('Roman Fractions (Uncia System)', () => {
  describe('toRomanFraction', () => {
    it('converts whole numbers correctly', () => {
      expect(toRomanFraction(1)).toBe('I')
      expect(toRomanFraction(5)).toBe('V')
      expect(toRomanFraction(10)).toBe('X')
    })

    it('converts basic fractions to dot notation', () => {
      expect(toRomanFraction(1/12)).toBe('·') // uncia
      expect(toRomanFraction(2/12)).toBe(':') // sextans
      expect(toRomanFraction(3/12)).toBe('∴') // quadrans
      expect(toRomanFraction(4/12)).toBe('∷') // triens
      expect(toRomanFraction(5/12)).toBe('⁙') // quincunx
      expect(toRomanFraction(6/12)).toBe('S') // semis
    })

    it('converts complex fractions using semis + dots', () => {
      expect(toRomanFraction(7/12)).toBe('S·') // septunx (6/12 + 1/12)
      expect(toRomanFraction(8/12)).toBe('S:') // bes (6/12 + 2/12)
      expect(toRomanFraction(9/12)).toBe('S∴') // dodrans (6/12 + 3/12)
      expect(toRomanFraction(10/12)).toBe('S∷') // dextans (6/12 + 4/12)
      expect(toRomanFraction(11/12)).toBe('S⁙') // deunx (6/12 + 5/12)
    })

    it('converts mixed numbers (whole + fraction)', () => {
      expect(toRomanFraction(1 + 1/12)).toBe('I·') // 1 and 1/12
      expect(toRomanFraction(1 + 6/12)).toBe('IS') // 1 and 1/2
      expect(toRomanFraction(5 + 3/12)).toBe('V∴') // 5 and 1/4
      expect(toRomanFraction(10 + 8/12)).toBe('XS:') // 10 and 2/3
    })

    it('rounds to nearest 12th', () => {
      expect(toRomanFraction(1.041)).toBe('I') // rounds to 1
      expect(toRomanFraction(1.042)).toBe('I·') // rounds to 1 + 1/12
      expect(toRomanFraction(1.125)).toBe('I:') // exactly 1 + 1/8 → 1 + 2/12 
      expect(toRomanFraction(1.167)).toBe('I:') // rounds to 1 + 2/12
    })

    it('handles negative numbers', () => {
      expect(toRomanFraction(-1/12)).toBe('-·')
      expect(toRomanFraction(-1.5)).toBe('-IS')
      expect(toRomanFraction(-5)).toBe('-V')
    })

    it('handles zero and empty cases', () => {
      expect(toRomanFraction(0)).toBe('')
      expect(toRomanFraction(0.041)).toBe('') // rounds to 0
    })
  })

  describe('getFractionName', () => {
    it('returns correct Latin fraction names', () => {
      expect(getFractionName(1/12)).toBe('uncia')
      expect(getFractionName(2/12)).toBe('sextans')
      expect(getFractionName(3/12)).toBe('quadrans')
      expect(getFractionName(4/12)).toBe('triens')
      expect(getFractionName(5/12)).toBe('quincunx')
      expect(getFractionName(6/12)).toBe('semis')
      expect(getFractionName(7/12)).toBe('septunx')
      expect(getFractionName(8/12)).toBe('bes')
      expect(getFractionName(9/12)).toBe('dodrans')
      expect(getFractionName(10/12)).toBe('dextans')
      expect(getFractionName(11/12)).toBe('deunx')
    })

    it('handles mixed numbers correctly', () => {
      expect(getFractionName(1.25)).toBe('quadrans') // fractional part is 3/12
      expect(getFractionName(5.5)).toBe('semis') // fractional part is 6/12
    })
  })

  describe('roundToTwelfths', () => {
    it('rounds decimals to nearest 12th', () => {
      expect(roundToTwelfths(0.08)).toBeCloseTo(1/12) // rounds to 1/12
      expect(roundToTwelfths(0.125)).toBeCloseTo(2/12) // 1/8 → 2/12 (closer to 2/12 than 1/12)
      expect(roundToTwelfths(0.25)).toBeCloseTo(3/12) // 1/4 → 3/12
      expect(roundToTwelfths(0.33)).toBeCloseTo(4/12) // 1/3 → 4/12
      expect(roundToTwelfths(0.5)).toBeCloseTo(6/12) // 1/2 → 6/12
      expect(roundToTwelfths(0.67)).toBeCloseTo(8/12) // 2/3 → 8/12
      expect(roundToTwelfths(0.75)).toBeCloseTo(9/12) // 3/4 → 9/12
    })

    it('handles whole numbers', () => {
      expect(roundToTwelfths(1)).toBe(1)
      expect(roundToTwelfths(5)).toBe(5)
      expect(roundToTwelfths(10.25)).toBeCloseTo(10 + 3/12)
    })
  })

  describe('hasFraction', () => {
    it('detects fractional parts', () => {
      expect(hasFraction(1.5)).toBe(true)
      expect(hasFraction(2.25)).toBe(true)
      expect(hasFraction(5 + 1/12)).toBe(true)
    })

    it('detects whole numbers', () => {
      expect(hasFraction(1)).toBe(false)
      expect(hasFraction(5)).toBe(false)
      expect(hasFraction(10)).toBe(false)
    })

    it('handles numbers that round to whole', () => {
      expect(hasFraction(1.04)).toBe(false) // rounds to 1
      expect(hasFraction(1.96)).toBe(false) // rounds to 2
    })
  })

  describe('Real calculation examples', () => {
    it('handles division results', () => {
      expect(toRomanFraction(10 / 3)).toBe('III∷') // 3.333... → 3 4/12
      expect(toRomanFraction(7 / 2)).toBe('IIIS') // 3.5 → 3 6/12
      expect(toRomanFraction(22 / 7)).toBe('III:') // 3.142... → 3 2/12
    })

    it('handles common fractions', () => {
      expect(toRomanFraction(1.5)).toBe('IS') // 1 1/2
      expect(toRomanFraction(2.25)).toBe('II∴') // 2 1/4
      expect(toRomanFraction(3.75)).toBe('IIIS∴') // 3 3/4 → 3 9/12 (semis + 3/12)
    })
  })
}) 