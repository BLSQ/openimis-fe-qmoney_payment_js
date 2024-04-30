import React, { useCallback, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Button,
  ButtonGroup,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid,
  Input,
  InputLabel,
  Paper,
} from "@material-ui/core";
import PropTypes from "prop-types";

import { ROUTE_TO_CONFIRM_PAYMENT_PAGE } from "../constants";
import { requestPayment } from "../api/gql-mutations";

RequestPaymentPage.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      classes: PropTypes.object.isRequired,
      policyUuid: PropTypes.string.isRequired,
      requestPaymentFn: PropTypes.func.isOptional,
      maxPaymentAmount: PropTypes.number.isRequired,
      familyLocation: PropTypes.string.isRequired,
    }),
  }),
};

function RequestPaymentPage(props) {
  const {
    location: {
      state: {
        classes,
        familyLocation,
        policyUuid = null,
        maxPaymentAmount = 0,
        requestPaymentFn = requestPayment,
      } = {},
    } = {},
  } = props;
  const [qmoneyWallet, setQmoneyWallet] = useState("");
  const [qmoneyWalletError, setQmoneyWalletError] = useState(true);
  const [failed, setFailed] = useState(false);
  const [failedMessage, setFailedMessage] = useState("");
  const [paymentAmount, setPaymentAmount] = useState(maxPaymentAmount);
  const [paymentAmountError, setPaymentAmountError] = useState(false);
  const [paymentAmountErrorMessage, setPaymentAmountErrorMessage] =
    useState("");
  const [loading, setLoading] = useState(false);

  const history = useHistory();

  const onSuccess = useCallback(
    (response) => {
      setFailed(false);
      setLoading(false);
      const qmoneyPaymentUuid =
        response.requestQmoneyPayment.qmoneyPayment.uuid;
      history.push({
        pathname: `/${ROUTE_TO_CONFIRM_PAYMENT_PAGE}`,
        state: {
          classes: classes,
          qmoneyPaymentUuid: qmoneyPaymentUuid,
          familyLocation: familyLocation,
        },
      });
      // This forced reloading will make sure the JournalDrawer is refreshed
      // and fetches the last MutationLogs as we do not use the JS core OpenIMIS
      // API.
      window.location.reload();
    },
    [history]
  );

  const onError = useCallback((error) => {
    setFailed(true);
    setLoading(false);
    setFailedMessage(error[0].message);
    window.location.reload();
  }, []);

  const validateAndSetQmoneyWallet = useCallback(
    (event) => {
      const content = event.target.value;
      if (content === "") {
        setQmoneyWalletError(true);
      } else {
        setQmoneyWalletError(false);
      }
      setQmoneyWallet(content);
    },
    [qmoneyWallet]
  );

  const validateAndSetPaymentAmount = useCallback(
    (event) => {
      const amount = event.target.value;
      if (isNaN(amount) || amount === "") {
        setPaymentAmountError(true);
        setPaymentAmountErrorMessage("Please give a number.");
      } else if (amount < 0) {
        setPaymentAmountError(true);
        setPaymentAmountErrorMessage(
          "Please provide a positive amount to pay."
        );
      } else if (amount > maxPaymentAmount) {
        setPaymentAmountError(true);
        setPaymentAmountErrorMessage(
          `Please provide an amount less than the total amount to pay ${maxPaymentAmount}.`
        );
      } else {
        setPaymentAmountError(false);
        setPaymentAmountErrorMessage("");
      }
      setPaymentAmount(amount);
    },
    [paymentAmount]
  );

  const onRequestPayment = useCallback(
    (event) => {
      event.preventDefault();

      setFailed(false);
      setLoading(true);

      requestPaymentFn(
        policyUuid,
        paymentAmount,
        qmoneyWallet,
        onSuccess,
        onError
      );
    },
    [qmoneyWallet, policyUuid, paymentAmount, requestPaymentFn]
  );

  const onCancelRequestPayment = useCallback(
    (event) => {
      event.preventDefault();
      history.goBack();
    },
    [history]
  );

  if (!policyUuid) {
    return (
      <div>
        <h1>Please provide a Policy to request a payment.</h1>
        <Button onClick={onCancelRequestPayment}>Go Back</Button>
      </div>
    );
  }

  return (
    <>
      <Paper className={classes.paper}>
        <Grid
          container
          alignItems="center"
          direction="row"
          className={classes.paperHeader}
        >
          <Grid item xs={12}>
            <Grid container direction="row">
              <h1>Request a mobile payment by QMoney</h1>
            </Grid>
            <form onSubmit={onRequestPayment}>
              <Grid container direction="row">
                <FormControl>
                  <InputLabel htmlFor="qmoney-wallet"></InputLabel>
                  <Input
                    id="qmoney-wallet"
                    aria-describedby="qmoney-wallet-helper-text"
                    autoFocus
                    value={qmoneyWallet}
                    onChange={validateAndSetQmoneyWallet}
                    error={qmoneyWalletError}
                    required
                  />
                  <FormHelperText id="qmoney-wallet-helper-text">
                    {qmoneyWalletError &&
                      "Please provide the QMoney wallet id of the payer."}
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid container direction="row">
                <FormControl>
                  <InputLabel htmlFor="payment-amount"></InputLabel>
                  <Input
                    type="number"
                    id="payment-amount"
                    aria-describedby="payment-amount-helper-text"
                    value={paymentAmount}
                    onChange={validateAndSetPaymentAmount}
                    error={paymentAmountError}
                    required
                  />
                  <FormHelperText id="payment-amount-helper-text">
                    {paymentAmountErrorMessage}
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid container direction="row">
                <ButtonGroup aria-label="Request payment buttons">
                  <Button
                    disabled={
                      qmoneyWalletError || paymentAmountError || loading
                    }
                    label="Request"
                    type="Submit"
                  >
                    Request
                  </Button>
                  <Button onClick={onCancelRequestPayment}>Cancel</Button>
                  {loading && <CircularProgress />}
                </ButtonGroup>
              </Grid>
            </form>
          </Grid>
          {failed && (
            <Grid container direction="row">
              <p>{failedMessage}</p>
            </Grid>
          )}
        </Grid>
      </Paper>
    </>
  );
}

export default RequestPaymentPage;
