import React from "react";

// TDL - Tests
// TDL - console.log only if in development mode for react, error stay
export default class MediatorWrapper extends React.Component {
  constructor() {
    super(...arguments);

    this.observable = this.props.observable;
    this.state = {};
  }

  componentWillMount() {
    this.setState({ isLoading: true, hasError: false });

    this.observable.subscribe(
      event => {
        // console.log("evt", event);
        // Uggly
        const data = this.state.data || {};
        data[event.__operationId] = event.value;

        const state = {
          data,
          isLoading: false,
          hasError: event.__operationId === "error"
        };
        this.setState(state);
      },
      err => {
        console.error("Mediator Error", err);
      },
      () => {
        console.log("Mediator Done");
      }
    );
  }

  componentWillUnmount() {
    this.observable.unsubscribe();
  }

  render() {
    // TDL - Support passing loading component
    // TDL - Support passing the error component
    // TDL - could we flatten data better here?
    const props = Object.assign({}, this.state.data, this.props.handlers, {
      isLoading: this.state.isLoading,
      hasError: this.state.hasError
    });

    return React.createElement(this.props.component, props, this.children);
  }
}
