/**
 * Controller for pricing page.
 * @constructor
 */
function PricingPage() {
  this.$textInput = $('#request_unlimited_modal__text');
  this.$sendButton = $('#request_unlimited_modal__button');
  this.$modal = $('#request_unlimited_modal');
  this.textInput = document.getElementById('request_unlimited_modal__text');
  this.errorLabel = document.getElementById('give_feedback_modal__error');
  this.$sentModal = $('#request_unlimited_sent_modal');
  this.pricingList = document.getElementById('pricing_list');
  this.personal = document.getElementById('pricing_block__personal');
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
  if (Mydataspace.isLoggedIn()) {
    this.personal.classList.add('pricing_block--active');
    this.pricingList.classList.add('pricing_list--logged-in');
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