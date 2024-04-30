import React, { useCallback, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { createSelector } from "reselect";
import PropTypes from "prop-types";

import { Delete as DeleteIcon, Edit as EditIcon } from "@material-ui/icons";

import {
  Divider,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";

import { ROUTE_TO_CONFIRM_PAYMENT_PAGE } from "../constants";
import RequestPaymentButton from "./RequestPaymentButton";
import { cancelPayment, listPayments } from "../api/gql-mutations";

QmoneyPaymentFamilyPanel.propTypes = {
  classes: PropTypes.object.isRequired,
};

function isDeletable(status) {
  return ["PROCEEDED", "CANCELED"].indexOf(status) == -1;
}

function isEditable(status) {
  return ["FAILED", "WAITING_FOR_CONFIRMATION"].indexOf(status) > -1;
}

const selectQmoneyPayments = createSelector(
  (state) => state.policy.policies,
  (policies) => {
    if (policies == null) return Promise.resolve([]);
    const policyUuids = policies.map((policy) => policy.policyUuid);
    return listPayments(policyUuids);
  }
);

function QmoneyPaymentFamilyPanel(props) {
  const { classes } = props;

  const [listOfQmoneyPayments, setListOfQmoneyPayments] = useState([]);
  const policyUuid = useSelector((state) => {
    return state.policy.policy?.policyUuid;
  });

  let fetchedHistoricalMutations = useSelector((state) => {
    return state.core.fetchedHistoricalMutations;
  });

  const promisedQmoneyPayments = useSelector(selectQmoneyPayments);
  useEffect(() => {
    promisedQmoneyPayments.then((qmoneyPayments) => {
      qmoneyPayments = qmoneyPayments.filter((qmoneyPayment) =>
        isDeletable(qmoneyPayment.status)
      );
      if (policyUuid == null) {
        setListOfQmoneyPayments(qmoneyPayments);
      } else {
        setListOfQmoneyPayments(
          qmoneyPayments.filter(
            (qmoneyPayment) =>
              qmoneyPayment.policyUuid.toLowerCase() ===
              policyUuid.toLowerCase()
          )
        );
      }
    });
  }, [promisedQmoneyPayments, policyUuid]);

  const history = useHistory();
  const onEdit = useCallback(
    (qmoneyPayment) => {
      switch (qmoneyPayment.status) {
        case "FAILED":
        case "WAITING_FOR_CONFIRMATION":
          history.push({
            pathname: `/${ROUTE_TO_CONFIRM_PAYMENT_PAGE}`,
            state: {
              classes: classes,
              qmoneyPaymentUuid: qmoneyPayment.uuid,
              familyLocation: history.location.pathname,
            },
          });
        default:
          console.debug(
            "You can edit only Qmoney Payments that have failed or are waiting for confirmation."
          );
      }
    },
    [listOfQmoneyPayments, history]
  );

  const onDelete = useCallback(
    (qmoneyPayment) => {
      if (!isDeletable(qmoneyPayment.status)) {
        console.debug(
          "You cannot delete a Qmoney Payment that has been proceeded or canceled."
        );
        return;
      }
      cancelPayment(qmoneyPayment.uuid)
        .then((response) => {
          if (
            response.cancelQmoneyPayment.qmoneyPayment.status !== "CANCELED"
          ) {
            console.error(
              "The payment should have been canceled but it is not"
            );
            return;
          }
          const deletedUuid = response.cancelQmoneyPayment.qmoneyPayment.uuid;
          setListOfQmoneyPayments(
            listOfQmoneyPayments.filter(
              (qmoneyPayment) => qmoneyPayment.uuid != deletedUuid
            )
          );
          window.location.reload();
        })
        .catch((error) => console.error(error));
    },
    [listOfQmoneyPayments, history]
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
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {listOfQmoneyPayments.map((qmoneyPayment) => (
                <TableRow key={qmoneyPayment.uuid}>
                  <TableCell>{qmoneyPayment.policyUuid}</TableCell>
                  <TableCell>{qmoneyPayment.amount}</TableCell>
                  <TableCell>{qmoneyPayment.status}</TableCell>
                  <TableCell>
                    <IconButton
                      onClick={() => onEdit(qmoneyPayment)}
                      disabled={!isEditable(qmoneyPayment.status)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => onDelete(qmoneyPayment)}
                      disabled={!isDeletable(qmoneyPayment.status)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
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
