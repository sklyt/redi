import { Socket } from "net"
import debugLib from "./utils.js"
import OPATABLE from "./structures/hashtable.js"
import AVLTREE from "./structures/AVL.js"


/**
   * 
   * @param {{valid: boolean, data: Record<any, any>, cmd: string, errors: Array<string>}} data 
   * @param {Socket} c 
   */
export async function handleRequest(data, c) {
    // pseudo handling the request 
    // console.log("req :", data)
    if (!data.valid) {
        handleError("invalidrequest", data.errors, c)
        return
    }
    if (data.cmd == "ping") {
        const statusCode = Buffer.alloc(4)
        statusCode.writeInt32BE(200)
        c.write(statusCode)
        c.end()
        return
    }

    handleCommand(data, c)
}

/**
           *       * flags is data encoding -> [string, array, number, json]
           *                                     0        1     2       3
           */

function encodeData(data, encoding) {

}

/**
 * 
 * @param {{valid: boolean, data: {key: string, value: Record<any, any>, encoding: number}, cmd: string, errors: Array<string>}} data 
 * @param {Socket} c 
 */
function handleCommand(data, c) {
    let statusCode;
    let encoding;
    let res;
    let resplen = Buffer.alloc(4)
    switch (data.cmd) {
        case "get":
            debugLib.Debug(`get Data ${JSON.stringify(data, null, 4)}`)
            //  res= OPATABLE.get(data.data.key)
            res = AVLTREE.getValue(data.data.key)
            if (res != null)
                debugLib.Debug(`got ${JSON.stringify(res, null, 4)}`)


            statusCode = Buffer.alloc(4)
            encoding = Buffer.alloc(4)
            if (res) {
                statusCode.writeInt32BE(200)
                encoding.writeInt32BE(res.encoding)
            } else {
                statusCode.writeInt32BE(400)
                c.write(statusCode)
                c.end()
                return
            }
            // [statuscode, resplen, datalen, data, encoding]

            const res_ = Buffer.from(JSON.stringify(res.value))
            const combined = Buffer.concat([statusCode, encoding, res_])

            c.write(combined)
            c.end()
            break;
        case "set":
            debugLib.Debug(`set Data ${JSON.stringify(data, null, 4)}`)
            //   res = OPATABLE.set(data.data.key, {value: data.data.value, encoding: data.data.encoding})
            res = AVLTREE.add({ value: data.data.value }, data.data.key, data.data.encoding)
            debugLib.Debug(`avl set status: ${res}`,)
            //   debugLib.Debug(`OPATABLE ${JSON.stringify(OPATABLE, null, 4)}`)
            AVLTREE.printTree()
            statusCode = Buffer.alloc(4)
            statusCode.writeInt32BE(200)
            c.write(statusCode)
            c.end()
            break;
        case "delete":
            // res = OPATABLE.delete(data.data.key)
            res = AVLTREE.remove(data.data.key)
            statusCode = Buffer.alloc(4)
            if (res) {
                statusCode.writeInt32BE(200)
            } else {
                statusCode.writeInt32BE(400)
            }
            c.write(statusCode)
            c.end()
            break;
        case "keys":
            break;
        default:
            break;
    }
}

function handleError(type, errors, c) {
    switch (type) {
        case "invalidrequest":
            // would handle error
            const statusCode = Buffer.alloc(4)
            statusCode.writeInt32BE(500)
            c.write(statusCode) // we don't care about the msg response we need to know the server can respond
            c.end()
            break;

        default:
            break;
    }
}




/**
 * TODO: 
 *   - handle cmd function (will map to system data structure) (GET, SET, DELETE, KEYS)
 *   - Implement a singleton hashtable to complement all the 
 *   - write basic tests
 *   - 
 */