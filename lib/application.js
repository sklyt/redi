/**
 * ## The HQ, The hivemind
 * 
 * systems progamming(sorted data structure and buffers) -> application -> redi -> consumer
 *  
 *                                                         -----------
 * The application:
 * - Parses the formless TCP buffer(request) into data with semintent
 * - Based on the data decides whether to call the systems app or not. 
 * 
 * 
 */ 

import { Socket } from "net";
import parseBuffer from "./parser.js";
import { handleRequest } from "./request.js";
import debugLib from "./utils.js";

class Application{
    /**
     * Connection is hooks into redi as a callback to the tpc server.
     * 
     * Every connection is re-routed to this function where it is read and parsed
     * 
     * ```js
     * const application = new Application();
     * 
     * function createApp(){
     *     const server = createServer(application.connection)
          
     * }
     * 
     * ```
     */
 
    /**
     * 
     * @param {Socket} c 
     */
    connection(c){
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
           c.on("data", function(data){
            const parsed = parseBuffer(data)
            debugLib.Debug(`On data - Parsed  ${JSON.stringify(parsed)}`)
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