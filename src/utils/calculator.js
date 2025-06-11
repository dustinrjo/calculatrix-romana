// Calculator utilities with operation history tracking

const operations = {
  '+': (a, b) => a + b,
  '-': (a, b) => a - b,
  '*': (a, b) => a * b,
  '/': (a, b) => b !== 0 ? a / b : null,
  '^': (a, b) => Math.pow(a, b)
}

// Create a new calculation entry for history
const createCalculationEntry = (operand1, operator, operand2, result) => ({
  operand1,
  operator,
  operand2,
  result,
  timestamp: Date.now()
})

// Perform calculation and return result
const performCalculation = (operand1, operator, operand2) => {
  const num1 = parseFloat(operand1)
  const num2 = parseFloat(operand2)
  
  if (isNaN(num1) || isNaN(num2)) {
    return null
  }
  
  const operation = operations[operator]
  if (!operation) {
    return null
  }
  
  const result = operation(num1, num2)
  return result
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

// Get Latin operation names for UI
const getOperationText = (operator) => {
  const latinNames = {
    '+': 'addere',
    '-': 'subtrahere', 
    '*': 'multiplicare',
    '/': 'dividere',
    '^': 'potentia'
  }
  return latinNames[operator] || operator
}

export { 
  performCalculation, 
  createCalculationEntry, 
  getOperatorSymbol, 
  getOperationText,
  operations 
} 