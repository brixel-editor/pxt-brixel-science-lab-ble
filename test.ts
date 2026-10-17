// Compile check: this Bluetooth edition alone must expose the Science Lab blocks.
scienceBluetooth.startBluetooth()
basic.forever(function () {
    if (scienceBluetooth.bluetoothConnected()) {
        let water = scienceWater.temperature(ScienceDigitalPin.P8, 1)
        scienceBluetooth.sendBluetooth([water, scienceLight.light(ScienceAnalogPin.P1)])
        scienceBluetooth.sendValueBluetooth(input.temperature())
    }
    scienceData.sendValueUSB(scienceLight.light(ScienceAnalogPin.P1))
    basic.pause(1000)
})
