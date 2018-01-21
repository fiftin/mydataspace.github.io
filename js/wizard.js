function MDSWizardClass() {
  this.listeners = {};

  window.addEventListener('message', function(e) {
    switch (e.message) {
      case 'MDSWizard.beforeSave':
        (self.listeners.beforeSave || []).forEach(function(listener) {
          listener();
        });
        break;
    }
  });
}


MDSWizardClass.prototype.on = function(event, listener) {
  if (typeof listener !== 'function') {
    throw new Error('listener must be function');
  }
  this.listeners[event] = listener;
};


MDSWizardClass.prototype.uploadDialog = function(type) {
  return new Promise(function(resolve, reject) {
    window.opener.postMessage({
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