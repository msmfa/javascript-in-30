// Each definition is at most 30 words. Code examples are exercised by npm test.
export const definitions = [
  {
    "id": "variables",
    "label": "Variables",
    "slug": "javascript-variables",
    "heading": "JavaScript Variables Explained Simply",
    "text": "Variables are named bindings that hold values. Use let when reassignment is needed and const when the binding should stay fixed; both are block-scoped.",
    "code": "let lessonsCompleted = 2;\nlessonsCompleted = lessonsCompleted + 1;\n\nconst learner = { name: \"Ada\" };\nlearner.name = \"Grace\";\nconsole.log(lessonsCompleted);\nconsole.log(learner.name);",
    "output": [
      "3",
      "Grace"
    ],
    "explanation": "The let binding receives a new number. The const binding still refers to the same object, but that object's name property can change: const prevents reassignment, not object mutation.",
    "reference": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types",
    "group": "Fundamentals"
  },
  {
    "id": "functions",
    "label": "Functions",
    "slug": "javascript-functions",
    "heading": "JavaScript Functions Explained Simply",
    "text": "Functions are reusable blocks of code that can accept arguments, perform a task, and return a value.",
    "code": "function calculateTotal(price, quantity) {\n  return price * quantity;\n}\n\nconst total = calculateTotal(8, 3);\nconsole.log(total);\nconsole.log(calculateTotal(5, 2));",
    "output": [
      "24",
      "10"
    ],
    "explanation": "The parameters price and quantity receive the arguments supplied in each call. return sends the calculated value back to the caller, so the same function works with different inputs.",
    "reference": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions",
    "group": "Fundamentals"
  },
  {
    "id": "functional-expressions",
    "label": "Function Expressions",
    "slug": "javascript-function-expressions",
    "heading": "JavaScript Function Expressions Explained Simply",
    "text": "A function expression creates a function inside an expression, often assigning it to a variable or passing it as an argument.",
    "code": "const formatLesson = function (number, title) {\n  return number + \". \" + title;\n};\n\nconsole.log(formatLesson(1, \"Variables\"));\nconsole.log(formatLesson(2, \"Functions\"));",
    "output": [
      "1. Variables",
      "2. Functions"
    ],
    "explanation": "The function is created when the assignment runs and is then called through formatLesson. Unlike a function declaration, this expression cannot be called before its initialization has executed.",
    "reference": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/function",
    "group": "Fundamentals"
  },
  {
    "id": "operators",
    "label": "Operators",
    "slug": "javascript-operators",
    "heading": "JavaScript Operators Explained Simply",
    "text": "Operators act on values to produce results, including arithmetic, assignment, comparisons, and logical operations.",
    "code": "const price = 12;\nconst quantity = 3;\nlet total = price * quantity;\ntotal -= 5;\n\nconsole.log(total);\nconsole.log(2 + 3 * 4);\nconsole.log((2 + 3) * 4);",
    "output": [
      "31",
      "14",
      "20"
    ],
    "explanation": "Multiplication calculates the subtotal, and -= subtracts a discount and assigns the result. Multiplication normally happens before addition; parentheses let you choose a different grouping.",
    "reference": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators",
    "group": "Fundamentals"
  },
  {
    "id": "comparisons",
    "label": "Comparisons",
    "slug": "javascript-comparisons",
    "heading": "JavaScript Comparisons Explained Simply",
    "text": "Comparison operators compare two values and return a boolean. Strict equality (===) avoids type conversion; loose equality (==) may convert types.",
    "code": "const enteredScore = \"30\";\nconst targetScore = 30;\n\nconsole.log(enteredScore === targetScore);\nconsole.log(enteredScore == targetScore);\nconsole.log(Number(enteredScore) === targetScore);\nconsole.log(targetScore >= 20);",
    "output": [
      "false",
      "true",
      "true",
      "true"
    ],
    "explanation": "A string and a number are different types, so strict equality returns false. Converting the string explicitly makes the intended comparison clear; >= tests whether a value meets a threshold.",
    "reference": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Strict_equality",
    "group": "Fundamentals"
  },
  {
    "id": "con-operations",
    "label": "Conditional (Ternary) Operator",
    "slug": "javascript-conditional-operator",
    "heading": "JavaScript Conditional (Ternary) Operator Explained Simply",
    "text": "The conditional operator chooses between two expressions based on a condition. It uses condition ? valueIfTrue : valueIfFalse.",
    "code": "function progressMessage(completed, total) {\n  return completed === total ? \"All done!\" : \"Keep learning\";\n}\n\nconsole.log(progressMessage(3, 5));\nconsole.log(progressMessage(5, 5));",
    "output": [
      "Keep learning",
      "All done!"
    ],
    "explanation": "A truthy condition selects the expression after ?, while a falsy condition selects the expression after :. Only the selected expression is evaluated, and its value becomes the result.",
    "reference": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Conditional_operator",
    "group": "Fundamentals"
  },
  {
    "id": "logical-opp",
    "label": "Logical Operators",
    "slug": "javascript-logical-operators",
    "heading": "JavaScript Logical Operators Explained Simply",
    "text": "Logical operators combine or choose values. && and || short-circuit and return operands, while ! converts a value to a boolean and negates it.",
    "code": "const nickname = \"\";\nconst isSignedIn = true;\nconst hasCompletedLesson = false;\n\nconsole.log(nickname || \"Guest\");\nconsole.log(isSignedIn && \"Welcome back\");\nconsole.log(!hasCompletedLesson);",
    "output": [
      "Guest",
      "Welcome back",
      "true"
    ],
    "explanation": "|| returns the first truthy operand, or the last operand if none is truthy; && returns the first falsy operand, or the last if all are truthy. Both skip evaluating later operands once the result is known, so their results need not be booleans.",
    "reference": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators#logical_operators",
    "group": "Fundamentals"
  },
  {
    "id": "for-loops",
    "label": "For Loops",
    "slug": "javascript-for-loops",
    "heading": "JavaScript For Loops Explained Simply",
    "text": "A for loop repeats code using an optional initialization, condition, and update expression. The condition is checked before each iteration.",
    "code": "const lessons = [\"Variables\", \"Functions\", \"Arrays\"];\n\nfor (let index = 0; index < lessons.length; index++) {\n  const number = index + 1;\n  console.log(number + \". \" + lessons[index]);\n}",
    "output": [
      "1. Variables",
      "2. Functions",
      "3. Arrays"
    ],
    "explanation": "The counter starts at zero because array indexes start at zero. Each iteration prints one lesson, then index++ advances the counter; the loop stops when index reaches the array's length.",
    "reference": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for",
    "group": "Fundamentals"
  },
  {
    "id": "while-loops",
    "label": "While Loops",
    "slug": "javascript-while-loops",
    "heading": "JavaScript While Loops Explained Simply",
    "text": "A while loop repeats a statement while its condition is truthy, checking the condition before every iteration.",
    "code": "let questionsRemaining = 3;\n\nwhile (questionsRemaining > 0) {\n  console.log(\"Questions left: \" + questionsRemaining);\n  questionsRemaining--;\n}\nconsole.log(\"Quiz complete\");",
    "output": [
      "Questions left: 3",
      "Questions left: 2",
      "Questions left: 1",
      "Quiz complete"
    ],
    "explanation": "Each iteration decreases the counter so the condition eventually becomes false. If the counter starts at zero, the loop body never runs because while checks the condition first.",
    "reference": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/while",
    "group": "Fundamentals"
  },
  {
    "id": "switch-statements",
    "label": "Switch Statements",
    "slug": "javascript-switch-statements",
    "heading": "JavaScript Switch Statements Explained Simply",
    "text": "A switch statement matches an expression against case values using strict equality. Execution continues through subsequent cases unless a break or another exit stops it.",
    "code": "const difficulty = \"beginner\";\nlet nextLesson;\n\nswitch (difficulty) {\n  case \"beginner\":\n    nextLesson = \"Variables\";\n    break;\n  case \"intermediate\":\n    nextLesson = \"Closures\";\n    break;\n  default:\n    nextLesson = \"Choose a difficulty\";\n}\nconsole.log(nextLesson);",
    "output": [
      "Variables"
    ],
    "explanation": "The matching case selects a lesson, and break exits the switch before another case can run. The default clause provides a fallback when no case matches.",
    "reference": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch",
    "group": "Fundamentals"
  },
  {
    "id": "arrow-functions",
    "label": "Arrow Functions",
    "slug": "javascript-arrow-functions",
    "heading": "JavaScript Arrow Functions Explained Simply",
    "text": "Arrow functions provide compact function syntax and capture this from their surrounding scope. They cannot be used as constructors.",
    "code": "const learner = {\n  name: \"Ada\",\n  topics: [\"scope\", \"closures\"],\n  summaries() {\n    return this.topics.map(topic => this.name + \": \" + topic);\n  }\n};\n\nconsole.log(learner.summaries().join(\" | \"));",
    "output": [
      "Ada: scope | Ada: closures"
    ],
    "explanation": "The arrow callback keeps this from the surrounding summaries method, so this.name refers to the learner. Its expression body returns a string automatically; an arrow body with braces needs an explicit return to return a value.",
    "reference": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions",
    "group": "Fundamentals"
  },
  {
    "id": "array-methods",
    "label": "Array Methods",
    "slug": "javascript-array-methods",
    "heading": "JavaScript Array Methods Explained Simply",
    "text": "Array methods help transform, filter, search, combine, and iterate over arrays. Some create new arrays; others modify the original array.",
    "code": "const scores = [10, 25, 30];\nconst passing = scores.filter(score => score >= 20);\nconst labels = passing.map(score => score + \" points\");\n\nconsole.log(labels.join(\", \"));\nconsole.log(scores.join(\", \"));\nscores.push(15);\nconsole.log(scores.join(\", \"));",
    "output": [
      "25 points, 30 points",
      "10, 25, 30",
      "10, 25, 30, 15"
    ],
    "explanation": "filter selects passing scores and map transforms them into labels, creating new arrays. push changes the original scores array, while join turns its values into a readable string.",
    "reference": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array",
    "group": "Fundamentals"
  },
  {
    "id": "string-methods",
    "label": "String Methods",
    "slug": "javascript-string-methods",
    "heading": "JavaScript String Methods Explained Simply",
    "text": "String methods inspect and transform text. Strings are immutable, so methods return results without changing the original string.",
    "code": "const enteredTopic = \"  JavaScript Closures  \";\nconst topic = enteredTopic.trim().toLowerCase();\n\nconsole.log(topic);\nconsole.log(topic.includes(\"closures\"));\nconsole.log(topic.replace(\" \", \"-\"));\nconsole.log(enteredTopic === \"  JavaScript Closures  \");",
    "output": [
      "javascript closures",
      "true",
      "javascript-closures",
      "true"
    ],
    "explanation": "trim removes surrounding whitespace and toLowerCase normalizes the text. includes checks for a substring, and replace creates another string; the original enteredTopic value stays unchanged.",
    "reference": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String",
    "group": "Fundamentals"
  },
  {
    "id": "classes",
    "label": "Classes",
    "slug": "javascript-classes",
    "heading": "JavaScript Classes Explained Simply",
    "text": "Classes are templates for creating objects with shared methods. They build on JavaScript's prototype system and can extend other classes.",
    "code": "class Lesson {\n  constructor(title) {\n    this.title = title;\n    this.completed = false;\n  }\n  complete() {\n    this.completed = true;\n    return this.title + \" complete\";\n  }\n}\n\nconst lesson = new Lesson(\"Closures\");\nconsole.log(lesson.complete());\nconsole.log(lesson.completed);",
    "output": [
      "Closures complete",
      "true"
    ],
    "explanation": "new creates a Lesson instance and runs its constructor to set the starting state. The complete method is shared through the class prototype and updates the instance on which it is called.",
    "reference": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes",
    "group": "Fundamentals"
  },
  {
    "id": "scope",
    "label": "Scope",
    "slug": "javascript-scope",
    "heading": "JavaScript Scope Explained Simply",
    "text": "Scope determines where variables can be accessed. JavaScript has global, module, function, and block scopes; nested scopes can access variables in their surrounding scopes.",
    "code": "const course = \"JavaScript\";\n\nfunction showLesson() {\n  const topic = \"Scope\";\n  if (true) {\n    const message = course + \": \" + topic;\n    console.log(message);\n  }\n  console.log(typeof message);\n}\nshowLesson();\nconsole.log(typeof topic);",
    "output": [
      "JavaScript: Scope",
      "undefined",
      "undefined"
    ],
    "explanation": "The inner block can read course and topic from surrounding scopes, but message stays inside its block and topic stays inside the function. Here typeof returns \"undefined\" for names that are out of scope; reading either name directly there would throw a ReferenceError.",
    "reference": "https://developer.mozilla.org/en-US/docs/Glossary/Scope",
    "group": "Fundamentals"
  },
  {
    "id": "the-call-stack",
    "label": "The call stack",
    "slug": "javascript-call-stack",
    "heading": "JavaScript Call Stack Explained Simply",
    "text": "The call stack tracks active function calls. Calling a function adds a frame; returning removes it, allowing the previous function to resume.",
    "code": "function save() {\n  console.log(\"Saving\");\n}\nfunction publish() {\n  console.log(\"Starting\");\n  save();\n  console.log(\"Published\");\n}\npublish();",
    "output": [
      "Starting",
      "Saving",
      "Published"
    ],
    "explanation": "When publish calls save, publish pauses while save runs. Once save returns, its frame leaves the stack and publish continues with the final message.",
    "reference": "https://developer.mozilla.org/en-US/docs/Glossary/Call_stack",
    "group": "Advanced"
  },
  {
    "id": "event-loop",
    "label": "Event loop",
    "slug": "javascript-event-loop",
    "heading": "The JavaScript Event Loop Explained Simply",
    "text": "The event loop coordinates queued work. Synchronous code finishes first; promise callbacks run as microtasks before the next timer callback can run.",
    "code": "console.log(\"Start\");\nsetTimeout(() => {\n  console.log(\"Timer\");\n}, 0);\nPromise.resolve().then(() => {\n  console.log(\"Promise\");\n});\nconsole.log(\"End\");",
    "output": [
      "Start",
      "End",
      "Promise",
      "Timer"
    ],
    "explanation": "The current script finishes before either callback runs. The promise reaction is a microtask, so it runs before this timer callback. A zero millisecond timeout schedules later work; it does not interrupt the current code or guarantee an exact execution time.",
    "reference": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Execution_model",
    "group": "Advanced"
  },
  {
    "id": "IIFEs",
    "label": "IIFEs",
    "slug": "javascript-iife",
    "heading": "JavaScript IIFEs Explained Simply",
    "text": "An immediately invoked function expression runs as soon as it is created, providing a local scope for temporary variables and returning a result if needed.",
    "code": "const greeting = (() => {\n  const name = \"Sam\";\n  return `Hello, ${name}!`;\n})();\nconsole.log(greeting);",
    "output": [
      "Hello, Sam!"
    ],
    "explanation": "The final parentheses call the arrow function immediately. The name variable stays inside that function, while its returned string becomes greeting.",
    "reference": "https://developer.mozilla.org/en-US/docs/Glossary/IIFE",
    "group": "Advanced"
  },
  {
    "id": "nested-functions",
    "label": "Nested functions",
    "slug": "javascript-nested-functions",
    "heading": "JavaScript Nested Functions Explained Simply",
    "text": "A nested function is defined inside another function. It can access variables in its enclosing scopes, letting related logic share local data.",
    "code": "function orderTotal(price, quantity) {\n  function subtotal() {\n    return price * quantity;\n  }\n  return subtotal() + 5;\n}\nconsole.log(orderTotal(12, 3));",
    "output": [
      "41"
    ],
    "explanation": "The inner subtotal function reads price and quantity from orderTotal. It keeps the calculation local, then orderTotal adds a delivery charge of 5.",
    "reference": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions#nested_functions_and_closures",
    "group": "Advanced"
  },
  {
    "id": "recursion",
    "label": "Recursion",
    "slug": "javascript-recursion",
    "heading": "JavaScript Recursion Explained Simply",
    "text": "Recursion solves a problem by calling the same function with a smaller case. A base case stops the calls and lets results return.",
    "code": "function factorial(n) {\n  if (n <= 1) return 1;\n  return n * factorial(n - 1);\n}\nconsole.log(factorial(5));\nconsole.log(factorial(0));",
    "output": [
      "120",
      "1"
    ],
    "explanation": "For nonnegative integers, factorial multiplies n by the factorial of n minus one. The base case handles zero and one; very deep recursion can exceed the call stack limit.",
    "reference": "https://developer.mozilla.org/en-US/docs/Glossary/Recursion",
    "group": "Advanced"
  },
  {
    "id": "memoization",
    "label": "Memoization",
    "slug": "javascript-memoization",
    "heading": "JavaScript Memoization Explained Simply",
    "text": "Memoization caches a function's result for an input, so repeated calls can reuse it. It works reliably when the same input always produces the same result.",
    "code": "const cache = new Map();\nlet calculations = 0;\nfunction square(n) {\n  if (cache.has(n)) return cache.get(n);\n  calculations++;\n  const result = n * n;\n  cache.set(n, result);\n  return result;\n}\nconsole.log(square(8));\nconsole.log(square(8));\nconsole.log(calculations);",
    "output": [
      "64",
      "64",
      "1"
    ],
    "explanation": "The second call returns the cached 64, so the multiplication runs only once. This small example makes caching visible; use it where saved computation justifies the extra memory.",
    "reference": "https://developer.mozilla.org/en-US/docs/Glossary/Memoization",
    "group": "Advanced"
  },
  {
    "id": "closure",
    "label": "Closures",
    "slug": "javascript-closures",
    "heading": "JavaScript Closures Explained Simply",
    "text": "A closure combines a function with access to its surrounding lexical environment. That access remains available even after the outer function has returned.",
    "code": "function createCounter() {\n  let count = 0;\n  return function increment() {\n    count += 1;\n    return count;\n  };\n}\nconst next = createCounter();\nconsole.log(next());\nconsole.log(next());",
    "output": [
      "1",
      "2"
    ],
    "explanation": "The returned increment function keeps access to count after createCounter finishes. Each call updates the same variable, while a new createCounter call would create an independent counter.",
    "reference": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures",
    "group": "Advanced"
  },
  {
    "id": "hoisting",
    "label": "Hoisting",
    "slug": "javascript-hoisting",
    "heading": "JavaScript Hoisting Explained Simply",
    "text": "Hoisting describes declaration behavior before execution reaches a declaration. Function declarations are callable early; var starts as undefined; let and const remain inaccessible until initialization.",
    "code": "console.log(greet());\nconsole.log(score);\nfunction greet() {\n  return \"Hello!\";\n}\nvar score = 7;\nconsole.log(score);",
    "output": [
      "Hello!",
      "undefined",
      "7"
    ],
    "explanation": "The engine establishes the function and var bindings before these statements execute; it does not physically move the source code. Reading a let or const binding before initialization instead throws a ReferenceError.",
    "reference": "https://developer.mozilla.org/en-US/docs/Glossary/Hoisting",
    "group": "Advanced"
  },
  {
    "id": "currying",
    "label": "Currying",
    "slug": "javascript-currying",
    "heading": "JavaScript Currying Explained Simply",
    "text": "Currying transforms a function with multiple arguments into a sequence of functions that each accept one argument, letting you supply those arguments in separate calls.",
    "code": "function multiply(a, b) {\n  return a * b;\n}\nconst curriedMultiply = a => b => multiply(a, b);\nconst double = curriedMultiply(2);\nconsole.log(curriedMultiply(3)(4));\nconsole.log(double(7));",
    "output": [
      "12",
      "14"
    ],
    "explanation": "The first call returns a function that remembers a through a closure. Currying changes the function into single-argument stages; partial application fixes some arguments to make a reusable function such as double.",
    "reference": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures#practical_closures",
    "group": "Advanced"
  },
  {
    "id": "value-vs-reference",
    "label": "Value vs reference",
    "slug": "javascript-value-vs-reference",
    "heading": "JavaScript Value vs Reference Explained Simply",
    "text": "JavaScript passes arguments by value. For objects, that value is a reference: functions can mutate the shared object, but reassigning a parameter does not replace the caller's variable.",
    "code": "function update(points, profile) {\n  points = 99;\n  profile.name = \"Mira\";\n  profile = { name: \"Someone else\" };\n}\nconst points = 10;\nconst profile = { name: \"Sam\" };\nupdate(points, profile);\nconsole.log(points);\nconsole.log(profile.name);",
    "output": [
      "10",
      "Mira"
    ],
    "explanation": "Reassigning either parameter only changes the local binding. Setting profile.name changes the shared object, so the caller sees Mira even though the function later assigns its parameter a different object.",
    "reference": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions#function_declarations",
    "group": "Advanced"
  },
  {
    "id": "asynchronous-javascript",
    "label": "Asynchronous JavaScript",
    "slug": "javascript-asynchronous-programming",
    "heading": "Asynchronous JavaScript Explained Simply",
    "text": "Asynchronous programming lets JavaScript continue while an operation is pending, then handle its result later using callbacks, promises, or async and await.",
    "code": "function loadMessage(callback) {\n  setTimeout(() => callback(\"Message ready\"), 10);\n}\nconsole.log(\"Loading\");\nloadMessage((message) => {\n  console.log(message);\n});\nconsole.log(\"Other work continues\");",
    "output": [
      "Loading",
      "Other work continues",
      "Message ready"
    ],
    "explanation": "The timer simulates a delayed result without making a network request. loadMessage schedules the callback and returns, allowing the final log to run first. Making code asynchronous does not automatically move expensive JavaScript calculations to another thread.",
    "reference": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS/Introducing",
    "group": "Advanced"
  },
  {
    "id": "promises",
    "label": "Promises",
    "slug": "javascript-promises",
    "heading": "JavaScript Promises Explained Simply",
    "text": "A promise represents an operation's eventual result. It starts pending, then becomes fulfilled with a value or rejected with a reason.",
    "code": "const price = Promise.resolve(20);\nprice\n  .then((amount) => amount * 2)\n  .then((total) => {\n    console.log(total);\n    throw new Error(\"Payment declined\");\n  })\n  .catch((error) => {\n    console.log(error.message);\n  });",
    "output": [
      "40",
      "Payment declined"
    ],
    "explanation": "Each then call returns a new promise, carrying the callback's returned value into the next step. Throwing an error rejects that step's promise, so catch receives the error. Even handlers attached to an already fulfilled promise run asynchronously.",
    "reference": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise",
    "group": "Advanced"
  },
  {
    "id": "async-await",
    "label": "Async and await",
    "slug": "javascript-async-await",
    "heading": "JavaScript Async and Await Explained Simply",
    "text": "Async functions return promises. Await pauses the surrounding async function until a promise settles, returning its value or throwing its rejection reason.",
    "code": "async function showScore() {\n  console.log(\"Reading score\");\n  const score = await Promise.resolve(42);\n  console.log(score);\n  return \"Finished\";\n}\nshowScore()\n  .then((message) => console.log(message))\n  .catch((error) => console.log(error.message));\nconsole.log(\"Script continues\");",
    "output": [
      "Reading score",
      "Script continues",
      "42",
      "Finished"
    ],
    "explanation": "showScore runs synchronously until await, then yields even though this promise is already fulfilled. The remaining script continues before the function resumes. The function's returned string becomes the fulfillment value received by then.",
    "reference": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function",
    "group": "Advanced"
  },
  {
    "id": "global-objects",
    "label": "Global objects",
    "slug": "javascript-global-objects",
    "heading": "JavaScript Global Objects Explained Simply",
    "text": "Standard global objects, including Math and JSON, provide built-in tools. The separate globalThis value offers a consistent way to access the global environment across platforms.",
    "code": "const rounded = Math.round(4.6);\nconst encoded = JSON.stringify({ score: rounded });\nconsole.log(rounded);\nconsole.log(encoded);\nconsole.log(globalThis.Math === Math);\nconsole.log(globalThis.JSON === JSON);",
    "output": [
      "5",
      "{\"score\":5}",
      "true",
      "true"
    ],
    "explanation": "Math and JSON are standard built-in objects available without importing them. globalThis exposes these same objects in browsers and Node.js, so this example does not depend on window. Browser features such as document are supplied by the host environment and are not standard JavaScript global objects.",
    "reference": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects",
    "group": "Advanced"
  },
  {
    "id": "this",
    "label": "this",
    "slug": "javascript-this",
    "heading": "JavaScript this Keyword Explained Simply",
    "text": "In regular functions, this depends on how the function is called. Arrow functions inherit this from their enclosing context instead of creating their own binding.",
    "code": "const user = {\n  name: \"Sam\",\n  getName() {\n    return this.name;\n  },\n  makeReader() {\n    return () => this.name;\n  }\n};\nconst reader = user.makeReader();\nconsole.log(user.getName());\nconsole.log(reader.call({ name: \"Mira\" }));",
    "output": [
      "Sam",
      "Sam"
    ],
    "explanation": "Calling user.getName sets this to user. The arrow returned by makeReader keeps that same this value, so call cannot replace it with the other object.",
    "reference": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this",
    "group": "Advanced"
  },
  {
    "id": "call",
    "label": "call()",
    "slug": "javascript-call",
    "heading": "JavaScript call() Explained Simply",
    "text": "The call method invokes a function immediately with a supplied this value and arguments listed individually. It can reuse a regular function with different objects.",
    "code": "function introduce(greeting, punctuation) {\n  return `${greeting}, ${this.name}${punctuation}`;\n}\nconst user = { name: \"Sam\" };\nconsole.log(introduce.call(user, \"Hello\", \"!\"));",
    "output": [
      "Hello, Sam!"
    ],
    "explanation": "The first argument supplies this, while Hello and the punctuation become the function's normal arguments. Arrow functions retain their lexical this even when invoked with call.",
    "reference": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call",
    "group": "Advanced"
  },
  {
    "id": "apply",
    "label": "apply()",
    "slug": "javascript-apply",
    "heading": "JavaScript apply() Explained Simply",
    "text": "The apply method invokes a function immediately with a supplied this value and arguments provided as an array or array-like object, rather than individually.",
    "code": "function describe(item, quantity) {\n  return `${this.name} ordered ${quantity} ${item}`;\n}\nconst customer = { name: \"Sam\" };\nconst order = [\"notebooks\", 3];\nconsole.log(describe.apply(customer, order));",
    "output": [
      "Sam ordered 3 notebooks"
    ],
    "explanation": "The entries in order become the item and quantity arguments. As with call, apply cannot override an arrow function's inherited this value.",
    "reference": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply",
    "group": "Advanced"
  },
  {
    "id": "bind",
    "label": "bind()",
    "slug": "javascript-bind",
    "heading": "JavaScript bind() Explained Simply",
    "text": "The bind method creates a new function with a chosen this value and optional leading arguments. The new function runs later, when you call it.",
    "code": "const cart = {\n  total: 24,\n  describe(currency) {\n    return `${currency}${this.total}`;\n  }\n};\nconst showTotal = cart.describe.bind(cart, \"£\");\nconsole.log(showTotal());",
    "output": [
      "£24"
    ],
    "explanation": "The bound function remembers cart and the pound sign, so it can be passed around as a callback without losing that context. Binding does not change an arrow function's lexical this.",
    "reference": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind",
    "group": "Advanced"
  },
  {
    "id": "prototypal-inheritance",
    "label": "Prototypal inheritance",
    "slug": "javascript-prototypal-inheritance",
    "heading": "JavaScript Prototypal Inheritance Explained Simply",
    "text": "JavaScript objects can inherit from other objects. When a property is missing, JavaScript searches the prototype chain until it finds a match or reaches null.",
    "code": "const animal = {\n  speak() { return this.name + \" makes a sound\"; }\n};\nconst pet = Object.create(animal);\npet.name = \"Pip\";\nconsole.log(pet.speak());\nconsole.log(Object.hasOwn(pet, \"name\"));\nconsole.log(Object.hasOwn(pet, \"speak\"));\nconsole.log(Object.getPrototypeOf(pet) === animal);",
    "output": [
      "Pip makes a sound",
      "true",
      "false",
      "true"
    ],
    "explanation": "Object.create makes animal the prototype of pet, so pet can call the inherited speak method without copying it. Calling pet.speak sets this to pet, allowing the method to read pet's own name. Object.hasOwn distinguishes an object's own properties from inherited ones.",
    "reference": "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Inheritance_and_the_prototype_chain",
    "group": "Advanced"
  },
  {
    "id": "polymorphism",
    "label": "Polymorphism",
    "slug": "javascript-polymorphism",
    "heading": "JavaScript Polymorphism Explained Simply",
    "text": "Polymorphism lets different objects respond to the same operation in their own way. Shared method names let calling code work with multiple implementations.",
    "code": "class Animal {\n  speak() { return \"A sound\"; }\n}\nclass Dog extends Animal {\n  speak() { return \"Woof\"; }\n}\nclass Cat extends Animal {\n  speak() { return \"Meow\"; }\n}\nfor (const animal of [new Dog(), new Cat()]) {\n  console.log(animal.speak());\n}",
    "output": [
      "Woof",
      "Meow"
    ],
    "explanation": "Dog and Cat override the inherited speak method with different behavior. The loop calls the same method on each object and gets the appropriate result. JavaScript also allows unrelated objects with a compatible speak method to work in this loop; a shared base class is optional.",
    "reference": "https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Advanced_JavaScript_objects/Object-oriented_programming",
    "group": "Advanced"
  }
];
