

/**
 * Controller for pricing page.
 * @param {object} options
 * @param {string} options.sendButton
 * @param {string} options.modal
 * @param {string} options.errorLabel
 * @param {string} options.sentModal
 * @param {string} options.plan
 * @constructor
 */
function PlanUpgradeModal(options) {
  this.options =     options;
  this.$sendButton = $('#' + options.sendButton);
  this.$modal =      $('#' + options.modal);
  this.errorLabel =  document.getElementById(options.errorLabel);
  this.$sentModal =  $('#' + options.sentModal);
}

/**
 *
 * @param {boolean} [needClear]
 */
PlanUpgradeModal.prototype.showModal = function (needClear) {
  if (needClear) {
    this.errorLabel.innerText = '';
  }
  this.$modal.modal('show');
};

PlanUpgradeModal.prototype.send = function () {
  var self = this;

  Mydataspace.request('users.changeMyPlan', {
    plan: this.options.plan
  }).then(function (data) {
    self.$modal.modal('hide');
    self.$sentModal.modal('show');

    var currentPlan = document.getElementById('pricing_list').querySelector('.pricing_block--active');
    if (currentPlan) {
      currentPlan.classList.remove('pricing_block--active');
    }

    document.getElementById('pricing_block__' + data.plan).classList.add('pricing_block--active');
  }, function (err) {
    console.log(err);
    self.errorLabel.innerText = err.message;
  });
};

PlanUpgradeModal.prototype.init = function () {
  var self = this;

  self.$sendButton.click(function () {
    if (!Mydataspace.isLoggedIn()) {
      Mydataspace.on('login', function () {
        setTimeout(function() {
          self.showModal();
          self.send();
        }, 300);
      });

      self.$modal.modal('hide');
      setTimeout(function() {
        $('#signin_modal').modal('show');
      }, 300);
      return;
    }

    self.send();
  });
};




/**
 * Controller for pricing page.
 * @constructor
 */
function PricingPage() {
  this.pricingList = document.getElementById('pricing_list');
  this.free = document.getElementById('pricing_block__free');
  this.personal = document.getElementById('pricing_block__personal');
  this.trialMonths = document.getElementById('pricing_block__trial');

  this.contactUs = new ContactModal({
    errorLabel: 'give_feedback_modal__error',
    modal: 'request_unlimited_modal',
    sendButton: 'request_unlimited_modal__button',
    sentModal: 'request_unlimited_sent_modal',
    textInput: 'request_unlimited_modal__text',
    root: 'contact',
    path: 'data'
  });

  this.upgradeToPro = new ContactModal({
    errorLabel: 'professional_plan_unavailable_modal__error',
    modal: 'professional_plan_unavailable_modal',
    sendButton: 'professional_plan_unavailable_modal__send',
    sentModal: 'professional_plan_unavailable_sent_modal',
    textInput: 'professional_plan_unavailable_modal__text',
    root: 'contact',
    path: 'data'
  });

  this.upgradeToPersonal = new PlanUpgradeModal({
    errorLabel: 'personal_plan_upgrade_modal__error',
    modal: 'personal_plan_upgrade_modal',
    sendButton: 'personal_plan_upgrade_modal__send',
    sentModal: 'pricing_page_changed_plan',
    plan: 'personal'
  });

  this.downgradeToFree = new PlanUpgradeModal({
    errorLabel: 'free_plan_downgrade_modal__error',
    modal: 'free_plan_downgrade_modal',
    sendButton: 'free_plan_downgrade_modal__send',
    sentModal: 'pricing_page_changed_plan',
    plan: 'free'
  });
}

/**
 * Returns instance of PricingPage.
 * @returns {PricingPage}
 */
PricingPage.instance = function () {
  if (!PricingPage._instance) {
    PricingPage._instance = new PricingPage({});
  }
  return PricingPage._instance;
};

PricingPage.prototype.update = function () {
  var self = this;
  if (Mydataspace.isLoggedIn()) {
    Mydataspace.request('users.getMyProfile', {}).then(function (data) {
      self[data.plan].classList.add('pricing_block--active');
      self.pricingList.classList.add('pricing_list--logged-in');
    }).catch(function (err) {
      alert(err.message);
    });
  } else {
    this.personal.classList.remove('pricing_block--active');
    this.pricingList.classList.remove('pricing_list--logged-in');
  }
};

PricingPage.prototype.init = function () {
  var self = this;
  self.update();

  Mydataspace.on('login', function () { self.update() });
  Mydataspace.on('logout', function () { self.update() });

  self.contactUs.init();
  self.upgradeToPro.init();
  self.upgradeToPersonal.init();
  self.downgradeToFree.init();
};


PricingPage.prototype.createWebsite = function () {
  if (!Mydataspace.isLoggedIn()) {
    Mydataspace.once('login', function () {
      location.href = '/';
    });
    setTimeout(function() {
      $('#signin_modal').modal('show');
    }, 300);
  }
};