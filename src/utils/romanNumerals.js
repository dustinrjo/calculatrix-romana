// Roman numeral conversion utilities
// Supports numbers up to 399,999 (standard Roman numeral limits with vinculum notation)

const romanNumeralMap = [
  { value: 100000, numeral: 'C̄' },
  { value: 90000, numeral: 'X̄C̄' },
  { value: 50000, numeral: 'L̄' },
  { value: 40000, numeral: 'X̄L̄' },
  { value: 10000, numeral: 'X̄' },
  { value: 9000, numeral: 'ĪX̄' },
  { value: 5000, numeral: 'V̄' },
  { value: 4000, numeral: 'ĪV̄' },
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

// Convert integer to Roman numeral
const toRoman = (num) => {
  if (num <= 0) return ''
  if (num >= 400000) throw new Error('Numerus nimis magnus (Number too large)')
  
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

// Convert Roman numeral to integer (for future extensibility)
const fromRoman = (roman) => {
  if (!roman) return 0
  
  const valueMap = {
    'C̄': 100000, 'L̄': 50000, 'X̄': 10000, 'V̄': 5000,
    'M': 1000, 'D': 500, 'C': 100, 'L': 50, 'X': 10, 'V': 5, 'I': 1
  }
  
  let result = 0
  let prevValue = 0
  
  for (let i = roman.length - 1; i >= 0; i--) {
    const char = roman[i]
    const value = valueMap[char] || 0
    
    if (value < prevValue) {
      result -= value
    } else {
      result += value
    }
    prevValue = value
  }
  
  return result
}

// Format number for display (adds Roman numeral conversion with fractions)
const formatNumber = (num) => {
  if (num === null || num === undefined || isNaN(num)) return ''
  
  // For now, use simple Roman conversion until fractions are fully integrated
  // TODO: Integrate fraction system properly
  const sign = num < 0 ? '-' : ''
  return sign + toRoman(Math.abs(Math.floor(num)))
}

export { toRoman, fromRoman, formatNumber } 