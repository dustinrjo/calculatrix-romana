<template>
  <div class="calculation-history" v-if="history.length > 0">
    <h2 class="history-title">Historia Calculationum</h2>
    <div class="history-list">
      <div 
        v-for="(entry, index) in history" 
        :key="entry.timestamp"
        class="history-entry"
        :class="{ latest: index === 0 }"
      >
        <span class="expression">{{ convertExpressionToRoman(entry.expression) }}</span>
        <span class="equals">=</span>
        <span class="result">{{ formatFraction(entry.result) }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import { toRomanFraction, roundToTwelfths } from '../utils/romanFractions.js'

export default {
  name: 'CalculationHistory',
  props: {
    history: {
      type: Array,
      required: true
    }
  },
  setup() {
    const formatFraction = (num) => {
      if (num === null || num === undefined || isNaN(num)) return ''
      const rounded = roundToTwelfths(num)
      const sign = num < 0 ? '-' : ''
      return sign + toRomanFraction(Math.abs(rounded))
    }

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

    return {
      formatFraction,
      convertExpressionToRoman
    }
  }
}
</script>

<style scoped>
.calculation-history {
  margin-top: 2rem;
  padding: 1.5rem;
  background: #faf8f0;
  border: 2px solid #8B4513;
  border-radius: 8px;
  font-family: 'UnifrakturCook', cursive;
}

.history-title {
  font-size: 1.5rem;
  color: #8B4513;
  text-align: center;
  margin-bottom: 1rem;
  border-bottom: 1px solid #8B4513;
  padding-bottom: 0.5rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 300px;
  overflow-y: auto;
}

.history-entry {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8f4e6;
  border-radius: 4px;
  border: 1px solid #d4c4a8;
  font-size: 1.2rem;
  color: #8B4513;
  justify-content: center;
  flex-wrap: wrap;
}

.history-entry.latest {
  background: #e8f5e8;
  border-color: #228B22;
  animation: highlightNew 1s ease-in-out;
}

.expression, .result {
  font-weight: bold;
  text-align: center;
}

.expression {
  flex: 1;
  word-break: break-all;
}

.equals {
  color: #A0522D;
  font-size: 1rem;
  margin: 0 0.5rem;
}

.result {
  color: #228B22;
  font-size: 1.3rem;
}

@keyframes highlightNew {
  0% {
    background: #32CD32;
    transform: scale(1.02);
  }
  100% {
    background: #e8f5e8;
    transform: scale(1);
  }
}

.history-list::-webkit-scrollbar {
  width: 8px;
}

.history-list::-webkit-scrollbar-track {
  background: #f8f4e6;
  border-radius: 4px;
}

.history-list::-webkit-scrollbar-thumb {
  background: #8B4513;
  border-radius: 4px;
}

.history-list::-webkit-scrollbar-thumb:hover {
  background: #A0522D;
}
</style> 