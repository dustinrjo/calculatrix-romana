<template>
  <div class="calculator">
    <h1 class="title">Calculatrix Romana</h1>
    
    <!-- <CalculationHistory :history="calculationHistory" /> -->
    
    <!-- Calculator Display (clickable to focus input) -->
    <div class="calculator-display" @click="focusExpressionInput">
      <div class="display-screen">
        {{ displayValue || 'NIHIL' }}
      </div>
      <div class="validation-indicator" :class="{ valid: isValidExpression, invalid: currentExpression && !isValidExpression }">
        <span v-if="isValidExpression">✓</span>
        <span v-else-if="currentExpression && !isValidExpression">✗</span>
      </div>
    </div>

    <!-- Hidden Expression Input -->
    <input 
      ref="expressionInput"
      v-model="currentExpression"
      @input="updateDisplay"
      @keydown="handleKeyDown"
      @blur="refocusAfterDelay"
      type="text"
      class="hidden-input"
      autocomplete="off"
      autofocus
    />

    <div class="calculator-buttons">
      <div class="button-row">
        <button @click="clearAll" class="clear-all-btn">AC</button>
        <button @click="clearCurrent" class="clear-btn">C</button>
        <button @click="addToExpression('^')" class="operator-btn">^</button>
        <button @click="addToExpression('/')" class="operator-btn">÷</button>
      </div>
      
      <div class="button-row">
        <button @click="addToExpression('*')" class="operator-btn">×</button>
        <button @click="addToExpression('-')" class="operator-btn">−</button>
        <button @click="addToExpression('+')" class="operator-btn">+</button>
        <button @click="calculate" class="equals-btn" :disabled="!isValidExpression">Computare</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { roundToTwelfths, toRomanFraction } from '../utils/romanFractions.js'
import { parseExpression, isValidExpression as validateExpression } from '../utils/expressionParser.js'
import CalculationHistory from './CalculationHistory.vue'

export default {
  name: 'Calculator',
  components: {
    CalculationHistory
  },
  setup() {
    // Calculator state
    const currentExpression = ref('')
    const calculationHistory = ref([])
    const expressionInput = ref(null)
    const lastResult = ref(null)
    const justCalculated = ref(false)

    // Convert mathematical expression to Roman numerals for display
    const convertExpressionToRoman = (expression) => {
      if (!expression) return ''
      
      // Replace operators with Roman equivalents for display
      let romanExpression = expression
        .replace(/\+/g, '+')
        .replace(/-/g, '−')
        .replace(/\*/g, '×')
        .replace(/\//g, '÷')
        .replace(/\^/g, '^')
      
      // Convert numbers to Roman numerals
      romanExpression = romanExpression.replace(/\d+\.?\d*/g, (match) => {
        const num = parseFloat(match)
        if (!isNaN(num)) {
          const rounded = roundToTwelfths(num)
          return toRomanFraction(Math.abs(rounded))
        }
        return match
      })
      
      return romanExpression
    }

    const displayValue = computed(() => {
      // If we just calculated and have no new expression, show the last result
      if (justCalculated.value && !currentExpression.value && lastResult.value !== null) {
        const rounded = roundToTwelfths(lastResult.value)
        const sign = lastResult.value < 0 ? '-' : ''
        return sign + toRomanFraction(Math.abs(rounded))
      }
      
      return convertExpressionToRoman(currentExpression.value)
    })

    const isValidExpression = computed(() => {
      if (!currentExpression.value.trim()) return false
      return validateExpression(currentExpression.value)
    })

    const updateDisplay = (event) => {
      // Filter input to only allow numbers, operators, and decimal points
      if (event && event.target) {
        const value = event.target.value
        const filteredValue = value.replace(/[^0-9+\-*/^.]/g, '')
        
        // Prevent multiple decimals in a single number
        // Split by operators but keep the operators
        const tokens = filteredValue.split(/([+\-*/^])/)
        const cleanedTokens = []
        
        for (let i = 0; i < tokens.length; i++) {
          const token = tokens[i]
          if (/[+\-*/^]/.test(token)) {
            // It's an operator, keep as is
            cleanedTokens.push(token)
          } else if (token) {
            // It's a number, check for multiple decimals
            const decimalCount = (token.match(/\./g) || []).length
            if (decimalCount > 1) {
              const firstDot = token.indexOf('.')
              cleanedTokens.push(token.substring(0, firstDot + 1) + token.substring(firstDot + 1).replace(/\./g, ''))
            } else {
              cleanedTokens.push(token)
            }
          }
        }
        
        const cleanValue = cleanedTokens.join('')
        
        if (value !== cleanValue) {
          event.target.value = cleanValue
          currentExpression.value = cleanValue
          return
        }
        
        // Handle chaining calculations
        if (justCalculated.value && filteredValue) {
          const firstChar = filteredValue[0]
          
          // If starting with an operator and we have a last result, continue the calculation
          if (/[+\-*/^]/.test(firstChar) && lastResult.value !== null) {
            currentExpression.value = lastResult.value + filteredValue
          } else {
            // Starting with a number, start fresh calculation
            currentExpression.value = filteredValue
            lastResult.value = null
          }
          
          justCalculated.value = false
        } else {
          currentExpression.value = filteredValue
        }
      }
    }

    const addToExpression = (operator) => {
      // Convert display operators to actual operators
      let actualOperator = operator
      if (operator === '×') actualOperator = '*'
      if (operator === '÷') actualOperator = '/'
      if (operator === '−') actualOperator = '-'
      
      // If we just calculated, start chaining with the last result
      if (justCalculated.value && lastResult.value !== null) {
        currentExpression.value = lastResult.value + actualOperator
        justCalculated.value = false
        focusExpressionInput()
        return
      }
      
      const expression = currentExpression.value
      const lastChar = expression.slice(-1)
      
      // Don't add operator if expression is empty (except for minus sign)
      if (!expression && actualOperator !== '-') return
      
      // Replace last operator if last character is an operator
      if (expression && /[+\-*/^]/.test(lastChar)) {
        currentExpression.value = expression.slice(0, -1) + actualOperator
      } else {
        currentExpression.value = expression + actualOperator
      }
      
      focusExpressionInput()
    }

    const calculate = () => {
      if (!isValidExpression.value) return
      
      try {
        const result = parseExpression(currentExpression.value)
        
        if (result !== null && !isNaN(result)) {
          // Round result to nearest 12th for Roman fraction system
          const roundedResult = roundToTwelfths(result)
          
          // Add to history
          const entry = {
            expression: currentExpression.value,
            result: roundedResult,
            timestamp: Date.now()
          }
          
          calculationHistory.value.unshift(entry)
          
          // Store result for chaining and clear expression
          lastResult.value = roundedResult
          currentExpression.value = ''
          justCalculated.value = true
          
          focusExpressionInput()
        }
      } catch (error) {
        console.error('Calculation error:', error)
        // Could show error message to user here
      }
    }

    const clearCurrent = () => {
      currentExpression.value = ''
      justCalculated.value = false
      focusExpressionInput()
    }

    const clearAll = () => {
      currentExpression.value = ''
      calculationHistory.value = []
      lastResult.value = null
      justCalculated.value = false
      focusExpressionInput()
    }

    const focusExpressionInput = () => {
      setTimeout(() => {
        if (expressionInput.value) {
          expressionInput.value.focus()
        }
      }, 0)
    }

    const refocusAfterDelay = () => {
      // Refocus the input after a short delay if it loses focus
      // This ensures the user can always type without clicking
      setTimeout(() => {
        if (expressionInput.value && document.activeElement !== expressionInput.value) {
          expressionInput.value.focus()
        }
      }, 100)
    }

    // Keyboard event handler
    const handleKeyDown = (event) => {
      switch (event.key) {
        case 'Enter':
        case '=':
          event.preventDefault()
          if (isValidExpression.value) {
            calculate()
          }
          break
        case 'Escape':
          event.preventDefault()
          clearAll()
          break
        case 'Delete':
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault()
            clearCurrent()
          }
          break
        case 'c':
        case 'C':
          if (event.ctrlKey || event.metaKey) {
            // Allow copy/paste
            return
          }
          if (event.target === expressionInput.value && !currentExpression.value) {
            event.preventDefault()
            clearCurrent()
          }
          break
      }
    }

    // Auto-focus on mount
    onMounted(() => {
      focusExpressionInput()
    })

    return {
      currentExpression,
      calculationHistory,
      expressionInput,
      displayValue,
      isValidExpression,
      updateDisplay,
      addToExpression,
      calculate,
      clearCurrent,
      clearAll,
      handleKeyDown,
      focusExpressionInput,
      refocusAfterDelay
    }
  }
}
</script>

<style scoped>
.calculator {
  max-width: 600px;
  margin: 0 auto;
  padding: 1.5rem;
  font-family: 'JetBrains Mono', monospace;
}

.title {
  text-align: center;
  font-size: 2rem;
  margin-bottom: 1.5rem;
  color: #2D4A22;
  font-weight: 700;
}

.calculator-display {
  background: #1a1a1a;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 2px solid #4A6741;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: text;
  transition: border-color 0.2s;
}

.calculator-display:hover {
  border-color: #5a7751;
}

.calculator-display:focus-within {
  border-color: #2D4A22;
  box-shadow: 0 0 8px rgba(45, 74, 34, 0.3);
}

.display-screen {
  color: #fff;
  font-size: 1.8rem;
  font-family: 'JetBrains Mono', monospace;
  text-align: center;
  word-break: break-all;
  line-height: 1.2;
  max-width: 100%;
  flex: 1;
}

.hidden-input {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.calculator-display .validation-indicator {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: bold;
}

.calculator-display .validation-indicator.valid {
  background: #28a745;
  color: white;
}

.calculator-display .validation-indicator.invalid {
  background: #dc3545;
  color: white;
}



.calculator-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.button-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.operator-btn {
  background: #4A6741;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 1rem;
  font-size: 1.2rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'JetBrains Mono', monospace;
}

.operator-btn:hover {
  background: #5a7751;
  transform: translateY(-1px);
}

.operator-btn:active {
  transform: translateY(0);
}

.clear-all-btn {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'JetBrains Mono', monospace;
}

.clear-all-btn:hover {
  background: #c82333;
  transform: translateY(-1px);
}

.clear-btn {
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'JetBrains Mono', monospace;
}

.clear-btn:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.equals-btn {
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'JetBrains Mono', monospace;
}

.equals-btn:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-1px);
}

.equals-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.equals-btn:active:not(:disabled) {
  transform: translateY(0);
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .calculator {
    padding: 1rem;
    max-width: 100%;
  }
  
  .title {
    font-size: 1.5rem;
  }
  
  .display-screen {
    font-size: 1.4rem;
  }
  
  .button-row {
    gap: 0.5rem;
  }
  
  .operator-btn, 
  .clear-all-btn, 
  .clear-btn, 
  .equals-btn {
    padding: 0.75rem;
    font-size: 1rem;
  }
}
</style> 