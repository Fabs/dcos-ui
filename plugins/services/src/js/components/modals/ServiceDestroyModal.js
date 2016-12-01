import {Confirm} from 'reactjs-components';
import React, {PropTypes} from 'react';
import PureRender from 'react-addons-pure-render-mixin';

import ModalHeading from '../../../../../../src/js/components/modals/ModalHeading';
import Pod from '../../structs/Pod';
import Service from '../../structs/Service';
import ServiceTree from '../../structs/ServiceTree';

class ServiceDestroyModal extends React.Component {
  constructor() {
    super(...arguments);

    this.state = {
      errorMsg: null
    };

    this.shouldComponentUpdate = PureRender.shouldComponentUpdate.bind(this);
  }

  componentWillUpdate(nextProps) {
    const requestCompleted = this.props.isPending
      && !nextProps.isPending;

    const shouldClose = requestCompleted && !nextProps.errors;

    if (shouldClose) {
      this.props.onClose();
    }
  }

  componentWillReceiveProps(nextProps) {
    let {errors} = nextProps;
    if (!errors) {
      this.setState({errorMsg: null});

      return;
    }

    if (typeof errors === 'string') {
      this.setState({errorMsg: errors});

      return;
    }

    let {message: errorMsg = '', details} = errors;
    let hasDetails = details && details.length !== 0;

    if (hasDetails) {
      errorMsg = details.reduce(function (memo, error) {
        return `${memo} ${error.errors.join(' ')}`;
      }, '');
    }

    if (!errorMsg || !errorMsg.length) {
      errorMsg = null;
    }

    this.setState({errorMsg});
  }

  shouldForceUpdate() {
    return this.state.errorMsg && /force=true/.test(this.state.errorMsg);
  }

  getErrorMessage() {
    const {errorMsg = null} = this.state;

    if (!errorMsg) {
      return null;
    }

    if (this.shouldForceUpdate()) {
      let itemType = 'Service';

      if (this.props.service instanceof Pod) {
        itemType = 'Pod';
      }

      if (this.props.service instanceof ServiceTree) {
        itemType = 'Group';
      }

      return (
        <h4 className="text-align-center text-danger flush-top">
          {itemType} is currently locked by one or more deployments. Press the button
          again to forcefully change and deploy the new configuration.
        </h4>
      );
    }

    return (
      <h4 className="text-align-center text-danger flush-top">{errorMsg}</h4>
    );
  }

  render() {
    const {
      deleteItem,
      isPending,
      onClose,
      open,
      service
    } = this.props;

    let itemText = 'Service';
    let serviceName = '';

    if (service instanceof Pod) {
      itemText = 'Pod';
    }

    if (service instanceof ServiceTree) {
      itemText = 'Group';
    }

    if (service) {
      serviceName = service.getId();
    }

    let heading = (
      <ModalHeading className="text-danger">
        Destroy {itemText}
      </ModalHeading>
    );

    return (
      <Confirm
        disabled={isPending}
        header={heading}
        open={open}
        onClose={onClose}
        leftButtonText="Cancel"
        leftButtonCallback={onClose}
        rightButtonText={`Destroy ${itemText}`}
        rightButtonClassName="button button-danger"
        rightButtonCallback={deleteItem}
        showHeader={true}>
        <p>
          Destroying <span className="emphasize">{serviceName}</span> is irreversible. Are you sure you want to continue?
        </p>
        {this.getErrorMessage()}
      </Confirm>
    );
  }
}

ServiceDestroyModal.propTypes = {
  deleteItem: PropTypes.func.isRequired,
  errors: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.string
  ]),
  isPending: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  service: PropTypes.oneOfType([
    PropTypes.instanceOf(ServiceTree),
    PropTypes.instanceOf(Service)
  ]).isRequired
};

module.exports = ServiceDestroyModal;
