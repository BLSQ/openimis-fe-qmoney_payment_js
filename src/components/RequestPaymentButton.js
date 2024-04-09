import React, { useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Button } from '@material-ui/core';

import { ROUTE_TO_REQUEST_PAYMENT_PAGE } from '../constants';

RequestPaymentButton.propTypes = {
  classes: PropTypes.object.isRequired
};

function RequestPaymentButton(props) {
  const { classes } = props;

  const history = useHistory();

  const policyUuid = useSelector(state => {
    return state.policy.policy?.policyUuid;
  });

  const isDisabled = useSelector(state => {
    if (state.policy.policy == null) return true;
    return state.policy.policy?.status !== 1; // 1 corresponds to Idle status
  });

  const policyBalance = useSelector(state => {
    return state.policy.policy?.balance;
  });

  const goToRequestPaymentPage = useCallback(async (event) => {
    history.push({
      pathname: `/${ROUTE_TO_REQUEST_PAYMENT_PAGE}`,
      state: { policyUuid: policyUuid, maxPaymentAmount: policyBalance, classes: classes, familyLocation: history.location.pathname }
    });
  }, [classes, policyUuid, policyBalance]);

  return (
    <Button disabled={isDisabled} onClick={goToRequestPaymentPage}>Request a payment</Button>
  );
}

export default RequestPaymentButton;
