import { Observable } from "rxjs";
import React from "react";

import MediatorWrapper from "./MediatorWrapper";

// TDL - remove the double wrapping component
// TDL - write tests
const withMediator = (observable, handlers, component) => ({
  props,
  children
}) =>
  React.createElement(
    MediatorWrapper,
    { observable, component, handlers, parentProps: props },
    children
  );

// TDL - JSDoc
// TDL - write tests (class and function components)
const reactExtension = (observable, handlers) => {
  return {
    react: component => {
      return withMediator(observable, handlers, component);
    }
  };
};

/**
 * Returns a stream of data from the source with results from the queries.
 */
// TDL - JSDoc
// TDL - write tests
// TDL - handlers should merge with operations
const observe = (source, operations = {}, handlers = {}) => {
  const observer = Object.keys(operations).reduce((accSource, operationId) => {
    return accSource.merge(
      operations[operationId](source)
        .map(result => {
          return { __operationId: operationId, value: result };
        })
        .catch(err => {
          return Observable.of({
            __operationId: "error",
            value: err
          });
        })
        .distinctUntilKeyChanged("value")
    );
  }, Observable.empty());

  return Object.assign(observer, reactExtension(observer, handlers));
};

// TDL - figure out how to use the exports default here
export { observe };
