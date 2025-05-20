/**
 * # Trees — the most beautiful and useful data structure.
 * 
 * (Seriously — database engines use them, file systems use them, even your OS directory structure is a tree.)
 * 
 * The most basic tree? A linear tree — aka a singly linked list.
 * 
 * Trees are made up of nodes connected by edges.
 * 
 * What makes trees so powerful compared to other data structures:
 *   - Trees don’t need to be contiguous in memory like arrays.
 *   - No resizing needed — you just shift "pointers".
 *   - Because of that, they can scale basically forever.
 * 
 * ## Tree Variants
 * 
 * Most trees evolve from a basic one — each optimizing for something: insert speed, search time, memory, etc.
 * 
 * Let's start with the binary tree:
 * 
 *         root
 *        /    \
 *   left       right
 *   subtree    subtree
 * 
 * In a binary tree, each node can have at most two children.
 * 
 * From here, we get the **Binary Search Tree (BST)**:
 *   - Left child is always smaller than the parent.
 *   - Right child is always greater.
 *   - This structure allows us to cut the search space in half each time — just like binary search: O(log₂ n).
 * 
 * Example: in a 10 million record tree, you can find a value in ~23 comparisons. Wild.
 * 
 * But here’s the problem:
 * 
 * If the tree becomes unbalanced (say, only right children keep getting added), it starts looking like a linked list:
 * 
 *     root
 *       \
 *        \
 *         \
 *          \
 * 
 * Now search/insert time drops from O(log₂ n) to O(n). Yikes.
 * 
 * That’s where self-balancing trees come in.
 * 
 * The gold standard for balance:
 *   - A perfectly balanced binary tree has height = log₂ n.
 * 
 * One such tree is the **AVL tree**, which we’re about to implement. Let’s go.
 */


import debugLib from "../utils.js";



class AVLNode {
   constructor(value, key, encoding) {
      this.value = value;
      this.key = key
      this.encoding = encoding
      this.left = null;
      this.right = null;
      this.height = 1;
   }
}


class AVLTree {
   constructor() {
      this.root = null;
   }

   // Utility function to get height of a node
   getHeight(node) {
      return node ? node.height : 0;
   }

   // Get Balance Factor of node
   getBalanceFactor(node) {
      return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
   }

   // Right Rotation (LL Case)
   rightRotate(y) {
      let x = y.left;
      let T2 = x.right;

      // Perform rotation
      x.right = y;
      y.left = T2;

      // Update heights
      y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;
      x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;

      return x;
   }

   // Left Rotation (RR Case)
   leftRotate(x) {
      let y = x.right;
      let T2 = y.left;

      // Perform rotation
      y.left = x;
      x.right = T2;

      // Update heights
      x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;
      y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;

      return y;
   }

   // Insert a value into AVL Tree
   insert(node, value, key, encoding) {
      // 1. Standard BST Insert
      if (!node) return new AVLNode(value, key, encoding);

      if (key < node.key) {
         node.left = this.insert(node.left, value, key, encoding);
      } else if (key > node.key) {
         node.right = this.insert(node.right, value, key, encoding);
      } else {
         node.value = value
         node.encoding = encoding
         return node; // replaced value and encoding in key
      }

      // 2. Update height
      node.height = Math.max(this.getHeight(node.left), this.getHeight(node.right)) + 1;

      // 3. Get Balance Factor
      let balance = this.getBalanceFactor(node);

      // 4. Perform Rotations if unbalanced

      // Left Heavy (LL Rotation)
      if (balance > 1 && value < node.left.value) {
         return this.rightRotate(node);
      }

      // Right Heavy (RR Rotation)
      if (balance < -1 && value > node.right.value) {
         return this.leftRotate(node);
      }

      // Left-Right (LR Rotation)
      if (balance > 1 && value > node.left.value) {
         node.left = this.leftRotate(node.left);
         return this.rightRotate(node);
      }

      // Right-Left (RL Rotation)
      if (balance < -1 && value < node.right.value) {
         node.right = this.rightRotate(node.right);
         return this.leftRotate(node);
      }

      return node;
   }

   // Wrapper function for insertion
   /**
    * 
    * @param {Record<any, any>} value 
    * @param {String} key 
    * @param {Number} encoding 
    */
   add(value, key, encoding) {
      this.root = this.insert(this.root, value, key, encoding);

      return true
   }

   // In-order traversal (sorted order)
   inOrderTraversal(node) {
      if (node) {
         this.inOrderTraversal(node.left);
         console.log(node.value);
         this.inOrderTraversal(node.right);
      }
   }

   // Function to print tree in a readable format
   displayTree(node, space = 0, indent = 5) {
      if (!node) return;

      space += indent;
      this.displayTree(node.right, space);

      debugLib.Debug(" ".repeat(space - indent) + JSON.stringify(node.value));

      this.displayTree(node.left, space);
   }

   // Wrapper function
   printTree() {
      this.displayTree(this.root);
   }
   // Display the tree
   display() {
      this.inOrderTraversal(this.root);
   }

   // Pre-order traversal (Root -> Left -> Right)
   preOrderTraversal(node) {
      if (node) {
         console.log(node.value);
         this.preOrderTraversal(node.left);
         this.preOrderTraversal(node.right);
      }
   }

   // Post-order traversal (Left -> Right -> Root)
   postOrderTraversal(node) {
      if (node) {
         this.postOrderTraversal(node.left);
         this.postOrderTraversal(node.right);
         console.log(node.value);
      }
   }

   // Wrappers for traversal
   preOrder() {
      this.preOrderTraversal(this.root);
   }

   postOrder() {
      this.postOrderTraversal(this.root);
   }

   /**
    * more verbose but easier to understand, we traverse the tree unless there's nothing to traverse
    * 
    * If we hit the node we return early and break out of recursion
    */

   search(node, key) {
      if (!node) return node; // return undefined

      let temp = node

      while (temp != null) {
         if (temp.key == key) {
            break;
         }
         if (node.key > key) {
            temp = node.left
         
         } else if (node.key < key) {
            temp = node.right
         }
      }

      return temp
   }

   deleteNode(node, key) {
      if (!node) return node;

      // 1. Perform standard BST delete
      if (key < node.key) {
         node.left = this.deleteNode(node.left, key);
      } else if (key > node.key) {
         node.right = this.deleteNode(node.right, key);
      } else {
         // Node with one or no child
         if (!node.left) return node.right;
         if (!node.right) return node.left;

         // Node with two children: Get the in-order successor (smallest in right subtree)
         let temp = this.getMinValueNode(node.right);
         node.key = temp.key;
         node.right = this.deleteNode(node.right, temp.key);
      }

      // 2. Update height
      node.height = Math.max(this.getHeight(node.left), this.getHeight(node.right)) + 1;

      // 3. Get balance factor
      let balance = this.getBalanceFactor(node);

      // 4. Perform rotations if unbalanced
      // Left Heavy (LL Rotation)
      if (balance > 1 && this.getBalanceFactor(node.left) >= 0) {
         return this.rightRotate(node);
      }
      // Left-Right (LR Rotation)
      if (balance > 1 && this.getBalanceFactor(node.left) < 0) {
         node.left = this.leftRotate(node.left);
         return this.rightRotate(node);
      }
      // Right Heavy (RR Rotation)
      if (balance < -1 && this.getBalanceFactor(node.right) <= 0) {
         return this.leftRotate(node);
      }
      // Right-Left (RL Rotation)
      if (balance < -1 && this.getBalanceFactor(node.right) > 0) {
         node.right = this.rightRotate(node.right);
         return this.leftRotate(node);
      }

      return node;
   }

   // Helper function to find the node with the smallest value
   getMinValueNode(node) {
      while (node.left) {
         node = node.left;
      }
      return node;
   }

   // Wrapper for deletion
   remove(key) {

      this.root = this.deleteNode(this.root, key);


      return true
   }

   getValue(key) {
      const res = this.search(this.root, key)
      if (res == null)
         return res

      return { value: res.value, encoding: res.encoding }
   }
}

const AVLTREE = new AVLTree();

export default AVLTREE
