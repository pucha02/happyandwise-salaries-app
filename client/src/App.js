import './App.css';
import SalaryCalculator from './components/SalaryCalculator';
import SalaryCalculatorWithLocalStorage from './components/SalaryCalculatorWithLocalStorage';

function App() {
  return (
    <div className="App">
      <SalaryCalculatorWithLocalStorage/>
    </div>
  );
}

export default App;
