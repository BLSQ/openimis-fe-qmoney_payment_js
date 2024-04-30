import React, { useState, useCallback } from "react";

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

import { confirmPayment } from "../api/gql-mutations";

ConfirmPaymentPage.propTypes = {
  location: PropTypes.shape({
    state: PropTypes.shape({
      classes: PropTypes.object.isRequired,
      qmoneyPaymentUuid: PropTypes.string.isRequired,
      confirmPaymentFn: PropTypes.func.isOptional,
      familyLocation: PropTypes.string.isRequired,
    }),
  }),
};

function ConfirmPaymentPage(props) {
  const {
    location: {
      state: {
        classes,
        familyLocation,
        qmoneyPaymentUuid = null,
        confirmPaymentFn = confirmPayment,
      } = {},
    },
  } = props;
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState(true);
  const [failed, setFailed] = useState(false);
  const [failedMessage, setFailedMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const history = useHistory();

  const onSuccess = useCallback(
    (response) => {
      setFailed(false);
      setLoading(false);
      history.push({ pathname: familyLocation });
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

  const validateAndSetOtp = useCallback(
    (event) => {
      const content = event.target.value;
      if (content === "") {
        setOtpError(true);
      } else {
        setOtpError(false);
      }
      setOtp(content);
    },
    [otp]
  );

  const onConfirmPayment = useCallback(
    (event) => {
      event.preventDefault();

      setFailed(false);
      setLoading(true);

      confirmPaymentFn(qmoneyPaymentUuid, otp, onSuccess, onError);
    },
    [otp, qmoneyPaymentUuid, confirmPaymentFn]
  );

  const onCancelConfirmPayment = useCallback(
    (event) => {
      event.preventDefault();
      history.push({ pathname: familyLocation });
      window.location.reload();
    },
    [history]
  );

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
              <h1>Confirm a mobile payment by QMoney</h1>
            </Grid>
            <form onSubmit={onConfirmPayment}>
              <Grid container direction="row">
                <FormControl>
                  <InputLabel htmlFor="qmoney-wallet"></InputLabel>
                  <Input
                    id="qmoney-wallet"
                    aria-describedby="qmoney-wallet-helper-text"
                    autoFocus
                    value={otp}
                    onChange={validateAndSetOtp}
                    error={otpError}
                    required
                  />
                  <FormHelperText id="qmoney-wallet-helper-text">
                    {otpError && "Please provide the OTP."}
                  </FormHelperText>
                </FormControl>
              </Grid>
              <Grid container direction="row">
                <ButtonGroup aria-label="Request payment buttons">
                  <Button
                    disabled={otpError || loading}
                    label="Request"
                    type="Submit"
                  >
                    Confirm & Proceed
                  </Button>
                  <Button onClick={onCancelConfirmPayment}>
                    Go back to the Family Overview and Confirm later
                  </Button>
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

export default ConfirmPaymentPage;
