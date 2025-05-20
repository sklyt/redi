// Not used: decoding example from string to buffer and back
const encoder = new TextEncoder()
const hello = encoder.encode("Hello World") // turn it into bytes 
console.log(hello)  // Uint8Array(11) [72, 101, 108, 108, 111,  32,  87, 111, 114, 108, 100]


const decoder = new TextDecoder()
console.log(decoder.decode(hello)) // Hello World