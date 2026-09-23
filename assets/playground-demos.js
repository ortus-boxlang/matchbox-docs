// Real BoxLang source: every demo runs in the same WASM compiler/VM as user code.
export const demos = [
  {
    id: 'hello', title: 'Hello, browser', tag: 'START HERE', file: 'hello.bxs',
    description: 'Functions, interpolation, and a little introduction. Change the name and make it yours.',
    hint: 'greet("your name")',
    code: `// BoxLang. In your browser. No JVM required.
function greet(name) {
    return "Hello, #name#!";
}

println(greet("browser"));
println("This is real MatchBox, running as WebAssembly.");

// The last expression becomes the REPL result.
6 * 7;`
  },
  {
    id: 'pipeline', title: 'Data pipelines', tag: 'COLLECTIONS', file: 'pipeline.bxs',
    description: 'Turn a basket of orders into a report with arrays, structs, and higher-order functions.',
    hint: 'serializeJSON(paid)',
    code: `// From raw orders to a tiny sales report.
orders = [
    { item: "Mechanical keyboard", price: 89, paid: true },
    { item: "Desk plant", price: 18, paid: true },
    { item: "Monitor arm", price: 65, paid: false },
    { item: "USB-C hub", price: 42, paid: true }
];

paid = arrayFilter(orders, (order) => order.paid);
names = arrayMap(paid, (order) => order.item);
total = arrayReduce(paid, (sum, order) => sum + order.price, 0);

println("PAID ORDERS");
println("-----------");
for (name in names) {
    println("  + " & name);
}
println("");
println("Revenue: $" & total);
println("Awaiting payment: " & (arrayLen(orders) - arrayLen(paid)));
total;`
  },
  {
    id: 'fibonacci', title: 'Fibonacci', tag: 'FUNCTIONS', file: 'fibonacci.bxs',
    description: 'Build a Fibonacci sequence and a tiny bar chart. Functions stay available in the console.',
    hint: 'fib(20)',
    code: `// A fast, iterative Fibonacci function.
function fib(n) {
    var a = 0;
    var b = 1;
    for (var i = 0; i < n; i++) {
        var next = a + b;
        a = b;
        b = next;
    }
    return a;
}

println("FIBONACCI / a growing pattern");
println("");
for (n = 1; n <= 10; n++) {
    value = fib(n);
    bar = repeatString("|", value);
    println(n & " → " & value & "  " & bar);
}
fib(15);`
  },
  {
    id: 'classes', title: 'Objects with state', tag: 'CLASSES', file: 'counter.bxs',
    description: 'Create a class, instantiate it, and keep using the same object from the REPL.',
    hint: 'counter.increment()',
    code: `// An object that lives for the whole session.
class Counter {
    this.count = 0;

    function increment() {
        this.count++;
        return this.count;
    }

    function reset() {
        this.count = 0;
        return this.count;
    }
}

counter = new Counter();
println("First click:  " & counter.increment());
println("Second click: " & counter.increment());
println("Third click:  " & counter.increment());
println("");
println("Your turn. Try counter.increment() below.");`
  },
  {
    id: 'mandelbrot', title: 'Mandelbrot set', tag: 'GENERATIVE ART', file: 'mandelbrot.bxs',
    description: 'A fractal, drawn entirely with BoxLang. Try changing the bounds or the iteration limit.',
    hint: 'width * height',
    code: `// Complex numbers, simple loops, a whole universe.
width = 64;
height = 24;
limit = 36;
shades = " .:-=+*%@@";

for (py = 0; py < height; py++) {
    row = "";
    for (px = 0; px < width; px++) {
        cx = -2.2 + px * 3.2 / width;
        cy = -1.2 + py * 2.4 / height;
        x = 0;
        y = 0;
        iteration = 0;
        while (x * x + y * y <= 4 && iteration < limit) {
            nextX = x * x - y * y + cx;
            y = 2 * x * y + cy;
            x = nextX;
            iteration++;
        }
        shade = iteration == limit ? 10 : 1 + (iteration % 9);
        row &= mid(shades, shade, 1);
    }
    println(row);
}
println("");
println("Mandelbrot / " & width & " × " & height & " samples");`
  },
  {
    id: 'life', title: 'Game of Life', tag: 'SIMULATION', file: 'life.bxs',
    description: 'A glider takes four steps through Conway’s Game of Life. Two rules. Emergent movement.',
    hint: 'generation',
    code: `// Conway's Game of Life. Arrays are 1-indexed.
size = 8;
board = [];
for (y = 1; y <= size; y++) {
    row = [];
    for (x = 1; x <= size; x++) {
        arrayAppend(row, 0);
    }
    arrayAppend(board, row);
}

// Seed a glider.
board[2][3] = 1;
board[3][4] = 1;
board[4][2] = 1;
board[4][3] = 1;
board[4][4] = 1;

for (generation = 0; generation <= 4; generation++) {
    println("Generation " & generation);
    nextBoard = [];
    for (y = 1; y <= size; y++) {
        line = "";
        nextRow = [];
        for (x = 1; x <= size; x++) {
            line &= board[y][x] == 1 ? "[]" : "· ";
            neighbors = 0;
            for (dy = -1; dy <= 1; dy++) {
                for (dx = -1; dx <= 1; dx++) {
                    ny = y + dy;
                    nx = x + dx;
                    if ((dx != 0 || dy != 0) && ny >= 1 && ny <= size && nx >= 1 && nx <= size) {
                        neighbors += board[ny][nx];
                    }
                }
            }
            alive = neighbors == 3 || (board[y][x] == 1 && neighbors == 2);
            arrayAppend(nextRow, alive ? 1 : 0);
        }
        println(line);
        arrayAppend(nextBoard, nextRow);
    }
    println("");
    board = nextBoard;
}`
  }
];
