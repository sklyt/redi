/**
 *  (Literate Programming)
 * 
 * ## Create App
 * 
 * `createApp` is the outer-outer wrapper — the "API", the public interface.
 * It's what applications and modules will actually consume.
 * 
 * Kind of like express.js:
 * 
 * ```js
 * const app = express();
 * ```
 * 
 * Ours is redi:
 * 
 * ```js
 * const app = redi(); // redi, 'cause it's a Redis bootleg :)
 * ```
 * 
 * ## High-Level Visual
 * 
 * systems programming (sorted data structures + buffers) 
 *        ↓
 *   application logic 
 *        ↓
 *        redi 
 *        ↓
 *     consumer (you)
 * 
 * 
 * ### Application
 * 
 * Sits between systems logic and `createApp`.
 * 
 * It exposes the TCP server and acts as the translator between low-level logic and higher-level protocol handling.
 * 
 * #### Communication Flow
 * 
 * outside world (get, set, etc) 
 *        ↓
 *       redi
 *        ↓
 *   application logic
 *        ↓
 *  systems-level logic
 */



import { createServer } from "node:net"
import Application from "./application.js"
import debugLib from "./utils.js";



const application = new Application();


/**
 * 
 * @param {{PORT: number, serverErrorCb: Function, DEBUG: boolean}} config 
 */
function createApp(config) {

  debugLib.setDebug(config.DEBUG)

  /**
* ## TCP Server
* 
* The absolute base layer of a reliable network.
* 
* ### Properties of a TCP server:
*   - Low-level
*   - Formless, protocol-less
*   - Talks in raw binary (buffers)
* 
* We want control — raw, unparsed, low-level binary data.
* 
* ### Visual of a TCP Socket:
* 
* Network stack (hardware + kernel)
*        ↕
*     TCP socket
*        ↕
*    Binary data
*        ↕
*   Protocols & parsers (e.g., HTTP + http-parser)
* 
* We’re skipping HTTP — it’s bloated for our needs.
* 
* We only support 4 commands:
*   - Get
*   - Set
*   - Delete
*   - Keys (still debating this one)
* 
* So instead of using HTTP, we’re rolling our own thin protocol + parser.
* 
* ### Application
* 
* The HQ. The brain.
* See `application.js`.
*/

  const server = createServer(application.connection) // re-routing the connection to the HQ



  server.on("error", config.serverErrorCb)
  server.listen(config.PORT)

  // graceful shutdown
  return function close(c) {
    server.close(() => { debugLib.Debug("server closed", "info"); c() })

  }

}



// test

export default createApp

