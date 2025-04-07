/**
 *  (Literate Programming)
 * 
 * ## Create App
 * 
 * Create App is the outer outer wrapper, The "API" or the interface. What applications and modules consume
 * 
 * like express.js:
 * 
 * ```js
 * 
 * const app = express()
 * ```
 * 
 * redi:
 * 
 * ```js
 * const app = redi(); // redi because it redis bootleg :)
 * ```
 * 
 * ## High Level Visual
 * 
 *  systems progamming(sorted data structure and buffers) -> application -> redi -> consumer
 *                                                                          ----
 * 
 * 
 * 
 * ### Application
 * 
 * Is the interface between systems and create app with exposes a tcp server, 
 * 
 * #### Communication order
 * 
 *  outside world(get, set etc) -> redi ->  application -> systems 
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
     * ## TCP server
     * 
     *   The lowest representation of a realiable network
     *    
     *   Propeties of a TCP server:
     *     - Low level 
     *     - formless and protocol less 
     *     - communicate in raw binary(buffers)
     *   
     * We want lower level control of binary data(formless and unparsed)
     * 
     * ### Visual of a TCP socket 
     *   
     *  Network Stack(hardware & kernel) <-> TCP socket <-> Binary data <-> protocols & parses(e.g HTTP && http parser)
     * 
     * we don't need HTTP it's bloated for our purpose. we only have 4 commands:
     *  - Get 
     *  - Set
     *  - Delete
     *  - Keys(undecided whether to include)
     * 
     * Instead of HTTP we put our own thin protocol and develop our own parser.
     * 
     * 
     * ### Application 
     * 
     * The HQ, the brain see application.js
     */
    const server = createServer(application.connection) // re-routing the connection to the HQ

    

    server.on("error", config.serverErrorCb)
    server.listen(config.PORT)

     // graceful shutdown
  return function close(c){
    server.close(()=> {debugLib.Debug("server closed", "info");   c()})
  
  }

}



// test

export default createApp