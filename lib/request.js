import { Socket } from "net"


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

function doSet(){
    
}


/**
 * 
 * @param {{valid: boolean, data: Record<any, any>, cmd: string, errors: Array<string>}} data 
 * @param {Socket} c 
 */
function handleCommand(data, c){
   switch (data.cmd) {
    case "get":
        
        break;
    case "set":
          
        break;
    case "delete":
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