//! REPL compilation with the browser's synchronous VM execution path.
//! Filesystem, network, and JavaScript host features are intentionally disabled.
use matchbox_compiler::{PRELUDE_SOURCE, compiler::Compiler, parser};
use matchbox_vm::{types::BxVM, vm::VM};
use serde_json::json;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    #[wasm_bindgen(js_namespace = console)]
    fn error(message: &str);
}

#[wasm_bindgen(start)]
pub fn initialize() {
    std::panic::set_hook(Box::new(|info| error(&format!("MatchBox: {info}"))));
}

fn bounded(mut text: String) -> String {
    if text.len() > 65_536 {
        let mut end = 65_536;
        while !text.is_char_boundary(end) {
            end -= 1;
        }
        text.truncate(end);
        text.push_str("\n[Output truncated at 64 KiB]");
    }
    text
}

#[wasm_bindgen]
pub struct Repl {
    vm: VM,
}

#[wasm_bindgen]
impl Repl {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Result<Repl, String> {
        let mut vm = VM::new();
        let ast = parser::parse(PRELUDE_SOURCE, Some("prelude.bxs"))
            .map_err(|error| error.to_string())?;
        let chunk = Compiler::new("prelude.bxs")
            .compile(&ast, PRELUDE_SOURCE)
            .map_err(|error| error.to_string())?;
        vm.interpret_sync(chunk)
            .map_err(|error| error.to_string())?;
        Ok(Self { vm })
    }

    pub fn evaluate(&mut self, source: &str) -> String {
        // Bound the public WASM entry point as well as the editor/worker input.
        if source.len() > 65_536 {
            return json!({"error": "Source exceeds the 64 KiB playground limit."}).to_string();
        }
        let chunk = parser::parse(source, Some("playground.bxs")).and_then(|ast| {
            let mut compiler = Compiler::new("playground.bxs");
            compiler.is_repl = true;
            compiler.compile(&ast, source)
        });
        let chunk = match chunk {
            Ok(chunk) => chunk,
            Err(error) => return json!({"error": bounded(error.to_string())}).to_string(),
        };
        self.vm.begin_output_capture();
        let result = self.vm.interpret_sync(chunk);
        let output = bounded(self.vm.end_output_capture().unwrap_or_default());
        match result {
            Ok(value) => json!({
                "output": output,
                "value": if value.is_null() { None } else { Some(bounded(self.vm.to_string(value))) },
            }),
            Err(error) => json!({"output": output, "error": bounded(error.to_string())}),
        }.to_string()
    }
}
