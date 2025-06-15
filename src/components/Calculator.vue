<template>
  <div class="calculator">
    <h1 class="title">Calculatrix Romana</h1>
    
    <!-- <CalculationHistory :history="calculationHistory" /> -->
    
    <!-- Calculator Display (clickable to focus input) -->
    <div class="calculator-display" @click="focusExpressionInput">
      <div class="previous-calculation" v-if="previousCalculation">
        {{ previousCalculation }}
      </div>
      <div class="display-screen">
        {{ displayValue || 'nihil' }}
      </div>
      <div class="validation-indicator" :class="{ valid: isValidExpression, invalid: currentExpression && !isValidExpression }">
        <span v-if="isValidExpression">✓</span>
        <span v-else-if="currentExpression && !isValidExpression">✗</span>
      </div>
    </div>
    
    <!-- Hidden Expression Input -->
    <input 
    ref="expressionInput"
    @input="updateDisplay"
    @keydown="handleKeyDown"
    @blur="refocusAfterDelay"
    type="text"
    class="hidden-input"
    autocomplete="off"
    autofocus
    />
    
    <div class="calculator-buttons">
      <!-- Control and Operator Buttons -->
      <div class="button-row control-row">
        <button @click="clearAll" class="clear-all-btn">AC</button>
        <button @click="clearCurrent" class="clear-btn">C</button>
        <button @click="copyToClipboard" class="copy-btn" :disabled="!canCopy" title="Copia ad Clipboard">📋 Copia</button>
        <button @click="addToExpression('^')" class="operator-btn">^</button>
      </div>
      
      <!-- Large Roman Numerals -->
      <div class="button-row roman-numerals-row">
        <button @click="addRomanNumeral('M')" class="roman-btn" :disabled="!romanButtonStates.M">M</button>
        <button @click="addRomanNumeral('D')" class="roman-btn" :disabled="!romanButtonStates.D">D</button>
        <button @click="addRomanNumeral('C')" class="roman-btn" :disabled="!romanButtonStates.C">C</button>
        <button @click="addRomanNumeral('L')" class="roman-btn" :disabled="!romanButtonStates.L">L</button>
      </div>
      
      <!-- Ten to One Roman Numerals -->
      <div class="button-row roman-numerals-row">
        <button @click="addRomanNumeral('VII')" class="roman-btn" :disabled="!romanButtonStates.VII">VII</button>
        <button @click="addRomanNumeral('VIII')" class="roman-btn" :disabled="!romanButtonStates.VIII">VIII</button>
        <button @click="addRomanNumeral('IX')" class="roman-btn" :disabled="!romanButtonStates.IX">IX</button>
        <button @click="addRomanNumeral('X')" class="roman-btn" :disabled="!romanButtonStates.X">X</button>
      </div>
      
      <div class="button-row roman-numerals-row">
        <button @click="addRomanNumeral('IV')" class="roman-btn" :disabled="!romanButtonStates.IV">IV</button>
        <button @click="addRomanNumeral('V')" class="roman-btn" :disabled="!romanButtonStates.V">V</button>
        <button @click="addRomanNumeral('VI')" class="roman-btn" :disabled="!romanButtonStates.VI">VI</button>
        <button @click="addToExpression('+')" class="operator-btn">+</button>
      </div>
      
      <div class="button-row roman-numerals-row">
        <button @click="addRomanNumeral('I')" class="roman-btn" :disabled="!romanButtonStates.I">I</button>
        <button @click="addRomanNumeral('II')" class="roman-btn" :disabled="!romanButtonStates.II">II</button>
        <button @click="addRomanNumeral('III')" class="roman-btn" :disabled="!romanButtonStates.III">III</button>
        <button @click="addToExpression('-')" class="operator-btn">−</button>
        </div>
        
        <!-- Final operators and compute button -->
        
        <div class="button-row calculare-row">
          <button @click="addToExpression('*')" class="operator-btn">×</button>
          <button @click="addToExpression('/')" class="operator-btn">÷</button>
          <button @click="calculate" class="equals-btn" :disabled="!isValidExpression">Computare</button>
        </div>
        
      </div>
    </div>
  </template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { roundToTwelfths, toRomanFraction } from '../utils/romanFractions.js'
import { parseExpression, isValidExpression as validateExpression } from '../utils/expressionParser.js'
import { parseMixedInput, parseForKeyboard, isRomanChar, canAddRomanChar, getCurrentBuildingSequence, getValidNextRomanChars, canAddRomanNumeral } from '../utils/romanInput.js'
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
    const previousCalculation = ref('')

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
      // Convert any Roman numerals to numbers for validation
      const fullyConverted = parseMixedInput(currentExpression.value)
      return validateExpression(fullyConverted)
    })

    const updateDisplay = (event) => {
      if (event && event.target) {
        const value = event.target.value
        const oldValue = currentExpression.value
        
        // Filter input to allow numbers, operators, decimal points, and Roman numeral characters
        let filteredValue = value.replace(/[^0-9+\-*/^.IVXLCDM]/gi, '')
        
        // Additional validation for Roman numeral sequences
        if (filteredValue.length > oldValue.length) {
          // User is adding characters - validate Roman numeral input
          const newChar = filteredValue[filteredValue.length - 1]
          if (isRomanChar(newChar)) {
            try {
              if (!canAddRomanChar(oldValue, newChar)) {
                // Invalid Roman character for current sequence - reject it
                filteredValue = oldValue
                if (event.target) {
                  event.target.value = oldValue
                }
                return
              }
            } catch (error) {
              console.error('Error validating Roman character:', error)
              // If validation fails, allow the character to avoid freezing
            }
          }
        }
        
        // Convert mixed Roman/Arabic input - preserve trailing sequences for building
        const convertedValue = parseForKeyboard(filteredValue)
        
        // Prevent multiple decimals in a single number
        const tokens = convertedValue.split(/([+\-*/^])/)
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
        
        // Update the input field with the filtered (but not converted) value
        if (value !== filteredValue) {
          event.target.value = filteredValue
          // Re-trigger with the filtered value
          if (filteredValue !== value) {
            return updateDisplay({ target: { value: filteredValue } })
          }
        }
        
        // Handle chaining calculations
        if (justCalculated.value && cleanValue) {
          const firstChar = cleanValue[0]
          
          // If starting with an operator and we have a last result, continue the calculation
          if (/[+\-*/^]/.test(firstChar) && lastResult.value !== null) {
            currentExpression.value = lastResult.value + cleanValue
            event.target.value = lastResult.value + filteredValue
          } else {
            // Starting with a number, start fresh calculation
            currentExpression.value = cleanValue
            event.target.value = filteredValue
            lastResult.value = null
            previousCalculation.value = '' // Clear previous calculation when starting fresh
          }
          
          justCalculated.value = false
        } else {
          currentExpression.value = cleanValue
          // Keep the input field synced with the filtered value
          if (event.target.value !== filteredValue) {
            event.target.value = filteredValue
          }
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
        // Also update the hidden input field
        if (expressionInput.value) {
          expressionInput.value.value = lastResult.value + actualOperator
        }
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
        // Also update the hidden input field
        if (expressionInput.value) {
          expressionInput.value.value = expression.slice(0, -1) + actualOperator
        }
      } else {
        currentExpression.value = expression + actualOperator
        // Also update the hidden input field
        if (expressionInput.value) {
          expressionInput.value.value = expression + actualOperator
        }
      }
      
      focusExpressionInput()
    }

    const addRomanNumeral = (roman) => {
      try {
        // Check if this Roman numeral is valid for the current sequence
        if (!justCalculated.value && !canAddRomanNumeral(currentExpression.value, roman)) {
          return // Don't add invalid numerals
        }

        // If we just calculated, start fresh with the Roman numeral
        if (justCalculated.value) {
          currentExpression.value = roman
          if (expressionInput.value) {
            expressionInput.value.value = roman
          }
          lastResult.value = null
          previousCalculation.value = ''
          justCalculated.value = false
          focusExpressionInput()
          return
        }
        
        // Add Roman numeral to current expression
        currentExpression.value += roman
        if (expressionInput.value) {
          expressionInput.value.value += roman
        }
        
        focusExpressionInput()
      } catch (error) {
        console.error('Error adding Roman numeral:', error)
        // If there's an error, just add the numeral without validation to avoid freezing
        if (justCalculated.value) {
          currentExpression.value = roman
          if (expressionInput.value) {
            expressionInput.value.value = roman
          }
          lastResult.value = null
          previousCalculation.value = ''
          justCalculated.value = false
        } else {
          currentExpression.value += roman
          if (expressionInput.value) {
            expressionInput.value.value += roman
          }
        }
        focusExpressionInput()
      }
    }

    // Check if copy is available (result or input without operators)
    const canCopy = computed(() => {
      // Can copy if we just calculated (have a result)
      if (justCalculated.value && lastResult.value !== null) {
        return true
      }
      
      // Can copy if we have input without operators (just a number/roman numeral)
      if (currentExpression.value && !/[+\-*/^]/.test(currentExpression.value)) {
        return true
      }
      
      return false
    })

    // Roman button states - determine which buttons should be enabled
    const romanButtonStates = computed(() => {
      try {
        const currentSequence = getCurrentBuildingSequence(currentExpression.value)
        
        // Check if we can add each Roman numeral (single or multi-character)
        const canAdd = (romanNumeral) => {
          return canAddRomanNumeral(currentExpression.value, romanNumeral)
        }
        
        return {
          M: canAdd('M'),
          D: canAdd('D'),
          C: canAdd('C'),
          L: canAdd('L'),
          X: canAdd('X'),
          IX: canAdd('IX'),
          VIII: canAdd('VIII'),
          VII: canAdd('VII'),
          VI: canAdd('VI'),
          V: canAdd('V'),
          IV: canAdd('IV'),
          III: canAdd('III'),
          II: canAdd('II'),
          I: canAdd('I')
        }
      } catch (error) {
        console.error('Error computing roman button states:', error)
        // Fallback: enable all buttons if there's an error
        return {
          M: true, D: true, C: true, L: true, X: true, IX: true, 
          VIII: true, VII: true, VI: true, V: true, IV: true, 
          III: true, II: true, I: true
        }
      }
    })

    const copyToClipboard = async () => {
      if (!canCopy.value) return
      
      let textToCopy = ''
      
      // If we just calculated, copy the result in Roman numerals
      if (justCalculated.value && lastResult.value !== null) {
        const rounded = roundToTwelfths(lastResult.value)
        const sign = lastResult.value < 0 ? '-' : ''
        textToCopy = sign + toRomanFraction(Math.abs(rounded))
      } else if (currentExpression.value && !/[+\-*/^]/.test(currentExpression.value)) {
        // Copy the current display value (already in Roman numerals)
        textToCopy = displayValue.value
      }
      
      if (textToCopy) {
        try {
          await navigator.clipboard.writeText(textToCopy)
          // Could show a brief success message here
          console.log('Copied to clipboard:', textToCopy)
        } catch (err) {
          console.error('Failed to copy: ', err)
          // Fallback for older browsers
          try {
            const textArea = document.createElement('textarea')
            textArea.value = textToCopy
            document.body.appendChild(textArea)
            textArea.focus()
            textArea.select()
            document.execCommand('copy')
            document.body.removeChild(textArea)
            console.log('Copied to clipboard (fallback):', textToCopy)
          } catch (fallbackErr) {
            console.error('Fallback copy failed: ', fallbackErr)
          }
        }
      }
    }

    const calculate = () => {
      if (!isValidExpression.value) return
      
      try {
        // Convert any remaining Roman numerals to numbers before calculating
        const fullyConverted = parseMixedInput(currentExpression.value)
        const result = parseExpression(fullyConverted)
        
        if (result !== null && !isNaN(result)) {
          // Round result to nearest 12th for Roman fraction system
          const roundedResult = roundToTwelfths(result)
          
          // Set previous calculation for display (in Roman numerals)
          const romanExpression = convertExpressionToRoman(currentExpression.value)
          const romanResult = toRomanFraction(Math.abs(roundedResult))
          const sign = roundedResult < 0 ? '-' : ''
          previousCalculation.value = `${romanExpression} = ${sign}${romanResult}`
          
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
          if (expressionInput.value) {
            expressionInput.value.value = ''
          }
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
      if (expressionInput.value) {
        expressionInput.value.value = ''
      }
      justCalculated.value = false
      focusExpressionInput()
    }

    const clearAll = () => {
      currentExpression.value = ''
      if (expressionInput.value) {
        expressionInput.value.value = ''
      }
      calculationHistory.value = []
      lastResult.value = null
      justCalculated.value = false
      previousCalculation.value = ''
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
          // Only treat 'C' as a clear command if the expression is empty
          // Otherwise let it be processed as Roman numeral input
          if (!currentExpression.value) {
            event.preventDefault()
            clearCurrent()
          }
          // If there's already content, let 'C' be processed as Roman numeral
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
      previousCalculation,
      updateDisplay,
      addToExpression,
      addRomanNumeral,
      canCopy,
      copyToClipboard,
      romanButtonStates,
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
  min-height: 100px;
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
  text-align: right;
  word-break: break-all;
  line-height: 1.2;
  max-width: 100%;
  flex: 1;
  padding-right: 0.5rem;
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

.previous-calculation {
  position: absolute;
  top: 0.5rem;
  left: 0.75rem;
  font-size: 0.8rem;
  color: #888;
  font-family: 'JetBrains Mono', monospace;
  max-width: calc(100% - 3rem);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.button-row.control-row {
  grid-template-columns: repeat(4, 1fr);
}

.button-row.roman-numerals-row {
  grid-template-columns: repeat(4, 1fr);
}

.button-row.operator-row {
  grid-template-columns: repeat(4, 1fr);
}

.button-row.calculare-row {
  grid-template-columns: 1fr 1fr 2fr;
}

.operator-btn {
  background: #d18c00;
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
  cursor: default;
  opacity: 0.6;
}

.equals-btn:active:not(:disabled) {
  transform: translateY(0);
}

.roman-btn {
  background: #2D4A22;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.75rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'JetBrains Mono', monospace;
}

.roman-btn:hover {
  background: #3a5a2a;
  transform: translateY(-1px);
}

.roman-btn:active {
  transform: translateY(0);
}

.roman-btn:disabled {
  /* background: #6c757d; */
  cursor: default;
  opacity: 0.9;
  transform: none;
}

.roman-btn:disabled:hover {
  background: #6c757d;
  transform: none;
}

.copy-btn {
  background: #17a2b8;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: 'JetBrains Mono', monospace;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.copy-btn:hover:not(:disabled) {
  background: #138496;
  transform: translateY(-1px);
}

.copy-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  opacity: 0.6;
}

.copy-btn:active:not(:disabled) {
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
  .equals-btn,
  .copy-btn {
    padding: 0.75rem;
    font-size: 1rem;
  }
  
  .roman-btn {
    padding: 0.5rem;
    font-size: 0.9rem;
  }
  
  .button-row.roman-numerals-row {
    gap: 0.25rem;
  }
  
  .button-row.control-row,
  .button-row.operator-row {
    gap: 0.5rem;
  }
}
</style> 