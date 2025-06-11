<template>
  <div class="calculator">
    <h1 class="title">Calculatrix Romana</h1>
    
    <CalculationHistory :history="calculationHistory" />
    
    <div class="calculator-display">
      <div class="display-screen">
        <div class="previous-result" v-if="previousResult !== null">
          <span class="roman-display">{{ formatNumber(previousResult) }}</span>
          <span class="decimal-display">({{ Math.floor(previousResult) }})</span>
        </div>
        
        <div class="current-input">
          <input 
            ref="displayInput"
            v-model="displayValue" 
            type="text" 
            readonly
            class="display-input"
            placeholder="NIHIL"
          />
        </div>
      </div>
    </div>

    <div class="input-section">
      <div class="number-input">
        <label>Numerus:</label>
        <input 
          ref="numberInput"
          v-model="currentInput" 
          type="text" 
          inputmode="numeric"
          pattern="[0-9]*"
          @input="updateDisplay"
          placeholder="Scribe numerum..."
        />
      </div>
    </div>

    <div class="calculator-buttons">
      <div class="button-row">
        <button @click="selectOperation('^')" class="operator-btn" :class="{ active: pendingOperation === '^' }">^</button>
        <button @click="selectOperation('/')" class="operator-btn" :class="{ active: pendingOperation === '/' }">÷</button>
        <button @click="selectOperation('*')" class="operator-btn" :class="{ active: pendingOperation === '*' }">×</button>
        <button @click="selectOperation('-')" class="operator-btn" :class="{ active: pendingOperation === '-' }">−</button>
      </div>
      
      <div class="button-row">
        <button @click="selectOperation('+')" class="operator-btn" :class="{ active: pendingOperation === '+' }">+</button>
        <button @click="clearAll" class="clear-all-btn">AC</button>
        <button @click="clearCurrent" class="clear-btn">C</button>
        <button @click="calculate" class="equals-btn">Computare</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onUnmounted } from 'vue'
import { formatNumber } from '../utils/romanNumerals.js'
import { createCalculationEntry, getOperatorSymbol } from '../utils/calculator.js'
import { roundToTwelfths, toRomanFraction } from '../utils/romanFractions.js'
import CalculationHistory from './CalculationHistory.vue'

export default {
  name: 'Calculator',
  components: {
    CalculationHistory
  },
  setup() {
    // Calculator state
    const currentInput = ref('')
    const previousResult = ref(null)
    const pendingOperation = ref('')
    const operand1 = ref(null)
    const calculationHistory = ref([])
    const displayInput = ref(null)
    const numberInput = ref(null)
    
    // Calculator modes
    const calculatorState = ref('input') // 'input', 'operation', 'result'

    const displayValue = computed(() => {
      if (pendingOperation.value && operand1.value !== null) {
        // Show the operand and operation: "XIV +"
        const operatorSymbol = getOperatorSymbol(pendingOperation.value)
        const rounded = roundToTwelfths(operand1.value)
        const sign = operand1.value < 0 ? '-' : ''
        const romanValue = sign + toRomanFraction(Math.abs(rounded))
        return `${romanValue} ${operatorSymbol}`
      } else if (currentInput.value) {
        const num = parseFloat(currentInput.value)
        if (!isNaN(num)) {
          const rounded = roundToTwelfths(num)
          const sign = num < 0 ? '-' : ''
          return sign + toRomanFraction(Math.abs(rounded))
        }
      } else if (previousResult.value !== null) {
        const rounded = roundToTwelfths(previousResult.value)
        const sign = previousResult.value < 0 ? '-' : ''
        return sign + toRomanFraction(Math.abs(rounded))
      }
      return ''
    })

    const updateDisplay = (event) => {
      // Only allow numeric input (including decimals and negative numbers at start)
      const value = event.target.value
      const numericValue = value.replace(/[^0-9.-]/g, '')
      
      // Prevent multiple decimals
      const parts = numericValue.split('.')
      if (parts.length > 2) {
        parts.splice(2)
        event.target.value = parts.join('.')
        currentInput.value = parts.join('.')
        return
      }
      
      // Only allow one negative sign at the beginning
      const negativeCount = (numericValue.match(/-/g) || []).length
      if (negativeCount > 1 || (negativeCount === 1 && !numericValue.startsWith('-'))) {
        const cleanValue = negativeCount === 1 && numericValue.startsWith('-') 
          ? '-' + numericValue.replace(/-/g, '')
          : numericValue.replace(/-/g, '')
        event.target.value = cleanValue
        currentInput.value = cleanValue
        return
      }
      
      if (value !== numericValue) {
        event.target.value = numericValue
        currentInput.value = numericValue
      }
    }

    const selectOperation = (operation) => {
      if (currentInput.value) {
        // If we have current input, use it as operand1
        const num = parseFloat(currentInput.value)
        if (!isNaN(num)) {
          operand1.value = num
          pendingOperation.value = operation
          previousResult.value = null // Clear previous result when setting new operation
          currentInput.value = ''
          calculatorState.value = 'operation'
          focusNumberInput()
        }
      } else if (previousResult.value !== null) {
        // Use previous result as operand1
        operand1.value = previousResult.value
        pendingOperation.value = operation
        previousResult.value = null // Clear to show operation state
        calculatorState.value = 'operation'
        focusNumberInput()
      }
    }

    const calculate = () => {
      if (pendingOperation.value && operand1.value !== null && currentInput.value) {
        const operand2 = parseFloat(currentInput.value)
        if (isNaN(operand2)) return

        let result = null
        
        switch (pendingOperation.value) {
          case '+':
            result = operand1.value + operand2
            break
          case '-':
            result = operand1.value - operand2
            break
          case '*':
            result = operand1.value * operand2
            break
          case '/':
            result = operand2 !== 0 ? operand1.value / operand2 : null
            break
          case '^':
            result = Math.pow(operand1.value, operand2)
            break
        }

        if (result !== null) {
          // Round result to nearest 12th for Roman fraction system
          const roundedResult = roundToTwelfths(result)
          
          // Add to history
          const entry = createCalculationEntry(
            operand1.value,
            pendingOperation.value,
            operand2,
            roundedResult
          )
          
          calculationHistory.value.unshift(entry)
          
          // Update state
          previousResult.value = roundedResult
          currentInput.value = ''
          operand1.value = null
          pendingOperation.value = ''
          calculatorState.value = 'result'
          
          focusNumberInput()
        }
      } else if (currentInput.value && !pendingOperation.value) {
        // Just confirm the current input
        const num = parseFloat(currentInput.value)
        if (!isNaN(num)) {
          previousResult.value = num
          currentInput.value = ''
          calculatorState.value = 'result'
          focusNumberInput()
        }
      }
    }

    const handleEnter = () => {
      if (pendingOperation.value && currentInput.value) {
        calculate()
      } else if (currentInput.value) {
        const num = parseFloat(currentInput.value)
        if (!isNaN(num)) {
          previousResult.value = num
          currentInput.value = ''
          calculatorState.value = 'result'
        }
      }
    }

    const clearCurrent = () => {
      currentInput.value = ''
      focusNumberInput()
    }

    const clearAll = () => {
      currentInput.value = ''
      previousResult.value = null
      pendingOperation.value = ''
      operand1.value = null
      calculatorState.value = 'input'
      calculationHistory.value = [] // Clear history too
      focusNumberInput()
    }

    const focusNumberInput = () => {
      setTimeout(() => {
        if (numberInput.value) {
          numberInput.value.focus()
        }
      }, 0)
    }

    // Keyboard event handler
    const handleKeyDown = (event) => {
      switch (event.key) {
        case '+':
        case '-':
        case '*':
        case '/':
        case '^':
          event.preventDefault()
          selectOperation(event.key)
          break
        case 'Enter':
        case '=':
          event.preventDefault()
          if (pendingOperation.value && currentInput.value) {
            calculate()
          } else if (currentInput.value) {
            handleEnter()
          }
          break
        case 'Escape':
          event.preventDefault()
          clearAll()
          break
        case 'Backspace':
          if (event.target === numberInput.value && currentInput.value === '') {
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
          event.preventDefault()
          clearCurrent()
          break
      }
    }

    // Add global keyboard listener
    const addKeyboardListeners = () => {
      document.addEventListener('keydown', handleKeyDown)
    }

    const removeKeyboardListeners = () => {
      document.removeEventListener('keydown', handleKeyDown)
    }

    // Auto-focus on mount and add keyboard listeners
    setTimeout(() => {
      focusNumberInput()
      addKeyboardListeners()
    }, 100)

    // Cleanup on unmount
    onUnmounted(() => {
      removeKeyboardListeners()
    })

    return {
      currentInput,
      previousResult,
      pendingOperation,
      calculationHistory,
      displayInput,
      numberInput,
      displayValue,
      updateDisplay,
      selectOperation,
      calculate,
      handleEnter,
      clearCurrent,
      clearAll,
      formatNumber
    }
  }
}
</script>

<style scoped>
.calculator {
  max-width: 500px;
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
}

.display-screen {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 80px;
}

.previous-result {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.9rem;
  color: #888;
  min-height: 24px;
}

.roman-display {
  color: #B8860B;
  font-weight: 600;
}

.decimal-display {
  color: #888;
  font-size: 0.8rem;
}

.current-input {
  display: flex;
  align-items: center;
}

.display-input {
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 1.8rem;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  width: 100%;
  text-align: right;
}

.display-input::placeholder {
  color: #555;
}

.input-section {
  margin-bottom: 1.5rem;
}

.number-input {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.number-input label {
  font-size: 1rem;
  color: #2D4A22;
  font-weight: 600;
}

.number-input input {
  padding: 1rem;
  font-size: 1.2rem;
  border: 2px solid #4A6741;
  border-radius: 6px;
  background: #f8faf6;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 500;
}

.number-input input:focus {
  outline: none;
  border-color: #2D4A22;
  box-shadow: 0 0 8px rgba(45, 74, 34, 0.2);
}

.number-input input::placeholder {
  color: #999;
  font-style: italic;
}

/* Remove number input spinners */
.number-input input::-webkit-outer-spin-button,
.number-input input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.number-input input[type=text] {
  -moz-appearance: textfield;
}

.calculator-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.button-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.calculator-buttons button {
  padding: 1rem;
  font-size: 1.1rem;
  font-family: 'JetBrains Mono', monospace;
  font-weight: 600;
  border: 2px solid;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  min-height: 60px;
}

.clear-all-btn {
  background: #EF4444;
  color: white;
  border-color: #EF4444;
}

.clear-all-btn:hover {
  background: #DC2626;
  border-color: #DC2626;
}

.clear-btn {
  background: #F97316;
  color: white;
  border-color: #F97316;
}

.clear-btn:hover {
  background: #EA580C;
  border-color: #EA580C;
}

.operator-btn {
  background: #3B82F6;
  color: white;
  border-color: #3B82F6;
}

.operator-btn:hover {
  background: #2563EB;
  border-color: #2563EB;
}

.operator-btn.active {
  background: #1D4ED8;
  border-color: #1D4ED8;
  box-shadow: 0 0 8px rgba(29, 78, 216, 0.4);
}

.equals-btn {
  background: #22C55E;
  color: white;
  border-color: #22C55E;
}

.equals-btn:hover {
  background: #16A34A;
  border-color: #16A34A;
}

/* Calculator button special layouts */
.button-row:last-child .equals-btn {
  grid-column: span 1;
}

/* Responsive design */
@media (max-width: 768px) {
  .calculator {
    padding: 1rem;
    max-width: 100%;
  }
  
  .calculator-buttons button {
    padding: 0.8rem;
    font-size: 1rem;
    min-height: 50px;
  }
  
  .display-input {
    font-size: 1.5rem;
  }
  
  .button-row {
    gap: 0.5rem;
  }
  
  .calculator-buttons {
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .display-input {
    font-size: 1.2rem;
  }
  
  .calculator-buttons button {
    padding: 0.6rem;
    font-size: 0.9rem;
    min-height: 45px;
  }
}
</style> 