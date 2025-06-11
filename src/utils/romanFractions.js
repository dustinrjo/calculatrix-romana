// Roman fraction system based on uncia (12ths)
// Following ancient Roman coin denominations

const romanFractionNames = {
  12: '', // whole number (as)
  11: 'deunx', // 11/12
  10: 'dextans', // 10/12  
  9: 'dodrans', // 9/12
  8: 'bes', // 8/12
  7: 'septunx', // 7/12
  6: 'semis', // 6/12 (half)
  5: 'quincunx', // 5/12
  4: 'triens', // 4/12 (third)
  3: 'quadrans', // 3/12 (quarter)
  2: 'sextans', // 2/12 (sixth)
  1: 'uncia', // 1/12
  0: '' // no fraction
}

// Dot notation for fractions (using Unicode dot symbols)
const romanFractionDots = {
  0: '',
  1: '·', // uncia (1/12)
  2: ':', // sextans (2/12)
  3: '∴', // quadrans (3/12) 
  4: '∷', // triens (4/12)
  5: '⁙', // quincunx (5/12)
  6: 'S', // semis (6/12) - special symbol
  7: 'S·', // septunx (6/12 + 1/12)
  8: 'S:', // bes (6/12 + 2/12)
  9: 'S∴', // dodrans (6/12 + 3/12)
  10: 'S∷', // dextans (6/12 + 4/12)
  11: 'S⁙' // deunx (6/12 + 5/12)
}

// Convert decimal to Roman fractions (round to nearest 12th)
const toRomanFraction = (decimal) => {
  if (decimal < 0) {
    return '-' + toRomanFraction(-decimal)
  }
  
  const wholePart = Math.floor(decimal)
  const fractionalPart = decimal - wholePart
  
  // Round to nearest 12th
  const twelfths = Math.round(fractionalPart * 12)
  
  // Handle rounding up to next whole number
  if (twelfths === 12) {
    return formatWholeNumber(wholePart + 1)
  }
  
  const wholeRoman = wholePart > 0 ? formatWholeNumber(wholePart) : ''
  const fractionDots = romanFractionDots[twelfths] || ''
  
  if (wholePart === 0 && twelfths === 0) {
    return ''
  }
  
  return wholeRoman + fractionDots
}

// Helper to format whole numbers (reuse existing roman numeral logic)
const formatWholeNumber = (num) => {
  if (num <= 0) return ''
  
  const romanNumeralMap = [
    { value: 1000, numeral: 'M' },
    { value: 900, numeral: 'CM' },
    { value: 500, numeral: 'D' },
    { value: 400, numeral: 'CD' },
    { value: 100, numeral: 'C' },
    { value: 90, numeral: 'XC' },
    { value: 50, numeral: 'L' },
    { value: 40, numeral: 'XL' },
    { value: 10, numeral: 'X' },
    { value: 9, numeral: 'IX' },
    { value: 5, numeral: 'V' },
    { value: 4, numeral: 'IV' },
    { value: 1, numeral: 'I' }
  ]
  
  let result = ''
  let remaining = num
  
  for (const { value, numeral } of romanNumeralMap) {
    while (remaining >= value) {
      result += numeral
      remaining -= value
    }
  }
  
  return result
}

// Get fraction name in Latin
const getFractionName = (decimal) => {
  const fractionalPart = decimal - Math.floor(decimal)
  const twelfths = Math.round(fractionalPart * 12)
  return romanFractionNames[twelfths] || ''
}

// Convert from Roman fraction back to decimal (for future use)
const fromRomanFraction = (romanFrac) => {
  // This would be complex to implement fully, placeholder for now
  return 0
}

// Round number to nearest 12th
const roundToTwelfths = (decimal) => {
  return Math.round(decimal * 12) / 12
}

// Check if number has fractional part in 12ths
const hasFraction = (decimal) => {
  const rounded = roundToTwelfths(decimal)
  const fractionalPart = rounded - Math.floor(rounded)
  return fractionalPart !== 0
}

export { 
  toRomanFraction, 
  getFractionName, 
  fromRomanFraction, 
  roundToTwelfths, 
  hasFraction,
  romanFractionNames,
  romanFractionDots 
} 