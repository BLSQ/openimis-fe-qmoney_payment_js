import React from 'react';
import { Router, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

TestRouter.propTypes = {
  history: PropTypes.object.isRequired,
  initialPath: PropTypes.string.isRequired,
  routes: PropTypes.array.isRequired
};

export function TestRouter(props) {
  const { history, routes, initialPath } = props;
  history.push(initialPath);
  return (
    <Router history={history}>
      {routes.map(route => (
        <Route key={route.path} path={route.path} render={() => (route.element)} />
      ))}
    </Router>
  );
}
