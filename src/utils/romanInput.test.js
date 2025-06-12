import { describe, it, expect } from 'vitest'
import { 
  isRomanChar, 
  isValidRomanNumeral, 
  romanToNumber, 
  parseMixedInput,
  parseForKeyboard,
  processRomanInput,
  getCurrentRomanSequence,
  hasIncompleteRomanSequence,
  getValidNextRomanChars,
  canAddRomanChar,
  getCurrentBuildingSequence
} from './romanInput.js'

describe('Roman Input Parser', () => {
  describe('isRomanChar', () => {
    it('should identify valid Roman numeral characters', () => {
      expect(isRomanChar('I')).toBe(true)
      expect(isRomanChar('V')).toBe(true)
      expect(isRomanChar('X')).toBe(true)
      expect(isRomanChar('L')).toBe(true)
      expect(isRomanChar('C')).toBe(true)
      expect(isRomanChar('D')).toBe(true)
      expect(isRomanChar('M')).toBe(true)
    })

    it('should work with lowercase characters', () => {
      expect(isRomanChar('i')).toBe(true)
      expect(isRomanChar('v')).toBe(true)
      expect(isRomanChar('x')).toBe(true)
    })

    it('should reject non-Roman characters', () => {
      expect(isRomanChar('A')).toBe(false)
      expect(isRomanChar('1')).toBe(false)
      expect(isRomanChar('+')).toBe(false)
      expect(isRomanChar('S')).toBe(false) // S excluded to avoid confusion with semis
    })
  })

  describe('isValidRomanNumeral', () => {
    it('should validate correct Roman numerals', () => {
      expect(isValidRomanNumeral('I')).toBe(true)
      expect(isValidRomanNumeral('IV')).toBe(true)
      expect(isValidRomanNumeral('IX')).toBe(true)
      expect(isValidRomanNumeral('XIV')).toBe(true)
      expect(isValidRomanNumeral('XL')).toBe(true)
      expect(isValidRomanNumeral('XLIX')).toBe(true)
      expect(isValidRomanNumeral('MCMXC')).toBe(true)
      expect(isValidRomanNumeral('MMMCMXCIX')).toBe(true) // 3999
    })

    it('should reject invalid Roman numerals', () => {
      expect(isValidRomanNumeral('IIII')).toBe(false) // Should be IV
      expect(isValidRomanNumeral('VV')).toBe(false) // Invalid repetition
      expect(isValidRomanNumeral('IL')).toBe(false) // Invalid subtraction
      expect(isValidRomanNumeral('IC')).toBe(false) // Invalid subtraction
      expect(isValidRomanNumeral('XM')).toBe(false) // Invalid subtraction
      expect(isValidRomanNumeral('')).toBe(false)
      expect(isValidRomanNumeral(null)).toBe(false)
    })
  })

  describe('romanToNumber', () => {
    it('should convert basic Roman numerals', () => {
      expect(romanToNumber('I')).toBe(1)
      expect(romanToNumber('V')).toBe(5)
      expect(romanToNumber('X')).toBe(10)
      expect(romanToNumber('L')).toBe(50)
      expect(romanToNumber('C')).toBe(100)
      expect(romanToNumber('D')).toBe(500)
      expect(romanToNumber('M')).toBe(1000)
    })

    it('should convert subtractive Roman numerals', () => {
      expect(romanToNumber('IV')).toBe(4)
      expect(romanToNumber('IX')).toBe(9)
      expect(romanToNumber('XL')).toBe(40)
      expect(romanToNumber('XC')).toBe(90)
      expect(romanToNumber('CD')).toBe(400)
      expect(romanToNumber('CM')).toBe(900)
    })

    it('should convert complex Roman numerals', () => {
      expect(romanToNumber('XIV')).toBe(14)
      expect(romanToNumber('XXIV')).toBe(24)
      expect(romanToNumber('XLIX')).toBe(49)
      expect(romanToNumber('MCMXC')).toBe(1990)
      expect(romanToNumber('MMMCMXCIX')).toBe(3999)
    })

    it('should handle case insensitivity', () => {
      expect(romanToNumber('xiv')).toBe(14)
      expect(romanToNumber('mcmxc')).toBe(1990)
    })

    it('should return null for invalid Roman numerals', () => {
      expect(romanToNumber('IIII')).toBe(null)
      expect(romanToNumber('VV')).toBe(null)
      expect(romanToNumber('IL')).toBe(null)
      expect(romanToNumber('')).toBe(null)
      expect(romanToNumber(null)).toBe(null)
    })
  })

  describe('parseMixedInput', () => {
    it('should handle pure numbers', () => {
      expect(parseMixedInput('123')).toBe('123')
      expect(parseMixedInput('12.5')).toBe('12.5')
    })

    it('should handle pure Roman numerals', () => {
      expect(parseMixedInput('XIV')).toBe('14')
      expect(parseMixedInput('MCMXC')).toBe('1990')
    })

    it('should handle mixed Roman and Arabic numerals', () => {
      expect(parseMixedInput('9XIV3')).toBe('9143')
      expect(parseMixedInput('XII5')).toBe('125')
      expect(parseMixedInput('7XL')).toBe('740')
    })

    it('should handle expressions with operators', () => {
      expect(parseMixedInput('XIV+XII')).toBe('14+12')
      expect(parseMixedInput('9+XIV*3')).toBe('9+14*3')
      expect(parseMixedInput('X*V-II')).toBe('10*5-2')
    })

    it('should handle complex mixed expressions', () => {
      expect(parseMixedInput('12+XIV*3-V')).toBe('12+14*3-5')
      expect(parseMixedInput('CM/X+II')).toBe('900/10+2')
    })

    it('should handle invalid Roman sequences by keeping them as-is', () => {
      expect(parseMixedInput('9II3')).toBe('923') // II is converted when interrupted by 3
      expect(parseMixedInput('VV+5')).toBe('VV+5') // Invalid Roman VV, kept as-is when interrupted by +
      expect(parseMixedInput('9II')).toBe('92') // Trailing Roman II converted to 2
    })

    it('should handle decimal numbers correctly', () => {
      expect(parseMixedInput('3.14+IX')).toBe('3.14+9')
      expect(parseMixedInput('V.5')).toBe('5.5')
    })

    it('should handle empty input', () => {
      expect(parseMixedInput('')).toBe('')
      expect(parseMixedInput(null)).toBe('')
    })
  })

  describe('parseForKeyboard', () => {
    it('should preserve trailing Roman sequences for building', () => {
      expect(parseForKeyboard('X')).toBe('X') // Keep incomplete sequence
      expect(parseForKeyboard('XI')).toBe('XI') // Still building sequence
      expect(parseForKeyboard('XIV')).toBe('XIV') // Keep complete but trailing sequence
      expect(parseForKeyboard('XIV+V')).toBe('14+V') // Convert when interrupted, preserve trailing
    })

    it('should convert interrupted sequences', () => {
      expect(parseForKeyboard('9XIV3')).toBe('9143') // XIV converted when interrupted by 3
      expect(parseForKeyboard('XIV+XII')).toBe('14+XII') // First converted, second preserved
    })
  })

  describe('processRomanInput', () => {
    it('should process character by character input', () => {
      expect(processRomanInput('', 'X')).toBe('X') // Keep incomplete sequence
      expect(processRomanInput('X', 'I')).toBe('XI') // Still building sequence
      expect(processRomanInput('XI', 'V')).toBe('XIV') // Keep building XIV
      expect(processRomanInput('XIV', '+')).toBe('14+') // Convert when interrupted by operator
      expect(processRomanInput('14+', 'V')).toBe('14+V') // New Roman sequence started
      expect(processRomanInput('14+V', '*')).toBe('14+5*') // V converted when interrupted
    })

    it('should handle lowercase input', () => {
      expect(processRomanInput('', 'x')).toBe('X')
      expect(processRomanInput('X', 'i')).toBe('XI')
    })

    it('should handle mixed sequences correctly', () => {
      expect(processRomanInput('9', 'X')).toBe('9X') // Start Roman after number
      expect(processRomanInput('9X', 'I')).toBe('9XI') // Continue Roman
      expect(processRomanInput('9XI', 'V')).toBe('9XIV') // Keep building XIV
      expect(processRomanInput('9XIV', '+')).toBe('914+') // Convert when interrupted
    })
  })

  describe('getCurrentRomanSequence', () => {
    it('should find Roman sequence at end of input', () => {
      expect(getCurrentRomanSequence('XIV')).toBe('XIV')
      expect(getCurrentRomanSequence('9+XIV')).toBe('XIV')
      expect(getCurrentRomanSequence('12*V')).toBe('V')
      expect(getCurrentRomanSequence('CM')).toBe('CM')
    })

    it('should return empty string if no Roman sequence at end', () => {
      expect(getCurrentRomanSequence('123')).toBe('')
      expect(getCurrentRomanSequence('XIV+5')).toBe('')
      expect(getCurrentRomanSequence('X+Y')).toBe('') // Y is not a Roman char
    })

    it('should handle incomplete sequences', () => {
      expect(getCurrentRomanSequence('12+X')).toBe('X')
      expect(getCurrentRomanSequence('5*XI')).toBe('XI')
    })
  })

  describe('hasIncompleteRomanSequence', () => {
    it('should detect incomplete Roman sequences', () => {
      expect(hasIncompleteRomanSequence('12+X')).toBe(false) // X is valid
      expect(hasIncompleteRomanSequence('12+XI')).toBe(false) // XI is valid
      expect(hasIncompleteRomanSequence('12+XIV')).toBe(false) // XIV is valid
    })

    it('should detect valid complete sequences as not incomplete', () => {
      expect(hasIncompleteRomanSequence('XIV')).toBe(false)
      expect(hasIncompleteRomanSequence('9+V')).toBe(false)
    })

    it('should handle no Roman sequence', () => {
      expect(hasIncompleteRomanSequence('123')).toBe(false)
      expect(hasIncompleteRomanSequence('12+5')).toBe(false)
    })
  })
})

describe('Roman numeral validation', () => {
  describe('getValidNextRomanChars', () => {
    it('allows all characters for empty sequence', () => {
      const valid = getValidNextRomanChars('')
      expect(valid).toEqual(['M', 'D', 'C', 'L', 'X', 'V', 'I'])
    })

    it('handles simple valid sequences', () => {
      expect(getValidNextRomanChars('I')).toContain('V') // IV is valid
      expect(getValidNextRomanChars('I')).toContain('X') // IX is valid
      expect(getValidNextRomanChars('I')).toContain('I') // II is valid
      expect(getValidNextRomanChars('V')).toContain('I') // VI is valid
    })

    it('prevents invalid sequences', () => {
      expect(getValidNextRomanChars('XIV')).not.toContain('I') // XIVI is invalid
      expect(getValidNextRomanChars('VV')).toEqual([]) // VV + anything is invalid
      expect(getValidNextRomanChars('LL')).toEqual([]) // LL + anything is invalid
    })

    it('handles subtractive notation correctly', () => {
      expect(getValidNextRomanChars('IV')).not.toContain('I') // IVI is invalid
      expect(getValidNextRomanChars('IX')).not.toContain('I') // IXI is invalid
      expect(getValidNextRomanChars('XL')).not.toContain('X') // XLX is invalid
    })
  })

  describe('canAddRomanChar', () => {
    it('works with mixed input', () => {
      expect(canAddRomanChar('5+X', 'I')).toBe(true) // 5+XI is valid
      expect(canAddRomanChar('5+XIV', 'I')).toBe(false) // 5+XIVI is invalid
      expect(canAddRomanChar('10*V', 'I')).toBe(true) // 10*VI is valid
    })

    it('handles empty input', () => {
      expect(canAddRomanChar('', 'M')).toBe(true)
      expect(canAddRomanChar('', 'I')).toBe(true)
    })

    it('works with pure Roman sequences', () => {
      expect(canAddRomanChar('X', 'I')).toBe(true) // XI is valid
      expect(canAddRomanChar('XIV', 'I')).toBe(false) // XIVI is invalid
    })
  })

  describe('getCurrentBuildingSequence', () => {
    it('extracts current Roman sequence from mixed input', () => {
      expect(getCurrentBuildingSequence('5+XIV')).toBe('XIV')
      expect(getCurrentBuildingSequence('100*M')).toBe('M')
      expect(getCurrentBuildingSequence('50+')).toBe('')
      expect(getCurrentBuildingSequence('MC')).toBe('MC')
    })

    it('handles transitions between types', () => {
      expect(getCurrentBuildingSequence('XIV5')).toBe('5')
      expect(getCurrentBuildingSequence('5XIV')).toBe('XIV')
      expect(getCurrentBuildingSequence('XIV+')).toBe('')
    })
  })
}) 