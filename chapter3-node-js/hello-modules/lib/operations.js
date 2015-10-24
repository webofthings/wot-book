exports.add = function(a, b) {  //#A
  logOp(a, b, '+');
  return a + b;
}

exports.sub = function(a, b) {
  logOp(a, b, '-');
  return a - b;
}

exports.mul = function(a, b) {
  logOp(a, b, '*');
  return a * b;
}

function logOp(a, b, op) {  //#B
  console.log('Computing ' + a + op + b);
}

//#A The exports object is used to make a function of our module available to the module users
//#B The logOp function is internal to this module and will not be available from outside this file

