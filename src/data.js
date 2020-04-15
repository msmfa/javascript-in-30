export const definitions = [
  //Items displayed in a bullet point style must be inluded in the bullet point property
  {
    title: "variables",
    text:
      "Variables can be denoted with the keywords let or const. The accepted convention is to use const as much as possible, and let when the variable is likely to be re-assigned",
    bulletPointItems: "",
    image: "/IMG/variable.png",
  },
  {
    title: "scope",
    text:
      "Scope refers to the current context of code, which determines the accessibility of variables to JavaScript.",
    bulletPointItems: "",
    image: "/IMG/scope.png",
  },
  {
    title: "functions",
    text:
      "Functions in Javascript consist of the function keyword followed by the name of the function, a list of parameters and statements that define the function.",
    bulletPointItems: "",
    image: "/IMG/function.png",
  },
  {
    title: "for-loops",
    text: `A for loop creates a loop with three optional expressions; enclosed in parentheses and separated by semicolons, followed by a statement (usually a block statement) to be executed within the loop.`,
    bulletPointItems: "",
    image: "/IMG/for.png",
  },
  {
    title: "while-loops",
    text: `A while loop loops through a block of code "while" the condition is true.`,
    bulletPointItems: "",
    image: "/IMG/whileloop.png",
  },
  {
    title: "switch-statements",
    text: `A switch statement is an alternative to multiple if statements. Switch statements are a more efficient way to code when testing multiple conditions.`,
    bulletPointItems: "",
    image: "/IMG/switch.png",
  },
  {
    title: "arrow-functions",
    text: `A concise syntax for creating functions.
    If we have only one argument, then parentheses around parameters can be omitted. Arrow functions do not have a 'this' context.
    `,
    bulletPointItems: "",
    image: "/IMG/arrow.png",
  },
  {
    title: "functional-expressions",
    text: `Functional expressions load only when the interpreter reaches that line of code. 
    They're not hoisted, allowing them to retain a copy of the local variables from 
    the scope where they were defined. They do not polute the global scope.
    `,
    bulletPointItems: "",
    image: "/IMG/funcexp.png",
  },
  {
    title: "array-methods",
    text: "",
    bulletPointItems: `forEach() -  loop over array's items. map() - new array by calling the provided function in every element. filter() - new array with only elements that pass the condition. 
    `,
    image: "",
  },
  {
    title: "operators",
    text: "",
    bulletPointItems:
      "+ Addition. - Subtraction. * Multiply. / Divide. % Modulus. ++ Increment. -- Decrement.",
    image: "",
  },
  {
    title: "comparisons",
    text: "",
    bulletPointItems:
      "== Equal to. === Equal to Value and Type. != Not Equal. !== Not Equal in Value or Type. > Greater. < Smaller.",
    image: "",
  },
  {
    title: "logical-opp",
    text: "There are three logical operators in JavaScript:",
    bulletPointItems: "|| = OR. && = AND. ! = NOT.",
    image: "",
  },
  {
    title: "con-operations",
    text:
      "The condition is evaluated as a boolean. If the condition is true it returns the first expression, else it returns the second condition.",
    bulletPointItems: "",
    image: "/IMG/tern.png",
  },
  {
    title: "string-methods",
    text: "",
    bulletPointItems: `concat() Combines strings. indexOf()  returns index of character. match() matches based on REGEXP.
    slice() Returns a substring based on the “start” and “end” parameters.  
    split() Splits a string according to the specified delimiter.
    `,
    image: "",
  },
  {
    title: "classes",
    text:
      "ES6 syntactic sugar that allows us to program in a more object-orientated way.  It allows us to define a constructor together with its prototype methods.",
    bulletPointItems: "",
    image: "/IMG/classes.png",
  },
  {
    title: "the-call-stack",
    text:
      "A Call Stack is a data structure that stores and manages function invocations. A kind of 'To-do list' for Javascript that uses the Last In, First Out (LIFO) principle.  ",
    bulletPointItems: "",
    image: "",
  },
  {
    title: "recursion",
    text:
      "Recursion is a technique for iterating over an operation by having a function call itself repeatedly until it arrives at a result. Most loops can be rewritten recursively. ",
    bulletPointItems: "",
    image: "",
  },
  {
    title: "nested-functions",
    text:
      "A function within another function. A nested function can 'inherit' the arguments and variables of its containing function. Put simply; the inner function contains the scope of the outer function.",
    bulletPointItems: "",
    image: "",
  },
  {
    title: "IIFEs",
    text:
      "An IIFE (Immediately Invoked Function Expression) is a JavaScript function that runs as soon as it is defined. Variables declared inside the IIFE have private scope. ",
    bulletPointItems: "",
    image: "",
  },
  {
    title: "closure",
    text:
      "The combination of a function and the environment in which it was declared. In Javascript all functions form closures. A common use case is creating private functions. ",
    bulletPointItems: "",
    image: "",
  },
  {
    title: "event-loop",
    text:
      "The Event Loop monitors the Call Stack and the Callback Queue. If the Call Stack is empty, it pushes the first event from the queue to the Call Stack.",
    bulletPointItems: "",
    image: "",
  },
  {
    title: "hoisting",
    text:
      "Hoisting is a JavaScript mechanism where variables and function declarations are moved to the top of their scope before code execution.",
    bulletPointItems: "",
    image: "",
  },
  {
    title: "currying",
    text:
      "Currying is the process of transferring a function with many arguments into the same function with fewer arguments. Allowing you to partially apply functions and pass them to higher-order functions.",
    bulletPointItems: "",
    image: "",
  },
  {
    title: "memoization",
    text:
      "Memoization is the programmatic practice of making recursive/iterative functions run faster by caching the values that the function returns after its initial execution.",
    bulletPointItems: "",
    image: "",
  },
  {
    title: "asynchronous-javascript",
    text:
      "Javascript is a single-threaded language. Meaning it performs one action at a time. Asynchronous Javascript is a way to perform multiple actions simultaneously using callbacks, promises, and async/await.",
    bulletPointItems: "",
    image: "",
  },
  {
    title: "promises",
    text:
      "A promise is an object that may produce a value sometime in the future. Either a resolved value or a reason that it’s not resolved (e.g., a network error occurred). ",
    bulletPointItems: "",
    image: "",
  },
  {
    title: "async-await",
    text:
      "Async/Await is syntactic sugar that makes promises easier to work with. It allows us to write asynchronous code that's similar in appearance to synchronous code. ",
    bulletPointItems: "",
    image: "",
  },
  {
    title: "global-objects",
    text:
      "A Global Object is an object that always exists in the global scope. In a browser, the Global Object is the 'Window' and in Node.js the object is Global.",
    bulletPointItems: "",
    image: "",
  },
  {
    title: "value-vs-reference",
    text:
      "Pass by value means the actual value is passed on. Pass by reference means a number (where the value is stored in memory) is passed on. ",
    bulletPointItems: "",
    image: "",
  },
  {
    title: "prototypal-inheritance",
    text:
      "Inheritance is simply one object trying to inherit properties and methods of another object. A prototype is simply an object with inbuilt methods that are attached to your object. ",
    bulletPointItems: "",
    image: "",
  },
  {
    title: "polymorphism",
    text:
      "Polymorphism Is the practice of designing objects to share behaviors and to be able to override shared behaviors with specific ones. Polymorphism utilizes inheritance in order to make this happen.",
    bulletPointItems: "",
    image: "",
  },
  {
    title: "this",
    text:
      "The “this” keyword allows you to decide which object should be focal when invoking a function or a method; effectively allowing you to reuse functions with different contexts.",
    bulletPointItems: "",
    image: "",
  },
  {
    title: "call",
    text:
      "With call you can write a method once, and then inherit it in another object, without having to rewrite the method for the new object.",
    bulletPointItems: "",
    image: "",
  },
  {
    title: "apply",
    text:
      "The only difference between apply() and call() is that the second parameter of the apply() method accepts the arguments to the actual function as an array.",
    bulletPointItems: "",
    image: "",
  },
  {
    title: "bind",
    text:
      "Similar to call and apply except bind() returns a function instead of a value. It sets the value of 'this' and returns a function. It does not invoke the function.",
    bulletPointItems: "",
    image: "",
  },
];
