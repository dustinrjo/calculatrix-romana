import { describe, it, expect } from 'vitest'
import { parseExpression, isValidExpression, getOperatorSymbol } from './expressionParser.js'

describe('Expression Parser', () => {
  describe('parseExpression', () => {
    it('evaluates basic addition expressions', () => {
      const result = parseExpression('745 + 846')
      expect(result).toBe(1591)
    })

    it('evaluates subtraction expressions', () => {
      const result = parseExpression('1000 - 255')
      expect(result).toBe(745)
    })

    it('evaluates multiplication expressions', () => {
      const result = parseExpression('50 * 2')
      expect(result).toBe(100)
    })

    it('evaluates division expressions', () => {
      const result = parseExpression('100 / 4')
      expect(result).toBe(25)
    })

    it('evaluates exponentiation expressions', () => {
      const result = parseExpression('2 ^ 3')
      expect(result).toBe(8)
    })

    it('handles expressions without spaces', () => {
      const result = parseExpression('745+846')
      expect(result).toBe(1591)
    })

    it('handles expressions with extra spaces', () => {
      const result = parseExpression('  745   +   846  ')
      expect(result).toBe(1591)
    })

    it('evaluates complex expressions with operator precedence', () => {
      expect(parseExpression('14+2*3-5/2')).toBeCloseTo(17.5) // 14 + 6 - 2.5
      expect(parseExpression('10*2+5')).toBe(25) // 20 + 5
      expect(parseExpression('100/4*2')).toBe(50) // 25 * 2
      expect(parseExpression('2^3*4')).toBe(32) // 8 * 4
      expect(parseExpression('10+2^3')).toBe(18) // 10 + 8
    })

    it('handles negative numbers correctly', () => {
      const result = parseExpression('-100 + 50')
      expect(result).toBe(-50)
    })

    it('returns null for invalid expressions', () => {
      expect(parseExpression('745 +')).toBeNull()
      expect(parseExpression('+ 846')).toBeNull()
      expect(parseExpression('745 + + 846')).toBeNull()
      expect(parseExpression('')).toBeNull()
      expect(parseExpression('invalid')).toBeNull()
    })

    it('handles single numbers', () => {
      expect(parseExpression('745')).toBe(745)
      expect(parseExpression('-50')).toBe(-50)
    })

    it('handles division by zero', () => {
      expect(parseExpression('100 / 0')).toBeNull()
    })
  })

  describe('isValidExpression', () => {
    it('validates correct expressions', () => {
      expect(isValidExpression('745 + 846')).toBe(true)
      expect(isValidExpression('1000 - 255')).toBe(true)
      expect(isValidExpression('50 * 2')).toBe(true)
      expect(isValidExpression('100 / 4')).toBe(true)
      expect(isValidExpression('2 ^ 3')).toBe(true)
      expect(isValidExpression('14+2*3-5/2')).toBe(true)
      expect(isValidExpression('-100 + 50')).toBe(true)
    })

    it('validates single numbers', () => {
      expect(isValidExpression('745')).toBe(true)
      expect(isValidExpression('-50')).toBe(true)
      expect(isValidExpression('123.45')).toBe(true)
    })

    it('rejects invalid expressions', () => {
      expect(isValidExpression('745 +')).toBe(false)
      expect(isValidExpression('+ 846')).toBe(false)
      expect(isValidExpression('745 + + 846')).toBe(false)
      expect(isValidExpression('')).toBe(false)
      expect(isValidExpression('invalid')).toBe(false)
      expect(isValidExpression('100 / 0')).toBe(false) // Division by zero
    })
  })

  describe('getOperatorSymbol', () => {
    it('returns correct display symbols', () => {
      expect(getOperatorSymbol('+')).toBe('+')
      expect(getOperatorSymbol('-')).toBe('−')
      expect(getOperatorSymbol('*')).toBe('×')
      expect(getOperatorSymbol('/')).toBe('÷')
      expect(getOperatorSymbol('^')).toBe('^')
    })
  })

  describe('Real calculation examples', () => {
    it('handles common mathematical expressions', () => {
      expect(parseExpression('22 / 7')).toBeCloseTo(3.142857, 5) // π approximation
      expect(parseExpression('3 * 3 + 4 * 4')).toBe(25) // Pythagorean theorem
      expect(parseExpression('100 - 25 * 2')).toBe(50) // 100 - 50
      expect(parseExpression('5 + 3 * 2 - 1')).toBe(10) // 5 + 6 - 1
    })

    it('handles expressions that result in fractions', () => {
      expect(parseExpression('7 / 2')).toBe(3.5)
      expect(parseExpression('10 / 3')).toBeCloseTo(3.333333, 5)
      expect(parseExpression('1 / 4')).toBe(0.25)
    })
  })
}) 