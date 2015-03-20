exports.add = function(a, b) { 			//#A
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

function logOp(a, b, op) {				//#B
    console.log('Computing ' + a + op + b);
}
