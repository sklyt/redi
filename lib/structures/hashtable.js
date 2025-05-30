/**
 * ## Hashtables
 * 
 * Access and delete operations are O(1) — super fast. 
 * But the catch? Resizing. It makes them inefficient for large datasets.
 * 
 * Imagine this:
 * 
 *   table: [10 million records] → full
 * 
 * To add just *one* more record:
 *   - We need to create two *brand new* arrays (for keys and values), both twice the size → 20 million slots.
 *   - Then we copy (yes, copy 😩) all 10 million existing records into the new arrays.
 *   - *Then* we finally insert the new record.
 * 
 * That’s why hashtables aren't used in in-memory databases. 
 * Instead, we go with sorted sets — like AVL trees (which we’re about to use).
 */

class OpenAddressingHashTable {
    constructor(size = 16) {
      this.size = size;
      this.count = 0;
      this.keys = Array(size).fill(null);
      this.values = Array(size).fill(null);
    }
  
    _hash(key) {
      let h = 0, s = String(key);
      for (let c of s) h = (h * 37 + c.charCodeAt(0)) | 0;
      return Math.abs(h) % this.size;
    }
  
    set(key, value) {
      if (this.count / this.size > 0.6) this._resize();
      let idx = this._hash(key);
      while (this.keys[idx] !== null && this.keys[idx] !== key) {
        idx = (idx + 1) % this.size;
      }
      if (this.keys[idx] === null) this.count++;
      this.keys[idx] = key;
      this.values[idx] = value;
      return true
    }
  
    get(key) {
      let idx = this._hash(key), start = idx;
      while (this.keys[idx] !== null) {
        if (this.keys[idx] === key) return this.values[idx];
        idx = (idx + 1) % this.size;
        if (idx === start) break;
      }
      return undefined;
    }
  
    delete(key) {
      let idx = this._hash(key), start = idx;
      while (this.keys[idx] !== null) {
        if (this.keys[idx] === key) {
          this.keys[idx] = null;
          this.values[idx] = null;
          this.count--;
          return true;
        }
        idx = (idx + 1) % this.size;
        if (idx === start) break;
      }
      return false;
    }
  
    _resize() {
      const oldKeys = this.keys, oldVals = this.values;
      this.size *= 2;
      this.count = 0;
      this.keys = Array(this.size).fill(null);
      this.values = Array(this.size).fill(null);
      for (let i = 0; i < oldKeys.length; i++) {
        if (oldKeys[i] !== null) this.set(oldKeys[i], oldVals[i]);
      }
    }
  }



const OPATABLE = new OpenAddressingHashTable(20)


// OPATABLE.set("HELLO", "world")
// OPATABLE.set(1, "10")
// OPATABLE.set(2, "20")
// console.log(OPATABLE)

// console.log(OPATABLE.get("HELLO"))
export default OPATABLE // singleton