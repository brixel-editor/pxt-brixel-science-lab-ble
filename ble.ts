// BRIXEL Science Lab Bluetooth companion: send measurements to Bowerbird Pro over BLE (Nordic UART).
// Kept out of brixel-science-lab so wired-only (USB) classes never start the BLE stack.
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

    // Same line format as the USB blocks: numbers only, comma-separated, newline-terminated.
    // Bowerbird drops a whole line if any field is not a number, so NaN/Infinity rows are skipped.
    function encode(values: number[]): string {
        if (!values || values.length == 0) return ""
        let line = ""
        for (let i = 0; i < values.length; i++) {
            let v = values[i]
            if (v != v || v - v != 0) return ""
            if (i > 0) line += ","
            line += "" + v
        }
        return line
    }

    export function trySend(values: number[]): boolean {
        let line = encode(values)
        if (line.length == 0 || !connected || sending) return false
        sending = true
        bluetooth.uartWriteString(line + "\n")
        sending = false
        return true
    }
}
