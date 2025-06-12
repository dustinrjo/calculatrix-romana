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

/**
 * Get valid Roman numeral characters that can be appended to the current sequence
 * Uses a simpler, rule-based approach to avoid infinite recursion
 */
export const getValidNextRomanChars = (currentSequence) => {
  if (!currentSequence) {
    // If no sequence, all Roman characters are valid
    return ['M', 'D', 'C', 'L', 'X', 'V', 'I']
  }

  const seq = currentSequence.toUpperCase()
  const validChars = []

  // Simple rule-based validation based on Roman numeral patterns
  // Test each character to see if adding it would be valid
  for (const char of ['M', 'D', 'C', 'L', 'X', 'V', 'I']) {
    const testSequence = seq + char
    
    // Check if this would be a valid Roman numeral
    if (isValidRomanNumeral(testSequence)) {
      validChars.push(char)
    } else {
      // Check if this could be a valid partial sequence that could be extended
      // Use simpler heuristics instead of recursion
      if (couldBeValidPartial(testSequence)) {
        validChars.push(char)
      }
    }
  }

  return validChars
}

/**
 * Simple heuristic check for potentially valid partial Roman sequences
 * Avoids recursion to prevent infinite loops
 */
export const couldBeValidPartial = (partial) => {
  if (!partial) return true
  
  const seq = partial.toUpperCase()
  
  // Basic rules for valid Roman numeral construction
  // These catch most common cases without recursion
  
  // Single characters that could be extended
  if (seq.length === 1) {
    return ['I', 'V', 'X', 'L', 'C', 'D', 'M'].includes(seq)
  }
  
  // Two character sequences that could be extended
  if (seq.length === 2) {
    const firstChar = seq[0]
    const secondChar = seq[1]
    
    // Subtractive notation starts (I, X, C before larger values)
    if (firstChar === 'I' && ['V', 'X'].includes(secondChar)) return false // IV, IX are complete
    if (firstChar === 'X' && ['L', 'C'].includes(secondChar)) return false // XL, XC are complete
    if (firstChar === 'C' && ['D', 'M'].includes(secondChar)) return false // CD, CM are complete
    
    // Same character repetitions (up to 3)
    if (firstChar === secondChar && ['I', 'X', 'C', 'M'].includes(firstChar)) return true
    
    // Additive sequences
    if (ROMAN_VALUES[firstChar] >= ROMAN_VALUES[secondChar]) return true
  }
  
  // Three character sequences
  if (seq.length === 3) {
    // Check for patterns like III, XXX, CCC, MMM
    if (seq === 'III' || seq === 'XXX' || seq === 'CCC' || seq === 'MMM') return false // Complete
    
    // Other three character patterns are usually complete or invalid
    return false
  }
  
  // Longer sequences are usually complete or invalid
  return false
}

/**
 * Check if a Roman character can be added to the current input
 * This considers the full context including mixed input
 */
export const canAddRomanChar = (currentInput, romanChar) => {
  // Get the current Roman sequence at the end
  const currentSequence = getCurrentRomanSequence(currentInput)
  
  // Check if this character is valid for the current sequence
  const validChars = getValidNextRomanChars(currentSequence)
  return validChars.includes(romanChar.toUpperCase())
}

/**
 * Check if a Roman numeral (single or multi-character) can be added to the current input
 * This handles both individual characters and complete Roman numerals like "IV", "IX", etc.
 */
export const canAddRomanNumeral = (currentInput, romanNumeral) => {
  if (!romanNumeral) return false
  
  const currentSequence = getCurrentBuildingSequence(currentInput)
  
  // If we're not currently building a Roman sequence, we can add any valid Roman numeral
  if (!currentSequence || !/^[IVXLCDM]+$/i.test(currentSequence)) {
    return isValidRomanNumeral(romanNumeral)
  }
  
  // If we're in the middle of building a Roman sequence, check if adding this numeral makes sense
  // For multi-character numerals, we generally shouldn't add them to an existing sequence
  if (romanNumeral.length > 1) {
    return false // Don't add multi-character numerals to existing sequences
  }
  
  // For single characters, use the existing validation
  return canAddRomanChar(currentInput, romanNumeral)
}

/**
 * Get the current sequence being built at the end of input (Roman or number)
 * This is different from getCurrentRomanSequence as it handles mixed input better
 */
export const getCurrentBuildingSequence = (input) => {
  if (!input) return ''
  
  // Parse the input to understand the structure
  let currentToken = ''
  let tokenType = null
  
  for (let i = 0; i < input.length; i++) {
    const char = input[i]
    const upperChar = char.toUpperCase()
    
    if (isRomanChar(upperChar)) {
      if (tokenType !== 'roman') {
        currentToken = ''
      }
      currentToken += upperChar
      tokenType = 'roman'
    } else if (/[0-9.]/.test(char)) {
      if (tokenType !== 'number') {
        currentToken = ''
      }
      currentToken += char
      tokenType = 'number'
    } else if (/[+\-*/^]/.test(char)) {
      currentToken = ''
      tokenType = 'operator'
    }
  }
  
  // Return the current token if we're building a Roman sequence or number
  return (tokenType === 'roman' || tokenType === 'number') ? currentToken : ''
} 