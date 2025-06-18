<template>
  <div class="calculator">
    <h1 class="calculator-header">Calculatrix Romana</h1>
    
    <!-- <CalculationHistory :history="calculationHistory" /> -->
    
    <!-- Calculator Display (clickable to focus input) -->
    <div class="display" @click="focusExpressionInput">
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

    <div class="button-grid">
      <!-- Top control row: AC, C, Copia, ^ -->
      <div class="button-row control-row">
        <button class="ac-btn control-btn" @click="clearAll">AC</button>
        <button class="c-btn control-btn" @click="clearCurrent">C</button>
        <button class="copia-btn control-btn" @click="copyToClipboard" :disabled="!canCopy">Copia</button>
        <button class="operator-btn control-btn" @click="addToExpression('^')">^</button>
      </div>

      <!-- Roman and operator buttons -->
      <div class="button-row roman-numerals-row">
        <button class="roman-btn" @click="addRomanNumeral('M')" :disabled="!romanButtonStates.M">M</button>
        <button class="roman-btn" @click="addRomanNumeral('D')" :disabled="!romanButtonStates.D">D</button>
        <button class="roman-btn" @click="addRomanNumeral('C')" :disabled="!romanButtonStates.C">C</button>
        <button class="roman-btn" @click="addRomanNumeral('L')" :disabled="!romanButtonStates.L">L</button>
      </div>
      <div class="button-row roman-numerals-row">
        <button class="roman-btn" @click="addRomanNumeral('VII')" :disabled="!romanButtonStates.VII">VII</button>
        <button class="roman-btn" @click="addRomanNumeral('VIII')" :disabled="!romanButtonStates.VIII">VIII</button>
        <button class="roman-btn" @click="addRomanNumeral('IX')" :disabled="!romanButtonStates.IX">IX</button>
        <button class="roman-btn" @click="addRomanNumeral('X')" :disabled="!romanButtonStates.X">X</button>
      </div>
      <div class="button-row roman-numerals-row">
        <button class="roman-btn" @click="addRomanNumeral('IV')" :disabled="!romanButtonStates.IV">IV</button>
        <button class="roman-btn" @click="addRomanNumeral('V')" :disabled="!romanButtonStates.V">V</button>
        <button class="roman-btn" @click="addRomanNumeral('VI')" :disabled="!romanButtonStates.VI">VI</button>
        <button class="operator-btn" @click="addToExpression('+')">+</button>
      </div>
      <div class="button-row roman-numerals-row">
        <button class="roman-btn" @click="addRomanNumeral('I')" :disabled="!romanButtonStates.I">I</button>
        <button class="roman-btn" @click="addRomanNumeral('II')" :disabled="!romanButtonStates.II">II</button>
        <button class="roman-btn" @click="addRomanNumeral('III')" :disabled="!romanButtonStates.III">III</button>
        <button class="operator-btn" @click="addToExpression('-')">−</button>
      </div>
      <!-- Operator row: *, /, Computare (2 columns) -->
      <div class="button-row operator-row">
        <button class="operator-btn" @click="addToExpression('*')">×</button>
        <button class="operator-btn" @click="addToExpression('/')">÷</button>
        <button class="computare-btn" @click="calculate" :disabled="!isValidExpression" style="grid-column: span 2;">Computare</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { roundToTwelfths, toRomanFraction } from '../utils/romanFractions.js'
import { parseExpression, isValidExpression as validateExpression } from '../utils/expressionParser.js'
import { parseMixedInput, parseForKeyboard, isRomanChar, canAddRomanChar, getCurrentBuildingSequence, getValidNextRomanChars, canAddRomanNumeral } from '../utils/romanInput.js'
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
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=UnifrakturMaguntia&display=swap');

body {
  background: #fff;
}

.calculator {
  background: #f8f5e3;
  border: 2.5px solid #000;
  border-radius: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  padding: 1.5rem;
  max-width: 400px;
  margin: 2rem auto;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  color: #2d1812;
}

.calculator-header {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #2d1812;
  font-family: 'UnifrakturMaguntia', 'Times New Roman', serif;
  font-size: 2rem;
  letter-spacing: 0.05em;
}

.display {
  background: #1a1a1a;
  border: 2.5px solid #000;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  min-height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: text;
  transition: border-color 0.2s;
}

.display:hover {
  border-color: #5a7751;
}

.display:focus-within {
  border-color: #2D4A22;
  box-shadow: 0 0 8px rgba(45, 74, 34, 0.3);
}

.display-screen {
  color: #f8f5e3;
  font-size: 1.8rem;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
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

.display .validation-indicator {
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

.display .validation-indicator.valid {
  background: #28a745;
  color: white;
}

.display .validation-indicator.invalid {
  background: #dc3545;
  color: white;
}

.previous-calculation {
  position: absolute;
  top: 0.5rem;
  left: 0.75rem;
  font-size: 0.8rem;
  color: #e6e0c3;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  max-width: calc(100% - 3rem);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.button-grid {
  display: grid;
  gap: 1rem;
}

.button-row {
  display: grid;
  gap: 1rem;
}

.button-row.roman-numerals-row {
  grid-template-columns: repeat(4, 1fr);
}

.button-row.control-row {
  grid-template-columns: repeat(4, 1fr);
  gap: 0.7rem;
}

.button-row.control-row .control-btn {
  font-size: 0.95rem;
  padding: 0.6rem 0.2rem;
}

.button-row.operator-row {
  grid-template-columns: 1fr 1fr 2fr;
  gap: 1rem;
}

.button-row.computare-row {
  grid-template-columns: 1fr;
  margin-top: 1rem;
}

button {
  background: #2d1812;
  color: #f8f5e3;
  border: 2.5px solid #000;
  border-radius: 6px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: box-shadow 0.1s, transform 0.1s, background 0.15s;
  position: relative;
  box-shadow: 0 4px 0 #000, 0 6px 12px rgba(0,0,0,0.18);
  margin: 0.3rem;
  padding: 0.85rem 0.6rem;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

button:active {
  box-shadow: 0 1px 0 #000, 0 2px 4px rgba(0,0,0,0.18) inset;
  background: #1a0e0a;
  transform: translateY(2px);
}

button:hover:not(:disabled) {
  background: #3a211a;
  border-color: #000;
}

button:disabled {
  background: #bdbdbd;
  border-color: #888;
  color: #888;
  cursor: not-allowed;
  box-shadow: none;
  transform: none;
}

.ac-btn {
  background: #e53935;
  color: #fff;
  font-weight: bold;
  border: 2.5px solid #b71c1c;
  font-family: 'UnifrakturMaguntia', 'Times New Roman', serif;
}

.c-btn {
  background: #757575;
  color: #fff;
  font-weight: bold;
  border: 2.5px solid #424242;
  font-family: 'UnifrakturMaguntia', 'Times New Roman', serif;
}

.copia-btn {
  background: #00acc1;
  color: #fff;
  font-weight: bold;
  border: 2.5px solid #006064;
  font-family: 'UnifrakturMaguntia', 'Times New Roman', serif;
}

.copia-btn:disabled {
  background: #bdbdbd;
  border-color: #888;
  color: #888;
}

.roman-btn {
  font-family: 'Times New Roman', serif;
  font-size: 1.2rem;
  letter-spacing: 0.05em;
  background: #264d1a;
  color: #f8f5e3;
}

.operator-btn {
  background: #e09c1b;
  color: #fff;
  font-weight: bold;
  font-size: 1.3rem;
  border: 2.5px solid #b77c0c;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
}

.operator-btn:hover:not(:disabled) {
  background: #f2b84b;
  border-color: #b77c0c;
}

.computare-btn {
  background: #757575;
  color: #fff;
  font-weight: bold;
  border: 2.5px solid #424242;
  font-size: 1.2rem;
  width: 100%;
  margin: 0.3rem 0 0 0;
  padding: 1rem 0;
  font-family: 'UnifrakturMaguntia', 'Times New Roman', serif;
}

.computare-btn:disabled {
  background: #bdbdbd;
  border-color: #888;
  color: #888;
}

@media (max-width: 480px) {
  .calculator {
    margin: 1rem;
    padding: 1rem;
  }
  .calculator-header {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
  .display {
    font-size: 1.2rem;
    padding: 0.75rem;
    margin-bottom: 1rem;
  }
  .button-grid {
    gap: 0.7rem;
  }
  .button-row {
    gap: 0.7rem;
  }
  button {
    padding: 0.6rem;
    font-size: 1rem;
  }
  .roman-btn {
    font-size: 1.1rem;
    padding: 0.6rem 0.4rem;
  }
  .operator-btn {
    font-size: 1.2rem;
  }
  .computare-btn {
    font-size: 1.1rem;
    padding: 0.8rem 0;
  }
  .button-row.control-row .control-btn {
    font-size: 0.85rem;
    padding: 0.5rem 0.1rem;
  }
}
</style> 