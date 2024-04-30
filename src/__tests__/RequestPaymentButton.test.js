import React from "react";
import { BrowserRouter } from "react-router-dom";
import { createBrowserHistory } from "history";
import { act, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";

import { renderWithProviders } from "../utils/testHelperForRedux";
import { TestRouter } from "../utils/testHelperForRouter";

import RequestPaymentButton from "../components/RequestPaymentButton";
import { ROUTE_TO_REQUEST_PAYMENT_PAGE } from "../constants";

it("renders without crashing", () => {
  act(() => {
    renderWithProviders(
      <BrowserRouter>
        <RequestPaymentButton classes={{}} />
      </BrowserRouter>,
      {
        preloadedState: {
          policy: {
            policy: {
              policyUuid: "fake-policy-UUID",
              balance: 10000,
              status: 1,
            },
          },
        },
      }
    );
  });
  expect(screen.getByText("Request a payment")).toBeInTheDocument();
  expect(screen.getByRole("button")).toBeInTheDocument();
});

it("routes to the right location when clicked", async () => {
  const initialPagePath = "/initial-page";
  const requestPaymentPageText = "REQUEST PAYMENT PAGE BODY";
  const routes = [
    {
      path: initialPagePath,
      element: <RequestPaymentButton classes={{}} />,
    },
    {
      path: `/${ROUTE_TO_REQUEST_PAYMENT_PAGE}`,
      element: <>{requestPaymentPageText}</>,
    },
  ];

  const history = createBrowserHistory();

  const user = userEvent.setup();
  act(() => {
    renderWithProviders(
      <TestRouter
        history={history}
        initialPath={initialPagePath}
        routes={routes}
      />,
      {
        preloadedState: {
          policy: {
            policy: {
              policyUuid: "fake-policy-UUID",
              balance: 10000,
              status: 1,
            },
          },
        },
      }
    );
  });
  expect(history.location.pathname).toBe(initialPagePath);

  await user.click(screen.getByRole("button"));
  expect(history.location.pathname).toBe(`/${ROUTE_TO_REQUEST_PAYMENT_PAGE}`);
  expect(screen.getByText(requestPaymentPageText)).toBeInTheDocument();
});

// TODO Add a test to check button disabled when policy not idle
