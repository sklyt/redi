/**
 * ## The HQ. The Hivemind.
 * 
 * systems programming (sorted data structures + buffers)
 *        ↓
 *     application
 *        ↓
 *        redi
 *        ↓
 *     consumer
 * 
 * The application:
 * - Parses the formless TCP buffer (raw request) into something with meaning.
 * - Based on that meaning, decides whether or not to call into the systems layer.
 */


import { Socket } from "net";
import parseBuffer from "./parser.js";
import { handleRequest } from "./request.js";
import debugLib from "./utils.js";

class Application {
    /**
     * `connection` is the hook — it plugs into redi as the TCP server's callback.
     * 
     * Every new connection gets routed through this function — where it's read and parsed.
     * 
     * ```js
     * const application = new Application();
     * 
     * function createApp() {
     *   const server = createServer(application.connection);
     * }
     * ```
     */


    /**
     * 
     * @param {Socket} c 
     */
    connection(c) {
        try {
            c.setKeepAlive(true, 10000); // Enable TCP keep-alive

            /**
             * This is where the magic happens, the decision making.
             * 
             * tcp recieves a raw formless buffer.
             * 
             * To make a decision we need to:
             *  - Parse the buffer to a protocol 
             *  - Based on the data and validity we move handling it.
             * 
             */
            c.on("data", function (data) {
                const parsed = parseBuffer(data)
                debugLib.Debug(`On data - Parsed  ${JSON.stringify(parsed, null, 4)}`)
                handleRequest(parsed, c)
            }) // inherit the class context as this

            c.on("error", err => {
                // error on the client side 
                c.destroy()
            })
        } catch (error) {

        }

    }

}



export default Application