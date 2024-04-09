import graphql from 'graphql.js';

export const GRAPHQL_URL_PATH = '/api/graphql';

export const client = graphql(GRAPHQL_URL_PATH, {
  method: 'POST',
  asJSON: true
});

const gqlMutateRequestPayment = client.mutate(
  `RequestPayment($policyUuid: UUID!, $amount: Int!, $payerWallet: String!) {
    requestQmoneyPayment(policyUuid: $policyUuid, amount: $amount, payerWallet: $payerWallet) {
      qmoneyPayment {
        uuid
        status
        amount
      }
      ok
    }
  }`);

export function requestPayment(policyUuid, amount, payerWallet, onSuccess, onError, requestFn = gqlMutateRequestPayment) {
  const variables = {
    policyUuid: policyUuid,
    amount: amount,
    payerWallet: payerWallet
  };
  requestFn(variables).then(
    response => {
      onSuccess(response);
    }).catch(
    error => {
      onError(error);
    });
}

const gqlMutateConfirmPayment = client.mutate(
  `ProceedQmoneyPayment($uuid: UUID!, $otp: String!) {
    proceedQmoneyPayment(uuid: $uuid, otp: $otp) {
      qmoneyPayment {
        uuid
        status
        amount
      }
      ok
    }
  }`);

export function confirmPayment(qmoneyPaymentUuid, otp, onSuccess, onError, confirmFn = gqlMutateConfirmPayment) {
  const variables = {
    uuid: qmoneyPaymentUuid,
    otp: otp
  };
  confirmFn(variables).then(
    response => {
      onSuccess(response);
    }).catch(
    error => {
      onError(error);
    });
}

const gqlQueryQmoneyPayments = client.query(`
  ListQmoneyPayments($policyUuid: UUID!) {
    qmoneyPayments(policyUuid: $policyUuid){
      edges{
        node{
          uuid
          status
          amount
          payerWallet
          policyUuid
          contributionUuid
          externalTransactionId
        }
      }
    }
  }`);

export function listPayments(policyUuids, listFn = gqlQueryQmoneyPayments) {
  const promises = [];
  for (const policyUuid of policyUuids) {
    promises.push(gqlQueryQmoneyPayments({ policyUuid: policyUuid }).then((response) => {
      return response.qmoneyPayments.edges.map(qmoneyPayment => qmoneyPayment.node);
    }));
  }
  return Promise.all(promises).then(arrayOfResults => arrayOfResults.flat());
}
