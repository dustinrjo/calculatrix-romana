// Expression parser for mathematical calculations
// Handles expressions like "745 + 846", "100 * 2", etc.

const operators = ['+', '-', '*', '/']

// Parse and evaluate a mathematical expression
const parseExpression = (expression) => {
  if (!expression || typeof expression !== 'string') {
    return null
  }

  // Clean up the expression
  const cleanExpr = expression.trim().replace(/\s+/g, ' ')
  
  // Find the operator
  let operator = null
  let operatorIndex = -1
  
  // Look for operators from right to left to handle precedence naturally
  for (let i = cleanExpr.length - 1; i >= 0; i--) {
    const char = cleanExpr[i]
    if (operators.includes(char)) {
      // Make sure it's not a negative sign at the beginning
      if (char === '-' && i === 0) continue
      
      operator = char
      operatorIndex = i
      break
    }
  }
  
  if (!operator || operatorIndex === -1) {
    return null
  }
  
  // Split into operands
  const leftPart = cleanExpr.substring(0, operatorIndex).trim()
  const rightPart = cleanExpr.substring(operatorIndex + 1).trim()
  
  const operand1 = parseFloat(leftPart)
  const operand2 = parseFloat(rightPart)
  
  if (isNaN(operand1) || isNaN(operand2)) {
    return null
  }
  
  return {
    operand1,
    operator,
    operand2,
    expression: cleanExpr
  }
}

// Evaluate a parsed expression
const evaluateExpression = (parsedExpr) => {
  if (!parsedExpr) return null
  
  const { operand1, operator, operand2 } = parsedExpr
  
  switch (operator) {
    case '+':
      return operand1 + operand2
    case '-':
      return operand1 - operand2
    case '*':
      return operand1 * operand2
    case '/':
      return operand2 !== 0 ? operand1 / operand2 : null
    default:
      return null
  }
}

// Complete calculation from expression string
const calculateFromExpression = (expression) => {
  const parsed = parseExpression(expression)
  if (!parsed) return null
  
  const result = evaluateExpression(parsed)
  if (result === null) return null
  
  return {
    ...parsed,
    result
  }
}

// Check if expression is valid and complete
const isValidExpression = (expression) => {
  const parsed = parseExpression(expression)
  return parsed !== null
}

// Get operator symbol for display
const getOperatorSymbol = (operator) => {
  const symbols = {
    '+': '+',
    '-': '−',
    '*': '×',
    '/': '÷'
  }
  return symbols[operator] || operator
}

export { 
  parseExpression, 
  evaluateExpression, 
  calculateFromExpression, 
  isValidExpression,
  getOperatorSymbol 
} 