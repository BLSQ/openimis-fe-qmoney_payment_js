import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { createSelector } from 'reselect';
import PropTypes from 'prop-types';

import {
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@material-ui/core';

import RequestPaymentButton from './RequestPaymentButton';
import { listPayments } from '../api/gql-mutations';

QmoneyPaymentFamilyPanel.propTypes = {
  classes: PropTypes.object.isRequired
};

const selectQmoneyPayments = createSelector(
  (state) => state.policy.policies,
  (policies) => {
    if (policies == null) return Promise.resolve([]);
    const policyUuids = policies.map(policy => policy.policyUuid);
    return listPayments(policyUuids);
  });

function QmoneyPaymentFamilyPanel(props) {
  const { classes } = props;

  const [listOfQmoneyPayments, setListOfQmoneyPayments] = useState([]);
  const policyUuid = useSelector(state => {
    return state.policy.policy?.policyUuid;
  });

  const promisedQmoneyPayments = useSelector(selectQmoneyPayments);
  useEffect(() => {
    promisedQmoneyPayments.then((qmoneyPayments) => {
      if (policyUuid == null) {
        setListOfQmoneyPayments(qmoneyPayments);
      } else {
        setListOfQmoneyPayments(
          qmoneyPayments.filter(
            qmoneyPayment =>
              qmoneyPayment.policyUuid.toLowerCase() === policyUuid.toLowerCase()
          )
        );
      }
    });
  }, [promisedQmoneyPayments, policyUuid]);

  return (
    <>
      <Paper className={classes.paper}>
        <Grid container alignItems="center" direction="row" className={classes.paperHeader}>
          <Grid item xs={8}>
            <Grid container direction="row">
              <Typography className={classes.tableTitle}>
                Qmoney Payments
              </Typography>
            </Grid>
          </Grid>
          <Grid item xs={4}>
            <Grid container direction="row" justify="flex-end">
              <Typography className={classes.tableTitle}>
                <RequestPaymentButton {...props} />
              </Typography>
            </Grid>
          </Grid>
        </Grid>
        <Divider />
        <Grid container alignItems="center" direction="row">
          <Table>
          <TableHead>
            <TableRow>
              <TableCell>Policy UUID</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {listOfQmoneyPayments.map((qmoneyPayment) => (
            <TableRow key={qmoneyPayment.uuid}>
              <TableCell>{qmoneyPayment.policyUuid}</TableCell>
              <TableCell>{qmoneyPayment.amount}</TableCell>
              <TableCell>{qmoneyPayment.status}</TableCell>
            </TableRow>
          ))}
          </TableBody>
          </Table>
        </Grid>
      </Paper>
    </>
  );
}

export default QmoneyPaymentFamilyPanel;
