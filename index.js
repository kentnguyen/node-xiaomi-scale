const EventEmitter = require('events');
var noble = require('noble');

class MiScale extends EventEmitter {
    constructor(macAddr) {
        super();
        let self = this;

        this._macAddr = macAddr;

        noble.on('discover', function (foo) {
            self._nobleDiscoverListener(foo);
        });
    };

    _scaleListener(peripheral) {
        let scale = new Object();

        scale.address = peripheral.address;

        // Assume only single service is available on scale.
        scale.svcUUID = peripheral.advertisement.serviceData[0].uuid;
        scale.svcData = peripheral.advertisement.serviceData[0].data;
        scale.manufactureData = peripheral.advertisement.manufacturerData;
        scale.txPowerLevel = peripheral.advertisement.txPowerLevel;

        //Parse service data.
        let svcData = scale.svcData;

        scale.isStabilized = ((svcData[0] & (1<<5)) != 0) ? true : false;
        scale.loadRemoved = ((svcData[0] & (1<<7)) != 0) ? true : false;

        if((svcData[0] & (1<<4)) != 0) { // Chinese Catty
            scale.unit = "jin";
        } else if ((svcData[0] & 0x0F) == 0x03) { // Imperial pound
            scale.unit = "lbs";
        } else if ((svcData[0] & 0x0F) == 0x02) { // MKS kg
            scale.unit = "kg";
        } else {
            throw new Error("Invalid data!");
        }

        scale.weight = svcData.readUInt16LE(1) / 100;

        if(scale.unit == "kg") { //Convert chinese Catty to kg.
            scale.weight /= 2;
        }

        console.log(scale);
        this.emit('data', scale);
    };

    _nobleDiscoverListener(peripheral) {
        if(this._macAddr != undefined) {
            if(peripheral.address == this._macAddr &&
               peripheral.advertisement.localName == "MI_SCALE") {
                // Matched!
                this._scaleListener(peripheral);
            }
        } else {
            // Match any Xiaomi scale and send event.
            if(peripheral.advertisement.localName == "MI_SCALE") {
                //Matched!
                this._scaleListener(peripheral);
            }
        }
    };

    startScanning() {
        noble.on('stateChange', function(state) {
            if (state === 'poweredOn') {
                noble.startScanning([], true);
            }
        });
    };

    stopScanning() {
        noble.stopScanning();
    };
};

module.exports = MiScale;