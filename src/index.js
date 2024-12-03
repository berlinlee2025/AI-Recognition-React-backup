import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.scss';
import App from './App';
import reportWebVitals from './reportWebVitals';
// import 'tachyons';

const numOfMeteor = 30; // Total number of meteors
const meteors = Array.from({
  length: numOfMeteor
}, (_, index) => (
  <div key={index} className={`meteor-${index} + 1`}>
  </div>
));

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App className="start" />
    {/* {meteors} */}
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
