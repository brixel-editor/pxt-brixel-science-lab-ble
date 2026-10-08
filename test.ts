scienceBluetooth.startBluetooth()
basic.forever(function () {
    if (scienceBluetooth.bluetoothConnected()) {
        scienceBluetooth.sendBluetooth([input.temperature(), input.lightLevel()])
        scienceBluetooth.sendValueBluetooth(input.temperature())
    }
    basic.pause(1000)
})
