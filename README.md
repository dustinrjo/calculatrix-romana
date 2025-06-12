# Calculatrix Romana

A minimalist calculator application with a Latin interface and Roman numeral display. Built with Vue.js and featuring a classical aesthetic inspired by ancient Roman mathematical practices.

## Features

- **Roman Numeral Display**: All numbers are converted to and displayed as Roman numerals
- **Latin Interface**: Complete user interface in Latin for an authentic classical experience
- **Calculation History**: Track your mathematical operations with full history display
- **Large Number Support**: Handles numbers up to 100,000+ with proper Roman numeral conversion
- **Minimalist Design**: Clean, classical aesthetic using the UnifrakturCook font
- **Keyboard Navigation**: Full keyboard support for efficient calculation workflows

## Demo

🚀 **Live Demo**: [https://dustinrjo.github.io/calculatrix-romana/](https://dustinrjo.github.io/calculatrix-romana/)


## Technical Details

### Roman Numeral Conversion
The application supports Roman numerals up to 399,999 using standard notation including vinculum (overline) notation for larger numbers:
- Basic numerals: I, V, X, L, C, D, M
- Subtractive notation: IV, IX, XL, XC, CD, CM
- Large numbers with vinculum: V̄ (5,000), X̄ (10,000), L̄ (50,000), C̄ (100,000)

### Latin Interface Elements
- **Numerus**: Number Input
- **Computare**: Calculate/Equals
- **C**: Clear Current Input
- **AC**: All Clear (resets calculator and clears history)
- **Historia Calculationum**: Calculation History
- **Operation Buttons**: +, −, ×, ÷, ^ with Latin hover text

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/dustinrjo/calculatrix-romana.git
cd calculatrix-romana
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run test` - Run unit tests

## Usage

The calculator works exactly like the macOS/iOS calculator, but with Latin labels and Roman numeral display:

1. **Enter Number**: Type a number in the "Numerus" field (e.g., 745)
2. **Select Operation**: Click an operator button (+, −, ×, ÷, ^) 
3. **Enter Second Number**: Type the second number
4. **Calculate**: Click "Computare" or press Enter
5. **View Result**: The result appears in the display in Roman numerals (e.g., MDXCI) with decimal (1591)
6. **Chain Operations**: After calculating, press an operator to use the result in the next calculation
7. **Clear**: Use "C" to clear current input or "AC" to clear everything
8. **View History**: All calculations are shown above the display

### Calculator Flow Example
```
Type: 14 → Press - → Display shows: XIV −
Type: 4 → Press Enter → Display shows: X (result: 10)
Press × → Display shows: X ×  
Type: 2 → Press Enter → Display shows: XX (result: 20)
```

The display always shows the intermediate state with the operator, so you know exactly what calculation will be performed.

### Keyboard Shortcuts
- **Numbers**: Type directly into the Numerus field
- **Operations**: Press `+`, `-`, `*`, `/`, `^` keys
- **Calculate**: Press `Enter` 
- **Clear Input**: Press `C` or `Backspace` (when input is empty)
- **Clear All**: Press `Escape` (resets calculator and clears history)
- **Focus**: Calculator automatically focuses on number input

### Supported Operations
- Addition: + (addere)
- Subtraction: − (subtrahere)
- Multiplication: × (multiplicare)
- Division: ÷ (dividere)
- Exponentiation: ^ (potentia)

## Architecture & Extensibility

The application is designed with modularity and extensibility in mind:

### Core Components
- `Calculator.vue` - Main calculator interface with single expression input
- `CalculationHistory.vue` - History display component
- `romanNumerals.js` - Roman numeral conversion utilities
- `calculator.js` - Mathematical operation utilities
- `expressionParser.js` - Expression parsing and evaluation logic

### Future Extensions
The codebase is structured to easily accommodate:
- Roman numeral input interface (keyboard input of I, V, X, etc.)
- Additional mathematical operations
- Number system conversions
- Enhanced calculation history features
- User preferences and settings

## Testing

The application includes comprehensive unit tests for the Roman numeral conversion logic:

```bash
npm run test
```

Test coverage includes:
- Basic numeral conversion (1-1000)
- Subtractive notation (4, 9, 40, 90, etc.)
- Large numbers with vinculum notation
- Edge cases and error handling
- Round-trip conversion validation

## Deployment

### GitHub Pages Deployment

1. Build the application:
```bash
npm run build
```

2. Deploy to GitHub Pages:
   - Push your code to GitHub
   - Go to Settings > Pages in your repository
   - Select "Deploy from a branch"
   - Choose the `gh-pages` branch (created by GitHub Actions)
   - Your app will be available at `https://dustinrjo.github.io/calculatrix-romana/`

### Manual Deployment
The `dist` folder contains all production files and can be deployed to any static hosting service.

## Contributing

We welcome contributions to improve Calculatrix Romana! Here's how you can help:

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the coding standards:
   - Use 2 spaces for indentation (no tabs)
   - Prefer functional programming patterns
   - Write comprehensive tests for new features
4. Run tests: `npm run test`
5. Commit your changes: `git commit -m 'Add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Coding Standards
- **Language**: JavaScript (ES6+), avoid TypeScript
- **Formatting**: 2 spaces, no tabs
- **Architecture**: Functional programming preferred over classes
- **Testing**: Write tests for all new functionality
- **Documentation**: Update README for significant changes

### Areas for Contribution
- Roman numeral input interface
- Additional mathematical operations (square root, exponents, etc.)
- Improved error handling and validation
- Enhanced responsive design
- Performance optimizations
- Accessibility improvements
- Internationalization (other classical languages)

## Browser Support

- Chrome/Chromium 80+
- Firefox 75+
- Safari 13+
- Edge 80+

*Note: The JetBrains Mono font provides excellent readability for mathematical expressions*

## License

This software is distributed uner the Modified YOLOv3 [LICENSE](LICENSE.md) file for details.

## Acknowledgments

- Roman numeral system based on classical Latin notation
- JetBrains Mono font from Google Fonts
- Vue.js for the reactive framework
- Vite for build tooling and development experience

---

**Calculatrix Romana** - *Computatio Classica Moderna* (Classical Computing, Modern Style) 