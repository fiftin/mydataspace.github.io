var MDSConsole = {
  /**
   * Posts message to console.
   */
  post: function(type, message) {
    var logRecord = document.createElement('div');
    logRecord.classList.add('run_script__console_record');
    logRecord.textContent = message;
    var console = document.getElementById('run_script__console');
    console.appendChild(logRecord);
    console.scrollTop = console.scrollHeight - console.clientHeight;
    logRecord.classList.add('run_script__console_record--' + type);
  },

  log: function(message) { MDSConsole.post('log', message) },
  info: function(message) { MDSConsole.post('info', message) },
  warn: function(message) { MDSConsole.post('warn', message) },

  system: function(message) { MDSConsole.post('system', message) },

  /**
   * Call this method when one of the subtasks completed with error. But script
   * does not stopped.
   */
  error: function(message) { MDSConsole.post('error', message) },

  /**
   * Call this method when one of the subtasks successfully completed.
   */
  ok: function(message) { MDSConsole.post('ok', message) },

  /**
   * Script successful completed. Call this method at the and or your script.
   */
  success: function(message) {
    document.getElementById('run_script__state').classList.remove('fa-spin');
    document.getElementById('run_script__state').classList.remove('fa-cog');
    document.getElementById('run_script__state').classList.remove('run_script__state--run');
    document.getElementById('run_script__state').classList.add('fa-check');
    document.getElementById('run_script__state').classList.add('run_script__state--success');
    if (message == null) {
      message = 'The script completed successfully';
    }
    MDSConsole.post('success', message)
  },

  /**
   * Script failed. Call this method when script finished by error.
   */
  fail: function(message) {
    if (message == null) {
      message = 'The script failed';
    }
    document.getElementById('run_script__state').classList.remove('fa-spin');
    document.getElementById('run_script__state').classList.remove('fa-cog');
    document.getElementById('run_script__state').classList.remove('run_script__state--run');
    document.getElementById('run_script__state').classList.add('fa-times');
    document.getElementById('run_script__state').classList.add('run_script__state--fail');
    MDSConsole.error(message);
  }
};
