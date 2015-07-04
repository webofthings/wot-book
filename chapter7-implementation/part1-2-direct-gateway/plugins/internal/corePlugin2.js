var corePlugin = (function(model) {
  var interval, model, pluginName;
  var localParams = {'simulate': false, 'frequency': 2000};

  function start(params) {
    if(params) {
      localParams = params;
    }
    pluginName = model.name;

    if (params.simulate) {
      simulate();
    } else {
      connect();
    }
  };

  function stop(doStop){
    if (params.simulate) {
      clearInterval(interval);
    } else {
      doStop;
    }
    console.info('%s plugin stopped!', pluginName);
  };

  function showValue() {
    console.info('%s - value: %s' pluginName, model.value);
  };

  function simulate(doSimulate) {
    interval = setInterval(doSimulate, localParams.frequency);
    console.info('Simulated %s sensor started!', pluginName);
  };

  function connect() {
    throw new Error('Must be implemented by plugins!');
  }

  // Expose functions
  return {
    start : start,
    stop : stop,
    showValue : showValue,
    simulate : simulate
  };

})();

module.exports = corePlugin;