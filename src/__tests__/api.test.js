import { client as gqlClient,
  confirmPayment,
  GRAPHQL_URL_PATH,
  listPayments,
  requestPayment
} from '../api/gql-mutations';

import jestConfig from '../../jest.config';

const crypto = require('crypto');
const qmoneyPaymentUuid = crypto.randomUUID();
const mockedGqlMutateRequestPaymentFn = jest.fn();

const gqlLogin = gqlClient.mutate(`
  authenticate($username: String!, $password: String!) {
    tokenAuth(username: $username, password: $password) {
      token
    }
  }`);

const adminCredentials = {
  username: 'Admin',
  password: 'admin123'
};

beforeAll(() => {
  if (jestConfig.testEnvironmentOptions.withBackend) {
    const url = `${jestConfig.testEnvironmentOptions.url}${GRAPHQL_URL_PATH}`;
    gqlClient.setUrl(url);
    return gqlLogin(adminCredentials).then(response => {
      const accessToken = response.tokenAuth.token;
      gqlClient.headers({
        authorization: `Bearer ${accessToken}`
      });
    }).catch(error => {
      console.error(error);
    });
  };
});

afterEach(() => {
  mockedGqlMutateRequestPaymentFn.mockReset();
});

function getPolicyUuid() {
  if (jestConfig.testEnvironmentOptions.withBackend) {
    return jestConfig.testEnvironmentOptions.backendData.policyUuid;
  }

  return crypto.randomUUID();
}

function getPayerWallet() {
  if (jestConfig.testEnvironmentOptions.withBackend) {
    return jestConfig.testEnvironmentOptions.backendData.payerWallet;
  }

  return 'fakePayerWallet';
}

it('requests successfully a payment', (done) => {
  const policyUuid = getPolicyUuid();
  const amount = 1;
  const payerWallet = getPayerWallet();
  if (!jestConfig.testEnvironmentOptions.withBackend) {
    mockedGqlMutateRequestPaymentFn.mockResolvedValue({
      requestQmoneyPayment: {
        ok: true,
        qmoneyPayment: {
          uuid: qmoneyPaymentUuid,
          status: 'WAITING_FOR_CONFIRMATION',
          amount: 1
        }
      }
    });
  }

  function onSuccess(response) {
    expect(response.requestQmoneyPayment.ok).toBe(true);
    expect(response.requestQmoneyPayment.qmoneyPayment.uuid).toMatch(
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/
    );
    expect(response.requestQmoneyPayment.qmoneyPayment.status).toBe('WAITING_FOR_CONFIRMATION');
    done();
  }
  function onError(error) {
    done(error);
  };

  if (jestConfig.testEnvironmentOptions.withBackend) {
    requestPayment(
      policyUuid,
      amount,
      payerWallet,
      onSuccess,
      onError
    );
  } else {
    requestPayment(
      policyUuid,
      amount,
      payerWallet,
      onSuccess,
      onError,
      mockedGqlMutateRequestPaymentFn
    );
  }
});

it('lists Qmoney Payments', () => {
  const policyUuid = getPolicyUuid();
  const payerWallet = getPayerWallet();
  if (!jestConfig.testEnvironmentOptions.withBackend) {
    mockedGqlMutateRequestPaymentFn.mockResolvedValue([{
      amount: 1,
      policyUuid: policyUuid,
      status: 'INITIATED',
      payerWallet: payerWallet,
      uuid: qmoneyPaymentUuid
    }]);
  }

  const promisedResponse = jestConfig.testEnvironmentOptions.withBackend
    ? listPayments([policyUuid], mockedGqlMutateRequestPaymentFn)
    : listPayments([policyUuid]);

  return promisedResponse.then(response => {
    expect(response).toEqual(expect.any(Array));
    if (response.length === 0) return;

    expect(response[0]).toHaveProperty('amount');
    expect(response[0]).toHaveProperty('payerWallet');
    expect(response[0]).toHaveProperty('policyUuid', policyUuid.toLowerCase());
    expect(response[0]).toHaveProperty('status');
    expect(response[0]).toHaveProperty('uuid');
    expect(response[0].uuid).toMatch(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/);
  });
});

// TODO test confirm payment

// This can be tested with the backend by disabling the network
it('fails at requesting a payment', (done) => {
  const policyUuid = getPolicyUuid();
  const amount = 1;
  const payerWallet = getPayerWallet();
  if (!jestConfig.testEnvironmentOptions.withBackend) {
    mockedGqlMutateRequestPaymentFn.mockRejectedValue([{
      path: ['requestQmoneyPayment'],
      locations: [{ column: 5, line: 2 }],
      message: "HTTPSConnectionPool(host='uat-adpelite.qmoney.gm', port=443): Max retries exceeded with url: /getMoney (Caused by NewConnectionError('<urllib3.connection.HTTPSConnection object at 0x7f64c9cef880>: Failed to establish a new connection: [Errno -3] Temporary failure in name resolution'))"
    }]);
  }

  function onSuccess(response) {
    done(response);
  }
  function onError(errors) {
    expect(errors[0].path).toContain('requestQmoneyPayment');
    expect(errors[0].locations).toStrictEqual([{ column: 5, line: 2 }]);
    expect(errors[0].message).toMatch("HTTPSConnectionPool(host='uat-adpelite.qmoney.gm', port=443): Max retries exceeded with url: /getMoney (Caused by NewConnectionError");
    done();
  };
  if (jestConfig.testEnvironmentOptions.withBackend) {
    requestPayment(
      policyUuid,
      amount,
      payerWallet,
      onSuccess,
      onError
    );
  } else {
    requestPayment(
      policyUuid,
      amount,
      payerWallet,
      onSuccess,
      onError,
      mockedGqlMutateRequestPaymentFn
    );
  }
});

// TODO: test failing at listing and confirming
