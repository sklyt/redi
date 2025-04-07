
/**
 * ## Parser 
 * 
 * Buffer(formeless) -> Give it form and meaning -> JavaScript Object 
 * 
 * 
 * protocol:
 * 
 * 
 * [req size|[req]]
 * 
 * req -> [command size, command, data size, data]
 * 
 * 
 * 
 * In TCP (and most Internet protocols), multi‐byte integers are sent in **network byte order**, which is **big‑endian**. So when you do:

```js
reqlen.writeInt32BE(buf.byteLength, 0)
```

you’re explicitly writing the 32‑bit length prefix in big‑endian (network) order, which is exactly what you want.

In little endians the network stack does the reversal
 * 
 */

import debugLib from "./utils.js";


/**
 * validate commands
 */
const cmdSet = new Set(["get", "set", "delete", "keys", "ping"])
function isCmd(cmd) {
    return cmdSet.has(cmd);  // O(1) look
}

/**
 * validate data, we expect a string encoded data(stringified)
 */
function isValidData(data) {

    if (typeof data == "object") {
        const k = ["key", "value", "encoding"]
        if (typeof data === 'object' && Object.keys(data).every(key => k.includes(key))) {
            // your code here
            return true
        }
        return false
    }
    return data != undefined && typeof data == "string"
}


/**
 * decoded the data
 * 
 *   * flags is data encoding -> [string, array, number, json]
                                   0        1     2       3
 * 
 */

function decode(data, flag) {
    /**
     * TODO: error handling 
     */
    switch (flag) {
        case 0:
            return data  // already a string
        case 1:
            return JSON.parse(data.toString())  // arrays in the client will be encoded as value, value, value
        case 2:
            return Number(data)

        case 3:
            return JSON.parse(data.toString())

        default:
            break;
    }
}

/**
 * 
 * @param {Buffer} b 
 * @returns {{valid: boolean, data: Record<any, any>, cmd: string, errors: Array<string>}}
 */
export default function parseBuffer(b) {
    let parsed = {}
    let offset = 0; // like a pointer
    // implementation
    const reqlen = b.readInt32BE(offset) // the first 4 bytes (4 spaces in array terms(32 bits)) 0 to 4 indices
    offset += 4;  // read four bytes

    const req = b.subarray(offset, reqlen)  // read the request 

    // reset the offset the request a new subarray buffer 
    offset = 0;
    const cmdlen = req.readInt32BE(offset) // 4 bytes gone again

    offset += 4;
    // console.log("cmd len: ", cmdlen, "offset :", offset)

    if (Number(cmdlen)) {
        const cmd = req.subarray(offset, offset + cmdlen) // next offset is offset + cmdlen (cause they are already ran)  offset+cmdlen - starting from the offset read
        offset += cmdlen; // new offset. read
        /**
   * toString is a buffer helper
   * 
   * I assume it's just a text decoder 
   * 
   * ```js
   *  const decode = new TextDecoder() // takes in raw bytes(int8) and returns text
   * ```
   */
        parsed["cmd"] = cmd.toString()



        /**
         * Only the set command is expected to send data 
         */

        if (parsed["cmd"] == "set") {
            const datalen = req.readInt32BE(offset) // read 4 bytes 
            // console.log("data len", datalen)
            debugLib.Debug(`data len: ${datalen}`, "info")
            offset += 4;
            const data = req.subarray(offset, offset + datalen)

            /**
             *  data encodes more data intself  [keylength, key, valuelen value, flags]
             * 
             * The initial protocol 
             * 
             * [req size|[req]]
             * 
             * req -> [command size, command, data size, data]
             * 
             * extension for set:
             * 
             * data -> [keylength, key, valuelen, value, flags]
             * 
             * flags is data encoding -> [string, array, number, json]
             *                             0        1     2       3
             * 
             * 
             * Encoding is important if we intend to support more functionality like incre for numbers etc
             */

            // reset the offset (new buffer)
            offset = 0;
            const keylength = data.readInt32BE(offset)
            offset += 4;
            const key = data.subarray(offset, offset + keylength)
            offset += keylength;

            debugLib.Debug(key.toString())
            const valuelength = data.readInt32BE(offset)
            offset += 4;
            const value = data.subarray(offset, offset + valuelength)
            offset += valuelength;

            debugLib.Debug(value.toString())
            const flag = data.readInt32BE(offset)
            debugLib.Debug(flag)

            // decode

            // validate
            parsed["data"] = { key: key.toString(), value: decode(value, flag), encoding: flag }
        } else if (parsed["cmd"] == "get" || parsed["cmd"] == "delete") {
            const datalen = req.readInt32BE(offset) // read 4 bytes 
            debugLib.Debug(`data len: ${datalen}`, "info")
            offset += 4;
            const data = req.subarray(offset, offset + datalen)
            offset = 0;
            const keylength = data.readInt32BE(offset)
            offset += 4;
            const key = data.subarray(offset, offset + keylength)
            offset += keylength;

            debugLib.Debug(key.toString())

            parsed["data"] = {key: key.toString(), value: "", encoding:-1}
        }else {
            parsed["data"] = ""
        }


    }

    /**
     * boolean math
     * 
     * true && true = true 
     * true && false = false
     * 
     * if any of isCmd and IsValidData returns false, the request is invalid
     * 
     * 
     */

    const isValidCmd = isCmd(parsed["cmd"])
    const isValidData_ = isValidData(parsed["data"])
    parsed["valid"] = isValidCmd && isValidData_
    const errors = []
    if (!parsed["valid"]) {
        !isValidCmd && errors.push("cmdInvalid")  // if not valid, the second statement && will be called 
        !isValidData_ && errors.push("dataInvalid")
    }
    parsed["errors"] = errors
    // console.log("parsed: ", parsed)
    debugLib.Debug(`parsed ${JSON.stringify(parsed, null, 4)}`, "info")
    return parsed
}