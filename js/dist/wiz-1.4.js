function MDSWizardClass() {
  var self = this;
  self.listeners = {};

  window.addEventListener('message', function(e) {
    switch (e.data.message) {
      case 'MDSWizard.saveRequest':
        (self.listeners.saveRequest || []).forEach(function(listener) {
          listener(e.data.token);
        });
        break;
    }
  });
}

MDSWizardClass.prototype.save = function(fields, token) {
  window.parent.postMessage({
    message: 'MDSWizard.save',
    fields: fields,
    token: token
  }, '*');
};

MDSWizardClass.prototype.on = function(event, listener) {
  if (typeof listener !== 'function') {
    throw new Error('listener must be function');
  }
  if (!this.listeners[event]) {
    this.listeners[event] = [];
  }
  this.listeners[event].push(listener);
};

MDSWizardClass.prototype.getFields = function () {
  return new Promise(function(resolve, reject) {
    window.parent.postMessage({ message: 'MDSWizard.getFields' }, '*');
    window.addEventListener('message', function(e) {
      switch (e.data.message) {
        case 'MDSWizard.getFields.res':
          e.data.fields.$path = e.data.path;
          resolve(e.data.fields);
          break;
        case 'MDSWizard.getFields.err':
          reject(e.data.error);
          break;
      }
    });
  });
};

MDSWizardClass.prototype.uploadDialog = function(type) {
  return new Promise(function(resolve, reject) {
    window.parent.postMessage({
      message: 'MDSWizard.uploadDialog',
      type: type
    }, '*');

    window.addEventListener('message', function(e) {
      switch (e.message) {
        case 'MDSWizard.uploadDialog.res':
          resolve(e.name);
          break;
        case 'MDSWizard.uploadDialog.err':
          reject(e.error);
          break;
      }
    });
  });
};

MDSWizard = new MDSWizardClass();