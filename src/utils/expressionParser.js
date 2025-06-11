// Expression parser for mathematical calculations
// Handles complex expressions like "14+2*3-5/2", "100 * 2 + 50", etc.

// Tokenize expression into numbers and operators
const tokenize = (expression) => {
  const tokens = []
  let currentNumber = ''
  
  for (let i = 0; i < expression.length; i++) {
    const char = expression[i]
    
    if (/\d/.test(char) || char === '.') {
      // Build up number
      currentNumber += char
    } else if (/[+\-*/^]/.test(char)) {
      // Handle negative numbers
      if (char === '-' && (i === 0 || /[+\-*/^(]/.test(expression[i-1]))) {
        currentNumber += char
      } else {
        // Finish current number if exists
        if (currentNumber) {
          tokens.push(parseFloat(currentNumber))
          currentNumber = ''
        }
        tokens.push(char)
      }
    }
    // Skip spaces and other characters
  }
  
  // Don't forget the last number
  if (currentNumber) {
    tokens.push(parseFloat(currentNumber))
  }
  
  return tokens
}

// Evaluate expression using proper operator precedence
const evaluateTokens = (tokens) => {
  if (!tokens || tokens.length === 0) return null
  if (tokens.length === 1) return tokens[0]
  
  // Create a copy to avoid modifying original
  let expression = [...tokens]
  
  // Handle exponentiation first (highest precedence)
  for (let i = 1; i < expression.length; i += 2) {
    if (expression[i] === '^') {
      const base = expression[i-1]
      const exponent = expression[i+1]
      const result = Math.pow(base, exponent)
      expression.splice(i-1, 3, result)
      i -= 2 // Adjust index after removal
    }
  }
  
  // Handle multiplication and division (next precedence)
  for (let i = 1; i < expression.length; i += 2) {
    if (expression[i] === '*' || expression[i] === '/') {
      const left = expression[i-1]
      const operator = expression[i]
      const right = expression[i+1]
      
      let result
      if (operator === '*') {
        result = left * right
      } else {
        result = right !== 0 ? left / right : null
      }
      
      if (result === null) return null
      
      expression.splice(i-1, 3, result)
      i -= 2 // Adjust index after removal
    }
  }
  
  // Handle addition and subtraction (lowest precedence)
  for (let i = 1; i < expression.length; i += 2) {
    if (expression[i] === '+' || expression[i] === '-') {
      const left = expression[i-1]
      const operator = expression[i]
      const right = expression[i+1]
      
      const result = operator === '+' ? left + right : left - right
      expression.splice(i-1, 3, result)
      i -= 2 // Adjust index after removal
    }
  }
  
  return expression.length === 1 ? expression[0] : null
}

// Parse and evaluate a mathematical expression
const parseExpression = (expression) => {
  if (!expression || typeof expression !== 'string') {
    return null
  }

  try {
    // Clean up the expression
    const cleanExpr = expression.trim().replace(/\s+/g, '')
    
    // Basic validation first
    if (!cleanExpr) return null
    
    // Check for trailing operators
    if (/[+\-*/^]$/.test(cleanExpr)) return null
    
    // Check for leading operators (except minus)
    if (/^[+*/^]/.test(cleanExpr)) return null
    
    // Check for consecutive operators
    if (/[+\-*/^]{2,}/.test(cleanExpr)) return null
    
    // Tokenize the expression
    const tokens = tokenize(cleanExpr)
    
    // Check if we have valid tokens
    if (!tokens || tokens.length === 0) return null
    
    // Evaluate the tokens
    const result = evaluateTokens(tokens)
    
    // Return null if result is NaN or null
    if (result === null || isNaN(result)) return null
    
    return result
  } catch (error) {
    console.error('Expression parsing error:', error)
    return null
  }
}

// Check if expression is valid and complete
const isValidExpression = (expression) => {
  if (!expression || typeof expression !== 'string') return false
  
  // Basic validation - should have at least one number and operator pattern
  const cleanExpr = expression.trim().replace(/\s+/g, '')
  
  // Should not start or end with an operator (except minus at start)
  if (/[+*/^]$/.test(cleanExpr) || /^[+*/^]/.test(cleanExpr)) return false
  if (/[-]$/.test(cleanExpr)) return false
  
  // Should not have consecutive operators
  if (/[+\-*/^]{2,}/.test(cleanExpr)) return false
  
  // Should have at least one operator
  if (!/[+\-*/^]/.test(cleanExpr)) {
    // Single number is valid
    return !isNaN(parseFloat(cleanExpr))
  }
  
  // Try to parse - if it works, it's valid
  try {
    const result = parseExpression(expression)
    return result !== null && !isNaN(result)
  } catch (error) {
    return false
  }
}

// Get operator symbol for display
const getOperatorSymbol = (operator) => {
  const symbols = {
    '+': '+',
    '-': '−',
    '*': '×',
    '/': '÷',
    '^': '^'
  }
  return symbols[operator] || operator
}

export { 
  parseExpression, 
  isValidExpression,
  getOperatorSymbol 
} 