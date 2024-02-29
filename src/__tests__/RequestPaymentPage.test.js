import React from 'react';
import ReactDOM from 'react-dom';
import RequestPaymentPage from '../pages/RequestPaymentPage';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<RequestPaymentPage></RequestPaymentPage>, div);
});