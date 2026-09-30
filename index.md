---
title: MatchBox
description: BoxLang software productivity across JVM and Rust runtimes, from developer tooling to native and embedded targets.
order: 1
layout: home
---

<section class="mbx-content-section mbx-productivity" id="productivity">
	<p class="mbx-section-kicker">A SOFTWARE PRODUCTIVITY PLATFORM</p>
	<h2>More than a runtime: a connected way to build</h2>
	<p class="mbx-section-lede">BoxLang brings a modern language together with developer tooling, AI, browser testing, and documentation. MatchBox extends that platform with a Rust runtime for workloads where a JVM is not the right fit.</p>
	<div class="mbx-capability-grid">
		<a class="mbx-capability" href="/getting-started/quick-start/">
			<span class="mbx-capability__number">01 / BUILD</span>
			<h3>One language, familiar tools</h3>
			<p>Write BoxLang, run it from the MatchBox CLI, and package applications for the runtime and target you choose.</p>
			<span class="mbx-capability__link">Start with a script <span aria-hidden="true">&rarr;</span></span>
		</a>
		<a class="mbx-capability" href="/getting-started/agentic-development/">
			<span class="mbx-capability__number">02 / DEVELOP</span>
			<h3>Work effectively with agents</h3>
			<p>Give coding agents repository context, MatchBox skills, and executable checks. Agentic development is about building the app, not adding AI to it.</p>
			<span class="mbx-capability__link">Agentic development <span aria-hidden="true">&rarr;</span></span>
		</a>
		<a class="mbx-capability" href="/getting-started/boxlang-ai/">
			<span class="mbx-capability__number">03 / ADD AI</span>
			<h3>Put AI inside applications</h3>
			<p>BoxLang AI connects application code to models, providers, tools, and agents. Validate module and provider support for the runtime you deploy.</p>
			<span class="mbx-capability__link">BoxLang AI <span aria-hidden="true">&rarr;</span></span>
		</a>
		<a class="mbx-capability" href="https://bxplaywright.boxlang.io/" target="_blank" rel="noopener noreferrer">
			<span class="mbx-capability__number">04 / VERIFY</span>
			<h3>Test real user journeys</h3>
			<p>Explore bxPlaywright for browser automation, web-first assertions, visual checks, and browser artifacts in BoxLang projects.</p>
			<span class="mbx-capability__link">Explore bxPlaywright <span aria-hidden="true">&nearr;</span></span>
		</a>
	</div>
</section>

<section class="mbx-runtime-section" id="runtime-choice">
	<div class="mbx-content-section">
		<p class="mbx-section-kicker">RUNTIME CHOICE</p>
		<h2>Choose the runtime for the job</h2>
		<p class="mbx-section-lede">The BoxLang platform is not tied to one deployment shape. The official JVM runtime and MatchBox's independent Rust VM serve different environments and have different compatibility boundaries.</p>
		<div class="mbx-runtime-grid">
			<article class="mbx-runtime-card mbx-runtime-card--jvm">
				<div class="mbx-runtime-card__top"><span>THE FULL JVM ECOSYSTEM</span><span class="mbx-runtime-card__mark">JVM</span></div>
				<h3>BoxLang on the JVM</h3>
				<p>Choose the JVM runtime when you need the broader BoxLang language and standard library, Java interoperability, or libraries and frameworks built for the Java ecosystem.</p>
				<ul>
					<li>Java APIs and JVM library access</li>
					<li>Broad BoxLang runtime and module coverage</li>
					<li>Fits established JVM application infrastructure</li>
				</ul>
				<a href="https://boxlang.ortusbooks.com/" target="_blank" rel="noopener noreferrer">Read the BoxLang documentation <span aria-hidden="true">&nearr;</span></a>
			</article>
			<article class="mbx-runtime-card mbx-runtime-card--rust">
				<div class="mbx-runtime-card__top"><span>AN INDEPENDENT RUST VM</span><span class="mbx-runtime-card__mark">RUST</span></div>
				<h3>BoxLang with MatchBox</h3>
				<p>Choose MatchBox when a native executable, browser-oriented WebAssembly build, WASI workload, or microcontroller is the better destination.</p>
				<ul>
					<li>Core native runtime does not require a JVM</li>
					<li>Target-specific builds for browser, WASI, and ESP32</li>
					<li>Rust Native Fusion for native-only extensions</li>
				</ul>
				<a href="/differences-from-boxlang/">See compatibility and target differences <span aria-hidden="true">&rarr;</span></a>
			</article>
		</div>
		<p class="mbx-runtime-note"><strong>Portability is a design choice, not a blanket promise.</strong> MatchBox implements a strict, evolving subset of BoxLang. Code that runs on MatchBox generally has a path to the JVM; JVM applications may use APIs that MatchBox does not provide. Check the target matrix before choosing libraries or moving an application.</p>
	</div>
</section>

<section class="mbx-content-section mbx-target-section" id="targets">
	<p class="mbx-section-kicker">ONE RUST RUNTIME, DIFFERENT TARGET PROFILES</p>
	<h2>Run close to the workload</h2>
	<p class="mbx-section-lede">Build for the host that makes sense: from a standalone desktop or server process to a browser, a WASI host, or an ESP32 device. APIs and runtime features vary by target.</p>
	::: cards
	::: card title="Native executable" icon="phosphor-duotone:cpu" href="building-and-deploying/native-builds.md"
	Bundle a MatchBox runner with compiled BoxLang bytecode. Ordinary native applications need neither Java nor a separate MatchBox install on the destination.
	:::
	::: card title="Browser and JavaScript" icon="phosphor-duotone:browser" href="building-and-deploying/javascript-and-wasm.md"
	Ship an AOT JavaScript module, a raw WebAssembly binary, or the browser runtime for dynamic BoxLang execution.
	:::
	::: card title="WASI and containers" icon="phosphor-duotone:cube" href="building-and-deploying/wasm-container.md"
	Run isolated WebAssembly workloads in compatible hosts such as Wasmtime or WasmEdge. Filesystem and network access depend on host capabilities.
	:::
	::: card title="ESP32 devices" icon="phosphor-duotone:cpu" href="building-and-deploying/esp32.md"
	Cross-compile the embedded runner for supported Xtensa and RISC-V boards. The embedded web surface is intentionally smaller than the native server.
	:::
	:::
</section>

<section class="mbx-engine-section" id="inside-matchbox">
	<div class="mbx-engine-section__inner">
		<div>
			<p class="mbx-section-kicker">UNDER THE HOOD</p>
			<h2>Built for portable execution, tuned where it counts</h2>
			<p>MatchBox compiles BoxLang scripts to VM bytecode. The native CLI adds a tiered Cranelift JIT that profiles hot code and compiles supported loops and functions; unsupported operations continue in the interpreter.</p>
			<a href="/building-and-deploying/jit/">See where JIT is available and what it compiles <span aria-hidden="true">&rarr;</span></a>
		</div>
		<div class="mbx-engine-facts" aria-label="MatchBox implementation facts">
			<div><strong>Rust</strong><span>Independent VM implementation</span></div>
			<div><strong>Bytecode</strong><span>Compile once for a compatible runner</span></div>
			<div><strong>Cranelift</strong><span>Tiered JIT in the native CLI</span></div>
			<p>JIT is not enabled in WASM, ESP32, or cross-deployed native runner stubs. See the target-specific guide before comparing performance.</p>
		</div>
	</div>
</section>

<section class="mbx-content-section mbx-workflow" id="workflow">
	<p class="mbx-section-kicker">A PRACTICAL DEVELOPMENT LOOP</p>
	<h2>From first script to a tested target</h2>
	<div class="mbx-workflow-grid">
		<article><span>01</span><h3>Start with BoxLang</h3><p>Write a `.bxs` script and run it with MatchBox. Keep the first iteration focused on portable language features.</p><a href="/getting-started/quick-start/">Run your first application <span aria-hidden="true">&rarr;</span></a></article>
		<article><span>02</span><h3>Choose a deployment profile</h3><p>Build native, browser/WASM, WASI, or ESP32 artifacts deliberately. Each profile has its own APIs, dependencies, and host requirements.</p><a href="#targets">Compare target guides <span aria-hidden="true">&uarr;</span></a></article>
		<article><span>03</span><h3>Validate where it runs</h3><p>Run the artifact on its real destination and test the APIs it uses. A successful local run does not establish support on every target.</p><a href="/getting-started/agentic-development/">Set up an agent feedback loop <span aria-hidden="true">&rarr;</span></a></article>
	</div>
</section>

<section class="mbx-ecosystem-section" id="ecosystem">
	<div class="mbx-content-section">
		<p class="mbx-section-kicker">PART OF THE BOXLANG ECOSYSTEM</p>
		<h2>More productivity around the language</h2>
		<p class="mbx-section-lede">MatchBox is one runtime pillar in a wider toolkit. These projects complement BoxLang development; their integrations and runtime requirements are documented by each project.</p>
		<div class="mbx-ecosystem-grid">
			<a href="https://boxlang.io/" target="_blank" rel="noopener noreferrer"><strong>BoxLang</strong><span>The language and official JVM runtime.</span><small>Explore BoxLang <b aria-hidden="true">&nearr;</b></small></a>
			<a href="https://ai.boxlang.io/" target="_blank" rel="noopener noreferrer"><strong>BoxLang AI</strong><span>AI capabilities for BoxLang applications.</span><small>Explore BoxLang AI <b aria-hidden="true">&nearr;</b></small></a>
			<a href="https://bxplaywright.boxlang.io/" target="_blank" rel="noopener noreferrer"><strong>bxPlaywright</strong><span>Browser automation, assertions, and visual checks.</span><small>Explore bxPlaywright <b aria-hidden="true">&nearr;</b></small></a>
			<a href="https://bxsites.io/" target="_blank" rel="noopener noreferrer"><strong>bxSites</strong><span>Documentation and static sites built with BoxLang.</span><small>Explore bxSites <b aria-hidden="true">&nearr;</b></small></a>
		</div>
	</div>
</section>

<section class="mbx-content-section mbx-next-steps">
	<div><p class="mbx-section-kicker">READY TO BUILD?</p><h2>Start with a script. Pick the runtime after.</h2><p>Try MatchBox with a small BoxLang program, then use the compatibility guide to decide whether JVM or Rust is right for the application.</p></div>
	<div class="mbx-next-steps__actions">
		<a class="mbx-button" href="/getting-started/quick-start/">Start with MatchBox <span aria-hidden="true">&rarr;</span></a>
		<a class="mbx-button mbx-button--secondary" href="https://boxlang.ortusbooks.com/" target="_blank" rel="noopener noreferrer">Read the BoxLang docs <span aria-hidden="true">&nearr;</span></a>
	</div>
</section>
