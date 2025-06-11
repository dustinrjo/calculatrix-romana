import { describe, it, expect } from 'vitest'
import { parseExpression, evaluateExpression, calculateFromExpression, isValidExpression } from './expressionParser.js'

describe('Expression Parser', () => {
  describe('parseExpression', () => {
    it('parses basic addition expressions', () => {
      const result = parseExpression('745 + 846')
      expect(result).toEqual({
        operand1: 745,
        operator: '+',
        operand2: 846,
        expression: '745 + 846'
      })
    })

    it('parses subtraction expressions', () => {
      const result = parseExpression('1000 - 255')
      expect(result).toEqual({
        operand1: 1000,
        operator: '-',
        operand2: 255,
        expression: '1000 - 255'
      })
    })

    it('parses multiplication expressions', () => {
      const result = parseExpression('50 * 2')
      expect(result).toEqual({
        operand1: 50,
        operator: '*',
        operand2: 2,
        expression: '50 * 2'
      })
    })

    it('parses division expressions', () => {
      const result = parseExpression('100 / 4')
      expect(result).toEqual({
        operand1: 100,
        operator: '/',
        operand2: 4,
        expression: '100 / 4'
      })
    })

    it('handles expressions without spaces', () => {
      const result = parseExpression('745+846')
      expect(result).toEqual({
        operand1: 745,
        operator: '+',
        operand2: 846,
        expression: '745+846'
      })
    })

    it('handles expressions with extra spaces', () => {
      const result = parseExpression('  745   +   846  ')
      expect(result).toEqual({
        operand1: 745,
        operator: '+',
        operand2: 846,
        expression: '745 + 846'
      })
    })

    it('returns null for invalid expressions', () => {
      expect(parseExpression('745')).toBeNull()
      expect(parseExpression('745 +')).toBeNull()
      expect(parseExpression('+ 846')).toBeNull()
      expect(parseExpression('abc + 123')).toBeNull()
      expect(parseExpression('')).toBeNull()
      expect(parseExpression(null)).toBeNull()
    })

    it('handles negative numbers correctly', () => {
      const result = parseExpression('-100 + 50')
      expect(result).toEqual({
        operand1: -100,
        operator: '+',
        operand2: 50,
        expression: '-100 + 50'
      })
    })
  })

  describe('evaluateExpression', () => {
    it('evaluates addition correctly', () => {
      const expr = { operand1: 745, operator: '+', operand2: 846 }
      expect(evaluateExpression(expr)).toBe(1591)
    })

    it('evaluates subtraction correctly', () => {
      const expr = { operand1: 1000, operator: '-', operand2: 255 }
      expect(evaluateExpression(expr)).toBe(745)
    })

    it('evaluates multiplication correctly', () => {
      const expr = { operand1: 50, operator: '*', operand2: 2 }
      expect(evaluateExpression(expr)).toBe(100)
    })

    it('evaluates division correctly', () => {
      const expr = { operand1: 100, operator: '/', operand2: 4 }
      expect(evaluateExpression(expr)).toBe(25)
    })

    it('handles division by zero', () => {
      const expr = { operand1: 100, operator: '/', operand2: 0 }
      expect(evaluateExpression(expr)).toBeNull()
    })

    it('returns null for invalid input', () => {
      expect(evaluateExpression(null)).toBeNull()
      expect(evaluateExpression({})).toBeNull()
    })
  })

  describe('calculateFromExpression', () => {
    it('performs complete calculation from string', () => {
      const result = calculateFromExpression('745 + 846')
      expect(result).toEqual({
        operand1: 745,
        operator: '+',
        operand2: 846,
        expression: '745 + 846',
        result: 1591
      })
    })

    it('handles the specified examples', () => {
      expect(calculateFromExpression('745 + 846').result).toBe(1591)
      expect(calculateFromExpression('50 * 2').result).toBe(100)
      expect(calculateFromExpression('100 / 4').result).toBe(25)
      expect(calculateFromExpression('1000 - 255').result).toBe(745)
    })

    it('returns null for invalid expressions', () => {
      expect(calculateFromExpression('invalid')).toBeNull()
      expect(calculateFromExpression('100 / 0')).toBeNull()
    })
  })

  describe('isValidExpression', () => {
    it('validates correct expressions', () => {
      expect(isValidExpression('745 + 846')).toBe(true)
      expect(isValidExpression('50 * 2')).toBe(true)
      expect(isValidExpression('100/4')).toBe(true)
      expect(isValidExpression('1000-255')).toBe(true)
    })

    it('rejects invalid expressions', () => {
      expect(isValidExpression('745')).toBe(false)
      expect(isValidExpression('745 +')).toBe(false)
      expect(isValidExpression('+ 846')).toBe(false)
      expect(isValidExpression('')).toBe(false)
      expect(isValidExpression('abc + 123')).toBe(false)
    })
  })
}) 