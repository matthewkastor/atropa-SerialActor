var SerialActor = require('../src/atropa-SerialActor.js');

try {
    Object.keys(SerialActor).forEach(
        function (prop) {
            if(!atropa[prop]) {
                atropa[prop] = SerialActor[prop];
            }
        }
    );
} catch (ignore) {
    atropa = require('../src/atropa-SerialActor.js');
}

Object.keys(SerialActor.data).filter(
    function (prop) {
        return prop !== 'requirements';
    }
).forEach(
    function (prop) {
        atropa.data[prop] = SerialActor.data[prop];
    }
);
