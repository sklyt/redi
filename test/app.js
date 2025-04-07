import { equal } from 'assert';
import net from "node:net"

/**
 *  pnpm add -D mocha
 * 
 * We'll use mocha for **basic** unit testing and sanity check.
 * 
 * Test are not complicated, we are simulating expected user interaction. And see if our application bahaves as expected.
 * 
 *  Unless you are an QA don't complicate them.
 * 
 * 
 *
 */

import createApp from "../lib/redi.js"
import { Socket } from 'net';
import debugLib from '../lib/utils.js';


/**
 * There's a repeating pattern for encoding data:
 * const cmd = Buffer.from("pin") // ping command, not a command
           const data = Buffer.from("alive?") // abitrary data
           const reqlen = Buffer.alloc(4) // allocate 32 bits
           const cmdlen = Buffer.alloc(4) // allocate 32 bits
           const datalen = Buffer.alloc(4) 

      we can abstract it to functions 
 */

/**
 * 
 * @param {*} cmd 
 * @param {{key: string, value: Array<any> | Record<any,any> | string | undefined}} toSetData 
 */
function encodeCommand(cmd, toSetData = undefined) {
  const cmd_ = Buffer.from(cmd) // ping command

  const cmdlen = Buffer.alloc(4) // allocate 32 bits
  cmdlen.writeInt32BE(cmd_.byteLength, 0)
  /**
   * req -> [command size, command, data size, data]
   *  
   * data -> [keylength, key, valuelen, value, flags]
   */
  let combinedDatabuffer;
  const reqlen = Buffer.alloc(4)
  const datalen = Buffer.alloc(4)




  if (cmd == "set" && toSetData) {

    let data;
    const valuelen = Buffer.alloc(4)
    const keylen = Buffer.alloc(4)
    const flagBuf = Buffer.alloc(4)

    let flag = 0;
    /**
     * const m = []
     *  typeof m // 'object'
     * 
     */
    if (typeof toSetData.value == "object") {
      data = JSON.stringify(toSetData.value)
      if (Array.isArray(toSetData.value))
        flag = 1
      else
        flag = 3
    } else {
      data = toSetData.value // just a string
      if (typeof data == "number")
        flag = 2;

    }

    const value = Buffer.from(data)
    valuelen.writeInt32BE(value.byteLength, 0)

    const key = Buffer.from(toSetData.key)
    keylen.writeInt32BE(key.byteLength, 0)

    flagBuf.writeInt32BE(flag, 0)
    combinedDatabuffer = Buffer.concat([keylen, key, valuelen, value, flagBuf])


  }


  /**
   * Constructing the full request:
   * 
    * [req size|[req]]
    * 
    * req -> [command size, command, data size, data]
   */


  let req

  if (cmd == "set") {
    reqlen.writeInt32BE((4 + cmdlen.byteLength + cmd_.byteLength + datalen.byteLength + combinedDatabuffer.byteLength), 0)
    datalen.writeInt32BE(combinedDatabuffer.byteLength, 0)
    req = Buffer.concat([reqlen, cmdlen, cmd_, datalen, combinedDatabuffer])
  }
  else{
    reqlen.writeInt32BE((4 + cmdlen.byteLength + cmd_.byteLength), 0)
    req = Buffer.concat([reqlen, cmdlen, cmd_])
  }
    


  return req


}

describe('application', function () {
  let redi;
  this.beforeEach((done) => {
    redi = createApp({
      PORT: 3000, DEBUG: false, serverErrorCb: (ERR) => {
        console.log("abort")
        return
      }
    })

    done()
  })

  this.afterEach((done) => {
    redi(done)

  })
  it("should ping the server", async () => {
    /**
     * @type {Socket}
     */
    const client = new net.Socket();

    const connectToServer = () => {
      return new Promise((resolve, reject) => {
        client.connect(3000, '127.0.0.1', () => {
          debugLib.Debug("Test::app Client Connected", "info")
          const cmd = Buffer.from("ping") // ping command
          const data = Buffer.from("alive?") // abitrary data
          const reqlen = Buffer.alloc(4) // allocate 32 bits
          const cmdlen = Buffer.alloc(4) // allocate 32 bits
          const datalen = Buffer.alloc(4)
          /**
           * Network byte order is Big Endien, for little endiens the byte order is reversed.
           * https://www.reddit.com/r/compsci/comments/134b2tg/big_vs_little_endian_does_it_even_matter_today/
           * Little-endian:
              Stores the least significant byte (LSB) at the lowest memory address.
              Used in many modern processors, including those from Intel and AMD, due to its computational efficiency.
              Predominant in personal computing, especially within systems utilizing x86 architecture.
              Big-endian:
              Stores the most significant byte (MSB) at the lowest memory address.
              Used in network protocols, where it's referred to as "network byte order".
               Commonly used in mainframe computers.

               In TCP (and most Internet protocols), multi‐byte integers are sent in **network byte order**, which is **big‑endian**. So when you do:

              ```js
              reqlen.writeInt32BE(buf.byteLength, 0)
              ```

              you’re explicitly writing the 32‑bit length prefix in big‑endian (network) order, which is exactly what you want.
           */

          cmdlen.writeInt32BE(cmd.byteLength, 0)
          datalen.writeInt32BE(data.byteLength, 0)

          reqlen.writeInt32BE((4 + cmd.byteLength + data.byteLength + cmdlen.byteLength + datalen.byteLength), 0)

          const combinedbuffer = Buffer.concat([reqlen, cmdlen, cmd, datalen, data])  // reflects our parser
          client.write(combinedbuffer) // send the entire request
        });

        client.on("data", data => {

          resolve(true)
        })

        client.on('error', (err) => {
          console.log(err)
          reject(false);
        });
      });
    };

    const res = await connectToServer()
    equal(res, true);

  })

  it("should error ping command invalid", async () => {
    /**
    * @type {Socket}
    */
    const client = new net.Socket();

    const connectToServer = () => {
      this.timeout(3000);
      return new Promise((resolve, reject) => {
        client.connect(3000, '127.0.0.1', () => {
          debugLib.Debug("Test::app Client Connected", "info")
          const cmd = Buffer.from("pin") // ping command, not a command
          const data = Buffer.from("alive?") // abitrary data
          const reqlen = Buffer.alloc(4) // allocate 32 bits
          const cmdlen = Buffer.alloc(4) // allocate 32 bits
          const datalen = Buffer.alloc(4)

          cmdlen.writeInt32BE(cmd.byteLength, 0)
          datalen.writeInt32BE(data.byteLength, 0)

          reqlen.writeInt32BE((4 + cmd.byteLength + data.byteLength + cmdlen.byteLength + datalen.byteLength), 0)

          const combinedbuffer = Buffer.concat([reqlen, cmdlen, cmd, datalen, data])  // reflects our parser
          client.write(combinedbuffer) // send the entire request
        });

        client.on("data", data => {
          const statusCode = data.readInt32BE(0)
          debugLib.Debug(`set status code: ${statusCode}`)
          if (statusCode == 200)
            resolve(true)
          else
            resolve(false)
        })

        client.on('error', (err) => {
          console.log(err)
          reject(false);
        });
      });
    };

    const res = await connectToServer()
    equal(res, false);
  })
})



describe("commands", function () {
  let redi;
  this.beforeEach((done) => {
    redi = createApp({
      PORT: 3000, DEBUG: true, serverErrorCb: (ERR) => {
        console.log("abort")
        return
      }
    })

    done()
  })

  this.afterEach((done) => {
    redi(done)
  })

  it("should set a value", async () => {
    /**
   * @type {Socket}
   */
    const client = new net.Socket();

    const sendSet = () => {
      return new Promise((resolve, reject) => {
        client.connect(3000, '127.0.0.1', () => {
          debugLib.Debug("Test::set Client Connected", "info")
          const req = encodeCommand("set", { key: "products", value: ["product 1", "product 2"] })
     
          client.write(req)
        })



        client.on("data", data => {
          const statusCode = data.readInt32BE(0)
          if (statusCode == 200)
            resolve(true)
          else
            resolve(false)
        })

        client.on('error', (err) => {
          debugLib.Debug(err, "error")
          reject(false);
        });


      })




    }

    const res = await sendSet()
    console.log("resolved", res)
    equal(res, true)
  })
})

