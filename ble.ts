// BRIXEL Science Lab Bluetooth companion: send measurements to Bowerbird Pro over BLE (Nordic UART).
// Kept out of brixel-science-lab so wired-only (USB) classes never start the BLE stack.
// v0.2.0: this extension depends on brixel-science-lab (pinned tag), so adding only this one brings every Science Lab block.
// Block ids match the ones that used to live in brixel-science-lab, so saved projects reconnect.
//% color=#247BA0 weight=89 icon="\uf294" block="Bowerbird Bluetooth"
//% groups='["Connect","Send"]'
namespace scienceBluetooth {
    let started = false
    let connected = false
    let sending = false

    /** Run once at program start. In Bowerbird choose micro:bit Bluetooth and connect. */
    //% blockId=science_ble_start block="start Bluetooth connection" group="Connect" weight=100
    export function startBluetooth(): void {
        if (started) return
        started = true
        bluetooth.onBluetoothConnected(function () { connected = true })
        bluetooth.onBluetoothDisconnected(function () { connected = false })
        bluetooth.startUartService()
        // Intelligent Science Lab ON blocks (main extension) talk to DSL On 2 over BLE once Bluetooth is started.
        scienceOn.sendHook = function (line: string): boolean {
            if (!connected || sending) return false
            sending = true
            bluetooth.uartWriteString(line)
            sending = false
            return true
        }
        bluetooth.onUartDataReceived(serial.delimiters(Delimiters.NewLine), function () {
            scienceOn.handleReply(bluetooth.uartReadUntil(serial.delimiters(Delimiters.NewLine)))
        })
    }

    /** True once Bowerbird has connected to the board. */
    //% blockId=science_ble_connected block="Bluetooth connected" group="Connect" weight=90
    export function bluetoothConnected(): boolean { return connected }

    /** Put several sensor readings in the array in order; they are sent together as one comma-separated line. Nothing is sent before connection. No headers or units are sent. */
    //% blockId=science_send_ble block="send values $values to Bowerbird by Bluetooth" group="Send" weight=80
    export function sendBluetooth(values: number[]): void { trySend(values) }

    /** Put a single sensor reading in this block. Nothing is sent before connection. */
    //% blockId=science_send_one_ble block="send measurement $value to Bowerbird by Bluetooth" group="Send" weight=70
    export function sendValueBluetooth(value: number): void { trySend([value]) }

    export function trySend(values: number[]): boolean {
        let line = scienceData.encode(values)  // same rule as the USB blocks (main extension)
        if (line.length == 0 || !connected || sending) return false
        sending = true
        bluetooth.uartWriteString(line + "\n")
        sending = false
        return true
    }
}
