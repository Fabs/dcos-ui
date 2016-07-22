import deepEqual from 'deep-equal';

import {
  REQUEST_DCOS_METADATA,
  REQUEST_METADATA,
  SERVER_ACTION
} from '../constants/ActionTypes';
import AppDispatcher from '../events/AppDispatcher';
import Config from '../config/Config';
import {
  DCOS_METADATA_CHANGE,
  METADATA_CHANGE
} from '../constants/EventTypes';
import GetSetBaseStore from './GetSetBaseStore';
import MetadataActions from '../events/MetadataActions';
import PluginSDK from 'PluginSDK';

class MetadataStore extends GetSetBaseStore {
  constructor() {
    super(...arguments);

    PluginSDK.addStoreConfig({
      store: this,
      storeID: this.storeID,
      events: {
        success: METADATA_CHANGE,
        dcosSuccess: DCOS_METADATA_CHANGE
      },
      unmountWhen: function () {
        return true;
      },
      listenAlways: true
    });

    this.dispatcherIndex = AppDispatcher.register((payload) => {
      var source = payload.source;
      if (source !== SERVER_ACTION) {
        return false;
      }

      var action = payload.action;

      switch (action.type) {
        case REQUEST_METADATA:
          var oldMetadata = this.get('metadata');
          var metadata = action.data;

          // only emitting on change
          if (!deepEqual(oldMetadata, metadata)) {
            this.set({metadata});
            this.emitChange(METADATA_CHANGE);
          }
          break;
        case REQUEST_DCOS_METADATA:
          var oldDCOSMetadata = this.get('dcosMetadata');
          var dcosMetadata = action.data;

          // only emitting on change
          if (!deepEqual(oldDCOSMetadata, dcosMetadata)) {
            this.set({dcosMetadata});
            this.emitChange(DCOS_METADATA_CHANGE);
          }
          break;
      }

      return true;
    });
  }

  init() {
    this.set({
      metadata: {}
    });
    MetadataActions.fetch();
  }

  // TODO: DCOS-7430 - Remove emitChange method
  emitChange(eventName) {
    this.emit(eventName);
  }

  addChangeListener(eventName, callback) {
    this.on(eventName, callback);
  }

  removeChangeListener(eventName, callback) {
    this.removeListener(eventName, callback);
  }

  buildDocsURI(path) {
    let metadata = this.get('dcosMetadata');
    let version = metadata && metadata.version || 'latest';
    version = version.split('-')[0];
    let docsVersion = version.replace(/(.*?)\.(.*?)\..*/, '$1.$2');
    return `${Config.documentationURI}/${docsVersion}${path}`;
  }

  get storeID() {
    return 'metadata';
  }

}

module.exports = new MetadataStore();
