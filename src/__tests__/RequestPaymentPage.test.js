import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { act, screen, render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { createBrowserHistory } from 'history';

import RequestPaymentPage from '../pages/RequestPaymentPage';
import { ROUTE_TO_REQUEST_PAYMENT_PAGE, ROUTE_TO_CONFIRM_PAYMENT_PAGE } from '../constants';

import { TestRouter } from '../utils/testHelperForRouter';

const crypto = require('crypto');

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  console.error.mockRestore();
});

afterEach(() => {
  console.error.mockClear();
});

// use a custom renderer https://testing-library.com/docs/react-testing-library/setup/#custom-render

it('renders an error when none policy provided', () => {
  act(() => {
    render(
      <BrowserRouter>
        <RequestPaymentPage />
      </BrowserRouter>);
  });
  expect(screen.getByRole('heading').textContent).toBe('Please provide a Policy to request a payment.');
});

it('renders a form when passed policy', () => {
  const pushedState = {
    location: {
      state: {
        policyUuid: '7620c195-025d-4756-9e1f-ff282dbed523',
        classes: {
          paper: 'test-class'
        }
      }
    }
  };
  act(() => {
    render(
      <BrowserRouter>
        <RequestPaymentPage {...pushedState}/>
      </BrowserRouter>);
  });
  expect(screen.getByRole('heading').textContent).toBe('Request a mobile payment by QMoney');
  expect(screen.getByText('Please provide the QMoney wallet id of the payer.')).toBeInTheDocument();
  const renderedButtons = screen.getAllByRole('button');
  expect(renderedButtons).toHaveLength(2);
  expect(renderedButtons[0].textContent).toBe('Request');
  expect(renderedButtons[1].textContent).toBe('Cancel');
});

it('makes the request and routes to the right location when Request button clicked', async() => {
  const qmoneyPaymentUuid = crypto.randomUUID();
  const mockedRequestPaymentFn = jest.fn();
  const amount = 1;
  mockedRequestPaymentFn.mockImplementation((_p1, _p2, _p3, onSuccess, _p5) => {
    onSuccess({
      requestQmoneyPayment: {
        ok: true,
        qmoneyPayment: {
          uuid: qmoneyPaymentUuid,
          status: 'WAITING_FOR_CONFIRMATION',
          amount: amount
        }
      }
    });
  });
  const pushedState = {
    location: {
      state: {
        policyUuid: '7620c195-025d-4756-9e1f-ff282dbed523',
        classes: {
          paper: 'test-class'
        },
        maxPaymentAmount: amount,
        requestPaymentFn: mockedRequestPaymentFn
      }
    }
  };

  const confirmPaymentPageText = 'CONFIRM PAYMENT PAGE BODY';
  const routes = [
    {
      path: `/${ROUTE_TO_REQUEST_PAYMENT_PAGE}`,
      element: <RequestPaymentPage {...pushedState}/>
    },
    {
      path: `/${ROUTE_TO_CONFIRM_PAYMENT_PAGE}`,
      element: <>{confirmPaymentPageText}</>
    }
  ];
  const history = createBrowserHistory();
  const user = userEvent.setup();
  act(() => {
    render(<TestRouter history={history} routes={routes} initialPath={`/${ROUTE_TO_REQUEST_PAYMENT_PAGE}`}/>);
  });

  await user.type(screen.getByRole('textbox'), 'fakePayerWallet');
  await user.click(screen.getByRole('button', { name: 'Request' }));
  expect(mockedRequestPaymentFn).toHaveBeenCalled();
  expect(history.location.pathname).toBe(`/${ROUTE_TO_CONFIRM_PAYMENT_PAGE}`);
  expect(screen.getByText(confirmPaymentPageText)).toBeInTheDocument();
});

// TODO 'makes the request and routes to the right location when Request button clicked'