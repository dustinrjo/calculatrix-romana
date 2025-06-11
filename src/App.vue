<template>
  <div id="app">
    <Calculator />
  </div>
</template>

<script>
import Calculator from './components/Calculator.vue'

export default {
  name: 'App',
  components: {
    Calculator
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  background: linear-gradient(135deg, #f0f8ea 0%, #e8f4e1 100%);
  min-height: 100vh;
  font-family: 'JetBrains Mono', monospace;
}

#app {
  min-height: 100vh;
  padding: 2rem 1rem;
}

/* Global utilities for Roman numeral display */
.roman-large {
  font-size: 2rem;
  font-weight: bold;
  color: #8B4513;
}

.roman-medium {
  font-size: 1.5rem;
  color: #8B4513;
}

.roman-small {
  font-size: 1rem;
  color: #A0522D;
}

/* Responsive design */
@media (max-width: 768px) {
  #app {
    padding: 1rem 0.5rem;
  }
}
</style> 