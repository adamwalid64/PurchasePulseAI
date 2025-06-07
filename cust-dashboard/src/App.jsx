import { useEffect, useState } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import {
  PieChart, Pie, Cell, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

function App() {
  const [formData, setFormData] = useState({
    age: '',
    purchases: '',
    loyalty: '',
    discounts: ''
  });

  const [prediction, setPrediction] = useState(null);
// Animation use state
  const [animationKey, setAnimationKey] = useState(0);
  const [performanceData, setPerformanceData] = useState([]);
  const [featureImportance, setFeatureImportance] = useState([]);
  // use state for loyalty custom error ('not 0 or 1')
  const [loyaltyError, setLoyaltyError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const age = Number(formData.age);
    const purchases = Number(formData.purchases);
    const loyalty = Number(formData.loyalty);
    const discounts = Number(formData.discounts);
  
    if (loyalty !== 0 && loyalty !== 1) {
      setLoyaltyError('Loyalty must be 0 or 1.');
      return;
    } else {
      setLoyaltyError('');
    }
  
    const lp_discounts = loyalty * discounts;
    const features = [age, purchases, loyalty, discounts, lp_discounts];
  
    try {
      const res = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ features })
      });
  
      const data = await res.json();
      setPrediction(data.prediction);
      setAnimationKey(prev => prev + 1);
    } catch (err) {
      console.error(err);
      alert('Prediction request failed');
    }
  };

  useEffect(() => {
    fetch('http://localhost:5000/performance')
      .then(res => res.json())
      .then(data => {
        const chartData = [
          { name: 'True Positives', value: data.TP },
          { name: 'True Negatives', value: data.TN },
          { name: 'False Positives', value: data.FP },
          { name: 'False Negatives', value: data.FN }
        ];
        setPerformanceData(chartData);
      })
      .catch(err => {
        console.error('Failed to fetch model performance:', err);
      });

    fetch('http://localhost:5000/importance')
      .then(res => res.json())
      .then(data => setFeatureImportance(data))
      .catch(err => {
        console.error('Failed to fetch feature importance:', err);
      });
  }, []);

  return (
    <div className="app-container">
      <div className="header-container text-center mb-3">
        <h1 id="title" className="archivo-black-regular">PurchasePulse</h1>
        <p className="text-muted project-description">
        Enter customer information to see the likelihood of a repeat purchase, predicted by a logistic regression model with 75% accuracy. The results can help highlight factors related to customer retention.
        </p>
      </div>

      <div className="d-flex justify-content-center">
      <div className="d-flex flex-column flex-md-row flex-wrap gap-4 align-items-stretch" style={{ width: '100%', maxWidth: '1200px' }}>
          {/* Left Card */}
          <div className="card custom-card shadow-sm p-4 d-flex flex-column border border-dark" style={{ flex: '1 1 0', minWidth: '350px' }}>
            <form onSubmit={handleSubmit} className="form-container archivo-black-regular">
              <h4 className="fw-bold mb-3 text-center archivo-black-regular">Enter custom data points</h4>
              <div className="mb-3">
                <label className="form-label">Age</label>
                <input type="number" className="form-control" name="age" value={formData.age}
                  onChange={handleChange} placeholder="Enter age" required />
              </div>
              <div className="mb-3">
                <label className="form-label">Number of Purchases</label>
                <input type="number" className="form-control" name="purchases" value={formData.purchases}
                  onChange={handleChange} placeholder="Enter total purchases" required />
              </div>
              <div className="mb-3">
              <label className="form-label">Loyalty Program</label>
              <select
                className="form-select text-muted"
                name="loyalty"
                value={formData.loyalty}
                onChange={handleChange}
                required
              >
                <option value="">Select...</option>
                <option value="1">Yes</option>
                <option value="0">No</option>
              </select>
              {loyaltyError && (
                <div className="text-danger small mt-1">{loyaltyError}</div>
              )}
            </div>
              <div className="mb-3">
                <label className="form-label">Discounts Used</label>
                <input type="number" className="form-control" name="discounts" value={formData.discounts}
                  onChange={handleChange} placeholder="How many discounts used" required />
              </div>
              {
              <button
                    type="submit"
                    className="predict-btn text-white fw-bold py-2 px-4 rounded archivo-black-regular"
                  >
                    Predict
              </button>
              /* <button
                type="submit"
                className="w-100 text-white fw-bold py-2 px-3 rounded"
                style={{ backgroundColor: "#8884d8", border: 'none' }}
              >
                Predict
              </button> */}
            </form>

            {prediction !== null && (
              <div
                key={`prediction-${animationKey}`}
                className={`mt-4 p-3 rounded text-center fw-bold animated-result ${
                  prediction === 1 ? 'bg-success text-white' : 'bg-danger text-white'
                }`}
              >
                {prediction === 1
                  ? '✅ The customer purchases!'
                  : '❌ The customer does not purchase.'}
              </div>
            )}

            
            <div className="mt-4">
              <h6 className="fw-bold text-center mb-3 archivo-black-regular">📊 Model Performance</h6>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    dataKey="value"
                    data={performanceData}
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label
                  >
                    <Cell fill="#A0E7A0" />
                    <Cell fill="#66D9A0" />
                    <Cell fill="#FFB3B3" />
                    <Cell fill="#FF8A8A" />
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* Right Card */}
          <div className="card custom-card shadow-sm p-4 d-flex flex-column border border-dark" style={{ flex: '1 1 0', minWidth: '400px' }}>
            <div className="scroll-area flex-grow-1">
              <h6 className="fw-bold mb-3 text-center archivo-black-regular" >🔍 Sneak Peek: Dataset Sample</h6>
              <div
                className="table-responsive"
                style={{
                  maxHeight: '300px',
                  overflowY: 'auto',
                  overflowX: 'auto',
                  width: '100%',
                }}
              >
                <table className="table table-sm table-bordered text-center w-100">
                  <thead className="table-light">
                    <tr>
                      <th>Age</th><th>Gender</th><th>Income</th><th>Purchases</th><th>Category</th>
                      <th>Time</th><th>Loyalty</th><th>Discounts</th><th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td>40</td><td>1</td><td>66120</td><td>8</td><td>0</td><td>30.6</td><td>0</td><td>5</td><td>1</td></tr>
                    <tr><td>20</td><td>1</td><td>23580</td><td>4</td><td>2</td><td>38.2</td><td>0</td><td>5</td><td>0</td></tr>
                    <tr><td>27</td><td>1</td><td>127821</td><td>11</td><td>2</td><td>31.6</td><td>1</td><td>0</td><td>1</td></tr>
                    <tr><td>24</td><td>1</td><td>137799</td><td>19</td><td>3</td><td>46.2</td><td>0</td><td>4</td><td>1</td></tr>
                    <tr><td>31</td><td>1</td><td>99301</td><td>19</td><td>1</td><td>19.8</td><td>0</td><td>0</td><td>1</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-5 feature-imp-container">
                <h6 className="fw-bold text-center mb-3 archivo-black-regular">📈 Feature Importance</h6>
                <p className='archivo-black-regular'>
                  Feature importance is calculated by analyzing the coefficients of the independent variables. These coefficients are derived by minimizing binary cross-entropy loss using the gradient descent algorithm.
                </p>
                  <div className="feature-chart-responsive" style={{ overflowX: 'auto' }}>
                    <div style={{ minWidth: '300px', height: '250px' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={featureImportance}
                          layout="vertical"
                          margin={{ top: 0, right: 10, bottom: 0, left: 10 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="name" />
                          <Tooltip />
                          <Bar dataKey="value" fill="#8884d8" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-light text-center text-muted border-top mt-5 py-3 w-100 archivo-black-regular border border-dark">
        <div>
          <p className="mb-1">Created by <strong>Adam Walid</strong></p>
          <p className="mb-1">
            <a
              href="https://github.com/adamwalid64"
              className="text-decoration-none me-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            |
            <a
              href="https://www.linkedin.com/in/adamwalid/"
              className="text-decoration-none ms-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              LinkedIn
            </a>
          </p>
          <p className="mb-0">
            Dataset by{" "}
            <p
              
            >
              Rabie El Kharoua
            </p>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;





// import { useEffect, useState } from 'react';
// import './App.css';
// import 'bootstrap/dist/css/bootstrap.min.css';

// import {
//   PieChart, Pie, Cell, Legend,
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
// } from 'recharts';

// function App() {
//   const [formData, setFormData] = useState({
//     age: '',
//     purchases: '',
//     loyalty: '',
//     discounts: ''
//   });

//   const [prediction, setPrediction] = useState(null);
// // Animation use state
//   const [animationKey, setAnimationKey] = useState(0);
//   const [performanceData, setPerformanceData] = useState([]);
//   const [featureImportance, setFeatureImportance] = useState([]);
//   // use state for loyalty custom error ('not 0 or 1')
//   const [loyaltyError, setLoyaltyError] = useState('');

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
  
//     const age = Number(formData.age);
//     const purchases = Number(formData.purchases);
//     const loyalty = Number(formData.loyalty);
//     const discounts = Number(formData.discounts);
  
//     if (loyalty !== 0 && loyalty !== 1) {
//       setLoyaltyError('Loyalty must be 0 or 1.');
//       return;
//     } else {
//       setLoyaltyError('');
//     }
  
//     const lp_discounts = loyalty * discounts;
//     const features = [age, purchases, loyalty, discounts, lp_discounts];
  
//     try {
//       const res = await fetch('http://localhost:5000/predict', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ features })
//       });
  
//       const data = await res.json();
//       setPrediction(data.prediction);
//       setAnimationKey(prev => prev + 1);
//     } catch (err) {
//       console.error(err);
//       alert('Prediction request failed');
//     }
//   };

//   useEffect(() => {
//     fetch('http://localhost:5000/performance')
//       .then(res => res.json())
//       .then(data => {
//         const chartData = [
//           { name: 'True Positives', value: data.TP },
//           { name: 'True Negatives', value: data.TN },
//           { name: 'False Positives', value: data.FP },
//           { name: 'False Negatives', value: data.FN }
//         ];
//         setPerformanceData(chartData);
//       })
//       .catch(err => {
//         console.error('Failed to fetch model performance:', err);
//       });

//     fetch('http://localhost:5000/importance')
//       .then(res => res.json())
//       .then(data => setFeatureImportance(data))
//       .catch(err => {
//         console.error('Failed to fetch feature importance:', err);
//       });
//   }, []);

//   return (
//     <div className="app-container">
//       <div className="header-container text-center mb-3">
//         <h1 id="title" className="archivo-black-regular">PurchasePulse</h1>
//         <p className="text-muted project-description">
//         Enter customer information to see the likelihood of a repeat purchase, predicted by a logistic regression model with 75% accuracy. The results can help highlight factors related to customer retention.
//         </p>
//       </div>

//       <div className="d-flex justify-content-center">
//       <div className="d-flex flex-column flex-md-row flex-wrap gap-4 align-items-stretch" style={{ width: '100%', maxWidth: '1200px' }}>
//           {/* Left Card */}
//           <div className="card custom-card shadow-sm p-4 d-flex flex-column border border-dark">
//             <form onSubmit={handleSubmit} className="archivo-black-regular">
//               <h4 className="fw-bold mb-3 text-center archivo-black-regular">Enter custom data points</h4>
//               <div className="mb-3">
//                 <label className="form-label">Age</label>
//                 <input type="number" className="form-control" name="age" value={formData.age}
//                   onChange={handleChange} placeholder="Enter age" required />
//               </div>
//               <div className="mb-3">
//                 <label className="form-label">Number of Purchases</label>
//                 <input type="number" className="form-control" name="purchases" value={formData.purchases}
//                   onChange={handleChange} placeholder="Enter total purchases" required />
//               </div>
//               <div className="mb-3">
//               <label className="form-label">Loyalty Program</label>
//               <select
//                 className="form-select text-muted"
//                 name="loyalty"
//                 value={formData.loyalty}
//                 onChange={handleChange}
//                 required
//               >
//                 <option value="">Select...</option>
//                 <option value="1">Yes</option>
//                 <option value="0">No</option>
//               </select>
//               {loyaltyError && (
//                 <div className="text-danger small mt-1">{loyaltyError}</div>
//               )}
//             </div>
//               <div className="mb-3">
//                 <label className="form-label">Discounts Used</label>
//                 <input type="number" className="form-control" name="discounts" value={formData.discounts}
//                   onChange={handleChange} placeholder="How many discounts used" required />
//               </div>
//               {
//                 <button
//                 type="submit"
//                 className="predict-btn text-white fw-bold py-2 px-4 rounded archivo-black-regular"
//               >
//                 Predict
//               </button>
//               /* <button
//                 type="submit"
//                 className="w-100 text-white fw-bold py-2 px-3 rounded"
//                 style={{ backgroundColor: "#8884d8", border: 'none' }}
//               >
//                 Predict
//               </button> */}
//             </form>

//             {prediction !== null && (
//               <div
//                 key={`prediction-${animationKey}`}
//                 className={`mt-4 p-3 rounded text-center fw-bold animated-result ${
//                   prediction === 1 ? 'bg-success text-white' : 'bg-danger text-white'
//                 }`}
//               >
//                 {prediction === 1
//                   ? '✅ The customer purchases!'
//                   : '❌ The customer does not purchase.'}
//               </div>
//             )}

            
//             <div className="mt-4">
//               <h6 className="fw-bold text-center mb-3 archivo-black-regular">📊 Model Performance</h6>
//               <ResponsiveContainer width="100%" height={250}>
//                 <PieChart>
//                   <Pie
//                     dataKey="value"
//                     data={performanceData}
//                     cx="50%"
//                     cy="50%"
//                     outerRadius={70}
//                     label
//                   >
//                     <Cell fill="#A0E7A0" />  {/* True Positives */}
//                     <Cell fill="#66D9A0" />  {/* True Negatives */}
//                     <Cell fill="#FFB3B3" />  {/* False Positives */}
//                     <Cell fill="#FF8A8A" />  {/* False Negatives */}
//                   </Pie>
//                   <Legend
//                     content={({ payload }) => (
//                       <div
//                         style={{
//                           display: 'flex',
//                           justifyContent: 'center',
//                           alignItems: 'center',
//                           gap: '0.75rem',
//                           marginTop: '0.75rem',
//                           flexWrap: 'nowrap',
//                         }}
//                       >
//                         {payload.map((entry, index) => (
//                           <div key={`item-${index}`} style={{ display: 'flex', alignItems: 'center' }}>
//                             <div
//                               style={{
//                                 width: 8,
//                                 height: 8,
//                                 backgroundColor: entry.color,
//                                 borderRadius: '50%',
//                                 marginRight: 4,
//                               }}
//                             />
//                             <span
//                               className="archivo-black-regular"
//                               style={{ color: 'black', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
//                             >
//                               {entry.value}
//                             </span>
//                           </div>
//                         ))}
//                       </div>
//                     )}
//                   />
//                 </PieChart>
//               </ResponsiveContainer>
//             </div>

//           </div>

//           {/* Right Card */}
//           <div className="card custom-card shadow-sm p-4 d-flex flex-column border border-dark" style={{ flex: '1 1 0', minWidth: '400px' }}>
//             <div className="scroll-area flex-grow-1">
//               <h6 className="fw-bold mb-3 text-center archivo-black-regular" >🔍 Sneak Peek: Dataset Sample</h6>
//               <div
//                 className="table-responsive"
//                 style={{
//                   maxHeight: '300px',
//                   overflowY: 'auto',
//                   overflowX: 'auto', // ensures horizontal scrolling if ever needed
//                   width: '100%',     // allow it to take full width of the parent card
//                 }}
//               >
//                 <table className="table table-sm table-bordered text-center w-100">
//                   <thead className="table-light">
//                     <tr>
//                       <th>Age</th><th>Gender</th><th>Income</th><th>Purchases</th><th>Category</th>
//                       <th>Time</th><th>Loyalty</th><th>Discounts</th><th>Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     <tr><td>40</td><td>1</td><td>66120</td><td>8</td><td>0</td><td>30.6</td><td>0</td><td>5</td><td>1</td></tr>
//                     <tr><td>20</td><td>1</td><td>23580</td><td>4</td><td>2</td><td>38.2</td><td>0</td><td>5</td><td>0</td></tr>
//                     <tr><td>27</td><td>1</td><td>127821</td><td>11</td><td>2</td><td>31.6</td><td>1</td><td>0</td><td>1</td></tr>
//                     <tr><td>24</td><td>1</td><td>137799</td><td>19</td><td>3</td><td>46.2</td><td>0</td><td>4</td><td>1</td></tr>
//                     <tr><td>31</td><td>1</td><td>99301</td><td>19</td><td>1</td><td>19.8</td><td>0</td><td>0</td><td>1</td></tr>
//                   </tbody>
//                 </table>
//               </div>

//               <div className="mt-5 feature-imp-container">
//                 <h6 className="fw-bold text-center mb-3 archivo-black-regular">📈 Feature Importance</h6>
//                 <p className='archivo-black-regular'>Feature importance is calculated by analyzing the coefficients of the independent variables. These coefficients are derived by minimizing binary cross-entropy loss using the gradient descent algorithm.</p>
//                 <ResponsiveContainer width="100%" height={250}>
//                   <BarChart
//                     data={featureImportance}
//                     layout="vertical"
//                     margin={{ top: 0, right: 20, bottom: 0, left: 20 }}
//                   >
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis type="number" />
//                     <YAxis type="category" dataKey="name" />
//                     <Tooltip />
//                     <Bar dataKey="value" fill="#8884d8" />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       {/* FOOTER */}
//       <footer className="bg-light text-center text-muted border-top mt-5 py-3 w-100 archivo-black-regular border border-dark">
//       <div>
//         <p className="mb-1">Created by <strong>Adam Walid</strong></p>
//         <p className="mb-1">
//           <a
//             href="https://github.com/adamwalid64"
//             className="text-decoration-none me-2"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             GitHub
//           </a>
//           |
//           <a
//             href="https://www.linkedin.com/in/adamwalid/"
//             className="text-decoration-none ms-2"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             LinkedIn
//           </a>
//         </p>
//         <p className="mb-0">
//           Dataset by{" "}
//           <a
//             href="https://www.kaggle.com/datasets/rabieelkharoua/predict-customer-purchase-behavior-dataset"
//             className="text-decoration-none"
//             target="_blank"
//             rel="noopener noreferrer"
//           >
//             Rabie El Kharoua
//           </a>
//         </p>
//       </div>
//     </footer>

//     </div>

          
//   );
// }

// export default App;

