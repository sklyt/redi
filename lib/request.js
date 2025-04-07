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