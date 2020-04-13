export const definitions = [
  //Items displayed in a bullet point style must be inluded in the bullet point property
  {
    title: "variables",
    text:
      "Variables can be denoted with the keywords let or const. The accepted convention is to use const as much as possible, and let when the variable is likely to be re-assigned",
    bulletPointItems: "",
    image: "IMG/variable.png",
  },
  {
    title: "scope",
    text:
      "Scope refers to the current context of code, which determines the accessibility of variables to JavaScript.",
    bulletPointItems: "",
    image: "IMG/scope.png",
  },
  {
    title: "functions",
    text:
      "Functions in Javascript consist of the function keyword followed by the name of the function, a list of parameters and statements that define the function.",
    bulletPointItems: "",
    image: "IMG/function.png",
  },
  {
    title: "for-loops",
    text: `A for loop creates a loop with three optional expressions; enclosed in parentheses and separated by semicolons, followed by a statement (usually a block statement) to be executed within the loop.`,
    bulletPointItems: "",
    image: "IMG/for.png",
  },
  {
    title: "while-loops",
    text: `A while loop loops through a block of code "while" the condition is true.`,
    bulletPointItems: "",
    image: "IMG/whileloop.png",
  },
  {
    title: "switch-statements",
    text: `A switch statement is an alternative to multiple if statements. Switch statements are a more efficient way to code when testing multiple conditions.`,
    bulletPointItems: "",
    image: "IMG/switch.png",
  },
  {
    title: "arrow-functions",
    text: `A concise syntax for creating functions.
    If we have only one argument, then parentheses around parameters can be omitted. 
    `,
    bulletPointItems: "Arrow functions do not have a 'this' context.",
    image: "IMG/arrow.png",
  },
  {
    title: "functional-expressions",
    text: `Functional expressions load only when the interpreter reaches that line of code. 
    They're not hoisted, allowing them to retain a copy of the local variables from 
    the scope where they were defined. They do not polute the global scope.
    `,
    bulletPointItems: "",
    image: "IMG/funcexp.png",
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
    image: "IMG/tern.png",
  },
  {
    title: "string-methods",
    text: "",
    bulletPointItems: `concat() Combines strings. indexOf()  returns index of character. match() - matches based on REGEXP.
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
    image: "IMG/classes.png",
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
    title: "event-loop",
    text:
      "Hoisting is a JavaScript mechanism where variables and function declarations are moved to the top of their scope before code execution.",
    bulletPointItems: "",
    image: "",
  },
  {
    title: "currying",
    text:
      "Currying is the process of transferring a function with many arguments into the same function with multiple arguments. Allowing you to partially apply functions and pass them to higher-order functions.",
    bulletPointItems: "",
    image: "",
  },
];
