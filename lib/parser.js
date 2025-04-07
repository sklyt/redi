
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


/**
 * validate commands
 */
const cmdSet = new Set(["get", "set", "delete", "keys", "ping"])
function isCmd(cmd){
    return cmdSet.has(cmd);  // O(1) look
}

/**
 * validat data, we expect a string encoded data(stringified)
 */
function isValidData(data){
    return data != undefined && typeof data == "string"
}

/**
 * 
 * @param {Buffer} b 
 * @returns {{valid: boolean, data: Record<any, any>, cmd: string, errors: Array<string>}}
 */
export default function parseBuffer(b){
    let parsed = {}
    let offset = 0; // like a pointer
    // implementation
    const reqlen = b.readInt32BE(offset) // the first 4 bytes (4 spaces in array terms(32 bits)) 0 to 4 indices
    offset+=4;  // read four bytes

    const req = b.subarray(offset, reqlen)  // read the request 

    // reset the offset the request a new subarray buffer 
    offset = 0;
    const cmdlen = req.readInt32BE(offset) // 4 bytes gone again

    offset+=4;
    // console.log("cmd len: ", cmdlen, "offset :", offset)
  
    if(Number(cmdlen)){
        const cmd = req.subarray(offset, offset+cmdlen) // next offset is offset + cmdlen (cause they are already ran)  offset+cmdlen - starting from the offset read
        offset+=cmdlen; // new offset. read
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
       
        const datalen = req.readInt32BE(offset) // read 4 bytes 
        // console.log("data len", datalen)
        offset+=4;
        const data = req.subarray(offset, offset+datalen)  
        parsed["data"] = data.toString() 
       
    } 

    /**
     * boolean math
     * 
     * true && true = true 
     * true && false = false
     * 
     * if any of isCmd and IsValidData returns false, the request is invalid
     * 
     */

    const isValidCmd = isCmd(parsed["cmd"])
    const isValidData_ = isValidData(parsed["data"])
    parsed["valid"] = isValidCmd && isValidData_
    const errors = []
    if(!parsed["valid"]){
      !isValidCmd && errors.push("cmdInvalid")  // if not valid, the second statement && will be called 
      !isValidData_ && errors.push("dataInvalid") 
    }
    parsed["errors"] = errors
    // console.log("parsed: ", parsed)
    return parsed
}