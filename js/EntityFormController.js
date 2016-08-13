function EntityFormController() {
  ;
}

EntityFormController.prototype.save = function() {
  return Mydataspace.entities.request('change');
};