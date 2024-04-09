import React from 'react';
import ReactDOM from 'react-dom';
import { createHashRouter, RouterProvider } from 'react-router-dom';

import RequestPaymentButton from './components/RequestPaymentButton';
import RequestPaymentPage from './pages/RequestPaymentPage';
import { ROUTE_TO_REQUEST_PAYMENT_PAGE, ROUTE_TO_CONFIRM_PAYMENT_PAGE } from './constants';

function requestPayment() {
  return {
    ok: false,
    message: 'this is an error'
  };
}

const router = createHashRouter([
  {
    path: '/',
    element: <RequestPaymentButton/>
  },
  {
    path: ROUTE_TO_REQUEST_PAYMENT_PAGE,
    element: <RequestPaymentPage policyUuid='71d05e26-34c0-4f06-b878-b32d37e28d79' requestPayment={requestPayment} />
  },
  {
    path: ROUTE_TO_CONFIRM_PAYMENT_PAGE,
    element: <div>Confirm</div>
  }
]);

ReactDOM.render(<React.StrictMode><RouterProvider router={router} /></React.StrictMode>, document.querySelector('#root'));
