var CorePlugin = exports.CorePlugin = function(params, model) {
  this.params = params;
  this.model = model;
};

CorePlugin.prototype.start = function() {
    observe(this.model);

    if (this.params.simulate) {
      this.simulate();
    } else {
      this.connectHardware();
    }
};

CorePlugin.prototype.stop = function(doStopFunction) {
  if (params.simulate) {
    clearInterval(this.params.frequency);
  } else {
    if(doStopFunction) doStopFunction();
  }
  console.info('%s plugin stopped!', this.model.name);
}

CorePlugin.prototype.simulate = function() {
  this.interval = setInterval(function () {
    // Switch value on a regular basis
    if (me.value) {
      me.value = false;
    } else {
      me.value = true;
    }
  }, localParams.frequency);
  console.info('Simulated %s actuator started!', pluginName);
};

CorePlugin.prototype.connectHardware = function() {
  throw new Error('to be implemented by Plugin')
};

function observe(model, actionFunction) {
  Object.observe(model, function (changes) {
    console.info('Change detected by plugin for %s...', this.model.name);
    if(actionFunction) actionFunction();//switchOnOff(me.value);
  });
}

// plugin.observe(function () {
//  switchOnOff(value)
// })
// function switchOnOff(value) ...
// leds

// Use call" CorePlugin.call(this, model)

// util.inherits(Child, Parent)

// .prototype means instances will have it

