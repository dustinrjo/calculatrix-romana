// Roman numeral input parsing and conversion utilities

// Valid Roman numeral characters (excluding S for now to avoid confusion with semis fractions)
const ROMAN_CHARS = new Set(['I', 'V', 'X', 'L', 'C', 'D', 'M'])

// Roman numeral values for conversion
const ROMAN_VALUES = {
  'I': 1,
  'V': 5,
  'X': 10,
  'L': 50,
  'C': 100,
  'D': 500,
  'M': 1000
}

// Valid Roman numeral patterns for validation
const ROMAN_PATTERN = /^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/

/**
 * Check if a character is a valid Roman numeral character
 */
export const isRomanChar = (char) => {
  return ROMAN_CHARS.has(char.toUpperCase())
}

/**
 * Check if a string is a valid Roman numeral
 */
export const isValidRomanNumeral = (str) => {
  if (!str || str.length === 0) return false
  return ROMAN_PATTERN.test(str.toUpperCase())
}

/**
 * Convert a Roman numeral string to a number
 */
export const romanToNumber = (roman) => {
  if (!roman || !isValidRomanNumeral(roman)) {
    return null
  }
  
  const upperRoman = roman.toUpperCase()
  let result = 0
  let i = 0
  
  while (i < upperRoman.length) {
    const current = ROMAN_VALUES[upperRoman[i]]
    const next = i + 1 < upperRoman.length ? ROMAN_VALUES[upperRoman[i + 1]] : 0
    
    if (current < next) {
      // Subtractive case (like IV, IX, XL, etc.)
      result += (next - current)
      i += 2
    } else {
      // Additive case
      result += current
      i += 1
    }
  }
  
  return result
}

/**
 * Parse mixed Roman/Arabic input and convert Roman sequences to numbers
 * This is the main parsing function used for final conversion
 */
export const parseMixedInput = (input) => {
  if (!input) return ''
  
  let result = ''
  let currentToken = ''
  let tokenType = null // 'roman', 'number', 'operator'
  
  const finishCurrentToken = (forceConvert = false) => {
    if (currentToken) {
      if (tokenType === 'roman') {
        if (forceConvert) {
          // Force conversion - used when interrupted
          const converted = romanToNumber(currentToken)
          if (converted !== null) {
            result += converted.toString()
          } else {
            // Invalid Roman numeral, keep as-is
            result += currentToken
          }
        } else {
          // Don't convert unless forced - preserve the Roman sequence
          result += currentToken
        }
      } else {
        result += currentToken
      }
      currentToken = ''
      tokenType = null
    }
  }
  
  for (let i = 0; i < input.length; i++) {
    const char = input[i]
    const upperChar = char.toUpperCase()
    
    if (isRomanChar(upperChar)) {
      // Roman numeral character
      if (tokenType === 'number') {
        finishCurrentToken(true) // Force convert previous number
      } else if (tokenType === 'operator') {
        finishCurrentToken()
      }
      currentToken += upperChar
      tokenType = 'roman'
    } else if (/[0-9.]/.test(char)) {
      // Number or decimal - this interrupts a Roman sequence
      if (tokenType === 'roman') {
        finishCurrentToken(true) // Force convert the Roman sequence
      }
      if (tokenType !== 'number') {
        finishCurrentToken()
      }
      currentToken += char
      tokenType = 'number'
    } else if (/[+\-*/^]/.test(char)) {
      // Operator - this interrupts any sequence
      finishCurrentToken(true) // Force convert whatever we have
      result += char
    } else {
      // Unknown character, finish current token and add as-is
      finishCurrentToken()
      result += char
    }
  }
  
  // Handle the final token - always convert for final result
  if (currentToken) {
    finishCurrentToken(true)
  }
  
  return result
}

/**
 * Parse input for keyboard building - preserves trailing Roman sequences
 * This allows users to build Roman numerals incrementally (X -> XI -> XIV)
 */
export const parseForKeyboard = (input) => {
  if (!input) return ''
  
  let result = ''
  let currentToken = ''
  let tokenType = null // 'roman', 'number', 'operator'
  
  const finishCurrentToken = (forceConvert = false) => {
    if (currentToken) {
      if (tokenType === 'roman') {
        if (forceConvert) {
          // Force conversion - used when interrupted
          const converted = romanToNumber(currentToken)
          if (converted !== null) {
            result += converted.toString()
          } else {
            // Invalid Roman numeral, keep as-is
            result += currentToken
          }
        } else {
          // Don't convert unless forced - preserve the Roman sequence
          result += currentToken
        }
      } else {
        result += currentToken
      }
      currentToken = ''
      tokenType = null
    }
  }
  
  for (let i = 0; i < input.length; i++) {
    const char = input[i]
    const upperChar = char.toUpperCase()
    
    if (isRomanChar(upperChar)) {
      // Roman numeral character
      if (tokenType === 'number') {
        finishCurrentToken(true) // Force convert previous number
      } else if (tokenType === 'operator') {
        finishCurrentToken()
      }
      currentToken += upperChar
      tokenType = 'roman'
    } else if (/[0-9.]/.test(char)) {
      // Number or decimal - this interrupts a Roman sequence
      if (tokenType === 'roman') {
        finishCurrentToken(true) // Force convert the Roman sequence
      }
      if (tokenType !== 'number') {
        finishCurrentToken()
      }
      currentToken += char
      tokenType = 'number'
    } else if (/[+\-*/^]/.test(char)) {
      // Operator - this interrupts any sequence
      finishCurrentToken(true) // Force convert whatever we have
      result += char
    } else {
      // Unknown character, finish current token and add as-is
      finishCurrentToken()
      result += char
    }
  }
  
  // Handle the final token - preserve trailing Roman sequences for building
  if (currentToken) {
    if (tokenType === 'roman') {
      // For trailing Roman sequences, don't convert - allow building
      result += currentToken
    } else {
      finishCurrentToken(true)
    }
  }
  
  return result
}

/**
 * Process keyboard input character by character, handling Roman numeral sequences
 * This builds the input incrementally and preserves trailing Roman sequences
 */
export const processKeyboardInput = (currentInput, newChar) => {
  const upperChar = newChar.toUpperCase()
  
  // Build the new input
  const newInput = currentInput + upperChar
  
  // Parse for keyboard building (preserves trailing sequences)
  return parseForKeyboard(newInput)
}

/**
 * Legacy function - kept for compatibility
 */
export const processRomanInput = (currentValue, newChar) => {
  return processKeyboardInput(currentValue, newChar)
}

/**
 * Get the current incomplete Roman sequence at the end of an expression
 * Used for real-time validation feedback
 */
export const getCurrentRomanSequence = (input) => {
  if (!input) return ''
  
  let romanSequence = ''
  
  // Work backwards from the end to find the current Roman sequence
  for (let i = input.length - 1; i >= 0; i--) {
    const char = input[i]
    
    if (isRomanChar(char)) {
      romanSequence = char + romanSequence
    } else {
      break
    }
  }
  
  return romanSequence
}

/**
 * Check if the current input ends with an incomplete Roman numeral sequence
 */
export const hasIncompleteRomanSequence = (input) => {
  const sequence = getCurrentRomanSequence(input)
  return sequence.length > 0 && !isValidRomanNumeral(sequence)
} 