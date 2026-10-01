window.__ModuleLoader__.load({
	id: "@nanmicoder/dsh-skills-hub",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region \0rolldown/runtime.js
		var __create = Object.create;
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __getProtoOf = Object.getPrototypeOf;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __esmMin = (fn, res, err) => () => {
			if (err) throw err[0];
			try {
				return fn && (res = fn(fn = 0)), res;
			} catch (e) {
				throw err = [e], e;
			}
		};
		var __commonJSMin = (cb, mod) => () => (mod || (cb((mod = { exports: {} }).exports, mod), cb = null), mod.exports);
		var __exportAll = (all, no_symbols) => {
			let target = {};
			for (var name in all) __defProp(target, name, {
				get: all[name],
				enumerable: true
			});
			if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
			return target;
		};
		var __copyProps = (to, from, except, desc) => {
			if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
			return to;
		};
		var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
			value: mod,
			enumerable: true
		}) : target, mod));
		var __toCommonJS = (mod) => __hasOwnProp.call(mod, "module.exports") ? mod["module.exports"] : __copyProps(__defProp({}, "__esModule", { value: true }), mod);
		//#endregion
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region lib/client/locale-context.js
		/**
		* Panel-local locale context.
		*
		* The framework hands the translate seat (`t: TranslateNS<NS>`) to the *slot
		* component* only — `PropsLocale<N>` in
		* `@deepseek-ai/dsh-client-ui-slots/lib/types/index.d.ts` adds it exactly when a
		* registration declares `locale: NS`, and nothing propagates it further down the
		* tree. The presentational components are deliberately prop-shaped (contract
		* §5.4 gives them no `t`), so `MarketPage` — the one component the slot
		* machinery calls — publishes its seat here and every descendant reads it.
		*
		* A context (rather than prop drilling or a module singleton) is what keeps the
		* components pure and testable: a test can render any of them under its own
		* provider without touching the DSH runtime.
		*/
		const LocaleContext = (0, react.createContext)(null);
		/** Publish the slot-injected translate seat to the panel's descendants. */
		function LocaleProvider(props) {
			return (0, react_jsx_runtime.jsx)(LocaleContext.Provider, {
				value: props.t,
				children: props.children
			});
		}
		/**
		* Read the panel's translate seat.
		*
		* Throws instead of falling back to the raw key: a component rendered outside
		* the panel would otherwise silently print dictionary keys, which is far harder
		* to notice than a loud assembly error.
		*/
		function useT() {
			const t = (0, react.useContext)(LocaleContext);
			if (t === null) throw new Error("skills-hub: useT() was called outside <LocaleProvider>; the panel root must provide the locale seat");
			return t;
		}
		//#endregion
		//#region lib/client/relative-time.js
		/**
		* How old a snapshot is, in the panel's own vocabulary.
		*
		* The panel shows cached catalogue data, so "when was this actually fetched" is
		* part of the answer rather than a debug detail: a reader who is about to
		* install third-party code is entitled to know whether the security report in
		* front of them was read a minute ago or yesterday.
		*/
		/** Coarse buckets: the first match wins, and precision beyond them is noise. */
		function formatAge(t, from, now = Date.now()) {
			const minutes = Math.floor(Math.max(0, now - from) / 6e4);
			if (minutes < 1) return t("ageJustNow");
			if (minutes < 60) return t("ageMinutes", { count: minutes });
			const hours = Math.floor(minutes / 60);
			if (hours < 24) return t("ageHours", { count: hours });
			return t("ageDays", { count: Math.floor(hours / 24) });
		}
		/** Absolute timestamp for the hover text, so the bucket never hides the fact. */
		function formatStamp(from) {
			const date = new Date(from);
			return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
		}
		//#endregion
		//#region lib/client/icons.js
		/** Attributes every icon shares; spread first so a caller's props win. */
		const stroke = {
			fill: "none",
			stroke: "currentColor",
			strokeLinecap: "round",
			strokeLinejoin: "round"
		};
		/**
		* Sidebar entry glyph: a shop awning over a storefront.
		*
		* Drawn on a 20px grid rather than 16 so the awning scallops stay legible at
		* the 20px the shell may use for a wide sidebar; at 16px it scales down
		* cleanly because every edge is axis-aligned or a single arc.
		*
		* Renders a bare `<svg>` and never a button: `sidebar.panellist` entries are
		* rendered inside the sidebar's own `<button>` (see `PanelRow` in
		* `dsh-client-ui-sidebar/lib/client.js`), so an interactive wrapper here would
		* nest a control inside a control.
		*/
		function SkillsHubIcon({ size = 16, active = false, className }) {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 20 20",
				className,
				strokeWidth: active ? 1.8 : 1.6,
				...stroke,
				"aria-hidden": "true",
				focusable: "false",
				children: [
					(0, react_jsx_runtime.jsx)("path", { d: "M2.6 8.4 3.9 4.4a.9.9 0 0 1 .86-.62h10.48a.9.9 0 0 1 .86.62l1.3 4" }),
					(0, react_jsx_runtime.jsx)("path", {
						d: "M2.6 8.4a1.85 1.85 0 0 0 3.7 0 1.85 1.85 0 0 0 3.7 0 1.85 1.85 0 0 0 3.7 0 1.85 1.85 0 0 0 3.7 0",
						fill: active ? "currentColor" : "none",
						fillOpacity: active ? .16 : 0
					}),
					(0, react_jsx_runtime.jsx)("path", { d: "M4.6 8.4v7.8h10.8V8.4" }),
					(0, react_jsx_runtime.jsx)("path", { d: "M8.2 16.2v-3.4a.9.9 0 0 1 .9-.9h1.8a.9.9 0 0 1 .9.9v3.4" })
				]
			});
		}
		/** Magnifier: search input affordance. */
		function SearchIcon({ size = 16, className }) {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				className,
				strokeWidth: 1.5,
				...stroke,
				"aria-hidden": "true",
				focusable: "false",
				children: [(0, react_jsx_runtime.jsx)("circle", {
					cx: "7.1",
					cy: "7.1",
					r: "4.6"
				}), (0, react_jsx_runtime.jsx)("path", { d: "m10.6 10.6 3 3" })]
			});
		}
		/** Arrow into a tray: install action and the download count. */
		function DownloadIcon({ size = 16, className }) {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				className,
				strokeWidth: 1.5,
				...stroke,
				"aria-hidden": "true",
				focusable: "false",
				children: [
					(0, react_jsx_runtime.jsx)("path", { d: "M8 2.4v6.9" }),
					(0, react_jsx_runtime.jsx)("path", { d: "m5 6.5 3 3 3-3" }),
					(0, react_jsx_runtime.jsx)("path", { d: "M2.9 11.8v.7a1.3 1.3 0 0 0 1.3 1.3h7.6a1.3 1.3 0 0 0 1.3-1.3v-.7" })
				]
			});
		}
		/** Five-point star: star count. */
		function StarIcon({ size = 16, className }) {
			return (0, react_jsx_runtime.jsx)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				className,
				strokeWidth: 1.5,
				...stroke,
				"aria-hidden": "true",
				focusable: "false",
				children: (0, react_jsx_runtime.jsx)("path", { d: "m8 2.1 1.8 3.6 4 .6-2.9 2.8.7 4L8 11.2l-3.6 1.9.7-4-2.9-2.8 4-.6z" })
			});
		}
		/** Waste bin: uninstall action. */
		function TrashIcon({ size = 16, className }) {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				className,
				strokeWidth: 1.5,
				...stroke,
				"aria-hidden": "true",
				focusable: "false",
				children: [
					(0, react_jsx_runtime.jsx)("path", { d: "M2.7 4.3h10.6" }),
					(0, react_jsx_runtime.jsx)("path", { d: "M5.9 4.3V3.1a.9.9 0 0 1 .9-.9h2.4a.9.9 0 0 1 .9.9v1.2" }),
					(0, react_jsx_runtime.jsx)("path", { d: "m4.3 4.3.6 8.3a1.1 1.1 0 0 0 1.1 1h4a1.1 1.1 0 0 0 1.1-1l.6-8.3" }),
					(0, react_jsx_runtime.jsx)("path", { d: "M6.6 6.8v4.1M9.4 6.8v4.1" })
				]
			});
		}
		/** Shield outline: audit / security status. */
		function ShieldIcon({ size = 16, className }) {
			return (0, react_jsx_runtime.jsx)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				className,
				strokeWidth: 1.5,
				...stroke,
				"aria-hidden": "true",
				focusable: "false",
				children: (0, react_jsx_runtime.jsx)("path", { d: "M8 2.1 3.2 4v3.9c0 2.9 1.9 5.2 4.8 6.3 2.9-1.1 4.8-3.4 4.8-6.3V4z" })
			});
		}
		/** Left arrow: back to the catalogue. */
		function ArrowLeftIcon({ size = 16, className }) {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				className,
				strokeWidth: 1.6,
				...stroke,
				"aria-hidden": "true",
				focusable: "false",
				children: [(0, react_jsx_runtime.jsx)("path", { d: "M12.8 8H3.3" }), (0, react_jsx_runtime.jsx)("path", { d: "M6.7 4.6 3.3 8l3.4 3.4" })]
			});
		}
		/** Circular arrow pair: re-fetch list or source health. */
		function RefreshIcon({ size = 16, className }) {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				className,
				strokeWidth: 1.5,
				...stroke,
				"aria-hidden": "true",
				focusable: "false",
				children: [
					(0, react_jsx_runtime.jsx)("path", { d: "M3.1 8.6a4.9 4.9 0 0 1 8.2-4.1" }),
					(0, react_jsx_runtime.jsx)("path", { d: "M12.9 7.4a4.9 4.9 0 0 1-8.2 4.1" }),
					(0, react_jsx_runtime.jsx)("path", { d: "M11.3 1.9v2.6H8.7" }),
					(0, react_jsx_runtime.jsx)("path", { d: "M4.7 14.1v-2.6h2.6" })
				]
			});
		}
		/** Two stacked sheets: copy file content. */
		function CopyIcon({ size = 16, className }) {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				className,
				strokeWidth: 1.5,
				...stroke,
				"aria-hidden": "true",
				focusable: "false",
				children: [(0, react_jsx_runtime.jsx)("rect", {
					x: "5.7",
					y: "5.7",
					width: "7.7",
					height: "7.7",
					rx: "1.6"
				}), (0, react_jsx_runtime.jsx)("path", { d: "M10.3 5.7V3.9a1.3 1.3 0 0 0-1.3-1.3H3.9a1.3 1.3 0 0 0-1.3 1.3v5.1a1.3 1.3 0 0 0 1.3 1.3h1.8" })]
			});
		}
		/** Tick: copied confirmation and the installed state. */
		function CheckIcon({ size = 16, className }) {
			return (0, react_jsx_runtime.jsx)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				className,
				strokeWidth: 1.75,
				...stroke,
				"aria-hidden": "true",
				focusable: "false",
				children: (0, react_jsx_runtime.jsx)("path", { d: "m3.1 8.5 3.3 3.3 6.5-7.6" })
			});
		}
		/** Document with a folded corner: a skill file. */
		function FileIcon({ size = 16, className }) {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				className,
				strokeWidth: 1.5,
				...stroke,
				"aria-hidden": "true",
				focusable: "false",
				children: [(0, react_jsx_runtime.jsx)("path", { d: "M9.2 1.9H4.6a1.4 1.4 0 0 0-1.4 1.4v9.4a1.4 1.4 0 0 0 1.4 1.4h6.8a1.4 1.4 0 0 0 1.4-1.4V5.5z" }), (0, react_jsx_runtime.jsx)("path", { d: "M9.2 1.9v3.6h3.6" })]
			});
		}
		/** Warning triangle: errors and flagged skills. */
		function AlertIcon({ size = 16, className }) {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				className,
				strokeWidth: 1.5,
				...stroke,
				"aria-hidden": "true",
				focusable: "false",
				children: [
					(0, react_jsx_runtime.jsx)("path", { d: "M6.9 2.3 1.5 11.9a1.2 1.2 0 0 0 1.1 1.8h10.8a1.2 1.2 0 0 0 1.1-1.8L9.1 2.3a1.3 1.3 0 0 0-2.2 0Z" }),
					(0, react_jsx_runtime.jsx)("path", { d: "M8 6.1v3.2" }),
					(0, react_jsx_runtime.jsx)("circle", {
						cx: "8",
						cy: "11.5",
						r: ".7",
						fill: "currentColor",
						stroke: "none"
					})
				]
			});
		}
		/** Diagonal cross: dismiss a banner, clear the search field. */
		function CloseIcon({ size = 16, className }) {
			return (0, react_jsx_runtime.jsx)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				className,
				strokeWidth: 1.6,
				...stroke,
				"aria-hidden": "true",
				focusable: "false",
				children: (0, react_jsx_runtime.jsx)("path", { d: "m3.6 3.6 8.8 8.8M12.4 3.6l-8.8 8.8" })
			});
		}
		/** Folder: leading glyph of the installed skill's location line. */
		function FolderIcon({ size = 16, className }) {
			return (0, react_jsx_runtime.jsx)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				className,
				strokeWidth: 1.5,
				...stroke,
				"aria-hidden": "true",
				focusable: "false",
				children: (0, react_jsx_runtime.jsx)("path", { d: "M1.9 4.6a1.3 1.3 0 0 1 1.3-1.3h2.5l1.4 1.6h5.7a1.3 1.3 0 0 1 1.3 1.3v5.6a1.3 1.3 0 0 1-1.3 1.3H3.2a1.3 1.3 0 0 1-1.3-1.3z" })
			});
		}
		/** Arrow leaving a frame: open the same skill in the marketplace. */
		function ExternalLinkIcon({ size = 16, className }) {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				className,
				strokeWidth: 1.5,
				...stroke,
				"aria-hidden": "true",
				focusable: "false",
				children: [
					(0, react_jsx_runtime.jsx)("path", { d: "M9.4 2.6h4v4" }),
					(0, react_jsx_runtime.jsx)("path", { d: "M13.4 2.6 7.9 8.1" }),
					(0, react_jsx_runtime.jsx)("path", { d: "M12.2 9.6v3.1a1.3 1.3 0 0 1-1.3 1.3H3.6a1.3 1.3 0 0 1-1.3-1.3V5.4a1.3 1.3 0 0 1 1.3-1.3h3.1" })
				]
			});
		}
		//#endregion
		//#region lib/client/skill-insights.js
		/**
		* What a skill will do, read off its own files — before anyone installs it.
		*
		* Everything here is rule-based and explainable: each finding points at the
		* file, command, variable or host it came from, and nothing is inferred that
		* the SKILL.md and file list do not show. When no rule fires, the panel is not
		* rendered at all; an empty "this skill does nothing risky" claim would be a
		* verdict this module cannot make.
		*/
		const SCRIPT_EXTENSIONS = /\.(sh|bash|zsh|py|js|mjs|cjs|ts|rb|ps1|pl|php|go|rs)$/i;
		const SHELL_FENCE = /```(?:bash|sh|shell|zsh|console|terminal)\s*\n([\s\S]*?)```/gi;
		const ANY_FENCE = /```[^\n]*\n([\s\S]*?)```/g;
		const ENV_SECRET = /\b([A-Z][A-Z0-9]*_(?:API_KEY|APIKEY|KEY|TOKEN|SECRET|ACCESS_KEY|SECRET_KEY|PASSWORD))\b/g;
		const URL_HOST = /https?:\/\/([a-z0-9.-]+\.[a-z]{2,})(?::\d+)?[/\w.?=&%-]*/gi;
		/** Hosts that are documentation links rather than something the skill calls. */
		const DOC_HOSTS = /(^|\.)(github\.com|githubusercontent\.com|clawhub\.ai|skillhub\.cn|npmjs\.com|pypi\.org|wikipedia\.org|example\.com|localhost)$/i;
		const WRITE_COMMAND = /(^|[\s;&|])(mkdir|touch|tee|cp|mv|rm|printf[^\n]*>|echo[^\n]*>|cat\s*>)\b/m;
		/** Shell builtins and plumbing that say nothing about what a skill does. */
		const SHELL_NOISE = /* @__PURE__ */ new Set([
			"cd",
			"echo",
			"export",
			"set",
			"then",
			"fi",
			"do",
			"done",
			"else",
			"if",
			"test",
			"true",
			"false",
			"source",
			"cat",
			"ls"
		]);
		const LEVEL_OF = {
			shell: "high",
			hooks: "high",
			secrets: "medium",
			network: "medium",
			writes: "medium",
			binaries: "low"
		};
		function unique(values, limit) {
			return [...new Set(values)].slice(0, limit);
		}
		/** `metadata.<any agent>.requires.{bins,env}` — the common SKILL.md convention. */
		function declaredRequirements(frontmatter) {
			const bins = [];
			const env = [];
			let metadata = frontmatter?.["metadata"];
			if (typeof metadata === "string") try {
				metadata = JSON.parse(metadata);
			} catch {
				metadata = void 0;
			}
			const visit = (value, depth) => {
				if (depth > 4 || typeof value !== "object" || value === null) return;
				const record = value;
				const requires = record["requires"];
				if (typeof requires === "object" && requires !== null) {
					const req = requires;
					for (const bin of Array.isArray(req["bins"]) ? req["bins"] : []) if (typeof bin === "string") bins.push(bin);
					for (const name of Array.isArray(req["env"]) ? req["env"] : []) if (typeof name === "string") env.push(name);
				}
				for (const child of Object.values(record)) visit(child, depth + 1);
			};
			visit(metadata, 0);
			return {
				bins,
				env
			};
		}
		function detectCapabilities(input) {
			const { markdown, files } = input;
			const found = /* @__PURE__ */ new Map();
			const add = (kind, evidence) => {
				if (evidence.length > 0) found.set(kind, unique([...found.get(kind) ?? [], ...evidence], 3));
			};
			const scripts = files.map((file) => file.path).filter((path) => SCRIPT_EXTENSIONS.test(path) && !/(^|[/.])(test|spec)s?([/.]|$)/i.test(path)).filter((path) => !/(^|\/)hooks?\//i.test(path)).sort((a, b) => a.split("/").length - b.split("/").length || a.length - b.length);
			const shellBlocks = [...markdown.matchAll(SHELL_FENCE)].map((match) => match[1] ?? "");
			const firstCommands = shellBlocks.flatMap((block) => block.split("\n")).map((line) => line.replace(/^\s*\$\s*/, "").trim()).filter((line) => line !== "" && !line.startsWith("#")).flatMap((line) => line.split(/\s*(?:\|\||&&|;|\|)\s*/)).map((segment) => segment.replace(/^\[.*?\]\s*/, "").split(/\s+/)[0] ?? "").filter((command) => /^[a-z][\w.-]*$/i.test(command) && !SHELL_NOISE.has(command));
			add("shell", [...scripts.slice(0, 1), ...unique(firstCommands, 2)]);
			add("hooks", unique(files.map((file) => /^(.*?(?:^|\/)hooks?\/)/i.exec(file.path)?.[1]).filter((dir) => dir !== void 0), 1));
			const hookTarget = /(?:^|[\s`'"(])((?:~|\.)\/[\w./-]*?hooks)\b/i.exec(markdown)?.[1];
			if (hookTarget !== void 0 && /hook/i.test(markdown)) add("hooks", [hookTarget]);
			const declared = declaredRequirements(input.frontmatter);
			add("binaries", declared.bins);
			add("secrets", [...declared.env, ...[...markdown.matchAll(ENV_SECRET)].map((match) => match[1] ?? "")]);
			add("network", [...[...markdown.matchAll(ANY_FENCE)].map((match) => match[1] ?? "").join("\n").matchAll(URL_HOST)].map((match) => (match[1] ?? "").toLowerCase()).filter((host) => host !== "" && !DOC_HOSTS.test(host)));
			if (shellBlocks.some((block) => WRITE_COMMAND.test(block))) {
				const places = shellBlocks.flatMap((block) => [...block.matchAll(/(?:mkdir\s+(?:-p\s+)?|>\s*)([.\w~/-]+)/g)].map((match) => match[1] ?? "")).filter((path) => path !== "" && path !== "/dev/null").map((path) => path.includes("/") ? `${path.split("/").slice(0, -1).join("/")}/` : path.startsWith(".") ? `${path}/` : path);
				add("writes", places.length > 0 ? unique(places, 2) : ["files"]);
			}
			return [
				"shell",
				"hooks",
				"secrets",
				"network",
				"writes",
				"binaries"
			].filter((kind) => found.has(kind)).map((kind) => ({
				kind,
				level: LEVEL_OF[kind],
				evidence: found.get(kind) ?? []
			}));
		}
		/**
		* The "when to use" list a SKILL.md description usually carries:
		* `Use when (1) …, (2) …` / `Use when: …; …` / `当……时使用`.
		*/
		function extractTriggers(description) {
			if (!description) return [];
			const text = description.replace(/\s+/g, " ").trim();
			let body = /\b(?:use|activate|trigger(?:ed)?)\s+(?:it\s+|this\s+)?when\b:?\s*(.+)$/i.exec(text)?.[1];
			if (body === void 0) body = /(?:适用于|使用场景[:：]|触发场景[:：]|当)(.+?)(?:时(?:使用|触发|调用)|$)/.exec(text)?.[1];
			if (body === void 0) return [];
			const numbered = body.split(/\s*\(\d+\)\s*|\s*（\d+）\s*|\s*\d+[.、)]\s+/).map((item) => item.trim()).filter(Boolean);
			return (numbered.length > 1 ? numbered : body.split(/[;；。]|,\s*or\s+|、/)).map((item) => item.replace(/^(?:or|and|或|以及)\s+/i, "").replace(/[,，;；.。]+$/, "").trim()).filter((item) => item.length >= 3).map((item) => item.length > 64 ? `${item.slice(0, 63)}…` : item).slice(0, 5);
		}
		/** Rough reading time: ~400 CJK characters or ~220 Latin words per minute. */
		function readingMinutes(markdown) {
			const cjk = (markdown.match(/[㐀-鿿]/g) ?? []).length;
			const words = (markdown.replace(/[㐀-鿿]/g, " ").match(/[A-Za-z0-9_]+/g) ?? []).length;
			return Math.max(1, Math.round(cjk / 400 + words / 220));
		}
		//#endregion
		//#region node_modules/comma-separated-tokens/index.js
		/**
		* Serialize an array of strings or numbers to comma-separated tokens.
		*
		* @param {Array<string|number>} values
		*   List of tokens.
		* @param {Options} [options]
		*   Configuration for `stringify` (optional).
		* @returns {string}
		*   Comma-separated tokens.
		*/
		function stringify$1(values, options) {
			const settings = options || {};
			return (values[values.length - 1] === "" ? [...values, ""] : values).join((settings.padRight ? " " : "") + "," + (settings.padLeft === false ? "" : " ")).trim();
		}
		//#endregion
		//#region node_modules/estree-util-is-identifier-name/lib/index.js
		const nameRe = /^[$_\p{ID_Start}][$_\u{200C}\u{200D}\p{ID_Continue}]*$/u;
		const nameReJsx = /^[$_\p{ID_Start}][-$_\u{200C}\u{200D}\p{ID_Continue}]*$/u;
		/** @type {Options} */
		const emptyOptions$3 = {};
		/**
		* Checks if the given value is a valid identifier name.
		*
		* @param {string} name
		*   Identifier to check.
		* @param {Options | null | undefined} [options]
		*   Configuration (optional).
		* @returns {boolean}
		*   Whether `name` can be an identifier.
		*/
		function name$1(name, options) {
			return ((options || emptyOptions$3).jsx ? nameReJsx : nameRe).test(name);
		}
		//#endregion
		//#region node_modules/hast-util-whitespace/lib/index.js
		/**
		* @typedef {import('hast').Nodes} Nodes
		*/
		const re = /[ \t\n\f\r]/g;
		/**
		* Check if the given value is *inter-element whitespace*.
		*
		* @param {Nodes | string} thing
		*   Thing to check (`Node` or `string`).
		* @returns {boolean}
		*   Whether the `value` is inter-element whitespace (`boolean`): consisting of
		*   zero or more of space, tab (`\t`), line feed (`\n`), carriage return
		*   (`\r`), or form feed (`\f`); if a node is passed it must be a `Text` node,
		*   whose `value` field is checked.
		*/
		function whitespace(thing) {
			return typeof thing === "object" ? thing.type === "text" ? empty$1(thing.value) : false : empty$1(thing);
		}
		/**
		* @param {string} value
		* @returns {boolean}
		*/
		function empty$1(value) {
			return value.replace(re, "") === "";
		}
		//#endregion
		//#region node_modules/property-information/lib/util/schema.js
		/**
		* @import {Schema as SchemaType, Space} from 'property-information'
		*/
		/** @type {SchemaType} */
		var Schema = class {
			/**
			* @param {SchemaType['property']} property
			*   Property.
			* @param {SchemaType['normal']} normal
			*   Normal.
			* @param {Space | undefined} [space]
			*   Space.
			* @returns
			*   Schema.
			*/
			constructor(property, normal, space) {
				this.normal = normal;
				this.property = property;
				if (space) this.space = space;
			}
		};
		Schema.prototype.normal = {};
		Schema.prototype.property = {};
		Schema.prototype.space = void 0;
		//#endregion
		//#region node_modules/property-information/lib/util/merge.js
		/**
		* @import {Info, Space} from 'property-information'
		*/
		/**
		* @param {ReadonlyArray<Schema>} definitions
		*   Definitions.
		* @param {Space | undefined} [space]
		*   Space.
		* @returns {Schema}
		*   Schema.
		*/
		function merge(definitions, space) {
			/** @type {Record<string, Info>} */
			const property = {};
			/** @type {Record<string, string>} */
			const normal = {};
			for (const definition of definitions) {
				Object.assign(property, definition.property);
				Object.assign(normal, definition.normal);
			}
			return new Schema(property, normal, space);
		}
		//#endregion
		//#region node_modules/property-information/lib/normalize.js
		/**
		* Get the cleaned case insensitive form of an attribute or property.
		*
		* @param {string} value
		*   An attribute-like or property-like name.
		* @returns {string}
		*   Value that can be used to look up the properly cased property on a
		*   `Schema`.
		*/
		function normalize$1(value) {
			return value.toLowerCase();
		}
		//#endregion
		//#region node_modules/property-information/lib/util/info.js
		/**
		* @import {Info as InfoType} from 'property-information'
		*/
		/** @type {InfoType} */
		var Info = class {
			/**
			* @param {string} property
			*   Property.
			* @param {string} attribute
			*   Attribute.
			* @returns
			*   Info.
			*/
			constructor(property, attribute) {
				this.attribute = attribute;
				this.property = property;
			}
		};
		Info.prototype.attribute = "";
		Info.prototype.booleanish = false;
		Info.prototype.boolean = false;
		Info.prototype.commaOrSpaceSeparated = false;
		Info.prototype.commaSeparated = false;
		Info.prototype.defined = false;
		Info.prototype.mustUseProperty = false;
		Info.prototype.number = false;
		Info.prototype.overloadedBoolean = false;
		Info.prototype.property = "";
		Info.prototype.spaceSeparated = false;
		Info.prototype.space = void 0;
		//#endregion
		//#region node_modules/property-information/lib/util/types.js
		var types_exports = /* @__PURE__ */ __exportAll({
			boolean: () => boolean,
			booleanish: () => booleanish,
			commaOrSpaceSeparated: () => commaOrSpaceSeparated,
			commaSeparated: () => commaSeparated,
			number: () => number,
			overloadedBoolean: () => overloadedBoolean,
			spaceSeparated: () => spaceSeparated
		});
		let powers = 0;
		const boolean = increment();
		const booleanish = increment();
		const overloadedBoolean = increment();
		const number = increment();
		const spaceSeparated = increment();
		const commaSeparated = increment();
		const commaOrSpaceSeparated = increment();
		function increment() {
			return 2 ** ++powers;
		}
		//#endregion
		//#region node_modules/property-information/lib/util/defined-info.js
		/**
		* @import {Space} from 'property-information'
		*/
		const checks = Object.keys(types_exports);
		var DefinedInfo = class extends Info {
			/**
			* @constructor
			* @param {string} property
			*   Property.
			* @param {string} attribute
			*   Attribute.
			* @param {number | null | undefined} [mask]
			*   Mask.
			* @param {Space | undefined} [space]
			*   Space.
			* @returns
			*   Info.
			*/
			constructor(property, attribute, mask, space) {
				let index = -1;
				super(property, attribute);
				mark(this, "space", space);
				if (typeof mask === "number") while (++index < checks.length) {
					const check = checks[index];
					mark(this, checks[index], (mask & types_exports[check]) === types_exports[check]);
				}
			}
		};
		DefinedInfo.prototype.defined = true;
		/**
		* @template {keyof DefinedInfo} Key
		*   Key type.
		* @param {DefinedInfo} values
		*   Info.
		* @param {Key} key
		*   Key.
		* @param {DefinedInfo[Key]} value
		*   Value.
		* @returns {undefined}
		*   Nothing.
		*/
		function mark(values, key, value) {
			if (value) values[key] = value;
		}
		//#endregion
		//#region node_modules/property-information/lib/util/create.js
		/**
		* @import {Info, Space} from 'property-information'
		*/
		/**
		* @typedef Definition
		*   Definition of a schema.
		* @property {Record<string, string> | undefined} [attributes]
		*   Normalzed names to special attribute case.
		* @property {ReadonlyArray<string> | undefined} [mustUseProperty]
		*   Normalized names that must be set as properties.
		* @property {Record<string, number | null>} properties
		*   Property names to their types.
		* @property {Space | undefined} [space]
		*   Space.
		* @property {Transform} transform
		*   Transform a property name.
		*/
		/**
		* @callback Transform
		*   Transform.
		* @param {Record<string, string>} attributes
		*   Attributes.
		* @param {string} property
		*   Property.
		* @returns {string}
		*   Attribute.
		*/
		/**
		* @param {Definition} definition
		*   Definition.
		* @returns {Schema}
		*   Schema.
		*/
		function create(definition) {
			/** @type {Record<string, Info>} */
			const properties = {};
			/** @type {Record<string, string>} */
			const normals = {};
			for (const [property, value] of Object.entries(definition.properties)) {
				const info = new DefinedInfo(property, definition.transform(definition.attributes || {}, property), value, definition.space);
				if (definition.mustUseProperty && definition.mustUseProperty.includes(property)) info.mustUseProperty = true;
				properties[property] = info;
				normals[normalize$1(property)] = property;
				normals[normalize$1(info.attribute)] = property;
			}
			return new Schema(properties, normals, definition.space);
		}
		//#endregion
		//#region node_modules/property-information/lib/aria.js
		const aria = create({
			properties: {
				ariaActiveDescendant: null,
				ariaAtomic: booleanish,
				ariaAutoComplete: null,
				ariaBusy: booleanish,
				ariaChecked: booleanish,
				ariaColCount: number,
				ariaColIndex: number,
				ariaColSpan: number,
				ariaControls: spaceSeparated,
				ariaCurrent: null,
				ariaDescribedBy: spaceSeparated,
				ariaDetails: null,
				ariaDisabled: booleanish,
				ariaDropEffect: spaceSeparated,
				ariaErrorMessage: null,
				ariaExpanded: booleanish,
				ariaFlowTo: spaceSeparated,
				ariaGrabbed: booleanish,
				ariaHasPopup: null,
				ariaHidden: booleanish,
				ariaInvalid: null,
				ariaKeyShortcuts: null,
				ariaLabel: null,
				ariaLabelledBy: spaceSeparated,
				ariaLevel: number,
				ariaLive: null,
				ariaModal: booleanish,
				ariaMultiLine: booleanish,
				ariaMultiSelectable: booleanish,
				ariaOrientation: null,
				ariaOwns: spaceSeparated,
				ariaPlaceholder: null,
				ariaPosInSet: number,
				ariaPressed: booleanish,
				ariaReadOnly: booleanish,
				ariaRelevant: null,
				ariaRequired: booleanish,
				ariaRoleDescription: spaceSeparated,
				ariaRowCount: number,
				ariaRowIndex: number,
				ariaRowSpan: number,
				ariaSelected: booleanish,
				ariaSetSize: number,
				ariaSort: null,
				ariaValueMax: number,
				ariaValueMin: number,
				ariaValueNow: number,
				ariaValueText: null,
				role: null
			},
			transform(_, property) {
				return property === "role" ? property : "aria-" + property.slice(4).toLowerCase();
			}
		});
		//#endregion
		//#region node_modules/property-information/lib/util/case-sensitive-transform.js
		/**
		* @param {Record<string, string>} attributes
		*   Attributes.
		* @param {string} attribute
		*   Attribute.
		* @returns {string}
		*   Transformed attribute.
		*/
		function caseSensitiveTransform(attributes, attribute) {
			return attribute in attributes ? attributes[attribute] : attribute;
		}
		//#endregion
		//#region node_modules/property-information/lib/util/case-insensitive-transform.js
		/**
		* @param {Record<string, string>} attributes
		*   Attributes.
		* @param {string} property
		*   Property.
		* @returns {string}
		*   Transformed property.
		*/
		function caseInsensitiveTransform(attributes, property) {
			return caseSensitiveTransform(attributes, property.toLowerCase());
		}
		//#endregion
		//#region node_modules/property-information/lib/html.js
		const html$3 = create({
			attributes: {
				acceptcharset: "accept-charset",
				classname: "class",
				htmlfor: "for",
				httpequiv: "http-equiv"
			},
			mustUseProperty: [
				"checked",
				"multiple",
				"muted",
				"selected"
			],
			properties: {
				abbr: null,
				accept: commaSeparated,
				acceptCharset: spaceSeparated,
				accessKey: spaceSeparated,
				action: null,
				allow: null,
				allowFullScreen: boolean,
				allowPaymentRequest: boolean,
				allowUserMedia: boolean,
				alpha: boolean,
				alt: null,
				as: null,
				async: boolean,
				autoCapitalize: null,
				autoComplete: spaceSeparated,
				autoFocus: boolean,
				autoPlay: boolean,
				blocking: spaceSeparated,
				capture: null,
				charSet: null,
				checked: boolean,
				cite: null,
				className: spaceSeparated,
				closedBy: null,
				colorSpace: null,
				cols: number,
				colSpan: number,
				command: null,
				commandFor: null,
				content: null,
				contentEditable: booleanish,
				controls: boolean,
				controlsList: spaceSeparated,
				coords: number | commaSeparated,
				crossOrigin: null,
				data: null,
				dateTime: null,
				decoding: null,
				default: boolean,
				defer: boolean,
				dir: null,
				dirName: null,
				disabled: boolean,
				download: overloadedBoolean,
				draggable: booleanish,
				encType: null,
				enterKeyHint: null,
				fetchPriority: null,
				form: null,
				formAction: null,
				formEncType: null,
				formMethod: null,
				formNoValidate: boolean,
				formTarget: null,
				headers: spaceSeparated,
				height: number,
				hidden: overloadedBoolean,
				high: number,
				href: null,
				hrefLang: null,
				htmlFor: spaceSeparated,
				httpEquiv: spaceSeparated,
				id: null,
				imageSizes: null,
				imageSrcSet: null,
				inert: boolean,
				inputMode: null,
				integrity: null,
				is: null,
				isMap: boolean,
				itemId: null,
				itemProp: spaceSeparated,
				itemRef: spaceSeparated,
				itemScope: boolean,
				itemType: spaceSeparated,
				kind: null,
				label: null,
				lang: null,
				language: null,
				list: null,
				loading: null,
				loop: boolean,
				low: number,
				manifest: null,
				max: null,
				maxLength: number,
				media: null,
				method: null,
				min: null,
				minLength: number,
				multiple: boolean,
				muted: boolean,
				name: null,
				nonce: null,
				noModule: boolean,
				noValidate: boolean,
				onAbort: null,
				onAfterPrint: null,
				onAuxClick: null,
				onBeforeMatch: null,
				onBeforePrint: null,
				onBeforeToggle: null,
				onBeforeUnload: null,
				onBlur: null,
				onCancel: null,
				onCanPlay: null,
				onCanPlayThrough: null,
				onChange: null,
				onClick: null,
				onClose: null,
				onContextLost: null,
				onContextMenu: null,
				onContextRestored: null,
				onCopy: null,
				onCueChange: null,
				onCut: null,
				onDblClick: null,
				onDrag: null,
				onDragEnd: null,
				onDragEnter: null,
				onDragExit: null,
				onDragLeave: null,
				onDragOver: null,
				onDragStart: null,
				onDrop: null,
				onDurationChange: null,
				onEmptied: null,
				onEnded: null,
				onError: null,
				onFocus: null,
				onFormData: null,
				onHashChange: null,
				onInput: null,
				onInvalid: null,
				onKeyDown: null,
				onKeyPress: null,
				onKeyUp: null,
				onLanguageChange: null,
				onLoad: null,
				onLoadedData: null,
				onLoadedMetadata: null,
				onLoadEnd: null,
				onLoadStart: null,
				onMessage: null,
				onMessageError: null,
				onMouseDown: null,
				onMouseEnter: null,
				onMouseLeave: null,
				onMouseMove: null,
				onMouseOut: null,
				onMouseOver: null,
				onMouseUp: null,
				onOffline: null,
				onOnline: null,
				onPageHide: null,
				onPageShow: null,
				onPaste: null,
				onPause: null,
				onPlay: null,
				onPlaying: null,
				onPopState: null,
				onProgress: null,
				onRateChange: null,
				onRejectionHandled: null,
				onReset: null,
				onResize: null,
				onScroll: null,
				onScrollEnd: null,
				onSecurityPolicyViolation: null,
				onSeeked: null,
				onSeeking: null,
				onSelect: null,
				onSlotChange: null,
				onStalled: null,
				onStorage: null,
				onSubmit: null,
				onSuspend: null,
				onTimeUpdate: null,
				onToggle: null,
				onUnhandledRejection: null,
				onUnload: null,
				onVolumeChange: null,
				onWaiting: null,
				onWheel: null,
				open: boolean,
				optimum: number,
				pattern: null,
				ping: spaceSeparated,
				placeholder: null,
				playsInline: boolean,
				popover: null,
				popoverTarget: null,
				popoverTargetAction: null,
				poster: null,
				preload: null,
				readOnly: boolean,
				referrerPolicy: null,
				rel: spaceSeparated,
				required: boolean,
				reversed: boolean,
				rows: number,
				rowSpan: number,
				sandbox: spaceSeparated,
				scope: null,
				scoped: boolean,
				seamless: boolean,
				selected: boolean,
				shadowRootClonable: boolean,
				shadowRootCustomElementRegistry: boolean,
				shadowRootDelegatesFocus: boolean,
				shadowRootMode: null,
				shadowRootSerializable: boolean,
				shape: null,
				size: number,
				sizes: null,
				slot: null,
				span: number,
				spellCheck: booleanish,
				src: null,
				srcDoc: null,
				srcLang: null,
				srcSet: null,
				start: number,
				step: null,
				style: null,
				tabIndex: number,
				target: null,
				title: null,
				translate: null,
				type: null,
				typeMustMatch: boolean,
				useMap: null,
				value: booleanish,
				width: number,
				wrap: null,
				writingSuggestions: null,
				align: null,
				aLink: null,
				archive: spaceSeparated,
				axis: null,
				background: null,
				bgColor: null,
				border: number,
				borderColor: null,
				bottomMargin: number,
				cellPadding: null,
				cellSpacing: null,
				char: null,
				charOff: null,
				classId: null,
				clear: null,
				code: null,
				codeBase: null,
				codeType: null,
				color: null,
				compact: boolean,
				declare: boolean,
				event: null,
				face: null,
				frame: null,
				frameBorder: null,
				hSpace: number,
				leftMargin: number,
				link: null,
				longDesc: null,
				lowSrc: null,
				marginHeight: number,
				marginWidth: number,
				noResize: boolean,
				noHref: boolean,
				noShade: boolean,
				noWrap: boolean,
				object: null,
				profile: null,
				prompt: null,
				rev: null,
				rightMargin: number,
				rules: null,
				scheme: null,
				scrolling: booleanish,
				standby: null,
				summary: null,
				text: null,
				topMargin: number,
				valueType: null,
				version: null,
				vAlign: null,
				vLink: null,
				vSpace: number,
				allowTransparency: null,
				autoCorrect: null,
				autoSave: null,
				credentialless: boolean,
				disablePictureInPicture: boolean,
				disableRemotePlayback: boolean,
				exportParts: commaSeparated,
				part: spaceSeparated,
				prefix: null,
				property: null,
				results: number,
				security: null,
				unselectable: null
			},
			space: "html",
			transform: caseInsensitiveTransform
		});
		//#endregion
		//#region node_modules/property-information/lib/svg.js
		const svg$1 = create({
			attributes: {
				accentHeight: "accent-height",
				alignmentBaseline: "alignment-baseline",
				arabicForm: "arabic-form",
				baselineShift: "baseline-shift",
				capHeight: "cap-height",
				className: "class",
				clipPath: "clip-path",
				clipRule: "clip-rule",
				colorInterpolation: "color-interpolation",
				colorInterpolationFilters: "color-interpolation-filters",
				colorProfile: "color-profile",
				colorRendering: "color-rendering",
				crossOrigin: "crossorigin",
				dataType: "datatype",
				dominantBaseline: "dominant-baseline",
				enableBackground: "enable-background",
				fillOpacity: "fill-opacity",
				fillRule: "fill-rule",
				floodColor: "flood-color",
				floodOpacity: "flood-opacity",
				fontFamily: "font-family",
				fontSize: "font-size",
				fontSizeAdjust: "font-size-adjust",
				fontStretch: "font-stretch",
				fontStyle: "font-style",
				fontVariant: "font-variant",
				fontWeight: "font-weight",
				glyphName: "glyph-name",
				glyphOrientationHorizontal: "glyph-orientation-horizontal",
				glyphOrientationVertical: "glyph-orientation-vertical",
				hrefLang: "hreflang",
				horizAdvX: "horiz-adv-x",
				horizOriginX: "horiz-origin-x",
				horizOriginY: "horiz-origin-y",
				imageRendering: "image-rendering",
				letterSpacing: "letter-spacing",
				lightingColor: "lighting-color",
				markerEnd: "marker-end",
				markerMid: "marker-mid",
				markerStart: "marker-start",
				maskType: "mask-type",
				navDown: "nav-down",
				navDownLeft: "nav-down-left",
				navDownRight: "nav-down-right",
				navLeft: "nav-left",
				navNext: "nav-next",
				navPrev: "nav-prev",
				navRight: "nav-right",
				navUp: "nav-up",
				navUpLeft: "nav-up-left",
				navUpRight: "nav-up-right",
				onAbort: "onabort",
				onActivate: "onactivate",
				onAfterPrint: "onafterprint",
				onBeforePrint: "onbeforeprint",
				onBegin: "onbegin",
				onCancel: "oncancel",
				onCanPlay: "oncanplay",
				onCanPlayThrough: "oncanplaythrough",
				onChange: "onchange",
				onClick: "onclick",
				onClose: "onclose",
				onCopy: "oncopy",
				onCueChange: "oncuechange",
				onCut: "oncut",
				onDblClick: "ondblclick",
				onDrag: "ondrag",
				onDragEnd: "ondragend",
				onDragEnter: "ondragenter",
				onDragExit: "ondragexit",
				onDragLeave: "ondragleave",
				onDragOver: "ondragover",
				onDragStart: "ondragstart",
				onDrop: "ondrop",
				onDurationChange: "ondurationchange",
				onEmptied: "onemptied",
				onEnd: "onend",
				onEnded: "onended",
				onError: "onerror",
				onFocus: "onfocus",
				onFocusIn: "onfocusin",
				onFocusOut: "onfocusout",
				onHashChange: "onhashchange",
				onInput: "oninput",
				onInvalid: "oninvalid",
				onKeyDown: "onkeydown",
				onKeyPress: "onkeypress",
				onKeyUp: "onkeyup",
				onLoad: "onload",
				onLoadedData: "onloadeddata",
				onLoadedMetadata: "onloadedmetadata",
				onLoadStart: "onloadstart",
				onMessage: "onmessage",
				onMouseDown: "onmousedown",
				onMouseEnter: "onmouseenter",
				onMouseLeave: "onmouseleave",
				onMouseMove: "onmousemove",
				onMouseOut: "onmouseout",
				onMouseOver: "onmouseover",
				onMouseUp: "onmouseup",
				onMouseWheel: "onmousewheel",
				onOffline: "onoffline",
				onOnline: "ononline",
				onPageHide: "onpagehide",
				onPageShow: "onpageshow",
				onPaste: "onpaste",
				onPause: "onpause",
				onPlay: "onplay",
				onPlaying: "onplaying",
				onPopState: "onpopstate",
				onProgress: "onprogress",
				onRateChange: "onratechange",
				onRepeat: "onrepeat",
				onReset: "onreset",
				onResize: "onresize",
				onScroll: "onscroll",
				onSeeked: "onseeked",
				onSeeking: "onseeking",
				onSelect: "onselect",
				onShow: "onshow",
				onStalled: "onstalled",
				onStorage: "onstorage",
				onSubmit: "onsubmit",
				onSuspend: "onsuspend",
				onTimeUpdate: "ontimeupdate",
				onToggle: "ontoggle",
				onUnload: "onunload",
				onVolumeChange: "onvolumechange",
				onWaiting: "onwaiting",
				onZoom: "onzoom",
				overlinePosition: "overline-position",
				overlineThickness: "overline-thickness",
				paintOrder: "paint-order",
				panose1: "panose-1",
				pointerEvents: "pointer-events",
				referrerPolicy: "referrerpolicy",
				renderingIntent: "rendering-intent",
				shapeRendering: "shape-rendering",
				stopColor: "stop-color",
				stopOpacity: "stop-opacity",
				strikethroughPosition: "strikethrough-position",
				strikethroughThickness: "strikethrough-thickness",
				strokeDashArray: "stroke-dasharray",
				strokeDashOffset: "stroke-dashoffset",
				strokeLineCap: "stroke-linecap",
				strokeLineJoin: "stroke-linejoin",
				strokeMiterLimit: "stroke-miterlimit",
				strokeOpacity: "stroke-opacity",
				strokeWidth: "stroke-width",
				tabIndex: "tabindex",
				textAnchor: "text-anchor",
				textDecoration: "text-decoration",
				textRendering: "text-rendering",
				transformOrigin: "transform-origin",
				typeOf: "typeof",
				underlinePosition: "underline-position",
				underlineThickness: "underline-thickness",
				unicodeBidi: "unicode-bidi",
				unicodeRange: "unicode-range",
				unitsPerEm: "units-per-em",
				vAlphabetic: "v-alphabetic",
				vHanging: "v-hanging",
				vIdeographic: "v-ideographic",
				vMathematical: "v-mathematical",
				vectorEffect: "vector-effect",
				vertAdvY: "vert-adv-y",
				vertOriginX: "vert-origin-x",
				vertOriginY: "vert-origin-y",
				wordSpacing: "word-spacing",
				writingMode: "writing-mode",
				xHeight: "x-height",
				playbackOrder: "playbackorder",
				timelineBegin: "timelinebegin"
			},
			properties: {
				about: commaOrSpaceSeparated,
				accentHeight: number,
				accumulate: null,
				additive: null,
				alignmentBaseline: null,
				alphabetic: number,
				amplitude: number,
				arabicForm: null,
				ascent: number,
				attributeName: null,
				attributeType: null,
				azimuth: number,
				bandwidth: null,
				baselineShift: null,
				baseFrequency: null,
				baseProfile: null,
				bbox: null,
				begin: null,
				bias: number,
				by: null,
				calcMode: null,
				capHeight: number,
				className: spaceSeparated,
				clip: null,
				clipPath: null,
				clipPathUnits: null,
				clipRule: null,
				color: null,
				colorInterpolation: null,
				colorInterpolationFilters: null,
				colorProfile: null,
				colorRendering: null,
				content: null,
				contentScriptType: null,
				contentStyleType: null,
				crossOrigin: null,
				cursor: null,
				cx: null,
				cy: null,
				d: null,
				dataType: null,
				defaultAction: null,
				descent: number,
				diffuseConstant: number,
				direction: null,
				display: null,
				dur: null,
				divisor: number,
				dominantBaseline: null,
				download: boolean,
				dx: null,
				dy: null,
				edgeMode: null,
				editable: null,
				elevation: number,
				enableBackground: null,
				end: null,
				event: null,
				exponent: number,
				externalResourcesRequired: null,
				fill: null,
				fillOpacity: number,
				fillRule: null,
				filter: null,
				filterRes: null,
				filterUnits: null,
				floodColor: null,
				floodOpacity: null,
				focusable: null,
				focusHighlight: null,
				fontFamily: null,
				fontSize: null,
				fontSizeAdjust: null,
				fontStretch: null,
				fontStyle: null,
				fontVariant: null,
				fontWeight: null,
				format: null,
				fr: null,
				from: null,
				fx: null,
				fy: null,
				g1: commaSeparated,
				g2: commaSeparated,
				glyphName: commaSeparated,
				glyphOrientationHorizontal: null,
				glyphOrientationVertical: null,
				glyphRef: null,
				gradientTransform: null,
				gradientUnits: null,
				handler: null,
				hanging: number,
				hatchContentUnits: null,
				hatchUnits: null,
				height: null,
				href: null,
				hrefLang: null,
				horizAdvX: number,
				horizOriginX: number,
				horizOriginY: number,
				id: null,
				ideographic: number,
				imageRendering: null,
				initialVisibility: null,
				in: null,
				in2: null,
				intercept: number,
				k: number,
				k1: number,
				k2: number,
				k3: number,
				k4: number,
				kernelMatrix: commaOrSpaceSeparated,
				kernelUnitLength: null,
				keyPoints: null,
				keySplines: null,
				keyTimes: null,
				kerning: null,
				lang: null,
				lengthAdjust: null,
				letterSpacing: null,
				lightingColor: null,
				limitingConeAngle: number,
				local: null,
				markerEnd: null,
				markerMid: null,
				markerStart: null,
				markerHeight: null,
				markerUnits: null,
				markerWidth: null,
				mask: null,
				maskContentUnits: null,
				maskType: null,
				maskUnits: null,
				mathematical: null,
				max: null,
				media: null,
				mediaCharacterEncoding: null,
				mediaContentEncodings: null,
				mediaSize: number,
				mediaTime: null,
				method: null,
				min: null,
				mode: null,
				name: null,
				navDown: null,
				navDownLeft: null,
				navDownRight: null,
				navLeft: null,
				navNext: null,
				navPrev: null,
				navRight: null,
				navUp: null,
				navUpLeft: null,
				navUpRight: null,
				numOctaves: null,
				observer: null,
				offset: null,
				onAbort: null,
				onActivate: null,
				onAfterPrint: null,
				onBeforePrint: null,
				onBegin: null,
				onCancel: null,
				onCanPlay: null,
				onCanPlayThrough: null,
				onChange: null,
				onClick: null,
				onClose: null,
				onCopy: null,
				onCueChange: null,
				onCut: null,
				onDblClick: null,
				onDrag: null,
				onDragEnd: null,
				onDragEnter: null,
				onDragExit: null,
				onDragLeave: null,
				onDragOver: null,
				onDragStart: null,
				onDrop: null,
				onDurationChange: null,
				onEmptied: null,
				onEnd: null,
				onEnded: null,
				onError: null,
				onFocus: null,
				onFocusIn: null,
				onFocusOut: null,
				onHashChange: null,
				onInput: null,
				onInvalid: null,
				onKeyDown: null,
				onKeyPress: null,
				onKeyUp: null,
				onLoad: null,
				onLoadedData: null,
				onLoadedMetadata: null,
				onLoadStart: null,
				onMessage: null,
				onMouseDown: null,
				onMouseEnter: null,
				onMouseLeave: null,
				onMouseMove: null,
				onMouseOut: null,
				onMouseOver: null,
				onMouseUp: null,
				onMouseWheel: null,
				onOffline: null,
				onOnline: null,
				onPageHide: null,
				onPageShow: null,
				onPaste: null,
				onPause: null,
				onPlay: null,
				onPlaying: null,
				onPopState: null,
				onProgress: null,
				onRateChange: null,
				onRepeat: null,
				onReset: null,
				onResize: null,
				onScroll: null,
				onSeeked: null,
				onSeeking: null,
				onSelect: null,
				onShow: null,
				onStalled: null,
				onStorage: null,
				onSubmit: null,
				onSuspend: null,
				onTimeUpdate: null,
				onToggle: null,
				onUnload: null,
				onVolumeChange: null,
				onWaiting: null,
				onZoom: null,
				opacity: null,
				operator: null,
				order: null,
				orient: null,
				orientation: null,
				origin: null,
				overflow: null,
				overlay: null,
				overlinePosition: number,
				overlineThickness: number,
				paintOrder: null,
				panose1: null,
				path: null,
				pathLength: number,
				patternContentUnits: null,
				patternTransform: null,
				patternUnits: null,
				phase: null,
				ping: spaceSeparated,
				pitch: null,
				playbackOrder: null,
				pointerEvents: null,
				points: null,
				pointsAtX: number,
				pointsAtY: number,
				pointsAtZ: number,
				preserveAlpha: null,
				preserveAspectRatio: null,
				primitiveUnits: null,
				propagate: null,
				property: commaOrSpaceSeparated,
				r: null,
				radius: null,
				referrerPolicy: null,
				refX: null,
				refY: null,
				rel: commaOrSpaceSeparated,
				rev: commaOrSpaceSeparated,
				renderingIntent: null,
				repeatCount: null,
				repeatDur: null,
				requiredExtensions: commaOrSpaceSeparated,
				requiredFeatures: commaOrSpaceSeparated,
				requiredFonts: commaOrSpaceSeparated,
				requiredFormats: commaOrSpaceSeparated,
				resource: null,
				restart: null,
				result: null,
				rotate: null,
				rx: null,
				ry: null,
				scale: null,
				seed: null,
				shapeRendering: null,
				side: null,
				slope: null,
				snapshotTime: null,
				specularConstant: number,
				specularExponent: number,
				spreadMethod: null,
				spacing: null,
				startOffset: null,
				stdDeviation: null,
				stemh: null,
				stemv: null,
				stitchTiles: null,
				stopColor: null,
				stopOpacity: null,
				strikethroughPosition: number,
				strikethroughThickness: number,
				string: null,
				stroke: null,
				strokeDashArray: commaOrSpaceSeparated,
				strokeDashOffset: null,
				strokeLineCap: null,
				strokeLineJoin: null,
				strokeMiterLimit: number,
				strokeOpacity: number,
				strokeWidth: null,
				style: null,
				surfaceScale: number,
				syncBehavior: null,
				syncBehaviorDefault: null,
				syncMaster: null,
				syncTolerance: null,
				syncToleranceDefault: null,
				systemLanguage: commaOrSpaceSeparated,
				tabIndex: number,
				tableValues: null,
				target: null,
				targetX: number,
				targetY: number,
				textAnchor: null,
				textDecoration: null,
				textRendering: null,
				textLength: null,
				timelineBegin: null,
				title: null,
				transformBehavior: null,
				type: null,
				typeOf: commaOrSpaceSeparated,
				to: null,
				transform: null,
				transformOrigin: null,
				u1: null,
				u2: null,
				underlinePosition: number,
				underlineThickness: number,
				unicode: null,
				unicodeBidi: null,
				unicodeRange: null,
				unitsPerEm: number,
				values: null,
				vAlphabetic: number,
				vMathematical: number,
				vectorEffect: null,
				vHanging: number,
				vIdeographic: number,
				version: null,
				vertAdvY: number,
				vertOriginX: number,
				vertOriginY: number,
				viewBox: null,
				viewTarget: null,
				visibility: null,
				width: null,
				widths: null,
				wordSpacing: null,
				writingMode: null,
				x: null,
				x1: null,
				x2: null,
				xChannelSelector: null,
				xHeight: number,
				y: null,
				y1: null,
				y2: null,
				yChannelSelector: null,
				z: null,
				zoomAndPan: null
			},
			space: "svg",
			transform: caseSensitiveTransform
		});
		//#endregion
		//#region node_modules/property-information/lib/xlink.js
		const xlink = create({
			properties: {
				xLinkActuate: null,
				xLinkArcRole: null,
				xLinkHref: null,
				xLinkRole: null,
				xLinkShow: null,
				xLinkTitle: null,
				xLinkType: null
			},
			space: "xlink",
			transform(_, property) {
				return "xlink:" + property.slice(5).toLowerCase();
			}
		});
		//#endregion
		//#region node_modules/property-information/lib/xmlns.js
		const xmlns = create({
			attributes: { xmlnsxlink: "xmlns:xlink" },
			properties: {
				xmlnsXLink: null,
				xmlns: null
			},
			space: "xmlns",
			transform: caseInsensitiveTransform
		});
		//#endregion
		//#region node_modules/property-information/lib/xml.js
		const xml = create({
			properties: {
				xmlBase: null,
				xmlLang: null,
				xmlSpace: null
			},
			space: "xml",
			transform(_, property) {
				return "xml:" + property.slice(3).toLowerCase();
			}
		});
		//#endregion
		//#region node_modules/property-information/lib/hast-to-react.js
		/**
		* Special cases for React (`Record<string, string>`).
		*
		* `hast` is close to `React` but differs in a couple of cases.
		* To get a React property from a hast property,
		* check if it is in `hastToReact`.
		* If it is, use the corresponding value;
		* otherwise, use the hast property.
		*
		* @type {Record<string, string>}
		*/
		const hastToReact = {
			classId: "classID",
			dataType: "datatype",
			itemId: "itemID",
			strokeDashArray: "strokeDasharray",
			strokeDashOffset: "strokeDashoffset",
			strokeLineCap: "strokeLinecap",
			strokeLineJoin: "strokeLinejoin",
			strokeMiterLimit: "strokeMiterlimit",
			typeOf: "typeof",
			xLinkActuate: "xlinkActuate",
			xLinkArcRole: "xlinkArcrole",
			xLinkHref: "xlinkHref",
			xLinkRole: "xlinkRole",
			xLinkShow: "xlinkShow",
			xLinkTitle: "xlinkTitle",
			xLinkType: "xlinkType",
			xmlnsXLink: "xmlnsXlink"
		};
		//#endregion
		//#region node_modules/property-information/lib/find.js
		/**
		* @import {Schema} from 'property-information'
		*/
		const cap$1 = /[A-Z]/g;
		const dash = /-[a-z]/g;
		const valid = /^data[-\w.:]+$/i;
		/**
		* Look up info on a property.
		*
		* In most cases the given `schema` contains info on the property.
		* All standard,
		* most legacy,
		* and some non-standard properties are supported.
		* For these cases,
		* the returned `Info` has hints about the value of the property.
		*
		* `name` can also be a valid data attribute or property,
		* in which case an `Info` object with the correctly cased `attribute` and
		* `property` is returned.
		*
		* `name` can be an unknown attribute,
		* in which case an `Info` object with `attribute` and `property` set to the
		* given name is returned.
		* It is not recommended to provide unsupported legacy or recently specced
		* properties.
		*
		*
		* @param {Schema} schema
		*   Schema;
		*   either the `html` or `svg` export.
		* @param {string} value
		*   An attribute-like or property-like name;
		*   it will be passed through `normalize` to hopefully find the correct info.
		* @returns {Info}
		*   Info.
		*/
		function find(schema, value) {
			const normal = normalize$1(value);
			let property = value;
			let Type = Info;
			if (normal in schema.normal) return schema.property[schema.normal[normal]];
			if (normal.length > 4 && normal.slice(0, 4) === "data" && valid.test(value)) {
				if (value.charAt(4) === "-") {
					const rest = value.slice(5).replace(dash, camelcase);
					property = "data" + rest.charAt(0).toUpperCase() + rest.slice(1);
				} else {
					const rest = value.slice(4);
					if (!dash.test(rest)) {
						let dashes = rest.replace(cap$1, kebab);
						if (dashes.charAt(0) !== "-") dashes = "-" + dashes;
						value = "data" + dashes;
					}
				}
				Type = DefinedInfo;
			}
			return new Type(property, value);
		}
		/**
		* @param {string} $0
		*   Value.
		* @returns {string}
		*   Kebab.
		*/
		function kebab($0) {
			return "-" + $0.toLowerCase();
		}
		/**
		* @param {string} $0
		*   Value.
		* @returns {string}
		*   Camel.
		*/
		function camelcase($0) {
			return $0.charAt(1).toUpperCase();
		}
		//#endregion
		//#region node_modules/property-information/index.js
		const html$2 = merge([
			aria,
			html$3,
			xlink,
			xmlns,
			xml
		], "html");
		const svg = merge([
			aria,
			svg$1,
			xlink,
			xmlns,
			xml
		], "svg");
		//#endregion
		//#region node_modules/space-separated-tokens/index.js
		/**
		* Serialize an array of strings as space separated-tokens.
		*
		* @param {Array<string|number>} values
		*   List of tokens.
		* @returns {string}
		*   Space-separated tokens.
		*/
		function stringify(values) {
			return values.join(" ").trim();
		}
		//#endregion
		//#region node_modules/inline-style-parser/esm/index.mjs
		/**
		* @param {String} style
		* @param {Object} [options]
		* @return {Object[]}
		* @throws {TypeError}
		* @throws {Error}
		*/
		function index$1(style, options) {
			if (typeof style !== "string") throw new TypeError("First argument must be a string");
			if (!style) return [];
			options = options || {};
			/**
			* Positional.
			*/
			var lineno = 1;
			var column = 1;
			/**
			* Update lineno and column based on `str`.
			*
			* @param {String} str
			*/
			function updatePosition(str) {
				var lines = str.match(NEWLINE_REGEX);
				if (lines) lineno += lines.length;
				var i = str.lastIndexOf(NEWLINE);
				column = ~i ? str.length - i : column + str.length;
			}
			/**
			* Mark position and patch `node.position`.
			*
			* @return {Function}
			*/
			function position() {
				var start = {
					line: lineno,
					column
				};
				return function(node) {
					node.position = new Position(start);
					whitespace();
					return node;
				};
			}
			/**
			* Store position information for a node.
			*
			* @constructor
			* @property {Object} start
			* @property {Object} end
			* @property {undefined|String} source
			*/
			function Position(start) {
				this.start = start;
				this.end = {
					line: lineno,
					column
				};
				this.source = options.source;
			}
			/**
			* Non-enumerable source string.
			*/
			Position.prototype.content = style;
			/**
			* Error `msg`.
			*
			* @param {String} msg
			* @throws {Error}
			*/
			function error(msg) {
				var err = /* @__PURE__ */ new Error(options.source + ":" + lineno + ":" + column + ": " + msg);
				err.reason = msg;
				err.filename = options.source;
				err.line = lineno;
				err.column = column;
				err.source = style;
				if (options.silent);
				else throw err;
			}
			/**
			* Match `re` and return captures.
			*
			* @param {RegExp} re
			* @return {undefined|Array}
			*/
			function match(re) {
				var m = re.exec(style);
				if (!m) return;
				var str = m[0];
				updatePosition(str);
				style = style.slice(str.length);
				return m;
			}
			/**
			* Parse whitespace.
			*/
			function whitespace() {
				match(WHITESPACE_REGEX);
			}
			/**
			* Parse comments.
			*
			* @param {Object[]} [rules]
			* @return {Object[]}
			*/
			function comments(rules) {
				var c;
				rules = rules || [];
				while (c = comment()) if (c !== false) rules.push(c);
				return rules;
			}
			/**
			* Parse comment.
			*
			* @return {Object}
			* @throws {Error}
			*/
			function comment() {
				var pos = position();
				if (FORWARD_SLASH != style.charAt(0) || ASTERISK != style.charAt(1)) return;
				var i = 2;
				while (EMPTY_STRING != style.charAt(i) && (ASTERISK != style.charAt(i) || FORWARD_SLASH != style.charAt(i + 1))) ++i;
				i += 2;
				if (EMPTY_STRING === style.charAt(i - 1)) return error("End of comment missing");
				var str = style.slice(2, i - 2);
				column += 2;
				updatePosition(str);
				style = style.slice(i);
				column += 2;
				return pos({
					type: TYPE_COMMENT,
					comment: str
				});
			}
			/**
			* Parse declaration.
			*
			* @return {Object}
			* @throws {Error}
			*/
			function declaration() {
				var pos = position();
				var prop = match(PROPERTY_REGEX);
				if (!prop) return;
				comment();
				if (!match(COLON_REGEX)) return error("property missing ':'");
				var val = match(VALUE_REGEX);
				var ret = pos({
					type: TYPE_DECLARATION,
					property: trim(prop[0].replace(COMMENT_REGEX, EMPTY_STRING)),
					value: val ? trim(val[0].replace(COMMENT_REGEX, EMPTY_STRING)) : EMPTY_STRING
				});
				match(SEMICOLON_REGEX);
				return ret;
			}
			/**
			* Parse declarations.
			*
			* @return {Object[]}
			*/
			function declarations() {
				var decls = [];
				comments(decls);
				var decl;
				while (decl = declaration()) if (decl !== false) {
					decls.push(decl);
					comments(decls);
				}
				return decls;
			}
			whitespace();
			return declarations();
		}
		/**
		* Trim `str`.
		*
		* @param {String} str
		* @return {String}
		*/
		function trim(str) {
			return str ? str.replace(TRIM_REGEX, EMPTY_STRING) : EMPTY_STRING;
		}
		var COMMENT_REGEX, NEWLINE_REGEX, WHITESPACE_REGEX, PROPERTY_REGEX, COLON_REGEX, VALUE_REGEX, SEMICOLON_REGEX, TRIM_REGEX, NEWLINE, FORWARD_SLASH, ASTERISK, EMPTY_STRING, TYPE_COMMENT, TYPE_DECLARATION;
		var init_esm$1 = __esmMin((() => {
			COMMENT_REGEX = /\/\*[^*]*\*+([^/*][^*]*\*+)*\//g;
			NEWLINE_REGEX = /\n/g;
			WHITESPACE_REGEX = /^\s*/;
			PROPERTY_REGEX = /^(\*?[-#/*\\\w]+(\[[0-9a-z_-]+\])?)\s*/;
			COLON_REGEX = /^:\s*/;
			VALUE_REGEX = /^((?:'(?:\\'|.)*?'|"(?:\\"|.)*?"|\([^)]*?\)|[^};])+)/;
			SEMICOLON_REGEX = /^[;\s]*/;
			TRIM_REGEX = /^\s+|\s+$/g;
			NEWLINE = "\n";
			FORWARD_SLASH = "/";
			ASTERISK = "*";
			EMPTY_STRING = "";
			TYPE_COMMENT = "comment";
			TYPE_DECLARATION = "declaration";
		}));
		//#endregion
		//#region node_modules/style-to-object/esm/index.mjs
		var esm_exports = /* @__PURE__ */ __exportAll({ default: () => StyleToObject });
		/**
		* Parses inline style to object.
		*
		* @param style - Inline style.
		* @param iterator - Iterator.
		* @returns - Style object or null.
		*
		* @example Parsing inline style to object:
		*
		* ```js
		* import parse from 'style-to-object';
		* parse('line-height: 42;'); // { 'line-height': '42' }
		* ```
		*/
		function StyleToObject(style, iterator) {
			let styleObject = null;
			if (!style || typeof style !== "string") return styleObject;
			const declarations = index$1(style);
			const hasIterator = typeof iterator === "function";
			declarations.forEach((declaration) => {
				if (declaration.type !== "declaration") return;
				const { property, value } = declaration;
				if (hasIterator) iterator(property, value, declaration);
				else if (value) {
					styleObject = styleObject || {};
					styleObject[property] = value;
				}
			});
			return styleObject;
		}
		var init_esm = __esmMin((() => {
			init_esm$1();
		}));
		//#endregion
		//#region node_modules/style-to-js/cjs/utilities.js
		var require_utilities = /* @__PURE__ */ __commonJSMin(((exports) => {
			Object.defineProperty(exports, "__esModule", { value: true });
			exports.camelCase = void 0;
			var CUSTOM_PROPERTY_REGEX = /^--[a-zA-Z0-9_-]+$/;
			var HYPHEN_REGEX = /-([a-z])/g;
			var NO_HYPHEN_REGEX = /^[^-]+$/;
			var VENDOR_PREFIX_REGEX = /^-(webkit|moz|ms|o|khtml)-/;
			var MS_VENDOR_PREFIX_REGEX = /^-(ms)-/;
			/**
			* Checks whether to skip camelCase.
			*/
			var skipCamelCase = function(property) {
				return !property || NO_HYPHEN_REGEX.test(property) || CUSTOM_PROPERTY_REGEX.test(property);
			};
			/**
			* Replacer that capitalizes first character.
			*/
			var capitalize = function(match, character) {
				return character.toUpperCase();
			};
			/**
			* Replacer that removes beginning hyphen of vendor prefix property.
			*/
			var trimHyphen = function(match, prefix) {
				return "".concat(prefix, "-");
			};
			/**
			* CamelCases a CSS property.
			*/
			var camelCase = function(property, options) {
				if (options === void 0) options = {};
				if (skipCamelCase(property)) return property;
				property = property.toLowerCase();
				if (options.reactCompat) property = property.replace(MS_VENDOR_PREFIX_REGEX, trimHyphen);
				else property = property.replace(VENDOR_PREFIX_REGEX, trimHyphen);
				return property.replace(HYPHEN_REGEX, capitalize);
			};
			exports.camelCase = camelCase;
		}));
		//#endregion
		//#region node_modules/style-to-js/cjs/index.js
		var require_cjs = /* @__PURE__ */ __commonJSMin(((exports, module) => {
			var style_to_object_1 = (exports && exports.__importDefault || function(mod) {
				return mod && mod.__esModule ? mod : { "default": mod };
			})((init_esm(), __toCommonJS(esm_exports)));
			var utilities_1 = require_utilities();
			/**
			* Parses CSS inline style to JavaScript object (camelCased).
			*/
			function StyleToJS(style, options) {
				var output = {};
				if (!style || typeof style !== "string") return output;
				(0, style_to_object_1.default)(style, function(property, value) {
					if (property && value) output[(0, utilities_1.camelCase)(property, options)] = value;
				});
				return output;
			}
			StyleToJS.default = StyleToJS;
			module.exports = StyleToJS;
		}));
		//#endregion
		//#region node_modules/unist-util-position/lib/index.js
		/**
		* @typedef {import('unist').Node} Node
		* @typedef {import('unist').Point} Point
		* @typedef {import('unist').Position} Position
		*/
		/**
		* @typedef NodeLike
		* @property {string} type
		* @property {PositionLike | null | undefined} [position]
		*
		* @typedef PositionLike
		* @property {PointLike | null | undefined} [start]
		* @property {PointLike | null | undefined} [end]
		*
		* @typedef PointLike
		* @property {number | null | undefined} [line]
		* @property {number | null | undefined} [column]
		* @property {number | null | undefined} [offset]
		*/
		/**
		* Get the ending point of `node`.
		*
		* @param node
		*   Node.
		* @returns
		*   Point.
		*/
		const pointEnd = point$2("end");
		/**
		* Get the starting point of `node`.
		*
		* @param node
		*   Node.
		* @returns
		*   Point.
		*/
		const pointStart = point$2("start");
		/**
		* Get the positional info of `node`.
		*
		* @param {'end' | 'start'} type
		*   Side.
		* @returns
		*   Getter.
		*/
		function point$2(type) {
			return point;
			/**
			* Get the point info of `node` at a bound side.
			*
			* @param {Node | NodeLike | null | undefined} [node]
			* @returns {Point | undefined}
			*/
			function point(node) {
				const point = node && node.position && node.position[type] || {};
				if (typeof point.line === "number" && point.line > 0 && typeof point.column === "number" && point.column > 0) return {
					line: point.line,
					column: point.column,
					offset: typeof point.offset === "number" && point.offset > -1 ? point.offset : void 0
				};
			}
		}
		/**
		* Get the positional info of `node`.
		*
		* @param {Node | NodeLike | null | undefined} [node]
		*   Node.
		* @returns {Position | undefined}
		*   Position.
		*/
		function position$1(node) {
			const start = pointStart(node);
			const end = pointEnd(node);
			if (start && end) return {
				start,
				end
			};
		}
		//#endregion
		//#region node_modules/unist-util-stringify-position/lib/index.js
		/**
		* @typedef {import('unist').Node} Node
		* @typedef {import('unist').Point} Point
		* @typedef {import('unist').Position} Position
		*/
		/**
		* @typedef NodeLike
		* @property {string} type
		* @property {PositionLike | null | undefined} [position]
		*
		* @typedef PointLike
		* @property {number | null | undefined} [line]
		* @property {number | null | undefined} [column]
		* @property {number | null | undefined} [offset]
		*
		* @typedef PositionLike
		* @property {PointLike | null | undefined} [start]
		* @property {PointLike | null | undefined} [end]
		*/
		/**
		* Serialize the positional info of a point, position (start and end points),
		* or node.
		*
		* @param {Node | NodeLike | Point | PointLike | Position | PositionLike | null | undefined} [value]
		*   Node, position, or point.
		* @returns {string}
		*   Pretty printed positional info of a node (`string`).
		*
		*   In the format of a range `ls:cs-le:ce` (when given `node` or `position`)
		*   or a point `l:c` (when given `point`), where `l` stands for line, `c` for
		*   column, `s` for `start`, and `e` for end.
		*   An empty string (`''`) is returned if the given value is neither `node`,
		*   `position`, nor `point`.
		*/
		function stringifyPosition(value) {
			if (!value || typeof value !== "object") return "";
			if ("position" in value || "type" in value) return position(value.position);
			if ("start" in value || "end" in value) return position(value);
			if ("line" in value || "column" in value) return point$1(value);
			return "";
		}
		/**
		* @param {Point | PointLike | null | undefined} point
		* @returns {string}
		*/
		function point$1(point) {
			return index(point && point.line) + ":" + index(point && point.column);
		}
		/**
		* @param {Position | PositionLike | null | undefined} pos
		* @returns {string}
		*/
		function position(pos) {
			return point$1(pos && pos.start) + "-" + point$1(pos && pos.end);
		}
		/**
		* @param {number | null | undefined} value
		* @returns {number}
		*/
		function index(value) {
			return value && typeof value === "number" ? value : 1;
		}
		//#endregion
		//#region node_modules/vfile-message/lib/index.js
		/**
		* @import {Node, Point, Position} from 'unist'
		*/
		/**
		* @typedef {object & {type: string, position?: Position | undefined}} NodeLike
		*
		* @typedef Options
		*   Configuration.
		* @property {Array<Node> | null | undefined} [ancestors]
		*   Stack of (inclusive) ancestor nodes surrounding the message (optional).
		* @property {Error | null | undefined} [cause]
		*   Original error cause of the message (optional).
		* @property {Point | Position | null | undefined} [place]
		*   Place of message (optional).
		* @property {string | null | undefined} [ruleId]
		*   Category of message (optional, example: `'my-rule'`).
		* @property {string | null | undefined} [source]
		*   Namespace of who sent the message (optional, example: `'my-package'`).
		*/
		/**
		* Message.
		*/
		var VFileMessage = class extends Error {
			/**
			* Create a message for `reason`.
			*
			* > 🪦 **Note**: also has obsolete signatures.
			*
			* @overload
			* @param {string} reason
			* @param {Options | null | undefined} [options]
			* @returns
			*
			* @overload
			* @param {string} reason
			* @param {Node | NodeLike | null | undefined} parent
			* @param {string | null | undefined} [origin]
			* @returns
			*
			* @overload
			* @param {string} reason
			* @param {Point | Position | null | undefined} place
			* @param {string | null | undefined} [origin]
			* @returns
			*
			* @overload
			* @param {string} reason
			* @param {string | null | undefined} [origin]
			* @returns
			*
			* @overload
			* @param {Error | VFileMessage} cause
			* @param {Node | NodeLike | null | undefined} parent
			* @param {string | null | undefined} [origin]
			* @returns
			*
			* @overload
			* @param {Error | VFileMessage} cause
			* @param {Point | Position | null | undefined} place
			* @param {string | null | undefined} [origin]
			* @returns
			*
			* @overload
			* @param {Error | VFileMessage} cause
			* @param {string | null | undefined} [origin]
			* @returns
			*
			* @param {Error | VFileMessage | string} causeOrReason
			*   Reason for message, should use markdown.
			* @param {Node | NodeLike | Options | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
			*   Configuration (optional).
			* @param {string | null | undefined} [origin]
			*   Place in code where the message originates (example:
			*   `'my-package:my-rule'` or `'my-rule'`).
			* @returns
			*   Instance of `VFileMessage`.
			*/
			constructor(causeOrReason, optionsOrParentOrPlace, origin) {
				super();
				if (typeof optionsOrParentOrPlace === "string") {
					origin = optionsOrParentOrPlace;
					optionsOrParentOrPlace = void 0;
				}
				/** @type {string} */
				let reason = "";
				/** @type {Options} */
				let options = {};
				let legacyCause = false;
				if (optionsOrParentOrPlace) if ("line" in optionsOrParentOrPlace && "column" in optionsOrParentOrPlace) options = { place: optionsOrParentOrPlace };
				else if ("start" in optionsOrParentOrPlace && "end" in optionsOrParentOrPlace) options = { place: optionsOrParentOrPlace };
				else if ("type" in optionsOrParentOrPlace) options = {
					ancestors: [optionsOrParentOrPlace],
					place: optionsOrParentOrPlace.position
				};
				else options = { ...optionsOrParentOrPlace };
				if (typeof causeOrReason === "string") reason = causeOrReason;
				else if (!options.cause && causeOrReason) {
					legacyCause = true;
					reason = causeOrReason.message;
					options.cause = causeOrReason;
				}
				if (!options.ruleId && !options.source && typeof origin === "string") {
					const index = origin.indexOf(":");
					if (index === -1) options.ruleId = origin;
					else {
						options.source = origin.slice(0, index);
						options.ruleId = origin.slice(index + 1);
					}
				}
				if (!options.place && options.ancestors && options.ancestors) {
					const parent = options.ancestors[options.ancestors.length - 1];
					if (parent) options.place = parent.position;
				}
				const start = options.place && "start" in options.place ? options.place.start : options.place;
				/**
				* Stack of ancestor nodes surrounding the message.
				*
				* @type {Array<Node> | undefined}
				*/
				this.ancestors = options.ancestors || void 0;
				/**
				* Original error cause of the message.
				*
				* @type {Error | undefined}
				*/
				this.cause = options.cause || void 0;
				/**
				* Starting column of message.
				*
				* @type {number | undefined}
				*/
				this.column = start ? start.column : void 0;
				/**
				* State of problem.
				*
				* * `true` — error, file not usable
				* * `false` — warning, change may be needed
				* * `undefined` — change likely not needed
				*
				* @type {boolean | null | undefined}
				*/
				this.fatal = void 0;
				/**
				* Path of a file (used throughout the `VFile` ecosystem).
				*
				* @type {string | undefined}
				*/
				this.file = "";
				/**
				* Reason for message.
				*
				* @type {string}
				*/
				this.message = reason;
				/**
				* Starting line of error.
				*
				* @type {number | undefined}
				*/
				this.line = start ? start.line : void 0;
				/**
				* Serialized positional info of message.
				*
				* On normal errors, this would be something like `ParseError`, buit in
				* `VFile` messages we use this space to show where an error happened.
				*/
				this.name = stringifyPosition(options.place) || "1:1";
				/**
				* Place of message.
				*
				* @type {Point | Position | undefined}
				*/
				this.place = options.place || void 0;
				/**
				* Reason for message, should use markdown.
				*
				* @type {string}
				*/
				this.reason = this.message;
				/**
				* Category of message (example: `'my-rule'`).
				*
				* @type {string | undefined}
				*/
				this.ruleId = options.ruleId || void 0;
				/**
				* Namespace of message (example: `'my-package'`).
				*
				* @type {string | undefined}
				*/
				this.source = options.source || void 0;
				/**
				* Stack of message.
				*
				* This is used by normal errors to show where something happened in
				* programming code, irrelevant for `VFile` messages,
				*
				* @type {string}
				*/
				this.stack = legacyCause && options.cause && typeof options.cause.stack === "string" ? options.cause.stack : "";
				/**
				* Specify the source value that’s being reported, which is deemed
				* incorrect.
				*
				* @type {string | undefined}
				*/
				this.actual = void 0;
				/**
				* Suggest acceptable values that can be used instead of `actual`.
				*
				* @type {Array<string> | undefined}
				*/
				this.expected = void 0;
				/**
				* Long form description of the message (you should use markdown).
				*
				* @type {string | undefined}
				*/
				this.note = void 0;
				/**
				* Link to docs for the message.
				*
				* > 👉 **Note**: this must be an absolute URL that can be passed as `x`
				* > to `new URL(x)`.
				*
				* @type {string | undefined}
				*/
				this.url = void 0;
			}
		};
		VFileMessage.prototype.file = "";
		VFileMessage.prototype.name = "";
		VFileMessage.prototype.reason = "";
		VFileMessage.prototype.message = "";
		VFileMessage.prototype.stack = "";
		VFileMessage.prototype.column = void 0;
		VFileMessage.prototype.line = void 0;
		VFileMessage.prototype.ancestors = void 0;
		VFileMessage.prototype.cause = void 0;
		VFileMessage.prototype.fatal = void 0;
		VFileMessage.prototype.place = void 0;
		VFileMessage.prototype.ruleId = void 0;
		VFileMessage.prototype.source = void 0;
		//#endregion
		//#region node_modules/hast-util-to-jsx-runtime/lib/index.js
		/**
		* @import {Identifier, Literal, MemberExpression} from 'estree'
		* @import {Jsx, JsxDev, Options, Props} from 'hast-util-to-jsx-runtime'
		* @import {Element, Nodes, Parents, Root, Text} from 'hast'
		* @import {MdxFlowExpressionHast, MdxTextExpressionHast} from 'mdast-util-mdx-expression'
		* @import {MdxJsxFlowElementHast, MdxJsxTextElementHast} from 'mdast-util-mdx-jsx'
		* @import {MdxjsEsmHast} from 'mdast-util-mdxjs-esm'
		* @import {Position} from 'unist'
		* @import {Child, Create, Field, JsxElement, State, Style} from './types.js'
		*/
		var import_cjs = /* @__PURE__ */ __toESM(require_cjs(), 1);
		const own$3 = {}.hasOwnProperty;
		/** @type {Map<string, number>} */
		const emptyMap = /* @__PURE__ */ new Map();
		const cap = /[A-Z]/g;
		const tableElements = /* @__PURE__ */ new Set([
			"table",
			"tbody",
			"thead",
			"tfoot",
			"tr"
		]);
		const tableCellElement = /* @__PURE__ */ new Set(["td", "th"]);
		/**
		* Transform a hast tree to preact, react, solid, svelte, vue, etc.,
		* with an automatic JSX runtime.
		*
		* @param {Nodes} tree
		*   Tree to transform.
		* @param {Options} options
		*   Configuration (required).
		* @returns {JsxElement}
		*   JSX element.
		*/
		function toJsxRuntime(tree, options) {
			if (!options || options.Fragment === void 0) throw new TypeError("Expected `Fragment` in options");
			const filePath = options.filePath || void 0;
			/** @type {Create} */
			let create;
			if (options.development) {
				if (typeof options.jsxDEV !== "function") throw new TypeError("Expected `jsxDEV` in options when `development: true`");
				create = developmentCreate(filePath, options.jsxDEV);
			} else {
				if (typeof options.jsx !== "function") throw new TypeError("Expected `jsx` in production options");
				if (typeof options.jsxs !== "function") throw new TypeError("Expected `jsxs` in production options");
				create = productionCreate(filePath, options.jsx, options.jsxs);
			}
			/** @type {State} */
			const state = {
				Fragment: options.Fragment,
				ancestors: [],
				components: options.components || {},
				create,
				elementAttributeNameCase: options.elementAttributeNameCase || "react",
				evaluater: options.createEvaluater ? options.createEvaluater() : void 0,
				filePath,
				ignoreInvalidStyle: options.ignoreInvalidStyle || false,
				passKeys: options.passKeys !== false,
				passNode: options.passNode || false,
				schema: options.space === "svg" ? svg : html$2,
				stylePropertyNameCase: options.stylePropertyNameCase || "dom",
				tableCellAlignToStyle: options.tableCellAlignToStyle !== false
			};
			const result = one$1(state, tree, void 0);
			if (result && typeof result !== "string") return result;
			return state.create(tree, state.Fragment, { children: result || void 0 }, void 0);
		}
		/**
		* Transform a node.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Nodes} node
		*   Current node.
		* @param {string | undefined} key
		*   Key.
		* @returns {Child | undefined}
		*   Child, optional.
		*/
		function one$1(state, node, key) {
			if (node.type === "element") return element$1(state, node, key);
			if (node.type === "mdxFlowExpression" || node.type === "mdxTextExpression") return mdxExpression(state, node);
			if (node.type === "mdxJsxFlowElement" || node.type === "mdxJsxTextElement") return mdxJsxElement(state, node, key);
			if (node.type === "mdxjsEsm") return mdxEsm(state, node);
			if (node.type === "root") return root$2(state, node, key);
			if (node.type === "text") return text$5(state, node);
		}
		/**
		* Handle element.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Element} node
		*   Current node.
		* @param {string | undefined} key
		*   Key.
		* @returns {Child | undefined}
		*   Child, optional.
		*/
		function element$1(state, node, key) {
			const parentSchema = state.schema;
			let schema = parentSchema;
			if (node.tagName.toLowerCase() === "svg" && parentSchema.space === "html") {
				schema = svg;
				state.schema = schema;
			}
			state.ancestors.push(node);
			const type = findComponentFromName(state, node.tagName, false);
			const props = createElementProps(state, node);
			let children = createChildren(state, node);
			if (tableElements.has(node.tagName)) children = children.filter(function(child) {
				return typeof child === "string" ? !whitespace(child) : true;
			});
			addNode(state, props, type, node);
			addChildren(props, children);
			state.ancestors.pop();
			state.schema = parentSchema;
			return state.create(node, type, props, key);
		}
		/**
		* Handle MDX expression.
		*
		* @param {State} state
		*   Info passed around.
		* @param {MdxFlowExpressionHast | MdxTextExpressionHast} node
		*   Current node.
		* @returns {Child | undefined}
		*   Child, optional.
		*/
		function mdxExpression(state, node) {
			if (node.data && node.data.estree && state.evaluater) {
				const expression = node.data.estree.body[0];
				expression.type;
				return state.evaluater.evaluateExpression(expression.expression);
			}
			crashEstree(state, node.position);
		}
		/**
		* Handle MDX ESM.
		*
		* @param {State} state
		*   Info passed around.
		* @param {MdxjsEsmHast} node
		*   Current node.
		* @returns {Child | undefined}
		*   Child, optional.
		*/
		function mdxEsm(state, node) {
			if (node.data && node.data.estree && state.evaluater) return state.evaluater.evaluateProgram(node.data.estree);
			crashEstree(state, node.position);
		}
		/**
		* Handle MDX JSX.
		*
		* @param {State} state
		*   Info passed around.
		* @param {MdxJsxFlowElementHast | MdxJsxTextElementHast} node
		*   Current node.
		* @param {string | undefined} key
		*   Key.
		* @returns {Child | undefined}
		*   Child, optional.
		*/
		function mdxJsxElement(state, node, key) {
			const parentSchema = state.schema;
			let schema = parentSchema;
			if (node.name === "svg" && parentSchema.space === "html") {
				schema = svg;
				state.schema = schema;
			}
			state.ancestors.push(node);
			const type = node.name === null ? state.Fragment : findComponentFromName(state, node.name, true);
			const props = createJsxElementProps(state, node);
			const children = createChildren(state, node);
			addNode(state, props, type, node);
			addChildren(props, children);
			state.ancestors.pop();
			state.schema = parentSchema;
			return state.create(node, type, props, key);
		}
		/**
		* Handle root.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Root} node
		*   Current node.
		* @param {string | undefined} key
		*   Key.
		* @returns {Child | undefined}
		*   Child, optional.
		*/
		function root$2(state, node, key) {
			/** @type {Props} */
			const props = {};
			addChildren(props, createChildren(state, node));
			return state.create(node, state.Fragment, props, key);
		}
		/**
		* Handle text.
		*
		* @param {State} _
		*   Info passed around.
		* @param {Text} node
		*   Current node.
		* @returns {Child | undefined}
		*   Child, optional.
		*/
		function text$5(_, node) {
			return node.value;
		}
		/**
		* Add `node` to props.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Props} props
		*   Props.
		* @param {unknown} type
		*   Type.
		* @param {Element | MdxJsxFlowElementHast | MdxJsxTextElementHast} node
		*   Node.
		* @returns {undefined}
		*   Nothing.
		*/
		function addNode(state, props, type, node) {
			if (typeof type !== "string" && type !== state.Fragment && state.passNode) props.node = node;
		}
		/**
		* Add children to props.
		*
		* @param {Props} props
		*   Props.
		* @param {Array<Child>} children
		*   Children.
		* @returns {undefined}
		*   Nothing.
		*/
		function addChildren(props, children) {
			if (children.length > 0) {
				const value = children.length > 1 ? children : children[0];
				if (value) props.children = value;
			}
		}
		/**
		* @param {string | undefined} _
		*   Path to file.
		* @param {Jsx} jsx
		*   Dynamic.
		* @param {Jsx} jsxs
		*   Static.
		* @returns {Create}
		*   Create a production element.
		*/
		function productionCreate(_, jsx, jsxs) {
			return create;
			/** @type {Create} */
			function create(_, type, props, key) {
				const fn = Array.isArray(props.children) ? jsxs : jsx;
				return key ? fn(type, props, key) : fn(type, props);
			}
		}
		/**
		* @param {string | undefined} filePath
		*   Path to file.
		* @param {JsxDev} jsxDEV
		*   Development.
		* @returns {Create}
		*   Create a development element.
		*/
		function developmentCreate(filePath, jsxDEV) {
			return create;
			/** @type {Create} */
			function create(node, type, props, key) {
				const isStaticChildren = Array.isArray(props.children);
				const point = pointStart(node);
				return jsxDEV(type, props, key, isStaticChildren, {
					columnNumber: point ? point.column - 1 : void 0,
					fileName: filePath,
					lineNumber: point ? point.line : void 0
				}, void 0);
			}
		}
		/**
		* Create props from an element.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Element} node
		*   Current element.
		* @returns {Props}
		*   Props.
		*/
		function createElementProps(state, node) {
			/** @type {Props} */
			const props = {};
			/** @type {string | undefined} */
			let alignValue;
			/** @type {string} */
			let prop;
			for (prop in node.properties) if (prop !== "children" && own$3.call(node.properties, prop)) {
				const result = createProperty(state, prop, node.properties[prop]);
				if (result) {
					const [key, value] = result;
					if (state.tableCellAlignToStyle && key === "align" && typeof value === "string" && tableCellElement.has(node.tagName)) alignValue = value;
					else props[key] = value;
				}
			}
			if (alignValue) {
				const style = props.style || (props.style = {});
				style[state.stylePropertyNameCase === "css" ? "text-align" : "textAlign"] = alignValue;
			}
			return props;
		}
		/**
		* Create props from a JSX element.
		*
		* @param {State} state
		*   Info passed around.
		* @param {MdxJsxFlowElementHast | MdxJsxTextElementHast} node
		*   Current JSX element.
		* @returns {Props}
		*   Props.
		*/
		function createJsxElementProps(state, node) {
			/** @type {Props} */
			const props = {};
			for (const attribute of node.attributes) if (attribute.type === "mdxJsxExpressionAttribute") if (attribute.data && attribute.data.estree && state.evaluater) {
				const expression = attribute.data.estree.body[0];
				expression.type;
				const objectExpression = expression.expression;
				objectExpression.type;
				const property = objectExpression.properties[0];
				property.type;
				Object.assign(props, state.evaluater.evaluateExpression(property.argument));
			} else crashEstree(state, node.position);
			else {
				const name = attribute.name;
				/** @type {unknown} */
				let value;
				if (attribute.value && typeof attribute.value === "object") if (attribute.value.data && attribute.value.data.estree && state.evaluater) {
					const expression = attribute.value.data.estree.body[0];
					expression.type;
					value = state.evaluater.evaluateExpression(expression.expression);
				} else crashEstree(state, node.position);
				else value = attribute.value === null ? true : attribute.value;
				props[name] = value;
			}
			return props;
		}
		/**
		* Create children.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Parents} node
		*   Current element.
		* @returns {Array<Child>}
		*   Children.
		*/
		function createChildren(state, node) {
			/** @type {Array<Child>} */
			const children = [];
			let index = -1;
			/** @type {Map<string, number>} */
			/* c8 ignore next */
			const countsByName = state.passKeys ? /* @__PURE__ */ new Map() : emptyMap;
			while (++index < node.children.length) {
				const child = node.children[index];
				/** @type {string | undefined} */
				let key;
				if (state.passKeys) {
					const name = child.type === "element" ? child.tagName : child.type === "mdxJsxFlowElement" || child.type === "mdxJsxTextElement" ? child.name : void 0;
					if (name) {
						const count = countsByName.get(name) || 0;
						key = name + "-" + count;
						countsByName.set(name, count + 1);
					}
				}
				const result = one$1(state, child, key);
				if (result !== void 0) children.push(result);
			}
			return children;
		}
		/**
		* Handle a property.
		*
		* @param {State} state
		*   Info passed around.
		* @param {string} prop
		*   Key.
		* @param {Array<number | string> | boolean | number | string | null | undefined} value
		*   hast property value.
		* @returns {Field | undefined}
		*   Field for runtime, optional.
		*/
		function createProperty(state, prop, value) {
			const info = find(state.schema, prop);
			if (value === null || value === void 0 || typeof value === "number" && Number.isNaN(value)) return;
			if (Array.isArray(value)) value = info.commaSeparated ? stringify$1(value) : stringify(value);
			if (info.property === "style") {
				let styleObject = typeof value === "object" ? value : parseStyle(state, String(value));
				if (state.stylePropertyNameCase === "css") styleObject = transformStylesToCssCasing(styleObject);
				return ["style", styleObject];
			}
			return [state.elementAttributeNameCase === "react" && info.space ? hastToReact[info.property] || info.property : info.attribute, value];
		}
		/**
		* Parse a CSS declaration to an object.
		*
		* @param {State} state
		*   Info passed around.
		* @param {string} value
		*   CSS declarations.
		* @returns {Style}
		*   Properties.
		* @throws
		*   Throws `VFileMessage` when CSS cannot be parsed.
		*/
		function parseStyle(state, value) {
			try {
				return (0, import_cjs.default)(value, { reactCompat: true });
			} catch (error) {
				if (state.ignoreInvalidStyle) return {};
				const cause = error;
				const message = new VFileMessage("Cannot parse `style` attribute", {
					ancestors: state.ancestors,
					cause,
					ruleId: "style",
					source: "hast-util-to-jsx-runtime"
				});
				message.file = state.filePath || void 0;
				message.url = "https://github.com/syntax-tree/hast-util-to-jsx-runtime#cannot-parse-style-attribute";
				throw message;
			}
		}
		/**
		* Create a JSX name from a string.
		*
		* @param {State} state
		*   To do.
		* @param {string} name
		*   Name.
		* @param {boolean} allowExpression
		*   Allow member expressions and identifiers.
		* @returns {unknown}
		*   To do.
		*/
		function findComponentFromName(state, name, allowExpression) {
			/** @type {Identifier | Literal | MemberExpression} */
			let result;
			if (!allowExpression) result = {
				type: "Literal",
				value: name
			};
			else if (name.includes(".")) {
				const identifiers = name.split(".");
				let index = -1;
				/** @type {Identifier | Literal | MemberExpression | undefined} */
				let node;
				while (++index < identifiers.length) {
					/** @type {Identifier | Literal} */
					const prop = name$1(identifiers[index]) ? {
						type: "Identifier",
						name: identifiers[index]
					} : {
						type: "Literal",
						value: identifiers[index]
					};
					node = node ? {
						type: "MemberExpression",
						object: node,
						property: prop,
						computed: Boolean(index && prop.type === "Literal"),
						optional: false
					} : prop;
				}
				result = node;
			} else result = name$1(name) && !/^[a-z]/.test(name) ? {
				type: "Identifier",
				name
			} : {
				type: "Literal",
				value: name
			};
			if (result.type === "Literal") {
				const name = result.value;
				return own$3.call(state.components, name) ? state.components[name] : name;
			}
			if (state.evaluater) return state.evaluater.evaluateExpression(result);
			crashEstree(state);
		}
		/**
		* @param {State} state
		* @param {Position | undefined} [place]
		* @returns {never}
		*/
		function crashEstree(state, place) {
			const message = new VFileMessage("Cannot handle MDX estrees without `createEvaluater`", {
				ancestors: state.ancestors,
				place,
				ruleId: "mdx-estree",
				source: "hast-util-to-jsx-runtime"
			});
			message.file = state.filePath || void 0;
			message.url = "https://github.com/syntax-tree/hast-util-to-jsx-runtime#cannot-handle-mdx-estrees-without-createevaluater";
			throw message;
		}
		/**
		* Transform a DOM casing style object to a CSS casing style object.
		*
		* @param {Style} domCasing
		* @returns {Style}
		*/
		function transformStylesToCssCasing(domCasing) {
			/** @type {Style} */
			const cssCasing = {};
			/** @type {string} */
			let from;
			for (from in domCasing) if (own$3.call(domCasing, from)) cssCasing[transformStyleToCssCasing(from)] = domCasing[from];
			return cssCasing;
		}
		/**
		* Transform a DOM casing style field to a CSS casing style field.
		*
		* @param {string} from
		* @returns {string}
		*/
		function transformStyleToCssCasing(from) {
			let to = from.replace(cap, toDash);
			if (to.slice(0, 3) === "ms-") to = "-" + to;
			return to;
		}
		/**
		* Make `$0` dash cased.
		*
		* @param {string} $0
		*   Capitalized ASCII leter.
		* @returns {string}
		*   Dash and lower letter.
		*/
		function toDash($0) {
			return "-" + $0.toLowerCase();
		}
		//#endregion
		//#region node_modules/html-url-attributes/lib/index.js
		/**
		* HTML URL properties.
		*
		* Each key is a property name and each value is a list of tag names it applies
		* to or `null` if it applies to all elements.
		*
		* @type {Record<string, Array<string> | null>}
		*/
		const urlAttributes = {
			action: ["form"],
			cite: [
				"blockquote",
				"del",
				"ins",
				"q"
			],
			data: ["object"],
			formAction: ["button", "input"],
			href: [
				"a",
				"area",
				"base",
				"link"
			],
			icon: ["menuitem"],
			itemId: null,
			manifest: ["html"],
			ping: ["a", "area"],
			poster: ["video"],
			src: [
				"audio",
				"embed",
				"iframe",
				"img",
				"input",
				"script",
				"source",
				"track",
				"video"
			]
		};
		//#endregion
		//#region node_modules/mdast-util-to-string/lib/index.js
		/**
		* @typedef {import('mdast').Nodes} Nodes
		*
		* @typedef Options
		*   Configuration (optional).
		* @property {boolean | null | undefined} [includeImageAlt=true]
		*   Whether to use `alt` for `image`s (default: `true`).
		* @property {boolean | null | undefined} [includeHtml=true]
		*   Whether to use `value` of HTML (default: `true`).
		*/
		/** @type {Options} */
		const emptyOptions$2 = {};
		/**
		* Get the text content of a node or list of nodes.
		*
		* Prefers the node’s plain-text fields, otherwise serializes its children,
		* and if the given value is an array, serialize the nodes in it.
		*
		* @param {unknown} [value]
		*   Thing to serialize, typically `Node`.
		* @param {Options | null | undefined} [options]
		*   Configuration (optional).
		* @returns {string}
		*   Serialized `value`.
		*/
		function toString$1(value, options) {
			const settings = options || emptyOptions$2;
			return one(value, typeof settings.includeImageAlt === "boolean" ? settings.includeImageAlt : true, typeof settings.includeHtml === "boolean" ? settings.includeHtml : true);
		}
		/**
		* One node or several nodes.
		*
		* @param {unknown} value
		*   Thing to serialize.
		* @param {boolean} includeImageAlt
		*   Include image `alt`s.
		* @param {boolean} includeHtml
		*   Include HTML.
		* @returns {string}
		*   Serialized node.
		*/
		function one(value, includeImageAlt, includeHtml) {
			if (node(value)) {
				if ("value" in value) return value.type === "html" && !includeHtml ? "" : value.value;
				if (includeImageAlt && "alt" in value && value.alt) return value.alt;
				if ("children" in value) return all(value.children, includeImageAlt, includeHtml);
			}
			if (Array.isArray(value)) return all(value, includeImageAlt, includeHtml);
			return "";
		}
		/**
		* Serialize a list of nodes.
		*
		* @param {Array<unknown>} values
		*   Thing to serialize.
		* @param {boolean} includeImageAlt
		*   Include image `alt`s.
		* @param {boolean} includeHtml
		*   Include HTML.
		* @returns {string}
		*   Serialized nodes.
		*/
		function all(values, includeImageAlt, includeHtml) {
			/** @type {Array<string>} */
			const result = [];
			let index = -1;
			while (++index < values.length) result[index] = one(values[index], includeImageAlt, includeHtml);
			return result.join("");
		}
		/**
		* Check if `value` looks like a node.
		*
		* @param {unknown} value
		*   Thing.
		* @returns {value is Nodes}
		*   Whether `value` is a node.
		*/
		function node(value) {
			return Boolean(value && typeof value === "object");
		}
		//#endregion
		//#region node_modules/decode-named-character-reference/index.dom.js
		const element = document.createElement("i");
		/**
		* @param {string} value
		* @returns {string | false}
		*/
		function decodeNamedCharacterReference(value) {
			const characterReference = "&" + value + ";";
			element.innerHTML = characterReference;
			const character = element.textContent;
			if (character.charCodeAt(character.length - 1) === 59 && value !== "semi") return false;
			return character === characterReference ? false : character;
		}
		//#endregion
		//#region node_modules/micromark-util-chunked/index.js
		/**
		* Like `Array#splice`, but smarter for giant arrays.
		*
		* `Array#splice` takes all items to be inserted as individual argument which
		* causes a stack overflow in V8 when trying to insert 100k items for instance.
		*
		* Otherwise, this does not return the removed items, and takes `items` as an
		* array instead of rest parameters.
		*
		* @template {unknown} T
		*   Item type.
		* @param {Array<T>} list
		*   List to operate on.
		* @param {number} start
		*   Index to remove/insert at (can be negative).
		* @param {number} remove
		*   Number of items to remove.
		* @param {Array<T>} items
		*   Items to inject into `list`.
		* @returns {undefined}
		*   Nothing.
		*/
		function splice(list, start, remove, items) {
			const end = list.length;
			let chunkStart = 0;
			/** @type {Array<unknown>} */
			let parameters;
			if (start < 0) start = -start > end ? 0 : end + start;
			else start = start > end ? end : start;
			remove = remove > 0 ? remove : 0;
			if (items.length < 1e4) {
				parameters = Array.from(items);
				parameters.unshift(start, remove);
				list.splice(...parameters);
			} else {
				if (remove) list.splice(start, remove);
				while (chunkStart < items.length) {
					parameters = items.slice(chunkStart, chunkStart + 1e4);
					parameters.unshift(start, 0);
					list.splice(...parameters);
					chunkStart += 1e4;
					start += 1e4;
				}
			}
		}
		/**
		* Append `items` (an array) at the end of `list` (another array).
		* When `list` was empty, returns `items` instead.
		*
		* This prevents a potentially expensive operation when `list` is empty,
		* and adds items in batches to prevent V8 from hanging.
		*
		* @template {unknown} T
		*   Item type.
		* @param {Array<T>} list
		*   List to operate on.
		* @param {Array<T>} items
		*   Items to add to `list`.
		* @returns {Array<T>}
		*   Either `list` or `items`.
		*/
		function push(list, items) {
			if (list.length > 0) {
				splice(list, list.length, 0, items);
				return list;
			}
			return items;
		}
		//#endregion
		//#region node_modules/micromark-util-combine-extensions/index.js
		/**
		* @import {
		*   Extension,
		*   Handles,
		*   HtmlExtension,
		*   NormalizedExtension
		* } from 'micromark-util-types'
		*/
		const hasOwnProperty = {}.hasOwnProperty;
		/**
		* Combine multiple syntax extensions into one.
		*
		* @param {ReadonlyArray<Extension>} extensions
		*   List of syntax extensions.
		* @returns {NormalizedExtension}
		*   A single combined extension.
		*/
		function combineExtensions(extensions) {
			/** @type {NormalizedExtension} */
			const all = {};
			let index = -1;
			while (++index < extensions.length) syntaxExtension(all, extensions[index]);
			return all;
		}
		/**
		* Merge `extension` into `all`.
		*
		* @param {NormalizedExtension} all
		*   Extension to merge into.
		* @param {Extension} extension
		*   Extension to merge.
		* @returns {undefined}
		*   Nothing.
		*/
		function syntaxExtension(all, extension) {
			/** @type {keyof Extension} */
			let hook;
			for (hook in extension) {
				/** @type {Record<string, unknown>} */
				const left = (hasOwnProperty.call(all, hook) ? all[hook] : void 0) || (all[hook] = {});
				/** @type {Record<string, unknown> | undefined} */
				const right = extension[hook];
				/** @type {string} */
				let code;
				if (right) for (code in right) {
					if (!hasOwnProperty.call(left, code)) left[code] = [];
					const value = right[code];
					constructs(left[code], Array.isArray(value) ? value : value ? [value] : []);
				}
			}
		}
		/**
		* Merge `list` into `existing` (both lists of constructs).
		* Mutates `existing`.
		*
		* @param {Array<unknown>} existing
		*   List of constructs to merge into.
		* @param {Array<unknown>} list
		*   List of constructs to merge.
		* @returns {undefined}
		*   Nothing.
		*/
		function constructs(existing, list) {
			let index = -1;
			/** @type {Array<unknown>} */
			const before = [];
			while (++index < list.length) (list[index].add === "after" ? existing : before).push(list[index]);
			splice(existing, 0, 0, before);
		}
		//#endregion
		//#region node_modules/micromark-util-decode-numeric-character-reference/index.js
		/**
		* Turn the number (in string form as either hexa- or plain decimal) coming from
		* a numeric character reference into a character.
		*
		* Sort of like `String.fromCodePoint(Number.parseInt(value, base))`, but makes
		* non-characters and control characters safe.
		*
		* @param {string} value
		*   Value to decode.
		* @param {number} base
		*   Numeric base.
		* @returns {string}
		*   Character.
		*/
		function decodeNumericCharacterReference(value, base) {
			const code = Number.parseInt(value, base);
			if (code < 9 || code === 11 || code > 13 && code < 32 || code > 126 && code < 160 || code > 55295 && code < 57344 || code > 64975 && code < 65008 || (code & 65535) === 65535 || (code & 65535) === 65534 || code > 1114111) return "�";
			return String.fromCodePoint(code);
		}
		//#endregion
		//#region node_modules/micromark-util-normalize-identifier/index.js
		/**
		* Normalize an identifier (as found in references, definitions).
		*
		* Collapses markdown whitespace, trim, and then lower- and uppercase.
		*
		* Some characters are considered “uppercase”, such as U+03F4 (`ϴ`), but if their
		* lowercase counterpart (U+03B8 (`θ`)) is uppercased will result in a different
		* uppercase character (U+0398 (`Θ`)).
		* So, to get a canonical form, we perform both lower- and uppercase.
		*
		* Using uppercase last makes sure keys will never interact with default
		* prototypal values (such as `constructor`): nothing in the prototype of
		* `Object` is uppercase.
		*
		* @param {string} value
		*   Identifier to normalize.
		* @returns {string}
		*   Normalized identifier.
		*/
		function normalizeIdentifier(value) {
			return value.replace(/[\t\n\r ]+/g, " ").replace(/^ | $/g, "").toLowerCase().toUpperCase();
		}
		//#endregion
		//#region node_modules/micromark-util-character/index.js
		/**
		* @import {Code} from 'micromark-util-types'
		*/
		/**
		* Check whether the character code represents an ASCII alpha (`a` through `z`,
		* case insensitive).
		*
		* An **ASCII alpha** is an ASCII upper alpha or ASCII lower alpha.
		*
		* An **ASCII upper alpha** is a character in the inclusive range U+0041 (`A`)
		* to U+005A (`Z`).
		*
		* An **ASCII lower alpha** is a character in the inclusive range U+0061 (`a`)
		* to U+007A (`z`).
		*
		* @param code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		const asciiAlpha = regexCheck(/[A-Za-z]/);
		/**
		* Check whether the character code represents an ASCII alphanumeric (`a`
		* through `z`, case insensitive, or `0` through `9`).
		*
		* An **ASCII alphanumeric** is an ASCII digit (see `asciiDigit`) or ASCII alpha
		* (see `asciiAlpha`).
		*
		* @param code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		const asciiAlphanumeric = regexCheck(/[\dA-Za-z]/);
		/**
		* Check whether the character code represents an ASCII atext.
		*
		* atext is an ASCII alphanumeric (see `asciiAlphanumeric`), or a character in
		* the inclusive ranges U+0023 NUMBER SIGN (`#`) to U+0027 APOSTROPHE (`'`),
		* U+002A ASTERISK (`*`), U+002B PLUS SIGN (`+`), U+002D DASH (`-`), U+002F
		* SLASH (`/`), U+003D EQUALS TO (`=`), U+003F QUESTION MARK (`?`), U+005E
		* CARET (`^`) to U+0060 GRAVE ACCENT (`` ` ``), or U+007B LEFT CURLY BRACE
		* (`{`) to U+007E TILDE (`~`).
		*
		* See:
		* **\[RFC5322]**:
		* [Internet Message Format](https://tools.ietf.org/html/rfc5322).
		* P. Resnick.
		* IETF.
		*
		* @param code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		const asciiAtext = regexCheck(/[#-'*+\--9=?A-Z^-~]/);
		/**
		* Check whether a character code is an ASCII control character.
		*
		* An **ASCII control** is a character in the inclusive range U+0000 NULL (NUL)
		* to U+001F (US), or U+007F (DEL).
		*
		* @param {Code} code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		function asciiControl(code) {
			return code !== null && (code < 32 || code === 127);
		}
		/**
		* Check whether the character code represents an ASCII digit (`0` through `9`).
		*
		* An **ASCII digit** is a character in the inclusive range U+0030 (`0`) to
		* U+0039 (`9`).
		*
		* @param code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		const asciiDigit = regexCheck(/\d/);
		/**
		* Check whether the character code represents an ASCII hex digit (`a` through
		* `f`, case insensitive, or `0` through `9`).
		*
		* An **ASCII hex digit** is an ASCII digit (see `asciiDigit`), ASCII upper hex
		* digit, or an ASCII lower hex digit.
		*
		* An **ASCII upper hex digit** is a character in the inclusive range U+0041
		* (`A`) to U+0046 (`F`).
		*
		* An **ASCII lower hex digit** is a character in the inclusive range U+0061
		* (`a`) to U+0066 (`f`).
		*
		* @param code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		const asciiHexDigit = regexCheck(/[\dA-Fa-f]/);
		/**
		* Check whether the character code represents ASCII punctuation.
		*
		* An **ASCII punctuation** is a character in the inclusive ranges U+0021
		* EXCLAMATION MARK (`!`) to U+002F SLASH (`/`), U+003A COLON (`:`) to U+0040 AT
		* SIGN (`@`), U+005B LEFT SQUARE BRACKET (`[`) to U+0060 GRAVE ACCENT
		* (`` ` ``), or U+007B LEFT CURLY BRACE (`{`) to U+007E TILDE (`~`).
		*
		* @param code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		const asciiPunctuation = regexCheck(/[!-/:-@[-`{-~]/);
		/**
		* Check whether a character code is a markdown line ending.
		*
		* A **markdown line ending** is the virtual characters M-0003 CARRIAGE RETURN
		* LINE FEED (CRLF), M-0004 LINE FEED (LF) and M-0005 CARRIAGE RETURN (CR).
		*
		* In micromark, the actual character U+000A LINE FEED (LF) and U+000D CARRIAGE
		* RETURN (CR) are replaced by these virtual characters depending on whether
		* they occurred together.
		*
		* @param {Code} code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		function markdownLineEnding(code) {
			return code !== null && code < -2;
		}
		/**
		* Check whether a character code is a markdown line ending (see
		* `markdownLineEnding`) or markdown space (see `markdownSpace`).
		*
		* @param {Code} code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		function markdownLineEndingOrSpace(code) {
			return code !== null && (code < 0 || code === 32);
		}
		/**
		* Check whether a character code is a markdown space.
		*
		* A **markdown space** is the concrete character U+0020 SPACE (SP) and the
		* virtual characters M-0001 VIRTUAL SPACE (VS) and M-0002 HORIZONTAL TAB (HT).
		*
		* In micromark, the actual character U+0009 CHARACTER TABULATION (HT) is
		* replaced by one M-0002 HORIZONTAL TAB (HT) and between 0 and 3 M-0001 VIRTUAL
		* SPACE (VS) characters, depending on the column at which the tab occurred.
		*
		* @param {Code} code
		*   Code.
		* @returns {boolean}
		*   Whether it matches.
		*/
		function markdownSpace(code) {
			return code === -2 || code === -1 || code === 32;
		}
		/**
		* Check whether the character code represents Unicode punctuation.
		*
		* A **Unicode punctuation** is a character in the Unicode `Pc` (Punctuation,
		* Connector), `Pd` (Punctuation, Dash), `Pe` (Punctuation, Close), `Pf`
		* (Punctuation, Final quote), `Pi` (Punctuation, Initial quote), `Po`
		* (Punctuation, Other), or `Ps` (Punctuation, Open) categories, or an ASCII
		* punctuation (see `asciiPunctuation`).
		*
		* See:
		* **\[UNICODE]**:
		* [The Unicode Standard](https://www.unicode.org/versions/).
		* Unicode Consortium.
		*
		* @param code
		*   Code.
		* @returns
		*   Whether it matches.
		*/
		const unicodePunctuation = regexCheck(/\p{P}|\p{S}/u);
		/**
		* Check whether the character code represents Unicode whitespace.
		*
		* Note that this does handle micromark specific markdown whitespace characters.
		* See `markdownLineEndingOrSpace` to check that.
		*
		* A **Unicode whitespace** is a character in the Unicode `Zs` (Separator,
		* Space) category, or U+0009 CHARACTER TABULATION (HT), U+000A LINE FEED (LF),
		* U+000C (FF), or U+000D CARRIAGE RETURN (CR) (**\[UNICODE]**).
		*
		* See:
		* **\[UNICODE]**:
		* [The Unicode Standard](https://www.unicode.org/versions/).
		* Unicode Consortium.
		*
		* @param code
		*   Code.
		* @returns
		*   Whether it matches.
		*/
		const unicodeWhitespace = regexCheck(/\s/);
		/**
		* Create a code check from a regex.
		*
		* @param {RegExp} regex
		*   Expression.
		* @returns {(code: Code) => boolean}
		*   Check.
		*/
		function regexCheck(regex) {
			return check;
			/**
			* Check whether a code matches the bound regex.
			*
			* @param {Code} code
			*   Character code.
			* @returns {boolean}
			*   Whether the character code matches the bound regex.
			*/
			function check(code) {
				return code !== null && code > -1 && regex.test(String.fromCharCode(code));
			}
		}
		//#endregion
		//#region node_modules/micromark-util-sanitize-uri/index.js
		/**
		* Normalize a URL.
		*
		* Encode unsafe characters with percent-encoding, skipping already encoded
		* sequences.
		*
		* @param {string} value
		*   URI to normalize.
		* @returns {string}
		*   Normalized URI.
		*/
		function normalizeUri(value) {
			/** @type {Array<string>} */
			const result = [];
			let index = -1;
			let start = 0;
			let skip = 0;
			while (++index < value.length) {
				const code = value.charCodeAt(index);
				/** @type {string} */
				let replace = "";
				if (code === 37 && asciiAlphanumeric(value.charCodeAt(index + 1)) && asciiAlphanumeric(value.charCodeAt(index + 2))) skip = 2;
				else if (code < 128) {
					if (!/[!#$&-;=?-Z_a-z~]/.test(String.fromCharCode(code))) replace = String.fromCharCode(code);
				} else if (code > 55295 && code < 57344) {
					const next = value.charCodeAt(index + 1);
					if (code < 56320 && next > 56319 && next < 57344) {
						replace = String.fromCharCode(code, next);
						skip = 1;
					} else replace = "�";
				} else replace = String.fromCharCode(code);
				if (replace) {
					result.push(value.slice(start, index), encodeURIComponent(replace));
					start = index + skip + 1;
					replace = "";
				}
				if (skip) {
					index += skip;
					skip = 0;
				}
			}
			return result.join("") + value.slice(start);
		}
		//#endregion
		//#region node_modules/micromark-factory-space/index.js
		/**
		* @import {Effects, State, TokenType} from 'micromark-util-types'
		*/
		/**
		* Parse spaces and tabs.
		*
		* There is no `nok` parameter:
		*
		* *   spaces in markdown are often optional, in which case this factory can be
		*     used and `ok` will be switched to whether spaces were found or not
		* *   one line ending or space can be detected with `markdownSpace(code)` right
		*     before using `factorySpace`
		*
		* ###### Examples
		*
		* Where `␉` represents a tab (plus how much it expands) and `␠` represents a
		* single space.
		*
		* ```markdown
		* ␉
		* ␠␠␠␠
		* ␉␠
		* ```
		*
		* @param {Effects} effects
		*   Context.
		* @param {State} ok
		*   State switched to when successful.
		* @param {TokenType} type
		*   Type of the whole whitespace.
		* @param {number | undefined} [max=Infinity]
		*   Max (exclusive).
		* @returns {State}
		*   Start state.
		*/
		function factorySpace(effects, ok, type, max) {
			const limit = max ? max - 1 : Infinity;
			let size = 0;
			return start;
			/** @type {State} */
			function start(code) {
				if (markdownSpace(code)) {
					effects.enter(type);
					return prefix(code);
				}
				return ok(code);
			}
			/** @type {State} */
			function prefix(code) {
				if (markdownSpace(code) && size++ < limit) {
					effects.consume(code);
					return prefix;
				}
				effects.exit(type);
				return ok(code);
			}
		}
		/**
		* Parse spaces and tabs, with a required minimum and maximum, matching
		* `markdown-rs`’s `space_or_tab_min_max`.
		*
		* Unlike `factorySpace`, this can fail: `nok` is used when fewer than
		* `min` spaces or tabs are found.
		*
		* @param {Effects} effects
		*   Context.
		* @param {State} ok
		*   State switched to when successful.
		* @param {State} nok
		*   State switched to when unsuccessful.
		* @param {TokenType} type
		*   Type of the whole whitespace.
		* @param {number} min
		*   Minimum allowed characters (inclusive).
		* @param {number} max
		*   Maximum allowed characters (inclusive).
		* @returns {State}
		*   Start state.
		*/
		function factorySpaceMinMax(effects, ok, nok, type, min, max) {
			let size = 0;
			return start;
			/** @type {State} */
			function start(code) {
				if (max > 0 && markdownSpace(code)) {
					effects.enter(type);
					return prefix(code);
				}
				return after(code);
			}
			/** @type {State} */
			function prefix(code) {
				if (markdownSpace(code) && size < max) {
					effects.consume(code);
					size++;
					return prefix;
				}
				effects.exit(type);
				return after(code);
			}
			/** @type {State} */
			function after(code) {
				return size >= min ? ok(code) : nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark/lib/initialize/content.js
		/**
		* @import {
		*   InitialConstruct,
		*   Initializer,
		*   State,
		*   TokenizeContext,
		*   Token
		* } from 'micromark-util-types'
		*/
		/** @type {InitialConstruct} */
		const content$1 = { tokenize: initializeContent };
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Initializer}
		*   Content.
		*/
		function initializeContent(effects) {
			const contentStart = effects.attempt(this.parser.constructs.contentInitial, afterContentStartConstruct, paragraphInitial);
			/** @type {Token} */
			let previous;
			return contentStart;
			/** @type {State} */
			function afterContentStartConstruct(code) {
				if (code === null) {
					effects.consume(code);
					return;
				}
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return factorySpace(effects, contentStart, "linePrefix");
			}
			/** @type {State} */
			function paragraphInitial(code) {
				effects.enter("paragraph");
				return lineStart(code);
			}
			/** @type {State} */
			function lineStart(code) {
				const token = effects.enter("chunkText", {
					contentType: "text",
					previous
				});
				if (previous) previous.next = token;
				previous = token;
				return data(code);
			}
			/** @type {State} */
			function data(code) {
				if (code === null) {
					effects.exit("chunkText");
					effects.exit("paragraph");
					effects.consume(code);
					return;
				}
				if (markdownLineEnding(code)) {
					effects.consume(code);
					effects.exit("chunkText");
					return lineStart;
				}
				effects.consume(code);
				return data;
			}
		}
		//#endregion
		//#region node_modules/micromark-util-edit-map/index.js
		/**
		* @import {Event} from 'micromark-util-types'
		*/
		/**
		* @typedef {[number, number, Array<Event>]} Change
		* @typedef {[number, number, number]} Jump
		*/
		/**
		* Tracks a bunch of edits.
		*
		* Port of `edit_map.rs` from `markdown-rs`:
		* <https://github.com/wooorm/markdown-rs/blob/1506572f/src/util/edit_map.rs>.
		*
		* Deal with several changes in events, batching them together.
		*
		* Preferably, changes should be kept to a minimum.
		* Sometimes, it’s needed to change the list of events, because parsing can be
		* messy, and it helps to expose a cleaner interface of events to the compiler
		* and other users.
		* It can also help to merge many adjacent similar events.
		* And, in other cases, it’s needed to parse subcontent: pass some events
		* through another tokenizer and inject the result.
		*/
		var EditMap$1 = class {
			/**
			* Create a new edit map.
			*
			* @returns
			*   New instance.
			*/
			constructor() {
				/**
				* Changes by index, so `add` does not need to scan `map` (which is
				* quadratic for documents with many edits at different places).
				*
				* @type {Map<number, Change>}
				*/
				this.index = /* @__PURE__ */ new Map();
				/**
				* Record of changes.
				*
				* @type {Array<Change>}
				*/
				this.map = [];
			}
			/**
			* Create an edit: a remove and/or add at a certain place.
			*
			* @param {number} index
			*   Index at which to apply the edit.
			* @param {number} remove
			*   Count of items to remove at the index.
			* @param {Array<Event>} add
			*   Items to add at the index.
			* @returns {undefined}
			*   Nothing.
			*/
			add(index, remove, add) {
				addImplementation$1(this, index, remove, add, false);
			}
			/**
			* Create an edit: but insert `add` before existing additions, instead of
			* after them.
			*
			* @param {number} index
			*   Index at which to apply the edit.
			* @param {number} remove
			*   Count of items to remove at the index.
			* @param {Array<Event>} add
			*   Items to add at the index.
			* @returns {undefined}
			*   Nothing.
			*/
			addBefore(index, remove, add) {
				addImplementation$1(this, index, remove, add, true);
			}
			/**
			* Done, change the events.
			*
			* @param {Array<Event>} events
			*   List of events to apply the edits to.
			* @returns {undefined}
			*   Nothing.
			*/
			consume(events) {
				this.map.sort(function(a, b) {
					return a[0] - b[0];
				});
				if (this.map.length === 0) return;
				let index = this.map.length;
				/** @type {Array<Array<Event>>} */
				const vecs = [];
				while (index > 0) {
					index -= 1;
					vecs.push(events.slice(this.map[index][0] + this.map[index][1]), this.map[index][2]);
					events.length = this.map[index][0];
				}
				vecs.push(events.slice());
				events.length = 0;
				let slice = vecs.pop();
				while (slice) {
					for (const element of slice) events.push(element);
					slice = vecs.pop();
				}
				this.map.length = 0;
				this.index.clear();
			}
		};
		/**
		* Create an edit.
		*
		* @param {EditMap} editMap
		*   Edit map to apply to.
		* @param {number} at
		*   Index at which to apply the edit.
		* @param {number} remove
		*   Count of items to remove at the index.
		* @param {Array<Event>} add
		*   Items to add at the index.
		* @param {boolean} before
		*   Insert `add` before existing additions at `at`, instead of after them.
		* @returns {undefined}
		*   Nothing.
		*/
		function addImplementation$1(editMap, at, remove, add, before) {
			if (remove === 0 && add.length === 0) return;
			const existing = editMap.index.get(at);
			if (existing) {
				existing[1] += remove;
				if (before) {
					add.push(...existing[2]);
					existing[2] = add;
				} else existing[2].push(...add);
				return;
			}
			/** @type {Change} */
			const change = [
				at,
				remove,
				add
			];
			editMap.map.push(change);
			editMap.index.set(at, change);
		}
		//#endregion
		//#region node_modules/micromark/lib/initialize/document.js
		/**
		* @import {
		*   Construct,
		*   ContainerState,
		*   InitialConstruct,
		*   Initializer,
		*   Point,
		*   State,
		*   TokenizeContext,
		*   Tokenizer,
		*   Token
		* } from 'micromark-util-types'
		*/
		/**
		* @typedef {[Construct, ContainerState]} StackItem
		*   Construct and its state.
		*/
		/** @type {InitialConstruct} */
		const document$2 = { tokenize: initializeDocument };
		/** @type {Construct} */
		const containerConstruct = { tokenize: tokenizeContainer };
		/**
		* @this {TokenizeContext}
		*   Self.
		* @type {Initializer}
		*   Initializer.
		*/
		function initializeDocument(effects) {
			const self = this;
			/** @type {Array<StackItem>} */
			const stack = [];
			let continued = 0;
			/** @type {TokenizeContext | undefined} */
			let childFlow;
			/** @type {Token | undefined} */
			let childToken;
			/** @type {number} */
			let lineStartOffset;
			return start;
			/** @type {State} */
			function start(code) {
				if (continued < stack.length) {
					const item = stack[continued];
					self.containerState = item[1];
					return effects.attempt(item[0].continuation, documentContinue, checkNewContainers)(code);
				}
				return checkNewContainers(code);
			}
			/** @type {State} */
			function documentContinue(code) {
				continued++;
				if (self.containerState._closeFlow) {
					self.containerState._closeFlow = void 0;
					if (childFlow) closeFlow();
					const indexBeforeExits = self.events.length;
					let indexBeforeFlow = indexBeforeExits;
					/** @type {Point | undefined} */
					let point;
					while (indexBeforeFlow--) if (self.events[indexBeforeFlow][0] === "exit" && self.events[indexBeforeFlow][1].type === "chunkFlow") {
						point = self.events[indexBeforeFlow][1].end;
						break;
					}
					exitContainers(continued);
					let index = indexBeforeExits;
					while (index < self.events.length) {
						self.events[index][1].end = { ...point };
						index++;
					}
					const editMap = new EditMap$1();
					editMap.add(indexBeforeFlow + 1, 0, self.events.slice(indexBeforeExits));
					editMap.add(indexBeforeExits, index - indexBeforeExits, []);
					editMap.consume(self.events);
					return checkNewContainers(code);
				}
				return start(code);
			}
			/** @type {State} */
			function checkNewContainers(code) {
				if (continued === stack.length) {
					if (!childFlow) return documentContinued(code);
					if (childFlow.currentConstruct && childFlow.currentConstruct.concrete) return flowStart(code);
					self.interrupt = Boolean(childFlow.currentConstruct && !childFlow._gfmTableDynamicInterruptHack);
				}
				self.containerState = {};
				return effects.check(containerConstruct, thereIsANewContainer, thereIsNoNewContainer)(code);
			}
			/** @type {State} */
			function thereIsANewContainer(code) {
				if (childFlow) closeFlow();
				exitContainers(continued);
				return documentContinued(code);
			}
			/** @type {State} */
			function thereIsNoNewContainer(code) {
				self.parser.lazy[self.now().line] = continued !== stack.length;
				lineStartOffset = self.now().offset;
				return flowStart(code);
			}
			/** @type {State} */
			function documentContinued(code) {
				self.containerState = {};
				return effects.attempt(containerConstruct, containerContinue, flowStart)(code);
			}
			/** @type {State} */
			function containerContinue(code) {
				continued++;
				stack.push([self.currentConstruct, self.containerState]);
				return documentContinued(code);
			}
			/** @type {State} */
			function flowStart(code) {
				if (code === null) {
					if (childFlow) closeFlow();
					exitContainers(0);
					effects.consume(code);
					return;
				}
				childFlow = childFlow || self.parser.flow(self.now());
				effects.enter("chunkFlow", {
					_tokenizer: childFlow,
					contentType: "flow",
					previous: childToken
				});
				return flowContinue(code);
			}
			/** @type {State} */
			function flowContinue(code) {
				if (code === null) {
					writeToChild(effects.exit("chunkFlow"), true);
					exitContainers(0);
					effects.consume(code);
					return;
				}
				if (markdownLineEnding(code)) {
					effects.consume(code);
					writeToChild(effects.exit("chunkFlow"));
					continued = 0;
					self.interrupt = void 0;
					return start;
				}
				effects.consume(code);
				return flowContinue;
			}
			/**
			* @param {Token} token
			*   Token.
			* @param {boolean | undefined} [endOfFile]
			*   Whether the token is at the end of the file (default: `false`).
			* @returns {undefined}
			*   Nothing.
			*/
			function writeToChild(token, endOfFile) {
				const stream = self.sliceStream(token);
				if (endOfFile) stream.push(null);
				token.previous = childToken;
				if (childToken) childToken.next = token;
				childToken = token;
				childFlow.defineSkip(token.start);
				childFlow.write(stream);
				if (self.parser.lazy[token.start.line]) {
					let index = childFlow.events.length;
					while (index--) if (childFlow.events[index][1].start.offset < lineStartOffset && (!childFlow.events[index][1].end || childFlow.events[index][1].end.offset > lineStartOffset)) return;
					const indexBeforeExits = self.events.length;
					let indexBeforeFlow = indexBeforeExits;
					/** @type {boolean | undefined} */
					let seen;
					/** @type {Point | undefined} */
					let point;
					while (indexBeforeFlow--) if (self.events[indexBeforeFlow][0] === "exit" && self.events[indexBeforeFlow][1].type === "chunkFlow") {
						if (seen) {
							point = self.events[indexBeforeFlow][1].end;
							break;
						}
						seen = true;
					}
					exitContainers(continued);
					index = indexBeforeExits;
					while (index < self.events.length) {
						self.events[index][1].end = { ...point };
						index++;
					}
					const editMap = new EditMap$1();
					editMap.add(indexBeforeFlow + 1, 0, self.events.slice(indexBeforeExits));
					editMap.add(indexBeforeExits, index - indexBeforeExits, []);
					editMap.consume(self.events);
				}
			}
			/**
			* @param {number} size
			*   Size.
			* @returns {undefined}
			*   Nothing.
			*/
			function exitContainers(size) {
				let index = stack.length;
				while (index-- > size) {
					const entry = stack[index];
					self.containerState = entry[1];
					entry[0].exit.call(self, effects);
				}
				stack.length = size;
			}
			function closeFlow() {
				childFlow.write([null]);
				childToken = void 0;
				childFlow = void 0;
				self.containerState._closeFlow = void 0;
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*   Tokenizer.
		*/
		function tokenizeContainer(effects, ok, nok) {
			return factorySpace(effects, effects.attempt(this.parser.constructs.document, ok, nok), "linePrefix", this.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4);
		}
		//#endregion
		//#region node_modules/micromark-util-classify-character/index.js
		/**
		* @import {Code} from 'micromark-util-types'
		*/
		/**
		* Classify whether a code represents whitespace, punctuation, or something
		* else.
		*
		* Used for attention (emphasis, strong), whose sequences can open or close
		* based on the class of surrounding characters.
		*
		* > 👉 **Note**: eof (`null`) is seen as whitespace.
		*
		* @param {Code} code
		*   Code.
		* @returns {typeof constants.characterGroupWhitespace | typeof constants.characterGroupPunctuation | undefined}
		*   Group.
		*/
		function classifyCharacter(code) {
			if (code === null || markdownLineEndingOrSpace(code) || unicodeWhitespace(code)) return 1;
			if (unicodePunctuation(code)) return 2;
		}
		//#endregion
		//#region node_modules/micromark-util-resolve-all/index.js
		/**
		* @import {Event, Resolver, TokenizeContext} from 'micromark-util-types'
		*/
		/**
		* Call all `resolveAll`s.
		*
		* @param {ReadonlyArray<{resolveAll?: Resolver | undefined}>} constructs
		*   List of constructs, optionally with `resolveAll`s.
		* @param {Array<Event>} events
		*   List of events.
		* @param {TokenizeContext} context
		*   Context used by `tokenize`.
		* @returns {Array<Event>}
		*   Changed events.
		*/
		function resolveAll(constructs, events, context) {
			/** @type {Array<Resolver>} */
			const called = [];
			let index = -1;
			while (++index < constructs.length) {
				const resolve = constructs[index].resolveAll;
				if (resolve && !called.includes(resolve)) {
					events = resolve(events, context);
					called.push(resolve);
				}
			}
			return events;
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/attention.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   Event,
		*   Point,
		*   Resolver,
		*   State,
		*   TokenizeContext,
		*   Tokenizer,
		*   Token
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const attention$2 = {
			name: "attention",
			resolveAll: resolveAllAttention,
			tokenize: tokenizeAttention
		};
		/**
		* Take all events and resolve attention to emphasis or strong.
		*
		* @type {Resolver}
		*/
		function resolveAllAttention(events, context) {
			let index = -1;
			/** @type {Array<Event>} */
			let nextEvents;
			while (++index < events.length) if (events[index][0] === "enter" && events[index][1].type === "attentionSequence" && events[index][1]._close) {
				let open = index;
				while (open--) if (events[open][0] === "exit" && events[open][1].type === "attentionSequence" && events[open][1]._open && context.sliceSerialize(events[open][1]).charCodeAt(0) === context.sliceSerialize(events[index][1]).charCodeAt(0)) {
					if ((events[open][1]._close || events[index][1]._open) && (events[index][1].end.offset - events[index][1].start.offset) % 3 && !((events[open][1].end.offset - events[open][1].start.offset + events[index][1].end.offset - events[index][1].start.offset) % 3)) continue;
					const use = events[open][1].end.offset - events[open][1].start.offset > 1 && events[index][1].end.offset - events[index][1].start.offset > 1 ? 2 : 1;
					const start = { ...events[open][1].end };
					const end = { ...events[index][1].start };
					movePoint(start, -use);
					movePoint(end, use);
					const openingSequence = {
						type: use > 1 ? "strongSequence" : "emphasisSequence",
						start,
						end: { ...events[open][1].end }
					};
					const closingSequence = {
						type: use > 1 ? "strongSequence" : "emphasisSequence",
						start: { ...events[index][1].start },
						end
					};
					const text = {
						type: use > 1 ? "strongText" : "emphasisText",
						start: { ...events[open][1].end },
						end: { ...events[index][1].start }
					};
					const group = {
						type: use > 1 ? "strong" : "emphasis",
						start: { ...openingSequence.start },
						end: { ...closingSequence.end }
					};
					events[open][1].end = { ...openingSequence.start };
					events[index][1].start = { ...closingSequence.end };
					nextEvents = [];
					if (events[open][1].end.offset - events[open][1].start.offset) nextEvents = push(nextEvents, [[
						"enter",
						events[open][1],
						context
					], [
						"exit",
						events[open][1],
						context
					]]);
					nextEvents = push(nextEvents, [
						[
							"enter",
							group,
							context
						],
						[
							"enter",
							openingSequence,
							context
						],
						[
							"exit",
							openingSequence,
							context
						],
						[
							"enter",
							text,
							context
						]
					]);
					nextEvents = push(nextEvents, resolveAll(context.parser.constructs.insideSpan.null, events.slice(open + 1, index), context));
					nextEvents = push(nextEvents, [
						[
							"exit",
							text,
							context
						],
						[
							"enter",
							closingSequence,
							context
						],
						[
							"exit",
							closingSequence,
							context
						],
						[
							"exit",
							group,
							context
						]
					]);
					/** @type {number} */
					let offset = 0;
					if (events[index][1].end.offset - events[index][1].start.offset) {
						offset = 2;
						nextEvents = push(nextEvents, [[
							"enter",
							events[index][1],
							context
						], [
							"exit",
							events[index][1],
							context
						]]);
					}
					splice(events, open - 1, index - open + 3, nextEvents);
					index = open + nextEvents.length - offset - 2;
					break;
				}
			}
			index = -1;
			while (++index < events.length) if (events[index][1].type === "attentionSequence") events[index][1].type = "data";
			return events;
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeAttention(effects, ok) {
			const attentionMarkers = this.parser.constructs.attentionMarkers.null;
			const previous = this.previous;
			const before = classifyCharacter(previous);
			/** @type {NonNullable<Code>} */
			let marker;
			return start;
			/**
			* Before a sequence.
			*
			* ```markdown
			* > | **
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				marker = code;
				effects.enter("attentionSequence");
				return inside(code);
			}
			/**
			* In a sequence.
			*
			* ```markdown
			* > | **
			*     ^^
			* ```
			*
			* @type {State}
			*/
			function inside(code) {
				if (code === marker) {
					effects.consume(code);
					return inside;
				}
				const token = effects.exit("attentionSequence");
				const after = classifyCharacter(code);
				const open = !after || after === 2 && before || attentionMarkers.includes(code) && code !== 42 && code !== 95;
				const close = !before || before === 2 && after || attentionMarkers.includes(previous) && previous !== 42 && previous !== 95;
				token._open = Boolean(marker === 42 ? open : open && (before || !close));
				token._close = Boolean(marker === 42 ? close : close && (after || !open));
				return ok(code);
			}
		}
		/**
		* Move a point a bit.
		*
		* Note: `move` only works inside lines! It’s not possible to move past other
		* chunks (replacement characters, tabs, or line endings).
		*
		* @param {Point} point
		*   Point.
		* @param {number} offset
		*   Amount to move.
		* @returns {undefined}
		*   Nothing.
		*/
		function movePoint(point, offset) {
			point.column += offset;
			point.offset += offset;
			point._bufferIndex += offset;
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/autolink.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const autolink = {
			name: "autolink",
			tokenize: tokenizeAutolink
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeAutolink(effects, ok, nok) {
			let size = 0;
			return start;
			/**
			* Start of an autolink.
			*
			* ```markdown
			* > | a<https://example.com>b
			*      ^
			* > | a<user@example.com>b
			*      ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("autolink");
				effects.enter("autolinkMarker");
				effects.consume(code);
				effects.exit("autolinkMarker");
				effects.enter("autolinkProtocol");
				return open;
			}
			/**
			* After `<`, at protocol or atext.
			*
			* ```markdown
			* > | a<https://example.com>b
			*       ^
			* > | a<user@example.com>b
			*       ^
			* ```
			*
			* @type {State}
			*/
			function open(code) {
				if (asciiAlpha(code)) {
					effects.consume(code);
					return schemeOrEmailAtext;
				}
				if (code === 64) return nok(code);
				return emailAtext(code);
			}
			/**
			* At second byte of protocol or atext.
			*
			* ```markdown
			* > | a<https://example.com>b
			*        ^
			* > | a<user@example.com>b
			*        ^
			* ```
			*
			* @type {State}
			*/
			function schemeOrEmailAtext(code) {
				if (code === 43 || code === 45 || code === 46 || asciiAlphanumeric(code)) {
					size = 1;
					return schemeInsideOrEmailAtext(code);
				}
				return emailAtext(code);
			}
			/**
			* In ambiguous protocol or atext.
			*
			* ```markdown
			* > | a<https://example.com>b
			*        ^
			* > | a<user@example.com>b
			*        ^
			* ```
			*
			* @type {State}
			*/
			function schemeInsideOrEmailAtext(code) {
				if (code === 58) {
					effects.consume(code);
					size = 0;
					return urlInside;
				}
				if ((code === 43 || code === 45 || code === 46 || asciiAlphanumeric(code)) && size++ < 32) {
					effects.consume(code);
					return schemeInsideOrEmailAtext;
				}
				size = 0;
				return emailAtext(code);
			}
			/**
			* After protocol, in URL.
			*
			* ```markdown
			* > | a<https://example.com>b
			*             ^
			* ```
			*
			* @type {State}
			*/
			function urlInside(code) {
				if (code === 62) {
					effects.exit("autolinkProtocol");
					effects.enter("autolinkMarker");
					effects.consume(code);
					effects.exit("autolinkMarker");
					effects.exit("autolink");
					return ok;
				}
				if (code === null || code === 32 || code === 60 || asciiControl(code)) return nok(code);
				effects.consume(code);
				return urlInside;
			}
			/**
			* In email atext.
			*
			* ```markdown
			* > | a<user.name@example.com>b
			*              ^
			* ```
			*
			* @type {State}
			*/
			function emailAtext(code) {
				if (code === 64) {
					effects.consume(code);
					return emailAtSignOrDot;
				}
				if (asciiAtext(code)) {
					effects.consume(code);
					return emailAtext;
				}
				return nok(code);
			}
			/**
			* In label, after at-sign or dot.
			*
			* ```markdown
			* > | a<user.name@example.com>b
			*                 ^       ^
			* ```
			*
			* @type {State}
			*/
			function emailAtSignOrDot(code) {
				return asciiAlphanumeric(code) ? emailLabel(code) : nok(code);
			}
			/**
			* In label, where `.` and `>` are allowed.
			*
			* ```markdown
			* > | a<user.name@example.com>b
			*                   ^
			* ```
			*
			* @type {State}
			*/
			function emailLabel(code) {
				if (code === 46) {
					effects.consume(code);
					size = 0;
					return emailAtSignOrDot;
				}
				if (code === 62) {
					effects.exit("autolinkProtocol").type = "autolinkEmail";
					effects.enter("autolinkMarker");
					effects.consume(code);
					effects.exit("autolinkMarker");
					effects.exit("autolink");
					return ok;
				}
				return emailValue(code);
			}
			/**
			* In label, where `.` and `>` are *not* allowed.
			*
			* Though, this is also used in `emailLabel` to parse other values.
			*
			* ```markdown
			* > | a<user.name@ex-ample.com>b
			*                    ^
			* ```
			*
			* @type {State}
			*/
			function emailValue(code) {
				if ((code === 45 || asciiAlphanumeric(code)) && size++ < 63) {
					const next = code === 45 ? emailValue : emailLabel;
					effects.consume(code);
					return next;
				}
				return nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/blank-line.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const blankLine = {
			partial: true,
			tokenize: tokenizeBlankLine
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeBlankLine(effects, ok, nok) {
			return start;
			/**
			* Start of blank line.
			*
			* > 👉 **Note**: `␠` represents a space character.
			*
			* ```markdown
			* > | ␠␠␊
			*     ^
			* > | ␊
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				return markdownSpace(code) ? factorySpace(effects, after, "linePrefix")(code) : after(code);
			}
			/**
			* At eof/eol, after optional whitespace.
			*
			* > 👉 **Note**: `␠` represents a space character.
			*
			* ```markdown
			* > | ␠␠␊
			*       ^
			* > | ␊
			*     ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				return code === null || markdownLineEnding(code) ? ok(code) : nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/block-quote.js
		/**
		* @import {
		*   Construct,
		*   Exiter,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const blockQuote = {
			continuation: { tokenize: tokenizeBlockQuoteContinuation },
			exit: exit$1,
			name: "blockQuote",
			tokenize: tokenizeBlockQuoteStart
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeBlockQuoteStart(effects, ok, nok) {
			const self = this;
			return start;
			/**
			* Start of block quote.
			*
			* ```markdown
			* > | > a
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				if (code === 62) {
					const state = self.containerState;
					if (!state.open) {
						effects.enter("blockQuote", { _container: true });
						state.open = true;
					}
					effects.enter("blockQuotePrefix");
					effects.enter("blockQuoteMarker");
					effects.consume(code);
					effects.exit("blockQuoteMarker");
					return after;
				}
				return nok(code);
			}
			/**
			* After `>`, before optional whitespace.
			*
			* ```markdown
			* > | > a
			*      ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				if (markdownSpace(code)) {
					effects.enter("blockQuotePrefixWhitespace");
					effects.consume(code);
					effects.exit("blockQuotePrefixWhitespace");
					effects.exit("blockQuotePrefix");
					return ok;
				}
				effects.exit("blockQuotePrefix");
				return ok(code);
			}
		}
		/**
		* Start of block quote continuation.
		*
		* ```markdown
		*   | > a
		* > | > b
		*     ^
		* ```
		*
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeBlockQuoteContinuation(effects, ok, nok) {
			const self = this;
			return contStart;
			/**
			* Start of block quote continuation.
			*
			* Also used to parse the first block quote opening.
			*
			* ```markdown
			*   | > a
			* > | > b
			*     ^
			* ```
			*
			* @type {State}
			*/
			function contStart(code) {
				if (markdownSpace(code)) return factorySpace(effects, contBefore, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code);
				return contBefore(code);
			}
			/**
			* At `>`, after optional whitespace.
			*
			* Also used to parse the first block quote opening.
			*
			* ```markdown
			*   | > a
			* > | > b
			*     ^
			* ```
			*
			* @type {State}
			*/
			function contBefore(code) {
				return effects.attempt(blockQuote, ok, nok)(code);
			}
		}
		/** @type {Exiter} */
		function exit$1(effects) {
			effects.exit("blockQuote");
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/character-escape.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const characterEscape = {
			name: "characterEscape",
			tokenize: tokenizeCharacterEscape
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeCharacterEscape(effects, ok, nok) {
			return start;
			/**
			* Start of character escape.
			*
			* ```markdown
			* > | a\*b
			*      ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("characterEscape");
				effects.enter("escapeMarker");
				effects.consume(code);
				effects.exit("escapeMarker");
				return inside;
			}
			/**
			* After `\`, at punctuation.
			*
			* ```markdown
			* > | a\*b
			*       ^
			* ```
			*
			* @type {State}
			*/
			function inside(code) {
				if (asciiPunctuation(code)) {
					effects.enter("characterEscapeValue");
					effects.consume(code);
					effects.exit("characterEscapeValue");
					effects.exit("characterEscape");
					return ok;
				}
				return nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/character-reference.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const characterReference = {
			name: "characterReference",
			tokenize: tokenizeCharacterReference
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeCharacterReference(effects, ok, nok) {
			const self = this;
			let size = 0;
			/** @type {number} */
			let max;
			/** @type {(code: Code) => boolean} */
			let test;
			return start;
			/**
			* Start of character reference.
			*
			* ```markdown
			* > | a&amp;b
			*      ^
			* > | a&#123;b
			*      ^
			* > | a&#x9;b
			*      ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("characterReference");
				effects.enter("characterReferenceMarker");
				effects.consume(code);
				effects.exit("characterReferenceMarker");
				return open;
			}
			/**
			* After `&`, at `#` for numeric references or alphanumeric for named
			* references.
			*
			* ```markdown
			* > | a&amp;b
			*       ^
			* > | a&#123;b
			*       ^
			* > | a&#x9;b
			*       ^
			* ```
			*
			* @type {State}
			*/
			function open(code) {
				if (code === 35) {
					effects.enter("characterReferenceMarkerNumeric");
					effects.consume(code);
					effects.exit("characterReferenceMarkerNumeric");
					return numeric;
				}
				effects.enter("characterReferenceValue");
				max = 31;
				test = asciiAlphanumeric;
				return value(code);
			}
			/**
			* After `#`, at `x` for hexadecimals or digit for decimals.
			*
			* ```markdown
			* > | a&#123;b
			*        ^
			* > | a&#x9;b
			*        ^
			* ```
			*
			* @type {State}
			*/
			function numeric(code) {
				if (code === 88 || code === 120) {
					effects.enter("characterReferenceMarkerHexadecimal");
					effects.consume(code);
					effects.exit("characterReferenceMarkerHexadecimal");
					effects.enter("characterReferenceValue");
					max = 6;
					test = asciiHexDigit;
					return value;
				}
				effects.enter("characterReferenceValue");
				max = 7;
				test = asciiDigit;
				return value(code);
			}
			/**
			* After markers (`&#x`, `&#`, or `&`), in value, before `;`.
			*
			* The character reference kind defines what and how many characters are
			* allowed.
			*
			* ```markdown
			* > | a&amp;b
			*       ^^^
			* > | a&#123;b
			*        ^^^
			* > | a&#x9;b
			*         ^
			* ```
			*
			* @type {State}
			*/
			function value(code) {
				if (code === 59 && size) {
					const token = effects.exit("characterReferenceValue");
					if (test === asciiAlphanumeric && !decodeNamedCharacterReference(self.sliceSerialize(token))) return nok(code);
					effects.enter("characterReferenceMarker");
					effects.consume(code);
					effects.exit("characterReferenceMarker");
					effects.exit("characterReference");
					return ok;
				}
				if (test(code) && size++ < max) {
					effects.consume(code);
					return value;
				}
				return nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/partial-non-lazy-continuation.js
		/** @type {Construct} */
		const nonLazyContinuation = {
			partial: true,
			tokenize: tokenizeNonLazyContinuation
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeNonLazyContinuation(effects, ok, nok) {
			const self = this;
			return start;
			/**
			* At eol, before continuation.
			*
			* ```markdown
			* > | * ```js
			*            ^
			*   | b
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				if (code === null) return nok(code);
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return after;
			}
			/**
			* A continuation.
			*
			* ```markdown
			*   | * ```js
			* > | b
			*     ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				return self.parser.lazy[self.now().line] ? nok(code) : ok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/code-fenced.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const codeFenced = {
			concrete: true,
			name: "codeFenced",
			tokenize: tokenizeCodeFenced
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeCodeFenced(effects, ok, nok) {
			const self = this;
			/** @type {Construct} */
			const closeStart = {
				partial: true,
				tokenize: tokenizeCloseStart
			};
			let initialPrefix = 0;
			let sizeOpen = 0;
			/** @type {NonNullable<Code>} */
			let marker;
			return start;
			/**
			* Start of code.
			*
			* ```markdown
			* > | ~~~js
			*     ^
			*   | alert(1)
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				return beforeSequenceOpen(code);
			}
			/**
			* In opening fence, after prefix, at sequence.
			*
			* ```markdown
			* > | ~~~js
			*     ^
			*   | alert(1)
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function beforeSequenceOpen(code) {
				const tail = self.events[self.events.length - 1];
				initialPrefix = tail && tail[1].type === "linePrefix" ? tail[2].sliceSerialize(tail[1], true).length : 0;
				marker = code;
				effects.enter("codeFenced");
				effects.enter("codeFencedFence");
				effects.enter("codeFencedFenceSequence");
				return sequenceOpen(code);
			}
			/**
			* In opening fence sequence.
			*
			* ```markdown
			* > | ~~~js
			*      ^
			*   | alert(1)
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function sequenceOpen(code) {
				if (code === marker) {
					sizeOpen++;
					effects.consume(code);
					return sequenceOpen;
				}
				if (sizeOpen < 3) return nok(code);
				effects.exit("codeFencedFenceSequence");
				return markdownSpace(code) ? factorySpace(effects, infoBefore, "whitespace")(code) : infoBefore(code);
			}
			/**
			* In opening fence, after the sequence (and optional whitespace), before info.
			*
			* ```markdown
			* > | ~~~js
			*        ^
			*   | alert(1)
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function infoBefore(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("codeFencedFence");
					return self.interrupt ? ok(code) : effects.check(nonLazyContinuation, atNonLazyBreak, after)(code);
				}
				effects.enter("codeFencedFenceInfo");
				effects.enter("chunkString", { contentType: "string" });
				return info(code);
			}
			/**
			* In info.
			*
			* ```markdown
			* > | ~~~js
			*        ^
			*   | alert(1)
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function info(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("chunkString");
					effects.exit("codeFencedFenceInfo");
					return infoBefore(code);
				}
				if (markdownSpace(code)) {
					effects.exit("chunkString");
					effects.exit("codeFencedFenceInfo");
					return factorySpace(effects, metaBefore, "whitespace")(code);
				}
				if (code === 96 && code === marker) return nok(code);
				effects.consume(code);
				return info;
			}
			/**
			* In opening fence, after info and whitespace, before meta.
			*
			* ```markdown
			* > | ~~~js eval
			*           ^
			*   | alert(1)
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function metaBefore(code) {
				if (code === null || markdownLineEnding(code)) return infoBefore(code);
				effects.enter("codeFencedFenceMeta");
				effects.enter("chunkString", { contentType: "string" });
				return meta(code);
			}
			/**
			* In meta.
			*
			* ```markdown
			* > | ~~~js eval
			*           ^
			*   | alert(1)
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function meta(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("chunkString");
					effects.exit("codeFencedFenceMeta");
					return infoBefore(code);
				}
				if (code === 96 && code === marker) return nok(code);
				effects.consume(code);
				return meta;
			}
			/**
			* At eol/eof in code, before a non-lazy closing fence or content.
			*
			* ```markdown
			* > | ~~~js
			*          ^
			* > | alert(1)
			*             ^
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function atNonLazyBreak(code) {
				return effects.attempt(closeStart, after, contentBefore)(code);
			}
			/**
			* Before code content, not a closing fence, at eol.
			*
			* ```markdown
			*   | ~~~js
			* > | alert(1)
			*             ^
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function contentBefore(code) {
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return contentStart;
			}
			/**
			* Before code content, not a closing fence.
			*
			* ```markdown
			*   | ~~~js
			* > | alert(1)
			*     ^
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function contentStart(code) {
				return initialPrefix > 0 && markdownSpace(code) ? factorySpace(effects, beforeContentChunk, "linePrefix", initialPrefix + 1)(code) : beforeContentChunk(code);
			}
			/**
			* Before code content, after optional prefix.
			*
			* ```markdown
			*   | ~~~js
			* > | alert(1)
			*     ^
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function beforeContentChunk(code) {
				if (code === null || markdownLineEnding(code)) return effects.check(nonLazyContinuation, atNonLazyBreak, after)(code);
				effects.enter("codeFlowValue");
				return contentChunk(code);
			}
			/**
			* In code content.
			*
			* ```markdown
			*   | ~~~js
			* > | alert(1)
			*     ^^^^^^^^
			*   | ~~~
			* ```
			*
			* @type {State}
			*/
			function contentChunk(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("codeFlowValue");
					return beforeContentChunk(code);
				}
				effects.consume(code);
				return contentChunk;
			}
			/**
			* After code.
			*
			* ```markdown
			*   | ~~~js
			*   | alert(1)
			* > | ~~~
			*        ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				effects.exit("codeFenced");
				return ok(code);
			}
			/**
			* @this {TokenizeContext}
			*   Context.
			* @type {Tokenizer}
			*/
			function tokenizeCloseStart(effects, ok, nok) {
				let size = 0;
				return startBefore;
				/**
				*
				*
				* @type {State}
				*/
				function startBefore(code) {
					effects.enter("lineEnding");
					effects.consume(code);
					effects.exit("lineEnding");
					return start;
				}
				/**
				* Before closing fence, at optional whitespace.
				*
				* ```markdown
				*   | ~~~js
				*   | alert(1)
				* > | ~~~
				*     ^
				* ```
				*
				* @type {State}
				*/
				function start(code) {
					effects.enter("codeFencedFence");
					return markdownSpace(code) ? factorySpace(effects, beforeSequenceClose, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code) : beforeSequenceClose(code);
				}
				/**
				* In closing fence, after optional whitespace, at sequence.
				*
				* ```markdown
				*   | ~~~js
				*   | alert(1)
				* > | ~~~
				*     ^
				* ```
				*
				* @type {State}
				*/
				function beforeSequenceClose(code) {
					if (code === marker) {
						effects.enter("codeFencedFenceSequence");
						return sequenceClose(code);
					}
					return nok(code);
				}
				/**
				* In closing fence sequence.
				*
				* ```markdown
				*   | ~~~js
				*   | alert(1)
				* > | ~~~
				*     ^
				* ```
				*
				* @type {State}
				*/
				function sequenceClose(code) {
					if (code === marker) {
						size++;
						effects.consume(code);
						return sequenceClose;
					}
					if (size >= sizeOpen) {
						effects.exit("codeFencedFenceSequence");
						return markdownSpace(code) ? factorySpace(effects, sequenceCloseAfter, "whitespace")(code) : sequenceCloseAfter(code);
					}
					return nok(code);
				}
				/**
				* After closing fence sequence, after optional whitespace.
				*
				* ```markdown
				*   | ~~~js
				*   | alert(1)
				* > | ~~~
				*        ^
				* ```
				*
				* @type {State}
				*/
				function sequenceCloseAfter(code) {
					if (code === null || markdownLineEnding(code)) {
						effects.exit("codeFencedFence");
						return ok(code);
					}
					return nok(code);
				}
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/code-indented.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const codeIndented = {
			name: "codeIndented",
			tokenize: tokenizeCodeIndented
		};
		/** @type {Construct} */
		const furtherStart = {
			partial: true,
			tokenize: tokenizeFurtherStart
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeCodeIndented(effects, ok, nok) {
			return start;
			/**
			* Start of code (indented).
			*
			* > **Parsing note**: it is not needed to check if this first line is a
			* > filled line (that it has a non-whitespace character), because blank lines
			* > are parsed already, so we never run into that.
			*
			* ```markdown
			* > |     aaa
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("codeIndented");
				return factorySpaceMinMax(effects, atBreak, nok, "linePrefix", 4, 4)(code);
			}
			/**
			* At a break.
			*
			* ```markdown
			* > |     aaa
			*         ^  ^
			* ```
			*
			* @type {State}
			*/
			function atBreak(code) {
				if (code === null) return after(code);
				if (markdownLineEnding(code)) return effects.attempt(furtherStart, atBreak, after)(code);
				effects.enter("codeFlowValue");
				return inside(code);
			}
			/**
			* In code content.
			*
			* ```markdown
			* > |     aaa
			*         ^^^^
			* ```
			*
			* @type {State}
			*/
			function inside(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("codeFlowValue");
					return atBreak(code);
				}
				effects.consume(code);
				return inside;
			}
			/** @type {State} */
			function after(code) {
				effects.exit("codeIndented");
				return ok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeFurtherStart(effects, ok, nok) {
			const self = this;
			return furtherStart;
			/**
			* At eol, trying to parse another indent.
			*
			* ```markdown
			* > |     aaa
			*            ^
			*   |     bbb
			* ```
			*
			* @type {State}
			*/
			function furtherStart(code) {
				if (self.parser.lazy[self.now().line]) return nok(code);
				if (markdownLineEnding(code)) {
					effects.enter("lineEnding");
					effects.consume(code);
					effects.exit("lineEnding");
					return furtherStart;
				}
				return factorySpaceMinMax(effects, ok, onNotEnoughPrefix, "linePrefix", 4, 4)(code);
			}
			/**
			* After not enough of a prefix.
			*
			* A following line ending is another (potentially blank) line to try,
			* anything else means this isn’t a continuation.
			*
			* ```markdown
			* > |     aaa
			*
			*   |     bbb
			* ```
			*
			* @type {State}
			*/
			function onNotEnoughPrefix(code) {
				return markdownLineEnding(code) ? furtherStart(code) : nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/code-text.js
		/**
		* @import {
		*   Construct,
		*   Previous,
		*   Resolver,
		*   State,
		*   TokenizeContext,
		*   Tokenizer,
		*   Token
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const codeText = {
			name: "codeText",
			previous: previous$1,
			resolve: resolveCodeText,
			tokenize: tokenizeCodeText
		};
		/** @type {Resolver} */
		function resolveCodeText(events) {
			let tailExitIndex = events.length - 4;
			let headEnterIndex = 3;
			/** @type {number} */
			let index;
			/** @type {number | undefined} */
			let enter;
			if ((events[headEnterIndex][1].type === "lineEnding" || events[headEnterIndex][1].type === "space") && (events[tailExitIndex][1].type === "lineEnding" || events[tailExitIndex][1].type === "space")) {
				index = headEnterIndex;
				while (++index < tailExitIndex) if (events[index][1].type === "codeTextData") {
					events[headEnterIndex][1].type = "codeTextPadding";
					events[tailExitIndex][1].type = "codeTextPadding";
					headEnterIndex += 2;
					tailExitIndex -= 2;
					break;
				}
			}
			index = headEnterIndex - 1;
			tailExitIndex++;
			while (++index <= tailExitIndex) if (enter === void 0) {
				if (index !== tailExitIndex && events[index][1].type !== "lineEnding") enter = index;
			} else if (index === tailExitIndex || events[index][1].type === "lineEnding") {
				events[enter][1].type = "codeTextData";
				if (index !== enter + 2) {
					events[enter][1].end = events[index - 1][1].end;
					events.splice(enter + 2, index - enter - 2);
					tailExitIndex -= index - enter - 2;
					index = enter + 2;
				}
				enter = void 0;
			}
			return events;
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Previous}
		*/
		function previous$1(code) {
			return code !== 96 || this.events[this.events.length - 1][1].type === "characterEscape";
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeCodeText(effects, ok, nok) {
			let sizeOpen = 0;
			/** @type {number} */
			let size;
			/** @type {Token} */
			let token;
			return start;
			/**
			* Start of code (text).
			*
			* ```markdown
			* > | `a`
			*     ^
			* > | \`a`
			*      ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("codeText");
				effects.enter("codeTextSequence");
				return sequenceOpen(code);
			}
			/**
			* In opening sequence.
			*
			* ```markdown
			* > | `a`
			*     ^
			* ```
			*
			* @type {State}
			*/
			function sequenceOpen(code) {
				if (code === 96) {
					effects.consume(code);
					sizeOpen++;
					return sequenceOpen;
				}
				effects.exit("codeTextSequence");
				return between(code);
			}
			/**
			* Between something and something else.
			*
			* ```markdown
			* > | `a`
			*      ^^
			* ```
			*
			* @type {State}
			*/
			function between(code) {
				if (code === null) return nok(code);
				if (code === 32) {
					effects.enter("space");
					effects.consume(code);
					effects.exit("space");
					return between;
				}
				if (code === 96) {
					token = effects.enter("codeTextSequence");
					size = 0;
					return sequenceClose(code);
				}
				if (markdownLineEnding(code)) {
					effects.enter("lineEnding");
					effects.consume(code);
					effects.exit("lineEnding");
					return between;
				}
				effects.enter("codeTextData");
				return data(code);
			}
			/**
			* In data.
			*
			* ```markdown
			* > | `a`
			*      ^
			* ```
			*
			* @type {State}
			*/
			function data(code) {
				if (code === null || code === 32 || code === 96 || markdownLineEnding(code)) {
					effects.exit("codeTextData");
					return between(code);
				}
				effects.consume(code);
				return data;
			}
			/**
			* In closing sequence.
			*
			* ```markdown
			* > | `a`
			*       ^
			* ```
			*
			* @type {State}
			*/
			function sequenceClose(code) {
				if (code === 96) {
					effects.consume(code);
					size++;
					return sequenceClose;
				}
				if (size === sizeOpen) {
					effects.exit("codeTextSequence");
					effects.exit("codeText");
					return ok(code);
				}
				token.type = "codeTextData";
				return data(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-util-subtokenize/lib/splice-buffer.js
		/**
		* Some of the internal operations of micromark do lots of editing
		* operations on very large arrays. This runs into problems with two
		* properties of most circa-2020 JavaScript interpreters:
		*
		*  - Array-length modifications at the high end of an array (push/pop) are
		*    expected to be common and are implemented in (amortized) time
		*    proportional to the number of elements added or removed, whereas
		*    other operations (shift/unshift and splice) are much less efficient.
		*  - Function arguments are passed on the stack, so adding tens of thousands
		*    of elements to an array with `arr.push(...newElements)` will frequently
		*    cause stack overflows. (see <https://stackoverflow.com/questions/22123769/rangeerror-maximum-call-stack-size-exceeded-why>)
		*
		* SpliceBuffers are an implementation of gap buffers, which are a
		* generalization of the "queue made of two stacks" idea. The splice buffer
		* maintains a cursor, and moving the cursor has cost proportional to the
		* distance the cursor moves, but inserting, deleting, or splicing in
		* new information at the cursor is as efficient as the push/pop operation.
		* This allows for an efficient sequence of splices (or pushes, pops, shifts,
		* or unshifts) as long such edits happen at the same part of the array or
		* generally sweep through the array from the beginning to the end.
		*
		* The interface for splice buffers also supports large numbers of inputs by
		* passing a single array argument rather passing multiple arguments on the
		* function call stack.
		*
		* @template T
		*   Item type.
		*/
		var SpliceBuffer = class {
			/**
			* @param {ReadonlyArray<T> | null | undefined} [initial]
			*   Initial items (optional).
			* @returns
			*   Splice buffer.
			*/
			constructor(initial) {
				/** @type {Array<T>} */
				this.left = initial ? [...initial] : [];
				/** @type {Array<T>} */
				this.right = [];
			}
			/**
			* Array access;
			* does not move the cursor.
			*
			* @param {number} index
			*   Index.
			* @return {T}
			*   Item.
			*/
			get(index) {
				if (index < 0 || index >= this.left.length + this.right.length) throw new RangeError("Cannot access index `" + index + "` in a splice buffer of size `" + (this.left.length + this.right.length) + "`");
				if (index < this.left.length) return this.left[index];
				return this.right[this.right.length - index + this.left.length - 1];
			}
			/**
			* The length of the splice buffer, one greater than the largest index in the
			* array.
			*/
			get length() {
				return this.left.length + this.right.length;
			}
			/**
			* Remove and return `list[0]`;
			* moves the cursor to `0`.
			*
			* @returns {T | undefined}
			*   Item, optional.
			*/
			shift() {
				this.setCursor(0);
				return this.right.pop();
			}
			/**
			* Slice the buffer to get an array;
			* does not move the cursor.
			*
			* @param {number} start
			*   Start.
			* @param {number | null | undefined} [end]
			*   End (optional).
			* @returns {Array<T>}
			*   Array of items.
			*/
			slice(start, end) {
				/** @type {number} */
				const stop = end === null || end === void 0 ? Number.POSITIVE_INFINITY : end;
				if (stop < this.left.length) return this.left.slice(start, stop);
				if (start > this.left.length) return this.right.slice(this.right.length - stop + this.left.length, this.right.length - start + this.left.length).reverse();
				return this.left.slice(start).concat(this.right.slice(this.right.length - stop + this.left.length).reverse());
			}
			/**
			* Mimics the behavior of Array.prototype.splice() except for the change of
			* interface necessary to avoid segfaults when patching in very large arrays.
			*
			* This operation moves cursor is moved to `start` and results in the cursor
			* placed after any inserted items.
			*
			* @param {number} start
			*   Start;
			*   zero-based index at which to start changing the array;
			*   negative numbers count backwards from the end of the array and values
			*   that are out-of bounds are clamped to the appropriate end of the array.
			* @param {number | null | undefined} [deleteCount=0]
			*   Delete count (default: `0`);
			*   maximum number of elements to delete, starting from start.
			* @param {Array<T> | null | undefined} [items=[]]
			*   Items to include in place of the deleted items (default: `[]`).
			* @return {Array<T>}
			*   Any removed items.
			*/
			splice(start, deleteCount, items) {
				/** @type {number} */
				const count = deleteCount || 0;
				this.setCursor(Math.trunc(start));
				const removed = this.right.splice(this.right.length - count, Number.POSITIVE_INFINITY);
				if (items) chunkedPush(this.left, items);
				return removed.reverse();
			}
			/**
			* Remove and return the highest-numbered item in the array, so
			* `list[list.length - 1]`;
			* Moves the cursor to `length`.
			*
			* @returns {T | undefined}
			*   Item, optional.
			*/
			pop() {
				this.setCursor(Number.POSITIVE_INFINITY);
				return this.left.pop();
			}
			/**
			* Inserts a single item to the high-numbered side of the array;
			* moves the cursor to `length`.
			*
			* @param {T} item
			*   Item.
			* @returns {undefined}
			*   Nothing.
			*/
			push(item) {
				this.setCursor(Number.POSITIVE_INFINITY);
				this.left.push(item);
			}
			/**
			* Inserts many items to the high-numbered side of the array.
			* Moves the cursor to `length`.
			*
			* @param {Array<T>} items
			*   Items.
			* @returns {undefined}
			*   Nothing.
			*/
			pushMany(items) {
				this.setCursor(Number.POSITIVE_INFINITY);
				chunkedPush(this.left, items);
			}
			/**
			* Inserts a single item to the low-numbered side of the array;
			* Moves the cursor to `0`.
			*
			* @param {T} item
			*   Item.
			* @returns {undefined}
			*   Nothing.
			*/
			unshift(item) {
				this.setCursor(0);
				this.right.push(item);
			}
			/**
			* Inserts many items to the low-numbered side of the array;
			* moves the cursor to `0`.
			*
			* @param {Array<T>} items
			*   Items.
			* @returns {undefined}
			*   Nothing.
			*/
			unshiftMany(items) {
				this.setCursor(0);
				chunkedPush(this.right, items.reverse());
			}
			/**
			* Move the cursor to a specific position in the array. Requires
			* time proportional to the distance moved.
			*
			* If `n < 0`, the cursor will end up at the beginning.
			* If `n > length`, the cursor will end up at the end.
			*
			* @param {number} n
			*   Position.
			* @return {undefined}
			*   Nothing.
			*/
			setCursor(n) {
				if (n === this.left.length || n > this.left.length && this.right.length === 0 || n < 0 && this.left.length === 0) return;
				if (n < this.left.length) {
					const removed = this.left.splice(n, Number.POSITIVE_INFINITY);
					chunkedPush(this.right, removed.reverse());
				} else {
					const removed = this.right.splice(this.left.length + this.right.length - n, Number.POSITIVE_INFINITY);
					chunkedPush(this.left, removed.reverse());
				}
			}
		};
		/**
		* Avoid stack overflow by pushing items onto the stack in segments
		*
		* @template T
		*   Item type.
		* @param {Array<T>} list
		*   List to inject into.
		* @param {ReadonlyArray<T>} right
		*   Items to inject.
		* @return {undefined}
		*   Nothing.
		*/
		function chunkedPush(list, right) {
			/** @type {number} */
			let chunkStart = 0;
			if (right.length < 1e4) list.push(...right);
			else while (chunkStart < right.length) {
				list.push(...right.slice(chunkStart, chunkStart + 1e4));
				chunkStart += 1e4;
			}
		}
		//#endregion
		//#region node_modules/micromark-util-subtokenize/index.js
		/**
		* @import {Chunk, Event, Token} from 'micromark-util-types'
		*/
		/**
		* Tokenize subcontent.
		*
		* @param {Array<Event>} eventsArray
		*   List of events.
		* @returns {boolean}
		*   Whether subtokens were found.
		*/
		function subtokenize(eventsArray) {
			/** @type {Record<string, number>} */
			const jumps = {};
			let index = -1;
			/** @type {Event} */
			let event;
			/** @type {number | undefined} */
			let lineIndex;
			/** @type {number} */
			let otherIndex;
			/** @type {Event} */
			let otherEvent;
			/** @type {Array<Event>} */
			let parameters;
			/** @type {Array<Event>} */
			let subevents;
			/** @type {boolean | undefined} */
			let more;
			const events = new SpliceBuffer(eventsArray);
			while (++index < events.length) {
				while (index in jumps) index = jumps[index];
				event = events.get(index);
				if (index && event[1].type === "chunkFlow" && events.get(index - 1)[1].type === "listItemPrefix") {
					subevents = event[1]._tokenizer.events;
					otherIndex = 0;
					if (otherIndex < subevents.length && subevents[otherIndex][1].type === "lineEndingBlank") otherIndex += 2;
					if (otherIndex < subevents.length && subevents[otherIndex][1].type === "content") while (++otherIndex < subevents.length) {
						if (subevents[otherIndex][1].type === "content") break;
						if (subevents[otherIndex][1].type === "chunkText") {
							subevents[otherIndex][1]._isInFirstContentOfListItem = true;
							otherIndex++;
						}
					}
				}
				if (event[0] === "enter") {
					if (event[1].contentType) {
						Object.assign(jumps, subcontent(events, index));
						index = jumps[index];
						more = true;
					}
				} else if (event[1]._container) {
					otherIndex = index;
					lineIndex = void 0;
					while (otherIndex--) {
						otherEvent = events.get(otherIndex);
						if (otherEvent[1].type === "lineEnding" || otherEvent[1].type === "lineEndingBlank") {
							if (otherEvent[0] === "enter") {
								if (lineIndex) events.get(lineIndex)[1].type = "lineEndingBlank";
								otherEvent[1].type = "lineEnding";
								lineIndex = otherIndex;
							}
						} else if (otherEvent[1].type === "linePrefix" || otherEvent[1].type === "listItemIndent") {} else break;
					}
					if (lineIndex) {
						event[1].end = { ...events.get(lineIndex)[1].start };
						parameters = events.slice(lineIndex, index);
						parameters.unshift(event);
						events.splice(lineIndex, index - lineIndex + 1, parameters);
					}
				}
			}
			splice(eventsArray, 0, Number.POSITIVE_INFINITY, events.slice(0));
			return !more;
		}
		/**
		* Tokenize embedded tokens.
		*
		* @param {SpliceBuffer<Event>} events
		*   Events.
		* @param {number} eventIndex
		*   Index.
		* @returns {Record<string, number>}
		*   Gaps.
		*/
		function subcontent(events, eventIndex) {
			const token = events.get(eventIndex)[1];
			const context = events.get(eventIndex)[2];
			let startPosition = eventIndex - 1;
			/** @type {Array<number>} */
			const startPositions = [];
			let tokenizer = token._tokenizer;
			if (!tokenizer) {
				tokenizer = context.parser[token.contentType](token.start);
				if (token._contentTypeTextTrailing) tokenizer._contentTypeTextTrailing = true;
			}
			const childEvents = tokenizer.events;
			/** @type {Array<[number, number]>} */
			const jumps = [];
			/** @type {Record<string, number>} */
			const gaps = {};
			/** @type {Array<Chunk>} */
			let stream;
			/** @type {Token | undefined} */
			let previous;
			let index = -1;
			/** @type {Token | undefined} */
			let current = token;
			let adjust = 0;
			let start = 0;
			const breaks = [start];
			while (current) {
				while (events.get(++startPosition)[1] !== current);
				startPositions.push(startPosition);
				if (!current._tokenizer) {
					stream = context.sliceStream(current);
					if (!current.next) stream.push(null);
					if (previous) tokenizer.defineSkip(current.start);
					if (current._isInFirstContentOfListItem) tokenizer._gfmTasklistFirstContentOfListItem = true;
					tokenizer.write(stream);
					if (current._isInFirstContentOfListItem) tokenizer._gfmTasklistFirstContentOfListItem = void 0;
				}
				previous = current;
				current = current.next;
			}
			current = token;
			while (++index < childEvents.length) if (childEvents[index][0] === "exit" && childEvents[index - 1][0] === "enter" && childEvents[index][1].type === childEvents[index - 1][1].type && childEvents[index][1].start.line !== childEvents[index][1].end.line) {
				start = index + 1;
				breaks.push(start);
				current._tokenizer = void 0;
				current.previous = void 0;
				current = current.next;
			}
			tokenizer.events = [];
			if (current) {
				current._tokenizer = void 0;
				current.previous = void 0;
			} else breaks.pop();
			index = breaks.length;
			while (index--) {
				const slice = childEvents.slice(breaks[index], breaks[index + 1]);
				const start = startPositions.pop();
				jumps.push([start, start + slice.length - 1]);
				events.splice(start, 2, slice);
			}
			jumps.reverse();
			index = -1;
			while (++index < jumps.length) {
				gaps[adjust + jumps[index][0]] = adjust + jumps[index][1];
				adjust += jumps[index][1] - jumps[index][0] - 1;
			}
			return gaps;
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/content.js
		/**
		* @import {
		*   Construct,
		*   Resolver,
		*   State,
		*   TokenizeContext,
		*   Tokenizer,
		*   Token
		* } from 'micromark-util-types'
		*/
		/**
		* No name because it must not be turned off.
		* @type {Construct}
		*/
		const content = {
			resolve: resolveContent,
			tokenize: tokenizeContent
		};
		/** @type {Construct} */
		const continuationConstruct = {
			partial: true,
			tokenize: tokenizeContinuation
		};
		/**
		* Content is transparent: it’s parsed right now. That way, definitions are also
		* parsed right now: before text in paragraphs (specifically, media) are parsed.
		*
		* @type {Resolver}
		*/
		function resolveContent(events) {
			subtokenize(events);
			return events;
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeContent(effects, ok) {
			/** @type {Token | undefined} */
			let previous;
			return chunkStart;
			/**
			* Before a content chunk.
			*
			* ```markdown
			* > | abc
			*     ^
			* ```
			*
			* @type {State}
			*/
			function chunkStart(code) {
				effects.enter("content");
				previous = effects.enter("chunkContent", { contentType: "content" });
				return chunkInside(code);
			}
			/**
			* In a content chunk.
			*
			* ```markdown
			* > | abc
			*     ^^^
			* ```
			*
			* @type {State}
			*/
			function chunkInside(code) {
				if (code === null) return contentEnd(code);
				if (markdownLineEnding(code)) return effects.check(continuationConstruct, contentContinue, contentEnd)(code);
				effects.consume(code);
				return chunkInside;
			}
			/**
			*
			*
			* @type {State}
			*/
			function contentEnd(code) {
				effects.exit("chunkContent");
				effects.exit("content");
				return ok(code);
			}
			/**
			*
			*
			* @type {State}
			*/
			function contentContinue(code) {
				effects.consume(code);
				effects.exit("chunkContent");
				previous.next = effects.enter("chunkContent", {
					contentType: "content",
					previous
				});
				previous = previous.next;
				return chunkInside;
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeContinuation(effects, ok, nok) {
			const self = this;
			return startLookahead;
			/**
			*
			*
			* @type {State}
			*/
			function startLookahead(code) {
				effects.exit("chunkContent");
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return factorySpace(effects, prefixed, "linePrefix");
			}
			/**
			*
			*
			* @type {State}
			*/
			function prefixed(code) {
				if (code === null || markdownLineEnding(code)) return nok(code);
				const tail = self.events[self.events.length - 1];
				if (!self.parser.constructs.disable.null.includes("codeIndented") && tail && tail[1].type === "linePrefix" && tail[2].sliceSerialize(tail[1], true).length >= 4) return ok(code);
				return effects.interrupt(self.parser.constructs.flow, nok, ok)(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-factory-destination/index.js
		/**
		* @import {Effects, State, TokenType} from 'micromark-util-types'
		*/
		/**
		* Parse destinations.
		*
		* ###### Examples
		*
		* ```markdown
		* <a>
		* <a\>b>
		* <a b>
		* <a)>
		* a
		* a\)b
		* a(b)c
		* a(b)
		* ```
		*
		* @param {Effects} effects
		*   Context.
		* @param {State} ok
		*   State switched to when successful.
		* @param {State} nok
		*   State switched to when unsuccessful.
		* @param {TokenType} type
		*   Type for whole (`<a>` or `b`).
		* @param {TokenType} literalType
		*   Type when enclosed (`<a>`).
		* @param {TokenType} literalMarkerType
		*   Type for enclosing (`<` and `>`).
		* @param {TokenType} rawType
		*   Type when not enclosed (`b`).
		* @param {TokenType} stringType
		*   Type for the value (`a` or `b`).
		* @param {number | undefined} [max=Infinity]
		*   Depth of nested parens (inclusive).
		* @returns {State}
		*   Start state.
		*/
		function factoryDestination(effects, ok, nok, type, literalType, literalMarkerType, rawType, stringType, max) {
			const limit = max || Number.POSITIVE_INFINITY;
			let balance = 0;
			return start;
			/**
			* Start of destination.
			*
			* ```markdown
			* > | <aa>
			*     ^
			* > | aa
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				if (code === 60) {
					effects.enter(type);
					effects.enter(literalType);
					effects.enter(literalMarkerType);
					effects.consume(code);
					effects.exit(literalMarkerType);
					return enclosedBefore;
				}
				if (code === null || code === 32 || code === 41 || asciiControl(code)) return nok(code);
				effects.enter(type);
				effects.enter(rawType);
				effects.enter(stringType);
				effects.enter("chunkString", { contentType: "string" });
				return raw(code);
			}
			/**
			* After `<`, at an enclosed destination.
			*
			* ```markdown
			* > | <aa>
			*      ^
			* ```
			*
			* @type {State}
			*/
			function enclosedBefore(code) {
				if (code === 62) {
					effects.enter(literalMarkerType);
					effects.consume(code);
					effects.exit(literalMarkerType);
					effects.exit(literalType);
					effects.exit(type);
					return ok;
				}
				effects.enter(stringType);
				effects.enter("chunkString", { contentType: "string" });
				return enclosed(code);
			}
			/**
			* In enclosed destination.
			*
			* ```markdown
			* > | <aa>
			*      ^
			* ```
			*
			* @type {State}
			*/
			function enclosed(code) {
				if (code === 62) {
					effects.exit("chunkString");
					effects.exit(stringType);
					return enclosedBefore(code);
				}
				if (code === null || code === 60 || markdownLineEnding(code)) return nok(code);
				effects.consume(code);
				return code === 92 ? enclosedEscape : enclosed;
			}
			/**
			* After `\`, at a special character.
			*
			* ```markdown
			* > | <a\*a>
			*        ^
			* ```
			*
			* @type {State}
			*/
			function enclosedEscape(code) {
				if (code === 60 || code === 62 || code === 92) {
					effects.consume(code);
					return enclosed;
				}
				return enclosed(code);
			}
			/**
			* In raw destination.
			*
			* ```markdown
			* > | aa
			*     ^
			* ```
			*
			* @type {State}
			*/
			function raw(code) {
				if (!balance && (code === null || code === 41 || markdownLineEndingOrSpace(code))) {
					effects.exit("chunkString");
					effects.exit(stringType);
					effects.exit(rawType);
					effects.exit(type);
					return ok(code);
				}
				if (balance < limit && code === 40) {
					effects.consume(code);
					balance++;
					return raw;
				}
				if (code === 41) {
					effects.consume(code);
					balance--;
					return raw;
				}
				if (code === null || code === 32 || code === 40 || asciiControl(code)) return nok(code);
				effects.consume(code);
				return code === 92 ? rawEscape : raw;
			}
			/**
			* After `\`, at special character.
			*
			* ```markdown
			* > | a\*a
			*       ^
			* ```
			*
			* @type {State}
			*/
			function rawEscape(code) {
				if (code === 40 || code === 41 || code === 92) {
					effects.consume(code);
					return raw;
				}
				return raw(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-factory-label/index.js
		/**
		* @import {
		*   Effects,
		*   State,
		*   TokenizeContext,
		*   TokenType
		* } from 'micromark-util-types'
		*/
		/**
		* Parse labels.
		*
		* > 👉 **Note**: labels in markdown are capped at 999 characters in the string.
		*
		* ###### Examples
		*
		* ```markdown
		* [a]
		* [a
		* b]
		* [a\]b]
		* ```
		*
		* @this {TokenizeContext}
		*   Tokenize context.
		* @param {Effects} effects
		*   Context.
		* @param {State} ok
		*   State switched to when successful.
		* @param {State} nok
		*   State switched to when unsuccessful.
		* @param {TokenType} type
		*   Type of the whole label (`[a]`).
		* @param {TokenType} markerType
		*   Type for the markers (`[` and `]`).
		* @param {TokenType} stringType
		*   Type for the identifier (`a`).
		* @returns {State}
		*   Start state.
		*/
		function factoryLabel(effects, ok, nok, type, markerType, stringType) {
			const self = this;
			let size = 0;
			/** @type {boolean} */
			let seen;
			return start;
			/**
			* Start of label.
			*
			* ```markdown
			* > | [a]
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter(type);
				effects.enter(markerType);
				effects.consume(code);
				effects.exit(markerType);
				effects.enter(stringType);
				return atBreak;
			}
			/**
			* In label, at something, before something else.
			*
			* ```markdown
			* > | [a]
			*      ^
			* ```
			*
			* @type {State}
			*/
			function atBreak(code) {
				if (size > 999 || code === null || code === 91 || code === 93 && !seen || code === 94 && !size && "_hiddenFootnoteSupport" in self.parser.constructs) return nok(code);
				if (code === 93) {
					effects.exit(stringType);
					effects.enter(markerType);
					effects.consume(code);
					effects.exit(markerType);
					effects.exit(type);
					return ok;
				}
				if (markdownLineEnding(code)) {
					effects.enter("lineEnding");
					effects.consume(code);
					effects.exit("lineEnding");
					return atBreak;
				}
				effects.enter("chunkString", { contentType: "string" });
				return labelInside(code);
			}
			/**
			* In label, in text.
			*
			* ```markdown
			* > | [a]
			*      ^
			* ```
			*
			* @type {State}
			*/
			function labelInside(code) {
				if (code === null || code === 91 || code === 93 || markdownLineEnding(code) || size++ > 999) {
					effects.exit("chunkString");
					return atBreak(code);
				}
				effects.consume(code);
				if (!seen) seen = !markdownSpace(code);
				return code === 92 ? labelEscape : labelInside;
			}
			/**
			* After `\`, at a special character.
			*
			* ```markdown
			* > | [a\*a]
			*        ^
			* ```
			*
			* @type {State}
			*/
			function labelEscape(code) {
				if (code === 91 || code === 92 || code === 93) {
					effects.consume(code);
					size++;
					return labelInside;
				}
				return labelInside(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-factory-title/index.js
		/**
		* @import {
		*   Code,
		*   Effects,
		*   State,
		*   TokenType
		* } from 'micromark-util-types'
		*/
		/**
		* Parse titles.
		*
		* ###### Examples
		*
		* ```markdown
		* "a"
		* 'b'
		* (c)
		* "a
		* b"
		* 'a
		*     b'
		* (a\)b)
		* ```
		*
		* @param {Effects} effects
		*   Context.
		* @param {State} ok
		*   State switched to when successful.
		* @param {State} nok
		*   State switched to when unsuccessful.
		* @param {TokenType} type
		*   Type of the whole title (`"a"`, `'b'`, `(c)`).
		* @param {TokenType} markerType
		*   Type for the markers (`"`, `'`, `(`, and `)`).
		* @param {TokenType} stringType
		*   Type for the value (`a`).
		* @returns {State}
		*   Start state.
		*/
		function factoryTitle(effects, ok, nok, type, markerType, stringType) {
			/** @type {NonNullable<Code>} */
			let marker;
			return start;
			/**
			* Start of title.
			*
			* ```markdown
			* > | "a"
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				if (code === 34 || code === 39 || code === 40) {
					effects.enter(type);
					effects.enter(markerType);
					effects.consume(code);
					effects.exit(markerType);
					marker = code === 40 ? 41 : code;
					return begin;
				}
				return nok(code);
			}
			/**
			* After opening marker.
			*
			* This is also used at the closing marker.
			*
			* ```markdown
			* > | "a"
			*      ^
			* ```
			*
			* @type {State}
			*/
			function begin(code) {
				if (code === marker) {
					effects.enter(markerType);
					effects.consume(code);
					effects.exit(markerType);
					effects.exit(type);
					return ok;
				}
				effects.enter(stringType);
				return atBreak(code);
			}
			/**
			* At something, before something else.
			*
			* ```markdown
			* > | "a"
			*      ^
			* ```
			*
			* @type {State}
			*/
			function atBreak(code) {
				if (code === marker) {
					effects.exit(stringType);
					return begin(marker);
				}
				if (code === null) return nok(code);
				if (markdownLineEnding(code)) {
					effects.enter("lineEnding");
					effects.consume(code);
					effects.exit("lineEnding");
					return factorySpace(effects, atBreak, "linePrefix");
				}
				effects.enter("chunkString", { contentType: "string" });
				return inside(code);
			}
			/**
			*
			*
			* @type {State}
			*/
			function inside(code) {
				if (code === marker || code === null || markdownLineEnding(code)) {
					effects.exit("chunkString");
					return atBreak(code);
				}
				effects.consume(code);
				return code === 92 ? escape : inside;
			}
			/**
			* After `\`, at a special character.
			*
			* ```markdown
			* > | "a\*b"
			*      ^
			* ```
			*
			* @type {State}
			*/
			function escape(code) {
				if (code === marker || code === 92) {
					effects.consume(code);
					return inside;
				}
				return inside(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-factory-whitespace/index.js
		/**
		* @import {Effects, State} from 'micromark-util-types'
		*/
		/**
		* Parse spaces and tabs.
		*
		* There is no `nok` parameter:
		*
		* *   line endings or spaces in markdown are often optional, in which case this
		*     factory can be used and `ok` will be switched to whether spaces were found
		*     or not
		* *   one line ending or space can be detected with
		*     `markdownLineEndingOrSpace(code)` right before using `factoryWhitespace`
		*
		* @param {Effects} effects
		*   Context.
		* @param {State} ok
		*   State switched to when successful.
		* @returns {State}
		*   Start state.
		*/
		function factoryWhitespace(effects, ok) {
			/** @type {boolean} */
			let seen;
			return start;
			/** @type {State} */
			function start(code) {
				if (markdownLineEnding(code)) {
					effects.enter("lineEnding");
					effects.consume(code);
					effects.exit("lineEnding");
					seen = true;
					return start;
				}
				if (markdownSpace(code)) return factorySpace(effects, start, seen ? "linePrefix" : "lineSuffix")(code);
				return ok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/definition.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const definition$1 = {
			name: "definition",
			tokenize: tokenizeDefinition
		};
		/** @type {Construct} */
		const titleBefore = {
			partial: true,
			tokenize: tokenizeTitleBefore
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeDefinition(effects, ok, nok) {
			const self = this;
			/** @type {string} */
			let identifier;
			return start;
			/**
			* At start of a definition.
			*
			* ```markdown
			* > | [a]: b "c"
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("definition");
				return before(code);
			}
			/**
			* After optional whitespace, at `[`.
			*
			* ```markdown
			* > | [a]: b "c"
			*     ^
			* ```
			*
			* @type {State}
			*/
			function before(code) {
				return factoryLabel.call(self, effects, labelAfter, nok, "definitionLabel", "definitionLabelMarker", "definitionLabelString")(code);
			}
			/**
			* After label.
			*
			* ```markdown
			* > | [a]: b "c"
			*        ^
			* ```
			*
			* @type {State}
			*/
			function labelAfter(code) {
				identifier = normalizeIdentifier(self.sliceSerialize(self.events[self.events.length - 1][1]).slice(1, -1));
				if (code === 58) {
					effects.enter("definitionMarker");
					effects.consume(code);
					effects.exit("definitionMarker");
					return markerAfter;
				}
				return nok(code);
			}
			/**
			* After marker.
			*
			* ```markdown
			* > | [a]: b "c"
			*         ^
			* ```
			*
			* @type {State}
			*/
			function markerAfter(code) {
				return markdownLineEndingOrSpace(code) ? factoryWhitespace(effects, destinationBefore)(code) : destinationBefore(code);
			}
			/**
			* Before destination.
			*
			* ```markdown
			* > | [a]: b "c"
			*          ^
			* ```
			*
			* @type {State}
			*/
			function destinationBefore(code) {
				return factoryDestination(effects, destinationAfter, nok, "definitionDestination", "definitionDestinationLiteral", "definitionDestinationLiteralMarker", "definitionDestinationRaw", "definitionDestinationString")(code);
			}
			/**
			* After destination.
			*
			* ```markdown
			* > | [a]: b "c"
			*           ^
			* ```
			*
			* @type {State}
			*/
			function destinationAfter(code) {
				return effects.attempt(titleBefore, after, after)(code);
			}
			/**
			* After definition.
			*
			* ```markdown
			* > | [a]: b
			*           ^
			* > | [a]: b "c"
			*               ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				return markdownSpace(code) ? factorySpace(effects, afterWhitespace, "whitespace")(code) : afterWhitespace(code);
			}
			/**
			* After definition, after optional whitespace.
			*
			* ```markdown
			* > | [a]: b
			*           ^
			* > | [a]: b "c"
			*               ^
			* ```
			*
			* @type {State}
			*/
			function afterWhitespace(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("definition");
					self.parser.defined.push(identifier);
					return ok(code);
				}
				return nok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeTitleBefore(effects, ok, nok) {
			return titleBefore;
			/**
			* After destination, at whitespace.
			*
			* ```markdown
			* > | [a]: b
			*           ^
			* > | [a]: b "c"
			*           ^
			* ```
			*
			* @type {State}
			*/
			function titleBefore(code) {
				return markdownLineEndingOrSpace(code) ? factoryWhitespace(effects, beforeMarker)(code) : nok(code);
			}
			/**
			* At title.
			*
			* ```markdown
			*   | [a]: b
			* > | "c"
			*     ^
			* ```
			*
			* @type {State}
			*/
			function beforeMarker(code) {
				return factoryTitle(effects, titleAfter, nok, "definitionTitle", "definitionTitleMarker", "definitionTitleString")(code);
			}
			/**
			* After title.
			*
			* ```markdown
			* > | [a]: b "c"
			*               ^
			* ```
			*
			* @type {State}
			*/
			function titleAfter(code) {
				return markdownSpace(code) ? factorySpace(effects, titleAfterOptionalWhitespace, "whitespace")(code) : titleAfterOptionalWhitespace(code);
			}
			/**
			* After title, after optional whitespace.
			*
			* ```markdown
			* > | [a]: b "c"
			*               ^
			* ```
			*
			* @type {State}
			*/
			function titleAfterOptionalWhitespace(code) {
				return code === null || markdownLineEnding(code) ? ok(code) : nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/hard-break-escape.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const hardBreakEscape = {
			name: "hardBreakEscape",
			tokenize: tokenizeHardBreakEscape
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeHardBreakEscape(effects, ok, nok) {
			return start;
			/**
			* Start of a hard break (escape).
			*
			* ```markdown
			* > | a\
			*      ^
			*   | b
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("hardBreakEscape");
				effects.consume(code);
				return after;
			}
			/**
			* After `\`, at eol.
			*
			* ```markdown
			* > | a\
			*       ^
			*   | b
			* ```
			*
			*  @type {State}
			*/
			function after(code) {
				if (markdownLineEnding(code)) {
					effects.exit("hardBreakEscape");
					return ok(code);
				}
				return nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/heading-atx.js
		/**
		* @import {
		*   Construct,
		*   Resolver,
		*   State,
		*   TokenizeContext,
		*   Tokenizer,
		*   Token
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const headingAtx = {
			name: "headingAtx",
			resolve: resolveHeadingAtx,
			tokenize: tokenizeHeadingAtx
		};
		/** @type {Resolver} */
		function resolveHeadingAtx(events, context) {
			let contentEnd = events.length - 2;
			let contentStart = 3;
			if (events[contentStart][1].type === "whitespace") contentStart += 2;
			if (contentEnd - 2 > contentStart && events[contentEnd][1].type === "whitespace") contentEnd -= 2;
			if (events[contentEnd][1].type === "atxHeadingSequence" && (contentStart === contentEnd - 1 || contentEnd - 4 > contentStart && events[contentEnd - 2][1].type === "whitespace")) contentEnd -= contentStart + 1 === contentEnd ? 2 : 4;
			if (contentEnd > contentStart) {
				const content = {
					type: "atxHeadingText",
					start: events[contentStart][1].start,
					end: events[contentEnd][1].end
				};
				const text = {
					type: "chunkText",
					start: events[contentStart][1].start,
					end: events[contentEnd][1].end,
					contentType: "text"
				};
				splice(events, contentStart, contentEnd - contentStart + 1, [
					[
						"enter",
						content,
						context
					],
					[
						"enter",
						text,
						context
					],
					[
						"exit",
						text,
						context
					],
					[
						"exit",
						content,
						context
					]
				]);
			}
			return events;
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeHeadingAtx(effects, ok, nok) {
			let size = 0;
			return start;
			/**
			* Start of a heading (atx).
			*
			* ```markdown
			* > | ## aa
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("atxHeading");
				return before(code);
			}
			/**
			* After optional whitespace, at `#`.
			*
			* ```markdown
			* > | ## aa
			*     ^
			* ```
			*
			* @type {State}
			*/
			function before(code) {
				effects.enter("atxHeadingSequence");
				return sequenceOpen(code);
			}
			/**
			* In opening sequence.
			*
			* ```markdown
			* > | ## aa
			*     ^
			* ```
			*
			* @type {State}
			*/
			function sequenceOpen(code) {
				if (code === 35 && size++ < 6) {
					effects.consume(code);
					return sequenceOpen;
				}
				if (code === null || markdownLineEndingOrSpace(code)) {
					effects.exit("atxHeadingSequence");
					return atBreak(code);
				}
				return nok(code);
			}
			/**
			* After something, before something else.
			*
			* ```markdown
			* > | ## aa
			*       ^
			* ```
			*
			* @type {State}
			*/
			function atBreak(code) {
				if (code === 35) {
					effects.enter("atxHeadingSequence");
					return sequenceFurther(code);
				}
				if (code === null || markdownLineEnding(code)) {
					effects.exit("atxHeading");
					return ok(code);
				}
				if (markdownSpace(code)) return factorySpace(effects, atBreak, "whitespace")(code);
				effects.enter("atxHeadingText");
				return data(code);
			}
			/**
			* In further sequence (after whitespace).
			*
			* Could be normal “visible” hashes in the heading or a final sequence.
			*
			* ```markdown
			* > | ## aa ##
			*           ^
			* ```
			*
			* @type {State}
			*/
			function sequenceFurther(code) {
				if (code === 35) {
					effects.consume(code);
					return sequenceFurther;
				}
				effects.exit("atxHeadingSequence");
				return atBreak(code);
			}
			/**
			* In text.
			*
			* ```markdown
			* > | ## aa
			*        ^
			* ```
			*
			* @type {State}
			*/
			function data(code) {
				if (code === null || code === 35 || markdownLineEndingOrSpace(code)) {
					effects.exit("atxHeadingText");
					return atBreak(code);
				}
				effects.consume(code);
				return data;
			}
		}
		//#endregion
		//#region node_modules/micromark-util-html-tag-name/index.js
		/**
		* List of lowercase HTML “block” tag names.
		*
		* The list, when parsing HTML (flow), results in more relaxed rules (condition
		* 6).
		* Because they are known blocks, the HTML-like syntax doesn’t have to be
		* strictly parsed.
		* For tag names not in this list, a more strict algorithm (condition 7) is used
		* to detect whether the HTML-like syntax is seen as HTML (flow) or not.
		*
		* This is copied from:
		* <https://spec.commonmark.org/0.30/#html-blocks>.
		*
		* > 👉 **Note**: `search` was added in `CommonMark@0.31`.
		*/
		const htmlBlockNames = [
			"address",
			"article",
			"aside",
			"base",
			"basefont",
			"blockquote",
			"body",
			"caption",
			"center",
			"col",
			"colgroup",
			"dd",
			"details",
			"dialog",
			"dir",
			"div",
			"dl",
			"dt",
			"fieldset",
			"figcaption",
			"figure",
			"footer",
			"form",
			"frame",
			"frameset",
			"h1",
			"h2",
			"h3",
			"h4",
			"h5",
			"h6",
			"head",
			"header",
			"hr",
			"html",
			"iframe",
			"legend",
			"li",
			"link",
			"main",
			"menu",
			"menuitem",
			"nav",
			"noframes",
			"ol",
			"optgroup",
			"option",
			"p",
			"param",
			"search",
			"section",
			"summary",
			"table",
			"tbody",
			"td",
			"tfoot",
			"th",
			"thead",
			"title",
			"tr",
			"track",
			"ul"
		];
		/**
		* List of lowercase HTML “raw” tag names.
		*
		* The list, when parsing HTML (flow), results in HTML that can include lines
		* without exiting, until a closing tag also in this list is found (condition
		* 1).
		*
		* This module is copied from:
		* <https://spec.commonmark.org/0.30/#html-blocks>.
		*
		* > 👉 **Note**: `textarea` was added in `CommonMark@0.30`.
		*/
		const htmlRawNames = [
			"pre",
			"script",
			"style",
			"textarea"
		];
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/html-flow.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   Resolver,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const htmlFlow = {
			concrete: true,
			name: "htmlFlow",
			resolveTo: resolveToHtmlFlow,
			tokenize: tokenizeHtmlFlow
		};
		/** @type {Construct} */
		const blankLineBefore = {
			partial: true,
			tokenize: tokenizeBlankLineBefore
		};
		/** @type {Resolver} */
		function resolveToHtmlFlow(events) {
			let index = events.length;
			while (index--) if (events[index][0] === "enter" && events[index][1].type === "htmlFlow") break;
			if (index > 1 && events[index - 2][1].type === "linePrefix") {
				events[index][1].start = events[index - 2][1].start;
				events[index + 1][1].start = events[index - 2][1].start;
				events.splice(index - 2, 2);
			}
			return events;
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeHtmlFlow(effects, ok, nok) {
			const self = this;
			/** @type {number} */
			let marker;
			/** @type {boolean} */
			let closingTag;
			/** @type {string} */
			let buffer;
			/** @type {number} */
			let index;
			/** @type {Code} */
			let markerB;
			return start;
			/**
			* Start of HTML (flow).
			*
			* ```markdown
			* > | <x />
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				return before(code);
			}
			/**
			* At `<`, after optional whitespace.
			*
			* ```markdown
			* > | <x />
			*     ^
			* ```
			*
			* @type {State}
			*/
			function before(code) {
				effects.enter("htmlFlow");
				effects.enter("htmlFlowData");
				effects.consume(code);
				return open;
			}
			/**
			* After `<`, at tag name or other stuff.
			*
			* ```markdown
			* > | <x />
			*      ^
			* > | <!doctype>
			*      ^
			* > | <!--xxx-->
			*      ^
			* ```
			*
			* @type {State}
			*/
			function open(code) {
				if (code === 33) {
					effects.consume(code);
					return declarationOpen;
				}
				if (code === 47) {
					effects.consume(code);
					closingTag = true;
					return tagCloseStart;
				}
				if (code === 63) {
					effects.consume(code);
					marker = 3;
					return self.interrupt ? ok : continuationDeclarationInside;
				}
				if (asciiAlpha(code)) {
					effects.consume(code);
					buffer = String.fromCharCode(code);
					return tagName;
				}
				return nok(code);
			}
			/**
			* After `<!`, at declaration, comment, or CDATA.
			*
			* ```markdown
			* > | <!doctype>
			*       ^
			* > | <!--xxx-->
			*       ^
			* > | <![CDATA[>&<]]>
			*       ^
			* ```
			*
			* @type {State}
			*/
			function declarationOpen(code) {
				if (code === 45) {
					effects.consume(code);
					marker = 2;
					return commentOpenInside;
				}
				if (code === 91) {
					effects.consume(code);
					marker = 5;
					index = 0;
					return cdataOpenInside;
				}
				if (asciiAlpha(code)) {
					effects.consume(code);
					marker = 4;
					return self.interrupt ? ok : continuationDeclarationInside;
				}
				return nok(code);
			}
			/**
			* After `<!-`, inside a comment, at another `-`.
			*
			* ```markdown
			* > | <!--xxx-->
			*        ^
			* ```
			*
			* @type {State}
			*/
			function commentOpenInside(code) {
				if (code === 45) {
					effects.consume(code);
					return self.interrupt ? ok : continuationDeclarationInside;
				}
				return nok(code);
			}
			/**
			* After `<![`, inside CDATA, expecting `CDATA[`.
			*
			* ```markdown
			* > | <![CDATA[>&<]]>
			*        ^^^^^^
			* ```
			*
			* @type {State}
			*/
			function cdataOpenInside(code) {
				if (code === "CDATA[".charCodeAt(index++)) {
					effects.consume(code);
					if (index === 6) return self.interrupt ? ok : continuation;
					return cdataOpenInside;
				}
				return nok(code);
			}
			/**
			* After `</`, in closing tag, at tag name.
			*
			* ```markdown
			* > | </x>
			*       ^
			* ```
			*
			* @type {State}
			*/
			function tagCloseStart(code) {
				if (asciiAlpha(code)) {
					effects.consume(code);
					buffer = String.fromCharCode(code);
					return tagName;
				}
				return nok(code);
			}
			/**
			* In tag name.
			*
			* ```markdown
			* > | <ab>
			*      ^^
			* > | </ab>
			*       ^^
			* ```
			*
			* @type {State}
			*/
			function tagName(code) {
				if (code === null || code === 47 || code === 62 || markdownLineEndingOrSpace(code)) {
					const slash = code === 47;
					const name = buffer.toLowerCase();
					if (!slash && !closingTag && htmlRawNames.includes(name)) {
						marker = 1;
						return self.interrupt ? ok(code) : continuation(code);
					}
					if (htmlBlockNames.includes(buffer.toLowerCase())) {
						marker = 6;
						if (slash) {
							effects.consume(code);
							return basicSelfClosing;
						}
						return self.interrupt ? ok(code) : continuation(code);
					}
					marker = 7;
					return self.interrupt && !self.parser.lazy[self.now().line] ? nok(code) : closingTag ? completeClosingTagAfter(code) : completeAttributeNameBefore(code);
				}
				if (code === 45 || asciiAlphanumeric(code)) {
					effects.consume(code);
					buffer += String.fromCharCode(code);
					return tagName;
				}
				return nok(code);
			}
			/**
			* After closing slash of a basic tag name.
			*
			* ```markdown
			* > | <div/>
			*          ^
			* ```
			*
			* @type {State}
			*/
			function basicSelfClosing(code) {
				if (code === 62) {
					effects.consume(code);
					return self.interrupt ? ok : continuation;
				}
				return nok(code);
			}
			/**
			* After closing slash of a complete tag name.
			*
			* ```markdown
			* > | <x/>
			*        ^
			* ```
			*
			* @type {State}
			*/
			function completeClosingTagAfter(code) {
				if (markdownSpace(code)) {
					effects.consume(code);
					return completeClosingTagAfter;
				}
				return completeEnd(code);
			}
			/**
			* At an attribute name.
			*
			* At first, this state is used after a complete tag name, after whitespace,
			* where it expects optional attributes or the end of the tag.
			* It is also reused after attributes, when expecting more optional
			* attributes.
			*
			* ```markdown
			* > | <a />
			*        ^
			* > | <a :b>
			*        ^
			* > | <a _b>
			*        ^
			* > | <a b>
			*        ^
			* > | <a >
			*        ^
			* ```
			*
			* @type {State}
			*/
			function completeAttributeNameBefore(code) {
				if (code === 47) {
					effects.consume(code);
					return completeEnd;
				}
				if (code === 58 || code === 95 || asciiAlpha(code)) {
					effects.consume(code);
					return completeAttributeName;
				}
				if (markdownSpace(code)) {
					effects.consume(code);
					return completeAttributeNameBefore;
				}
				return completeEnd(code);
			}
			/**
			* In attribute name.
			*
			* ```markdown
			* > | <a :b>
			*         ^
			* > | <a _b>
			*         ^
			* > | <a b>
			*         ^
			* ```
			*
			* @type {State}
			*/
			function completeAttributeName(code) {
				if (code === 45 || code === 46 || code === 58 || code === 95 || asciiAlphanumeric(code)) {
					effects.consume(code);
					return completeAttributeName;
				}
				return completeAttributeNameAfter(code);
			}
			/**
			* After attribute name, at an optional initializer, the end of the tag, or
			* whitespace.
			*
			* ```markdown
			* > | <a b>
			*         ^
			* > | <a b=c>
			*         ^
			* ```
			*
			* @type {State}
			*/
			function completeAttributeNameAfter(code) {
				if (code === 61) {
					effects.consume(code);
					return completeAttributeValueBefore;
				}
				if (markdownSpace(code)) {
					effects.consume(code);
					return completeAttributeNameAfter;
				}
				return completeAttributeNameBefore(code);
			}
			/**
			* Before unquoted, double quoted, or single quoted attribute value, allowing
			* whitespace.
			*
			* ```markdown
			* > | <a b=c>
			*          ^
			* > | <a b="c">
			*          ^
			* ```
			*
			* @type {State}
			*/
			function completeAttributeValueBefore(code) {
				if (code === null || code === 60 || code === 61 || code === 62 || code === 96) return nok(code);
				if (code === 34 || code === 39) {
					effects.consume(code);
					markerB = code;
					return completeAttributeValueQuoted;
				}
				if (markdownSpace(code)) {
					effects.consume(code);
					return completeAttributeValueBefore;
				}
				return completeAttributeValueUnquoted(code);
			}
			/**
			* In double or single quoted attribute value.
			*
			* ```markdown
			* > | <a b="c">
			*           ^
			* > | <a b='c'>
			*           ^
			* ```
			*
			* @type {State}
			*/
			function completeAttributeValueQuoted(code) {
				if (code === markerB) {
					effects.consume(code);
					markerB = null;
					return completeAttributeValueQuotedAfter;
				}
				if (code === null || markdownLineEnding(code)) return nok(code);
				effects.consume(code);
				return completeAttributeValueQuoted;
			}
			/**
			* In unquoted attribute value.
			*
			* ```markdown
			* > | <a b=c>
			*          ^
			* ```
			*
			* @type {State}
			*/
			function completeAttributeValueUnquoted(code) {
				if (code === null || code === 34 || code === 39 || code === 47 || code === 60 || code === 61 || code === 62 || code === 96 || markdownLineEndingOrSpace(code)) return completeAttributeNameAfter(code);
				effects.consume(code);
				return completeAttributeValueUnquoted;
			}
			/**
			* After double or single quoted attribute value, before whitespace or the
			* end of the tag.
			*
			* ```markdown
			* > | <a b="c">
			*            ^
			* ```
			*
			* @type {State}
			*/
			function completeAttributeValueQuotedAfter(code) {
				if (code === 47 || code === 62 || markdownSpace(code)) return completeAttributeNameBefore(code);
				return nok(code);
			}
			/**
			* In certain circumstances of a complete tag where only an `>` is allowed.
			*
			* ```markdown
			* > | <a b="c">
			*             ^
			* ```
			*
			* @type {State}
			*/
			function completeEnd(code) {
				if (code === 62) {
					effects.consume(code);
					return completeAfter;
				}
				return nok(code);
			}
			/**
			* After `>` in a complete tag.
			*
			* ```markdown
			* > | <x>
			*        ^
			* ```
			*
			* @type {State}
			*/
			function completeAfter(code) {
				if (code === null || markdownLineEnding(code)) return continuation(code);
				if (markdownSpace(code)) {
					effects.consume(code);
					return completeAfter;
				}
				return nok(code);
			}
			/**
			* In continuation of any HTML kind.
			*
			* ```markdown
			* > | <!--xxx-->
			*          ^
			* ```
			*
			* @type {State}
			*/
			function continuation(code) {
				if (code === 45 && marker === 2) {
					effects.consume(code);
					return continuationCommentInside;
				}
				if (code === 60 && marker === 1) {
					effects.consume(code);
					return continuationRawTagOpen;
				}
				if (code === 62 && marker === 4) {
					effects.consume(code);
					return continuationClose;
				}
				if (code === 63 && marker === 3) {
					effects.consume(code);
					return continuationDeclarationInside;
				}
				if (code === 93 && marker === 5) {
					effects.consume(code);
					return continuationCdataInside;
				}
				if (markdownLineEnding(code) && (marker === 6 || marker === 7)) {
					effects.exit("htmlFlowData");
					return effects.check(blankLineBefore, continuationAfter, continuationStart)(code);
				}
				if (code === null || markdownLineEnding(code)) {
					effects.exit("htmlFlowData");
					return continuationStart(code);
				}
				effects.consume(code);
				return continuation;
			}
			/**
			* In continuation, at eol.
			*
			* ```markdown
			* > | <x>
			*        ^
			*   | asd
			* ```
			*
			* @type {State}
			*/
			function continuationStart(code) {
				return effects.check(nonLazyContinuation, continuationStartNonLazy, continuationAfter)(code);
			}
			/**
			* In continuation, at eol, before non-lazy content.
			*
			* ```markdown
			* > | <x>
			*        ^
			*   | asd
			* ```
			*
			* @type {State}
			*/
			function continuationStartNonLazy(code) {
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return continuationBefore;
			}
			/**
			* In continuation, before non-lazy content.
			*
			* ```markdown
			*   | <x>
			* > | asd
			*     ^
			* ```
			*
			* @type {State}
			*/
			function continuationBefore(code) {
				if (code === null || markdownLineEnding(code)) return continuationStart(code);
				effects.enter("htmlFlowData");
				return continuation(code);
			}
			/**
			* In comment continuation, after one `-`, expecting another.
			*
			* ```markdown
			* > | <!--xxx-->
			*             ^
			* ```
			*
			* @type {State}
			*/
			function continuationCommentInside(code) {
				if (code === 45) {
					effects.consume(code);
					return continuationDeclarationInside;
				}
				return continuation(code);
			}
			/**
			* In raw continuation, after `<`, at `/`.
			*
			* ```markdown
			* > | <script>console.log(1)<\/script>
			*                            ^
			* ```
			*
			* @type {State}
			*/
			function continuationRawTagOpen(code) {
				if (code === 47) {
					effects.consume(code);
					buffer = "";
					return continuationRawEndTag;
				}
				return continuation(code);
			}
			/**
			* In raw continuation, after `</`, in a raw tag name.
			*
			* ```markdown
			* > | <script>console.log(1)<\/script>
			*                             ^^^^^^
			* ```
			*
			* @type {State}
			*/
			function continuationRawEndTag(code) {
				if (code === 62) {
					const name = buffer.toLowerCase();
					if (htmlRawNames.includes(name)) {
						effects.consume(code);
						return continuationClose;
					}
					return continuation(code);
				}
				if (asciiAlpha(code) && buffer.length < 8) {
					effects.consume(code);
					buffer += String.fromCharCode(code);
					return continuationRawEndTag;
				}
				return continuation(code);
			}
			/**
			* In cdata continuation, after `]`, expecting `]>`.
			*
			* ```markdown
			* > | <![CDATA[>&<]]>
			*                  ^
			* ```
			*
			* @type {State}
			*/
			function continuationCdataInside(code) {
				if (code === 93) {
					effects.consume(code);
					return continuationDeclarationInside;
				}
				return continuation(code);
			}
			/**
			* In declaration or instruction continuation, at `>`.
			*
			* ```markdown
			* > | <!-->
			*         ^
			* > | <?>
			*       ^
			* > | <!q>
			*        ^
			* > | <!--ab-->
			*             ^
			* > | <![CDATA[>&<]]>
			*                   ^
			* ```
			*
			* @type {State}
			*/
			function continuationDeclarationInside(code) {
				if (code === 62) {
					effects.consume(code);
					return continuationClose;
				}
				if (code === 45 && marker === 2) {
					effects.consume(code);
					return continuationDeclarationInside;
				}
				return continuation(code);
			}
			/**
			* In closed continuation: everything we get until the eol/eof is part of it.
			*
			* ```markdown
			* > | <!doctype>
			*               ^
			* ```
			*
			* @type {State}
			*/
			function continuationClose(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("htmlFlowData");
					return continuationAfter(code);
				}
				effects.consume(code);
				return continuationClose;
			}
			/**
			* Done.
			*
			* ```markdown
			* > | <!doctype>
			*               ^
			* ```
			*
			* @type {State}
			*/
			function continuationAfter(code) {
				effects.exit("htmlFlow");
				return ok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeBlankLineBefore(effects, ok, nok) {
			return start;
			/**
			* Before eol, expecting blank line.
			*
			* ```markdown
			* > | <div>
			*          ^
			*   |
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return effects.attempt(blankLine, ok, nok);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/html-text.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const htmlText = {
			name: "htmlText",
			tokenize: tokenizeHtmlText
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeHtmlText(effects, ok, nok) {
			const self = this;
			/** @type {NonNullable<Code> | undefined} */
			let marker;
			/** @type {number} */
			let index;
			/** @type {State} */
			let returnState;
			return start;
			/**
			* Start of HTML (text).
			*
			* ```markdown
			* > | a <b> c
			*       ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("htmlText");
				effects.enter("htmlTextData");
				effects.consume(code);
				return open;
			}
			/**
			* After `<`, at tag name or other stuff.
			*
			* ```markdown
			* > | a <b> c
			*        ^
			* > | a <!doctype> c
			*        ^
			* > | a <!--b--> c
			*        ^
			* ```
			*
			* @type {State}
			*/
			function open(code) {
				if (code === 33) {
					effects.consume(code);
					return declarationOpen;
				}
				if (code === 47) {
					effects.consume(code);
					return tagCloseStart;
				}
				if (code === 63) {
					effects.consume(code);
					return instruction;
				}
				if (asciiAlpha(code)) {
					effects.consume(code);
					return tagOpen;
				}
				return nok(code);
			}
			/**
			* After `<!`, at declaration, comment, or CDATA.
			*
			* ```markdown
			* > | a <!doctype> c
			*         ^
			* > | a <!--b--> c
			*         ^
			* > | a <![CDATA[>&<]]> c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function declarationOpen(code) {
				if (code === 45) {
					effects.consume(code);
					return commentOpenInside;
				}
				if (code === 91) {
					effects.consume(code);
					index = 0;
					return cdataOpenInside;
				}
				if (asciiAlpha(code)) {
					effects.consume(code);
					return declaration;
				}
				return nok(code);
			}
			/**
			* In a comment, after `<!-`, at another `-`.
			*
			* ```markdown
			* > | a <!--b--> c
			*          ^
			* ```
			*
			* @type {State}
			*/
			function commentOpenInside(code) {
				if (code === 45) {
					effects.consume(code);
					return commentEnd;
				}
				return nok(code);
			}
			/**
			* In comment.
			*
			* ```markdown
			* > | a <!--b--> c
			*           ^
			* ```
			*
			* @type {State}
			*/
			function comment(code) {
				if (code === null) return nok(code);
				if (code === 45) {
					effects.consume(code);
					return commentClose;
				}
				if (markdownLineEnding(code)) {
					returnState = comment;
					return lineEndingBefore(code);
				}
				effects.consume(code);
				return comment;
			}
			/**
			* In comment, after `-`.
			*
			* ```markdown
			* > | a <!--b--> c
			*             ^
			* ```
			*
			* @type {State}
			*/
			function commentClose(code) {
				if (code === 45) {
					effects.consume(code);
					return commentEnd;
				}
				return comment(code);
			}
			/**
			* In comment, after `--`.
			*
			* ```markdown
			* > | a <!--b--> c
			*              ^
			* ```
			*
			* @type {State}
			*/
			function commentEnd(code) {
				return code === 62 ? end(code) : code === 45 ? commentClose(code) : comment(code);
			}
			/**
			* After `<![`, in CDATA, expecting `CDATA[`.
			*
			* ```markdown
			* > | a <![CDATA[>&<]]> b
			*          ^^^^^^
			* ```
			*
			* @type {State}
			*/
			function cdataOpenInside(code) {
				if (code === "CDATA[".charCodeAt(index++)) {
					effects.consume(code);
					return index === 6 ? cdata : cdataOpenInside;
				}
				return nok(code);
			}
			/**
			* In CDATA.
			*
			* ```markdown
			* > | a <![CDATA[>&<]]> b
			*                ^^^
			* ```
			*
			* @type {State}
			*/
			function cdata(code) {
				if (code === null) return nok(code);
				if (code === 93) {
					effects.consume(code);
					return cdataClose;
				}
				if (markdownLineEnding(code)) {
					returnState = cdata;
					return lineEndingBefore(code);
				}
				effects.consume(code);
				return cdata;
			}
			/**
			* In CDATA, after `]`, at another `]`.
			*
			* ```markdown
			* > | a <![CDATA[>&<]]> b
			*                    ^
			* ```
			*
			* @type {State}
			*/
			function cdataClose(code) {
				if (code === 93) {
					effects.consume(code);
					return cdataEnd;
				}
				return cdata(code);
			}
			/**
			* In CDATA, after `]]`, at `>`.
			*
			* ```markdown
			* > | a <![CDATA[>&<]]> b
			*                     ^
			* ```
			*
			* @type {State}
			*/
			function cdataEnd(code) {
				if (code === 62) return end(code);
				if (code === 93) {
					effects.consume(code);
					return cdataEnd;
				}
				return cdata(code);
			}
			/**
			* In declaration.
			*
			* ```markdown
			* > | a <!b> c
			*          ^
			* ```
			*
			* @type {State}
			*/
			function declaration(code) {
				if (code === null || code === 62) return end(code);
				if (markdownLineEnding(code)) {
					returnState = declaration;
					return lineEndingBefore(code);
				}
				effects.consume(code);
				return declaration;
			}
			/**
			* In instruction.
			*
			* ```markdown
			* > | a <?b?> c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function instruction(code) {
				if (code === null) return nok(code);
				if (code === 63) {
					effects.consume(code);
					return instructionClose;
				}
				if (markdownLineEnding(code)) {
					returnState = instruction;
					return lineEndingBefore(code);
				}
				effects.consume(code);
				return instruction;
			}
			/**
			* In instruction, after `?`, at `>`.
			*
			* ```markdown
			* > | a <?b?> c
			*           ^
			* ```
			*
			* @type {State}
			*/
			function instructionClose(code) {
				return code === 62 ? end(code) : instruction(code);
			}
			/**
			* After `</`, in closing tag, at tag name.
			*
			* ```markdown
			* > | a </b> c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function tagCloseStart(code) {
				if (asciiAlpha(code)) {
					effects.consume(code);
					return tagClose;
				}
				return nok(code);
			}
			/**
			* After `</x`, in a tag name.
			*
			* ```markdown
			* > | a </b> c
			*          ^
			* ```
			*
			* @type {State}
			*/
			function tagClose(code) {
				if (code === 45 || asciiAlphanumeric(code)) {
					effects.consume(code);
					return tagClose;
				}
				return tagCloseBetween(code);
			}
			/**
			* In closing tag, after tag name.
			*
			* ```markdown
			* > | a </b> c
			*          ^
			* ```
			*
			* @type {State}
			*/
			function tagCloseBetween(code) {
				if (markdownLineEnding(code)) {
					returnState = tagCloseBetween;
					return lineEndingBefore(code);
				}
				if (markdownSpace(code)) {
					effects.consume(code);
					return tagCloseBetween;
				}
				return end(code);
			}
			/**
			* After `<x`, in opening tag name.
			*
			* ```markdown
			* > | a <b> c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function tagOpen(code) {
				if (code === 45 || asciiAlphanumeric(code)) {
					effects.consume(code);
					return tagOpen;
				}
				if (code === 47 || code === 62 || markdownLineEndingOrSpace(code)) return tagOpenBetween(code);
				return nok(code);
			}
			/**
			* In opening tag, after tag name.
			*
			* ```markdown
			* > | a <b> c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function tagOpenBetween(code) {
				if (code === 47) {
					effects.consume(code);
					return end;
				}
				if (code === 58 || code === 95 || asciiAlpha(code)) {
					effects.consume(code);
					return tagOpenAttributeName;
				}
				if (markdownLineEnding(code)) {
					returnState = tagOpenBetween;
					return lineEndingBefore(code);
				}
				if (markdownSpace(code)) {
					effects.consume(code);
					return tagOpenBetween;
				}
				return end(code);
			}
			/**
			* In attribute name.
			*
			* ```markdown
			* > | a <b c> d
			*          ^
			* ```
			*
			* @type {State}
			*/
			function tagOpenAttributeName(code) {
				if (code === 45 || code === 46 || code === 58 || code === 95 || asciiAlphanumeric(code)) {
					effects.consume(code);
					return tagOpenAttributeName;
				}
				return tagOpenAttributeNameAfter(code);
			}
			/**
			* After attribute name, before initializer, the end of the tag, or
			* whitespace.
			*
			* ```markdown
			* > | a <b c> d
			*           ^
			* ```
			*
			* @type {State}
			*/
			function tagOpenAttributeNameAfter(code) {
				if (code === 61) {
					effects.consume(code);
					return tagOpenAttributeValueBefore;
				}
				if (markdownLineEnding(code)) {
					returnState = tagOpenAttributeNameAfter;
					return lineEndingBefore(code);
				}
				if (markdownSpace(code)) {
					effects.consume(code);
					return tagOpenAttributeNameAfter;
				}
				return tagOpenBetween(code);
			}
			/**
			* Before unquoted, double quoted, or single quoted attribute value, allowing
			* whitespace.
			*
			* ```markdown
			* > | a <b c=d> e
			*            ^
			* ```
			*
			* @type {State}
			*/
			function tagOpenAttributeValueBefore(code) {
				if (code === null || code === 60 || code === 61 || code === 62 || code === 96) return nok(code);
				if (code === 34 || code === 39) {
					effects.consume(code);
					marker = code;
					return tagOpenAttributeValueQuoted;
				}
				if (markdownLineEnding(code)) {
					returnState = tagOpenAttributeValueBefore;
					return lineEndingBefore(code);
				}
				if (markdownSpace(code)) {
					effects.consume(code);
					return tagOpenAttributeValueBefore;
				}
				effects.consume(code);
				return tagOpenAttributeValueUnquoted;
			}
			/**
			* In double or single quoted attribute value.
			*
			* ```markdown
			* > | a <b c="d"> e
			*             ^
			* ```
			*
			* @type {State}
			*/
			function tagOpenAttributeValueQuoted(code) {
				if (code === marker) {
					effects.consume(code);
					marker = void 0;
					return tagOpenAttributeValueQuotedAfter;
				}
				if (code === null) return nok(code);
				if (markdownLineEnding(code)) {
					returnState = tagOpenAttributeValueQuoted;
					return lineEndingBefore(code);
				}
				effects.consume(code);
				return tagOpenAttributeValueQuoted;
			}
			/**
			* In unquoted attribute value.
			*
			* ```markdown
			* > | a <b c=d> e
			*            ^
			* ```
			*
			* @type {State}
			*/
			function tagOpenAttributeValueUnquoted(code) {
				if (code === null || code === 34 || code === 39 || code === 60 || code === 61 || code === 96) return nok(code);
				if (code === 47 || code === 62 || markdownLineEndingOrSpace(code)) return tagOpenBetween(code);
				effects.consume(code);
				return tagOpenAttributeValueUnquoted;
			}
			/**
			* After double or single quoted attribute value, before whitespace or the end
			* of the tag.
			*
			* ```markdown
			* > | a <b c="d"> e
			*               ^
			* ```
			*
			* @type {State}
			*/
			function tagOpenAttributeValueQuotedAfter(code) {
				if (code === 47 || code === 62 || markdownLineEndingOrSpace(code)) return tagOpenBetween(code);
				return nok(code);
			}
			/**
			* In certain circumstances of a tag where only an `>` is allowed.
			*
			* ```markdown
			* > | a <b c="d"> e
			*               ^
			* ```
			*
			* @type {State}
			*/
			function end(code) {
				if (code === 62) {
					effects.consume(code);
					effects.exit("htmlTextData");
					effects.exit("htmlText");
					return ok;
				}
				return nok(code);
			}
			/**
			* At eol.
			*
			* > 👉 **Note**: we can’t have blank lines in text, so no need to worry about
			* > empty tokens.
			*
			* ```markdown
			* > | a <!--a
			*            ^
			*   | b-->
			* ```
			*
			* @type {State}
			*/
			function lineEndingBefore(code) {
				effects.exit("htmlTextData");
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return lineEndingAfter;
			}
			/**
			* After eol, at optional whitespace.
			*
			* > 👉 **Note**: we can’t have blank lines in text, so no need to worry about
			* > empty tokens.
			*
			* ```markdown
			*   | a <!--a
			* > | b-->
			*     ^
			* ```
			*
			* @type {State}
			*/
			function lineEndingAfter(code) {
				return markdownSpace(code) ? factorySpace(effects, lineEndingAfterPrefix, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code) : lineEndingAfterPrefix(code);
			}
			/**
			* After eol, after optional whitespace.
			*
			* > 👉 **Note**: we can’t have blank lines in text, so no need to worry about
			* > empty tokens.
			*
			* ```markdown
			*   | a <!--a
			* > | b-->
			*     ^
			* ```
			*
			* @type {State}
			*/
			function lineEndingAfterPrefix(code) {
				effects.enter("htmlTextData");
				return returnState(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/label-end.js
		/**
		* @import {
		*   Construct,
		*   Event,
		*   Resolver,
		*   State,
		*   TokenizeContext,
		*   Tokenizer,
		*   Token
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const labelEnd = {
			name: "labelEnd",
			resolveAll: resolveAllLabelEnd,
			resolveTo: resolveToLabelEnd,
			tokenize: tokenizeLabelEnd
		};
		/** @type {Construct} */
		const resourceConstruct = { tokenize: tokenizeResource };
		/** @type {Construct} */
		const referenceFullConstruct = { tokenize: tokenizeReferenceFull };
		/** @type {Construct} */
		const referenceCollapsedConstruct = { tokenize: tokenizeReferenceCollapsed };
		/** @type {Resolver} */
		function resolveAllLabelEnd(events) {
			let index = -1;
			/** @type {Array<Event>} */
			const newEvents = [];
			while (++index < events.length) {
				const token = events[index][1];
				newEvents.push(events[index]);
				if (token.type === "labelImage" || token.type === "labelLink" || token.type === "labelEnd") {
					const offset = token.type === "labelImage" ? 4 : 2;
					token.type = "data";
					index += offset;
				}
			}
			if (events.length !== newEvents.length) splice(events, 0, events.length, newEvents);
			return events;
		}
		/** @type {Resolver} */
		function resolveToLabelEnd(events, context) {
			let index = events.length;
			let offset = 0;
			/** @type {number | undefined} */
			let open;
			/** @type {number | undefined} */
			let close;
			/** @type {Array<Event>} */
			let media;
			while (index--) {
				const token = events[index][1];
				if (open) {
					if (token.type === "link" || token.type === "labelLink" && token._inactive) break;
					if (events[index][0] === "enter" && token.type === "labelLink") token._inactive = true;
				} else if (close) {
					if (events[index][0] === "enter" && (token.type === "labelImage" || token.type === "labelLink") && !token._balanced) {
						open = index;
						if (token.type !== "labelLink") {
							offset = 2;
							break;
						}
					}
				} else if (token.type === "labelEnd") close = index;
			}
			const group = {
				type: events[open][1].type === "labelLink" ? "link" : "image",
				start: { ...events[open][1].start },
				end: { ...events[events.length - 1][1].end }
			};
			const label = {
				type: "label",
				start: { ...events[open][1].start },
				end: { ...events[close][1].end }
			};
			const text = {
				type: "labelText",
				start: { ...events[open + offset + 2][1].end },
				end: { ...events[close - 2][1].start }
			};
			media = [[
				"enter",
				group,
				context
			], [
				"enter",
				label,
				context
			]];
			media = push(media, events.slice(open + 1, open + offset + 3));
			media = push(media, [[
				"enter",
				text,
				context
			]]);
			media = push(media, resolveAll(context.parser.constructs.insideSpan.null, events.slice(open + offset + 4, close - 3), context));
			media = push(media, [
				[
					"exit",
					text,
					context
				],
				events[close - 2],
				events[close - 1],
				[
					"exit",
					label,
					context
				]
			]);
			media = push(media, events.slice(close + 1));
			media = push(media, [[
				"exit",
				group,
				context
			]]);
			splice(events, open, events.length, media);
			return events;
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeLabelEnd(effects, ok, nok) {
			const self = this;
			const labelStarts = self._labelStarts;
			/** @type {Token} */
			let labelStart;
			/** @type {boolean} */
			let defined;
			if (labelStarts) {
				while (labelStarts.length > 0 && labelStarts[labelStarts.length - 1]._balanced) labelStarts.pop();
				labelStart = labelStarts[labelStarts.length - 1];
			}
			return start;
			/**
			* Start of label end.
			*
			* ```markdown
			* > | [a](b) c
			*       ^
			* > | [a][b] c
			*       ^
			* > | [a][] b
			*       ^
			* > | [a] b
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				if (!labelStart) return nok(code);
				if (labelStart._inactive) return labelEndNok(code);
				defined = self.parser.defined.includes(normalizeIdentifier(self.sliceSerialize({
					start: labelStart.end,
					end: self.now()
				})));
				effects.enter("labelEnd");
				effects.enter("labelMarker");
				effects.consume(code);
				effects.exit("labelMarker");
				effects.exit("labelEnd");
				return after;
			}
			/**
			* After `]`.
			*
			* ```markdown
			* > | [a](b) c
			*       ^
			* > | [a][b] c
			*       ^
			* > | [a][] b
			*       ^
			* > | [a] b
			*       ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				if (code === 40) return effects.attempt(resourceConstruct, labelEndOk, defined ? labelEndOk : labelEndNok)(code);
				if (code === 91) return effects.attempt(referenceFullConstruct, labelEndOk, defined ? referenceNotFull : labelEndNok)(code);
				return defined ? labelEndOk(code) : labelEndNok(code);
			}
			/**
			* After `]`, at `[`, but not at a full reference.
			*
			* > 👉 **Note**: we only get here if the label is defined.
			*
			* ```markdown
			* > | [a][] b
			*        ^
			* > | [a] b
			*        ^
			* ```
			*
			* @type {State}
			*/
			function referenceNotFull(code) {
				return effects.attempt(referenceCollapsedConstruct, labelEndOk, labelEndNok)(code);
			}
			/**
			* Done, we found something.
			*
			* ```markdown
			* > | [a](b) c
			*           ^
			* > | [a][b] c
			*           ^
			* > | [a][] b
			*          ^
			* > | [a] b
			*        ^
			* ```
			*
			* @type {State}
			*/
			function labelEndOk(code) {
				labelStarts.pop();
				return ok(code);
			}
			/**
			* Done, it’s nothing.
			*
			* There was an okay opening, but we didn’t match anything.
			*
			* ```markdown
			* > | [a](b c
			*        ^
			* > | [a][b c
			*        ^
			* > | [a] b
			*        ^
			* ```
			*
			* @type {State}
			*/
			function labelEndNok(code) {
				labelStart._balanced = true;
				return nok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeResource(effects, ok, nok) {
			return resourceStart;
			/**
			* At a resource.
			*
			* ```markdown
			* > | [a](b) c
			*        ^
			* ```
			*
			* @type {State}
			*/
			function resourceStart(code) {
				effects.enter("resource");
				effects.enter("resourceMarker");
				effects.consume(code);
				effects.exit("resourceMarker");
				return resourceBefore;
			}
			/**
			* In resource, after `(`, at optional whitespace.
			*
			* ```markdown
			* > | [a](b) c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function resourceBefore(code) {
				return markdownLineEndingOrSpace(code) ? factoryWhitespace(effects, resourceOpen)(code) : resourceOpen(code);
			}
			/**
			* In resource, after optional whitespace, at `)` or a destination.
			*
			* ```markdown
			* > | [a](b) c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function resourceOpen(code) {
				if (code === 41) return resourceEnd(code);
				return factoryDestination(effects, resourceDestinationAfter, resourceDestinationMissing, "resourceDestination", "resourceDestinationLiteral", "resourceDestinationLiteralMarker", "resourceDestinationRaw", "resourceDestinationString", 32)(code);
			}
			/**
			* In resource, after destination, at optional whitespace.
			*
			* ```markdown
			* > | [a](b) c
			*          ^
			* ```
			*
			* @type {State}
			*/
			function resourceDestinationAfter(code) {
				return markdownLineEndingOrSpace(code) ? factoryWhitespace(effects, resourceBetween)(code) : resourceEnd(code);
			}
			/**
			* At invalid destination.
			*
			* ```markdown
			* > | [a](<<) b
			*         ^
			* ```
			*
			* @type {State}
			*/
			function resourceDestinationMissing(code) {
				return nok(code);
			}
			/**
			* In resource, after destination and whitespace, at `(` or title.
			*
			* ```markdown
			* > | [a](b ) c
			*           ^
			* ```
			*
			* @type {State}
			*/
			function resourceBetween(code) {
				if (code === 34 || code === 39 || code === 40) return factoryTitle(effects, resourceTitleAfter, nok, "resourceTitle", "resourceTitleMarker", "resourceTitleString")(code);
				return resourceEnd(code);
			}
			/**
			* In resource, after title, at optional whitespace.
			*
			* ```markdown
			* > | [a](b "c") d
			*              ^
			* ```
			*
			* @type {State}
			*/
			function resourceTitleAfter(code) {
				return markdownLineEndingOrSpace(code) ? factoryWhitespace(effects, resourceEnd)(code) : resourceEnd(code);
			}
			/**
			* In resource, at `)`.
			*
			* ```markdown
			* > | [a](b) d
			*          ^
			* ```
			*
			* @type {State}
			*/
			function resourceEnd(code) {
				if (code === 41) {
					effects.enter("resourceMarker");
					effects.consume(code);
					effects.exit("resourceMarker");
					effects.exit("resource");
					return ok;
				}
				return nok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeReferenceFull(effects, ok, nok) {
			const self = this;
			return referenceFull;
			/**
			* In a reference (full), at the `[`.
			*
			* ```markdown
			* > | [a][b] d
			*        ^
			* ```
			*
			* @type {State}
			*/
			function referenceFull(code) {
				return factoryLabel.call(self, effects, referenceFullAfter, referenceFullMissing, "reference", "referenceMarker", "referenceString")(code);
			}
			/**
			* In a reference (full), after `]`.
			*
			* ```markdown
			* > | [a][b] d
			*          ^
			* ```
			*
			* @type {State}
			*/
			function referenceFullAfter(code) {
				return self.parser.defined.includes(normalizeIdentifier(self.sliceSerialize(self.events[self.events.length - 1][1]).slice(1, -1))) ? ok(code) : nok(code);
			}
			/**
			* In reference (full) that was missing.
			*
			* ```markdown
			* > | [a][b d
			*        ^
			* ```
			*
			* @type {State}
			*/
			function referenceFullMissing(code) {
				return nok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeReferenceCollapsed(effects, ok, nok) {
			return referenceCollapsedStart;
			/**
			* In reference (collapsed), at `[`.
			*
			* > 👉 **Note**: we only get here if the label is defined.
			*
			* ```markdown
			* > | [a][] d
			*        ^
			* ```
			*
			* @type {State}
			*/
			function referenceCollapsedStart(code) {
				effects.enter("reference");
				effects.enter("referenceMarker");
				effects.consume(code);
				effects.exit("referenceMarker");
				return referenceCollapsedOpen;
			}
			/**
			* In reference (collapsed), at `]`.
			*
			* > 👉 **Note**: we only get here if the label is defined.
			*
			* ```markdown
			* > | [a][] d
			*         ^
			* ```
			*
			*  @type {State}
			*/
			function referenceCollapsedOpen(code) {
				if (code === 93) {
					effects.enter("referenceMarker");
					effects.consume(code);
					effects.exit("referenceMarker");
					effects.exit("reference");
					return ok;
				}
				return nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/label-start-image.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   Token,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const labelStartImage = {
			name: "labelStartImage",
			resolveAll: labelEnd.resolveAll,
			tokenize: tokenizeLabelStartImage
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeLabelStartImage(effects, ok, nok) {
			const self = this;
			/** @type {Token} */
			let labelImage;
			return start;
			/**
			* Start of label (image) start.
			*
			* ```markdown
			* > | a ![b] c
			*       ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("labelImage");
				effects.enter("labelImageMarker");
				effects.consume(code);
				effects.exit("labelImageMarker");
				return open;
			}
			/**
			* After `!`, at `[`.
			*
			* ```markdown
			* > | a ![b] c
			*        ^
			* ```
			*
			* @type {State}
			*/
			function open(code) {
				if (code === 91) {
					effects.enter("labelMarker");
					effects.consume(code);
					effects.exit("labelMarker");
					labelImage = effects.exit("labelImage");
					return after;
				}
				return nok(code);
			}
			/**
			* After `![`.
			*
			* ```markdown
			* > | a ![b] c
			*         ^
			* ```
			*
			* This is needed in because, when GFM footnotes are enabled, images never
			* form when started with a `^`.
			* Instead, links form:
			*
			* ```markdown
			* ![^a](b)
			*
			* ![^a][b]
			*
			* [b]: c
			* ```
			*
			* ```html
			* <p>!<a href=\"b\">^a</a></p>
			* <p>!<a href=\"c\">^a</a></p>
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				/* c8 ignore next 6 */
				if (code === 94 && "_hiddenFootnoteSupport" in self.parser.constructs) return nok(code);
				self._labelStarts = self._labelStarts || [];
				self._labelStarts.push(labelImage);
				return ok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/label-start-link.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   Token,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const labelStartLink = {
			name: "labelStartLink",
			resolveAll: labelEnd.resolveAll,
			tokenize: tokenizeLabelStartLink
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeLabelStartLink(effects, ok, nok) {
			const self = this;
			/** @type {Token} */
			let labelLink;
			return start;
			/**
			* Start of label (link) start.
			*
			* ```markdown
			* > | a [b] c
			*       ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("labelLink");
				effects.enter("labelMarker");
				effects.consume(code);
				effects.exit("labelMarker");
				labelLink = effects.exit("labelLink");
				return after;
			}
			/** @type {State} */
			function after(code) {
				/* c8 ignore next 6 */
				if (code === 94 && "_hiddenFootnoteSupport" in self.parser.constructs) return nok(code);
				self._labelStarts = self._labelStarts || [];
				self._labelStarts.push(labelLink);
				return ok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/line-ending.js
		/**
		* @import {
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const lineEnding = {
			name: "lineEnding",
			tokenize: tokenizeLineEnding
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeLineEnding(effects, ok) {
			return start;
			/** @type {State} */
			function start(code) {
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				return factorySpace(effects, ok, "linePrefix");
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/thematic-break.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const thematicBreak$2 = {
			name: "thematicBreak",
			tokenize: tokenizeThematicBreak
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeThematicBreak(effects, ok, nok) {
			let size = 0;
			/** @type {NonNullable<Code>} */
			let marker;
			return start;
			/**
			* Start of thematic break.
			*
			* ```markdown
			* > | ***
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("thematicBreak");
				return before(code);
			}
			/**
			* After optional whitespace, at marker.
			*
			* ```markdown
			* > | ***
			*     ^
			* ```
			*
			* @type {State}
			*/
			function before(code) {
				marker = code;
				return atBreak(code);
			}
			/**
			* After something, before something else.
			*
			* ```markdown
			* > | ***
			*     ^
			* ```
			*
			* @type {State}
			*/
			function atBreak(code) {
				if (code === marker) {
					effects.enter("thematicBreakSequence");
					return sequence(code);
				}
				if (size >= 3 && (code === null || markdownLineEnding(code))) {
					effects.exit("thematicBreak");
					return ok(code);
				}
				return nok(code);
			}
			/**
			* In sequence.
			*
			* ```markdown
			* > | ***
			*     ^
			* ```
			*
			* @type {State}
			*/
			function sequence(code) {
				if (code === marker) {
					effects.consume(code);
					size++;
					return sequence;
				}
				effects.exit("thematicBreakSequence");
				return markdownSpace(code) ? factorySpace(effects, atBreak, "whitespace")(code) : atBreak(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/list.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   Exiter,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const list$2 = {
			continuation: { tokenize: tokenizeListContinuation },
			exit: tokenizeListEnd,
			name: "list",
			tokenize: tokenizeListStart
		};
		/** @type {Construct} */
		const listItemPrefixWhitespaceConstruct = {
			partial: true,
			tokenize: tokenizeListItemPrefixWhitespace
		};
		/** @type {Construct} */
		const indentConstruct = {
			partial: true,
			tokenize: tokenizeIndent$1
		};
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeListStart(effects, ok, nok) {
			const self = this;
			const tail = self.events[self.events.length - 1];
			let initialSize = tail && tail[1].type === "linePrefix" ? tail[2].sliceSerialize(tail[1], true).length : 0;
			let size = 0;
			return start;
			/** @type {State} */
			function start(code) {
				const kind = self.containerState.type || (code === 42 || code === 43 || code === 45 ? "listUnordered" : "listOrdered");
				if (kind === "listUnordered" ? !self.containerState.marker || code === self.containerState.marker : asciiDigit(code)) {
					if (!self.containerState.type) {
						self.containerState.type = kind;
						effects.enter(kind, { _container: true });
					}
					if (kind === "listUnordered") {
						effects.enter("listItemPrefix");
						return code === 42 || code === 45 ? effects.check(thematicBreak$2, nok, atMarker)(code) : atMarker(code);
					}
					if (!self.interrupt || code === 49) {
						effects.enter("listItemPrefix");
						effects.enter("listItemValue");
						return inside(code);
					}
				}
				return nok(code);
			}
			/** @type {State} */
			function inside(code) {
				if (asciiDigit(code) && ++size < 10) {
					effects.consume(code);
					return inside;
				}
				if ((!self.interrupt || size < 2) && (self.containerState.marker ? code === self.containerState.marker : code === 41 || code === 46)) {
					effects.exit("listItemValue");
					return atMarker(code);
				}
				return nok(code);
			}
			/**
			* @type {State}
			**/
			function atMarker(code) {
				effects.enter("listItemMarker");
				effects.consume(code);
				effects.exit("listItemMarker");
				self.containerState.marker = self.containerState.marker || code;
				return effects.check(blankLine, self.interrupt ? nok : onBlank, effects.attempt(listItemPrefixWhitespaceConstruct, endOfPrefix, otherPrefix));
			}
			/** @type {State} */
			function onBlank(code) {
				self.containerState.initialBlankLine = true;
				initialSize++;
				return endOfPrefix(code);
			}
			/** @type {State} */
			function otherPrefix(code) {
				if (markdownSpace(code)) {
					effects.enter("listItemPrefixWhitespace");
					effects.consume(code);
					effects.exit("listItemPrefixWhitespace");
					return endOfPrefix;
				}
				return nok(code);
			}
			/** @type {State} */
			function endOfPrefix(code) {
				self.containerState.size = initialSize + self.sliceSerialize(effects.exit("listItemPrefix"), true).length;
				return ok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeListContinuation(effects, ok, nok) {
			const self = this;
			self.containerState._closeFlow = void 0;
			return effects.check(blankLine, onBlank, notBlank);
			/** @type {State} */
			function onBlank(code) {
				self.containerState.furtherBlankLines = self.containerState.furtherBlankLines || self.containerState.initialBlankLine;
				return factorySpace(effects, ok, "listItemIndent", self.containerState.size + 1)(code);
			}
			/** @type {State} */
			function notBlank(code) {
				if (self.containerState.furtherBlankLines || !markdownSpace(code)) {
					self.containerState.furtherBlankLines = void 0;
					self.containerState.initialBlankLine = void 0;
					return notInCurrentItem(code);
				}
				self.containerState.furtherBlankLines = void 0;
				self.containerState.initialBlankLine = void 0;
				return effects.attempt(indentConstruct, ok, notInCurrentItem)(code);
			}
			/** @type {State} */
			function notInCurrentItem(code) {
				self.containerState._closeFlow = true;
				self.interrupt = void 0;
				return factorySpace(effects, effects.attempt(list$2, ok, nok), "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeIndent$1(effects, ok, nok) {
			const self = this;
			return factorySpace(effects, afterPrefix, "listItemIndent", self.containerState.size + 1);
			/** @type {State} */
			function afterPrefix(code) {
				const tail = self.events[self.events.length - 1];
				return tail && tail[1].type === "listItemIndent" && tail[2].sliceSerialize(tail[1], true).length === self.containerState.size ? ok(code) : nok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Exiter}
		*/
		function tokenizeListEnd(effects) {
			effects.exit(this.containerState.type);
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeListItemPrefixWhitespace(effects, ok, nok) {
			const self = this;
			return factorySpace(effects, afterPrefix, "listItemPrefixWhitespace", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 5);
			/** @type {State} */
			function afterPrefix(code) {
				const tail = self.events[self.events.length - 1];
				return !markdownSpace(code) && tail && tail[1].type === "listItemPrefixWhitespace" ? ok(code) : nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-core-commonmark/lib/setext-underline.js
		/**
		* @import {
		*   Code,
		*   Construct,
		*   Resolver,
		*   State,
		*   TokenizeContext,
		*   Tokenizer
		* } from 'micromark-util-types'
		*/
		/** @type {Construct} */
		const setextUnderline = {
			name: "setextUnderline",
			resolveTo: resolveToSetextUnderline,
			tokenize: tokenizeSetextUnderline
		};
		/** @type {Resolver} */
		function resolveToSetextUnderline(events, context) {
			const editMap = new EditMap$1();
			let index = events.length;
			/** @type {number | undefined} */
			let content;
			/** @type {number | undefined} */
			let text;
			/** @type {number | undefined} */
			let definition;
			while (index--) if (events[index][0] === "enter") {
				if (events[index][1].type === "content") {
					content = index;
					break;
				}
				if (events[index][1].type === "paragraph") text = index;
			} else {
				if (events[index][1].type === "content") editMap.add(index, 1, []);
				if (!definition && events[index][1].type === "definition") definition = index;
			}
			const heading = {
				type: "setextHeading",
				start: { ...events[content][1].start },
				end: { ...events[events.length - 1][1].end }
			};
			events[text][1].type = "setextHeadingText";
			if (definition) {
				editMap.add(text, 0, [[
					"enter",
					heading,
					context
				]]);
				editMap.add(definition + 1, 0, [[
					"exit",
					events[content][1],
					context
				]]);
				events[content][1].end = { ...events[definition][1].end };
			} else events[content][1] = heading;
			editMap.add(events.length, 0, [[
				"exit",
				heading,
				context
			]]);
			editMap.consume(events);
			return events;
		}
		/**
		* @this {TokenizeContext}
		*   Context.
		* @type {Tokenizer}
		*/
		function tokenizeSetextUnderline(effects, ok, nok) {
			const self = this;
			/** @type {NonNullable<Code>} */
			let marker;
			return start;
			/**
			* At start of heading (setext) underline.
			*
			* ```markdown
			*   | aa
			* > | ==
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				let index = self.events.length;
				/** @type {boolean | undefined} */
				let paragraph;
				while (index--) if (self.events[index][1].type !== "lineEnding" && self.events[index][1].type !== "linePrefix" && self.events[index][1].type !== "content") {
					paragraph = self.events[index][1].type === "paragraph";
					break;
				}
				if (!self.parser.lazy[self.now().line] && (self.interrupt || paragraph)) {
					effects.enter("setextHeadingLine");
					marker = code;
					return before(code);
				}
				return nok(code);
			}
			/**
			* After optional whitespace, at `-` or `=`.
			*
			* ```markdown
			*   | aa
			* > | ==
			*     ^
			* ```
			*
			* @type {State}
			*/
			function before(code) {
				effects.enter("setextHeadingLineSequence");
				return inside(code);
			}
			/**
			* In sequence.
			*
			* ```markdown
			*   | aa
			* > | ==
			*     ^
			* ```
			*
			* @type {State}
			*/
			function inside(code) {
				if (code === marker) {
					effects.consume(code);
					return inside;
				}
				effects.exit("setextHeadingLineSequence");
				return markdownSpace(code) ? factorySpace(effects, after, "lineSuffix")(code) : after(code);
			}
			/**
			* After sequence, after optional whitespace.
			*
			* ```markdown
			*   | aa
			* > | ==
			*       ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				if (code === null || markdownLineEnding(code)) {
					effects.exit("setextHeadingLine");
					return ok(code);
				}
				return nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark/lib/initialize/flow.js
		/**
		* @import {
		*   InitialConstruct,
		*   Initializer,
		*   State,
		*   TokenizeContext
		* } from 'micromark-util-types'
		*/
		/** @type {InitialConstruct} */
		const flow$1 = { tokenize: initializeFlow };
		/**
		* @this {TokenizeContext}
		*   Self.
		* @type {Initializer}
		*   Initializer.
		*/
		function initializeFlow(effects) {
			const self = this;
			const initial = effects.attempt(blankLine, atBlankEnding, effects.attempt(this.parser.constructs.flowInitial, afterConstruct, factorySpace(effects, effects.attempt(this.parser.constructs.flow, afterConstruct, effects.attempt(content, afterConstruct)), "linePrefix")));
			return initial;
			/** @type {State} */
			function atBlankEnding(code) {
				if (code === null) {
					effects.consume(code);
					return;
				}
				effects.enter("lineEndingBlank");
				effects.consume(code);
				effects.exit("lineEndingBlank");
				self.currentConstruct = void 0;
				return initial;
			}
			/** @type {State} */
			function afterConstruct(code) {
				if (code === null) {
					effects.consume(code);
					return;
				}
				effects.enter("lineEnding");
				effects.consume(code);
				effects.exit("lineEnding");
				self.currentConstruct = void 0;
				return initial;
			}
		}
		//#endregion
		//#region node_modules/micromark/lib/initialize/text.js
		/**
		* @import {
		*   Code,
		*   InitialConstruct,
		*   Initializer,
		*   Resolver,
		*   State,
		*   TokenizeContext
		* } from 'micromark-util-types'
		*/
		const resolver = { resolveAll: createResolver() };
		const string$1 = initializeFactory("string");
		const text$4 = initializeFactory("text");
		/**
		* @param {'string' | 'text'} field
		*   Field.
		* @returns {InitialConstruct}
		*   Construct.
		*/
		function initializeFactory(field) {
			return {
				resolveAll: createResolver(field === "text" ? resolveAllLineSuffixes : void 0),
				tokenize: initializeText
			};
			/**
			* @this {TokenizeContext}
			*   Context.
			* @type {Initializer}
			*/
			function initializeText(effects) {
				const self = this;
				const constructs = this.parser.constructs[field];
				const text = effects.attempt(constructs, start, notText);
				return start;
				/** @type {State} */
				function start(code) {
					return atBreak(code) ? text(code) : notText(code);
				}
				/** @type {State} */
				function notText(code) {
					if (code === null) {
						effects.consume(code);
						return;
					}
					effects.enter("data");
					effects.consume(code);
					return data;
				}
				/** @type {State} */
				function data(code) {
					if (atBreak(code)) {
						effects.exit("data");
						return text(code);
					}
					effects.consume(code);
					return data;
				}
				/**
				* @param {Code} code
				*   Code.
				* @returns {boolean}
				*   Whether the code is a break.
				*/
				function atBreak(code) {
					if (code === null) return true;
					const list = constructs[code];
					let index = -1;
					if (list) while (++index < list.length) {
						const item = list[index];
						if (!item.previous || item.previous.call(self, self.previous)) return true;
					}
					return false;
				}
			}
		}
		/**
		* @param {Resolver | undefined} [extraResolver]
		*   Resolver.
		* @returns {Resolver}
		*   Resolver.
		*/
		function createResolver(extraResolver) {
			return resolveAllText;
			/** @type {Resolver} */
			function resolveAllText(events, context) {
				let index = -1;
				/** @type {number | undefined} */
				let enter;
				while (++index <= events.length) if (enter === void 0) {
					if (events[index] && events[index][1].type === "data") {
						enter = index;
						index++;
					}
				} else if (!events[index] || events[index][1].type !== "data") {
					if (index !== enter + 2) {
						events[enter][1].end = events[index - 1][1].end;
						events.splice(enter + 2, index - enter - 2);
						index = enter + 2;
					}
					enter = void 0;
				}
				return extraResolver ? extraResolver(events, context) : events;
			}
		}
		/**
		* A rather ugly set of instructions which again looks at chunks in the input
		* stream.
		* The reason to do this here is that it is *much* faster to parse in reverse.
		* And that we can’t hook into `null` to split the line suffix before an EOF.
		* To do: figure out if we can make this into a clean utility, or even in core.
		* As it will be useful for GFMs literal autolink extension (and maybe even
		* tables?)
		*
		* @type {Resolver}
		*/
		function resolveAllLineSuffixes(events, context) {
			const editMap = new EditMap$1();
			let eventIndex = 0;
			while (++eventIndex <= events.length) if ((eventIndex === events.length || events[eventIndex][1].type === "lineEnding") && events[eventIndex - 1][1].type === "data") {
				const data = events[eventIndex - 1][1];
				const chunks = context.sliceStream(data);
				let index = chunks.length;
				let bufferIndex = -1;
				let size = 0;
				/** @type {boolean | undefined} */
				let tabs;
				while (index--) {
					const chunk = chunks[index];
					if (typeof chunk === "string") {
						bufferIndex = chunk.length;
						while (chunk.charCodeAt(bufferIndex - 1) === 32) {
							size++;
							bufferIndex--;
						}
						if (bufferIndex) break;
						bufferIndex = -1;
					} else if (chunk === -2) {
						tabs = true;
						size++;
					} else if (chunk === -1) {} else {
						index++;
						break;
					}
				}
				if (context._contentTypeTextTrailing && eventIndex === events.length) size = 0;
				if (size) {
					const token = {
						type: eventIndex === events.length || tabs || size < 2 ? "lineSuffix" : "hardBreakTrailing",
						start: {
							_bufferIndex: index ? bufferIndex : data.start._bufferIndex + bufferIndex,
							_index: data.start._index + index,
							line: data.end.line,
							column: data.end.column - size,
							offset: data.end.offset - size
						},
						end: { ...data.end }
					};
					data.end = { ...token.start };
					if (data.start.offset === data.end.offset) Object.assign(data, token);
					else editMap.add(eventIndex, 0, [[
						"enter",
						token,
						context
					], [
						"exit",
						token,
						context
					]]);
				}
				eventIndex++;
			}
			editMap.consume(events);
			return events;
		}
		//#endregion
		//#region node_modules/micromark/lib/constructs.js
		/**
		* @import {Extension} from 'micromark-util-types'
		*/
		var constructs_exports = /* @__PURE__ */ __exportAll({
			attentionMarkers: () => attentionMarkers,
			contentInitial: () => contentInitial,
			disable: () => disable,
			document: () => document$1,
			flow: () => flow,
			flowInitial: () => flowInitial,
			insideSpan: () => insideSpan,
			string: () => string,
			text: () => text$3
		});
		/** @satisfies {Extension['document']} */
		const document$1 = {
			[42]: list$2,
			[43]: list$2,
			[45]: list$2,
			[48]: list$2,
			[49]: list$2,
			[50]: list$2,
			[51]: list$2,
			[52]: list$2,
			[53]: list$2,
			[54]: list$2,
			[55]: list$2,
			[56]: list$2,
			[57]: list$2,
			[62]: blockQuote
		};
		/** @satisfies {Extension['contentInitial']} */
		const contentInitial = { [91]: definition$1 };
		/** @satisfies {Extension['flowInitial']} */
		const flowInitial = {
			[-2]: codeIndented,
			[-1]: codeIndented,
			[32]: codeIndented
		};
		/** @satisfies {Extension['flow']} */
		const flow = {
			[35]: headingAtx,
			[42]: thematicBreak$2,
			[45]: [setextUnderline, thematicBreak$2],
			[60]: htmlFlow,
			[61]: setextUnderline,
			[95]: thematicBreak$2,
			[96]: codeFenced,
			[126]: codeFenced
		};
		/** @satisfies {Extension['string']} */
		const string = {
			[38]: characterReference,
			[92]: characterEscape
		};
		/** @satisfies {Extension['text']} */
		const text$3 = {
			[-5]: lineEnding,
			[-4]: lineEnding,
			[-3]: lineEnding,
			[33]: labelStartImage,
			[38]: characterReference,
			[42]: attention$2,
			[60]: [autolink, htmlText],
			[91]: labelStartLink,
			[92]: [hardBreakEscape, characterEscape],
			[93]: labelEnd,
			[95]: attention$2,
			[96]: codeText
		};
		/** @satisfies {Extension['insideSpan']} */
		const insideSpan = { null: [attention$2, resolver] };
		/** @satisfies {Extension['attentionMarkers']} */
		const attentionMarkers = { null: [42, 95] };
		/** @satisfies {Extension['disable']} */
		const disable = { null: [] };
		//#endregion
		//#region node_modules/micromark/lib/create-tokenizer.js
		/**
		* @import {
		*   Chunk,
		*   Code,
		*   ConstructRecord,
		*   Construct,
		*   Effects,
		*   InitialConstruct,
		*   ParseContext,
		*   Point,
		*   State,
		*   TokenizeContext,
		*   Token
		* } from 'micromark-util-types'
		*/
		/**
		* @callback Restore
		*   Restore the state.
		* @returns {undefined}
		*   Nothing.
		*
		* @typedef Info
		*   Info.
		* @property {Restore} restore
		*   Restore.
		* @property {number} from
		*   From.
		*
		* @callback ReturnHandle
		*   Handle a successful run.
		* @param {Construct} construct
		*   Construct.
		* @param {Info} info
		*   Info.
		* @returns {undefined}
		*   Nothing.
		*/
		/**
		* Create a tokenizer.
		* Tokenizers deal with one type of data (e.g., containers, flow, text).
		* The parser is the object dealing with it all.
		* `initialize` works like other constructs, except that only its `tokenize`
		* function is used, in which case it doesn’t receive an `ok` or `nok`.
		* `from` can be given to set the point before the first character, although
		* when further lines are indented, they must be set with `defineSkip`.
		*
		* @param {ParseContext} parser
		*   Parser.
		* @param {InitialConstruct} initialize
		*   Construct.
		* @param {Omit<Point, '_bufferIndex' | '_index'> | undefined} [from]
		*   Point (optional).
		* @returns {TokenizeContext}
		*   Context.
		*/
		function createTokenizer(parser, initialize, from) {
			/** @type {Point} */
			let point = {
				_bufferIndex: -1,
				_index: 0,
				line: from && from.line || 1,
				column: from && from.column || 1,
				offset: from && from.offset || 0
			};
			/** @type {Record<string, number>} */
			const columnStart = {};
			/** @type {Array<Construct>} */
			const resolveAllConstructs = [];
			/** @type {Array<Chunk>} */
			let chunks = [];
			/** @type {Array<Token>} */
			let stack = [];
			/**
			* Tools used for tokenizing.
			*
			* @type {Effects}
			*/
			const effects = {
				attempt: constructFactory(onsuccessfulconstruct),
				check: constructFactory(onsuccessfulcheck),
				consume,
				enter,
				exit,
				interrupt: constructFactory(onsuccessfulcheck, { interrupt: true })
			};
			/**
			* State and tools for resolving and serializing.
			*
			* @type {TokenizeContext}
			*/
			const context = {
				code: null,
				containerState: {},
				defineSkip,
				events: [],
				now,
				parser,
				previous: null,
				sliceSerialize,
				sliceStream,
				write
			};
			/**
			* The state function.
			*
			* @type {State | undefined}
			*/
			let state = initialize.tokenize.call(context, effects);
			if (initialize.resolveAll) resolveAllConstructs.push(initialize);
			return context;
			/** @type {TokenizeContext['write']} */
			function write(slice) {
				chunks = push(chunks, slice);
				main();
				if (chunks[chunks.length - 1] !== null) return [];
				addResult(initialize, 0);
				context.events = resolveAll(resolveAllConstructs, context.events, context);
				return context.events;
			}
			/** @type {TokenizeContext['sliceSerialize']} */
			function sliceSerialize(token, expandTabs) {
				return serializeChunks(sliceStream(token), expandTabs);
			}
			/** @type {TokenizeContext['sliceStream']} */
			function sliceStream(token) {
				return sliceChunks(chunks, token);
			}
			/** @type {TokenizeContext['now']} */
			function now() {
				const { _bufferIndex, _index, line, column, offset } = point;
				return {
					_bufferIndex,
					_index,
					line,
					column,
					offset
				};
			}
			/** @type {TokenizeContext['defineSkip']} */
			function defineSkip(value) {
				columnStart[value.line] = value.column;
				accountForPotentialSkip();
			}
			/**
			* Main loop (note that `_index` and `_bufferIndex` in `point` are modified by
			* `consume`).
			* Here is where we walk through the chunks, which either include strings of
			* several characters, or numerical character codes.
			* The reason to do this in a loop instead of a call is so the stack can
			* drain.
			*
			* @returns {undefined}
			*   Nothing.
			*/
			function main() {
				while (point._index < chunks.length) {
					const chunk = chunks[point._index];
					if (typeof chunk === "string") {
						const chunkIndex = point._index;
						if (point._bufferIndex < 0) point._bufferIndex = 0;
						while (point._index === chunkIndex && point._bufferIndex < chunk.length) go(chunk.charCodeAt(point._bufferIndex));
					} else go(chunk);
				}
			}
			/**
			* Deal with one code.
			*
			* @param {Code} code
			*   Code.
			* @returns {undefined}
			*   Nothing.
			*/
			function go(code) {
				state = state(code);
			}
			/** @type {Effects['consume']} */
			function consume(code) {
				if (markdownLineEnding(code)) {
					point.line++;
					point.column = 1;
					point.offset += code === -3 ? 2 : 1;
					accountForPotentialSkip();
				} else if (code !== -1) {
					point.column++;
					point.offset++;
				}
				if (point._bufferIndex < 0) point._index++;
				else {
					point._bufferIndex++;
					if (point._bufferIndex === chunks[point._index].length) {
						point._bufferIndex = -1;
						point._index++;
					}
				}
				context.previous = code;
			}
			/** @type {Effects['enter']} */
			function enter(type, fields) {
				/** @type {Token} */
				const token = fields || {};
				token.type = type;
				token.start = now();
				context.events.push([
					"enter",
					token,
					context
				]);
				stack.push(token);
				return token;
			}
			/** @type {Effects['exit']} */
			function exit(type) {
				const token = stack.pop();
				token.end = now();
				context.events.push([
					"exit",
					token,
					context
				]);
				return token;
			}
			/**
			* Use results.
			*
			* @type {ReturnHandle}
			*/
			function onsuccessfulconstruct(construct, info) {
				addResult(construct, info.from);
			}
			/**
			* Discard results.
			*
			* @type {ReturnHandle}
			*/
			function onsuccessfulcheck(_, info) {
				info.restore();
			}
			/**
			* Factory to attempt/check/interrupt.
			*
			* @param {ReturnHandle} onreturn
			*   Callback.
			* @param {{interrupt?: boolean | undefined} | undefined} [fields]
			*   Fields.
			*/
			function constructFactory(onreturn, fields) {
				return hook;
				/**
				* Handle either an object mapping codes to constructs, a list of
				* constructs, or a single construct.
				*
				* @param {Array<Construct> | ConstructRecord | Construct} constructs
				*   Constructs.
				* @param {State} returnState
				*   State.
				* @param {State | undefined} [bogusState]
				*   State.
				* @returns {State}
				*   State.
				*/
				function hook(constructs, returnState, bogusState) {
					/** @type {ReadonlyArray<Construct>} */
					let listOfConstructs;
					/** @type {number} */
					let constructIndex;
					/** @type {Construct} */
					let currentConstruct;
					/** @type {Info} */
					let info;
					return Array.isArray(constructs) ? handleListOfConstructs(constructs) : "tokenize" in constructs ? handleListOfConstructs([constructs]) : handleMapOfConstructs(constructs);
					/**
					* Handle a list of construct.
					*
					* @param {ConstructRecord} map
					*   Constructs.
					* @returns {State}
					*   State.
					*/
					function handleMapOfConstructs(map) {
						return start;
						/** @type {State} */
						function start(code) {
							const left = code !== null && map[code];
							const all = code !== null && map.null;
							return handleListOfConstructs([...Array.isArray(left) ? left : left ? [left] : [], ...Array.isArray(all) ? all : all ? [all] : []])(code);
						}
					}
					/**
					* Handle a list of construct.
					*
					* @param {ReadonlyArray<Construct>} list
					*   Constructs.
					* @returns {State}
					*   State.
					*/
					function handleListOfConstructs(list) {
						listOfConstructs = list;
						constructIndex = 0;
						if (list.length === 0) return bogusState;
						return handleConstruct(list[constructIndex]);
					}
					/**
					* Handle a single construct.
					*
					* @param {Construct} construct
					*   Construct.
					* @returns {State}
					*   State.
					*/
					function handleConstruct(construct) {
						return start;
						/** @type {State} */
						function start(code) {
							info = store();
							currentConstruct = construct;
							if (!construct.partial) context.currentConstruct = construct;
							if (construct.name && context.parser.constructs.disable.null.includes(construct.name)) return nok(code);
							return construct.tokenize.call(fields ? Object.assign(Object.create(context), fields) : context, effects, ok, nok)(code);
						}
					}
					/** @type {State} */
					function ok(code) {
						onreturn(currentConstruct, info);
						return returnState;
					}
					/** @type {State} */
					function nok(code) {
						info.restore();
						if (++constructIndex < listOfConstructs.length) return handleConstruct(listOfConstructs[constructIndex]);
						return bogusState;
					}
				}
			}
			/**
			* @param {Construct} construct
			*   Construct.
			* @param {number} from
			*   From.
			* @returns {undefined}
			*   Nothing.
			*/
			function addResult(construct, from) {
				if (construct.resolveAll && !resolveAllConstructs.includes(construct)) resolveAllConstructs.push(construct);
				if (construct.resolve) splice(context.events, from, context.events.length - from, construct.resolve(context.events.slice(from), context));
				if (construct.resolveTo) context.events = construct.resolveTo(context.events, context);
			}
			/**
			* Store state.
			*
			* @returns {Info}
			*   Info.
			*/
			function store() {
				const startPoint = now();
				const startPrevious = context.previous;
				const startCurrentConstruct = context.currentConstruct;
				const startEventsIndex = context.events.length;
				const startStack = Array.from(stack);
				return {
					from: startEventsIndex,
					restore
				};
				/**
				* Restore state.
				*
				* @returns {undefined}
				*   Nothing.
				*/
				function restore() {
					point = startPoint;
					context.previous = startPrevious;
					context.currentConstruct = startCurrentConstruct;
					context.events.length = startEventsIndex;
					stack = startStack;
					accountForPotentialSkip();
				}
			}
			/**
			* Move the current point a bit forward in the line when it’s on a column
			* skip.
			*
			* @returns {undefined}
			*   Nothing.
			*/
			function accountForPotentialSkip() {
				if (point.line in columnStart && point.column < 2) {
					point.column = columnStart[point.line];
					point.offset += columnStart[point.line] - 1;
				}
			}
		}
		/**
		* Get the chunks from a slice of chunks in the range of a token.
		*
		* @param {ReadonlyArray<Chunk>} chunks
		*   Chunks.
		* @param {Pick<Token, 'end' | 'start'>} token
		*   Token.
		* @returns {Array<Chunk>}
		*   Chunks.
		*/
		function sliceChunks(chunks, token) {
			const startIndex = token.start._index;
			const startBufferIndex = token.start._bufferIndex;
			const endIndex = token.end._index;
			const endBufferIndex = token.end._bufferIndex;
			/** @type {Array<Chunk>} */
			let view;
			if (startIndex === endIndex) view = [chunks[startIndex].slice(startBufferIndex, endBufferIndex)];
			else {
				view = chunks.slice(startIndex, endIndex);
				if (startBufferIndex > -1) {
					const head = view[0];
					if (typeof head === "string") view[0] = head.slice(startBufferIndex);
					else view.shift();
				}
				if (endBufferIndex > 0) view.push(chunks[endIndex].slice(0, endBufferIndex));
			}
			return view;
		}
		/**
		* Get the string value of a slice of chunks.
		*
		* @param {ReadonlyArray<Chunk>} chunks
		*   Chunks.
		* @param {boolean | undefined} [expandTabs=false]
		*   Whether to expand tabs (default: `false`).
		* @returns {string}
		*   Result.
		*/
		function serializeChunks(chunks, expandTabs) {
			let index = -1;
			/** @type {Array<string>} */
			const result = [];
			/** @type {boolean | undefined} */
			let atTab;
			while (++index < chunks.length) {
				const chunk = chunks[index];
				/** @type {string} */
				let value;
				if (typeof chunk === "string") value = chunk;
				else switch (chunk) {
					case -5:
						value = "\r";
						break;
					case -4:
						value = "\n";
						break;
					case -3:
						value = "\r\n";
						break;
					case -2:
						value = expandTabs ? " " : "	";
						break;
					case -1:
						if (!expandTabs && atTab) continue;
						value = " ";
						break;
					default: value = String.fromCharCode(chunk);
				}
				atTab = chunk === -2;
				result.push(value);
			}
			return result.join("");
		}
		//#endregion
		//#region node_modules/micromark/lib/parse.js
		/**
		* @import {
		*   Create,
		*   FullNormalizedExtension,
		*   InitialConstruct,
		*   ParseContext,
		*   ParseOptions
		* } from 'micromark-util-types'
		*/
		/**
		* @param {ParseOptions | null | undefined} [options]
		*   Configuration (optional).
		* @returns {ParseContext}
		*   Parser.
		*/
		function parse(options) {
			/** @type {ParseContext} */
			const parser = {
				constructs: combineExtensions([constructs_exports, ...(options || {}).extensions || []]),
				content: create(content$1),
				defined: [],
				document: create(document$2),
				flow: create(flow$1),
				lazy: {},
				string: create(string$1),
				text: create(text$4)
			};
			return parser;
			/**
			* @param {InitialConstruct} initial
			*   Construct to start with.
			* @returns {Create}
			*   Create a tokenizer.
			*/
			function create(initial) {
				return creator;
				/** @type {Create} */
				function creator(from) {
					return createTokenizer(parser, initial, from);
				}
			}
		}
		//#endregion
		//#region node_modules/micromark/lib/postprocess.js
		/**
		* @import {Event} from 'micromark-util-types'
		*/
		/**
		* @param {Array<Event>} events
		*   Events.
		* @returns {Array<Event>}
		*   Events.
		*/
		function postprocess(events) {
			while (!subtokenize(events));
			return events;
		}
		//#endregion
		//#region node_modules/micromark/lib/preprocess.js
		/**
		* @import {Chunk, Code, Encoding, Value} from 'micromark-util-types'
		*/
		/**
		* @callback Preprocessor
		*   Preprocess a value.
		* @param {Value} value
		*   Value.
		* @param {Encoding | null | undefined} [encoding]
		*   Encoding when `value` is a typed array (optional).
		* @param {boolean | null | undefined} [end=false]
		*   Whether this is the last chunk (default: `false`).
		* @returns {Array<Chunk>}
		*   Chunks.
		*/
		const search = /[\0\t\n\r]/g;
		/**
		* @returns {Preprocessor}
		*   Preprocess a value.
		*/
		function preprocess() {
			let column = 1;
			let buffer = "";
			/** @type {boolean | undefined} */
			let start = true;
			/** @type {boolean | undefined} */
			let atCarriageReturn;
			return preprocessor;
			/** @type {Preprocessor} */
			function preprocessor(value, encoding, end) {
				value = buffer + (typeof value === "string" ? value.toString() : new TextDecoder(encoding || void 0).decode(value));
				/** @type {Array<Chunk>} */
				const chunks = [];
				let startPosition = 0;
				buffer = "";
				if (start) {
					if (value.charCodeAt(0) === 65279) startPosition++;
					start = void 0;
				}
				while (startPosition < value.length) {
					search.lastIndex = startPosition;
					const match = search.exec(value);
					const endPosition = match && match.index !== void 0 ? match.index : value.length;
					const code = value.charCodeAt(endPosition);
					if (!match) {
						buffer = value.slice(startPosition);
						break;
					}
					if (code === 10 && startPosition === endPosition && atCarriageReturn) {
						chunks.push(-3);
						atCarriageReturn = void 0;
					} else {
						if (atCarriageReturn) {
							chunks.push(-5);
							atCarriageReturn = void 0;
						}
						if (startPosition < endPosition) {
							chunks.push(value.slice(startPosition, endPosition));
							column += endPosition - startPosition;
						}
						switch (code) {
							case 0:
								chunks.push(65533);
								column++;
								break;
							case 9: {
								const next = Math.ceil(column / 4) * 4;
								chunks.push(-2);
								while (column++ < next) chunks.push(-1);
								break;
							}
							case 10:
								chunks.push(-4);
								column = 1;
								break;
							default:
								atCarriageReturn = true;
								column = 1;
						}
					}
					startPosition = endPosition + 1;
				}
				if (end) {
					if (atCarriageReturn) chunks.push(-5);
					if (buffer) chunks.push(buffer);
					chunks.push(null);
				}
				return chunks;
			}
		}
		//#endregion
		//#region node_modules/micromark-util-decode-string/index.js
		const characterEscapeOrReference = /\\([!-/:-@[-`{-~])|&(#(?:\d{1,7}|x[\da-f]{1,6})|[\da-z]{1,31});/gi;
		/**
		* Decode markdown strings (which occur in places such as fenced code info
		* strings, destinations, labels, and titles).
		*
		* The “string” content type allows character escapes and -references.
		* This decodes those.
		*
		* @param {string} value
		*   Value to decode.
		* @returns {string}
		*   Decoded value.
		*/
		function decodeString(value) {
			return value.replace(characterEscapeOrReference, decode);
		}
		/**
		* @param {string} $0
		*   Match.
		* @param {string} $1
		*   Character escape.
		* @param {string} $2
		*   Character reference.
		* @returns {string}
		*   Decoded value
		*/
		function decode($0, $1, $2) {
			if ($1) return $1;
			if ($2.charCodeAt(0) === 35) {
				const head = $2.charCodeAt(1);
				const hex = head === 120 || head === 88;
				return decodeNumericCharacterReference($2.slice(hex ? 2 : 1), hex ? 16 : 10);
			}
			return decodeNamedCharacterReference($2) || $0;
		}
		//#endregion
		//#region node_modules/mdast-util-from-markdown/lib/index.js
		/**
		* @import {
		*   Break,
		*   Blockquote,
		*   Code,
		*   Definition,
		*   Emphasis,
		*   Heading,
		*   Html,
		*   Image,
		*   InlineCode,
		*   Link,
		*   ListItem,
		*   List,
		*   Nodes,
		*   Paragraph,
		*   PhrasingContent,
		*   ReferenceType,
		*   Root,
		*   Strong,
		*   Text,
		*   ThematicBreak
		* } from 'mdast'
		* @import {
		*   Encoding,
		*   Event,
		*   Token,
		*   Value
		* } from 'micromark-util-types'
		* @import {Point} from 'unist'
		* @import {
		*   CompileContext,
		*   CompileData,
		*   Config,
		*   Extension,
		*   Handle,
		*   OnEnterError,
		*   Options
		* } from './types.js'
		*/
		const own$2 = {}.hasOwnProperty;
		/**
		* Turn markdown into a syntax tree.
		*
		* @overload
		* @param {Value} value
		* @param {Encoding | null | undefined} [encoding]
		* @param {Options | null | undefined} [options]
		* @returns {Root}
		*
		* @overload
		* @param {Value} value
		* @param {Options | null | undefined} [options]
		* @returns {Root}
		*
		* @param {Value} value
		*   Markdown to parse.
		* @param {Encoding | Options | null | undefined} [encoding]
		*   Character encoding for when `value` is `Buffer`.
		* @param {Options | null | undefined} [options]
		*   Configuration.
		* @returns {Root}
		*   mdast tree.
		*/
		function fromMarkdown(value, encoding, options) {
			if (encoding && typeof encoding === "object") {
				options = encoding;
				encoding = void 0;
			}
			return compiler(options)(postprocess(parse(options).document().write(preprocess()(value, encoding, true))));
		}
		/**
		* Note this compiler only understand complete buffering, not streaming.
		*
		* @param {Options | null | undefined} [options]
		*/
		function compiler(options) {
			/** @type {Config} */
			const config = {
				transforms: [],
				canContainEols: [
					"emphasis",
					"fragment",
					"heading",
					"paragraph",
					"strong"
				],
				enter: {
					autolink: opener(link),
					autolinkProtocol: onenterdata,
					autolinkEmail: onenterdata,
					atxHeading: opener(heading),
					blockQuote: opener(blockQuote),
					characterEscape: onenterdata,
					characterReference: onenterdata,
					codeFenced: opener(codeFlow),
					codeFencedFenceInfo: buffer,
					codeFencedFenceMeta: buffer,
					codeIndented: opener(codeFlow, buffer),
					codeText: opener(codeText, buffer),
					codeTextData: onenterdata,
					data: onenterdata,
					codeFlowValue: onenterdata,
					definition: opener(definition),
					definitionDestinationString: buffer,
					definitionLabelString: buffer,
					definitionTitleString: buffer,
					emphasis: opener(emphasis),
					hardBreakEscape: opener(hardBreak),
					hardBreakTrailing: opener(hardBreak),
					htmlFlow: opener(html, buffer),
					htmlFlowData: onenterdata,
					htmlText: opener(html, buffer),
					htmlTextData: onenterdata,
					image: opener(image),
					label: buffer,
					link: opener(link),
					listItem: opener(listItem),
					listItemValue: onenterlistitemvalue,
					listOrdered: opener(list, onenterlistordered),
					listUnordered: opener(list),
					paragraph: opener(paragraph),
					reference: onenterreference,
					referenceString: buffer,
					resourceDestinationString: buffer,
					resourceTitleString: buffer,
					setextHeading: opener(heading),
					strong: opener(strong),
					thematicBreak: opener(thematicBreak)
				},
				exit: {
					atxHeading: closer(),
					atxHeadingSequence: onexitatxheadingsequence,
					autolink: closer(),
					autolinkEmail: onexitautolinkemail,
					autolinkProtocol: onexitautolinkprotocol,
					blockQuote: closer(),
					characterEscapeValue: onexitdata,
					characterReferenceMarkerHexadecimal: onexitcharacterreferencemarker,
					characterReferenceMarkerNumeric: onexitcharacterreferencemarker,
					characterReferenceValue: onexitcharacterreferencevalue,
					characterReference: onexitcharacterreference,
					codeFenced: closer(onexitcodefenced),
					codeFencedFence: onexitcodefencedfence,
					codeFencedFenceInfo: onexitcodefencedfenceinfo,
					codeFencedFenceMeta: onexitcodefencedfencemeta,
					codeFlowValue: onexitdata,
					codeIndented: closer(onexitcodeindented),
					codeText: closer(onexitcodetext),
					codeTextData: onexitdata,
					data: onexitdata,
					definition: closer(),
					definitionDestinationString: onexitdefinitiondestinationstring,
					definitionLabelString: onexitdefinitionlabelstring,
					definitionTitleString: onexitdefinitiontitlestring,
					emphasis: closer(),
					hardBreakEscape: closer(onexithardbreak),
					hardBreakTrailing: closer(onexithardbreak),
					htmlFlow: closer(onexithtmlflow),
					htmlFlowData: onexitdata,
					htmlText: closer(onexithtmltext),
					htmlTextData: onexitdata,
					image: closer(onexitimage),
					label: onexitlabel,
					labelText: onexitlabeltext,
					lineEnding: onexitlineending,
					link: closer(onexitlink),
					listItem: closer(),
					listOrdered: closer(),
					listUnordered: closer(),
					paragraph: closer(),
					referenceString: onexitreferencestring,
					resourceDestinationString: onexitresourcedestinationstring,
					resourceTitleString: onexitresourcetitlestring,
					resource: onexitresource,
					setextHeading: closer(onexitsetextheading),
					setextHeadingLineSequence: onexitsetextheadinglinesequence,
					setextHeadingText: onexitsetextheadingtext,
					strong: closer(),
					thematicBreak: closer()
				}
			};
			configure(config, (options || {}).mdastExtensions || []);
			/** @type {CompileData} */
			const data = {};
			return compile;
			/**
			* Turn micromark events into an mdast tree.
			*
			* @param {Array<Event>} events
			*   Events.
			* @returns {Root}
			*   mdast tree.
			*/
			function compile(events) {
				/** @type {Root} */
				let tree = {
					type: "root",
					children: []
				};
				/** @type {Omit<CompileContext, 'sliceSerialize'>} */
				const context = {
					stack: [tree],
					tokenStack: [],
					config,
					enter,
					exit,
					buffer,
					resume,
					data
				};
				/** @type {Array<number>} */
				const listStack = [];
				let index = -1;
				while (++index < events.length) if (events[index][1].type === "listOrdered" || events[index][1].type === "listUnordered") if (events[index][0] === "enter") listStack.push(index);
				else index = prepareList(events, listStack.pop(), index);
				index = -1;
				while (++index < events.length) {
					const handler = config[events[index][0]];
					if (own$2.call(handler, events[index][1].type)) handler[events[index][1].type].call(Object.assign({ sliceSerialize: events[index][2].sliceSerialize }, context), events[index][1]);
				}
				if (context.tokenStack.length > 0) {
					const tail = context.tokenStack[context.tokenStack.length - 1];
					(tail[1] || defaultOnError).call(context, void 0, tail[0]);
				}
				tree.position = {
					start: point(events.length > 0 ? events[0][1].start : {
						line: 1,
						column: 1,
						offset: 0
					}),
					end: point(events.length > 0 ? events[events.length - 2][1].end : {
						line: 1,
						column: 1,
						offset: 0
					})
				};
				index = -1;
				while (++index < config.transforms.length) tree = config.transforms[index](tree) || tree;
				return tree;
			}
			/**
			* @param {Array<Event>} events
			* @param {number} start
			* @param {number} length
			* @returns {number}
			*/
			function prepareList(events, start, length) {
				let index = start - 1;
				let containerBalance = -1;
				let listSpread = false;
				/** @type {Token | undefined} */
				let listItem;
				/** @type {number | undefined} */
				let lineIndex;
				/** @type {number | undefined} */
				let firstBlankLineIndex;
				/** @type {boolean | undefined} */
				let atMarker;
				while (++index <= length) {
					const event = events[index];
					switch (event[1].type) {
						case "listUnordered":
						case "listOrdered":
						case "blockQuote":
							if (event[0] === "enter") containerBalance++;
							else containerBalance--;
							atMarker = void 0;
							break;
						case "lineEndingBlank":
							if (event[0] === "enter") {
								if (listItem && !atMarker && !containerBalance && !firstBlankLineIndex) firstBlankLineIndex = index;
								atMarker = void 0;
							}
							break;
						case "linePrefix":
						case "listItemValue":
						case "listItemMarker":
						case "listItemPrefix":
						case "listItemPrefixWhitespace": break;
						default: atMarker = void 0;
					}
					if (!containerBalance && event[0] === "enter" && event[1].type === "listItemPrefix" || containerBalance === -1 && event[0] === "exit" && (event[1].type === "listUnordered" || event[1].type === "listOrdered")) {
						if (listItem) {
							let tailIndex = index;
							lineIndex = void 0;
							while (tailIndex--) {
								const tailEvent = events[tailIndex];
								if (tailEvent[1].type === "lineEnding" || tailEvent[1].type === "lineEndingBlank") {
									if (tailEvent[0] === "exit") continue;
									if (lineIndex) {
										events[lineIndex][1].type = "lineEndingBlank";
										listSpread = true;
									}
									tailEvent[1].type = "lineEnding";
									lineIndex = tailIndex;
								} else if (tailEvent[1].type === "linePrefix" || tailEvent[1].type === "blockQuotePrefix" || tailEvent[1].type === "blockQuotePrefixWhitespace" || tailEvent[1].type === "blockQuoteMarker" || tailEvent[1].type === "listItemIndent") {} else break;
							}
							if (firstBlankLineIndex && (!lineIndex || firstBlankLineIndex < lineIndex)) listItem._spread = true;
							listItem.end = Object.assign({}, lineIndex ? events[lineIndex][1].start : event[1].end);
							events.splice(lineIndex || index, 0, [
								"exit",
								listItem,
								event[2]
							]);
							index++;
							length++;
						}
						if (event[1].type === "listItemPrefix") {
							/** @type {Token} */
							const item = {
								type: "listItem",
								_spread: false,
								start: Object.assign({}, event[1].start),
								end: void 0
							};
							listItem = item;
							events.splice(index, 0, [
								"enter",
								item,
								event[2]
							]);
							index++;
							length++;
							firstBlankLineIndex = void 0;
							atMarker = true;
						}
					}
				}
				events[start][1]._spread = listSpread;
				return length;
			}
			/**
			* Create an opener handle.
			*
			* @param {(token: Token) => Nodes} create
			*   Create a node.
			* @param {Handle | undefined} [and]
			*   Optional function to also run.
			* @returns {Handle}
			*   Handle.
			*/
			function opener(create, and) {
				return open;
				/**
				* @this {CompileContext}
				* @param {Token} token
				* @returns {undefined}
				*/
				function open(token) {
					enter.call(this, create(token), token);
					if (and) and.call(this, token);
				}
			}
			/**
			* @type {CompileContext['buffer']}
			*/
			function buffer() {
				this.stack.push({
					type: "fragment",
					children: []
				});
			}
			/**
			* @type {CompileContext['enter']}
			*/
			function enter(node, token, errorHandler) {
				this.stack[this.stack.length - 1].children.push(node);
				this.stack.push(node);
				this.tokenStack.push([token, errorHandler || void 0]);
				node.position = {
					start: point(token.start),
					end: void 0
				};
			}
			/**
			* Create a closer handle.
			*
			* @param {Handle | undefined} [and]
			*   Optional function to also run.
			* @returns {Handle}
			*   Handle.
			*/
			function closer(and) {
				return close;
				/**
				* @this {CompileContext}
				* @param {Token} token
				* @returns {undefined}
				*/
				function close(token) {
					if (and) and.call(this, token);
					exit.call(this, token);
				}
			}
			/**
			* @type {CompileContext['exit']}
			*/
			function exit(token, onExitError) {
				const node = this.stack.pop();
				const open = this.tokenStack.pop();
				if (!open) throw new Error("Cannot close `" + token.type + "` (" + stringifyPosition({
					start: token.start,
					end: token.end
				}) + "): it’s not open");
				else if (open[0].type !== token.type) if (onExitError) onExitError.call(this, token, open[0]);
				else (open[1] || defaultOnError).call(this, token, open[0]);
				node.position.end = point(token.end);
			}
			/**
			* @type {CompileContext['resume']}
			*/
			function resume() {
				return toString$1(this.stack.pop());
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onenterlistordered() {
				this.data.expectingFirstListItemValue = true;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onenterlistitemvalue(token) {
				if (this.data.expectingFirstListItemValue) {
					const ancestor = this.stack[this.stack.length - 2];
					ancestor.start = Number.parseInt(this.sliceSerialize(token), 10);
					this.data.expectingFirstListItemValue = void 0;
				}
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcodefencedfenceinfo() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.lang = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcodefencedfencemeta() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.meta = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcodefencedfence() {
				if (this.data.flowCodeInside) return;
				this.buffer();
				this.data.flowCodeInside = true;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcodefenced() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.value = data.replace(/^(\r?\n|\r)|(\r?\n|\r)$/g, "");
				this.data.flowCodeInside = void 0;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcodeindented() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.value = data.replace(/(\r?\n|\r)$/g, "");
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitdefinitionlabelstring(token) {
				const label = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.label = label;
				node.identifier = normalizeIdentifier(this.sliceSerialize(token)).toLowerCase();
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitdefinitiontitlestring() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.title = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitdefinitiondestinationstring() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.url = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitatxheadingsequence(token) {
				const node = this.stack[this.stack.length - 1];
				if (!node.depth) node.depth = this.sliceSerialize(token).length;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitsetextheadingtext() {
				this.data.setextHeadingSlurpLineEnding = true;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitsetextheadinglinesequence(token) {
				const node = this.stack[this.stack.length - 1];
				node.depth = this.sliceSerialize(token).codePointAt(0) === 61 ? 1 : 2;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitsetextheading() {
				this.data.setextHeadingSlurpLineEnding = void 0;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onenterdata(token) {
				/** @type {Array<Nodes>} */
				const siblings = this.stack[this.stack.length - 1].children;
				let tail = siblings[siblings.length - 1];
				if (!tail || tail.type !== "text") {
					tail = text();
					tail.position = {
						start: point(token.start),
						end: void 0
					};
					siblings.push(tail);
				}
				this.stack.push(tail);
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitdata(token) {
				const tail = this.stack.pop();
				tail.value += this.sliceSerialize(token);
				tail.position.end = point(token.end);
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitlineending(token) {
				const context = this.stack[this.stack.length - 1];
				if (this.data.atHardBreak) {
					const tail = context.children[context.children.length - 1];
					tail.position.end = point(token.end);
					this.data.atHardBreak = void 0;
					return;
				}
				if (!this.data.setextHeadingSlurpLineEnding && config.canContainEols.includes(context.type)) {
					onenterdata.call(this, token);
					onexitdata.call(this, token);
				}
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexithardbreak() {
				this.data.atHardBreak = true;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexithtmlflow() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.value = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexithtmltext() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.value = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcodetext() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.value = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitlink() {
				const node = this.stack[this.stack.length - 1];
				if (this.data.inReference) {
					/** @type {ReferenceType} */
					const referenceType = this.data.referenceType || "shortcut";
					node.type += "Reference";
					node.referenceType = referenceType;
					delete node.url;
					delete node.title;
				} else {
					delete node.identifier;
					delete node.label;
				}
				this.data.referenceType = void 0;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitimage() {
				const node = this.stack[this.stack.length - 1];
				if (this.data.inReference) {
					/** @type {ReferenceType} */
					const referenceType = this.data.referenceType || "shortcut";
					node.type += "Reference";
					node.referenceType = referenceType;
					delete node.url;
					delete node.title;
				} else {
					delete node.identifier;
					delete node.label;
				}
				this.data.referenceType = void 0;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitlabeltext(token) {
				const string = this.sliceSerialize(token);
				const ancestor = this.stack[this.stack.length - 2];
				ancestor.label = decodeString(string);
				ancestor.identifier = normalizeIdentifier(string).toLowerCase();
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitlabel() {
				const fragment = this.stack[this.stack.length - 1];
				const value = this.resume();
				const node = this.stack[this.stack.length - 1];
				this.data.inReference = true;
				if (node.type === "link") node.children = fragment.children;
				else node.alt = value;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitresourcedestinationstring() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.url = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitresourcetitlestring() {
				const data = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.title = data;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitresource() {
				this.data.inReference = void 0;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onenterreference() {
				this.data.referenceType = "collapsed";
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitreferencestring(token) {
				const label = this.resume();
				const node = this.stack[this.stack.length - 1];
				node.label = label;
				node.identifier = normalizeIdentifier(this.sliceSerialize(token)).toLowerCase();
				this.data.referenceType = "full";
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcharacterreferencemarker(token) {
				this.data.characterReferenceType = token.type;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcharacterreferencevalue(token) {
				const data = this.sliceSerialize(token);
				const type = this.data.characterReferenceType;
				/** @type {string} */
				let value;
				if (type) {
					value = decodeNumericCharacterReference(data, type === "characterReferenceMarkerNumeric" ? 10 : 16);
					this.data.characterReferenceType = void 0;
				} else value = decodeNamedCharacterReference(data);
				const tail = this.stack[this.stack.length - 1];
				tail.value += value;
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitcharacterreference(token) {
				const tail = this.stack.pop();
				tail.position.end = point(token.end);
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitautolinkprotocol(token) {
				onexitdata.call(this, token);
				const node = this.stack[this.stack.length - 1];
				node.url = this.sliceSerialize(token);
			}
			/**
			* @this {CompileContext}
			* @type {Handle}
			*/
			function onexitautolinkemail(token) {
				onexitdata.call(this, token);
				const node = this.stack[this.stack.length - 1];
				node.url = "mailto:" + this.sliceSerialize(token);
			}
			/** @returns {Blockquote} */
			function blockQuote() {
				return {
					type: "blockquote",
					children: []
				};
			}
			/** @returns {Code} */
			function codeFlow() {
				return {
					type: "code",
					lang: null,
					meta: null,
					value: ""
				};
			}
			/** @returns {InlineCode} */
			function codeText() {
				return {
					type: "inlineCode",
					value: ""
				};
			}
			/** @returns {Definition} */
			function definition() {
				return {
					type: "definition",
					identifier: "",
					label: null,
					title: null,
					url: ""
				};
			}
			/** @returns {Emphasis} */
			function emphasis() {
				return {
					type: "emphasis",
					children: []
				};
			}
			/** @returns {Heading} */
			function heading() {
				return {
					type: "heading",
					depth: 0,
					children: []
				};
			}
			/** @returns {Break} */
			function hardBreak() {
				return { type: "break" };
			}
			/** @returns {Html} */
			function html() {
				return {
					type: "html",
					value: ""
				};
			}
			/** @returns {Image} */
			function image() {
				return {
					type: "image",
					title: null,
					url: "",
					alt: null
				};
			}
			/** @returns {Link} */
			function link() {
				return {
					type: "link",
					title: null,
					url: "",
					children: []
				};
			}
			/**
			* @param {Token} token
			* @returns {List}
			*/
			function list(token) {
				return {
					type: "list",
					ordered: token.type === "listOrdered",
					start: null,
					spread: token._spread,
					children: []
				};
			}
			/**
			* @param {Token} token
			* @returns {ListItem}
			*/
			function listItem(token) {
				return {
					type: "listItem",
					spread: token._spread,
					checked: null,
					children: []
				};
			}
			/** @returns {Paragraph} */
			function paragraph() {
				return {
					type: "paragraph",
					children: []
				};
			}
			/** @returns {Strong} */
			function strong() {
				return {
					type: "strong",
					children: []
				};
			}
			/** @returns {Text} */
			function text() {
				return {
					type: "text",
					value: ""
				};
			}
			/** @returns {ThematicBreak} */
			function thematicBreak() {
				return { type: "thematicBreak" };
			}
		}
		/**
		* Copy a point-like value.
		*
		* @param {Point} d
		*   Point-like value.
		* @returns {Point}
		*   unist point.
		*/
		function point(d) {
			return {
				line: d.line,
				column: d.column,
				offset: d.offset
			};
		}
		/**
		* @param {Config} combined
		* @param {Array<Array<Extension> | Extension>} extensions
		* @returns {undefined}
		*/
		function configure(combined, extensions) {
			let index = -1;
			while (++index < extensions.length) {
				const value = extensions[index];
				if (Array.isArray(value)) configure(combined, value);
				else extension(combined, value);
			}
		}
		/**
		* @param {Config} combined
		* @param {Extension} extension
		* @returns {undefined}
		*/
		function extension(combined, extension) {
			/** @type {keyof Extension} */
			let key;
			for (key in extension) if (own$2.call(extension, key)) switch (key) {
				case "canContainEols": {
					const right = extension[key];
					if (right) combined[key].push(...right);
					break;
				}
				case "transforms": {
					const right = extension[key];
					if (right) combined[key].push(...right);
					break;
				}
				case "enter":
				case "exit": {
					const right = extension[key];
					if (right) Object.assign(combined[key], right);
					break;
				}
			}
		}
		/** @type {OnEnterError} */
		function defaultOnError(left, right) {
			if (left) throw new Error("Cannot close `" + left.type + "` (" + stringifyPosition({
				start: left.start,
				end: left.end
			}) + "): a different token (`" + right.type + "`, " + stringifyPosition({
				start: right.start,
				end: right.end
			}) + ") is open");
			else throw new Error("Cannot close document, a token (`" + right.type + "`, " + stringifyPosition({
				start: right.start,
				end: right.end
			}) + ") is still open");
		}
		//#endregion
		//#region node_modules/remark-parse/lib/index.js
		/**
		* @typedef {import('mdast').Root} Root
		* @typedef {import('mdast-util-from-markdown').Options} FromMarkdownOptions
		* @typedef {import('unified').Parser<Root>} Parser
		* @typedef {import('unified').Processor<Root>} Processor
		*/
		/**
		* @typedef {Omit<FromMarkdownOptions, 'extensions' | 'mdastExtensions'>} Options
		*/
		/**
		* Aadd support for parsing from markdown.
		*
		* @param {Readonly<Options> | null | undefined} [options]
		*   Configuration (optional).
		* @returns {undefined}
		*   Nothing.
		*/
		function remarkParse(options) {
			/** @type {Processor} */
			const self = this;
			self.parser = parser;
			/**
			* @type {Parser}
			*/
			function parser(doc) {
				return fromMarkdown(doc, {
					...self.data("settings"),
					...options,
					extensions: self.data("micromarkExtensions") || [],
					mdastExtensions: self.data("fromMarkdownExtensions") || []
				});
			}
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/blockquote.js
		/**
		* @import {Element} from 'hast'
		* @import {Blockquote} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `blockquote` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Blockquote} node
		*   mdast node.
		* @returns {Element}
		*   hast node.
		*/
		function blockquote$1(state, node) {
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "blockquote",
				properties: {},
				children: state.wrap(state.all(node), true)
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/break.js
		/**
		* @import {Element, Text} from 'hast'
		* @import {Break} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `break` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Break} node
		*   mdast node.
		* @returns {Array<Element | Text>}
		*   hast element content.
		*/
		function hardBreak$1(state, node) {
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "br",
				properties: {},
				children: []
			};
			state.patch(node, result);
			return [state.applyData(node, result), {
				type: "text",
				value: "\n"
			}];
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/code.js
		/**
		* @import {Element, Properties} from 'hast'
		* @import {Code} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `code` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Code} node
		*   mdast node.
		* @returns {Element}
		*   hast node.
		*/
		function code$2(state, node) {
			const value = node.value ? node.value + "\n" : "";
			/** @type {Properties} */
			const properties = {};
			const language = node.lang ? node.lang.split(/\s+/) : [];
			if (language.length > 0) properties.className = ["language-" + language[0]];
			/** @type {Element} */
			let result = {
				type: "element",
				tagName: "code",
				properties,
				children: [{
					type: "text",
					value
				}]
			};
			if (node.meta) result.data = { meta: node.meta };
			state.patch(node, result);
			result = state.applyData(node, result);
			result = {
				type: "element",
				tagName: "pre",
				properties: {},
				children: [result]
			};
			state.patch(node, result);
			return result;
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/delete.js
		/**
		* @import {Element} from 'hast'
		* @import {Delete} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `delete` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Delete} node
		*   mdast node.
		* @returns {Element}
		*   hast node.
		*/
		function strikethrough(state, node) {
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "del",
				properties: {},
				children: state.all(node)
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/emphasis.js
		/**
		* @import {Element} from 'hast'
		* @import {Emphasis} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `emphasis` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Emphasis} node
		*   mdast node.
		* @returns {Element}
		*   hast node.
		*/
		function emphasis$1(state, node) {
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "em",
				properties: {},
				children: state.all(node)
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/footnote-reference.js
		/**
		* @import {Element} from 'hast'
		* @import {FootnoteReference} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `footnoteReference` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {FootnoteReference} node
		*   mdast node.
		* @returns {Element}
		*   hast node.
		*/
		function footnoteReference$1(state, node) {
			const clobberPrefix = typeof state.options.clobberPrefix === "string" ? state.options.clobberPrefix : "user-content-";
			const id = String(node.identifier).toUpperCase();
			const safeId = normalizeUri(id.toLowerCase());
			const index = state.footnoteOrder.indexOf(id);
			/** @type {number} */
			let counter;
			let reuseCounter = state.footnoteCounts.get(id);
			if (reuseCounter === void 0) {
				reuseCounter = 0;
				state.footnoteOrder.push(id);
				counter = state.footnoteOrder.length;
			} else counter = index + 1;
			reuseCounter += 1;
			state.footnoteCounts.set(id, reuseCounter);
			/** @type {Element} */
			const link = {
				type: "element",
				tagName: "a",
				properties: {
					href: "#" + clobberPrefix + "fn-" + safeId,
					id: clobberPrefix + "fnref-" + safeId + (reuseCounter > 1 ? "-" + reuseCounter : ""),
					dataFootnoteRef: true,
					ariaDescribedBy: ["footnote-label"]
				},
				children: [{
					type: "text",
					value: String(counter)
				}]
			};
			state.patch(node, link);
			/** @type {Element} */
			const sup = {
				type: "element",
				tagName: "sup",
				properties: {},
				children: [link]
			};
			state.patch(node, sup);
			return state.applyData(node, sup);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/heading.js
		/**
		* @import {Element} from 'hast'
		* @import {Heading} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `heading` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Heading} node
		*   mdast node.
		* @returns {Element}
		*   hast node.
		*/
		function heading$1(state, node) {
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "h" + node.depth,
				properties: {},
				children: state.all(node)
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/html.js
		/**
		* @import {Element} from 'hast'
		* @import {Html} from 'mdast'
		* @import {State} from '../state.js'
		* @import {Raw} from '../../index.js'
		*/
		/**
		* Turn an mdast `html` node into hast (`raw` node in dangerous mode, otherwise
		* nothing).
		*
		* @param {State} state
		*   Info passed around.
		* @param {Html} node
		*   mdast node.
		* @returns {Element | Raw | undefined}
		*   hast node.
		*/
		function html$1(state, node) {
			if (state.options.allowDangerousHtml) {
				/** @type {Raw} */
				const result = {
					type: "raw",
					value: node.value
				};
				state.patch(node, result);
				return state.applyData(node, result);
			}
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/revert.js
		/**
		* @import {ElementContent} from 'hast'
		* @import {Reference, Nodes} from 'mdast'
		* @import {State} from './state.js'
		*/
		/**
		* Return the content of a reference without definition as plain text.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Extract<Nodes, Reference>} node
		*   Reference node (image, link).
		* @returns {Array<ElementContent>}
		*   hast content.
		*/
		function revert(state, node) {
			const subtype = node.referenceType;
			let suffix = "]";
			if (subtype === "collapsed") suffix += "[]";
			else if (subtype === "full") suffix += "[" + (node.label || node.identifier) + "]";
			if (node.type === "imageReference") return [{
				type: "text",
				value: "![" + node.alt + suffix
			}];
			const contents = state.all(node);
			const head = contents[0];
			if (head && head.type === "text") head.value = "[" + head.value;
			else contents.unshift({
				type: "text",
				value: "["
			});
			const tail = contents[contents.length - 1];
			if (tail && tail.type === "text") tail.value += suffix;
			else contents.push({
				type: "text",
				value: suffix
			});
			return contents;
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/image-reference.js
		/**
		* @import {ElementContent, Element, Properties} from 'hast'
		* @import {ImageReference} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `imageReference` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {ImageReference} node
		*   mdast node.
		* @returns {Array<ElementContent> | ElementContent}
		*   hast node.
		*/
		function imageReference$1(state, node) {
			const id = String(node.identifier).toUpperCase();
			const definition = state.definitionById.get(id);
			if (!definition) return revert(state, node);
			/** @type {Properties} */
			const properties = {
				src: normalizeUri(definition.url || ""),
				alt: node.alt
			};
			if (definition.title !== null && definition.title !== void 0) properties.title = definition.title;
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "img",
				properties,
				children: []
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/image.js
		/**
		* @import {Element, Properties} from 'hast'
		* @import {Image} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `image` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Image} node
		*   mdast node.
		* @returns {Element}
		*   hast node.
		*/
		function image$1(state, node) {
			/** @type {Properties} */
			const properties = { src: normalizeUri(node.url) };
			if (node.alt !== null && node.alt !== void 0) properties.alt = node.alt;
			if (node.title !== null && node.title !== void 0) properties.title = node.title;
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "img",
				properties,
				children: []
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/inline-code.js
		/**
		* @import {Element, Text} from 'hast'
		* @import {InlineCode} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `inlineCode` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {InlineCode} node
		*   mdast node.
		* @returns {Element}
		*   hast node.
		*/
		function inlineCode$1(state, node) {
			/** @type {Text} */
			const text = {
				type: "text",
				value: node.value.replace(/\r?\n|\r/g, " ")
			};
			state.patch(node, text);
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "code",
				properties: {},
				children: [text]
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/link-reference.js
		/**
		* @import {ElementContent, Element, Properties} from 'hast'
		* @import {LinkReference} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `linkReference` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {LinkReference} node
		*   mdast node.
		* @returns {Array<ElementContent> | ElementContent}
		*   hast node.
		*/
		function linkReference$1(state, node) {
			const id = String(node.identifier).toUpperCase();
			const definition = state.definitionById.get(id);
			if (!definition) return revert(state, node);
			/** @type {Properties} */
			const properties = { href: normalizeUri(definition.url || "") };
			if (definition.title !== null && definition.title !== void 0) properties.title = definition.title;
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "a",
				properties,
				children: state.all(node)
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/link.js
		/**
		* @import {Element, Properties} from 'hast'
		* @import {Link} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `link` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Link} node
		*   mdast node.
		* @returns {Element}
		*   hast node.
		*/
		function link$1(state, node) {
			/** @type {Properties} */
			const properties = { href: normalizeUri(node.url) };
			if (node.title !== null && node.title !== void 0) properties.title = node.title;
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "a",
				properties,
				children: state.all(node)
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/list-item.js
		/**
		* @import {ElementContent, Element, Properties} from 'hast'
		* @import {ListItem, Parents} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `listItem` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {ListItem} node
		*   mdast node.
		* @param {Parents | undefined} parent
		*   Parent of `node`.
		* @returns {Element}
		*   hast node.
		*/
		function listItem$1(state, node, parent) {
			const results = state.all(node);
			const loose = parent ? listLoose(parent) : listItemLoose(node);
			/** @type {Properties} */
			const properties = {};
			/** @type {Array<ElementContent>} */
			const children = [];
			if (typeof node.checked === "boolean") {
				const head = results[0];
				/** @type {Element} */
				let paragraph;
				if (head && head.type === "element" && head.tagName === "p") paragraph = head;
				else {
					paragraph = {
						type: "element",
						tagName: "p",
						properties: {},
						children: []
					};
					results.unshift(paragraph);
				}
				if (paragraph.children.length > 0) paragraph.children.unshift({
					type: "text",
					value: " "
				});
				paragraph.children.unshift({
					type: "element",
					tagName: "input",
					properties: {
						type: "checkbox",
						checked: node.checked,
						disabled: true
					},
					children: []
				});
				properties.className = ["task-list-item"];
			}
			let index = -1;
			while (++index < results.length) {
				const child = results[index];
				if (loose || index !== 0 || child.type !== "element" || child.tagName !== "p") children.push({
					type: "text",
					value: "\n"
				});
				if (child.type === "element" && child.tagName === "p" && !loose) children.push(...child.children);
				else children.push(child);
			}
			const tail = results[results.length - 1];
			if (tail && (loose || tail.type !== "element" || tail.tagName !== "p")) children.push({
				type: "text",
				value: "\n"
			});
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "li",
				properties,
				children
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		/**
		* @param {Parents} node
		* @return {Boolean}
		*/
		function listLoose(node) {
			let loose = false;
			if (node.type === "list") {
				loose = node.spread || false;
				const children = node.children;
				let index = -1;
				while (!loose && ++index < children.length) loose = listItemLoose(children[index]);
			}
			return loose;
		}
		/**
		* @param {ListItem} node
		* @return {Boolean}
		*/
		function listItemLoose(node) {
			const spread = node.spread;
			return spread === null || spread === void 0 ? node.children.length > 1 : spread;
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/list.js
		/**
		* @import {Element, Properties} from 'hast'
		* @import {List} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `list` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {List} node
		*   mdast node.
		* @returns {Element}
		*   hast node.
		*/
		function list$1(state, node) {
			/** @type {Properties} */
			const properties = {};
			const results = state.all(node);
			let index = -1;
			if (typeof node.start === "number" && node.start !== 1) properties.start = node.start;
			while (++index < results.length) {
				const child = results[index];
				if (child.type === "element" && child.tagName === "li" && child.properties && Array.isArray(child.properties.className) && child.properties.className.includes("task-list-item")) {
					properties.className = ["contains-task-list"];
					break;
				}
			}
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: node.ordered ? "ol" : "ul",
				properties,
				children: state.wrap(results, true)
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/paragraph.js
		/**
		* @import {Element} from 'hast'
		* @import {Paragraph} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `paragraph` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Paragraph} node
		*   mdast node.
		* @returns {Element}
		*   hast node.
		*/
		function paragraph$1(state, node) {
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "p",
				properties: {},
				children: state.all(node)
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/root.js
		/**
		* @import {Parents as HastParents, Root as HastRoot} from 'hast'
		* @import {Root as MdastRoot} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `root` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {MdastRoot} node
		*   mdast node.
		* @returns {HastParents}
		*   hast node.
		*/
		function root$1(state, node) {
			/** @type {HastRoot} */
			const result = {
				type: "root",
				children: state.wrap(state.all(node))
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/strong.js
		/**
		* @import {Element} from 'hast'
		* @import {Strong} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `strong` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Strong} node
		*   mdast node.
		* @returns {Element}
		*   hast node.
		*/
		function strong$1(state, node) {
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "strong",
				properties: {},
				children: state.all(node)
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/table.js
		/**
		* @import {Table} from 'mdast'
		* @import {Element} from 'hast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `table` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {Table} node
		*   mdast node.
		* @returns {Element}
		*   hast node.
		*/
		function table(state, node) {
			const rows = state.all(node);
			const firstRow = rows.shift();
			/** @type {Array<Element>} */
			const tableContent = [];
			if (firstRow) {
				/** @type {Element} */
				const head = {
					type: "element",
					tagName: "thead",
					properties: {},
					children: state.wrap([firstRow], true)
				};
				state.patch(node.children[0], head);
				tableContent.push(head);
			}
			if (rows.length > 0) {
				/** @type {Element} */
				const body = {
					type: "element",
					tagName: "tbody",
					properties: {},
					children: state.wrap(rows, true)
				};
				const start = pointStart(node.children[1]);
				const end = pointEnd(node.children[node.children.length - 1]);
				if (start && end) body.position = {
					start,
					end
				};
				tableContent.push(body);
			}
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "table",
				properties: {},
				children: state.wrap(tableContent, true)
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/table-row.js
		/**
		* @import {Element, ElementContent, Properties} from 'hast'
		* @import {Parents, TableRow} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `tableRow` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {TableRow} node
		*   mdast node.
		* @param {Parents | undefined} parent
		*   Parent of `node`.
		* @returns {Element}
		*   hast node.
		*/
		function tableRow(state, node, parent) {
			const siblings = parent ? parent.children : void 0;
			const tagName = (siblings ? siblings.indexOf(node) : 1) === 0 ? "th" : "td";
			const align = parent && parent.type === "table" ? parent.align : void 0;
			const length = align ? align.length : node.children.length;
			let cellIndex = -1;
			/** @type {Array<ElementContent>} */
			const cells = [];
			while (++cellIndex < length) {
				const cell = node.children[cellIndex];
				/** @type {Properties} */
				const properties = {};
				const alignValue = align ? align[cellIndex] : void 0;
				if (alignValue) properties.align = alignValue;
				/** @type {Element} */
				let result = {
					type: "element",
					tagName,
					properties,
					children: []
				};
				if (cell) {
					result.children = state.all(cell);
					state.patch(cell, result);
					result = state.applyData(cell, result);
				}
				cells.push(result);
			}
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "tr",
				properties: {},
				children: state.wrap(cells, true)
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/table-cell.js
		/**
		* @import {Element} from 'hast'
		* @import {TableCell} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `tableCell` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {TableCell} node
		*   mdast node.
		* @returns {Element}
		*   hast node.
		*/
		function tableCell(state, node) {
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "td",
				properties: {},
				children: state.all(node)
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/trim-lines/index.js
		const tab = 9;
		const space = 32;
		/**
		* Remove initial and final spaces and tabs at the line breaks in `value`.
		* Does not trim initial and final spaces and tabs of the value itself.
		*
		* @param {string} value
		*   Value to trim.
		* @returns {string}
		*   Trimmed value.
		*/
		function trimLines(value) {
			const source = String(value);
			const search = /\r?\n|\r/g;
			let match = search.exec(source);
			let last = 0;
			/** @type {Array<string>} */
			const lines = [];
			while (match) {
				lines.push(trimLine(source.slice(last, match.index), last > 0, true), match[0]);
				last = match.index + match[0].length;
				match = search.exec(source);
			}
			lines.push(trimLine(source.slice(last), last > 0, false));
			return lines.join("");
		}
		/**
		* @param {string} value
		*   Line to trim.
		* @param {boolean} start
		*   Whether to trim the start of the line.
		* @param {boolean} end
		*   Whether to trim the end of the line.
		* @returns {string}
		*   Trimmed line.
		*/
		function trimLine(value, start, end) {
			let startIndex = 0;
			let endIndex = value.length;
			if (start) {
				let code = value.codePointAt(startIndex);
				while (code === tab || code === space) {
					startIndex++;
					code = value.codePointAt(startIndex);
				}
			}
			if (end) {
				let code = value.codePointAt(endIndex - 1);
				while (code === tab || code === space) {
					endIndex--;
					code = value.codePointAt(endIndex - 1);
				}
			}
			return endIndex > startIndex ? value.slice(startIndex, endIndex) : "";
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/text.js
		/**
		* @import {Element as HastElement, Text as HastText} from 'hast'
		* @import {Text as MdastText} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `text` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {MdastText} node
		*   mdast node.
		* @returns {HastElement | HastText}
		*   hast node.
		*/
		function text$2(state, node) {
			/** @type {HastText} */
			const result = {
				type: "text",
				value: trimLines(String(node.value))
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/thematic-break.js
		/**
		* @import {Element} from 'hast'
		* @import {ThematicBreak} from 'mdast'
		* @import {State} from '../state.js'
		*/
		/**
		* Turn an mdast `thematicBreak` node into hast.
		*
		* @param {State} state
		*   Info passed around.
		* @param {ThematicBreak} node
		*   mdast node.
		* @returns {Element}
		*   hast node.
		*/
		function thematicBreak$1(state, node) {
			/** @type {Element} */
			const result = {
				type: "element",
				tagName: "hr",
				properties: {},
				children: []
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/handlers/index.js
		/**
		* @import {Handlers} from '../state.js'
		*/
		/**
		* Default handlers for nodes.
		*
		* @satisfies {Handlers}
		*/
		const handlers = {
			blockquote: blockquote$1,
			break: hardBreak$1,
			code: code$2,
			delete: strikethrough,
			emphasis: emphasis$1,
			footnoteReference: footnoteReference$1,
			heading: heading$1,
			html: html$1,
			imageReference: imageReference$1,
			image: image$1,
			inlineCode: inlineCode$1,
			linkReference: linkReference$1,
			link: link$1,
			listItem: listItem$1,
			list: list$1,
			paragraph: paragraph$1,
			root: root$1,
			strong: strong$1,
			table,
			tableCell,
			tableRow,
			text: text$2,
			thematicBreak: thematicBreak$1,
			toml: ignore,
			yaml: ignore,
			definition: ignore,
			footnoteDefinition: ignore
		};
		function ignore() {}
		//#endregion
		//#region node_modules/@ungap/structured-clone/esm/deserialize.js
		const { defineProperty } = Object;
		const env = typeof self === "object" ? self : globalThis;
		const guard = (name, init) => {
			switch (name) {
				case "Function":
				case "SharedWorker":
				case "Worker":
				case "eval":
				case "setInterval":
				case "setTimeout": throw new TypeError("unable to deserialize " + name);
			}
			return new env[name](init);
		};
		const deserializer = ($, _) => {
			const as = (out, index) => {
				$.set(index, out);
				return out;
			};
			const unpair = (index) => {
				if ($.has(index)) return $.get(index);
				const [type, value] = _[index];
				switch (type) {
					case 0:
					case -1: return as(value, index);
					case 1: {
						const arr = as([], index);
						for (const index of value) arr.push(unpair(index));
						return arr;
					}
					case 2: {
						const object = as({}, index);
						for (const [key, index] of value) {
							const k = unpair(key), value = unpair(index);
							if (k === "__proto__") defineProperty(object, k, {
								value,
								configurable: true,
								enumerable: true,
								writable: true
							});
							else object[k] = value;
						}
						return object;
					}
					case 3: return as(new Date(value), index);
					case 4: {
						const { source, flags } = value;
						return as(new RegExp(source, flags), index);
					}
					case 5: {
						const map = as(/* @__PURE__ */ new Map(), index);
						for (const [key, index] of value) map.set(unpair(key), unpair(index));
						return map;
					}
					case 6: {
						const set = as(/* @__PURE__ */ new Set(), index);
						for (const index of value) set.add(unpair(index));
						return set;
					}
					case 7: {
						const { name, message } = value;
						return as(typeof env[name] === "function" ? guard(name, message) : new Error(message), index);
					}
					case 8: return as(BigInt(value), index);
					case "BigInt": return as(Object(BigInt(value)), index);
					case "ArrayBuffer": return as(new Uint8Array(value).buffer, value);
					case "DataView": {
						const { buffer } = new Uint8Array(value);
						return as(new DataView(buffer), value);
					}
					case "-0": return -0;
				}
				return as(guard(type, value), index);
			};
			return unpair;
		};
		/**
		* @typedef {Array<string,any>} Record a type representation
		*/
		/**
		* Returns a deserialized value from a serialized array of Records.
		* @param {Record[]} serialized a previously serialized value.
		* @returns {any}
		*/
		const deserialize = (serialized) => deserializer(/* @__PURE__ */ new Map(), serialized)(0);
		//#endregion
		//#region node_modules/@ungap/structured-clone/esm/serialize.js
		const EMPTY = "";
		const { toString } = {};
		const { keys, is } = Object;
		const typeOf = (value) => {
			const type = typeof value;
			if (type !== "object" || !value) return [0, type];
			const asString = toString.call(value).slice(8, -1);
			switch (asString) {
				case "Array": return [1, EMPTY];
				case "Object": return [2, EMPTY];
				case "Date": return [3, EMPTY];
				case "RegExp": return [4, EMPTY];
				case "Map": return [5, EMPTY];
				case "Set": return [6, EMPTY];
				case "DataView": return [1, asString];
			}
			if (asString.includes("Array")) return [1, asString];
			if (value instanceof Error) return [7, value.name || "Error"];
			return [2, asString];
		};
		const shouldSkip = ([TYPE, type]) => TYPE === 0 && (type === "function" || type === "symbol");
		const serializer = (strict, json, $, _) => {
			const as = (out, value) => {
				const index = _.push(out) - 1;
				$.set(value, index);
				return index;
			};
			const pair = (value) => {
				if ($.has(value)) return $.get(value);
				let [TYPE, type] = typeOf(value);
				switch (TYPE) {
					case 0: {
						let entry = value;
						switch (type) {
							case "bigint":
								TYPE = 8;
								entry = value.toString();
								break;
							case "number":
								if (!value && is(value, -0)) return _.push(["-0"]) - 1;
								break;
							case "function":
							case "symbol":
								if (strict) throw new TypeError("unable to serialize " + type);
								entry = null;
								break;
							case "undefined": return as([-1], value);
						}
						return as([TYPE, entry], value);
					}
					case 1: {
						if (type) {
							let spread = value;
							if (type === "DataView") spread = new Uint8Array(value.buffer);
							else if (type === "ArrayBuffer") spread = new Uint8Array(value);
							return as([type, [...spread]], value);
						}
						const arr = [];
						const index = as([TYPE, arr], value);
						for (const entry of value) arr.push(pair(entry));
						return index;
					}
					case 2: {
						if (type) switch (type) {
							case "BigInt": return as([type, value.toString()], value);
							case "Boolean":
							case "Number":
							case "String": return as([type, value.valueOf()], value);
						}
						if (json && "toJSON" in value) return pair(value.toJSON());
						const entries = [];
						const index = as([TYPE, entries], value);
						for (const key of keys(value)) if (strict || !shouldSkip(typeOf(value[key]))) entries.push([pair(key), pair(value[key])]);
						return index;
					}
					case 3: return as([TYPE, isNaN(value.getTime()) ? EMPTY : value.toISOString()], value);
					case 4: {
						const { source, flags } = value;
						return as([TYPE, {
							source,
							flags
						}], value);
					}
					case 5: {
						const entries = [];
						const index = as([TYPE, entries], value);
						for (const [key, entry] of value) if (strict || !(shouldSkip(typeOf(key)) || shouldSkip(typeOf(entry)))) entries.push([pair(key), pair(entry)]);
						return index;
					}
					case 6: {
						const entries = [];
						const index = as([TYPE, entries], value);
						for (const entry of value) if (strict || !shouldSkip(typeOf(entry))) entries.push(pair(entry));
						return index;
					}
				}
				const { message } = value;
				return as([TYPE, {
					name: type,
					message
				}], value);
			};
			return pair;
		};
		/**
		* @typedef {Array<string,any>} Record a type representation
		*/
		/**
		* Returns an array of serialized Records.
		* @param {any} value a serializable value.
		* @param {{json?: boolean, lossy?: boolean}?} options an object with a `lossy` or `json` property that,
		*  if `true`, will not throw errors on incompatible types, and behave more
		*  like JSON stringify would behave. Symbol and Function will be discarded.
		* @returns {Record[]}
		*/
		const serialize$1 = (value, { json, lossy } = {}) => {
			const _ = [];
			return serializer(!(json || lossy), !!json, /* @__PURE__ */ new Map(), _)(value), _;
		};
		//#endregion
		//#region node_modules/@ungap/structured-clone/esm/index.js
		/**
		* @typedef {Array<string,any>} Record a type representation
		*/
		/**
		* Returns an array of serialized Records.
		* @param {any} any a serializable value.
		* @param {{transfer?: any[], json?: boolean, lossy?: boolean}?} options an object with
		* a transfer option (ignored when polyfilled) and/or non standard fields that
		* fallback to the polyfill if present.
		* @returns {Record[]}
		*/
		var esm_default = typeof structuredClone === "function" ? (any, options) => options && ("json" in options || "lossy" in options) ? deserialize(serialize$1(any, options)) : structuredClone(any) : (any, options) => deserialize(serialize$1(any, options));
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/footer.js
		/**
		* @import {ElementContent, Element} from 'hast'
		* @import {State} from './state.js'
		*/
		/**
		* @callback FootnoteBackContentTemplate
		*   Generate content for the backreference dynamically.
		*
		*   For the following markdown:
		*
		*   ```markdown
		*   Alpha[^micromark], bravo[^micromark], and charlie[^remark].
		*
		*   [^remark]: things about remark
		*   [^micromark]: things about micromark
		*   ```
		*
		*   This function will be called with:
		*
		*   *  `0` and `0` for the backreference from `things about micromark` to
		*      `alpha`, as it is the first used definition, and the first call to it
		*   *  `0` and `1` for the backreference from `things about micromark` to
		*      `bravo`, as it is the first used definition, and the second call to it
		*   *  `1` and `0` for the backreference from `things about remark` to
		*      `charlie`, as it is the second used definition
		* @param {number} referenceIndex
		*   Index of the definition in the order that they are first referenced,
		*   0-indexed.
		* @param {number} rereferenceIndex
		*   Index of calls to the same definition, 0-indexed.
		* @returns {Array<ElementContent> | ElementContent | string}
		*   Content for the backreference when linking back from definitions to their
		*   reference.
		*
		* @callback FootnoteBackLabelTemplate
		*   Generate a back label dynamically.
		*
		*   For the following markdown:
		*
		*   ```markdown
		*   Alpha[^micromark], bravo[^micromark], and charlie[^remark].
		*
		*   [^remark]: things about remark
		*   [^micromark]: things about micromark
		*   ```
		*
		*   This function will be called with:
		*
		*   *  `0` and `0` for the backreference from `things about micromark` to
		*      `alpha`, as it is the first used definition, and the first call to it
		*   *  `0` and `1` for the backreference from `things about micromark` to
		*      `bravo`, as it is the first used definition, and the second call to it
		*   *  `1` and `0` for the backreference from `things about remark` to
		*      `charlie`, as it is the second used definition
		* @param {number} referenceIndex
		*   Index of the definition in the order that they are first referenced,
		*   0-indexed.
		* @param {number} rereferenceIndex
		*   Index of calls to the same definition, 0-indexed.
		* @returns {string}
		*   Back label to use when linking back from definitions to their reference.
		*/
		/**
		* Generate the default content that GitHub uses on backreferences.
		*
		* @param {number} _
		*   Index of the definition in the order that they are first referenced,
		*   0-indexed.
		* @param {number} rereferenceIndex
		*   Index of calls to the same definition, 0-indexed.
		* @returns {Array<ElementContent>}
		*   Content.
		*/
		function defaultFootnoteBackContent(_, rereferenceIndex) {
			/** @type {Array<ElementContent>} */
			const result = [{
				type: "text",
				value: "↩"
			}];
			if (rereferenceIndex > 1) result.push({
				type: "element",
				tagName: "sup",
				properties: {},
				children: [{
					type: "text",
					value: String(rereferenceIndex)
				}]
			});
			return result;
		}
		/**
		* Generate the default label that GitHub uses on backreferences.
		*
		* @param {number} referenceIndex
		*   Index of the definition in the order that they are first referenced,
		*   0-indexed.
		* @param {number} rereferenceIndex
		*   Index of calls to the same definition, 0-indexed.
		* @returns {string}
		*   Label.
		*/
		function defaultFootnoteBackLabel(referenceIndex, rereferenceIndex) {
			return "Back to reference " + (referenceIndex + 1) + (rereferenceIndex > 1 ? "-" + rereferenceIndex : "");
		}
		/**
		* Generate a hast footer for called footnote definitions.
		*
		* @param {State} state
		*   Info passed around.
		* @returns {Element | undefined}
		*   `section` element or `undefined`.
		*/
		function footer(state) {
			const clobberPrefix = typeof state.options.clobberPrefix === "string" ? state.options.clobberPrefix : "user-content-";
			const footnoteBackContent = state.options.footnoteBackContent || defaultFootnoteBackContent;
			const footnoteBackLabel = state.options.footnoteBackLabel || defaultFootnoteBackLabel;
			const footnoteLabel = state.options.footnoteLabel || "Footnotes";
			const footnoteLabelTagName = state.options.footnoteLabelTagName || "h2";
			const footnoteLabelProperties = state.options.footnoteLabelProperties || { className: ["sr-only"] };
			/** @type {Array<ElementContent>} */
			const listItems = [];
			let referenceIndex = -1;
			while (++referenceIndex < state.footnoteOrder.length) {
				const definition = state.footnoteById.get(state.footnoteOrder[referenceIndex]);
				if (!definition) continue;
				const content = state.all(definition);
				const id = String(definition.identifier).toUpperCase();
				const safeId = normalizeUri(id.toLowerCase());
				let rereferenceIndex = 0;
				/** @type {Array<ElementContent>} */
				const backReferences = [];
				const counts = state.footnoteCounts.get(id);
				while (counts !== void 0 && ++rereferenceIndex <= counts) {
					if (backReferences.length > 0) backReferences.push({
						type: "text",
						value: " "
					});
					let children = typeof footnoteBackContent === "string" ? footnoteBackContent : footnoteBackContent(referenceIndex, rereferenceIndex);
					if (typeof children === "string") children = {
						type: "text",
						value: children
					};
					backReferences.push({
						type: "element",
						tagName: "a",
						properties: {
							href: "#" + clobberPrefix + "fnref-" + safeId + (rereferenceIndex > 1 ? "-" + rereferenceIndex : ""),
							dataFootnoteBackref: "",
							ariaLabel: typeof footnoteBackLabel === "string" ? footnoteBackLabel : footnoteBackLabel(referenceIndex, rereferenceIndex),
							className: ["data-footnote-backref"]
						},
						children: Array.isArray(children) ? children : [children]
					});
				}
				const tail = content[content.length - 1];
				if (tail && tail.type === "element" && tail.tagName === "p") {
					const tailTail = tail.children[tail.children.length - 1];
					if (tailTail && tailTail.type === "text") tailTail.value += " ";
					else tail.children.push({
						type: "text",
						value: " "
					});
					tail.children.push(...backReferences);
				} else content.push(...backReferences);
				/** @type {Element} */
				const listItem = {
					type: "element",
					tagName: "li",
					properties: { id: clobberPrefix + "fn-" + safeId },
					children: state.wrap(content, true)
				};
				state.patch(definition, listItem);
				listItems.push(listItem);
			}
			if (listItems.length === 0) return;
			return {
				type: "element",
				tagName: "section",
				properties: {
					dataFootnotes: true,
					className: ["footnotes"]
				},
				children: [
					{
						type: "element",
						tagName: footnoteLabelTagName,
						properties: {
							...esm_default(footnoteLabelProperties),
							id: "footnote-label"
						},
						children: [{
							type: "text",
							value: footnoteLabel
						}]
					},
					{
						type: "text",
						value: "\n"
					},
					{
						type: "element",
						tagName: "ol",
						properties: {},
						children: state.wrap(listItems, true)
					},
					{
						type: "text",
						value: "\n"
					}
				]
			};
		}
		//#endregion
		//#region node_modules/unist-util-is/lib/index.js
		/**
		* Generate an assertion from a test.
		*
		* Useful if you’re going to test many nodes, for example when creating a
		* utility where something else passes a compatible test.
		*
		* The created function is a bit faster because it expects valid input only:
		* a `node`, `index`, and `parent`.
		*
		* @param {Test} test
		*   *   when nullish, checks if `node` is a `Node`.
		*   *   when `string`, works like passing `(node) => node.type === test`.
		*   *   when `function` checks if function passed the node is true.
		*   *   when `object`, checks that all keys in test are in node, and that they have (strictly) equal values.
		*   *   when `array`, checks if any one of the subtests pass.
		* @returns {Check}
		*   An assertion.
		*/
		const convert = (
		/**
		* @param {Test} [test]
		* @returns {Check}
		*/
function(test) {
			if (test === null || test === void 0) return ok;
			if (typeof test === "function") return castFactory(test);
			if (typeof test === "object") return Array.isArray(test) ? anyFactory(test) : propertiesFactory(test);
			if (typeof test === "string") return typeFactory(test);
			throw new Error("Expected function, string, or object as test");
		});
		/**
		* @param {Array<Props | TestFunction | string>} tests
		* @returns {Check}
		*/
		function anyFactory(tests) {
			/** @type {Array<Check>} */
			const checks = [];
			let index = -1;
			while (++index < tests.length) checks[index] = convert(tests[index]);
			return castFactory(any);
			/**
			* @this {unknown}
			* @type {TestFunction}
			*/
			function any(...parameters) {
				let index = -1;
				while (++index < checks.length) if (checks[index].apply(this, parameters)) return true;
				return false;
			}
		}
		/**
		* Turn an object into a test for a node with a certain fields.
		*
		* @param {Props} check
		* @returns {Check}
		*/
		function propertiesFactory(check) {
			const checkAsRecord = check;
			return castFactory(all);
			/**
			* @param {Node} node
			* @returns {boolean}
			*/
			function all(node) {
				const nodeAsRecord = node;
				/** @type {string} */
				let key;
				for (key in check) if (nodeAsRecord[key] !== checkAsRecord[key]) return false;
				return true;
			}
		}
		/**
		* Turn a string into a test for a node with a certain type.
		*
		* @param {string} check
		* @returns {Check}
		*/
		function typeFactory(check) {
			return castFactory(type);
			/**
			* @param {Node} node
			*/
			function type(node) {
				return node && node.type === check;
			}
		}
		/**
		* Turn a custom test into a test for a node that passes that test.
		*
		* @param {TestFunction} testFunction
		* @returns {Check}
		*/
		function castFactory(testFunction) {
			return check;
			/**
			* @this {unknown}
			* @type {Check}
			*/
			function check(value, index, parent) {
				return Boolean(looksLikeANode(value) && testFunction.call(this, value, typeof index === "number" ? index : void 0, parent || void 0));
			}
		}
		function ok() {
			return true;
		}
		/**
		* @param {unknown} value
		* @returns {value is Node}
		*/
		function looksLikeANode(value) {
			return value !== null && typeof value === "object" && "type" in value;
		}
		//#endregion
		//#region node_modules/unist-util-visit-parents/lib/color.js
		/**
		* @param {string} d
		* @returns {string}
		*/
		function color(d) {
			return d;
		}
		//#endregion
		//#region node_modules/unist-util-visit-parents/lib/index.js
		/**
		* @import {Node as UnistNode, Parent as UnistParent} from 'unist'
		*/
		/**
		* @typedef {Exclude<import('unist-util-is').Test, undefined> | undefined} Test
		*   Test from `unist-util-is`.
		*
		*   Note: we have remove and add `undefined`, because otherwise when generating
		*   automatic `.d.ts` files, TS tries to flatten paths from a local perspective,
		*   which doesn’t work when publishing on npm.
		*/
		/**
		* @typedef {(
		*   Fn extends (value: any) => value is infer Thing
		*   ? Thing
		*   : Fallback
		* )} Predicate
		*   Get the value of a type guard `Fn`.
		* @template Fn
		*   Value; typically function that is a type guard (such as `(x): x is Y`).
		* @template Fallback
		*   Value to yield if `Fn` is not a type guard.
		*/
		/**
		* @typedef {(
		*   Check extends null | undefined // No test.
		*   ? Value
		*   : Value extends {type: Check} // String (type) test.
		*   ? Value
		*   : Value extends Check // Partial test.
		*   ? Value
		*   : Check extends Function // Function test.
		*   ? Predicate<Check, Value> extends Value
		*     ? Predicate<Check, Value>
		*     : never
		*   : never // Some other test?
		* )} MatchesOne
		*   Check whether a node matches a primitive check in the type system.
		* @template Value
		*   Value; typically unist `Node`.
		* @template Check
		*   Value; typically `unist-util-is`-compatible test, but not arrays.
		*/
		/**
		* @typedef {(
		*   Check extends ReadonlyArray<infer T>
		*   ? MatchesOne<Value, T>
		*   : Check extends Array<infer T>
		*   ? MatchesOne<Value, T>
		*   : MatchesOne<Value, Check>
		* )} Matches
		*   Check whether a node matches a check in the type system.
		* @template Value
		*   Value; typically unist `Node`.
		* @template Check
		*   Value; typically `unist-util-is`-compatible test.
		*/
		/**
		* @typedef {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10} Uint
		*   Number; capped reasonably.
		*/
		/**
		* @typedef {I extends 0 ? 1 : I extends 1 ? 2 : I extends 2 ? 3 : I extends 3 ? 4 : I extends 4 ? 5 : I extends 5 ? 6 : I extends 6 ? 7 : I extends 7 ? 8 : I extends 8 ? 9 : 10} Increment
		*   Increment a number in the type system.
		* @template {Uint} [I=0]
		*   Index.
		*/
		/**
		* @typedef {(
		*   Node extends UnistParent
		*   ? Node extends {children: Array<infer Children>}
		*     ? Child extends Children ? Node : never
		*     : never
		*   : never
		* )} InternalParent
		*   Collect nodes that can be parents of `Child`.
		* @template {UnistNode} Node
		*   All node types in a tree.
		* @template {UnistNode} Child
		*   Node to search for.
		*/
		/**
		* @typedef {InternalParent<InclusiveDescendant<Tree>, Child>} Parent
		*   Collect nodes in `Tree` that can be parents of `Child`.
		* @template {UnistNode} Tree
		*   All node types in a tree.
		* @template {UnistNode} Child
		*   Node to search for.
		*/
		/**
		* @typedef {(
		*   Depth extends Max
		*   ? never
		*   :
		*     | InternalParent<Node, Child>
		*     | InternalAncestor<Node, InternalParent<Node, Child>, Max, Increment<Depth>>
		* )} InternalAncestor
		*   Collect nodes in `Tree` that can be ancestors of `Child`.
		* @template {UnistNode} Node
		*   All node types in a tree.
		* @template {UnistNode} Child
		*   Node to search for.
		* @template {Uint} [Max=10]
		*   Max; searches up to this depth.
		* @template {Uint} [Depth=0]
		*   Current depth.
		*/
		/**
		* @typedef {InternalAncestor<InclusiveDescendant<Tree>, Child>} Ancestor
		*   Collect nodes in `Tree` that can be ancestors of `Child`.
		* @template {UnistNode} Tree
		*   All node types in a tree.
		* @template {UnistNode} Child
		*   Node to search for.
		*/
		/**
		* @typedef {(
		*   Tree extends UnistParent
		*     ? Depth extends Max
		*       ? Tree
		*       : Tree | InclusiveDescendant<Tree['children'][number], Max, Increment<Depth>>
		*     : Tree
		* )} InclusiveDescendant
		*   Collect all (inclusive) descendants of `Tree`.
		*
		*   > 👉 **Note**: for performance reasons, this seems to be the fastest way to
		*   > recurse without actually running into an infinite loop, which the
		*   > previous version did.
		*   >
		*   > Practically, a max of `2` is typically enough assuming a `Root` is
		*   > passed, but it doesn’t improve performance.
		*   > It gets higher with `List > ListItem > Table > TableRow > TableCell`.
		*   > Using up to `10` doesn’t hurt or help either.
		* @template {UnistNode} Tree
		*   Tree type.
		* @template {Uint} [Max=10]
		*   Max; searches up to this depth.
		* @template {Uint} [Depth=0]
		*   Current depth.
		*/
		/**
		* @typedef {'skip' | boolean} Action
		*   Union of the action types.
		*
		* @typedef {number} Index
		*   Move to the sibling at `index` next (after node itself is completely
		*   traversed).
		*
		*   Useful if mutating the tree, such as removing the node the visitor is
		*   currently on, or any of its previous siblings.
		*   Results less than 0 or greater than or equal to `children.length` stop
		*   traversing the parent.
		*
		* @typedef {[(Action | null | undefined | void)?, (Index | null | undefined)?]} ActionTuple
		*   List with one or two values, the first an action, the second an index.
		*
		* @typedef {Action | ActionTuple | Index | null | undefined | void} VisitorResult
		*   Any value that can be returned from a visitor.
		*/
		/**
		* @callback Visitor
		*   Handle a node (matching `test`, if given).
		*
		*   Visitors are free to transform `node`.
		*   They can also transform the parent of node (the last of `ancestors`).
		*
		*   Replacing `node` itself, if `SKIP` is not returned, still causes its
		*   descendants to be walked (which is a bug).
		*
		*   When adding or removing previous siblings of `node` (or next siblings, in
		*   case of reverse), the `Visitor` should return a new `Index` to specify the
		*   sibling to traverse after `node` is traversed.
		*   Adding or removing next siblings of `node` (or previous siblings, in case
		*   of reverse) is handled as expected without needing to return a new `Index`.
		*
		*   Removing the children property of an ancestor still results in them being
		*   traversed.
		* @param {Visited} node
		*   Found node.
		* @param {Array<VisitedParents>} ancestors
		*   Ancestors of `node`.
		* @returns {VisitorResult}
		*   What to do next.
		*
		*   An `Index` is treated as a tuple of `[CONTINUE, Index]`.
		*   An `Action` is treated as a tuple of `[Action]`.
		*
		*   Passing a tuple back only makes sense if the `Action` is `SKIP`.
		*   When the `Action` is `EXIT`, that action can be returned.
		*   When the `Action` is `CONTINUE`, `Index` can be returned.
		* @template {UnistNode} [Visited=UnistNode]
		*   Visited node type.
		* @template {UnistParent} [VisitedParents=UnistParent]
		*   Ancestor type.
		*/
		/**
		* @typedef {Visitor<Matches<InclusiveDescendant<Tree>, Check>, Ancestor<Tree, Matches<InclusiveDescendant<Tree>, Check>>>} BuildVisitor
		*   Build a typed `Visitor` function from a tree and a test.
		*
		*   It will infer which values are passed as `node` and which as `parents`.
		* @template {UnistNode} [Tree=UnistNode]
		*   Tree type.
		* @template {Test} [Check=Test]
		*   Test type.
		*/
		/** @type {Readonly<ActionTuple>} */
		const empty = [];
		/**
		* Visit nodes, with ancestral information.
		*
		* This algorithm performs *depth-first* *tree traversal* in *preorder*
		* (**NLR**) or if `reverse` is given, in *reverse preorder* (**NRL**).
		*
		* You can choose for which nodes `visitor` is called by passing a `test`.
		* For complex tests, you should test yourself in `visitor`, as it will be
		* faster and will have improved type information.
		*
		* Walking the tree is an intensive task.
		* Make use of the return values of the visitor when possible.
		* Instead of walking a tree multiple times, walk it once, use `unist-util-is`
		* to check if a node matches, and then perform different operations.
		*
		* You can change the tree.
		* See `Visitor` for more info.
		*
		* @overload
		* @param {Tree} tree
		* @param {Check} check
		* @param {BuildVisitor<Tree, Check>} visitor
		* @param {boolean | null | undefined} [reverse]
		* @returns {undefined}
		*
		* @overload
		* @param {Tree} tree
		* @param {BuildVisitor<Tree>} visitor
		* @param {boolean | null | undefined} [reverse]
		* @returns {undefined}
		*
		* @param {UnistNode} tree
		*   Tree to traverse.
		* @param {Visitor | Test} test
		*   `unist-util-is`-compatible test
		* @param {Visitor | boolean | null | undefined} [visitor]
		*   Handle each node.
		* @param {boolean | null | undefined} [reverse]
		*   Traverse in reverse preorder (NRL) instead of the default preorder (NLR).
		* @returns {undefined}
		*   Nothing.
		*
		* @template {UnistNode} Tree
		*   Node type.
		* @template {Test} Check
		*   `unist-util-is`-compatible test.
		*/
		function visitParents(tree, test, visitor, reverse) {
			/** @type {Test} */
			let check;
			if (typeof test === "function" && typeof visitor !== "function") {
				reverse = visitor;
				visitor = test;
			} else check = test;
			const is = convert(check);
			const step = reverse ? -1 : 1;
			factory(tree, void 0, [])();
			/**
			* @param {UnistNode} node
			* @param {number | undefined} index
			* @param {Array<UnistParent>} parents
			*/
			function factory(node, index, parents) {
				const value = node && typeof node === "object" ? node : {};
				if (typeof value.type === "string") {
					const name = typeof value.tagName === "string" ? value.tagName : typeof value.name === "string" ? value.name : void 0;
					Object.defineProperty(visit, "name", { value: "node (" + color(node.type + (name ? "<" + name + ">" : "")) + ")" });
				}
				return visit;
				function visit() {
					/** @type {Readonly<ActionTuple>} */
					let result = empty;
					/** @type {Readonly<ActionTuple>} */
					let subresult;
					/** @type {number} */
					let offset;
					/** @type {Array<UnistParent>} */
					let grandparents;
					if (!test || is(node, index, parents[parents.length - 1] || void 0)) {
						result = toResult(visitor(node, parents));
						if (result[0] === false) return result;
					}
					if ("children" in node && node.children) {
						const nodeAsParent = node;
						if (nodeAsParent.children && result[0] !== "skip") {
							offset = (reverse ? nodeAsParent.children.length : -1) + step;
							grandparents = parents.concat(nodeAsParent);
							while (offset > -1 && offset < nodeAsParent.children.length) {
								const child = nodeAsParent.children[offset];
								subresult = factory(child, offset, grandparents)();
								if (subresult[0] === false) return subresult;
								offset = typeof subresult[1] === "number" ? subresult[1] : offset + step;
							}
						}
					}
					return result;
				}
			}
		}
		/**
		* Turn a return value into a clean result.
		*
		* @param {VisitorResult} value
		*   Valid return values from visitors.
		* @returns {Readonly<ActionTuple>}
		*   Clean result.
		*/
		function toResult(value) {
			if (Array.isArray(value)) return value;
			if (typeof value === "number") return [true, value];
			return value === null || value === void 0 ? empty : [value];
		}
		//#endregion
		//#region node_modules/unist-util-visit/lib/index.js
		/**
		* @import {Node as UnistNode, Parent as UnistParent} from 'unist'
		* @import {VisitorResult} from 'unist-util-visit-parents'
		*/
		/**
		* @typedef {Exclude<import('unist-util-is').Test, undefined> | undefined} Test
		*   Test from `unist-util-is`.
		*
		*   Note: we have remove and add `undefined`, because otherwise when generating
		*   automatic `.d.ts` files, TS tries to flatten paths from a local perspective,
		*   which doesn’t work when publishing on npm.
		*/
		/**
		* @typedef {(
		*   Fn extends (value: any) => value is infer Thing
		*   ? Thing
		*   : Fallback
		* )} Predicate
		*   Get the value of a type guard `Fn`.
		* @template Fn
		*   Value; typically function that is a type guard (such as `(x): x is Y`).
		* @template Fallback
		*   Value to yield if `Fn` is not a type guard.
		*/
		/**
		* @typedef {(
		*   Check extends null | undefined // No test.
		*   ? Value
		*   : Value extends {type: Check} // String (type) test.
		*   ? Value
		*   : Value extends Check // Partial test.
		*   ? Value
		*   : Check extends Function // Function test.
		*   ? Predicate<Check, Value> extends Value
		*     ? Predicate<Check, Value>
		*     : never
		*   : never // Some other test?
		* )} MatchesOne
		*   Check whether a node matches a primitive check in the type system.
		* @template Value
		*   Value; typically unist `Node`.
		* @template Check
		*   Value; typically `unist-util-is`-compatible test, but not arrays.
		*/
		/**
		* @typedef {(
		*   Check extends ReadonlyArray<any>
		*   ? MatchesOne<Value, Check[number]>
		*   : MatchesOne<Value, Check>
		* )} Matches
		*   Check whether a node matches a check in the type system.
		* @template Value
		*   Value; typically unist `Node`.
		* @template Check
		*   Value; typically `unist-util-is`-compatible test.
		*/
		/**
		* @typedef {0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10} Uint
		*   Number; capped reasonably.
		*/
		/**
		* @typedef {I extends 0 ? 1 : I extends 1 ? 2 : I extends 2 ? 3 : I extends 3 ? 4 : I extends 4 ? 5 : I extends 5 ? 6 : I extends 6 ? 7 : I extends 7 ? 8 : I extends 8 ? 9 : 10} Increment
		*   Increment a number in the type system.
		* @template {Uint} [I=0]
		*   Index.
		*/
		/**
		* @typedef {(
		*   Node extends UnistParent
		*   ? Node extends {children: Array<infer Children>}
		*     ? Child extends Children ? Node : never
		*     : never
		*   : never
		* )} InternalParent
		*   Collect nodes that can be parents of `Child`.
		* @template {UnistNode} Node
		*   All node types in a tree.
		* @template {UnistNode} Child
		*   Node to search for.
		*/
		/**
		* @typedef {InternalParent<InclusiveDescendant<Tree>, Child>} Parent
		*   Collect nodes in `Tree` that can be parents of `Child`.
		* @template {UnistNode} Tree
		*   All node types in a tree.
		* @template {UnistNode} Child
		*   Node to search for.
		*/
		/**
		* @typedef {(
		*   Depth extends Max
		*   ? never
		*   :
		*     | InternalParent<Node, Child>
		*     | InternalAncestor<Node, InternalParent<Node, Child>, Max, Increment<Depth>>
		* )} InternalAncestor
		*   Collect nodes in `Tree` that can be ancestors of `Child`.
		* @template {UnistNode} Node
		*   All node types in a tree.
		* @template {UnistNode} Child
		*   Node to search for.
		* @template {Uint} [Max=10]
		*   Max; searches up to this depth.
		* @template {Uint} [Depth=0]
		*   Current depth.
		*/
		/**
		* @typedef {(
		*   Tree extends UnistParent
		*     ? Depth extends Max
		*       ? Tree
		*       : Tree | InclusiveDescendant<Tree['children'][number], Max, Increment<Depth>>
		*     : Tree
		* )} InclusiveDescendant
		*   Collect all (inclusive) descendants of `Tree`.
		*
		*   > 👉 **Note**: for performance reasons, this seems to be the fastest way to
		*   > recurse without actually running into an infinite loop, which the
		*   > previous version did.
		*   >
		*   > Practically, a max of `2` is typically enough assuming a `Root` is
		*   > passed, but it doesn’t improve performance.
		*   > It gets higher with `List > ListItem > Table > TableRow > TableCell`.
		*   > Using up to `10` doesn’t hurt or help either.
		* @template {UnistNode} Tree
		*   Tree type.
		* @template {Uint} [Max=10]
		*   Max; searches up to this depth.
		* @template {Uint} [Depth=0]
		*   Current depth.
		*/
		/**
		* @callback Visitor
		*   Handle a node (matching `test`, if given).
		*
		*   Visitors are free to transform `node`.
		*   They can also transform `parent`.
		*
		*   Replacing `node` itself, if `SKIP` is not returned, still causes its
		*   descendants to be walked (which is a bug).
		*
		*   When adding or removing previous siblings of `node` (or next siblings, in
		*   case of reverse), the `Visitor` should return a new `Index` to specify the
		*   sibling to traverse after `node` is traversed.
		*   Adding or removing next siblings of `node` (or previous siblings, in case
		*   of reverse) is handled as expected without needing to return a new `Index`.
		*
		*   Removing the children property of `parent` still results in them being
		*   traversed.
		* @param {Visited} node
		*   Found node.
		* @param {Visited extends UnistNode ? number | undefined : never} index
		*   Index of `node` in `parent`.
		* @param {Ancestor extends UnistParent ? Ancestor | undefined : never} parent
		*   Parent of `node`.
		* @returns {VisitorResult}
		*   What to do next.
		*
		*   An `Index` is treated as a tuple of `[CONTINUE, Index]`.
		*   An `Action` is treated as a tuple of `[Action]`.
		*
		*   Passing a tuple back only makes sense if the `Action` is `SKIP`.
		*   When the `Action` is `EXIT`, that action can be returned.
		*   When the `Action` is `CONTINUE`, `Index` can be returned.
		* @template {UnistNode} [Visited=UnistNode]
		*   Visited node type.
		* @template {UnistParent} [Ancestor=UnistParent]
		*   Ancestor type.
		*/
		/**
		* @typedef {Visitor<Visited, Parent<Ancestor, Visited>>} BuildVisitorFromMatch
		*   Build a typed `Visitor` function from a node and all possible parents.
		*
		*   It will infer which values are passed as `node` and which as `parent`.
		* @template {UnistNode} Visited
		*   Node type.
		* @template {UnistParent} Ancestor
		*   Parent type.
		*/
		/**
		* @typedef {(
		*   BuildVisitorFromMatch<
		*     Matches<Descendant, Check>,
		*     Extract<Descendant, UnistParent>
		*   >
		* )} BuildVisitorFromDescendants
		*   Build a typed `Visitor` function from a list of descendants and a test.
		*
		*   It will infer which values are passed as `node` and which as `parent`.
		* @template {UnistNode} Descendant
		*   Node type.
		* @template {Test} Check
		*   Test type.
		*/
		/**
		* @typedef {(
		*   BuildVisitorFromDescendants<
		*     InclusiveDescendant<Tree>,
		*     Check
		*   >
		* )} BuildVisitor
		*   Build a typed `Visitor` function from a tree and a test.
		*
		*   It will infer which values are passed as `node` and which as `parent`.
		* @template {UnistNode} [Tree=UnistNode]
		*   Node type.
		* @template {Test} [Check=Test]
		*   Test type.
		*/
		/**
		* Visit nodes.
		*
		* This algorithm performs *depth-first* *tree traversal* in *preorder*
		* (**NLR**) or if `reverse` is given, in *reverse preorder* (**NRL**).
		*
		* You can choose for which nodes `visitor` is called by passing a `test`.
		* For complex tests, you should test yourself in `visitor`, as it will be
		* faster and will have improved type information.
		*
		* Walking the tree is an intensive task.
		* Make use of the return values of the visitor when possible.
		* Instead of walking a tree multiple times, walk it once, use `unist-util-is`
		* to check if a node matches, and then perform different operations.
		*
		* You can change the tree.
		* See `Visitor` for more info.
		*
		* @overload
		* @param {Tree} tree
		* @param {Check} check
		* @param {BuildVisitor<Tree, Check>} visitor
		* @param {boolean | null | undefined} [reverse]
		* @returns {undefined}
		*
		* @overload
		* @param {Tree} tree
		* @param {BuildVisitor<Tree>} visitor
		* @param {boolean | null | undefined} [reverse]
		* @returns {undefined}
		*
		* @param {UnistNode} tree
		*   Tree to traverse.
		* @param {Visitor | Test} testOrVisitor
		*   `unist-util-is`-compatible test (optional, omit to pass a visitor).
		* @param {Visitor | boolean | null | undefined} [visitorOrReverse]
		*   Handle each node (when test is omitted, pass `reverse`).
		* @param {boolean | null | undefined} [maybeReverse=false]
		*   Traverse in reverse preorder (NRL) instead of the default preorder (NLR).
		* @returns {undefined}
		*   Nothing.
		*
		* @template {UnistNode} Tree
		*   Node type.
		* @template {Test} Check
		*   `unist-util-is`-compatible test.
		*/
		function visit(tree, testOrVisitor, visitorOrReverse, maybeReverse) {
			/** @type {boolean | null | undefined} */
			let reverse;
			/** @type {Test} */
			let test;
			/** @type {Visitor} */
			let visitor;
			if (typeof testOrVisitor === "function" && typeof visitorOrReverse !== "function") {
				test = void 0;
				visitor = testOrVisitor;
				reverse = visitorOrReverse;
			} else {
				test = testOrVisitor;
				visitor = visitorOrReverse;
				reverse = maybeReverse;
			}
			visitParents(tree, test, overload, reverse);
			/**
			* @param {UnistNode} node
			* @param {Array<UnistParent>} parents
			*/
			function overload(node, parents) {
				const parent = parents[parents.length - 1];
				const index = parent ? parent.children.indexOf(node) : void 0;
				return visitor(node, index, parent);
			}
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/state.js
		/**
		* @import {
		*   ElementContent as HastElementContent,
		*   Element as HastElement,
		*   Nodes as HastNodes,
		*   Properties as HastProperties,
		*   RootContent as HastRootContent,
		*   Text as HastText
		* } from 'hast'
		* @import {
		*   Definition as MdastDefinition,
		*   FootnoteDefinition as MdastFootnoteDefinition,
		*   Nodes as MdastNodes,
		*   Parents as MdastParents
		* } from 'mdast'
		* @import {VFile} from 'vfile'
		* @import {
		*   FootnoteBackContentTemplate,
		*   FootnoteBackLabelTemplate
		* } from './footer.js'
		*/
		/**
		* @callback Handler
		*   Handle a node.
		* @param {State} state
		*   Info passed around.
		* @param {any} node
		*   mdast node to handle.
		* @param {MdastParents | undefined} parent
		*   Parent of `node`.
		* @returns {Array<HastElementContent> | HastElementContent | undefined}
		*   hast node.
		*
		* @typedef {Partial<Record<MdastNodes['type'], Handler>>} Handlers
		*   Handle nodes.
		*
		* @typedef Options
		*   Configuration (optional).
		* @property {boolean | null | undefined} [allowDangerousHtml=false]
		*   Whether to persist raw HTML in markdown in the hast tree (default:
		*   `false`).
		* @property {string | null | undefined} [clobberPrefix='user-content-']
		*   Prefix to use before the `id` property on footnotes to prevent them from
		*   *clobbering* (default: `'user-content-'`).
		*
		*   Pass `''` for trusted markdown and when you are careful with
		*   polyfilling.
		*   You could pass a different prefix.
		*
		*   DOM clobbering is this:
		*
		*   ```html
		*   <p id="x"></p>
		*   <script>alert(x) // `x` now refers to the `p#x` DOM element<\/script>
		*   ```
		*
		*   The above example shows that elements are made available by browsers, by
		*   their ID, on the `window` object.
		*   This is a security risk because you might be expecting some other variable
		*   at that place.
		*   It can also break polyfills.
		*   Using a prefix solves these problems.
		* @property {VFile | null | undefined} [file]
		*   Corresponding virtual file representing the input document (optional).
		* @property {FootnoteBackContentTemplate | string | null | undefined} [footnoteBackContent]
		*   Content of the backreference back to references (default: `defaultFootnoteBackContent`).
		*
		*   The default value is:
		*
		*   ```js
		*   function defaultFootnoteBackContent(_, rereferenceIndex) {
		*     const result = [{type: 'text', value: '↩'}]
		*
		*     if (rereferenceIndex > 1) {
		*       result.push({
		*         type: 'element',
		*         tagName: 'sup',
		*         properties: {},
		*         children: [{type: 'text', value: String(rereferenceIndex)}]
		*       })
		*     }
		*
		*     return result
		*   }
		*   ```
		*
		*   This content is used in the `a` element of each backreference (the `↩`
		*   links).
		* @property {FootnoteBackLabelTemplate | string | null | undefined} [footnoteBackLabel]
		*   Label to describe the backreference back to references (default:
		*   `defaultFootnoteBackLabel`).
		*
		*   The default value is:
		*
		*   ```js
		*   function defaultFootnoteBackLabel(referenceIndex, rereferenceIndex) {
		*    return (
		*      'Back to reference ' +
		*      (referenceIndex + 1) +
		*      (rereferenceIndex > 1 ? '-' + rereferenceIndex : '')
		*    )
		*   }
		*   ```
		*
		*   Change it when the markdown is not in English.
		*
		*   This label is used in the `ariaLabel` property on each backreference
		*   (the `↩` links).
		*   It affects users of assistive technology.
		* @property {string | null | undefined} [footnoteLabel='Footnotes']
		*   Textual label to use for the footnotes section (default: `'Footnotes'`).
		*
		*   Change it when the markdown is not in English.
		*
		*   This label is typically hidden visually (assuming a `sr-only` CSS class
		*   is defined that does that) and so affects screen readers only.
		*   If you do have such a class, but want to show this section to everyone,
		*   pass different properties with the `footnoteLabelProperties` option.
		* @property {HastProperties | null | undefined} [footnoteLabelProperties={className: ['sr-only']}]
		*   Properties to use on the footnote label (default: `{className:
		*   ['sr-only']}`).
		*
		*   Change it to show the label and add other properties.
		*
		*   This label is typically hidden visually (assuming an `sr-only` CSS class
		*   is defined that does that) and so affects screen readers only.
		*   If you do have such a class, but want to show this section to everyone,
		*   pass an empty string.
		*   You can also add different properties.
		*
		*   > **Note**: `id: 'footnote-label'` is always added, because footnote
		*   > calls use it with `aria-describedby` to provide an accessible label.
		* @property {string | null | undefined} [footnoteLabelTagName='h2']
		*   HTML tag name to use for the footnote label element (default: `'h2'`).
		*
		*   Change it to match your document structure.
		*
		*   This label is typically hidden visually (assuming a `sr-only` CSS class
		*   is defined that does that) and so affects screen readers only.
		*   If you do have such a class, but want to show this section to everyone,
		*   pass different properties with the `footnoteLabelProperties` option.
		* @property {Handlers | null | undefined} [handlers]
		*   Extra handlers for nodes (optional).
		* @property {Array<MdastNodes['type']> | null | undefined} [passThrough]
		*   List of custom mdast node types to pass through (keep) in hast (note that
		*   the node itself is passed, but eventual children are transformed)
		*   (optional).
		* @property {Handler | null | undefined} [unknownHandler]
		*   Handler for all unknown nodes (optional).
		*
		* @typedef State
		*   Info passed around.
		* @property {(node: MdastNodes) => Array<HastElementContent>} all
		*   Transform the children of an mdast parent to hast.
		* @property {<Type extends HastNodes>(from: MdastNodes, to: Type) => HastElement | Type} applyData
		*   Honor the `data` of `from`, and generate an element instead of `node`.
		* @property {Map<string, MdastDefinition>} definitionById
		*   Definitions by their identifier.
		* @property {Map<string, MdastFootnoteDefinition>} footnoteById
		*   Footnote definitions by their identifier.
		* @property {Map<string, number>} footnoteCounts
		*   Counts for how often the same footnote was called.
		* @property {Array<string>} footnoteOrder
		*   Identifiers of order when footnote calls first appear in tree order.
		* @property {Handlers} handlers
		*   Applied handlers.
		* @property {(node: MdastNodes, parent: MdastParents | undefined) => Array<HastElementContent> | HastElementContent | undefined} one
		*   Transform an mdast node to hast.
		* @property {Options} options
		*   Configuration.
		* @property {(from: MdastNodes, node: HastNodes) => undefined} patch
		*   Copy a node’s positional info.
		* @property {<Type extends HastRootContent>(nodes: Array<Type>, loose?: boolean | undefined) => Array<HastText | Type>} wrap
		*   Wrap `nodes` with line endings between each node, adds initial/final line endings when `loose`.
		*/
		const own$1 = {}.hasOwnProperty;
		/** @type {Options} */
		const emptyOptions$1 = {};
		/**
		* Create `state` from an mdast tree.
		*
		* @param {MdastNodes} tree
		*   mdast node to transform.
		* @param {Options | null | undefined} [options]
		*   Configuration (optional).
		* @returns {State}
		*   `state` function.
		*/
		function createState(tree, options) {
			const settings = options || emptyOptions$1;
			/** @type {Map<string, MdastDefinition>} */
			const definitionById = /* @__PURE__ */ new Map();
			/** @type {Map<string, MdastFootnoteDefinition>} */
			const footnoteById = /* @__PURE__ */ new Map();
			/** @type {State} */
			const state = {
				all,
				applyData,
				definitionById,
				footnoteById,
				footnoteCounts: /* @__PURE__ */ new Map(),
				footnoteOrder: [],
				handlers: {
					...handlers,
					...settings.handlers
				},
				one,
				options: settings,
				patch,
				wrap: wrap$1
			};
			visit(tree, function(node) {
				if (node.type === "definition" || node.type === "footnoteDefinition") {
					const map = node.type === "definition" ? definitionById : footnoteById;
					const id = String(node.identifier).toUpperCase();
					if (!map.has(id)) map.set(id, node);
				}
			});
			return state;
			/**
			* Transform an mdast node into a hast node.
			*
			* @param {MdastNodes} node
			*   mdast node.
			* @param {MdastParents | undefined} [parent]
			*   Parent of `node`.
			* @returns {Array<HastElementContent> | HastElementContent | undefined}
			*   Resulting hast node.
			*/
			function one(node, parent) {
				const type = node.type;
				const handle = state.handlers[type];
				if (own$1.call(state.handlers, type) && handle) return handle(state, node, parent);
				if (state.options.passThrough && state.options.passThrough.includes(type)) {
					if ("children" in node) {
						const { children, ...shallow } = node;
						const result = esm_default(shallow);
						result.children = state.all(node);
						return result;
					}
					return esm_default(node);
				}
				return (state.options.unknownHandler || defaultUnknownHandler)(state, node, parent);
			}
			/**
			* Transform the children of an mdast node into hast nodes.
			*
			* @param {MdastNodes} parent
			*   mdast node to compile
			* @returns {Array<HastElementContent>}
			*   Resulting hast nodes.
			*/
			function all(parent) {
				/** @type {Array<HastElementContent>} */
				const values = [];
				if ("children" in parent) {
					const nodes = parent.children;
					let index = -1;
					while (++index < nodes.length) {
						const result = state.one(nodes[index], parent);
						if (result) {
							if (index && nodes[index - 1].type === "break") {
								if (!Array.isArray(result) && result.type === "text") result.value = trimMarkdownSpaceStart(result.value);
								if (!Array.isArray(result) && result.type === "element") {
									const head = result.children[0];
									if (head && head.type === "text") head.value = trimMarkdownSpaceStart(head.value);
								}
							}
							if (Array.isArray(result)) values.push(...result);
							else values.push(result);
						}
					}
				}
				return values;
			}
		}
		/**
		* Copy a node’s positional info.
		*
		* @param {MdastNodes} from
		*   mdast node to copy from.
		* @param {HastNodes} to
		*   hast node to copy into.
		* @returns {undefined}
		*   Nothing.
		*/
		function patch(from, to) {
			if (from.position) to.position = position$1(from);
		}
		/**
		* Honor the `data` of `from` and maybe generate an element instead of `to`.
		*
		* @template {HastNodes} Type
		*   Node type.
		* @param {MdastNodes} from
		*   mdast node to use data from.
		* @param {Type} to
		*   hast node to change.
		* @returns {HastElement | Type}
		*   Nothing.
		*/
		function applyData(from, to) {
			/** @type {HastElement | Type} */
			let result = to;
			if (from && from.data) {
				const hName = from.data.hName;
				const hChildren = from.data.hChildren;
				const hProperties = from.data.hProperties;
				if (typeof hName === "string") if (result.type === "element") result.tagName = hName;
				else result = {
					type: "element",
					tagName: hName,
					properties: {},
					children: "children" in result ? result.children : [result]
				};
				if (result.type === "element" && hProperties) Object.assign(result.properties, esm_default(hProperties));
				if ("children" in result && result.children && hChildren !== null && hChildren !== void 0) result.children = hChildren;
			}
			return result;
		}
		/**
		* Transform an unknown node.
		*
		* @param {State} state
		*   Info passed around.
		* @param {MdastNodes} node
		*   Unknown mdast node.
		* @returns {HastElement | HastText}
		*   Resulting hast node.
		*/
		function defaultUnknownHandler(state, node) {
			const data = node.data || {};
			/** @type {HastElement | HastText} */
			const result = "value" in node && !(own$1.call(data, "hProperties") || own$1.call(data, "hChildren")) ? {
				type: "text",
				value: node.value
			} : {
				type: "element",
				tagName: "div",
				properties: {},
				children: state.all(node)
			};
			state.patch(node, result);
			return state.applyData(node, result);
		}
		/**
		* Wrap `nodes` with line endings between each node.
		*
		* @template {HastRootContent} Type
		*   Node type.
		* @param {Array<Type>} nodes
		*   List of nodes to wrap.
		* @param {boolean | undefined} [loose=false]
		*   Whether to add line endings at start and end (default: `false`).
		* @returns {Array<HastText | Type>}
		*   Wrapped nodes.
		*/
		function wrap$1(nodes, loose) {
			/** @type {Array<HastText | Type>} */
			const result = [];
			let index = -1;
			if (loose) result.push({
				type: "text",
				value: "\n"
			});
			while (++index < nodes.length) {
				if (index) result.push({
					type: "text",
					value: "\n"
				});
				result.push(nodes[index]);
			}
			if (loose && nodes.length > 0) result.push({
				type: "text",
				value: "\n"
			});
			return result;
		}
		/**
		* Trim spaces and tabs at the start of `value`.
		*
		* @param {string} value
		*   Value to trim.
		* @returns {string}
		*   Result.
		*/
		function trimMarkdownSpaceStart(value) {
			let index = 0;
			let code = value.charCodeAt(index);
			while (code === 9 || code === 32) {
				index++;
				code = value.charCodeAt(index);
			}
			return value.slice(index);
		}
		//#endregion
		//#region node_modules/mdast-util-to-hast/lib/index.js
		/**
		* @import {Nodes as HastNodes} from 'hast'
		* @import {Nodes as MdastNodes} from 'mdast'
		* @import {Options} from './state.js'
		*/
		/**
		* Transform mdast to hast.
		*
		* ##### Notes
		*
		* ###### HTML
		*
		* Raw HTML is available in mdast as `html` nodes and can be embedded in hast
		* as semistandard `raw` nodes.
		* Most utilities ignore `raw` nodes but two notable ones don’t:
		*
		* *   `hast-util-to-html` also has an option `allowDangerousHtml` which will
		*     output the raw HTML.
		*     This is typically discouraged as noted by the option name but is useful
		*     if you completely trust authors
		* *   `hast-util-raw` can handle the raw embedded HTML strings by parsing them
		*     into standard hast nodes (`element`, `text`, etc).
		*     This is a heavy task as it needs a full HTML parser, but it is the only
		*     way to support untrusted content
		*
		* ###### Footnotes
		*
		* Many options supported here relate to footnotes.
		* Footnotes are not specified by CommonMark, which we follow by default.
		* They are supported by GitHub, so footnotes can be enabled in markdown with
		* `mdast-util-gfm`.
		*
		* The options `footnoteBackLabel` and `footnoteLabel` define natural language
		* that explains footnotes, which is hidden for sighted users but shown to
		* assistive technology.
		* When your page is not in English, you must define translated values.
		*
		* Back references use ARIA attributes, but the section label itself uses a
		* heading that is hidden with an `sr-only` class.
		* To show it to sighted users, define different attributes in
		* `footnoteLabelProperties`.
		*
		* ###### Clobbering
		*
		* Footnotes introduces a problem, as it links footnote calls to footnote
		* definitions on the page through `id` attributes generated from user content,
		* which results in DOM clobbering.
		*
		* DOM clobbering is this:
		*
		* ```html
		* <p id=x></p>
		* <script>alert(x) // `x` now refers to the DOM `p#x` element<\/script>
		* ```
		*
		* Elements by their ID are made available by browsers on the `window` object,
		* which is a security risk.
		* Using a prefix solves this problem.
		*
		* More information on how to handle clobbering and the prefix is explained in
		* Example: headings (DOM clobbering) in `rehype-sanitize`.
		*
		* ###### Unknown nodes
		*
		* Unknown nodes are nodes with a type that isn’t in `handlers` or `passThrough`.
		* The default behavior for unknown nodes is:
		*
		* *   when the node has a `value` (and doesn’t have `data.hName`,
		*     `data.hProperties`, or `data.hChildren`, see later), create a hast `text`
		*     node
		* *   otherwise, create a `<div>` element (which could be changed with
		*     `data.hName`), with its children mapped from mdast to hast as well
		*
		* This behavior can be changed by passing an `unknownHandler`.
		*
		* @param {MdastNodes} tree
		*   mdast tree.
		* @param {Options | null | undefined} [options]
		*   Configuration (optional).
		* @returns {HastNodes}
		*   hast tree.
		*/
		function toHast(tree, options) {
			const state = createState(tree, options);
			const node = state.one(tree, void 0);
			const foot = footer(state);
			/** @type {HastNodes} */
			const result = Array.isArray(node) ? {
				type: "root",
				children: node
			} : node || {
				type: "root",
				children: []
			};
			if (foot) {
				"children" in result;
				result.children.push({
					type: "text",
					value: "\n"
				}, foot);
			}
			return result;
		}
		//#endregion
		//#region node_modules/remark-rehype/lib/index.js
		/**
		* @import {Root as HastRoot} from 'hast'
		* @import {Root as MdastRoot} from 'mdast'
		* @import {Options as ToHastOptions} from 'mdast-util-to-hast'
		* @import {Processor} from 'unified'
		* @import {VFile} from 'vfile'
		*/
		/**
		* @typedef {Omit<ToHastOptions, 'file'>} Options
		*
		* @callback TransformBridge
		*   Bridge-mode.
		*
		*   Runs the destination with the new hast tree.
		*   Discards result.
		* @param {MdastRoot} tree
		*   Tree.
		* @param {VFile} file
		*   File.
		* @returns {Promise<undefined>}
		*   Nothing.
		*
		* @callback TransformMutate
		*  Mutate-mode.
		*
		*  Further transformers run on the hast tree.
		* @param {MdastRoot} tree
		*   Tree.
		* @param {VFile} file
		*   File.
		* @returns {HastRoot}
		*   Tree (hast).
		*/
		/**
		* Turn markdown into HTML.
		*
		* ##### Notes
		*
		* ###### Signature
		*
		* * if a processor is given,
		*   runs the (rehype) plugins used on it with a hast tree,
		*   then discards the result (*bridge mode*)
		* * otherwise,
		*   returns a hast tree,
		*   the plugins used after `remarkRehype` are rehype plugins (*mutate mode*)
		*
		* > 👉 **Note**:
		* > It’s highly unlikely that you want to pass a `processor`.
		*
		* ###### HTML
		*
		* Raw HTML is available in mdast as `html` nodes and can be embedded in hast
		* as semistandard `raw` nodes.
		* Most plugins ignore `raw` nodes but two notable ones don’t:
		*
		* * `rehype-stringify` also has an option `allowDangerousHtml` which will
		*   output the raw HTML.
		*   This is typically discouraged as noted by the option name but is useful if
		*   you completely trust authors
		* * `rehype-raw` can handle the raw embedded HTML strings by parsing them
		*   into standard hast nodes (`element`, `text`, etc);
		*   this is a heavy task as it needs a full HTML parser,
		*   but it is the only way to support untrusted content
		*
		* ###### Footnotes
		*
		* Many options supported here relate to footnotes.
		* Footnotes are not specified by CommonMark,
		* which we follow by default.
		* They are supported by GitHub,
		* so footnotes can be enabled in markdown with `remark-gfm`.
		*
		* The options `footnoteBackLabel` and `footnoteLabel` define natural language
		* that explains footnotes,
		* which is hidden for sighted users but shown to assistive technology.
		* When your page is not in English,
		* you must define translated values.
		*
		* Back references use ARIA attributes,
		* but the section label itself uses a heading that is hidden with an
		* `sr-only` class.
		* To show it to sighted users,
		* define different attributes in `footnoteLabelProperties`.
		*
		* ###### Clobbering
		*
		* Footnotes introduces a problem,
		* as it links footnote calls to footnote definitions on the page through `id`
		* attributes generated from user content,
		* which results in DOM clobbering.
		*
		* DOM clobbering is this:
		*
		* ```html
		* <p id=x></p>
		* <script>alert(x) // `x` now refers to the DOM `p#x` element<\/script>
		* ```
		*
		* Elements by their ID are made available by browsers on the `window` object,
		* which is a security risk.
		* Using a prefix solves this problem.
		*
		* More information on how to handle clobbering and the prefix is explained in
		* *Example: headings (DOM clobbering)* in `rehype-sanitize`.
		*
		* ###### Unknown nodes
		*
		* Unknown nodes are nodes with a type that isn’t in `handlers` or `passThrough`.
		* The default behavior for unknown nodes is:
		*
		* * when the node has a `value`
		*   (and doesn’t have `data.hName`, `data.hProperties`, or `data.hChildren`,
		*   see later),
		*   create a hast `text` node
		* * otherwise,
		*   create a `<div>` element (which could be changed with `data.hName`),
		*   with its children mapped from mdast to hast as well
		*
		* This behavior can be changed by passing an `unknownHandler`.
		*
		* @overload
		* @param {Processor} processor
		* @param {Readonly<Options> | null | undefined} [options]
		* @returns {TransformBridge}
		*
		* @overload
		* @param {Readonly<Options> | null | undefined} [options]
		* @returns {TransformMutate}
		*
		* @overload
		* @param {Readonly<Options> | Processor | null | undefined} [destination]
		* @param {Readonly<Options> | null | undefined} [options]
		* @returns {TransformBridge | TransformMutate}
		*
		* @param {Readonly<Options> | Processor | null | undefined} [destination]
		*   Processor or configuration (optional).
		* @param {Readonly<Options> | null | undefined} [options]
		*   When a processor was given,
		*   configuration (optional).
		* @returns {TransformBridge | TransformMutate}
		*   Transform.
		*/
		function remarkRehype(destination, options) {
			if (destination && "run" in destination)
 /**
			* @type {TransformBridge}
			*/
			return async function(tree, file) {
				const hastTree = toHast(tree, {
					file,
					...options
				});
				await destination.run(hastTree, file);
			};
			/**
			* @type {TransformMutate}
			*/
			return function(tree, file) {
				return toHast(tree, {
					file,
					...destination || options
				});
			};
		}
		//#endregion
		//#region node_modules/bail/index.js
		/**
		* Throw a given error.
		*
		* @param {Error|null|undefined} [error]
		*   Maybe error.
		* @returns {asserts error is null|undefined}
		*/
		function bail(error) {
			if (error) throw error;
		}
		//#endregion
		//#region node_modules/extend/index.js
		var require_extend = /* @__PURE__ */ __commonJSMin(((exports, module) => {
			var hasOwn = Object.prototype.hasOwnProperty;
			var toStr = Object.prototype.toString;
			var defineProperty = Object.defineProperty;
			var gOPD = Object.getOwnPropertyDescriptor;
			var isArray = function isArray(arr) {
				if (typeof Array.isArray === "function") return Array.isArray(arr);
				return toStr.call(arr) === "[object Array]";
			};
			var isPlainObject = function isPlainObject(obj) {
				if (!obj || toStr.call(obj) !== "[object Object]") return false;
				var hasOwnConstructor = hasOwn.call(obj, "constructor");
				var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, "isPrototypeOf");
				if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) return false;
				var key;
				for (key in obj);
				return typeof key === "undefined" || hasOwn.call(obj, key);
			};
			var setProperty = function setProperty(target, options) {
				if (defineProperty && options.name === "__proto__") defineProperty(target, options.name, {
					enumerable: true,
					configurable: true,
					value: options.newValue,
					writable: true
				});
				else target[options.name] = options.newValue;
			};
			var getProperty = function getProperty(obj, name) {
				if (name === "__proto__") {
					if (!hasOwn.call(obj, name)) return;
					else if (gOPD) return gOPD(obj, name).value;
				}
				return obj[name];
			};
			module.exports = function extend() {
				var options, name, src, copy, copyIsArray, clone;
				var target = arguments[0];
				var i = 1;
				var length = arguments.length;
				var deep = false;
				if (typeof target === "boolean") {
					deep = target;
					target = arguments[1] || {};
					i = 2;
				}
				if (target == null || typeof target !== "object" && typeof target !== "function") target = {};
				for (; i < length; ++i) {
					options = arguments[i];
					if (options != null) for (name in options) {
						src = getProperty(target, name);
						copy = getProperty(options, name);
						if (target !== copy) {
							if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
								if (copyIsArray) {
									copyIsArray = false;
									clone = src && isArray(src) ? src : [];
								} else clone = src && isPlainObject(src) ? src : {};
								setProperty(target, {
									name,
									newValue: extend(deep, clone, copy)
								});
							} else if (typeof copy !== "undefined") setProperty(target, {
								name,
								newValue: copy
							});
						}
					}
				}
				return target;
			};
		}));
		//#endregion
		//#region node_modules/is-plain-obj/index.js
		function isPlainObject(value) {
			if (typeof value !== "object" || value === null) return false;
			const prototype = Object.getPrototypeOf(value);
			return (prototype === null || prototype === Object.prototype || Object.getPrototypeOf(prototype) === null) && !(Symbol.toStringTag in value) && !(Symbol.iterator in value);
		}
		//#endregion
		//#region node_modules/trough/lib/index.js
		/**
		* @typedef {(error?: Error | null | undefined, ...output: Array<any>) => void} Callback
		*   Callback.
		*
		* @typedef {(...input: Array<any>) => any} Middleware
		*   Ware.
		*
		* @typedef Pipeline
		*   Pipeline.
		* @property {Run} run
		*   Run the pipeline.
		* @property {Use} use
		*   Add middleware.
		*
		* @typedef {(...input: Array<any>) => void} Run
		*   Call all middleware.
		*
		*   Calls `done` on completion with either an error or the output of the
		*   last middleware.
		*
		*   > 👉 **Note**: as the length of input defines whether async functions get a
		*   > `next` function,
		*   > it’s recommended to keep `input` at one value normally.

		*
		* @typedef {(fn: Middleware) => Pipeline} Use
		*   Add middleware.
		*/
		/**
		* Create new middleware.
		*
		* @returns {Pipeline}
		*   Pipeline.
		*/
		function trough() {
			/** @type {Array<Middleware>} */
			const fns = [];
			/** @type {Pipeline} */
			const pipeline = {
				run,
				use
			};
			return pipeline;
			/** @type {Run} */
			function run(...values) {
				let middlewareIndex = -1;
				/** @type {Callback} */
				const callback = values.pop();
				if (typeof callback !== "function") throw new TypeError("Expected function as last argument, not " + callback);
				next(null, ...values);
				/**
				* Run the next `fn`, or we’re done.
				*
				* @param {Error | null | undefined} error
				* @param {Array<any>} output
				*/
				function next(error, ...output) {
					const fn = fns[++middlewareIndex];
					let index = -1;
					if (error) {
						callback(error);
						return;
					}
					while (++index < values.length) if (output[index] === null || output[index] === void 0) output[index] = values[index];
					values = output;
					if (fn) wrap(fn, next)(...output);
					else callback(null, ...output);
				}
			}
			/** @type {Use} */
			function use(middelware) {
				if (typeof middelware !== "function") throw new TypeError("Expected `middelware` to be a function, not " + middelware);
				fns.push(middelware);
				return pipeline;
			}
		}
		/**
		* Wrap `middleware` into a uniform interface.
		*
		* You can pass all input to the resulting function.
		* `callback` is then called with the output of `middleware`.
		*
		* If `middleware` accepts more arguments than the later given in input,
		* an extra `done` function is passed to it after that input,
		* which must be called by `middleware`.
		*
		* The first value in `input` is the main input value.
		* All other input values are the rest input values.
		* The values given to `callback` are the input values,
		* merged with every non-nullish output value.
		*
		* * if `middleware` throws an error,
		*   returns a promise that is rejected,
		*   or calls the given `done` function with an error,
		*   `callback` is called with that error
		* * if `middleware` returns a value or returns a promise that is resolved,
		*   that value is the main output value
		* * if `middleware` calls `done`,
		*   all non-nullish values except for the first one (the error) overwrite the
		*   output values
		*
		* @param {Middleware} middleware
		*   Function to wrap.
		* @param {Callback} callback
		*   Callback called with the output of `middleware`.
		* @returns {Run}
		*   Wrapped middleware.
		*/
		function wrap(middleware, callback) {
			/** @type {boolean} */
			let called;
			return wrapped;
			/**
			* Call `middleware`.
			* @this {any}
			* @param {Array<any>} parameters
			* @returns {void}
			*/
			function wrapped(...parameters) {
				const fnExpectsCallback = middleware.length > parameters.length;
				/** @type {any} */
				let result;
				if (fnExpectsCallback) parameters.push(done);
				try {
					result = middleware.apply(this, parameters);
				} catch (error) {
					const exception = error;
					if (fnExpectsCallback && called) throw exception;
					return done(exception);
				}
				if (!fnExpectsCallback) if (result && result.then && typeof result.then === "function") result.then(then, done);
				else if (result instanceof Error) done(result);
				else then(result);
			}
			/**
			* Call `callback`, only once.
			*
			* @type {Callback}
			*/
			function done(error, ...output) {
				if (!called) {
					called = true;
					callback(error, ...output);
				}
			}
			/**
			* Call `done` with one value.
			*
			* @param {any} [value]
			*/
			function then(value) {
				done(null, value);
			}
		}
		//#endregion
		//#region node_modules/vfile/lib/minpath.browser.js
		const minpath = {
			basename,
			dirname,
			extname,
			join,
			sep: "/"
		};
		/**
		* Get the basename from a path.
		*
		* @param {string} path
		*   File path.
		* @param {string | null | undefined} [extname]
		*   Extension to strip.
		* @returns {string}
		*   Stem or basename.
		*/
		function basename(path, extname) {
			if (extname !== void 0 && typeof extname !== "string") throw new TypeError("\"ext\" argument must be a string");
			assertPath$1(path);
			let start = 0;
			let end = -1;
			let index = path.length;
			/** @type {boolean | undefined} */
			let seenNonSlash;
			if (extname === void 0 || extname.length === 0 || extname.length > path.length) {
				while (index--) if (path.codePointAt(index) === 47) {
					if (seenNonSlash) {
						start = index + 1;
						break;
					}
				} else if (end < 0) {
					seenNonSlash = true;
					end = index + 1;
				}
				return end < 0 ? "" : path.slice(start, end);
			}
			if (extname === path) return "";
			let firstNonSlashEnd = -1;
			let extnameIndex = extname.length - 1;
			while (index--) if (path.codePointAt(index) === 47) {
				if (seenNonSlash) {
					start = index + 1;
					break;
				}
			} else {
				if (firstNonSlashEnd < 0) {
					seenNonSlash = true;
					firstNonSlashEnd = index + 1;
				}
				if (extnameIndex > -1) if (path.codePointAt(index) === extname.codePointAt(extnameIndex--)) {
					if (extnameIndex < 0) end = index;
				} else {
					extnameIndex = -1;
					end = firstNonSlashEnd;
				}
			}
			if (start === end) end = firstNonSlashEnd;
			else if (end < 0) end = path.length;
			return path.slice(start, end);
		}
		/**
		* Get the dirname from a path.
		*
		* @param {string} path
		*   File path.
		* @returns {string}
		*   File path.
		*/
		function dirname(path) {
			assertPath$1(path);
			if (path.length === 0) return ".";
			let end = -1;
			let index = path.length;
			/** @type {boolean | undefined} */
			let unmatchedSlash;
			while (--index) if (path.codePointAt(index) === 47) {
				if (unmatchedSlash) {
					end = index;
					break;
				}
			} else if (!unmatchedSlash) unmatchedSlash = true;
			return end < 0 ? path.codePointAt(0) === 47 ? "/" : "." : end === 1 && path.codePointAt(0) === 47 ? "//" : path.slice(0, end);
		}
		/**
		* Get an extname from a path.
		*
		* @param {string} path
		*   File path.
		* @returns {string}
		*   Extname.
		*/
		function extname(path) {
			assertPath$1(path);
			let index = path.length;
			let end = -1;
			let startPart = 0;
			let startDot = -1;
			let preDotState = 0;
			/** @type {boolean | undefined} */
			let unmatchedSlash;
			while (index--) {
				const code = path.codePointAt(index);
				if (code === 47) {
					if (unmatchedSlash) {
						startPart = index + 1;
						break;
					}
					continue;
				}
				if (end < 0) {
					unmatchedSlash = true;
					end = index + 1;
				}
				if (code === 46) {
					if (startDot < 0) startDot = index;
					else if (preDotState !== 1) preDotState = 1;
				} else if (startDot > -1) preDotState = -1;
			}
			if (startDot < 0 || end < 0 || preDotState === 0 || preDotState === 1 && startDot === end - 1 && startDot === startPart + 1) return "";
			return path.slice(startDot, end);
		}
		/**
		* Join segments from a path.
		*
		* @param {Array<string>} segments
		*   Path segments.
		* @returns {string}
		*   File path.
		*/
		function join(...segments) {
			let index = -1;
			/** @type {string | undefined} */
			let joined;
			while (++index < segments.length) {
				assertPath$1(segments[index]);
				if (segments[index]) joined = joined === void 0 ? segments[index] : joined + "/" + segments[index];
			}
			return joined === void 0 ? "." : normalize(joined);
		}
		/**
		* Normalize a basic file path.
		*
		* @param {string} path
		*   File path.
		* @returns {string}
		*   File path.
		*/
		function normalize(path) {
			assertPath$1(path);
			const absolute = path.codePointAt(0) === 47;
			let value = normalizeString(path, !absolute);
			if (value.length === 0 && !absolute) value = ".";
			if (value.length > 0 && path.codePointAt(path.length - 1) === 47) value += "/";
			return absolute ? "/" + value : value;
		}
		/**
		* Resolve `.` and `..` elements in a path with directory names.
		*
		* @param {string} path
		*   File path.
		* @param {boolean} allowAboveRoot
		*   Whether `..` can move above root.
		* @returns {string}
		*   File path.
		*/
		function normalizeString(path, allowAboveRoot) {
			let result = "";
			let lastSegmentLength = 0;
			let lastSlash = -1;
			let dots = 0;
			let index = -1;
			/** @type {number | undefined} */
			let code;
			/** @type {number} */
			let lastSlashIndex;
			while (++index <= path.length) {
				if (index < path.length) code = path.codePointAt(index);
				else if (code === 47) break;
				else code = 47;
				if (code === 47) {
					if (lastSlash === index - 1 || dots === 1) {} else if (lastSlash !== index - 1 && dots === 2) {
						if (result.length < 2 || lastSegmentLength !== 2 || result.codePointAt(result.length - 1) !== 46 || result.codePointAt(result.length - 2) !== 46) {
							if (result.length > 2) {
								lastSlashIndex = result.lastIndexOf("/");
								if (lastSlashIndex !== result.length - 1) {
									if (lastSlashIndex < 0) {
										result = "";
										lastSegmentLength = 0;
									} else {
										result = result.slice(0, lastSlashIndex);
										lastSegmentLength = result.length - 1 - result.lastIndexOf("/");
									}
									lastSlash = index;
									dots = 0;
									continue;
								}
							} else if (result.length > 0) {
								result = "";
								lastSegmentLength = 0;
								lastSlash = index;
								dots = 0;
								continue;
							}
						}
						if (allowAboveRoot) {
							result = result.length > 0 ? result + "/.." : "..";
							lastSegmentLength = 2;
						}
					} else {
						if (result.length > 0) result += "/" + path.slice(lastSlash + 1, index);
						else result = path.slice(lastSlash + 1, index);
						lastSegmentLength = index - lastSlash - 1;
					}
					lastSlash = index;
					dots = 0;
				} else if (code === 46 && dots > -1) dots++;
				else dots = -1;
			}
			return result;
		}
		/**
		* Make sure `path` is a string.
		*
		* @param {string} path
		*   File path.
		* @returns {asserts path is string}
		*   Nothing.
		*/
		function assertPath$1(path) {
			if (typeof path !== "string") throw new TypeError("Path must be a string. Received " + JSON.stringify(path));
		}
		//#endregion
		//#region node_modules/vfile/lib/minproc.browser.js
		const minproc = { cwd };
		function cwd() {
			return "/";
		}
		//#endregion
		//#region node_modules/vfile/lib/minurl.shared.js
		/**
		* Checks if a value has the shape of a WHATWG URL object.
		*
		* Using a symbol or instanceof would not be able to recognize URL objects
		* coming from other implementations (e.g. in Electron), so instead we are
		* checking some well known properties for a lack of a better test.
		*
		* We use `href` and `protocol` as they are the only properties that are
		* easy to retrieve and calculate due to the lazy nature of the getters.
		*
		* We check for auth attribute to distinguish legacy url instance with
		* WHATWG URL instance.
		*
		* @param {unknown} fileUrlOrPath
		*   File path or URL.
		* @returns {fileUrlOrPath is URL}
		*   Whether it’s a URL.
		*/
		function isUrl(fileUrlOrPath) {
			return Boolean(fileUrlOrPath !== null && typeof fileUrlOrPath === "object" && "href" in fileUrlOrPath && fileUrlOrPath.href && "protocol" in fileUrlOrPath && fileUrlOrPath.protocol && fileUrlOrPath.auth === void 0);
		}
		//#endregion
		//#region node_modules/vfile/lib/minurl.browser.js
		/**
		* @param {URL | string} path
		*   File URL.
		* @returns {string}
		*   File URL.
		*/
		function urlToPath(path) {
			if (typeof path === "string") path = new URL(path);
			else if (!isUrl(path)) {
				/** @type {NodeJS.ErrnoException} */
				const error = /* @__PURE__ */ new TypeError("The \"path\" argument must be of type string or an instance of URL. Received `" + path + "`");
				error.code = "ERR_INVALID_ARG_TYPE";
				throw error;
			}
			if (path.protocol !== "file:") {
				/** @type {NodeJS.ErrnoException} */
				const error = /* @__PURE__ */ new TypeError("The URL must be of scheme file");
				error.code = "ERR_INVALID_URL_SCHEME";
				throw error;
			}
			return getPathFromURLPosix(path);
		}
		/**
		* Get a path from a POSIX URL.
		*
		* @param {URL} url
		*   URL.
		* @returns {string}
		*   File path.
		*/
		function getPathFromURLPosix(url) {
			if (url.hostname !== "") {
				/** @type {NodeJS.ErrnoException} */
				const error = /* @__PURE__ */ new TypeError("File URL host must be \"localhost\" or empty on darwin");
				error.code = "ERR_INVALID_FILE_URL_HOST";
				throw error;
			}
			const pathname = url.pathname;
			let index = -1;
			while (++index < pathname.length) if (pathname.codePointAt(index) === 37 && pathname.codePointAt(index + 1) === 50) {
				const third = pathname.codePointAt(index + 2);
				if (third === 70 || third === 102) {
					/** @type {NodeJS.ErrnoException} */
					const error = /* @__PURE__ */ new TypeError("File URL path must not include encoded / characters");
					error.code = "ERR_INVALID_FILE_URL_PATH";
					throw error;
				}
			}
			return decodeURIComponent(pathname);
		}
		//#endregion
		//#region node_modules/vfile/lib/index.js
		/**
		* @import {Node, Point, Position} from 'unist'
		* @import {Options as MessageOptions} from 'vfile-message'
		* @import {Compatible, Data, Map, Options, Value} from 'vfile'
		*/
		/**
		* @typedef {object & {type: string, position?: Position | undefined}} NodeLike
		*/
		/**
		* Order of setting (least specific to most), we need this because otherwise
		* `{stem: 'a', path: '~/b.js'}` would throw, as a path is needed before a
		* stem can be set.
		*/
		const order = [
			"history",
			"path",
			"basename",
			"stem",
			"extname",
			"dirname"
		];
		var VFile = class {
			/**
			* Create a new virtual file.
			*
			* `options` is treated as:
			*
			* *   `string` or `Uint8Array` — `{value: options}`
			* *   `URL` — `{path: options}`
			* *   `VFile` — shallow copies its data over to the new file
			* *   `object` — all fields are shallow copied over to the new file
			*
			* Path related fields are set in the following order (least specific to
			* most specific): `history`, `path`, `basename`, `stem`, `extname`,
			* `dirname`.
			*
			* You cannot set `dirname` or `extname` without setting either `history`,
			* `path`, `basename`, or `stem` too.
			*
			* @param {Compatible | null | undefined} [value]
			*   File value.
			* @returns
			*   New instance.
			*/
			constructor(value) {
				/** @type {Options | VFile} */
				let options;
				if (!value) options = {};
				else if (isUrl(value)) options = { path: value };
				else if (typeof value === "string" || isUint8Array$1(value)) options = { value };
				else options = value;
				/**
				* Base of `path` (default: `process.cwd()` or `'/'` in browsers).
				*
				* @type {string}
				*/
				this.cwd = "cwd" in options ? "" : minproc.cwd();
				/**
				* Place to store custom info (default: `{}`).
				*
				* It’s OK to store custom data directly on the file but moving it to
				* `data` is recommended.
				*
				* @type {Data}
				*/
				this.data = {};
				/**
				* List of file paths the file moved between.
				*
				* The first is the original path and the last is the current path.
				*
				* @type {Array<string>}
				*/
				this.history = [];
				/**
				* List of messages associated with the file.
				*
				* @type {Array<VFileMessage>}
				*/
				this.messages = [];
				/**
				* Raw value.
				*
				* @type {Value}
				*/
				this.value;
				/**
				* Source map.
				*
				* This type is equivalent to the `RawSourceMap` type from the `source-map`
				* module.
				*
				* @type {Map | null | undefined}
				*/
				this.map;
				/**
				* Custom, non-string, compiled, representation.
				*
				* This is used by unified to store non-string results.
				* One example is when turning markdown into React nodes.
				*
				* @type {unknown}
				*/
				this.result;
				/**
				* Whether a file was saved to disk.
				*
				* This is used by vfile reporters.
				*
				* @type {boolean}
				*/
				this.stored;
				let index = -1;
				while (++index < order.length) {
					const field = order[index];
					if (field in options && options[field] !== void 0 && options[field] !== null) this[field] = field === "history" ? [...options[field]] : options[field];
				}
				/** @type {string} */
				let field;
				for (field in options) if (!order.includes(field)) this[field] = options[field];
			}
			/**
			* Get the basename (including extname) (example: `'index.min.js'`).
			*
			* @returns {string | undefined}
			*   Basename.
			*/
			get basename() {
				return typeof this.path === "string" ? minpath.basename(this.path) : void 0;
			}
			/**
			* Set basename (including extname) (`'index.min.js'`).
			*
			* Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
			* on windows).
			* Cannot be nullified (use `file.path = file.dirname` instead).
			*
			* @param {string} basename
			*   Basename.
			* @returns {undefined}
			*   Nothing.
			*/
			set basename(basename) {
				assertNonEmpty(basename, "basename");
				assertPart(basename, "basename");
				this.path = minpath.join(this.dirname || "", basename);
			}
			/**
			* Get the parent path (example: `'~'`).
			*
			* @returns {string | undefined}
			*   Dirname.
			*/
			get dirname() {
				return typeof this.path === "string" ? minpath.dirname(this.path) : void 0;
			}
			/**
			* Set the parent path (example: `'~'`).
			*
			* Cannot be set if there’s no `path` yet.
			*
			* @param {string | undefined} dirname
			*   Dirname.
			* @returns {undefined}
			*   Nothing.
			*/
			set dirname(dirname) {
				assertPath(this.basename, "dirname");
				this.path = minpath.join(dirname || "", this.basename);
			}
			/**
			* Get the extname (including dot) (example: `'.js'`).
			*
			* @returns {string | undefined}
			*   Extname.
			*/
			get extname() {
				return typeof this.path === "string" ? minpath.extname(this.path) : void 0;
			}
			/**
			* Set the extname (including dot) (example: `'.js'`).
			*
			* Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
			* on windows).
			* Cannot be set if there’s no `path` yet.
			*
			* @param {string | undefined} extname
			*   Extname.
			* @returns {undefined}
			*   Nothing.
			*/
			set extname(extname) {
				assertPart(extname, "extname");
				assertPath(this.dirname, "extname");
				if (extname) {
					if (extname.codePointAt(0) !== 46) throw new Error("`extname` must start with `.`");
					if (extname.includes(".", 1)) throw new Error("`extname` cannot contain multiple dots");
				}
				this.path = minpath.join(this.dirname, this.stem + (extname || ""));
			}
			/**
			* Get the full path (example: `'~/index.min.js'`).
			*
			* @returns {string}
			*   Path.
			*/
			get path() {
				return this.history[this.history.length - 1];
			}
			/**
			* Set the full path (example: `'~/index.min.js'`).
			*
			* Cannot be nullified.
			* You can set a file URL (a `URL` object with a `file:` protocol) which will
			* be turned into a path with `url.fileURLToPath`.
			*
			* @param {URL | string} path
			*   Path.
			* @returns {undefined}
			*   Nothing.
			*/
			set path(path) {
				if (isUrl(path)) path = urlToPath(path);
				assertNonEmpty(path, "path");
				if (this.path !== path) this.history.push(path);
			}
			/**
			* Get the stem (basename w/o extname) (example: `'index.min'`).
			*
			* @returns {string | undefined}
			*   Stem.
			*/
			get stem() {
				return typeof this.path === "string" ? minpath.basename(this.path, this.extname) : void 0;
			}
			/**
			* Set the stem (basename w/o extname) (example: `'index.min'`).
			*
			* Cannot contain path separators (`'/'` on unix, macOS, and browsers, `'\'`
			* on windows).
			* Cannot be nullified (use `file.path = file.dirname` instead).
			*
			* @param {string} stem
			*   Stem.
			* @returns {undefined}
			*   Nothing.
			*/
			set stem(stem) {
				assertNonEmpty(stem, "stem");
				assertPart(stem, "stem");
				this.path = minpath.join(this.dirname || "", stem + (this.extname || ""));
			}
			/**
			* Create a fatal message for `reason` associated with the file.
			*
			* The `fatal` field of the message is set to `true` (error; file not usable)
			* and the `file` field is set to the current file path.
			* The message is added to the `messages` field on `file`.
			*
			* > 🪦 **Note**: also has obsolete signatures.
			*
			* @overload
			* @param {string} reason
			* @param {MessageOptions | null | undefined} [options]
			* @returns {never}
			*
			* @overload
			* @param {string} reason
			* @param {Node | NodeLike | null | undefined} parent
			* @param {string | null | undefined} [origin]
			* @returns {never}
			*
			* @overload
			* @param {string} reason
			* @param {Point | Position | null | undefined} place
			* @param {string | null | undefined} [origin]
			* @returns {never}
			*
			* @overload
			* @param {string} reason
			* @param {string | null | undefined} [origin]
			* @returns {never}
			*
			* @overload
			* @param {Error | VFileMessage} cause
			* @param {Node | NodeLike | null | undefined} parent
			* @param {string | null | undefined} [origin]
			* @returns {never}
			*
			* @overload
			* @param {Error | VFileMessage} cause
			* @param {Point | Position | null | undefined} place
			* @param {string | null | undefined} [origin]
			* @returns {never}
			*
			* @overload
			* @param {Error | VFileMessage} cause
			* @param {string | null | undefined} [origin]
			* @returns {never}
			*
			* @param {Error | VFileMessage | string} causeOrReason
			*   Reason for message, should use markdown.
			* @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
			*   Configuration (optional).
			* @param {string | null | undefined} [origin]
			*   Place in code where the message originates (example:
			*   `'my-package:my-rule'` or `'my-rule'`).
			* @returns {never}
			*   Never.
			* @throws {VFileMessage}
			*   Message.
			*/
			fail(causeOrReason, optionsOrParentOrPlace, origin) {
				const message = this.message(causeOrReason, optionsOrParentOrPlace, origin);
				message.fatal = true;
				throw message;
			}
			/**
			* Create an info message for `reason` associated with the file.
			*
			* The `fatal` field of the message is set to `undefined` (info; change
			* likely not needed) and the `file` field is set to the current file path.
			* The message is added to the `messages` field on `file`.
			*
			* > 🪦 **Note**: also has obsolete signatures.
			*
			* @overload
			* @param {string} reason
			* @param {MessageOptions | null | undefined} [options]
			* @returns {VFileMessage}
			*
			* @overload
			* @param {string} reason
			* @param {Node | NodeLike | null | undefined} parent
			* @param {string | null | undefined} [origin]
			* @returns {VFileMessage}
			*
			* @overload
			* @param {string} reason
			* @param {Point | Position | null | undefined} place
			* @param {string | null | undefined} [origin]
			* @returns {VFileMessage}
			*
			* @overload
			* @param {string} reason
			* @param {string | null | undefined} [origin]
			* @returns {VFileMessage}
			*
			* @overload
			* @param {Error | VFileMessage} cause
			* @param {Node | NodeLike | null | undefined} parent
			* @param {string | null | undefined} [origin]
			* @returns {VFileMessage}
			*
			* @overload
			* @param {Error | VFileMessage} cause
			* @param {Point | Position | null | undefined} place
			* @param {string | null | undefined} [origin]
			* @returns {VFileMessage}
			*
			* @overload
			* @param {Error | VFileMessage} cause
			* @param {string | null | undefined} [origin]
			* @returns {VFileMessage}
			*
			* @param {Error | VFileMessage | string} causeOrReason
			*   Reason for message, should use markdown.
			* @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
			*   Configuration (optional).
			* @param {string | null | undefined} [origin]
			*   Place in code where the message originates (example:
			*   `'my-package:my-rule'` or `'my-rule'`).
			* @returns {VFileMessage}
			*   Message.
			*/
			info(causeOrReason, optionsOrParentOrPlace, origin) {
				const message = this.message(causeOrReason, optionsOrParentOrPlace, origin);
				message.fatal = void 0;
				return message;
			}
			/**
			* Create a message for `reason` associated with the file.
			*
			* The `fatal` field of the message is set to `false` (warning; change may be
			* needed) and the `file` field is set to the current file path.
			* The message is added to the `messages` field on `file`.
			*
			* > 🪦 **Note**: also has obsolete signatures.
			*
			* @overload
			* @param {string} reason
			* @param {MessageOptions | null | undefined} [options]
			* @returns {VFileMessage}
			*
			* @overload
			* @param {string} reason
			* @param {Node | NodeLike | null | undefined} parent
			* @param {string | null | undefined} [origin]
			* @returns {VFileMessage}
			*
			* @overload
			* @param {string} reason
			* @param {Point | Position | null | undefined} place
			* @param {string | null | undefined} [origin]
			* @returns {VFileMessage}
			*
			* @overload
			* @param {string} reason
			* @param {string | null | undefined} [origin]
			* @returns {VFileMessage}
			*
			* @overload
			* @param {Error | VFileMessage} cause
			* @param {Node | NodeLike | null | undefined} parent
			* @param {string | null | undefined} [origin]
			* @returns {VFileMessage}
			*
			* @overload
			* @param {Error | VFileMessage} cause
			* @param {Point | Position | null | undefined} place
			* @param {string | null | undefined} [origin]
			* @returns {VFileMessage}
			*
			* @overload
			* @param {Error | VFileMessage} cause
			* @param {string | null | undefined} [origin]
			* @returns {VFileMessage}
			*
			* @param {Error | VFileMessage | string} causeOrReason
			*   Reason for message, should use markdown.
			* @param {Node | NodeLike | MessageOptions | Point | Position | string | null | undefined} [optionsOrParentOrPlace]
			*   Configuration (optional).
			* @param {string | null | undefined} [origin]
			*   Place in code where the message originates (example:
			*   `'my-package:my-rule'` or `'my-rule'`).
			* @returns {VFileMessage}
			*   Message.
			*/
			message(causeOrReason, optionsOrParentOrPlace, origin) {
				const message = new VFileMessage(causeOrReason, optionsOrParentOrPlace, origin);
				if (this.path) {
					message.name = this.path + ":" + message.name;
					message.file = this.path;
				}
				message.fatal = false;
				this.messages.push(message);
				return message;
			}
			/**
			* Serialize the file.
			*
			* > **Note**: which encodings are supported depends on the engine.
			* > For info on Node.js, see:
			* > <https://nodejs.org/api/util.html#whatwg-supported-encodings>.
			*
			* @param {string | null | undefined} [encoding='utf8']
			*   Character encoding to understand `value` as when it’s a `Uint8Array`
			*   (default: `'utf-8'`).
			* @returns {string}
			*   Serialized file.
			*/
			toString(encoding) {
				if (this.value === void 0) return "";
				if (typeof this.value === "string") return this.value;
				return new TextDecoder(encoding || void 0).decode(this.value);
			}
		};
		/**
		* Assert that `part` is not a path (as in, does not contain `path.sep`).
		*
		* @param {string | null | undefined} part
		*   File path part.
		* @param {string} name
		*   Part name.
		* @returns {undefined}
		*   Nothing.
		*/
		function assertPart(part, name) {
			if (part && part.includes(minpath.sep)) throw new Error("`" + name + "` cannot be a path: did not expect `" + minpath.sep + "`");
		}
		/**
		* Assert that `part` is not empty.
		*
		* @param {string | undefined} part
		*   Thing.
		* @param {string} name
		*   Part name.
		* @returns {asserts part is string}
		*   Nothing.
		*/
		function assertNonEmpty(part, name) {
			if (!part) throw new Error("`" + name + "` cannot be empty");
		}
		/**
		* Assert `path` exists.
		*
		* @param {string | undefined} path
		*   Path.
		* @param {string} name
		*   Dependency name.
		* @returns {asserts path is string}
		*   Nothing.
		*/
		function assertPath(path, name) {
			if (!path) throw new Error("Setting `" + name + "` requires `path` to be set too");
		}
		/**
		* Assert `value` is an `Uint8Array`.
		*
		* @param {unknown} value
		*   thing.
		* @returns {value is Uint8Array}
		*   Whether `value` is an `Uint8Array`.
		*/
		function isUint8Array$1(value) {
			return Boolean(value && typeof value === "object" && "byteLength" in value && "byteOffset" in value);
		}
		//#endregion
		//#region node_modules/unified/lib/callable-instance.js
		const CallableInstance = (
		/**
		* @this {Function}
		* @param {string | symbol} property
		* @returns {(...parameters: Array<unknown>) => unknown}
		*/
function(property) {
			const proto = this.constructor.prototype;
			const value = proto[property];
			/** @type {(...parameters: Array<unknown>) => unknown} */
			const apply = function() {
				return value.apply(apply, arguments);
			};
			Object.setPrototypeOf(apply, proto);
			return apply;
		});
		//#endregion
		//#region node_modules/unified/lib/index.js
		/**
		* @typedef {import('trough').Pipeline} Pipeline
		*
		* @typedef {import('unist').Node} Node
		*
		* @typedef {import('vfile').Compatible} Compatible
		* @typedef {import('vfile').Value} Value
		*
		* @typedef {import('../index.js').CompileResultMap} CompileResultMap
		* @typedef {import('../index.js').Data} Data
		* @typedef {import('../index.js').Settings} Settings
		*/
		/**
		* @typedef {CompileResultMap[keyof CompileResultMap]} CompileResults
		*   Acceptable results from compilers.
		*
		*   To register custom results, add them to
		*   {@linkcode CompileResultMap}.
		*/
		/**
		* @template {Node} [Tree=Node]
		*   The node that the compiler receives (default: `Node`).
		* @template {CompileResults} [Result=CompileResults]
		*   The thing that the compiler yields (default: `CompileResults`).
		* @callback Compiler
		*   A **compiler** handles the compiling of a syntax tree to something else
		*   (in most cases, text) (TypeScript type).
		*
		*   It is used in the stringify phase and called with a {@linkcode Node}
		*   and {@linkcode VFile} representation of the document to compile.
		*   It should return the textual representation of the given tree (typically
		*   `string`).
		*
		*   > **Note**: unified typically compiles by serializing: most compilers
		*   > return `string` (or `Uint8Array`).
		*   > Some compilers, such as the one configured with
		*   > [`rehype-react`][rehype-react], return other values (in this case, a
		*   > React tree).
		*   > If you’re using a compiler that doesn’t serialize, expect different
		*   > result values.
		*   >
		*   > To register custom results in TypeScript, add them to
		*   > {@linkcode CompileResultMap}.
		*
		*   [rehype-react]: https://github.com/rehypejs/rehype-react
		* @param {Tree} tree
		*   Tree to compile.
		* @param {VFile} file
		*   File associated with `tree`.
		* @returns {Result}
		*   New content: compiled text (`string` or `Uint8Array`, for `file.value`) or
		*   something else (for `file.result`).
		*/
		/**
		* @template {Node} [Tree=Node]
		*   The node that the parser yields (default: `Node`)
		* @callback Parser
		*   A **parser** handles the parsing of text to a syntax tree.
		*
		*   It is used in the parse phase and is called with a `string` and
		*   {@linkcode VFile} of the document to parse.
		*   It must return the syntax tree representation of the given file
		*   ({@linkcode Node}).
		* @param {string} document
		*   Document to parse.
		* @param {VFile} file
		*   File associated with `document`.
		* @returns {Tree}
		*   Node representing the given file.
		*/
		/**
		* @typedef {(
		*   Plugin<Array<any>, any, any> |
		*   PluginTuple<Array<any>, any, any> |
		*   Preset
		* )} Pluggable
		*   Union of the different ways to add plugins and settings.
		*/
		/**
		* @typedef {Array<Pluggable>} PluggableList
		*   List of plugins and presets.
		*/
		/**
		* @template {Array<unknown>} [PluginParameters=[]]
		*   Arguments passed to the plugin (default: `[]`, the empty tuple).
		* @template {Node | string | undefined} [Input=Node]
		*   Value that is expected as input (default: `Node`).
		*
		*   *   If the plugin returns a {@linkcode Transformer}, this
		*       should be the node it expects.
		*   *   If the plugin sets a {@linkcode Parser}, this should be
		*       `string`.
		*   *   If the plugin sets a {@linkcode Compiler}, this should be the
		*       node it expects.
		* @template [Output=Input]
		*   Value that is yielded as output (default: `Input`).
		*
		*   *   If the plugin returns a {@linkcode Transformer}, this
		*       should be the node that that yields.
		*   *   If the plugin sets a {@linkcode Parser}, this should be the
		*       node that it yields.
		*   *   If the plugin sets a {@linkcode Compiler}, this should be
		*       result it yields.
		* @typedef {(
		*   (this: Processor, ...parameters: PluginParameters) =>
		*     Input extends string ? // Parser.
		*        Output extends Node | undefined ? undefined | void : never :
		*     Output extends CompileResults ? // Compiler.
		*        Input extends Node | undefined ? undefined | void : never :
		*     Transformer<
		*       Input extends Node ? Input : Node,
		*       Output extends Node ? Output : Node
		*     > | undefined | void
		* )} Plugin
		*   Single plugin.
		*
		*   Plugins configure the processors they are applied on in the following
		*   ways:
		*
		*   *   they change the processor, such as the parser, the compiler, or by
		*       configuring data
		*   *   they specify how to handle trees and files
		*
		*   In practice, they are functions that can receive options and configure the
		*   processor (`this`).
		*
		*   > **Note**: plugins are called when the processor is *frozen*, not when
		*   > they are applied.
		*/
		/**
		* Tuple of a plugin and its configuration.
		*
		* The first item is a plugin, the rest are its parameters.
		*
		* @template {Array<unknown>} [TupleParameters=[]]
		*   Arguments passed to the plugin (default: `[]`, the empty tuple).
		* @template {Node | string | undefined} [Input=undefined]
		*   Value that is expected as input (optional).
		*
		*   *   If the plugin returns a {@linkcode Transformer}, this
		*       should be the node it expects.
		*   *   If the plugin sets a {@linkcode Parser}, this should be
		*       `string`.
		*   *   If the plugin sets a {@linkcode Compiler}, this should be the
		*       node it expects.
		* @template [Output=undefined] (optional).
		*   Value that is yielded as output.
		*
		*   *   If the plugin returns a {@linkcode Transformer}, this
		*       should be the node that that yields.
		*   *   If the plugin sets a {@linkcode Parser}, this should be the
		*       node that it yields.
		*   *   If the plugin sets a {@linkcode Compiler}, this should be
		*       result it yields.
		* @typedef {(
		*   [
		*     plugin: Plugin<TupleParameters, Input, Output>,
		*     ...parameters: TupleParameters
		*   ]
		* )} PluginTuple
		*/
		/**
		* @typedef Preset
		*   Sharable configuration.
		*
		*   They can contain plugins and settings.
		* @property {PluggableList | undefined} [plugins]
		*   List of plugins and presets (optional).
		* @property {Settings | undefined} [settings]
		*   Shared settings for parsers and compilers (optional).
		*/
		/**
		* @template {VFile} [File=VFile]
		*   The file that the callback receives (default: `VFile`).
		* @callback ProcessCallback
		*   Callback called when the process is done.
		*
		*   Called with either an error or a result.
		* @param {Error | undefined} [error]
		*   Fatal error (optional).
		* @param {File | undefined} [file]
		*   Processed file (optional).
		* @returns {undefined}
		*   Nothing.
		*/
		/**
		* @template {Node} [Tree=Node]
		*   The tree that the callback receives (default: `Node`).
		* @callback RunCallback
		*   Callback called when transformers are done.
		*
		*   Called with either an error or results.
		* @param {Error | undefined} [error]
		*   Fatal error (optional).
		* @param {Tree | undefined} [tree]
		*   Transformed tree (optional).
		* @param {VFile | undefined} [file]
		*   File (optional).
		* @returns {undefined}
		*   Nothing.
		*/
		/**
		* @template {Node} [Output=Node]
		*   Node type that the transformer yields (default: `Node`).
		* @callback TransformCallback
		*   Callback passed to transforms.
		*
		*   If the signature of a `transformer` accepts a third argument, the
		*   transformer may perform asynchronous operations, and must call it.
		* @param {Error | undefined} [error]
		*   Fatal error to stop the process (optional).
		* @param {Output | undefined} [tree]
		*   New, changed, tree (optional).
		* @param {VFile | undefined} [file]
		*   New, changed, file (optional).
		* @returns {undefined}
		*   Nothing.
		*/
		/**
		* @template {Node} [Input=Node]
		*   Node type that the transformer expects (default: `Node`).
		* @template {Node} [Output=Input]
		*   Node type that the transformer yields (default: `Input`).
		* @callback Transformer
		*   Transformers handle syntax trees and files.
		*
		*   They are functions that are called each time a syntax tree and file are
		*   passed through the run phase.
		*   When an error occurs in them (either because it’s thrown, returned,
		*   rejected, or passed to `next`), the process stops.
		*
		*   The run phase is handled by [`trough`][trough], see its documentation for
		*   the exact semantics of these functions.
		*
		*   > **Note**: you should likely ignore `next`: don’t accept it.
		*   > it supports callback-style async work.
		*   > But promises are likely easier to reason about.
		*
		*   [trough]: https://github.com/wooorm/trough#function-fninput-next
		* @param {Input} tree
		*   Tree to handle.
		* @param {VFile} file
		*   File to handle.
		* @param {TransformCallback<Output>} next
		*   Callback.
		* @returns {(
		*   Promise<Output | undefined | void> |
		*   Promise<never> | // For some reason this is needed separately.
		*   Output |
		*   Error |
		*   undefined |
		*   void
		* )}
		*   If you accept `next`, nothing.
		*   Otherwise:
		*
		*   *   `Error` — fatal error to stop the process
		*   *   `Promise<undefined>` or `undefined` — the next transformer keeps using
		*       same tree
		*   *   `Promise<Node>` or `Node` — new, changed, tree
		*/
		/**
		* @template {Node | undefined} ParseTree
		*   Output of `parse`.
		* @template {Node | undefined} HeadTree
		*   Input for `run`.
		* @template {Node | undefined} TailTree
		*   Output for `run`.
		* @template {Node | undefined} CompileTree
		*   Input of `stringify`.
		* @template {CompileResults | undefined} CompileResult
		*   Output of `stringify`.
		* @template {Node | string | undefined} Input
		*   Input of plugin.
		* @template Output
		*   Output of plugin (optional).
		* @typedef {(
		*   Input extends string
		*     ? Output extends Node | undefined
		*       ? // Parser.
		*         Processor<
		*           Output extends undefined ? ParseTree : Output,
		*           HeadTree,
		*           TailTree,
		*           CompileTree,
		*           CompileResult
		*         >
		*       : // Unknown.
		*         Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>
		*     : Output extends CompileResults
		*     ? Input extends Node | undefined
		*       ? // Compiler.
		*         Processor<
		*           ParseTree,
		*           HeadTree,
		*           TailTree,
		*           Input extends undefined ? CompileTree : Input,
		*           Output extends undefined ? CompileResult : Output
		*         >
		*       : // Unknown.
		*         Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>
		*     : Input extends Node | undefined
		*     ? Output extends Node | undefined
		*       ? // Transform.
		*         Processor<
		*           ParseTree,
		*           HeadTree extends undefined ? Input : HeadTree,
		*           Output extends undefined ? TailTree : Output,
		*           CompileTree,
		*           CompileResult
		*         >
		*       : // Unknown.
		*         Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>
		*     : // Unknown.
		*       Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>
		* )} UsePlugin
		*   Create a processor based on the input/output of a {@link Plugin plugin}.
		*/
		/**
		* @template {CompileResults | undefined} Result
		*   Node type that the transformer yields.
		* @typedef {(
		*   Result extends Value | undefined ?
		*     VFile :
		*     VFile & {result: Result}
		*   )} VFileWithOutput
		*   Type to generate a {@linkcode VFile} corresponding to a compiler result.
		*
		*   If a result that is not acceptable on a `VFile` is used, that will
		*   be stored on the `result` field of {@linkcode VFile}.
		*/
		var import_extend = /* @__PURE__ */ __toESM(require_extend(), 1);
		const own = {}.hasOwnProperty;
		/**
		* Create a new processor.
		*
		* @example
		*   This example shows how a new processor can be created (from `remark`) and linked
		*   to **stdin**(4) and **stdout**(4).
		*
		*   ```js
		*   import process from 'node:process'
		*   import concatStream from 'concat-stream'
		*   import {remark} from 'remark'
		*
		*   process.stdin.pipe(
		*     concatStream(function (buf) {
		*       process.stdout.write(String(remark().processSync(buf)))
		*     })
		*   )
		*   ```
		*
		* @returns
		*   New *unfrozen* processor (`processor`).
		*
		*   This processor is configured to work the same as its ancestor.
		*   When the descendant processor is configured in the future it does not
		*   affect the ancestral processor.
		*/
		const unified = new class Processor extends CallableInstance {
			/**
			* Create a processor.
			*/
			constructor() {
				super("copy");
				/**
				* Compiler to use (deprecated).
				*
				* @deprecated
				*   Use `compiler` instead.
				* @type {(
				*   Compiler<
				*     CompileTree extends undefined ? Node : CompileTree,
				*     CompileResult extends undefined ? CompileResults : CompileResult
				*   > |
				*   undefined
				* )}
				*/
				this.Compiler = void 0;
				/**
				* Parser to use (deprecated).
				*
				* @deprecated
				*   Use `parser` instead.
				* @type {(
				*   Parser<ParseTree extends undefined ? Node : ParseTree> |
				*   undefined
				* )}
				*/
				this.Parser = void 0;
				/**
				* Internal list of configured plugins.
				*
				* @deprecated
				*   This is a private internal property and should not be used.
				* @type {Array<PluginTuple<Array<unknown>>>}
				*/
				this.attachers = [];
				/**
				* Compiler to use.
				*
				* @type {(
				*   Compiler<
				*     CompileTree extends undefined ? Node : CompileTree,
				*     CompileResult extends undefined ? CompileResults : CompileResult
				*   > |
				*   undefined
				* )}
				*/
				this.compiler = void 0;
				/**
				* Internal state to track where we are while freezing.
				*
				* @deprecated
				*   This is a private internal property and should not be used.
				* @type {number}
				*/
				this.freezeIndex = -1;
				/**
				* Internal state to track whether we’re frozen.
				*
				* @deprecated
				*   This is a private internal property and should not be used.
				* @type {boolean | undefined}
				*/
				this.frozen = void 0;
				/**
				* Internal state.
				*
				* @deprecated
				*   This is a private internal property and should not be used.
				* @type {Data}
				*/
				this.namespace = {};
				/**
				* Parser to use.
				*
				* @type {(
				*   Parser<ParseTree extends undefined ? Node : ParseTree> |
				*   undefined
				* )}
				*/
				this.parser = void 0;
				/**
				* Internal list of configured transformers.
				*
				* @deprecated
				*   This is a private internal property and should not be used.
				* @type {Pipeline}
				*/
				this.transformers = trough();
			}
			/**
			* Copy a processor.
			*
			* @deprecated
			*   This is a private internal method and should not be used.
			* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
			*   New *unfrozen* processor ({@linkcode Processor}) that is
			*   configured to work the same as its ancestor.
			*   When the descendant processor is configured in the future it does not
			*   affect the ancestral processor.
			*/
			copy() {
				const destination = new Processor();
				let index = -1;
				while (++index < this.attachers.length) {
					const attacher = this.attachers[index];
					destination.use(...attacher);
				}
				destination.data((0, import_extend.default)(true, {}, this.namespace));
				return destination;
			}
			/**
			* Configure the processor with info available to all plugins.
			* Information is stored in an object.
			*
			* Typically, options can be given to a specific plugin, but sometimes it
			* makes sense to have information shared with several plugins.
			* For example, a list of HTML elements that are self-closing, which is
			* needed during all phases.
			*
			* > **Note**: setting information cannot occur on *frozen* processors.
			* > Call the processor first to create a new unfrozen processor.
			*
			* > **Note**: to register custom data in TypeScript, augment the
			* > {@linkcode Data} interface.
			*
			* @example
			*   This example show how to get and set info:
			*
			*   ```js
			*   import {unified} from 'unified'
			*
			*   const processor = unified().data('alpha', 'bravo')
			*
			*   processor.data('alpha') // => 'bravo'
			*
			*   processor.data() // => {alpha: 'bravo'}
			*
			*   processor.data({charlie: 'delta'})
			*
			*   processor.data() // => {charlie: 'delta'}
			*   ```
			*
			* @template {keyof Data} Key
			*
			* @overload
			* @returns {Data}
			*
			* @overload
			* @param {Data} dataset
			* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
			*
			* @overload
			* @param {Key} key
			* @returns {Data[Key]}
			*
			* @overload
			* @param {Key} key
			* @param {Data[Key]} value
			* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
			*
			* @param {Data | Key} [key]
			*   Key to get or set, or entire dataset to set, or nothing to get the
			*   entire dataset (optional).
			* @param {Data[Key]} [value]
			*   Value to set (optional).
			* @returns {unknown}
			*   The current processor when setting, the value at `key` when getting, or
			*   the entire dataset when getting without key.
			*/
			data(key, value) {
				if (typeof key === "string") {
					if (arguments.length === 2) {
						assertUnfrozen("data", this.frozen);
						this.namespace[key] = value;
						return this;
					}
					return own.call(this.namespace, key) && this.namespace[key] || void 0;
				}
				if (key) {
					assertUnfrozen("data", this.frozen);
					this.namespace = key;
					return this;
				}
				return this.namespace;
			}
			/**
			* Freeze a processor.
			*
			* Frozen processors are meant to be extended and not to be configured
			* directly.
			*
			* When a processor is frozen it cannot be unfrozen.
			* New processors working the same way can be created by calling the
			* processor.
			*
			* It’s possible to freeze processors explicitly by calling `.freeze()`.
			* Processors freeze automatically when `.parse()`, `.run()`, `.runSync()`,
			* `.stringify()`, `.process()`, or `.processSync()` are called.
			*
			* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
			*   The current processor.
			*/
			freeze() {
				if (this.frozen) return this;
				const self = this;
				while (++this.freezeIndex < this.attachers.length) {
					const [attacher, ...options] = this.attachers[this.freezeIndex];
					if (options[0] === false) continue;
					if (options[0] === true) options[0] = void 0;
					const transformer = attacher.call(self, ...options);
					if (typeof transformer === "function") this.transformers.use(transformer);
				}
				this.frozen = true;
				this.freezeIndex = Number.POSITIVE_INFINITY;
				return this;
			}
			/**
			* Parse text to a syntax tree.
			*
			* > **Note**: `parse` freezes the processor if not already *frozen*.
			*
			* > **Note**: `parse` performs the parse phase, not the run phase or other
			* > phases.
			*
			* @param {Compatible | undefined} [file]
			*   file to parse (optional); typically `string` or `VFile`; any value
			*   accepted as `x` in `new VFile(x)`.
			* @returns {ParseTree extends undefined ? Node : ParseTree}
			*   Syntax tree representing `file`.
			*/
			parse(file) {
				this.freeze();
				const realFile = vfile(file);
				const parser = this.parser || this.Parser;
				assertParser("parse", parser);
				return parser(String(realFile), realFile);
			}
			/**
			* Process the given file as configured on the processor.
			*
			* > **Note**: `process` freezes the processor if not already *frozen*.
			*
			* > **Note**: `process` performs the parse, run, and stringify phases.
			*
			* @overload
			* @param {Compatible | undefined} file
			* @param {ProcessCallback<VFileWithOutput<CompileResult>>} done
			* @returns {undefined}
			*
			* @overload
			* @param {Compatible | undefined} [file]
			* @returns {Promise<VFileWithOutput<CompileResult>>}
			*
			* @param {Compatible | undefined} [file]
			*   File (optional); typically `string` or `VFile`]; any value accepted as
			*   `x` in `new VFile(x)`.
			* @param {ProcessCallback<VFileWithOutput<CompileResult>> | undefined} [done]
			*   Callback (optional).
			* @returns {Promise<VFile> | undefined}
			*   Nothing if `done` is given.
			*   Otherwise a promise, rejected with a fatal error or resolved with the
			*   processed file.
			*
			*   The parsed, transformed, and compiled value is available at
			*   `file.value` (see note).
			*
			*   > **Note**: unified typically compiles by serializing: most
			*   > compilers return `string` (or `Uint8Array`).
			*   > Some compilers, such as the one configured with
			*   > [`rehype-react`][rehype-react], return other values (in this case, a
			*   > React tree).
			*   > If you’re using a compiler that doesn’t serialize, expect different
			*   > result values.
			*   >
			*   > To register custom results in TypeScript, add them to
			*   > {@linkcode CompileResultMap}.
			*
			*   [rehype-react]: https://github.com/rehypejs/rehype-react
			*/
			process(file, done) {
				const self = this;
				this.freeze();
				assertParser("process", this.parser || this.Parser);
				assertCompiler("process", this.compiler || this.Compiler);
				return done ? executor(void 0, done) : new Promise(executor);
				/**
				* @param {((file: VFileWithOutput<CompileResult>) => undefined | void) | undefined} resolve
				* @param {(error: Error | undefined) => undefined | void} reject
				* @returns {undefined}
				*/
				function executor(resolve, reject) {
					const realFile = vfile(file);
					const parseTree = self.parse(realFile);
					self.run(parseTree, realFile, function(error, tree, file) {
						if (error || !tree || !file) return realDone(error);
						const compileTree = tree;
						const compileResult = self.stringify(compileTree, file);
						if (looksLikeAValue(compileResult)) file.value = compileResult;
						else file.result = compileResult;
						realDone(error, file);
					});
					/**
					* @param {Error | undefined} error
					* @param {VFileWithOutput<CompileResult> | undefined} [file]
					* @returns {undefined}
					*/
					function realDone(error, file) {
						if (error || !file) reject(error);
						else if (resolve) resolve(file);
						else done(void 0, file);
					}
				}
			}
			/**
			* Process the given file as configured on the processor.
			*
			* An error is thrown if asynchronous transforms are configured.
			*
			* > **Note**: `processSync` freezes the processor if not already *frozen*.
			*
			* > **Note**: `processSync` performs the parse, run, and stringify phases.
			*
			* @param {Compatible | undefined} [file]
			*   File (optional); typically `string` or `VFile`; any value accepted as
			*   `x` in `new VFile(x)`.
			* @returns {VFileWithOutput<CompileResult>}
			*   The processed file.
			*
			*   The parsed, transformed, and compiled value is available at
			*   `file.value` (see note).
			*
			*   > **Note**: unified typically compiles by serializing: most
			*   > compilers return `string` (or `Uint8Array`).
			*   > Some compilers, such as the one configured with
			*   > [`rehype-react`][rehype-react], return other values (in this case, a
			*   > React tree).
			*   > If you’re using a compiler that doesn’t serialize, expect different
			*   > result values.
			*   >
			*   > To register custom results in TypeScript, add them to
			*   > {@linkcode CompileResultMap}.
			*
			*   [rehype-react]: https://github.com/rehypejs/rehype-react
			*/
			processSync(file) {
				/** @type {boolean} */
				let complete = false;
				/** @type {VFileWithOutput<CompileResult> | undefined} */
				let result;
				this.freeze();
				assertParser("processSync", this.parser || this.Parser);
				assertCompiler("processSync", this.compiler || this.Compiler);
				this.process(file, realDone);
				assertDone("processSync", "process", complete);
				return result;
				/**
				* @type {ProcessCallback<VFileWithOutput<CompileResult>>}
				*/
				function realDone(error, file) {
					complete = true;
					bail(error);
					result = file;
				}
			}
			/**
			* Run *transformers* on a syntax tree.
			*
			* > **Note**: `run` freezes the processor if not already *frozen*.
			*
			* > **Note**: `run` performs the run phase, not other phases.
			*
			* @overload
			* @param {HeadTree extends undefined ? Node : HeadTree} tree
			* @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
			* @returns {undefined}
			*
			* @overload
			* @param {HeadTree extends undefined ? Node : HeadTree} tree
			* @param {Compatible | undefined} file
			* @param {RunCallback<TailTree extends undefined ? Node : TailTree>} done
			* @returns {undefined}
			*
			* @overload
			* @param {HeadTree extends undefined ? Node : HeadTree} tree
			* @param {Compatible | undefined} [file]
			* @returns {Promise<TailTree extends undefined ? Node : TailTree>}
			*
			* @param {HeadTree extends undefined ? Node : HeadTree} tree
			*   Tree to transform and inspect.
			* @param {(
			*   RunCallback<TailTree extends undefined ? Node : TailTree> |
			*   Compatible
			* )} [file]
			*   File associated with `node` (optional); any value accepted as `x` in
			*   `new VFile(x)`.
			* @param {RunCallback<TailTree extends undefined ? Node : TailTree>} [done]
			*   Callback (optional).
			* @returns {Promise<TailTree extends undefined ? Node : TailTree> | undefined}
			*   Nothing if `done` is given.
			*   Otherwise, a promise rejected with a fatal error or resolved with the
			*   transformed tree.
			*/
			run(tree, file, done) {
				assertNode(tree);
				this.freeze();
				const transformers = this.transformers;
				if (!done && typeof file === "function") {
					done = file;
					file = void 0;
				}
				return done ? executor(void 0, done) : new Promise(executor);
				/**
				* @param {(
				*   ((tree: TailTree extends undefined ? Node : TailTree) => undefined | void) |
				*   undefined
				* )} resolve
				* @param {(error: Error) => undefined | void} reject
				* @returns {undefined}
				*/
				function executor(resolve, reject) {
					const realFile = vfile(file);
					transformers.run(tree, realFile, realDone);
					/**
					* @param {Error | undefined} error
					* @param {Node} outputTree
					* @param {VFile} file
					* @returns {undefined}
					*/
					function realDone(error, outputTree, file) {
						const resultingTree = outputTree || tree;
						if (error) reject(error);
						else if (resolve) resolve(resultingTree);
						else done(void 0, resultingTree, file);
					}
				}
			}
			/**
			* Run *transformers* on a syntax tree.
			*
			* An error is thrown if asynchronous transforms are configured.
			*
			* > **Note**: `runSync` freezes the processor if not already *frozen*.
			*
			* > **Note**: `runSync` performs the run phase, not other phases.
			*
			* @param {HeadTree extends undefined ? Node : HeadTree} tree
			*   Tree to transform and inspect.
			* @param {Compatible | undefined} [file]
			*   File associated with `node` (optional); any value accepted as `x` in
			*   `new VFile(x)`.
			* @returns {TailTree extends undefined ? Node : TailTree}
			*   Transformed tree.
			*/
			runSync(tree, file) {
				/** @type {boolean} */
				let complete = false;
				/** @type {(TailTree extends undefined ? Node : TailTree) | undefined} */
				let result;
				this.run(tree, file, realDone);
				assertDone("runSync", "run", complete);
				return result;
				/**
				* @type {RunCallback<TailTree extends undefined ? Node : TailTree>}
				*/
				function realDone(error, tree) {
					bail(error);
					result = tree;
					complete = true;
				}
			}
			/**
			* Compile a syntax tree.
			*
			* > **Note**: `stringify` freezes the processor if not already *frozen*.
			*
			* > **Note**: `stringify` performs the stringify phase, not the run phase
			* > or other phases.
			*
			* @param {CompileTree extends undefined ? Node : CompileTree} tree
			*   Tree to compile.
			* @param {Compatible | undefined} [file]
			*   File associated with `node` (optional); any value accepted as `x` in
			*   `new VFile(x)`.
			* @returns {CompileResult extends undefined ? Value : CompileResult}
			*   Textual representation of the tree (see note).
			*
			*   > **Note**: unified typically compiles by serializing: most compilers
			*   > return `string` (or `Uint8Array`).
			*   > Some compilers, such as the one configured with
			*   > [`rehype-react`][rehype-react], return other values (in this case, a
			*   > React tree).
			*   > If you’re using a compiler that doesn’t serialize, expect different
			*   > result values.
			*   >
			*   > To register custom results in TypeScript, add them to
			*   > {@linkcode CompileResultMap}.
			*
			*   [rehype-react]: https://github.com/rehypejs/rehype-react
			*/
			stringify(tree, file) {
				this.freeze();
				const realFile = vfile(file);
				const compiler = this.compiler || this.Compiler;
				assertCompiler("stringify", compiler);
				assertNode(tree);
				return compiler(tree, realFile);
			}
			/**
			* Configure the processor to use a plugin, a list of usable values, or a
			* preset.
			*
			* If the processor is already using a plugin, the previous plugin
			* configuration is changed based on the options that are passed in.
			* In other words, the plugin is not added a second time.
			*
			* > **Note**: `use` cannot be called on *frozen* processors.
			* > Call the processor first to create a new unfrozen processor.
			*
			* @example
			*   There are many ways to pass plugins to `.use()`.
			*   This example gives an overview:
			*
			*   ```js
			*   import {unified} from 'unified'
			*
			*   unified()
			*     // Plugin with options:
			*     .use(pluginA, {x: true, y: true})
			*     // Passing the same plugin again merges configuration (to `{x: true, y: false, z: true}`):
			*     .use(pluginA, {y: false, z: true})
			*     // Plugins:
			*     .use([pluginB, pluginC])
			*     // Two plugins, the second with options:
			*     .use([pluginD, [pluginE, {}]])
			*     // Preset with plugins and settings:
			*     .use({plugins: [pluginF, [pluginG, {}]], settings: {position: false}})
			*     // Settings only:
			*     .use({settings: {position: false}})
			*   ```
			*
			* @template {Array<unknown>} [Parameters=[]]
			* @template {Node | string | undefined} [Input=undefined]
			* @template [Output=Input]
			*
			* @overload
			* @param {Preset | null | undefined} [preset]
			* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
			*
			* @overload
			* @param {PluggableList} list
			* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
			*
			* @overload
			* @param {Plugin<Parameters, Input, Output>} plugin
			* @param {...(Parameters | [boolean])} parameters
			* @returns {UsePlugin<ParseTree, HeadTree, TailTree, CompileTree, CompileResult, Input, Output>}
			*
			* @param {PluggableList | Plugin | Preset | null | undefined} value
			*   Usable value.
			* @param {...unknown} parameters
			*   Parameters, when a plugin is given as a usable value.
			* @returns {Processor<ParseTree, HeadTree, TailTree, CompileTree, CompileResult>}
			*   Current processor.
			*/
			use(value, ...parameters) {
				const attachers = this.attachers;
				const namespace = this.namespace;
				assertUnfrozen("use", this.frozen);
				if (value === null || value === void 0) {} else if (typeof value === "function") addPlugin(value, parameters);
				else if (typeof value === "object") if (Array.isArray(value)) addList(value);
				else addPreset(value);
				else throw new TypeError("Expected usable value, not `" + value + "`");
				return this;
				/**
				* @param {Pluggable} value
				* @returns {undefined}
				*/
				function add(value) {
					if (typeof value === "function") addPlugin(value, []);
					else if (typeof value === "object") if (Array.isArray(value)) {
						const [plugin, ...parameters] = value;
						addPlugin(plugin, parameters);
					} else addPreset(value);
					else throw new TypeError("Expected usable value, not `" + value + "`");
				}
				/**
				* @param {Preset} result
				* @returns {undefined}
				*/
				function addPreset(result) {
					if (!("plugins" in result) && !("settings" in result)) throw new Error("Expected usable value but received an empty preset, which is probably a mistake: presets typically come with `plugins` and sometimes with `settings`, but this has neither");
					addList(result.plugins);
					if (result.settings) namespace.settings = (0, import_extend.default)(true, namespace.settings, result.settings);
				}
				/**
				* @param {PluggableList | null | undefined} plugins
				* @returns {undefined}
				*/
				function addList(plugins) {
					let index = -1;
					if (plugins === null || plugins === void 0) {} else if (Array.isArray(plugins)) while (++index < plugins.length) {
						const thing = plugins[index];
						add(thing);
					}
					else throw new TypeError("Expected a list of plugins, not `" + plugins + "`");
				}
				/**
				* @param {Plugin} plugin
				* @param {Array<unknown>} parameters
				* @returns {undefined}
				*/
				function addPlugin(plugin, parameters) {
					let index = -1;
					let entryIndex = -1;
					while (++index < attachers.length) if (attachers[index][0] === plugin) {
						entryIndex = index;
						break;
					}
					if (entryIndex === -1) attachers.push([plugin, ...parameters]);
					else if (parameters.length > 0) {
						let [primary, ...rest] = parameters;
						const currentPrimary = attachers[entryIndex][1];
						if (isPlainObject(currentPrimary) && isPlainObject(primary)) primary = (0, import_extend.default)(true, currentPrimary, primary);
						attachers[entryIndex] = [
							plugin,
							primary,
							...rest
						];
					}
				}
			}
		}().freeze();
		/**
		* Assert a parser is available.
		*
		* @param {string} name
		* @param {unknown} value
		* @returns {asserts value is Parser}
		*/
		function assertParser(name, value) {
			if (typeof value !== "function") throw new TypeError("Cannot `" + name + "` without `parser`");
		}
		/**
		* Assert a compiler is available.
		*
		* @param {string} name
		* @param {unknown} value
		* @returns {asserts value is Compiler}
		*/
		function assertCompiler(name, value) {
			if (typeof value !== "function") throw new TypeError("Cannot `" + name + "` without `compiler`");
		}
		/**
		* Assert the processor is not frozen.
		*
		* @param {string} name
		* @param {unknown} frozen
		* @returns {asserts frozen is false}
		*/
		function assertUnfrozen(name, frozen) {
			if (frozen) throw new Error("Cannot call `" + name + "` on a frozen processor.\nCreate a new processor first, by calling it: use `processor()` instead of `processor`.");
		}
		/**
		* Assert `node` is a unist node.
		*
		* @param {unknown} node
		* @returns {asserts node is Node}
		*/
		function assertNode(node) {
			if (!isPlainObject(node) || typeof node.type !== "string") throw new TypeError("Expected node, got `" + node + "`");
		}
		/**
		* Assert that `complete` is `true`.
		*
		* @param {string} name
		* @param {string} asyncName
		* @param {unknown} complete
		* @returns {asserts complete is true}
		*/
		function assertDone(name, asyncName, complete) {
			if (!complete) throw new Error("`" + name + "` finished async. Use `" + asyncName + "` instead");
		}
		/**
		* @param {Compatible | undefined} [value]
		* @returns {VFile}
		*/
		function vfile(value) {
			return looksLikeAVFile(value) ? value : new VFile(value);
		}
		/**
		* @param {Compatible | undefined} [value]
		* @returns {value is VFile}
		*/
		function looksLikeAVFile(value) {
			return Boolean(value && typeof value === "object" && "message" in value && "messages" in value);
		}
		/**
		* @param {unknown} [value]
		* @returns {value is Value}
		*/
		function looksLikeAValue(value) {
			return typeof value === "string" || isUint8Array(value);
		}
		/**
		* Assert `value` is an `Uint8Array`.
		*
		* @param {unknown} value
		*   thing.
		* @returns {value is Uint8Array}
		*   Whether `value` is an `Uint8Array`.
		*/
		function isUint8Array(value) {
			return Boolean(value && typeof value === "object" && "byteLength" in value && "byteOffset" in value);
		}
		//#endregion
		//#region node_modules/react-markdown/lib/index.js
		/**
		* @import {Element, Nodes, Parents, Root} from 'hast'
		* @import {Root as MdastRoot} from 'mdast'
		* @import {ComponentType, JSX, ReactElement, ReactNode} from 'react'
		* @import {Options as RemarkRehypeOptions} from 'remark-rehype'
		* @import {BuildVisitor} from 'unist-util-visit'
		* @import {PluggableList, Processor} from 'unified'
		*/
		/**
		* @callback AllowElement
		*   Filter elements.
		* @param {Readonly<Element>} element
		*   Element to check.
		* @param {number} index
		*   Index of `element` in `parent`.
		* @param {Readonly<Parents> | undefined} parent
		*   Parent of `element`.
		* @returns {boolean | null | undefined}
		*   Whether to allow `element` (default: `false`).
		*/
		/**
		* @typedef ExtraProps
		*   Extra fields we pass.
		* @property {Element | undefined} [node]
		*   passed when `passNode` is on.
		*/
		/**
		* @typedef {{
		*   [Key in keyof JSX.IntrinsicElements]?: ComponentType<JSX.IntrinsicElements[Key] & ExtraProps> | keyof JSX.IntrinsicElements
		* }} Components
		*   Map tag names to components.
		*/
		/**
		* @typedef Deprecation
		*   Deprecation.
		* @property {string} from
		*   Old field.
		* @property {string} id
		*   ID in readme.
		* @property {keyof Options} [to]
		*   New field.
		*/
		/**
		* @typedef Options
		*   Configuration.
		* @property {AllowElement | null | undefined} [allowElement]
		*   Filter elements (optional);
		*   `allowedElements` / `disallowedElements` is used first.
		* @property {ReadonlyArray<string> | null | undefined} [allowedElements]
		*   Tag names to allow (default: all tag names);
		*   cannot combine w/ `disallowedElements`.
		* @property {string | null | undefined} [children]
		*   Markdown.
		* @property {Components | null | undefined} [components]
		*   Map tag names to components.
		* @property {ReadonlyArray<string> | null | undefined} [disallowedElements]
		*   Tag names to disallow (default: `[]`);
		*   cannot combine w/ `allowedElements`.
		* @property {PluggableList | null | undefined} [rehypePlugins]
		*   List of rehype plugins to use.
		* @property {PluggableList | null | undefined} [remarkPlugins]
		*   List of remark plugins to use.
		* @property {Readonly<RemarkRehypeOptions> | null | undefined} [remarkRehypeOptions]
		*   Options to pass through to `remark-rehype`.
		* @property {boolean | null | undefined} [skipHtml=false]
		*   Ignore HTML in markdown completely (default: `false`).
		* @property {boolean | null | undefined} [unwrapDisallowed=false]
		*   Extract (unwrap) what’s in disallowed elements (default: `false`);
		*   normally when say `strong` is not allowed, it and it’s children are dropped,
		*   with `unwrapDisallowed` the element itself is replaced by its children.
		* @property {UrlTransform | null | undefined} [urlTransform]
		*   Change URLs (default: `defaultUrlTransform`)
		*/
		/**
		* @typedef HooksOptionsOnly
		*   Configuration specifically for {@linkcode MarkdownHooks}.
		* @property {ReactNode | null | undefined} [fallback]
		*   Content to render while the processor processing the markdown (optional).
		*/
		/**
		* @typedef {Options & HooksOptionsOnly} HooksOptions
		*   Configuration for {@linkcode MarkdownHooks};
		*   extends the regular {@linkcode Options} with a `fallback` prop.
		*/
		/**
		* @callback UrlTransform
		*   Transform all URLs.
		* @param {string} url
		*   URL.
		* @param {string} key
		*   Property name (example: `'href'`).
		* @param {Readonly<Element>} node
		*   Node.
		* @returns {string | null | undefined}
		*   Transformed URL (optional).
		*/
		/** @type {PluggableList} */
		const emptyPlugins = [];
		/** @type {Readonly<RemarkRehypeOptions>} */
		const emptyRemarkRehypeOptions = { allowDangerousHtml: true };
		const safeProtocol = /^(https?|ircs?|mailto|xmpp)$/i;
		/** @type {ReadonlyArray<Readonly<Deprecation>>} */
		const deprecations = [
			{
				from: "astPlugins",
				id: "remove-buggy-html-in-markdown-parser"
			},
			{
				from: "allowDangerousHtml",
				id: "remove-buggy-html-in-markdown-parser"
			},
			{
				from: "allowNode",
				id: "replace-allownode-allowedtypes-and-disallowedtypes",
				to: "allowElement"
			},
			{
				from: "allowedTypes",
				id: "replace-allownode-allowedtypes-and-disallowedtypes",
				to: "allowedElements"
			},
			{
				from: "className",
				id: "remove-classname"
			},
			{
				from: "disallowedTypes",
				id: "replace-allownode-allowedtypes-and-disallowedtypes",
				to: "disallowedElements"
			},
			{
				from: "escapeHtml",
				id: "remove-buggy-html-in-markdown-parser"
			},
			{
				from: "includeElementIndex",
				id: "#remove-includeelementindex"
			},
			{
				from: "includeNodeIndex",
				id: "change-includenodeindex-to-includeelementindex"
			},
			{
				from: "linkTarget",
				id: "remove-linktarget"
			},
			{
				from: "plugins",
				id: "change-plugins-to-remarkplugins",
				to: "remarkPlugins"
			},
			{
				from: "rawSourcePos",
				id: "#remove-rawsourcepos"
			},
			{
				from: "renderers",
				id: "change-renderers-to-components",
				to: "components"
			},
			{
				from: "source",
				id: "change-source-to-children",
				to: "children"
			},
			{
				from: "sourcePos",
				id: "#remove-sourcepos"
			},
			{
				from: "transformImageUri",
				id: "#add-urltransform",
				to: "urlTransform"
			},
			{
				from: "transformLinkUri",
				id: "#add-urltransform",
				to: "urlTransform"
			}
		];
		/**
		* Component to render markdown.
		*
		* This is a synchronous component.
		* When using async plugins,
		* see {@linkcode MarkdownAsync} or {@linkcode MarkdownHooks}.
		*
		* @param {Readonly<Options>} options
		*   Props.
		* @returns {ReactElement}
		*   React element.
		*/
		function Markdown(options) {
			const processor = createProcessor(options);
			const file = createFile(options);
			return post(processor.runSync(processor.parse(file), file), options);
		}
		/**
		* Set up the `unified` processor.
		*
		* @param {Readonly<Options>} options
		*   Props.
		* @returns {Processor<MdastRoot, MdastRoot, Root, undefined, undefined>}
		*   Result.
		*/
		function createProcessor(options) {
			const rehypePlugins = options.rehypePlugins || emptyPlugins;
			const remarkPlugins = options.remarkPlugins || emptyPlugins;
			const remarkRehypeOptions = options.remarkRehypeOptions ? {
				...options.remarkRehypeOptions,
				...emptyRemarkRehypeOptions
			} : emptyRemarkRehypeOptions;
			return unified().use(remarkParse).use(remarkPlugins).use(remarkRehype, remarkRehypeOptions).use(rehypePlugins);
		}
		/**
		* Set up the virtual file.
		*
		* @param {Readonly<Options>} options
		*   Props.
		* @returns {VFile}
		*   Result.
		*/
		function createFile(options) {
			const children = options.children || "";
			const file = new VFile();
			if (typeof children === "string") file.value = children;
			else "" + children;
			return file;
		}
		/**
		* Process the result from unified some more.
		*
		* @param {Nodes} tree
		*   Tree.
		* @param {Readonly<Options>} options
		*   Props.
		* @returns {ReactElement}
		*   React element.
		*/
		function post(tree, options) {
			const allowedElements = options.allowedElements;
			const allowElement = options.allowElement;
			const components = options.components;
			const disallowedElements = options.disallowedElements;
			const skipHtml = options.skipHtml;
			const unwrapDisallowed = options.unwrapDisallowed;
			const urlTransform = options.urlTransform || defaultUrlTransform;
			for (const deprecation of deprecations) if (Object.hasOwn(options, deprecation.from)) "" + deprecation.from + (deprecation.to ? "use `" + deprecation.to + "` instead" : "remove it") + deprecation.id;
			if (allowedElements && disallowedElements);
			visit(tree, transform);
			return toJsxRuntime(tree, {
				Fragment: react_jsx_runtime.Fragment,
				components,
				ignoreInvalidStyle: true,
				jsx: react_jsx_runtime.jsx,
				jsxs: react_jsx_runtime.jsxs,
				passKeys: true,
				passNode: true
			});
			/** @type {BuildVisitor<Root>} */
			function transform(node, index, parent) {
				if (node.type === "raw" && parent && typeof index === "number") {
					if (skipHtml) parent.children.splice(index, 1);
					else parent.children[index] = {
						type: "text",
						value: node.value
					};
					return index;
				}
				if (node.type === "element") {
					/** @type {string} */
					let key;
					for (key in urlAttributes) if (Object.hasOwn(urlAttributes, key) && Object.hasOwn(node.properties, key)) {
						const value = node.properties[key];
						const test = urlAttributes[key];
						if (test === null || test.includes(node.tagName)) node.properties[key] = urlTransform(String(value || ""), key, node);
					}
				}
				if (node.type === "element") {
					let remove = allowedElements ? !allowedElements.includes(node.tagName) : disallowedElements ? disallowedElements.includes(node.tagName) : false;
					if (!remove && allowElement && typeof index === "number") remove = !allowElement(node, index, parent);
					if (remove && parent && typeof index === "number") {
						if (unwrapDisallowed && node.children) parent.children.splice(index, 1, ...node.children);
						else parent.children.splice(index, 1);
						return index;
					}
				}
			}
		}
		/**
		* Make a URL safe.
		*
		* @satisfies {UrlTransform}
		* @param {string} value
		*   URL.
		* @returns {string}
		*   Safe URL.
		*/
		function defaultUrlTransform(value) {
			const colon = value.indexOf(":");
			const questionMark = value.indexOf("?");
			const numberSign = value.indexOf("#");
			const slash = value.indexOf("/");
			if (colon === -1 || slash !== -1 && colon > slash || questionMark !== -1 && colon > questionMark || numberSign !== -1 && colon > numberSign || safeProtocol.test(value.slice(0, colon))) return value;
			return "";
		}
		//#endregion
		//#region node_modules/ccount/index.js
		/**
		* Count how often a character (or substring) is used in a string.
		*
		* @param {string} value
		*   Value to search in.
		* @param {string} character
		*   Character (or substring) to look for.
		* @return {number}
		*   Number of times `character` occurred in `value`.
		*/
		function ccount(value, character) {
			const source = String(value);
			if (typeof character !== "string") throw new TypeError("Expected character");
			let count = 0;
			let index = source.indexOf(character);
			while (index !== -1) {
				count++;
				index = source.indexOf(character, index + character.length);
			}
			return count;
		}
		//#endregion
		//#region node_modules/escape-string-regexp/index.js
		function escapeStringRegexp(string) {
			if (typeof string !== "string") throw new TypeError("Expected a string");
			return string.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&").replace(/-/g, "\\x2d");
		}
		//#endregion
		//#region node_modules/mdast-util-find-and-replace/lib/index.js
		/**
		* @import {Nodes, Parents, PhrasingContent, Root, Text} from 'mdast'
		* @import {BuildVisitor, Test, VisitorResult} from 'unist-util-visit-parents'
		*/
		/**
		* @typedef RegExpMatchObject
		*   Info on the match.
		* @property {number} index
		*   The index of the search at which the result was found.
		* @property {string} input
		*   A copy of the search string in the text node.
		* @property {[...Array<Parents>, Text]} stack
		*   All ancestors of the text node, where the last node is the text itself.
		*
		* @typedef {RegExp | string} Find
		*   Pattern to find.
		*
		*   Strings are escaped and then turned into global expressions.
		*
		* @typedef {Array<FindAndReplaceTuple>} FindAndReplaceList
		*   Several find and replaces, in array form.
		*
		* @typedef {[Find, Replace?]} FindAndReplaceTuple
		*   Find and replace in tuple form.
		*
		* @typedef {ReplaceFunction | string | null | undefined} Replace
		*   Thing to replace with.
		*
		* @callback ReplaceFunction
		*   Callback called when a search matches.
		* @param {...any} parameters
		*   The parameters are the result of corresponding search expression:
		*
		*   * `value` (`string`) — whole match
		*   * `...capture` (`Array<string>`) — matches from regex capture groups
		*   * `match` (`RegExpMatchObject`) — info on the match
		* @returns {Array<PhrasingContent> | PhrasingContent | string | false | null | undefined}
		*   Thing to replace with.
		*
		*   * when `null`, `undefined`, `''`, remove the match
		*   * …or when `false`, do not replace at all
		*   * …or when `string`, replace with a text node of that value
		*   * …or when `Node` or `Array<Node>`, replace with those nodes
		*
		* @typedef {[RegExp, ReplaceFunction]} Pair
		*   Normalized find and replace.
		*
		* @typedef {Array<Pair>} Pairs
		*   All find and replaced.
		*
		* @typedef Options
		*   Configuration.
		* @property {Test | null | undefined} [ignore]
		*   Test for which nodes to ignore (optional).
		*/
		/**
		* Find patterns in a tree and replace them.
		*
		* The algorithm searches the tree in *preorder* for complete values in `Text`
		* nodes.
		* Partial matches are not supported.
		*
		* @param {Nodes} tree
		*   Tree to change.
		* @param {FindAndReplaceList | FindAndReplaceTuple} list
		*   Patterns to find.
		* @param {Options | null | undefined} [options]
		*   Configuration (when `find` is not `Find`).
		* @returns {undefined}
		*   Nothing.
		*/
		function findAndReplace(tree, list, options) {
			const ignored = convert((options || {}).ignore || []);
			const pairs = toPairs(list);
			let pairIndex = -1;
			while (++pairIndex < pairs.length) visitParents(tree, "text", visitor);
			/** @type {BuildVisitor<Root, 'text'>} */
			function visitor(node, parents) {
				let index = -1;
				/** @type {Parents | undefined} */
				let grandparent;
				while (++index < parents.length) {
					const parent = parents[index];
					/** @type {Array<Nodes> | undefined} */
					const siblings = grandparent ? grandparent.children : void 0;
					if (ignored(parent, siblings ? siblings.indexOf(parent) : void 0, grandparent)) return;
					grandparent = parent;
				}
				if (grandparent) return handler(node, parents);
			}
			/**
			* Handle a text node which is not in an ignored parent.
			*
			* @param {Text} node
			*   Text node.
			* @param {Array<Parents>} parents
			*   Parents.
			* @returns {VisitorResult}
			*   Result.
			*/
			function handler(node, parents) {
				const parent = parents[parents.length - 1];
				const find = pairs[pairIndex][0];
				const replace = pairs[pairIndex][1];
				let start = 0;
				const index = parent.children.indexOf(node);
				let change = false;
				/** @type {Array<PhrasingContent>} */
				let nodes = [];
				find.lastIndex = 0;
				let match = find.exec(node.value);
				while (match) {
					const position = match.index;
					/** @type {RegExpMatchObject} */
					const matchObject = {
						index: match.index,
						input: match.input,
						stack: [...parents, node]
					};
					let value = replace(...match, matchObject);
					if (typeof value === "string") value = value.length > 0 ? {
						type: "text",
						value
					} : void 0;
					if (value === false) find.lastIndex = position + 1;
					else {
						if (start !== position) nodes.push({
							type: "text",
							value: node.value.slice(start, position)
						});
						if (Array.isArray(value)) nodes.push(...value);
						else if (value) nodes.push(value);
						start = position + match[0].length;
						change = true;
					}
					if (!find.global) break;
					match = find.exec(node.value);
				}
				if (change) {
					if (start < node.value.length) nodes.push({
						type: "text",
						value: node.value.slice(start)
					});
					parent.children.splice(index, 1, ...nodes);
				} else nodes = [node];
				return index + nodes.length;
			}
		}
		/**
		* Turn a tuple or a list of tuples into pairs.
		*
		* @param {FindAndReplaceList | FindAndReplaceTuple} tupleOrList
		*   Schema.
		* @returns {Pairs}
		*   Clean pairs.
		*/
		function toPairs(tupleOrList) {
			/** @type {Pairs} */
			const result = [];
			if (!Array.isArray(tupleOrList)) throw new TypeError("Expected find and replace tuple or list of tuples");
			/** @type {FindAndReplaceList} */
			const list = !tupleOrList[0] || Array.isArray(tupleOrList[0]) ? tupleOrList : [tupleOrList];
			let index = -1;
			while (++index < list.length) {
				const tuple = list[index];
				result.push([toExpression(tuple[0]), toFunction(tuple[1])]);
			}
			return result;
		}
		/**
		* Turn a find into an expression.
		*
		* @param {Find} find
		*   Find.
		* @returns {RegExp}
		*   Expression.
		*/
		function toExpression(find) {
			return typeof find === "string" ? new RegExp(escapeStringRegexp(find), "g") : find;
		}
		/**
		* Turn a replace into a function.
		*
		* @param {Replace} replace
		*   Replace.
		* @returns {ReplaceFunction}
		*   Function.
		*/
		function toFunction(replace) {
			return typeof replace === "function" ? replace : function() {
				return replace;
			};
		}
		//#endregion
		//#region node_modules/mdast-util-gfm-autolink-literal/lib/index.js
		/**
		* @import {RegExpMatchObject, ReplaceFunction} from 'mdast-util-find-and-replace'
		* @import {CompileContext, Extension as FromMarkdownExtension, Handle as FromMarkdownHandle, Transform as FromMarkdownTransform} from 'mdast-util-from-markdown'
		* @import {ConstructName, Options as ToMarkdownExtension} from 'mdast-util-to-markdown'
		* @import {Link, PhrasingContent} from 'mdast'
		*/
		/** @type {ConstructName} */
		const inConstruct = "phrasing";
		/** @type {Array<ConstructName>} */
		const notInConstruct = [
			"autolink",
			"link",
			"image",
			"label"
		];
		/**
		* Create an extension for `mdast-util-from-markdown` to enable GFM autolink
		* literals in markdown.
		*
		* @returns {FromMarkdownExtension}
		*   Extension for `mdast-util-to-markdown` to enable GFM autolink literals.
		*/
		function gfmAutolinkLiteralFromMarkdown() {
			return {
				transforms: [transformGfmAutolinkLiterals],
				enter: {
					literalAutolink: enterLiteralAutolink,
					literalAutolinkEmail: enterLiteralAutolinkValue,
					literalAutolinkHttp: enterLiteralAutolinkValue,
					literalAutolinkWww: enterLiteralAutolinkValue
				},
				exit: {
					literalAutolink: exitLiteralAutolink,
					literalAutolinkEmail: exitLiteralAutolinkEmail,
					literalAutolinkHttp: exitLiteralAutolinkHttp,
					literalAutolinkWww: exitLiteralAutolinkWww
				}
			};
		}
		/**
		* Create an extension for `mdast-util-to-markdown` to enable GFM autolink
		* literals in markdown.
		*
		* @returns {ToMarkdownExtension}
		*   Extension for `mdast-util-to-markdown` to enable GFM autolink literals.
		*/
		function gfmAutolinkLiteralToMarkdown() {
			return { unsafe: [
				{
					character: "@",
					before: "[+\\-.\\w]",
					after: "[\\-.\\w]",
					inConstruct,
					notInConstruct
				},
				{
					character: ".",
					before: "[Ww]",
					after: "[\\-.\\w]",
					inConstruct,
					notInConstruct
				},
				{
					character: ":",
					before: "[ps]",
					after: "\\/",
					inConstruct,
					notInConstruct
				}
			] };
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterLiteralAutolink(token) {
			this.enter({
				type: "link",
				title: null,
				url: "",
				children: []
			}, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterLiteralAutolinkValue(token) {
			this.config.enter.autolinkProtocol.call(this, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitLiteralAutolinkHttp(token) {
			this.config.exit.autolinkProtocol.call(this, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitLiteralAutolinkWww(token) {
			this.config.exit.data.call(this, token);
			const node = this.stack[this.stack.length - 1];
			node.type;
			node.url = "http://" + this.sliceSerialize(token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitLiteralAutolinkEmail(token) {
			this.config.exit.autolinkEmail.call(this, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitLiteralAutolink(token) {
			this.exit(token);
		}
		/** @type {FromMarkdownTransform} */
		function transformGfmAutolinkLiterals(tree) {
			findAndReplace(tree, [[/(https?:\/\/|www(?=\.))([-.\w]+)([^ \t\r\n]*)/gi, findUrl], [/(?<=^|\s|\p{P}|\p{S})([-.\w+]+)@([-\w]+(?:\.[-\w]+)+)/gu, findEmail]], { ignore: ["link", "linkReference"] });
		}
		/**
		* @type {ReplaceFunction}
		* @param {string} _
		* @param {string} protocol
		* @param {string} domain
		* @param {string} path
		* @param {RegExpMatchObject} match
		* @returns {Array<PhrasingContent> | Link | false}
		*/
		function findUrl(_, protocol, domain, path, match) {
			let prefix = "";
			if (!previous(match)) return false;
			if (/^w/i.test(protocol)) {
				domain = protocol + domain;
				protocol = "";
				prefix = "http://";
			}
			if (!isCorrectDomain(domain)) return false;
			const parts = splitUrl(domain + path);
			if (!parts[0]) return false;
			/** @type {Link} */
			const result = {
				type: "link",
				title: null,
				url: prefix + protocol + parts[0],
				children: [{
					type: "text",
					value: protocol + parts[0]
				}]
			};
			if (parts[1]) return [result, {
				type: "text",
				value: parts[1]
			}];
			return result;
		}
		/**
		* @type {ReplaceFunction}
		* @param {string} _
		* @param {string} atext
		* @param {string} label
		* @param {RegExpMatchObject} match
		* @returns {Link | false}
		*/
		function findEmail(_, atext, label, match) {
			if (!previous(match, true) || /[-\d_]$/.test(label)) return false;
			return {
				type: "link",
				title: null,
				url: "mailto:" + atext + "@" + label,
				children: [{
					type: "text",
					value: atext + "@" + label
				}]
			};
		}
		/**
		* @param {string} domain
		* @returns {boolean}
		*/
		function isCorrectDomain(domain) {
			const parts = domain.split(".");
			if (parts.length < 2 || parts[parts.length - 1] && (/_/.test(parts[parts.length - 1]) || !/[a-zA-Z\d]/.test(parts[parts.length - 1])) || parts[parts.length - 2] && (/_/.test(parts[parts.length - 2]) || !/[a-zA-Z\d]/.test(parts[parts.length - 2]))) return false;
			return true;
		}
		/**
		* @param {string} url
		* @returns {[string, string | undefined]}
		*/
		function splitUrl(url) {
			const trailExec = /[!"&'),.:;<>?\]}]+$/.exec(url);
			if (!trailExec) return [url, void 0];
			url = url.slice(0, trailExec.index);
			let trail = trailExec[0];
			let closingParenIndex = trail.indexOf(")");
			const openingParens = ccount(url, "(");
			let closingParens = ccount(url, ")");
			while (closingParenIndex !== -1 && openingParens > closingParens) {
				url += trail.slice(0, closingParenIndex + 1);
				trail = trail.slice(closingParenIndex + 1);
				closingParenIndex = trail.indexOf(")");
				closingParens++;
			}
			return [url, trail];
		}
		/**
		* @param {RegExpMatchObject} match
		* @param {boolean | null | undefined} [email=false]
		* @returns {boolean}
		*/
		function previous(match, email) {
			const code = match.input.charCodeAt(match.index - 1);
			return (match.index === 0 || unicodeWhitespace(code) || unicodePunctuation(code)) && (!email || code !== 47);
		}
		//#endregion
		//#region node_modules/mdast-util-gfm-footnote/lib/index.js
		/**
		* @import {
		*   CompileContext,
		*   Extension as FromMarkdownExtension,
		*   Handle as FromMarkdownHandle
		* } from 'mdast-util-from-markdown'
		* @import {ToMarkdownOptions} from 'mdast-util-gfm-footnote'
		* @import {
		*   Handle as ToMarkdownHandle,
		*   Map,
		*   Options as ToMarkdownExtension
		* } from 'mdast-util-to-markdown'
		* @import {FootnoteDefinition, FootnoteReference} from 'mdast'
		*/
		footnoteReference.peek = footnoteReferencePeek;
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterFootnoteCallString() {
			this.buffer();
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterFootnoteCall(token) {
			this.enter({
				type: "footnoteReference",
				identifier: "",
				label: ""
			}, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterFootnoteDefinitionLabelString() {
			this.buffer();
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterFootnoteDefinition(token) {
			this.enter({
				type: "footnoteDefinition",
				identifier: "",
				label: "",
				children: []
			}, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitFootnoteCallString(token) {
			const label = this.resume();
			const node = this.stack[this.stack.length - 1];
			node.type;
			node.identifier = normalizeIdentifier(this.sliceSerialize(token)).toLowerCase();
			node.label = label;
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitFootnoteCall(token) {
			this.exit(token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitFootnoteDefinitionLabelString(token) {
			const label = this.resume();
			const node = this.stack[this.stack.length - 1];
			node.type;
			node.identifier = normalizeIdentifier(this.sliceSerialize(token)).toLowerCase();
			node.label = label;
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitFootnoteDefinition(token) {
			this.exit(token);
		}
		/** @type {ToMarkdownHandle} */
		function footnoteReferencePeek() {
			return "[";
		}
		/**
		* @type {ToMarkdownHandle}
		* @param {FootnoteReference} node
		*/
		function footnoteReference(node, _, state, info) {
			const tracker = state.createTracker(info);
			let value = tracker.move("[^");
			const exit = state.enter("footnoteReference");
			const subexit = state.enter("reference");
			value += tracker.move(state.safe(state.associationId(node), {
				after: "]",
				before: value
			}));
			subexit();
			exit();
			value += tracker.move("]");
			return value;
		}
		/**
		* Create an extension for `mdast-util-from-markdown` to enable GFM footnotes
		* in markdown.
		*
		* @returns {FromMarkdownExtension}
		*   Extension for `mdast-util-from-markdown`.
		*/
		function gfmFootnoteFromMarkdown() {
			return {
				enter: {
					gfmFootnoteCallString: enterFootnoteCallString,
					gfmFootnoteCall: enterFootnoteCall,
					gfmFootnoteDefinitionLabelString: enterFootnoteDefinitionLabelString,
					gfmFootnoteDefinition: enterFootnoteDefinition
				},
				exit: {
					gfmFootnoteCallString: exitFootnoteCallString,
					gfmFootnoteCall: exitFootnoteCall,
					gfmFootnoteDefinitionLabelString: exitFootnoteDefinitionLabelString,
					gfmFootnoteDefinition: exitFootnoteDefinition
				}
			};
		}
		/**
		* Create an extension for `mdast-util-to-markdown` to enable GFM footnotes
		* in markdown.
		*
		* @param {ToMarkdownOptions | null | undefined} [options]
		*   Configuration (optional).
		* @returns {ToMarkdownExtension}
		*   Extension for `mdast-util-to-markdown`.
		*/
		function gfmFootnoteToMarkdown(options) {
			let firstLineBlank = false;
			if (options && options.firstLineBlank) firstLineBlank = true;
			return {
				handlers: {
					footnoteDefinition,
					footnoteReference
				},
				unsafe: [{
					character: "[",
					inConstruct: [
						"label",
						"phrasing",
						"reference"
					]
				}]
			};
			/**
			* @type {ToMarkdownHandle}
			* @param {FootnoteDefinition} node
			*/
			function footnoteDefinition(node, _, state, info) {
				const tracker = state.createTracker(info);
				let value = tracker.move("[^");
				const exit = state.enter("footnoteDefinition");
				const subexit = state.enter("label");
				value += tracker.move(state.safe(state.associationId(node), {
					before: value,
					after: "]"
				}));
				subexit();
				value += tracker.move("]:");
				if (node.children && node.children.length > 0) {
					tracker.shift(4);
					value += tracker.move((firstLineBlank ? "\n" : " ") + state.indentLines(state.containerFlow(node, tracker.current()), firstLineBlank ? mapAll : mapExceptFirst));
				}
				exit();
				return value;
			}
		}
		/** @type {Map} */
		function mapExceptFirst(line, index, blank) {
			return index === 0 ? line : mapAll(line, index, blank);
		}
		/** @type {Map} */
		function mapAll(line, index, blank) {
			return (blank ? "" : "    ") + line;
		}
		//#endregion
		//#region node_modules/mdast-util-gfm-strikethrough/lib/index.js
		/**
		* @import {Delete} from 'mdast'
		* @import {
		*   CompileContext,
		*   Extension as FromMarkdownExtension,
		*   Handle as FromMarkdownHandle
		* } from 'mdast-util-from-markdown'
		* @import {
		*   Attention,
		*   ConstructName,
		*   Handle as ToMarkdownHandle,
		*   Options as ToMarkdownExtension
		* } from 'mdast-util-to-markdown'
		*/
		/**
		* List of constructs that occur in phrasing (paragraphs, headings), but cannot
		* contain strikethrough.
		* So they sort of cancel each other out.
		* Note: could use a better name.
		*
		* Note: keep in sync with: <https://github.com/syntax-tree/mdast-util-to-markdown/blob/8ce8dbf/lib/unsafe.js#L14>
		*
		* @type {Array<ConstructName>}
		*/
		const constructsWithoutStrikethrough = [
			"autolink",
			"destinationLiteral",
			"destinationRaw",
			"reference",
			"titleQuote",
			"titleApostrophe"
		];
		handleDelete.attention = attentionDelete;
		handleDelete.peek = peekDelete;
		/**
		* Create an extension for `mdast-util-from-markdown` to enable GFM
		* strikethrough in markdown.
		*
		* @returns {FromMarkdownExtension}
		*   Extension for `mdast-util-from-markdown` to enable GFM strikethrough.
		*/
		function gfmStrikethroughFromMarkdown() {
			return {
				canContainEols: ["delete"],
				enter: { strikethrough: enterStrikethrough },
				exit: { strikethrough: exitStrikethrough }
			};
		}
		/**
		* Create an extension for `mdast-util-to-markdown` to enable GFM
		* strikethrough in markdown.
		*
		* @returns {ToMarkdownExtension}
		*   Extension for `mdast-util-to-markdown` to enable GFM strikethrough.
		*/
		function gfmStrikethroughToMarkdown() {
			return {
				handlers: { delete: handleDelete },
				unsafe: [{
					character: "~",
					inConstruct: "phrasing",
					notInConstruct: constructsWithoutStrikethrough
				}]
			};
		}
		/**
		* Enter strikethrough.
		*
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterStrikethrough(token) {
			this.enter({
				type: "delete",
				children: [],
				position: void 0
			}, token);
		}
		/**
		* Exit strikethrough.
		*
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitStrikethrough(token) {
			this.exit(token);
		}
		/**
		* Serialize a delete node.
		*
		* @type {ToMarkdownHandle}
		* @param {Delete} node
		*   Node to serialize.
		*/
		function handleDelete(node, _, state, info) {
			const tracker = state.createTracker(info);
			const sequence = state.stack.includes("strikethrough") ? "~" : "~~";
			const exit = state.enter("strikethrough");
			let value = tracker.move(sequence);
			value += state.containerPhrasing(node, {
				...tracker.current(),
				before: value,
				after: "~"
			});
			value += tracker.move(sequence);
			exit();
			return value;
		}
		/**
		* Serialize a delete node as attention.
		*
		* @type {Attention}
		*/
		function attentionDelete() {
			return {
				construct: "strikethrough",
				markers: ["~"],
				sizes: [2, 1]
			};
		}
		/**
		* Peek the first character of a delete node.
		*
		* @type {ToMarkdownHandle}
		*/
		function peekDelete() {
			return "~";
		}
		//#endregion
		//#region node_modules/markdown-table/index.js
		/**
		* @typedef {Options} MarkdownTableOptions
		*   Configuration.
		*/
		/**
		* @typedef Options
		*   Configuration.
		* @property {boolean | null | undefined} [alignDelimiters=true]
		*   Whether to align the delimiters (default: `true`);
		*   they are aligned by default:
		*
		*   ```markdown
		*   | Alpha | B     |
		*   | ----- | ----- |
		*   | C     | Delta |
		*   ```
		*
		*   Pass `false` to make them staggered:
		*
		*   ```markdown
		*   | Alpha | B |
		*   | - | - |
		*   | C | Delta |
		*   ```
		* @property {ReadonlyArray<string | null | undefined> | string | null | undefined} [align]
		*   How to align columns (default: `''`);
		*   one style for all columns or styles for their respective columns;
		*   each style is either `'l'` (left), `'r'` (right), or `'c'` (center);
		*   other values are treated as `''`, which doesn’t place the colon in the
		*   alignment row but does align left;
		*   *only the lowercased first character is used, so `Right` is fine.*
		* @property {boolean | null | undefined} [delimiterEnd=true]
		*   Whether to end each row with the delimiter (default: `true`).
		*
		*   > 👉 **Note**: please don’t use this: it could create fragile structures
		*   > that aren’t understandable to some markdown parsers.
		*
		*   When `true`, there are ending delimiters:
		*
		*   ```markdown
		*   | Alpha | B     |
		*   | ----- | ----- |
		*   | C     | Delta |
		*   ```
		*
		*   When `false`, there are no ending delimiters:
		*
		*   ```markdown
		*   | Alpha | B
		*   | ----- | -----
		*   | C     | Delta
		*   ```
		* @property {boolean | null | undefined} [delimiterStart=true]
		*   Whether to begin each row with the delimiter (default: `true`).
		*
		*   > 👉 **Note**: please don’t use this: it could create fragile structures
		*   > that aren’t understandable to some markdown parsers.
		*
		*   When `true`, there are starting delimiters:
		*
		*   ```markdown
		*   | Alpha | B     |
		*   | ----- | ----- |
		*   | C     | Delta |
		*   ```
		*
		*   When `false`, there are no starting delimiters:
		*
		*   ```markdown
		*   Alpha | B     |
		*   ----- | ----- |
		*   C     | Delta |
		*   ```
		* @property {boolean | null | undefined} [padding=true]
		*   Whether to add a space of padding between delimiters and cells
		*   (default: `true`).
		*
		*   When `true`, there is padding:
		*
		*   ```markdown
		*   | Alpha | B     |
		*   | ----- | ----- |
		*   | C     | Delta |
		*   ```
		*
		*   When `false`, there is no padding:
		*
		*   ```markdown
		*   |Alpha|B    |
		*   |-----|-----|
		*   |C    |Delta|
		*   ```
		* @property {((value: string) => number) | null | undefined} [stringLength]
		*   Function to detect the length of table cell content (optional);
		*   this is used when aligning the delimiters (`|`) between table cells;
		*   full-width characters and emoji mess up delimiter alignment when viewing
		*   the markdown source;
		*   to fix this, you can pass this function,
		*   which receives the cell content and returns its “visible” size;
		*   note that what is and isn’t visible depends on where the text is displayed.
		*
		*   Without such a function, the following:
		*
		*   ```js
		*   markdownTable([
		*     ['Alpha', 'Bravo'],
		*     ['中文', 'Charlie'],
		*     ['👩‍❤️‍👩', 'Delta']
		*   ])
		*   ```
		*
		*   Yields:
		*
		*   ```markdown
		*   | Alpha | Bravo |
		*   | - | - |
		*   | 中文 | Charlie |
		*   | 👩‍❤️‍👩 | Delta |
		*   ```
		*
		*   With [`string-width`](https://github.com/sindresorhus/string-width):
		*
		*   ```js
		*   import stringWidth from 'string-width'
		*
		*   markdownTable(
		*     [
		*       ['Alpha', 'Bravo'],
		*       ['中文', 'Charlie'],
		*       ['👩‍❤️‍👩', 'Delta']
		*     ],
		*     {stringLength: stringWidth}
		*   )
		*   ```
		*
		*   Yields:
		*
		*   ```markdown
		*   | Alpha | Bravo   |
		*   | ----- | ------- |
		*   | 中文  | Charlie |
		*   | 👩‍❤️‍👩    | Delta   |
		*   ```
		*/
		/**
		* @param {string} value
		*   Cell value.
		* @returns {number}
		*   Cell size.
		*/
		function defaultStringLength(value) {
			return value.length;
		}
		/**
		* Generate a markdown
		* ([GFM](https://docs.github.com/en/github/writing-on-github/working-with-advanced-formatting/organizing-information-with-tables))
		* table.
		*
		* @param {ReadonlyArray<ReadonlyArray<string | null | undefined>>} table
		*   Table data (matrix of strings).
		* @param {Readonly<Options> | null | undefined} [options]
		*   Configuration (optional).
		* @returns {string}
		*   Result.
		*/
		function markdownTable(table, options) {
			const settings = options || {};
			const align = (settings.align || []).concat();
			const stringLength = settings.stringLength || defaultStringLength;
			/** @type {Array<number>} Character codes as symbols for alignment per column. */
			const alignments = [];
			/** @type {Array<Array<string>>} Cells per row. */
			const cellMatrix = [];
			/** @type {Array<Array<number>>} Sizes of each cell per row. */
			const sizeMatrix = [];
			/** @type {Array<number>} */
			const longestCellByColumn = [];
			let mostCellsPerRow = 0;
			let rowIndex = -1;
			while (++rowIndex < table.length) {
				/** @type {Array<string>} */
				const row = [];
				/** @type {Array<number>} */
				const sizes = [];
				let columnIndex = -1;
				if (table[rowIndex].length > mostCellsPerRow) mostCellsPerRow = table[rowIndex].length;
				while (++columnIndex < table[rowIndex].length) {
					const cell = serialize(table[rowIndex][columnIndex]);
					if (settings.alignDelimiters !== false) {
						const size = stringLength(cell);
						sizes[columnIndex] = size;
						if (longestCellByColumn[columnIndex] === void 0 || size > longestCellByColumn[columnIndex]) longestCellByColumn[columnIndex] = size;
					}
					row.push(cell);
				}
				cellMatrix[rowIndex] = row;
				sizeMatrix[rowIndex] = sizes;
			}
			let columnIndex = -1;
			if (typeof align === "object" && "length" in align) while (++columnIndex < mostCellsPerRow) alignments[columnIndex] = toAlignment(align[columnIndex]);
			else {
				const code = toAlignment(align);
				while (++columnIndex < mostCellsPerRow) alignments[columnIndex] = code;
			}
			columnIndex = -1;
			/** @type {Array<string>} */
			const row = [];
			/** @type {Array<number>} */
			const sizes = [];
			while (++columnIndex < mostCellsPerRow) {
				const code = alignments[columnIndex];
				let before = "";
				let after = "";
				if (code === 99) {
					before = ":";
					after = ":";
				} else if (code === 108) before = ":";
				else if (code === 114) after = ":";
				let size = settings.alignDelimiters === false ? 1 : Math.max(1, longestCellByColumn[columnIndex] - before.length - after.length);
				const cell = before + "-".repeat(size) + after;
				if (settings.alignDelimiters !== false) {
					size = before.length + size + after.length;
					if (size > longestCellByColumn[columnIndex]) longestCellByColumn[columnIndex] = size;
					sizes[columnIndex] = size;
				}
				row[columnIndex] = cell;
			}
			cellMatrix.splice(1, 0, row);
			sizeMatrix.splice(1, 0, sizes);
			rowIndex = -1;
			/** @type {Array<string>} */
			const lines = [];
			while (++rowIndex < cellMatrix.length) {
				const row = cellMatrix[rowIndex];
				const sizes = sizeMatrix[rowIndex];
				columnIndex = -1;
				/** @type {Array<string>} */
				const line = [];
				while (++columnIndex < mostCellsPerRow) {
					const cell = row[columnIndex] || "";
					let before = "";
					let after = "";
					if (settings.alignDelimiters !== false) {
						const size = longestCellByColumn[columnIndex] - (sizes[columnIndex] || 0);
						const code = alignments[columnIndex];
						if (code === 114) before = " ".repeat(size);
						else if (code === 99) if (size % 2) {
							before = " ".repeat(size / 2 + .5);
							after = " ".repeat(size / 2 - .5);
						} else {
							before = " ".repeat(size / 2);
							after = before;
						}
						else after = " ".repeat(size);
					}
					if (settings.delimiterStart !== false && !columnIndex) line.push("|");
					if (settings.padding !== false && !(settings.alignDelimiters === false && cell === "") && (settings.delimiterStart !== false || columnIndex)) line.push(" ");
					if (settings.alignDelimiters !== false) line.push(before);
					line.push(cell);
					if (settings.alignDelimiters !== false) line.push(after);
					if (settings.padding !== false) line.push(" ");
					if (settings.delimiterEnd !== false || columnIndex !== mostCellsPerRow - 1) line.push("|");
				}
				lines.push(settings.delimiterEnd === false ? line.join("").replace(/ +$/, "") : line.join(""));
			}
			return lines.join("\n");
		}
		/**
		* @param {string | null | undefined} [value]
		*   Value to serialize.
		* @returns {string}
		*   Result.
		*/
		function serialize(value) {
			return value === null || value === void 0 ? "" : String(value);
		}
		/**
		* @param {string | null | undefined} value
		*   Value.
		* @returns {number}
		*   Alignment.
		*/
		function toAlignment(value) {
			const code = typeof value === "string" ? value.codePointAt(0) : 0;
			return code === 67 || code === 99 ? 99 : code === 76 || code === 108 ? 108 : code === 82 || code === 114 ? 114 : 0;
		}
		//#endregion
		//#region node_modules/mdast-util-phrasing/lib/index.js
		/**
		* @typedef {import('mdast').Html} Html
		* @typedef {import('mdast').PhrasingContent} PhrasingContent
		*/
		/**
		* Check if the given value is *phrasing content*.
		*
		* > 👉 **Note**: Excludes `html`, which can be both phrasing or flow.
		*
		* @param node
		*   Thing to check, typically `Node`.
		* @returns
		*   Whether `value` is phrasing content.
		*/
		const phrasing = convert([
			"break",
			"delete",
			"emphasis",
			"footnote",
			"footnoteReference",
			"image",
			"imageReference",
			"inlineCode",
			"inlineMath",
			"link",
			"linkReference",
			"mdxJsxTextElement",
			"mdxTextExpression",
			"strong",
			"text",
			"textDirective"
		]);
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/blockquote.js
		/**
		* @import {Blockquote, Parents} from 'mdast'
		* @import {Info, Map, State} from 'mdast-util-to-markdown'
		*/
		/**
		* Serialize a blockquote node.
		*
		* @param {Blockquote} node
		*   Node to serialize.
		* @param {Parents | undefined} _
		*   Parent node.
		* @param {State} state
		*   Info passed around.
		* @param {Info} info
		*   Info on surrounding context.
		* @returns {string}
		*   Serialized markdown.
		*/
		function blockquote(node, _, state, info) {
			const exit = state.enter("blockquote");
			const tracker = state.createTracker(info);
			tracker.move("> ");
			tracker.shift(2);
			const value = state.indentLines(state.containerFlow(node, tracker.current()), map$1);
			exit();
			return value;
		}
		/**
		* Indent lines w/ blockquote markers.
		*
		* @type {Map}
		*/
		function map$1(line, _, blank) {
			return ">" + (blank ? "" : " ") + line;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/util/pattern-in-scope.js
		/**
		* @import {ConstructName, Unsafe} from 'mdast-util-to-markdown'
		*/
		/**
		* Check if a pattern is in scope based on the current stack of constructs.
		*
		* @param {Array<ConstructName>} stack
		*   Current stack of constructs.
		* @param {Unsafe} pattern
		*   Pattern to check.
		* @returns {boolean}
		*   Whether the pattern is in scope.
		*/
		function patternInScope(stack, pattern) {
			return listInScope(stack, pattern.inConstruct, true) && !listInScope(stack, pattern.notInConstruct, false);
		}
		/**
		* Check if any of the constructs in the list are present in the stack.
		*
		* @param {Array<ConstructName>} stack
		*   Current stack of constructs.
		* @param {Unsafe['inConstruct']} list
		*   List of constructs to check for in the stack.
		* @param {boolean} none
		*   Value to return if the list is empty or not provided.
		* @returns {boolean}
		*   Whether any of the constructs in the list are present in the stack.
		*/
		function listInScope(stack, list, none) {
			if (typeof list === "string") list = [list];
			if (!list || list.length === 0) return none;
			let index = -1;
			while (++index < list.length) if (stack.includes(list[index])) return true;
			return false;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/break.js
		/**
		* @import {Break, Parents} from 'mdast'
		* @import {Info, State} from 'mdast-util-to-markdown'
		*/
		/**
		* Serialize a break node.
		*
		* @param {Break} _
		*   Node to serialize.
		* @param {Parents | undefined} _1
		*   Parent node.
		* @param {State} state
		*   Info passed around.
		* @param {Info} info
		*   Info on surrounding context.
		* @returns {string}
		*   Serialized markdown.
		*/
		function hardBreak(_, _1, state, info) {
			let index = -1;
			while (++index < state.unsafe.length) {
				const pattern = state.unsafe[index];
				if (pattern.character === "\n" && !pattern.before && !pattern.after && patternInScope(state.stack, pattern)) return /[\t ]/.test(info.before) ? "" : " ";
			}
			return "\\\n";
		}
		//#endregion
		//#region node_modules/longest-streak/index.js
		/**
		* Get the count of the longest repeating streak of `substring` in `value`.
		*
		* @param {string} value
		*   Content to search in.
		* @param {string} substring
		*   Substring to look for, typically one character.
		* @returns {number}
		*   Count of most frequent adjacent `substring`s in `value`.
		*/
		function longestStreak(value, substring) {
			const source = String(value);
			let index = source.indexOf(substring);
			let expected = index;
			let count = 0;
			let max = 0;
			if (typeof substring !== "string") throw new TypeError("Expected substring");
			while (index !== -1) {
				if (index === expected) {
					if (++count > max) max = count;
				} else count = 1;
				expected = index + substring.length;
				index = source.indexOf(substring, expected);
			}
			return max;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/util/format-code-as-indented.js
		/**
		* @import {State} from 'mdast-util-to-markdown'
		* @import {Code} from 'mdast'
		*/
		/**
		* Checks if a code block can be formatted as an indented code block.
		*
		* @param {Code} node
		*   Node to check.
		* @param {State} state
		*   Info passed around.
		* @returns {boolean}
		*   Whether the code can be formatted as an indented code block.
		*/
		function formatCodeAsIndented(node, state) {
			return Boolean(state.options.fences === false && node.value && !node.lang && /[^\n\r ]/.test(node.value) && !/^[\t ]*(?:[\n\r]|$)|(?:^|[\n\r])[\t ]*$/.test(node.value));
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/util/check-fence.js
		/**
		* @import {Options, State} from 'mdast-util-to-markdown'
		*/
		/**
		* Checks the preferred fence option.
		*
		* @param {State} state
		*   Info passed around.
		* @returns {Exclude<Options['fence'], null | undefined>}
		*   Preferred fence marker.
		*/
		function checkFence(state) {
			const marker = state.options.fence || "`";
			if (marker !== "`" && marker !== "~") throw new Error("Cannot serialize code with `" + marker + "` for `options.fence`, expected `` ` `` or `~`");
			return marker;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/code.js
		/**
		* @import {Info, Map, State} from 'mdast-util-to-markdown'
		* @import {Code, Parents} from 'mdast'
		*/
		/**
		* Serialize a code node.
		*
		* @param {Code} node
		*   Node to serialize.
		* @param {Parents | undefined} _
		*   Parent node.
		* @param {State} state
		*   Info passed around.
		* @param {Info} info
		*   Info on surrounding context.
		* @returns {string}
		*   Serialized markdown.
		*/
		function code$1(node, _, state, info) {
			const marker = checkFence(state);
			const raw = node.value || "";
			if (formatCodeAsIndented(node, state)) {
				const exit = state.enter("codeIndented");
				const value = state.indentLines(raw, map);
				exit();
				return value;
			}
			const tracker = state.createTracker(info);
			const sequence = marker.repeat(Math.max(longestStreak(raw, marker) + 1, 3));
			const exit = state.enter("codeFenced");
			const suffix = marker === "`" ? "GraveAccent" : "Tilde";
			let value = tracker.move(sequence);
			if (node.lang) {
				const subexit = state.enter(`codeFencedLang${suffix}`);
				value += tracker.move(state.safe(node.lang, {
					before: value,
					after: " ",
					encode: ["`"],
					...tracker.current()
				}));
				subexit();
			}
			if (node.lang && node.meta) {
				const subexit = state.enter(`codeFencedMeta${suffix}`);
				value += tracker.move(" ");
				value += tracker.move(state.safe(node.meta, {
					before: value,
					after: "\n",
					encode: ["`"],
					...tracker.current()
				}));
				subexit();
			}
			value += tracker.move("\n");
			if (raw) value += tracker.move(raw + "\n");
			value += tracker.move(sequence);
			exit();
			return value;
		}
		/**
		* Indent lines w/ code indent.
		*
		* @type {Map}
		*/
		function map(line, _, blank) {
			return (blank ? "" : "    ") + line;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/util/check-quote.js
		/**
		* @import {Options, State} from 'mdast-util-to-markdown'
		*/
		/**
		* Checks the preferred quote option.
		*
		* @param {State} state
		*   Info passed around.
		* @returns {Exclude<Options['quote'], null | undefined>}
		*   Preferred quote.
		*/
		function checkQuote(state) {
			const marker = state.options.quote || "\"";
			if (marker !== "\"" && marker !== "'") throw new Error("Cannot serialize title with `" + marker + "` for `options.quote`, expected `\"`, or `'`");
			return marker;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/definition.js
		/**
		* @import {Info, State} from 'mdast-util-to-markdown'
		* @import {Definition, Parents} from 'mdast'
		*/
		/**
		* Serialize a definition node.
		*
		* @param {Definition} node
		*   Node to serialize.
		* @param {Parents | undefined} _
		*   Parent node.
		* @param {State} state
		*   Info passed around.
		* @param {Info} info
		*   Info on surrounding context.
		* @returns {string}
		*   Serialized markdown.
		*/
		function definition(node, _, state, info) {
			const quote = checkQuote(state);
			const suffix = quote === "\"" ? "Quote" : "Apostrophe";
			const exit = state.enter("definition");
			let subexit = state.enter("label");
			const tracker = state.createTracker(info);
			let value = tracker.move("[");
			value += tracker.move(state.safe(state.associationId(node), {
				before: value,
				after: "]",
				...tracker.current()
			}));
			value += tracker.move("]: ");
			subexit();
			if (!node.url || /[\0- \u007F]/.test(node.url)) {
				subexit = state.enter("destinationLiteral");
				value += tracker.move("<");
				value += tracker.move(state.safe(node.url, {
					before: value,
					after: ">",
					...tracker.current()
				}));
				value += tracker.move(">");
			} else {
				subexit = state.enter("destinationRaw");
				value += tracker.move(state.safe(node.url, {
					before: value,
					after: node.title ? " " : "\n",
					...tracker.current()
				}));
			}
			subexit();
			if (node.title) {
				subexit = state.enter(`title${suffix}`);
				value += tracker.move(" " + quote);
				value += tracker.move(state.safe(node.title, {
					before: value,
					after: quote,
					...tracker.current()
				}));
				value += tracker.move(quote);
				subexit();
			}
			exit();
			return value;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/util/check-emphasis.js
		/**
		* @import {Options, State} from 'mdast-util-to-markdown'
		*/
		/**
		* Checks the preferred emphasis option.
		*
		* @param {State} state
		*   Info passed around.
		* @returns {Exclude<Options['emphasis'], null | undefined>}
		*   Preferred emphasis marker.
		*/
		function checkEmphasis(state) {
			const marker = state.options.emphasis || "*";
			if (marker !== "*" && marker !== "_") throw new Error("Cannot serialize emphasis with `" + marker + "` for `options.emphasis`, expected `*`, or `_`");
			return marker;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/emphasis.js
		/**
		* @import {AttentionInfo, Info, State} from 'mdast-util-to-markdown'
		* @import {Emphasis, Parents} from 'mdast'
		*/
		emphasis.attention = attention$1;
		emphasis.peek = peek$1;
		/**
		* Serialize an emphasis node.
		*
		* Attention is properly handled by `containerPhrasing`.
		*
		* @param {Emphasis} node
		*   Node to serialize.
		* @param {Parents | undefined} _
		*   Parent node.
		* @param {State} state
		*   Info passed around.
		* @param {Info} info
		*   Info on surrounding context.
		* @returns {string}
		*   Serialized markdown.
		*/
		function emphasis(node, _, state, info) {
			const exit = state.enter("phrasing");
			const value = state.containerPhrasing({
				type: "root",
				children: [node]
			}, info);
			exit();
			return value;
		}
		/**
		* Serialize an emphasis node as attention.
		*
		* @param {Emphasis} _
		*   Node to serialize.
		* @param {State} state
		*   Info passed around.
		* @returns {AttentionInfo}
		*   Info on how to serialize the node.
		*/
		function attention$1(_, state) {
			return {
				construct: "emphasis",
				markers: checkEmphasis(state) === "*" ? ["*", "_"] : ["_", "*"],
				sizes: [1]
			};
		}
		/**
		* Peek at this node.
		*
		* @param {Emphasis} _
		*   Node to serialize.
		* @param {Parents | undefined} _1
		*   Parent node.
		* @param {State} state
		*   Info passed around.
		* @returns {string}
		*   Start of the serialized markdown.
		*/
		function peek$1(_, _1, state) {
			return state.options.emphasis || "*";
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/util/encode-character-reference.js
		/**
		* Encode a code point as a character reference.
		*
		* @param {number} code
		*   Code point to encode.
		* @returns {string}
		*   Encoded character reference.
		*/
		function encodeCharacterReference(code) {
			return "&#x" + code.toString(16).toUpperCase() + ";";
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/util/format-heading-as-setext.js
		/**
		* @import {State} from 'mdast-util-to-markdown'
		* @import {Heading} from 'mdast'
		*/
		/**
		* Checks if a heading can be formatted as a setext heading.
		*
		* @param {Heading} node
		*   Node to check.
		* @param {State} state
		*   Info passed around.
		* @returns {boolean}
		*   Whether the heading can be formatted as a setext heading.
		*/
		function formatHeadingAsSetext(node, state) {
			let literalWithBreak = false;
			visit(node, function(node) {
				if ("value" in node && /\r?\n|\r/.test(node.value) || node.type === "break") {
					literalWithBreak = true;
					return false;
				}
			});
			return Boolean((!node.depth || node.depth < 3) && toString$1(node) && (state.options.setext || literalWithBreak));
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/heading.js
		/**
		* @import {Info, State} from 'mdast-util-to-markdown'
		* @import {Heading, Parents} from 'mdast'
		*/
		/**
		* Serialize a heading node.
		*
		* @param {Heading} node
		*   Node to serialize.
		* @param {Parents | undefined} _
		*   Parent node.
		* @param {State} state
		*   Info passed around.
		* @param {Info} info
		*   Info on surrounding context.
		* @returns {string}
		*   Serialized markdown.
		*/
		function heading(node, _, state, info) {
			const rank = Math.max(Math.min(6, node.depth || 1), 1);
			const tracker = state.createTracker(info);
			if (formatHeadingAsSetext(node, state)) {
				const exit = state.enter("headingSetext");
				const subexit = state.enter("phrasing");
				const value = state.containerPhrasing(node, {
					...tracker.current(),
					before: "\n",
					after: "\n"
				});
				subexit();
				exit();
				return value + "\n" + (rank === 1 ? "=" : "-").repeat(value.length - (Math.max(value.lastIndexOf("\r"), value.lastIndexOf("\n")) + 1));
			}
			const sequence = "#".repeat(rank);
			const exit = state.enter("headingAtx");
			const subexit = state.enter("phrasing");
			tracker.move(sequence + " ");
			let value = state.containerPhrasing(node, {
				before: "# ",
				after: "\n",
				...tracker.current()
			});
			const head = value.charCodeAt(0);
			if (head === 9 || head === 32) value = encodeCharacterReference(head) + value.slice(1);
			value = value ? sequence + " " + value : sequence;
			if (state.options.closeAtx) value += " " + sequence;
			subexit();
			exit();
			return value;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/html.js
		/**
		* @import {Html} from 'mdast'
		*/
		html.peek = htmlPeek;
		/**
		* Serialize an HTML node.
		*
		* @param {Html} node
		*   Node to serialize.
		* @returns {string}
		*   Serialized markdown.
		*/
		function html(node) {
			return node.value || "";
		}
		/**
		* Peek at this node.
		*
		* @returns {string}
		*   Start of the serialized markdown.
		*/
		function htmlPeek() {
			return "<";
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/image.js
		/**
		* @import {Info, State} from 'mdast-util-to-markdown'
		* @import {Image, Parents} from 'mdast'
		*/
		image.peek = imagePeek;
		/**
		* Serialize an image node.
		*
		* @param {Image} node
		*   Node to serialize.
		* @param {Parents | undefined} _
		*   Parent node.
		* @param {State} state
		*   Info passed around.
		* @param {Info} info
		*   Info on surrounding context.
		* @returns {string}
		*   Serialized markdown.
		*/
		function image(node, _, state, info) {
			const quote = checkQuote(state);
			const suffix = quote === "\"" ? "Quote" : "Apostrophe";
			const exit = state.enter("image");
			let subexit = state.enter("label");
			const tracker = state.createTracker(info);
			let value = tracker.move("![");
			value += tracker.move(state.safe(node.alt, {
				before: value,
				after: "]",
				...tracker.current()
			}));
			value += tracker.move("](");
			subexit();
			if (!node.url && node.title || /[\0- \u007F]/.test(node.url)) {
				subexit = state.enter("destinationLiteral");
				value += tracker.move("<");
				value += tracker.move(state.safe(node.url, {
					before: value,
					after: ">",
					...tracker.current()
				}));
				value += tracker.move(">");
			} else {
				subexit = state.enter("destinationRaw");
				value += tracker.move(state.safe(node.url, {
					before: value,
					after: node.title ? " " : ")",
					...tracker.current()
				}));
			}
			subexit();
			if (node.title) {
				subexit = state.enter(`title${suffix}`);
				value += tracker.move(" " + quote);
				value += tracker.move(state.safe(node.title, {
					before: value,
					after: quote,
					...tracker.current()
				}));
				value += tracker.move(quote);
				subexit();
			}
			value += tracker.move(")");
			exit();
			return value;
		}
		/**
		* Peek at this node.
		*
		* @returns {string}
		*   Start of the serialized markdown.
		*/
		function imagePeek() {
			return "!";
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/image-reference.js
		/**
		* @import {Info, State} from 'mdast-util-to-markdown'
		* @import {ImageReference, Parents} from 'mdast'
		*/
		imageReference.peek = imageReferencePeek;
		/**
		* Serialize an image reference node.
		*
		* @param {ImageReference} node
		*   Node to serialize.
		* @param {Parents | undefined} _
		*   Parent node.
		* @param {State} state
		*   Info passed around.
		* @param {Info} info
		*   Info on surrounding context.
		* @returns {string}
		*   Serialized markdown.
		*/
		function imageReference(node, _, state, info) {
			const type = node.referenceType;
			const exit = state.enter("imageReference");
			let subexit = state.enter("label");
			const tracker = state.createTracker(info);
			let value = tracker.move("![");
			const alt = state.safe(node.alt, {
				before: value,
				after: "]",
				...tracker.current()
			});
			value += tracker.move(alt + "][");
			subexit();
			const stack = state.stack;
			state.stack = stack.filter(function(d) {
				return d !== "phrasing";
			});
			subexit = state.enter("reference");
			const reference = state.safe(state.associationId(node), {
				before: value,
				after: "]",
				...tracker.current()
			});
			subexit();
			state.stack = stack;
			exit();
			if (type === "full" || !alt || alt !== reference) value += tracker.move(reference + "]");
			else if (type === "shortcut") value = value.slice(0, -1);
			else value += tracker.move("]");
			return value;
		}
		/**
		* Peek at this node.
		*
		* @returns {string}
		*   Start of the serialized markdown.
		*/
		function imageReferencePeek() {
			return "!";
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/inline-code.js
		/**
		* @import {State} from 'mdast-util-to-markdown'
		* @import {InlineCode, Parents} from 'mdast'
		*/
		inlineCode.peek = inlineCodePeek;
		/**
		* Serialize an inline code node.
		*
		* @param {InlineCode} node
		*   Node to serialize.
		* @param {Parents | undefined} _
		*   Parent node.
		* @param {State} state
		*   Info passed around.
		* @returns {string}
		*   Serialized markdown.
		*/
		function inlineCode(node, _, state) {
			let value = node.value || "";
			let sequence = "`";
			let index = -1;
			while (new RegExp("(^|[^`])" + sequence + "([^`]|$)").test(value)) sequence += "`";
			if (/[^\n\r ]/.test(value) && (/^[\n\r ]/.test(value) && /[\n\r ]$/.test(value) || /^`|`$/.test(value))) value = " " + value + " ";
			while (++index < state.unsafe.length) {
				const pattern = state.unsafe[index];
				const expression = state.compilePattern(pattern);
				if (!pattern.atBreak) continue;
				/** @type {RegExpExecArray | null} */
				let match;
				while (match = expression.exec(value)) {
					let position = match.index;
					if (value.charCodeAt(position) === 10 && value.charCodeAt(position - 1) === 13) position--;
					value = value.slice(0, position) + " " + value.slice(match.index + 1);
				}
			}
			return sequence + value + sequence;
		}
		/**
		* Peek at this node.
		*
		* @returns {string}
		*   Start of the serialized markdown.
		*/
		function inlineCodePeek() {
			return "`";
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/util/format-link-as-autolink.js
		/**
		* @import {State} from 'mdast-util-to-markdown'
		* @import {Link} from 'mdast'
		*/
		/**
		* Checks if a link can be formatted as an autolink.
		*
		* @param {Link} node
		*   Node to check.
		* @param {State} state
		*   Info passed around.
		* @returns {boolean}
		*   Whether the link can be formatted as an autolink.
		*/
		function formatLinkAsAutolink(node, state) {
			const raw = toString$1(node);
			return Boolean(!state.options.resourceLink && node.url && !node.title && node.children && node.children.length === 1 && node.children[0].type === "text" && (raw === node.url || "mailto:" + raw === node.url) && /^[a-z][+\-.a-z]+:/i.test(node.url) && !/[\0- <>\u007F]/.test(node.url));
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/link.js
		/**
		* @import {Info, State} from 'mdast-util-to-markdown'
		* @import {Link, Parents} from 'mdast'
		* @import {Exit} from '../types.js'
		*/
		link.peek = linkPeek;
		/**
		* Serialize a link node.
		*
		* @param {Link} node
		*   Node to serialize.
		* @param {Parents | undefined} _
		*   Parent node.
		* @param {State} state
		*   Info passed around.
		* @param {Info} info
		*   Info on surrounding context.
		* @returns {string}
		*   Serialized markdown.
		*/
		function link(node, _, state, info) {
			const quote = checkQuote(state);
			const suffix = quote === "\"" ? "Quote" : "Apostrophe";
			const tracker = state.createTracker(info);
			if (formatLinkAsAutolink(node, state)) {
				const stack = state.stack;
				state.stack = stack.filter(function(d) {
					return d !== "phrasing";
				});
				const exit = state.enter("autolink");
				let value = tracker.move("<");
				value += tracker.move(state.containerPhrasing(node, {
					before: value,
					after: ">",
					...tracker.current()
				}));
				value += tracker.move(">");
				exit();
				state.stack = stack;
				return value;
			}
			const exit = state.enter("link");
			let subexit = state.enter("label");
			let value = tracker.move("[");
			value += tracker.move(state.containerPhrasing(node, {
				before: value,
				after: "](",
				...tracker.current()
			}));
			value += tracker.move("](");
			subexit();
			if (!node.url && node.title || /[\0- \u007F]/.test(node.url)) {
				subexit = state.enter("destinationLiteral");
				value += tracker.move("<");
				value += tracker.move(state.safe(node.url, {
					before: value,
					after: ">",
					...tracker.current()
				}));
				value += tracker.move(">");
			} else {
				subexit = state.enter("destinationRaw");
				value += tracker.move(state.safe(node.url, {
					before: value,
					after: node.title ? " " : ")",
					...tracker.current()
				}));
			}
			subexit();
			if (node.title) {
				subexit = state.enter(`title${suffix}`);
				value += tracker.move(" " + quote);
				value += tracker.move(state.safe(node.title, {
					before: value,
					after: quote,
					...tracker.current()
				}));
				value += tracker.move(quote);
				subexit();
			}
			value += tracker.move(")");
			exit();
			return value;
		}
		/**
		* Peek at this node.
		*
		* @param {Link} node
		*   Node to peek at.
		* @param {Parents | undefined} _
		*   Parent node.
		* @param {State} state
		*   Info passed around.
		* @returns {string}
		*   Start of the serialized markdown.
		*/
		function linkPeek(node, _, state) {
			return formatLinkAsAutolink(node, state) ? "<" : "[";
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/link-reference.js
		/**
		* @import {Info, State} from 'mdast-util-to-markdown'
		* @import {LinkReference, Parents} from 'mdast'
		*/
		linkReference.peek = linkReferencePeek;
		/**
		* Serialize a link reference node.
		*
		* @param {LinkReference} node
		*   Node to serialize.
		* @param {Parents | undefined} _
		*   Parent node.
		* @param {State} state
		*   Info passed around.
		* @param {Info} info
		*   Info on surrounding context.
		* @returns {string}
		*   Serialized markdown.
		*/
		function linkReference(node, _, state, info) {
			const type = node.referenceType;
			const exit = state.enter("linkReference");
			let subexit = state.enter("label");
			const tracker = state.createTracker(info);
			let value = tracker.move("[");
			const text = state.containerPhrasing(node, {
				before: value,
				after: "]",
				...tracker.current()
			});
			value += tracker.move(text + "][");
			subexit();
			const stack = state.stack;
			state.stack = stack.filter(function(d) {
				return d !== "phrasing";
			});
			subexit = state.enter("reference");
			const reference = state.safe(state.associationId(node), {
				before: value,
				after: "]",
				...tracker.current()
			});
			subexit();
			state.stack = stack;
			exit();
			if (type === "full" || !text || text !== reference) value += tracker.move(reference + "]");
			else if (type === "shortcut") value = value.slice(0, -1);
			else value += tracker.move("]");
			return value;
		}
		/**
		* Peek at this node.
		*
		* @returns {string}
		*   Start of the serialized markdown.
		*/
		function linkReferencePeek() {
			return "[";
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/util/check-bullet.js
		/**
		* @import {Options, State} from 'mdast-util-to-markdown'
		*/
		/**
		* Checks the preferred list bullet option.
		*
		* @param {State} state
		*   Info passed around.
		* @returns {Exclude<Options['bullet'], null | undefined>}
		*   Preferred list bullet.
		*/
		function checkBullet(state) {
			const marker = state.options.bullet || "*";
			if (marker !== "*" && marker !== "+" && marker !== "-") throw new Error("Cannot serialize items with `" + marker + "` for `options.bullet`, expected `*`, `+`, or `-`");
			return marker;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/util/check-bullet-other.js
		/**
		* @import {Options, State} from 'mdast-util-to-markdown'
		*/
		/**
		* Checks the preferred alternate list bullet option.
		*
		* @param {State} state
		*   Info passed around.
		* @returns {Exclude<Options['bullet'], null | undefined>}
		*   Preferred alternate list bullet.
		*/
		function checkBulletOther(state) {
			const bullet = checkBullet(state);
			const bulletOther = state.options.bulletOther;
			if (!bulletOther) return bullet === "*" ? "-" : "*";
			if (bulletOther !== "*" && bulletOther !== "+" && bulletOther !== "-") throw new Error("Cannot serialize items with `" + bulletOther + "` for `options.bulletOther`, expected `*`, `+`, or `-`");
			if (bulletOther === bullet) throw new Error("Expected `bullet` (`" + bullet + "`) and `bulletOther` (`" + bulletOther + "`) to be different");
			return bulletOther;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/util/check-bullet-ordered.js
		/**
		* @import {Options, State} from 'mdast-util-to-markdown'
		*/
		/**
		* Checks the preferred ordered list bullet option.
		*
		* @param {State} state
		*   Info passed around.
		* @returns {Exclude<Options['bulletOrdered'], null | undefined>}
		*   Preferred ordered list bullet.
		*/
		function checkBulletOrdered(state) {
			const marker = state.options.bulletOrdered || ".";
			if (marker !== "." && marker !== ")") throw new Error("Cannot serialize items with `" + marker + "` for `options.bulletOrdered`, expected `.` or `)`");
			return marker;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/util/check-rule.js
		/**
		* @import {Options, State} from 'mdast-util-to-markdown'
		*/
		/**
		* Checks the preferred rule option.
		*
		* @param {State} state
		*   Info passed around.
		* @returns {Exclude<Options['rule'], null | undefined>}
		*   Preferred rule marker.
		*/
		function checkRule(state) {
			const marker = state.options.rule || "*";
			if (marker !== "*" && marker !== "-" && marker !== "_") throw new Error("Cannot serialize rules with `" + marker + "` for `options.rule`, expected `*`, `-`, or `_`");
			return marker;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/list.js
		/**
		* @import {Info, State} from 'mdast-util-to-markdown'
		* @import {List, Parents} from 'mdast'
		*/
		/**
		* Serialize a list node.
		*
		* @param {List} node
		*   Node to serialize.
		* @param {Parents | undefined} parent
		*   Parent node.
		* @param {State} state
		*   Info passed around.
		* @param {Info} info
		*   Info on surrounding context.
		* @returns {string}
		*   Serialized markdown.
		*/
		function list(node, parent, state, info) {
			const exit = state.enter("list");
			const bulletCurrent = state.bulletCurrent;
			/** @type {string} */
			let bullet = node.ordered ? checkBulletOrdered(state) : checkBullet(state);
			/** @type {string} */
			const bulletOther = node.ordered ? bullet === "." ? ")" : "." : checkBulletOther(state);
			let useDifferentMarker = parent && state.bulletLastUsed ? bullet === state.bulletLastUsed : false;
			if (!node.ordered) {
				const firstListItem = node.children ? node.children[0] : void 0;
				if ((bullet === "*" || bullet === "-") && firstListItem && (!firstListItem.children || !firstListItem.children[0]) && state.stack[state.stack.length - 1] === "list" && state.stack[state.stack.length - 2] === "listItem" && state.stack[state.stack.length - 3] === "list" && state.stack[state.stack.length - 4] === "listItem" && state.indexStack[state.indexStack.length - 1] === 0 && state.indexStack[state.indexStack.length - 2] === 0 && state.indexStack[state.indexStack.length - 3] === 0) useDifferentMarker = true;
				if (checkRule(state) === bullet && firstListItem) {
					let index = -1;
					while (++index < node.children.length) {
						const item = node.children[index];
						if (item && item.type === "listItem" && item.children && item.children[0] && item.children[0].type === "thematicBreak") {
							useDifferentMarker = true;
							break;
						}
					}
				}
			}
			if (useDifferentMarker) bullet = bulletOther;
			state.bulletCurrent = bullet;
			const value = state.containerFlow(node, info);
			state.bulletLastUsed = bullet;
			state.bulletCurrent = bulletCurrent;
			exit();
			return value;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/util/check-list-item-indent.js
		/**
		* @import {Options, State} from 'mdast-util-to-markdown'
		*/
		/**
		* Checks the preferred list item indent option.
		*
		* @param {State} state
		*   Info passed around.
		* @returns {Exclude<Options['listItemIndent'], null | undefined>}
		*   Preferred list item indent.
		*/
		function checkListItemIndent(state) {
			const style = state.options.listItemIndent || "one";
			if (style !== "tab" && style !== "one" && style !== "mixed") throw new Error("Cannot serialize items with `" + style + "` for `options.listItemIndent`, expected `tab`, `one`, or `mixed`");
			return style;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/list-item.js
		/**
		* @import {Info, Map, State} from 'mdast-util-to-markdown'
		* @import {ListItem, Parents} from 'mdast'
		*/
		/**
		* Serialize a list item node.
		*
		* @param {ListItem} node
		*   Node to serialize.
		* @param {Parents | undefined} parent
		*   Parent node.
		* @param {State} state
		*   Info passed around.
		* @param {Info} info
		*   Info on surrounding context.
		* @returns {string}
		*   Serialized markdown.
		*/
		function listItem(node, parent, state, info) {
			const listItemIndent = checkListItemIndent(state);
			let bullet = state.bulletCurrent || checkBullet(state);
			if (parent && parent.type === "list" && parent.ordered) bullet = (typeof parent.start === "number" && parent.start > -1 ? parent.start : 1) + (state.options.incrementListMarker === false ? 0 : parent.children.indexOf(node)) + bullet;
			let size = bullet.length + 1;
			if (listItemIndent === "tab" || listItemIndent === "mixed" && (parent && parent.type === "list" && parent.spread || node.spread)) size = Math.ceil(size / 4) * 4;
			const tracker = state.createTracker(info);
			tracker.move(bullet + " ".repeat(size - bullet.length));
			tracker.shift(size);
			const exit = state.enter("listItem");
			const value = state.indentLines(state.containerFlow(node, tracker.current()), map);
			exit();
			return value;
			/**
			* Indent lines of the list item.
			*
			* @type {Map}
			*/
			function map(line, index, blank) {
				if (index) return (blank ? "" : " ".repeat(size)) + line;
				return (blank ? bullet : bullet + " ".repeat(size - bullet.length)) + line;
			}
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/paragraph.js
		/**
		* @import {Info, State} from 'mdast-util-to-markdown'
		* @import {Paragraph, Parents} from 'mdast'
		*/
		/**
		* Serialize a paragraph node.
		*
		* @param {Paragraph} node
		*   Node to serialize.
		* @param {Parents | undefined} _
		*   Parent node.
		* @param {State} state
		*   Info passed around.
		* @param {Info} info
		*   Info on surrounding context.
		* @returns {string}
		*   Serialized markdown.
		*/
		function paragraph(node, _, state, info) {
			const exit = state.enter("paragraph");
			const subexit = state.enter("phrasing");
			const value = state.containerPhrasing(node, info);
			subexit();
			exit();
			return value;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/root.js
		/**
		* @import {Info, State} from 'mdast-util-to-markdown'
		* @import {Parents, Root} from 'mdast'
		*/
		/**
		* Serialize a root node.
		*
		* @param {Root} node
		*   Node to serialize.
		* @param {Parents | undefined} _
		*   Parent node.
		* @param {State} state
		*   Info passed around.
		* @param {Info} info
		*   Info on surrounding context.
		* @returns {string}
		*   Serialized markdown.
		*/
		function root(node, _, state, info) {
			if (!node.children.some(function(d) {
				return phrasing(d);
			})) return state.containerFlow(node, info);
			const exit = state.enter("phrasing");
			const value = state.containerPhrasing(node, info);
			exit();
			return value;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/util/check-strong.js
		/**
		* @import {Options, State} from 'mdast-util-to-markdown'
		*/
		/**
		* Checks the preferred strong option.
		*
		* @param {State} state
		*   Info passed around.
		* @returns {Exclude<Options['strong'], null | undefined>}
		*   Preferred strong marker.
		*/
		function checkStrong(state) {
			const marker = state.options.strong || "*";
			if (marker !== "*" && marker !== "_") throw new Error("Cannot serialize strong with `" + marker + "` for `options.strong`, expected `*`, or `_`");
			return marker;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/strong.js
		/**
		* @import {AttentionInfo, Info, State} from 'mdast-util-to-markdown'
		* @import {Parents, Strong} from 'mdast'
		*/
		strong.attention = attention;
		strong.peek = peek;
		/**
		* Serialize a strong node.
		*
		* Attention is properly handled by `containerPhrasing`.
		*
		* @param {Strong} node
		*   Node to serialize.
		* @param {Parents | undefined} _
		*   Parent node.
		* @param {State} state
		*   Info passed around.
		* @param {Info} info
		*   Info on surrounding context.
		* @returns {string}
		*   Serialized markdown.
		*/
		function strong(node, _, state, info) {
			const exit = state.enter("phrasing");
			const value = state.containerPhrasing({
				type: "root",
				children: [node]
			}, info);
			exit();
			return value;
		}
		/**
		* Serialize a strong node as attention.
		*
		* @param {Strong} _
		*   Node to serialize.
		* @param {State} state
		*   Info passed around.
		* @returns {AttentionInfo}
		*   Info on how to serialize the node.
		*/
		function attention(_, state) {
			return {
				construct: "strong",
				markers: checkStrong(state) === "*" ? ["*", "_"] : ["_", "*"],
				sizes: [2]
			};
		}
		/**
		* Peek at this node.
		*
		* @param {Strong} _
		*   Node to serialize.
		* @param {Parents | undefined} _1
		*   Parent node.
		* @param {State} state
		*   Info passed around.
		* @returns {string}
		*   Start of the serialized markdown.
		*/
		function peek(_, _1, state) {
			return state.options.strong || "*";
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/text.js
		/**
		* @import {Info, State} from 'mdast-util-to-markdown'
		* @import {Parents, Text} from 'mdast'
		*/
		/**
		* Serialize a text node.
		*
		* @param {Text} node
		*   Node to serialize.
		* @param {Parents | undefined} _
		*   Parent node.
		* @param {State} state
		*   Info passed around.
		* @param {Info} info
		*   Info on surrounding context.
		* @returns {string}
		*   Serialized markdown.
		*/
		function text$1(node, _, state, info) {
			return state.safe(node.value, info);
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/util/check-rule-repetition.js
		/**
		* @import {Options, State} from 'mdast-util-to-markdown'
		*/
		/**
		* Checks the preferred rule repetition option.
		*
		* @param {State} state
		*   Info passed around.
		* @returns {Exclude<Options['ruleRepetition'], null | undefined>}
		*   Preferred rule repetition.
		*/
		function checkRuleRepetition(state) {
			const repetition = state.options.ruleRepetition || 3;
			if (repetition < 3) throw new Error("Cannot serialize rules with repetition `" + repetition + "` for `options.ruleRepetition`, expected `3` or more");
			return repetition;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/thematic-break.js
		/**
		* @import {State} from 'mdast-util-to-markdown'
		* @import {Parents, ThematicBreak} from 'mdast'
		*/
		/**
		* Serialize a thematic break node.
		*
		* @param {ThematicBreak} _
		*   Node to serialize.
		* @param {Parents | undefined} _1
		*   Parent node.
		* @param {State} state
		*   Info passed around.
		* @returns {string}
		*   Serialized markdown.
		*/
		function thematicBreak(_, _1, state) {
			const value = (checkRule(state) + (state.options.ruleSpaces ? " " : "")).repeat(checkRuleRepetition(state));
			return state.options.ruleSpaces ? value.slice(0, -1) : value;
		}
		//#endregion
		//#region node_modules/mdast-util-to-markdown/lib/handle/index.js
		/**
		* Default (CommonMark) handlers.
		*/
		const handle = {
			blockquote,
			break: hardBreak,
			code: code$1,
			definition,
			emphasis,
			hardBreak,
			heading,
			html,
			image,
			imageReference,
			inlineCode,
			link,
			linkReference,
			list,
			listItem,
			paragraph,
			root,
			strong,
			text: text$1,
			thematicBreak
		};
		//#endregion
		//#region node_modules/mdast-util-gfm-table/lib/index.js
		/**
		* @typedef {import('mdast').InlineCode} InlineCode
		* @typedef {import('mdast').Table} Table
		* @typedef {import('mdast').TableCell} TableCell
		* @typedef {import('mdast').TableRow} TableRow
		*
		* @typedef {import('markdown-table').Options} MarkdownTableOptions
		*
		* @typedef {import('mdast-util-from-markdown').CompileContext} CompileContext
		* @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
		* @typedef {import('mdast-util-from-markdown').Handle} FromMarkdownHandle
		*
		* @typedef {import('mdast-util-to-markdown').Options} ToMarkdownExtension
		* @typedef {import('mdast-util-to-markdown').Handle} ToMarkdownHandle
		* @typedef {import('mdast-util-to-markdown').State} State
		* @typedef {import('mdast-util-to-markdown').Info} Info
		*/
		/**
		* @typedef Options
		*   Configuration.
		* @property {boolean | null | undefined} [tableCellPadding=true]
		*   Whether to add a space of padding between delimiters and cells (default:
		*   `true`).
		* @property {boolean | null | undefined} [tablePipeAlign=true]
		*   Whether to align the delimiters (default: `true`).
		* @property {MarkdownTableOptions['stringLength'] | null | undefined} [stringLength]
		*   Function to detect the length of table cell content, used when aligning
		*   the delimiters between cells (optional).
		*/
		/**
		* Create an extension for `mdast-util-from-markdown` to enable GFM tables in
		* markdown.
		*
		* @returns {FromMarkdownExtension}
		*   Extension for `mdast-util-from-markdown` to enable GFM tables.
		*/
		function gfmTableFromMarkdown() {
			return {
				enter: {
					table: enterTable,
					tableData: enterCell,
					tableHeader: enterCell,
					tableRow: enterRow
				},
				exit: {
					codeText: exitCodeText,
					table: exitTable,
					tableData: exit,
					tableHeader: exit,
					tableRow: exit
				}
			};
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterTable(token) {
			const align = token._align;
			this.enter({
				type: "table",
				align: align.map(function(d) {
					return d === "none" ? null : d;
				}),
				children: []
			}, token);
			this.data.inTable = true;
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitTable(token) {
			this.exit(token);
			this.data.inTable = void 0;
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterRow(token) {
			this.enter({
				type: "tableRow",
				children: []
			}, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exit(token) {
			this.exit(token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function enterCell(token) {
			this.enter({
				type: "tableCell",
				children: []
			}, token);
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitCodeText(token) {
			let value = this.resume();
			if (this.data.inTable) value = value.replace(/\\([\\|])/g, replace);
			const node = this.stack[this.stack.length - 1];
			node.type;
			node.value = value;
			this.exit(token);
		}
		/**
		* @param {string} $0
		* @param {string} $1
		* @returns {string}
		*/
		function replace($0, $1) {
			return $1 === "|" ? $1 : $0;
		}
		/**
		* Create an extension for `mdast-util-to-markdown` to enable GFM tables in
		* markdown.
		*
		* @param {Options | null | undefined} [options]
		*   Configuration.
		* @returns {ToMarkdownExtension}
		*   Extension for `mdast-util-to-markdown` to enable GFM tables.
		*/
		function gfmTableToMarkdown(options) {
			const settings = options || {};
			const padding = settings.tableCellPadding;
			const alignDelimiters = settings.tablePipeAlign;
			const stringLength = settings.stringLength;
			const around = padding ? " " : "|";
			return {
				unsafe: [
					{
						character: "\r",
						inConstruct: "tableCell"
					},
					{
						character: "\n",
						inConstruct: "tableCell"
					},
					{
						atBreak: true,
						character: "|",
						after: "[	 :-]"
					},
					{
						character: "|",
						inConstruct: "tableCell"
					},
					{
						atBreak: true,
						character: ":",
						after: "-"
					},
					{
						atBreak: true,
						character: "-",
						after: "[:|-]"
					}
				],
				handlers: {
					inlineCode: inlineCodeWithTable,
					table: handleTable,
					tableCell: handleTableCell,
					tableRow: handleTableRow
				}
			};
			/**
			* @type {ToMarkdownHandle}
			* @param {Table} node
			*/
			function handleTable(node, _, state, info) {
				return serializeData(handleTableAsData(node, state, info), node.align);
			}
			/**
			* This function isn’t really used normally, because we handle rows at the
			* table level.
			* But, if someone passes in a table row, this ensures we make somewhat sense.
			*
			* @type {ToMarkdownHandle}
			* @param {TableRow} node
			*/
			function handleTableRow(node, _, state, info) {
				const value = serializeData([handleTableRowAsData(node, state, info)]);
				return value.slice(0, value.indexOf("\n"));
			}
			/**
			* @type {ToMarkdownHandle}
			* @param {TableCell} node
			*/
			function handleTableCell(node, _, state, info) {
				const exit = state.enter("tableCell");
				const subexit = state.enter("phrasing");
				const value = state.containerPhrasing(node, {
					...info,
					before: around,
					after: around
				});
				subexit();
				exit();
				return value;
			}
			/**
			* @param {Array<Array<string>>} matrix
			* @param {Array<string | null | undefined> | null | undefined} [align]
			*/
			function serializeData(matrix, align) {
				return markdownTable(matrix, {
					align,
					alignDelimiters,
					padding,
					stringLength
				});
			}
			/**
			* @param {Table} node
			* @param {State} state
			* @param {Info} info
			*/
			function handleTableAsData(node, state, info) {
				const children = node.children;
				let index = -1;
				/** @type {Array<Array<string>>} */
				const result = [];
				const subexit = state.enter("table");
				while (++index < children.length) result[index] = handleTableRowAsData(children[index], state, info);
				subexit();
				return result;
			}
			/**
			* @param {TableRow} node
			* @param {State} state
			* @param {Info} info
			*/
			function handleTableRowAsData(node, state, info) {
				const children = node.children;
				let index = -1;
				/** @type {Array<string>} */
				const result = [];
				const subexit = state.enter("tableRow");
				while (++index < children.length) result[index] = handleTableCell(children[index], node, state, info);
				subexit();
				return result;
			}
			/**
			* @type {ToMarkdownHandle}
			* @param {InlineCode} node
			*/
			function inlineCodeWithTable(node, parent, state) {
				let value = handle.inlineCode(node, parent, state);
				if (state.stack.includes("tableCell")) value = value.replace(/\|/g, "\\$&");
				return value;
			}
		}
		//#endregion
		//#region node_modules/mdast-util-gfm-task-list-item/lib/index.js
		/**
		* @typedef {import('mdast').ListItem} ListItem
		* @typedef {import('mdast').Paragraph} Paragraph
		* @typedef {import('mdast-util-from-markdown').CompileContext} CompileContext
		* @typedef {import('mdast-util-from-markdown').Extension} FromMarkdownExtension
		* @typedef {import('mdast-util-from-markdown').Handle} FromMarkdownHandle
		* @typedef {import('mdast-util-to-markdown').Options} ToMarkdownExtension
		* @typedef {import('mdast-util-to-markdown').Handle} ToMarkdownHandle
		*/
		/**
		* Create an extension for `mdast-util-from-markdown` to enable GFM task
		* list items in markdown.
		*
		* @returns {FromMarkdownExtension}
		*   Extension for `mdast-util-from-markdown` to enable GFM task list items.
		*/
		function gfmTaskListItemFromMarkdown() {
			return { exit: {
				taskListCheckValueChecked: exitCheck,
				taskListCheckValueUnchecked: exitCheck,
				paragraph: exitParagraphWithTaskListItem
			} };
		}
		/**
		* Create an extension for `mdast-util-to-markdown` to enable GFM task list
		* items in markdown.
		*
		* @returns {ToMarkdownExtension}
		*   Extension for `mdast-util-to-markdown` to enable GFM task list items.
		*/
		function gfmTaskListItemToMarkdown() {
			return {
				unsafe: [{
					atBreak: true,
					character: "-",
					after: "[:|-]"
				}],
				handlers: { listItem: listItemWithTaskListItem }
			};
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitCheck(token) {
			const node = this.stack[this.stack.length - 2];
			node.type;
			node.checked = token.type === "taskListCheckValueChecked";
		}
		/**
		* @this {CompileContext}
		* @type {FromMarkdownHandle}
		*/
		function exitParagraphWithTaskListItem(token) {
			const parent = this.stack[this.stack.length - 2];
			if (parent && parent.type === "listItem" && typeof parent.checked === "boolean") {
				const node = this.stack[this.stack.length - 1];
				node.type;
				const head = node.children[0];
				if (head && head.type === "text") {
					const siblings = parent.children;
					let index = -1;
					/** @type {Paragraph | undefined} */
					let firstParaghraph;
					while (++index < siblings.length) {
						const sibling = siblings[index];
						if (sibling.type === "paragraph") {
							firstParaghraph = sibling;
							break;
						}
					}
					if (firstParaghraph === node) {
						head.value = head.value.slice(1);
						if (head.value.length === 0) node.children.shift();
						else if (node.position && head.position && typeof head.position.start.offset === "number") {
							head.position.start.column++;
							head.position.start.offset++;
							node.position.start = Object.assign({}, head.position.start);
						}
					}
				}
			}
			this.exit(token);
		}
		/**
		* @type {ToMarkdownHandle}
		* @param {ListItem} node
		*/
		function listItemWithTaskListItem(node, parent, state, info) {
			const head = node.children[0];
			const checkable = typeof node.checked === "boolean" && head && head.type === "paragraph";
			const checkbox = "[" + (node.checked ? "x" : " ") + "] ";
			const tracker = state.createTracker(info);
			if (checkable) tracker.move(checkbox);
			let value = handle.listItem(node, parent, state, {
				...info,
				...tracker.current()
			});
			if (checkable) value = value.replace(/^(?:[*+-]|\d+\.)([\r\n]| {1,3})/, check);
			return value;
			/**
			* @param {string} $0
			* @returns {string}
			*/
			function check($0) {
				return $0 + checkbox;
			}
		}
		//#endregion
		//#region node_modules/mdast-util-gfm/lib/index.js
		/**
		* @import {Extension as FromMarkdownExtension} from 'mdast-util-from-markdown'
		* @import {Options} from 'mdast-util-gfm'
		* @import {Options as ToMarkdownExtension} from 'mdast-util-to-markdown'
		*/
		/**
		* Create an extension for `mdast-util-from-markdown` to enable GFM (autolink
		* literals, footnotes, strikethrough, tables, tasklists).
		*
		* @returns {Array<FromMarkdownExtension>}
		*   Extension for `mdast-util-from-markdown` to enable GFM (autolink literals,
		*   footnotes, strikethrough, tables, tasklists).
		*/
		function gfmFromMarkdown() {
			return [
				gfmAutolinkLiteralFromMarkdown(),
				gfmFootnoteFromMarkdown(),
				gfmStrikethroughFromMarkdown(),
				gfmTableFromMarkdown(),
				gfmTaskListItemFromMarkdown()
			];
		}
		/**
		* Create an extension for `mdast-util-to-markdown` to enable GFM (autolink
		* literals, footnotes, strikethrough, tables, tasklists).
		*
		* @param {Options | null | undefined} [options]
		*   Configuration (optional).
		* @returns {ToMarkdownExtension}
		*   Extension for `mdast-util-to-markdown` to enable GFM (autolink literals,
		*   footnotes, strikethrough, tables, tasklists).
		*/
		function gfmToMarkdown(options) {
			return { extensions: [
				gfmAutolinkLiteralToMarkdown(),
				gfmFootnoteToMarkdown(options),
				gfmStrikethroughToMarkdown(),
				gfmTableToMarkdown(options),
				gfmTaskListItemToMarkdown()
			] };
		}
		//#endregion
		//#region node_modules/micromark-extension-gfm-autolink-literal/lib/syntax.js
		/**
		* @import {Code, ConstructRecord, Event, Extension, Previous, State, TokenizeContext, Tokenizer} from 'micromark-util-types'
		*/
		const wwwPrefix = {
			tokenize: tokenizeWwwPrefix,
			partial: true
		};
		const domain = {
			tokenize: tokenizeDomain,
			partial: true
		};
		const path = {
			tokenize: tokenizePath,
			partial: true
		};
		const trail = {
			tokenize: tokenizeTrail,
			partial: true
		};
		const emailDomainDotTrail = {
			tokenize: tokenizeEmailDomainDotTrail,
			partial: true
		};
		const wwwAutolink = {
			name: "wwwAutolink",
			tokenize: tokenizeWwwAutolink,
			previous: previousWww
		};
		const protocolAutolink = {
			name: "protocolAutolink",
			tokenize: tokenizeProtocolAutolink,
			previous: previousProtocol
		};
		const emailAutolink = {
			name: "emailAutolink",
			tokenize: tokenizeEmailAutolink,
			previous: previousEmail
		};
		/** @type {ConstructRecord} */
		const text = {};
		/**
		* Create an extension for `micromark` to support GitHub autolink literal
		* syntax.
		*
		* @returns {Extension}
		*   Extension for `micromark` that can be passed in `extensions` to enable GFM
		*   autolink literal syntax.
		*/
		function gfmAutolinkLiteral() {
			return { text };
		}
		/** @type {Code} */
		let code = 48;
		while (code < 123) {
			text[code] = emailAutolink;
			code++;
			if (code === 58) code = 65;
			else if (code === 91) code = 97;
		}
		text[43] = emailAutolink;
		text[45] = emailAutolink;
		text[46] = emailAutolink;
		text[95] = emailAutolink;
		text[72] = [emailAutolink, protocolAutolink];
		text[104] = [emailAutolink, protocolAutolink];
		text[87] = [emailAutolink, wwwAutolink];
		text[119] = [emailAutolink, wwwAutolink];
		/**
		* Email autolink literal.
		*
		* ```markdown
		* > | a contact@example.org b
		*       ^^^^^^^^^^^^^^^^^^^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeEmailAutolink(effects, ok, nok) {
			const self = this;
			/** @type {boolean | undefined} */
			let dot;
			/** @type {boolean} */
			let data;
			return start;
			/**
			* Start of email autolink literal.
			*
			* ```markdown
			* > | a contact@example.org b
			*       ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				if (!gfmAtext(code) || !previousEmail.call(self, self.previous) || previousUnbalanced(self.events)) return nok(code);
				effects.enter("literalAutolink");
				effects.enter("literalAutolinkEmail");
				return atext(code);
			}
			/**
			* In email atext.
			*
			* ```markdown
			* > | a contact@example.org b
			*       ^
			* ```
			*
			* @type {State}
			*/
			function atext(code) {
				if (gfmAtext(code)) {
					effects.consume(code);
					return atext;
				}
				if (code === 64) {
					effects.consume(code);
					return emailDomain;
				}
				return nok(code);
			}
			/**
			* In email domain.
			*
			* The reference code is a bit overly complex as it handles the `@`, of which
			* there may be just one.
			* Source: <https://github.com/github/cmark-gfm/blob/ef1cfcb/extensions/autolink.c#L318>
			*
			* ```markdown
			* > | a contact@example.org b
			*               ^
			* ```
			*
			* @type {State}
			*/
			function emailDomain(code) {
				if (code === 46) return effects.check(emailDomainDotTrail, emailDomainAfter, emailDomainDot)(code);
				if (code === 45 || code === 95 || asciiAlphanumeric(code)) {
					data = true;
					effects.consume(code);
					return emailDomain;
				}
				return emailDomainAfter(code);
			}
			/**
			* In email domain, on dot that is not a trail.
			*
			* ```markdown
			* > | a contact@example.org b
			*                      ^
			* ```
			*
			* @type {State}
			*/
			function emailDomainDot(code) {
				effects.consume(code);
				dot = true;
				return emailDomain;
			}
			/**
			* After email domain.
			*
			* ```markdown
			* > | a contact@example.org b
			*                          ^
			* ```
			*
			* @type {State}
			*/
			function emailDomainAfter(code) {
				if (data && dot && asciiAlpha(self.previous)) {
					effects.exit("literalAutolinkEmail");
					effects.exit("literalAutolink");
					return ok(code);
				}
				return nok(code);
			}
		}
		/**
		* `www` autolink literal.
		*
		* ```markdown
		* > | a www.example.org b
		*       ^^^^^^^^^^^^^^^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeWwwAutolink(effects, ok, nok) {
			const self = this;
			return wwwStart;
			/**
			* Start of www autolink literal.
			*
			* ```markdown
			* > | www.example.com/a?b#c
			*     ^
			* ```
			*
			* @type {State}
			*/
			function wwwStart(code) {
				if (code !== 87 && code !== 119 || !previousWww.call(self, self.previous) || previousUnbalanced(self.events)) return nok(code);
				effects.enter("literalAutolink");
				effects.enter("literalAutolinkWww");
				return effects.check(wwwPrefix, effects.attempt(domain, effects.attempt(path, wwwAfter), nok), nok)(code);
			}
			/**
			* After a www autolink literal.
			*
			* ```markdown
			* > | www.example.com/a?b#c
			*                          ^
			* ```
			*
			* @type {State}
			*/
			function wwwAfter(code) {
				effects.exit("literalAutolinkWww");
				effects.exit("literalAutolink");
				return ok(code);
			}
		}
		/**
		* Protocol autolink literal.
		*
		* ```markdown
		* > | a https://example.org b
		*       ^^^^^^^^^^^^^^^^^^^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeProtocolAutolink(effects, ok, nok) {
			const self = this;
			let buffer = "";
			let seen = false;
			return protocolStart;
			/**
			* Start of protocol autolink literal.
			*
			* ```markdown
			* > | https://example.com/a?b#c
			*     ^
			* ```
			*
			* @type {State}
			*/
			function protocolStart(code) {
				if ((code === 72 || code === 104) && previousProtocol.call(self, self.previous) && !previousUnbalanced(self.events)) {
					effects.enter("literalAutolink");
					effects.enter("literalAutolinkHttp");
					buffer += String.fromCodePoint(code);
					effects.consume(code);
					return protocolPrefixInside;
				}
				return nok(code);
			}
			/**
			* In protocol.
			*
			* ```markdown
			* > | https://example.com/a?b#c
			*     ^^^^^
			* ```
			*
			* @type {State}
			*/
			function protocolPrefixInside(code) {
				if (asciiAlpha(code) && buffer.length < 5) {
					buffer += String.fromCodePoint(code);
					effects.consume(code);
					return protocolPrefixInside;
				}
				if (code === 58) {
					const protocol = buffer.toLowerCase();
					if (protocol === "http" || protocol === "https") {
						effects.consume(code);
						return protocolSlashesInside;
					}
				}
				return nok(code);
			}
			/**
			* In slashes.
			*
			* ```markdown
			* > | https://example.com/a?b#c
			*           ^^
			* ```
			*
			* @type {State}
			*/
			function protocolSlashesInside(code) {
				if (code === 47) {
					effects.consume(code);
					if (seen) return afterProtocol;
					seen = true;
					return protocolSlashesInside;
				}
				return nok(code);
			}
			/**
			* After protocol, before domain.
			*
			* ```markdown
			* > | https://example.com/a?b#c
			*             ^
			* ```
			*
			* @type {State}
			*/
			function afterProtocol(code) {
				return code === null || asciiControl(code) || markdownLineEndingOrSpace(code) || unicodeWhitespace(code) || unicodePunctuation(code) ? nok(code) : effects.attempt(domain, effects.attempt(path, protocolAfter), nok)(code);
			}
			/**
			* After a protocol autolink literal.
			*
			* ```markdown
			* > | https://example.com/a?b#c
			*                              ^
			* ```
			*
			* @type {State}
			*/
			function protocolAfter(code) {
				effects.exit("literalAutolinkHttp");
				effects.exit("literalAutolink");
				return ok(code);
			}
		}
		/**
		* `www` prefix.
		*
		* ```markdown
		* > | a www.example.org b
		*       ^^^^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeWwwPrefix(effects, ok, nok) {
			let size = 0;
			return wwwPrefixInside;
			/**
			* In www prefix.
			*
			* ```markdown
			* > | www.example.com
			*     ^^^^
			* ```
			*
			* @type {State}
			*/
			function wwwPrefixInside(code) {
				if ((code === 87 || code === 119) && size < 3) {
					size++;
					effects.consume(code);
					return wwwPrefixInside;
				}
				if (code === 46 && size === 3) {
					effects.consume(code);
					return wwwPrefixAfter;
				}
				return nok(code);
			}
			/**
			* After www prefix.
			*
			* ```markdown
			* > | www.example.com
			*         ^
			* ```
			*
			* @type {State}
			*/
			function wwwPrefixAfter(code) {
				return code === null ? nok(code) : ok(code);
			}
		}
		/**
		* Domain.
		*
		* ```markdown
		* > | a https://example.org b
		*               ^^^^^^^^^^^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeDomain(effects, ok, nok) {
			/** @type {boolean | undefined} */
			let underscoreInLastSegment;
			/** @type {boolean | undefined} */
			let underscoreInLastLastSegment;
			/** @type {boolean | undefined} */
			let seen;
			return domainInside;
			/**
			* In domain.
			*
			* ```markdown
			* > | https://example.com/a
			*             ^^^^^^^^^^^
			* ```
			*
			* @type {State}
			*/
			function domainInside(code) {
				if (code === 46 || code === 95) return effects.check(trail, domainAfter, domainAtPunctuation)(code);
				if (code === null || markdownLineEndingOrSpace(code) || unicodeWhitespace(code) || code !== 45 && unicodePunctuation(code)) return domainAfter(code);
				seen = true;
				effects.consume(code);
				return domainInside;
			}
			/**
			* In domain, at potential trailing punctuation, that was not trailing.
			*
			* ```markdown
			* > | https://example.com
			*                    ^
			* ```
			*
			* @type {State}
			*/
			function domainAtPunctuation(code) {
				if (code === 95) underscoreInLastSegment = true;
				else {
					underscoreInLastLastSegment = underscoreInLastSegment;
					underscoreInLastSegment = void 0;
				}
				effects.consume(code);
				return domainInside;
			}
			/**
			* After domain.
			*
			* ```markdown
			* > | https://example.com/a
			*                        ^
			* ```
			*
			* @type {State} */
			function domainAfter(code) {
				if (underscoreInLastLastSegment || underscoreInLastSegment || !seen) return nok(code);
				return ok(code);
			}
		}
		/**
		* Path.
		*
		* ```markdown
		* > | a https://example.org/stuff b
		*                          ^^^^^^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizePath(effects, ok) {
			let sizeOpen = 0;
			let sizeClose = 0;
			return pathInside;
			/**
			* In path.
			*
			* ```markdown
			* > | https://example.com/a
			*                        ^^
			* ```
			*
			* @type {State}
			*/
			function pathInside(code) {
				if (code === 40) {
					sizeOpen++;
					effects.consume(code);
					return pathInside;
				}
				if (code === 41 && sizeClose < sizeOpen) return pathAtPunctuation(code);
				if (code === 33 || code === 34 || code === 38 || code === 39 || code === 41 || code === 42 || code === 44 || code === 46 || code === 58 || code === 59 || code === 60 || code === 63 || code === 93 || code === 95 || code === 126) return effects.check(trail, ok, pathAtPunctuation)(code);
				if (code === null || markdownLineEndingOrSpace(code) || unicodeWhitespace(code)) return ok(code);
				effects.consume(code);
				return pathInside;
			}
			/**
			* In path, at potential trailing punctuation, that was not trailing.
			*
			* ```markdown
			* > | https://example.com/a"b
			*                          ^
			* ```
			*
			* @type {State}
			*/
			function pathAtPunctuation(code) {
				if (code === 41) sizeClose++;
				effects.consume(code);
				return pathInside;
			}
		}
		/**
		* Trail.
		*
		* This calls `ok` if this *is* the trail, followed by an end, which means
		* the entire trail is not part of the link.
		* It calls `nok` if this *is* part of the link.
		*
		* ```markdown
		* > | https://example.com").
		*                        ^^^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeTrail(effects, ok, nok) {
			return trail;
			/**
			* In trail of domain or path.
			*
			* ```markdown
			* > | https://example.com").
			*                        ^
			* ```
			*
			* @type {State}
			*/
			function trail(code) {
				if (code === 33 || code === 34 || code === 39 || code === 41 || code === 42 || code === 44 || code === 46 || code === 58 || code === 59 || code === 63 || code === 95 || code === 126) {
					effects.consume(code);
					return trail;
				}
				if (code === 38) {
					effects.consume(code);
					return trailCharacterReferenceStart;
				}
				if (code === 93) {
					effects.consume(code);
					return trailBracketAfter;
				}
				if (code === 60 || code === null || markdownLineEndingOrSpace(code) || unicodeWhitespace(code)) return ok(code);
				return nok(code);
			}
			/**
			* In trail, after `]`.
			*
			* > 👉 **Note**: this deviates from `cmark-gfm` to fix a bug.
			* > See end of <https://github.com/github/cmark-gfm/issues/278> for more.
			*
			* ```markdown
			* > | https://example.com](
			*                         ^
			* ```
			*
			* @type {State}
			*/
			function trailBracketAfter(code) {
				if (code === null || code === 40 || code === 91 || markdownLineEndingOrSpace(code) || unicodeWhitespace(code)) return ok(code);
				return trail(code);
			}
			/**
			* In character-reference like trail, after `&`.
			*
			* ```markdown
			* > | https://example.com&amp;).
			*                         ^
			* ```
			*
			* @type {State}
			*/
			function trailCharacterReferenceStart(code) {
				return asciiAlpha(code) ? trailCharacterReferenceInside(code) : nok(code);
			}
			/**
			* In character-reference like trail.
			*
			* ```markdown
			* > | https://example.com&amp;).
			*                         ^
			* ```
			*
			* @type {State}
			*/
			function trailCharacterReferenceInside(code) {
				if (code === 59) {
					effects.consume(code);
					return trail;
				}
				if (asciiAlpha(code)) {
					effects.consume(code);
					return trailCharacterReferenceInside;
				}
				return nok(code);
			}
		}
		/**
		* Dot in email domain trail.
		*
		* This calls `ok` if this *is* the trail, followed by an end, which means
		* the trail is not part of the link.
		* It calls `nok` if this *is* part of the link.
		*
		* ```markdown
		* > | contact@example.org.
		*                        ^
		* ```
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeEmailDomainDotTrail(effects, ok, nok) {
			return start;
			/**
			* Dot.
			*
			* ```markdown
			* > | contact@example.org.
			*                    ^   ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.consume(code);
				return after;
			}
			/**
			* After dot.
			*
			* ```markdown
			* > | contact@example.org.
			*                     ^   ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				return asciiAlphanumeric(code) ? nok(code) : ok(code);
			}
		}
		/**
		* See:
		* <https://github.com/github/cmark-gfm/blob/ef1cfcb/extensions/autolink.c#L156>.
		*
		* @type {Previous}
		*/
		function previousWww(code) {
			return code === null || code === 40 || code === 42 || code === 95 || code === 91 || code === 93 || code === 126 || markdownLineEndingOrSpace(code);
		}
		/**
		* See:
		* <https://github.com/github/cmark-gfm/blob/ef1cfcb/extensions/autolink.c#L214>.
		*
		* @type {Previous}
		*/
		function previousProtocol(code) {
			return !asciiAlpha(code);
		}
		/**
		* @this {TokenizeContext}
		* @type {Previous}
		*/
		function previousEmail(code) {
			return !(code === 47 || gfmAtext(code));
		}
		/**
		* @param {Code} code
		* @returns {boolean}
		*/
		function gfmAtext(code) {
			return code === 43 || code === 45 || code === 46 || code === 95 || asciiAlphanumeric(code);
		}
		/**
		* @param {Array<Event>} events
		* @returns {boolean}
		*/
		function previousUnbalanced(events) {
			let index = events.length;
			let result = false;
			while (index--) {
				const token = events[index][1];
				if ((token.type === "labelLink" || token.type === "labelImage") && !token._balanced) {
					result = true;
					break;
				}
				if (token._gfmAutolinkLiteralWalkedInto) {
					result = false;
					break;
				}
			}
			if (events.length > 0 && !result) events[events.length - 1][1]._gfmAutolinkLiteralWalkedInto = true;
			return result;
		}
		//#endregion
		//#region node_modules/micromark-extension-gfm-footnote/lib/syntax.js
		/**
		* @import {Event, Exiter, Extension, Resolver, State, Token, TokenizeContext, Tokenizer} from 'micromark-util-types'
		*/
		const indent = {
			tokenize: tokenizeIndent,
			partial: true
		};
		/**
		* Create an extension for `micromark` to enable GFM footnote syntax.
		*
		* @returns {Extension}
		*   Extension for `micromark` that can be passed in `extensions` to
		*   enable GFM footnote syntax.
		*/
		function gfmFootnote() {
			/** @type {Extension} */
			return {
				document: { [91]: {
					name: "gfmFootnoteDefinition",
					tokenize: tokenizeDefinitionStart,
					continuation: { tokenize: tokenizeDefinitionContinuation },
					exit: gfmFootnoteDefinitionEnd
				} },
				text: {
					[91]: {
						name: "gfmFootnoteCall",
						tokenize: tokenizeGfmFootnoteCall
					},
					[93]: {
						name: "gfmPotentialFootnoteCall",
						add: "after",
						tokenize: tokenizePotentialGfmFootnoteCall,
						resolveTo: resolveToPotentialGfmFootnoteCall
					}
				}
			};
		}
		/**
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizePotentialGfmFootnoteCall(effects, ok, nok) {
			const self = this;
			let index = self.events.length;
			const defined = self.parser.gfmFootnotes || (self.parser.gfmFootnotes = []);
			/** @type {Token} */
			let labelStart;
			while (index--) {
				const token = self.events[index][1];
				if (token.type === "labelImage") {
					labelStart = token;
					break;
				}
				if (token.type === "gfmFootnoteCall" || token.type === "labelLink" || token.type === "label" || token.type === "image" || token.type === "link") break;
			}
			return start;
			/**
			* @type {State}
			*/
			function start(code) {
				if (!labelStart || !labelStart._balanced) return nok(code);
				const id = normalizeIdentifier(self.sliceSerialize({
					start: labelStart.end,
					end: self.now()
				}));
				if (id.codePointAt(0) !== 94 || !defined.includes(id.slice(1))) return nok(code);
				effects.enter("gfmFootnoteCallLabelMarker");
				effects.consume(code);
				effects.exit("gfmFootnoteCallLabelMarker");
				return ok(code);
			}
		}
		/** @type {Resolver} */
		function resolveToPotentialGfmFootnoteCall(events, context) {
			let index = events.length;
			while (index--) if (events[index][1].type === "labelImage" && events[index][0] === "enter") {
				events[index][1];
				break;
			}
			events[index + 1][1].type = "data";
			events[index + 3][1].type = "gfmFootnoteCallLabelMarker";
			/** @type {Token} */
			const call = {
				type: "gfmFootnoteCall",
				start: Object.assign({}, events[index + 3][1].start),
				end: Object.assign({}, events[events.length - 1][1].end)
			};
			/** @type {Token} */
			const marker = {
				type: "gfmFootnoteCallMarker",
				start: Object.assign({}, events[index + 3][1].end),
				end: Object.assign({}, events[index + 3][1].end)
			};
			marker.end.column++;
			marker.end.offset++;
			marker.end._bufferIndex++;
			/** @type {Token} */
			const string = {
				type: "gfmFootnoteCallString",
				start: Object.assign({}, marker.end),
				end: Object.assign({}, events[events.length - 1][1].start)
			};
			/** @type {Token} */
			const chunk = {
				type: "chunkString",
				contentType: "string",
				start: Object.assign({}, string.start),
				end: Object.assign({}, string.end)
			};
			/** @type {Array<Event>} */
			const replacement = [
				events[index + 1],
				events[index + 2],
				[
					"enter",
					call,
					context
				],
				events[index + 3],
				events[index + 4],
				[
					"enter",
					marker,
					context
				],
				[
					"exit",
					marker,
					context
				],
				[
					"enter",
					string,
					context
				],
				[
					"enter",
					chunk,
					context
				],
				[
					"exit",
					chunk,
					context
				],
				[
					"exit",
					string,
					context
				],
				events[events.length - 2],
				events[events.length - 1],
				[
					"exit",
					call,
					context
				]
			];
			events.splice(index, events.length - index + 1, ...replacement);
			return events;
		}
		/**
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeGfmFootnoteCall(effects, ok, nok) {
			const self = this;
			const defined = self.parser.gfmFootnotes || (self.parser.gfmFootnotes = []);
			let size = 0;
			/** @type {boolean} */
			let data;
			return start;
			/**
			* Start of footnote label.
			*
			* ```markdown
			* > | a [^b] c
			*       ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("gfmFootnoteCall");
				effects.enter("gfmFootnoteCallLabelMarker");
				effects.consume(code);
				effects.exit("gfmFootnoteCallLabelMarker");
				return callStart;
			}
			/**
			* After `[`, at `^`.
			*
			* ```markdown
			* > | a [^b] c
			*        ^
			* ```
			*
			* @type {State}
			*/
			function callStart(code) {
				if (code !== 94) return nok(code);
				effects.enter("gfmFootnoteCallMarker");
				effects.consume(code);
				effects.exit("gfmFootnoteCallMarker");
				effects.enter("gfmFootnoteCallString");
				effects.enter("chunkString").contentType = "string";
				return callData;
			}
			/**
			* In label.
			*
			* ```markdown
			* > | a [^b] c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function callData(code) {
				if (size > 999 || code === 93 && !data || code === null || code === 91 || markdownLineEndingOrSpace(code)) return nok(code);
				if (code === 93) {
					effects.exit("chunkString");
					const token = effects.exit("gfmFootnoteCallString");
					if (!defined.includes(normalizeIdentifier(self.sliceSerialize(token)))) return nok(code);
					effects.enter("gfmFootnoteCallLabelMarker");
					effects.consume(code);
					effects.exit("gfmFootnoteCallLabelMarker");
					effects.exit("gfmFootnoteCall");
					return ok;
				}
				if (!markdownLineEndingOrSpace(code)) data = true;
				size++;
				effects.consume(code);
				return code === 92 ? callEscape : callData;
			}
			/**
			* On character after escape.
			*
			* ```markdown
			* > | a [^b\c] d
			*           ^
			* ```
			*
			* @type {State}
			*/
			function callEscape(code) {
				if (code === 91 || code === 92 || code === 93) {
					effects.consume(code);
					size++;
					return callData;
				}
				return callData(code);
			}
		}
		/**
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeDefinitionStart(effects, ok, nok) {
			const self = this;
			const defined = self.parser.gfmFootnotes || (self.parser.gfmFootnotes = []);
			/** @type {string} */
			let identifier;
			let size = 0;
			/** @type {boolean | undefined} */
			let data;
			return start;
			/**
			* Start of GFM footnote definition.
			*
			* ```markdown
			* > | [^a]: b
			*     ^
			* ```
			*
			* @type {State}
			*/
			function start(code) {
				effects.enter("gfmFootnoteDefinition")._container = true;
				effects.enter("gfmFootnoteDefinitionLabel");
				effects.enter("gfmFootnoteDefinitionLabelMarker");
				effects.consume(code);
				effects.exit("gfmFootnoteDefinitionLabelMarker");
				return labelAtMarker;
			}
			/**
			* In label, at caret.
			*
			* ```markdown
			* > | [^a]: b
			*      ^
			* ```
			*
			* @type {State}
			*/
			function labelAtMarker(code) {
				if (code === 94) {
					effects.enter("gfmFootnoteDefinitionMarker");
					effects.consume(code);
					effects.exit("gfmFootnoteDefinitionMarker");
					effects.enter("gfmFootnoteDefinitionLabelString");
					effects.enter("chunkString").contentType = "string";
					return labelInside;
				}
				return nok(code);
			}
			/**
			* In label.
			*
			* > 👉 **Note**: `cmark-gfm` prevents whitespace from occurring in footnote
			* > definition labels.
			*
			* ```markdown
			* > | [^a]: b
			*       ^
			* ```
			*
			* @type {State}
			*/
			function labelInside(code) {
				if (size > 999 || code === 93 && !data || code === null || code === 91 || markdownLineEndingOrSpace(code)) return nok(code);
				if (code === 93) {
					effects.exit("chunkString");
					const token = effects.exit("gfmFootnoteDefinitionLabelString");
					identifier = normalizeIdentifier(self.sliceSerialize(token));
					effects.enter("gfmFootnoteDefinitionLabelMarker");
					effects.consume(code);
					effects.exit("gfmFootnoteDefinitionLabelMarker");
					effects.exit("gfmFootnoteDefinitionLabel");
					return labelAfter;
				}
				if (!markdownLineEndingOrSpace(code)) data = true;
				size++;
				effects.consume(code);
				return code === 92 ? labelEscape : labelInside;
			}
			/**
			* After `\`, at a special character.
			*
			* > 👉 **Note**: `cmark-gfm` currently does not support escaped brackets:
			* > <https://github.com/github/cmark-gfm/issues/240>
			*
			* ```markdown
			* > | [^a\*b]: c
			*         ^
			* ```
			*
			* @type {State}
			*/
			function labelEscape(code) {
				if (code === 91 || code === 92 || code === 93) {
					effects.consume(code);
					size++;
					return labelInside;
				}
				return labelInside(code);
			}
			/**
			* After definition label.
			*
			* ```markdown
			* > | [^a]: b
			*         ^
			* ```
			*
			* @type {State}
			*/
			function labelAfter(code) {
				if (code === 58) {
					effects.enter("definitionMarker");
					effects.consume(code);
					effects.exit("definitionMarker");
					if (!defined.includes(identifier)) defined.push(identifier);
					return factorySpace(effects, whitespaceAfter, "gfmFootnoteDefinitionWhitespace");
				}
				return nok(code);
			}
			/**
			* After definition prefix.
			*
			* ```markdown
			* > | [^a]: b
			*           ^
			* ```
			*
			* @type {State}
			*/
			function whitespaceAfter(code) {
				return ok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeDefinitionContinuation(effects, ok, nok) {
			return effects.check(blankLine, ok, effects.attempt(indent, ok, nok));
		}
		/** @type {Exiter} */
		function gfmFootnoteDefinitionEnd(effects) {
			effects.exit("gfmFootnoteDefinition");
		}
		/**
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeIndent(effects, ok, nok) {
			const self = this;
			return factorySpace(effects, afterPrefix, "gfmFootnoteDefinitionIndent", 5);
			/**
			* @type {State}
			*/
			function afterPrefix(code) {
				const tail = self.events[self.events.length - 1];
				return tail && tail[1].type === "gfmFootnoteDefinitionIndent" && tail[2].sliceSerialize(tail[1], true).length === 4 ? ok(code) : nok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-extension-gfm-strikethrough/lib/syntax.js
		/**
		* @import {Options} from 'micromark-extension-gfm-strikethrough'
		* @import {Event, Extension, Resolver, State, Token, TokenizeContext, Tokenizer} from 'micromark-util-types'
		*/
		/**
		* Create an extension for `micromark` to enable GFM strikethrough syntax.
		*
		* @param {Options | null | undefined} [options={}]
		*   Configuration.
		* @returns {Extension}
		*   Extension for `micromark` that can be passed in `extensions`, to
		*   enable GFM strikethrough syntax.
		*/
		function gfmStrikethrough(options) {
			let single = (options || {}).singleTilde;
			const tokenizer = {
				name: "strikethrough",
				tokenize: tokenizeStrikethrough,
				resolveAll: resolveAllStrikethrough
			};
			if (single === null || single === void 0) single = true;
			return {
				text: { [126]: tokenizer },
				insideSpan: { null: [tokenizer] },
				attentionMarkers: { null: [126] }
			};
			/**
			* Take events and resolve strikethrough.
			*
			* @type {Resolver}
			*/
			function resolveAllStrikethrough(events, context) {
				let index = -1;
				while (++index < events.length) if (events[index][0] === "enter" && events[index][1].type === "strikethroughSequenceTemporary" && events[index][1]._close) {
					let open = index;
					while (open--) if (events[open][0] === "exit" && events[open][1].type === "strikethroughSequenceTemporary" && events[open][1]._open && events[index][1].end.offset - events[index][1].start.offset === events[open][1].end.offset - events[open][1].start.offset) {
						events[index][1].type = "strikethroughSequence";
						events[open][1].type = "strikethroughSequence";
						/** @type {Token} */
						const strikethrough = {
							type: "strikethrough",
							start: Object.assign({}, events[open][1].start),
							end: Object.assign({}, events[index][1].end)
						};
						/** @type {Token} */
						const text = {
							type: "strikethroughText",
							start: Object.assign({}, events[open][1].end),
							end: Object.assign({}, events[index][1].start)
						};
						/** @type {Array<Event>} */
						const nextEvents = [
							[
								"enter",
								strikethrough,
								context
							],
							[
								"enter",
								events[open][1],
								context
							],
							[
								"exit",
								events[open][1],
								context
							],
							[
								"enter",
								text,
								context
							]
						];
						const insideSpan = context.parser.constructs.insideSpan.null;
						if (insideSpan) splice(nextEvents, nextEvents.length, 0, resolveAll(insideSpan, events.slice(open + 1, index), context));
						splice(nextEvents, nextEvents.length, 0, [
							[
								"exit",
								text,
								context
							],
							[
								"enter",
								events[index][1],
								context
							],
							[
								"exit",
								events[index][1],
								context
							],
							[
								"exit",
								strikethrough,
								context
							]
						]);
						splice(events, open - 1, index - open + 3, nextEvents);
						index = open + nextEvents.length - 2;
						break;
					}
				}
				index = -1;
				while (++index < events.length) if (events[index][1].type === "strikethroughSequenceTemporary") events[index][1].type = "data";
				return events;
			}
			/**
			* @this {TokenizeContext}
			* @type {Tokenizer}
			*/
			function tokenizeStrikethrough(effects, ok, nok) {
				const previous = this.previous;
				const events = this.events;
				let size = 0;
				return start;
				/** @type {State} */
				function start(code) {
					if (previous === 126 && events[events.length - 1][1].type !== "characterEscape") return nok(code);
					effects.enter("strikethroughSequenceTemporary");
					return more(code);
				}
				/** @type {State} */
				function more(code) {
					const before = classifyCharacter(previous);
					if (code === 126) {
						if (size > 1) return nok(code);
						effects.consume(code);
						size++;
						return more;
					}
					if (size < 2 && !single) return nok(code);
					const token = effects.exit("strikethroughSequenceTemporary");
					const after = classifyCharacter(code);
					token._open = !after || after === 2 && Boolean(before);
					token._close = !before || before === 2 && Boolean(after);
					return ok(code);
				}
			}
		}
		//#endregion
		//#region node_modules/micromark-extension-gfm-table/lib/edit-map.js
		/**
		* @import {Event} from 'micromark-util-types'
		*/
		/**
		* @typedef {[number, number, Array<Event>]} Change
		* @typedef {[number, number, number]} Jump
		*/
		/**
		* Tracks a bunch of edits.
		*/
		var EditMap = class {
			/**
			* Create a new edit map.
			*/
			constructor() {
				/**
				* Record of changes.
				*
				* @type {Array<Change>}
				*/
				this.map = [];
				/**
				* Changes by index, so `add` does not scan `map` (quadratic on
				* table-heavy documents).
				*
				* @type {Map<number, Change>}
				*/
				this.index = /* @__PURE__ */ new Map();
			}
			/**
			* Create an edit: a remove and/or add at a certain place.
			*
			* @param {number} index
			*   Index at which to apply the edit.
			* @param {number} remove
			*   Count of items to remove at the index.
			* @param {Array<Event>} add
			*   Items to add at the index.
			* @returns {undefined}
			*   Nothing.
			*/
			add(index, remove, add) {
				addImplementation(this, index, remove, add);
			}
			/**
			* Done, change the events.
			*
			* @param {Array<Event>} events
			*   List of events to apply the edits to.
			* @returns {undefined}
			*   Nothing.
			*/
			consume(events) {
				this.map.sort(function(a, b) {
					return a[0] - b[0];
				});
				/* c8 ignore next 3 -- `resolve` is never called without tables, so without edits. */
				if (this.map.length === 0) return;
				let index = this.map.length;
				/** @type {Array<Array<Event>>} */
				const vecs = [];
				while (index > 0) {
					index -= 1;
					vecs.push(events.slice(this.map[index][0] + this.map[index][1]), this.map[index][2]);
					events.length = this.map[index][0];
				}
				vecs.push(events.slice());
				events.length = 0;
				let slice = vecs.pop();
				while (slice) {
					for (const element of slice) events.push(element);
					slice = vecs.pop();
				}
				this.map.length = 0;
				this.index.clear();
			}
		};
		/**
		* Create an edit.
		*
		* @param {EditMap} editMap
		*   Edit map to apply to.
		* @param {number} at
		*   Index at which to apply the edit.
		* @param {number} remove
		*   Count of items to remove at the index.
		* @param {Array<Event>} add
		*   Items to add at the index.
		* @returns {undefined}
		*   Nothing.
		*/
		function addImplementation(editMap, at, remove, add) {
			/* c8 ignore next 3 -- `resolve` is never called without tables, so without edits. */
			if (remove === 0 && add.length === 0) return;
			const existing = editMap.index.get(at);
			if (existing) {
				existing[1] += remove;
				existing[2].push(...add);
				return;
			}
			/** @type {Change} */
			const change = [
				at,
				remove,
				add
			];
			editMap.map.push(change);
			editMap.index.set(at, change);
		}
		//#endregion
		//#region node_modules/micromark-extension-gfm-table/lib/infer.js
		/**
		* @import {Event} from 'micromark-util-types'
		*/
		/**
		* @typedef {'center' | 'left' | 'none' | 'right'} Align
		*/
		/**
		* Figure out the alignment of a GFM table.
		*
		* @param {Readonly<Array<Event>>} events
		*   List of events.
		* @param {number} index
		*   Table enter event.
		* @returns {Array<Align>}
		*   List of aligns.
		*/
		function gfmTableAlign(events, index) {
			let inDelimiterRow = false;
			/** @type {Array<Align>} */
			const align = [];
			while (index < events.length) {
				const event = events[index];
				if (inDelimiterRow) {
					if (event[0] === "enter") {
						if (event[1].type === "tableContent") align.push(events[index + 1][1].type === "tableDelimiterMarker" ? "left" : "none");
					} else if (event[1].type === "tableContent") {
						if (events[index - 1][1].type === "tableDelimiterMarker") {
							const alignIndex = align.length - 1;
							align[alignIndex] = align[alignIndex] === "left" ? "center" : "right";
						}
					} else if (event[1].type === "tableDelimiterRow") break;
				} else if (event[0] === "enter" && event[1].type === "tableDelimiterRow") inDelimiterRow = true;
				index += 1;
			}
			return align;
		}
		//#endregion
		//#region node_modules/micromark-extension-gfm-table/lib/syntax.js
		/**
		* @import {Event, Extension, Point, Resolver, State, Token, TokenizeContext, Tokenizer} from 'micromark-util-types'
		*/
		/**
		* @typedef {[number, number, number, number]} Range
		*   Cell info.
		*
		* @typedef {0 | 1 | 2 | 3} RowKind
		*   Where we are: `1` for head row, `2` for delimiter row, `3` for body row.
		*/
		/**
		* Create an HTML extension for `micromark` to support GitHub tables syntax.
		*
		* @returns {Extension}
		*   Extension for `micromark` that can be passed in `extensions` to enable GFM
		*   table syntax.
		*/
		function gfmTable() {
			return { flow: { null: {
				name: "table",
				tokenize: tokenizeTable,
				resolveAll: resolveTable
			} } };
		}
		/**
		* Tokenizer for GFM tables.
		*
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeTable(effects, ok, nok) {
			const self = this;
			let size = 0;
			let sizeB = 0;
			/** @type {boolean | undefined} */
			let seen;
			return start;
			/**
			* Start of a GFM table.
			*
			* If there is a valid table row or table head before, then we try to parse
			* another row.
			* Otherwise, we try to parse a head.
			*
			* ```markdown
			* > | | a |
			*     ^
			*   | | - |
			* > | | b |
			*     ^
			* ```
			* @type {State}
			*/
			function start(code) {
				let index = self.events.length - 1;
				while (index > -1) {
					const { type } = self.events[index][1];
					if (type === "lineEnding" || type === "linePrefix") index--;
					else break;
				}
				const tail = index > -1 ? self.events[index][1].type : null;
				const next = tail === "tableHead" || tail === "tableRow" ? bodyRowStart : headRowBefore;
				if (next === bodyRowStart && self.parser.lazy[self.now().line]) return nok(code);
				return next(code);
			}
			/**
			* Before table head row.
			*
			* ```markdown
			* > | | a |
			*     ^
			*   | | - |
			*   | | b |
			* ```
			*
			* @type {State}
			*/
			function headRowBefore(code) {
				effects.enter("tableHead");
				effects.enter("tableRow");
				return headRowStart(code);
			}
			/**
			* Before table head row, after whitespace.
			*
			* ```markdown
			* > | | a |
			*     ^
			*   | | - |
			*   | | b |
			* ```
			*
			* @type {State}
			*/
			function headRowStart(code) {
				if (code === 124) return headRowBreak(code);
				seen = true;
				sizeB += 1;
				return headRowBreak(code);
			}
			/**
			* At break in table head row.
			*
			* ```markdown
			* > | | a |
			*     ^
			*       ^
			*         ^
			*   | | - |
			*   | | b |
			* ```
			*
			* @type {State}
			*/
			function headRowBreak(code) {
				if (code === null) return nok(code);
				if (markdownLineEnding(code)) {
					if (sizeB > 1) {
						sizeB = 0;
						self.interrupt = true;
						effects.exit("tableRow");
						effects.enter("lineEnding");
						effects.consume(code);
						effects.exit("lineEnding");
						return headDelimiterStart;
					}
					return nok(code);
				}
				if (markdownSpace(code)) return factorySpace(effects, headRowBreak, "whitespace")(code);
				sizeB += 1;
				if (seen) {
					seen = false;
					size += 1;
				}
				if (code === 124) {
					effects.enter("tableCellDivider");
					effects.consume(code);
					effects.exit("tableCellDivider");
					seen = true;
					return headRowBreak;
				}
				effects.enter("data");
				return headRowData(code);
			}
			/**
			* In table head row data.
			*
			* ```markdown
			* > | | a |
			*       ^
			*   | | - |
			*   | | b |
			* ```
			*
			* @type {State}
			*/
			function headRowData(code) {
				if (code === null || code === 124 || markdownLineEndingOrSpace(code)) {
					effects.exit("data");
					return headRowBreak(code);
				}
				effects.consume(code);
				return code === 92 ? headRowEscape : headRowData;
			}
			/**
			* In table head row escape.
			*
			* ```markdown
			* > | | a\-b |
			*         ^
			*   | | ---- |
			*   | | c    |
			* ```
			*
			* @type {State}
			*/
			function headRowEscape(code) {
				if (code === 92 || code === 124) {
					effects.consume(code);
					return headRowData;
				}
				return headRowData(code);
			}
			/**
			* Before delimiter row.
			*
			* ```markdown
			*   | | a |
			* > | | - |
			*     ^
			*   | | b |
			* ```
			*
			* @type {State}
			*/
			function headDelimiterStart(code) {
				self.interrupt = false;
				if (self.parser.lazy[self.now().line]) return nok(code);
				effects.enter("tableDelimiterRow");
				seen = false;
				if (markdownSpace(code)) return factorySpace(effects, headDelimiterBefore, "linePrefix", self.parser.constructs.disable.null.includes("codeIndented") ? void 0 : 4)(code);
				return headDelimiterBefore(code);
			}
			/**
			* Before delimiter row, after optional whitespace.
			*
			* Reused when a `|` is found later, to parse another cell.
			*
			* ```markdown
			*   | | a |
			* > | | - |
			*     ^
			*   | | b |
			* ```
			*
			* @type {State}
			*/
			function headDelimiterBefore(code) {
				if (code === 45 || code === 58) return headDelimiterValueBefore(code);
				if (code === 124) {
					seen = true;
					effects.enter("tableCellDivider");
					effects.consume(code);
					effects.exit("tableCellDivider");
					return headDelimiterCellBefore;
				}
				return headDelimiterNok(code);
			}
			/**
			* After `|`, before delimiter cell.
			*
			* ```markdown
			*   | | a |
			* > | | - |
			*      ^
			* ```
			*
			* @type {State}
			*/
			function headDelimiterCellBefore(code) {
				if (markdownSpace(code)) return factorySpace(effects, headDelimiterValueBefore, "whitespace")(code);
				return headDelimiterValueBefore(code);
			}
			/**
			* Before delimiter cell value.
			*
			* ```markdown
			*   | | a |
			* > | | - |
			*       ^
			* ```
			*
			* @type {State}
			*/
			function headDelimiterValueBefore(code) {
				if (code === 58) {
					sizeB += 1;
					seen = true;
					effects.enter("tableDelimiterMarker");
					effects.consume(code);
					effects.exit("tableDelimiterMarker");
					return headDelimiterLeftAlignmentAfter;
				}
				if (code === 45) {
					sizeB += 1;
					return headDelimiterLeftAlignmentAfter(code);
				}
				if (code === null || markdownLineEnding(code)) return headDelimiterCellAfter(code);
				return headDelimiterNok(code);
			}
			/**
			* After delimiter cell left alignment marker.
			*
			* ```markdown
			*   | | a  |
			* > | | :- |
			*        ^
			* ```
			*
			* @type {State}
			*/
			function headDelimiterLeftAlignmentAfter(code) {
				if (code === 45) {
					effects.enter("tableDelimiterFiller");
					return headDelimiterFiller(code);
				}
				return headDelimiterNok(code);
			}
			/**
			* In delimiter cell filler.
			*
			* ```markdown
			*   | | a |
			* > | | - |
			*       ^
			* ```
			*
			* @type {State}
			*/
			function headDelimiterFiller(code) {
				if (code === 45) {
					effects.consume(code);
					return headDelimiterFiller;
				}
				if (code === 58) {
					seen = true;
					effects.exit("tableDelimiterFiller");
					effects.enter("tableDelimiterMarker");
					effects.consume(code);
					effects.exit("tableDelimiterMarker");
					return headDelimiterRightAlignmentAfter;
				}
				effects.exit("tableDelimiterFiller");
				return headDelimiterRightAlignmentAfter(code);
			}
			/**
			* After delimiter cell right alignment marker.
			*
			* ```markdown
			*   | |  a |
			* > | | -: |
			*         ^
			* ```
			*
			* @type {State}
			*/
			function headDelimiterRightAlignmentAfter(code) {
				if (markdownSpace(code)) return factorySpace(effects, headDelimiterCellAfter, "whitespace")(code);
				return headDelimiterCellAfter(code);
			}
			/**
			* After delimiter cell.
			*
			* ```markdown
			*   | |  a |
			* > | | -: |
			*          ^
			* ```
			*
			* @type {State}
			*/
			function headDelimiterCellAfter(code) {
				if (code === 124) return headDelimiterBefore(code);
				if (code === null || markdownLineEnding(code)) {
					if (!seen || size !== sizeB) return headDelimiterNok(code);
					effects.exit("tableDelimiterRow");
					effects.exit("tableHead");
					return ok(code);
				}
				return headDelimiterNok(code);
			}
			/**
			* In delimiter row, at a disallowed byte.
			*
			* ```markdown
			*   | | a |
			* > | | x |
			*       ^
			* ```
			*
			* @type {State}
			*/
			function headDelimiterNok(code) {
				return nok(code);
			}
			/**
			* Before table body row.
			*
			* ```markdown
			*   | | a |
			*   | | - |
			* > | | b |
			*     ^
			* ```
			*
			* @type {State}
			*/
			function bodyRowStart(code) {
				effects.enter("tableRow");
				return bodyRowBreak(code);
			}
			/**
			* At break in table body row.
			*
			* ```markdown
			*   | | a |
			*   | | - |
			* > | | b |
			*     ^
			*       ^
			*         ^
			* ```
			*
			* @type {State}
			*/
			function bodyRowBreak(code) {
				if (code === 124) {
					effects.enter("tableCellDivider");
					effects.consume(code);
					effects.exit("tableCellDivider");
					return bodyRowBreak;
				}
				if (code === null || markdownLineEnding(code)) {
					effects.exit("tableRow");
					return ok(code);
				}
				if (markdownSpace(code)) return factorySpace(effects, bodyRowBreak, "whitespace")(code);
				effects.enter("data");
				return bodyRowData(code);
			}
			/**
			* In table body row data.
			*
			* ```markdown
			*   | | a |
			*   | | - |
			* > | | b |
			*       ^
			* ```
			*
			* @type {State}
			*/
			function bodyRowData(code) {
				if (code === null || code === 124 || markdownLineEndingOrSpace(code)) {
					effects.exit("data");
					return bodyRowBreak(code);
				}
				effects.consume(code);
				return code === 92 ? bodyRowEscape : bodyRowData;
			}
			/**
			* In table body row escape.
			*
			* ```markdown
			*   | | a    |
			*   | | ---- |
			* > | | b\-c |
			*         ^
			* ```
			*
			* @type {State}
			*/
			function bodyRowEscape(code) {
				if (code === 92 || code === 124) {
					effects.consume(code);
					return bodyRowData;
				}
				return bodyRowData(code);
			}
		}
		/** @type {Resolver} */
		function resolveTable(events, context) {
			let index = -1;
			let inFirstCellAwaitingPipe = true;
			/** @type {RowKind} */
			let rowKind = 0;
			/** @type {Range} */
			let lastCell = [
				0,
				0,
				0,
				0
			];
			/** @type {Range} */
			let cell = [
				0,
				0,
				0,
				0
			];
			let afterHeadAwaitingFirstBodyRow = false;
			let lastTableEnd = 0;
			/** @type {Token | undefined} */
			let currentTable;
			/** @type {Token | undefined} */
			let currentBody;
			/** @type {Token | undefined} */
			let currentCell;
			const map = new EditMap();
			while (++index < events.length) {
				const event = events[index];
				const token = event[1];
				if (event[0] === "enter") {
					if (token.type === "tableHead") {
						afterHeadAwaitingFirstBodyRow = false;
						if (lastTableEnd !== 0) {
							flushTableEnd(map, context, lastTableEnd, currentTable, currentBody);
							currentBody = void 0;
							lastTableEnd = 0;
						}
						currentTable = {
							type: "table",
							start: Object.assign({}, token.start),
							end: Object.assign({}, token.end)
						};
						map.add(index, 0, [[
							"enter",
							currentTable,
							context
						]]);
					} else if (token.type === "tableRow" || token.type === "tableDelimiterRow") {
						inFirstCellAwaitingPipe = true;
						currentCell = void 0;
						lastCell = [
							0,
							0,
							0,
							0
						];
						cell = [
							0,
							index + 1,
							0,
							0
						];
						if (afterHeadAwaitingFirstBodyRow) {
							afterHeadAwaitingFirstBodyRow = false;
							currentBody = {
								type: "tableBody",
								start: Object.assign({}, token.start),
								end: Object.assign({}, token.end)
							};
							map.add(index, 0, [[
								"enter",
								currentBody,
								context
							]]);
						}
						rowKind = token.type === "tableDelimiterRow" ? 2 : currentBody ? 3 : 1;
					} else if (rowKind && (token.type === "data" || token.type === "tableDelimiterMarker" || token.type === "tableDelimiterFiller")) {
						inFirstCellAwaitingPipe = false;
						if (cell[2] === 0) {
							if (lastCell[1] !== 0) {
								cell[0] = cell[1];
								currentCell = flushCell(map, context, lastCell, rowKind, void 0, currentCell);
								lastCell = [
									0,
									0,
									0,
									0
								];
							}
							cell[2] = index;
						}
					} else if (token.type === "tableCellDivider") if (inFirstCellAwaitingPipe) inFirstCellAwaitingPipe = false;
					else {
						if (lastCell[1] !== 0) {
							cell[0] = cell[1];
							currentCell = flushCell(map, context, lastCell, rowKind, void 0, currentCell);
						}
						lastCell = cell;
						cell = [
							lastCell[1],
							index,
							0,
							0
						];
					}
				} else if (token.type === "tableHead") {
					afterHeadAwaitingFirstBodyRow = true;
					lastTableEnd = index;
				} else if (token.type === "tableRow" || token.type === "tableDelimiterRow") {
					lastTableEnd = index;
					if (lastCell[1] !== 0) {
						cell[0] = cell[1];
						currentCell = flushCell(map, context, lastCell, rowKind, index, currentCell);
					} else if (cell[1] !== 0) currentCell = flushCell(map, context, cell, rowKind, index, currentCell);
					rowKind = 0;
				} else if (rowKind && (token.type === "data" || token.type === "tableDelimiterMarker" || token.type === "tableDelimiterFiller")) cell[3] = index;
			}
			if (lastTableEnd !== 0) flushTableEnd(map, context, lastTableEnd, currentTable, currentBody);
			map.consume(context.events);
			index = -1;
			while (++index < context.events.length) {
				const event = context.events[index];
				if (event[0] === "enter" && event[1].type === "table") event[1]._align = gfmTableAlign(context.events, index);
			}
			return events;
		}
		/**
		* Generate a cell.
		*
		* @param {EditMap} map
		*   Edit map to apply to.
		* @param {Readonly<TokenizeContext>} context
		*   Tokenize context.
		* @param {Readonly<Range>} range
		*   Range of the cell within events.
		* @param {RowKind} rowKind
		*   Type of row.
		* @param {number | undefined} rowEnd
		*   Index of the end of the row, if known.
		* @param {Token | undefined} previousCell
		*   Previous cell token, if any.
		* @returns {Token | undefined}
		*   Current cell token after flushing, if any.
		*/
		function flushCell(map, context, range, rowKind, rowEnd, previousCell) {
			const groupName = rowKind === 1 ? "tableHeader" : rowKind === 2 ? "tableDelimiter" : "tableData";
			const valueName = "tableContent";
			if (range[0] !== 0) {
				previousCell.end = Object.assign({}, getPoint(context.events, range[0]));
				map.add(range[0], 0, [[
					"exit",
					previousCell,
					context
				]]);
			}
			const now = getPoint(context.events, range[1]);
			previousCell = {
				type: groupName,
				start: Object.assign({}, now),
				end: Object.assign({}, now)
			};
			map.add(range[1], 0, [[
				"enter",
				previousCell,
				context
			]]);
			if (range[2] !== 0) {
				const relatedStart = getPoint(context.events, range[2]);
				const relatedEnd = getPoint(context.events, range[3]);
				/** @type {Token} */
				const valueToken = {
					type: valueName,
					start: Object.assign({}, relatedStart),
					end: Object.assign({}, relatedEnd)
				};
				map.add(range[2], 0, [[
					"enter",
					valueToken,
					context
				]]);
				if (rowKind !== 2) {
					const start = context.events[range[2]];
					const end = context.events[range[3]];
					start[1].end = Object.assign({}, end[1].end);
					start[1].type = "chunkText";
					start[1].contentType = "text";
					if (range[3] > range[2] + 1) {
						const a = range[2] + 1;
						const b = range[3] - range[2] - 1;
						map.add(a, b, []);
					}
				}
				map.add(range[3] + 1, 0, [[
					"exit",
					valueToken,
					context
				]]);
			}
			if (rowEnd !== void 0) {
				previousCell.end = Object.assign({}, getPoint(context.events, rowEnd));
				map.add(rowEnd, 0, [[
					"exit",
					previousCell,
					context
				]]);
				previousCell = void 0;
			}
			return previousCell;
		}
		/**
		* Generate table end (and table body end).
		*
		* @param {Readonly<EditMap>} map
		*   Edit map to apply to.
		* @param {Readonly<TokenizeContext>} context
		*   Tokenize context.
		* @param {number} index
		*   Index within the events where the table end should be inserted.
		* @param {Token} table
		*   Table token.
		* @param {Token | undefined} tableBody
		*   Table body token, if any.
		* @returns {undefined}
		*   Nothing.
		*/
		function flushTableEnd(map, context, index, table, tableBody) {
			/** @type {Array<Event>} */
			const exits = [];
			const related = getPoint(context.events, index);
			if (tableBody) {
				tableBody.end = Object.assign({}, related);
				exits.push([
					"exit",
					tableBody,
					context
				]);
			}
			table.end = Object.assign({}, related);
			exits.push([
				"exit",
				table,
				context
			]);
			map.add(index + 1, 0, exits);
		}
		/**
		* Get the point (start or end) for a given event in the list of events.
		*
		* @param {Readonly<Array<Event>>} events
		*   List of events.
		* @param {number} index
		*   Index of the event to get the point for.
		* @returns {Readonly<Point>}
		*   Start point for enter and end point for exit.
		*/
		function getPoint(events, index) {
			const event = events[index];
			const side = event[0] === "enter" ? "start" : "end";
			return event[1][side];
		}
		//#endregion
		//#region node_modules/micromark-extension-gfm-task-list-item/lib/syntax.js
		/**
		* @import {Extension, State, TokenizeContext, Tokenizer} from 'micromark-util-types'
		*/
		const tasklistCheck = {
			name: "tasklistCheck",
			tokenize: tokenizeTasklistCheck
		};
		/**
		* Create an HTML extension for `micromark` to support GFM task list items
		* syntax.
		*
		* @returns {Extension}
		*   Extension for `micromark` that can be passed in `htmlExtensions` to
		*   support GFM task list items when serializing to HTML.
		*/
		function gfmTaskListItem() {
			return { text: { [91]: tasklistCheck } };
		}
		/**
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function tokenizeTasklistCheck(effects, ok, nok) {
			const self = this;
			return open;
			/**
			* At start of task list item check.
			*
			* ```markdown
			* > | * [x] y.
			*       ^
			* ```
			*
			* @type {State}
			*/
			function open(code) {
				if (self.previous !== null || !self._gfmTasklistFirstContentOfListItem) return nok(code);
				effects.enter("taskListCheck");
				effects.enter("taskListCheckMarker");
				effects.consume(code);
				effects.exit("taskListCheckMarker");
				return inside;
			}
			/**
			* In task list item check.
			*
			* ```markdown
			* > | * [x] y.
			*        ^
			* ```
			*
			* @type {State}
			*/
			function inside(code) {
				if (markdownLineEndingOrSpace(code)) {
					effects.enter("taskListCheckValueUnchecked");
					effects.consume(code);
					effects.exit("taskListCheckValueUnchecked");
					return close;
				}
				if (code === 88 || code === 120) {
					effects.enter("taskListCheckValueChecked");
					effects.consume(code);
					effects.exit("taskListCheckValueChecked");
					return close;
				}
				return nok(code);
			}
			/**
			* At close of task list item check.
			*
			* ```markdown
			* > | * [x] y.
			*         ^
			* ```
			*
			* @type {State}
			*/
			function close(code) {
				if (code === 93) {
					effects.enter("taskListCheckMarker");
					effects.consume(code);
					effects.exit("taskListCheckMarker");
					effects.exit("taskListCheck");
					return after;
				}
				return nok(code);
			}
			/**
			* @type {State}
			*/
			function after(code) {
				if (markdownLineEnding(code)) return ok(code);
				if (markdownSpace(code)) return effects.check({ tokenize: spaceThenNonSpace }, ok, nok)(code);
				return nok(code);
			}
		}
		/**
		* @this {TokenizeContext}
		* @type {Tokenizer}
		*/
		function spaceThenNonSpace(effects, ok, nok) {
			return factorySpace(effects, after, "whitespace");
			/**
			* After whitespace, after task list item check.
			*
			* ```markdown
			* > | * [x] y.
			*           ^
			* ```
			*
			* @type {State}
			*/
			function after(code) {
				return code === null ? nok(code) : ok(code);
			}
		}
		//#endregion
		//#region node_modules/micromark-extension-gfm/index.js
		/**
		* @typedef {import('micromark-extension-gfm-footnote').HtmlOptions} HtmlOptions
		* @typedef {import('micromark-extension-gfm-strikethrough').Options} Options
		* @typedef {import('micromark-util-types').Extension} Extension
		* @typedef {import('micromark-util-types').HtmlExtension} HtmlExtension
		*/
		/**
		* Create an extension for `micromark` to enable GFM syntax.
		*
		* @param {Options | null | undefined} [options]
		*   Configuration (optional).
		*
		*   Passed to `micromark-extens-gfm-strikethrough`.
		* @returns {Extension}
		*   Extension for `micromark` that can be passed in `extensions` to enable GFM
		*   syntax.
		*/
		function gfm(options) {
			return combineExtensions([
				gfmAutolinkLiteral(),
				gfmFootnote(),
				gfmStrikethrough(options),
				gfmTable(),
				gfmTaskListItem()
			]);
		}
		//#endregion
		//#region node_modules/remark-gfm/lib/index.js
		/**
		* @import {Root} from 'mdast'
		* @import {Options} from 'remark-gfm'
		* @import {} from 'remark-parse'
		* @import {} from 'remark-stringify'
		* @import {Processor} from 'unified'
		*/
		/** @type {Options} */
		const emptyOptions = {};
		/**
		* Add support GFM (autolink literals, footnotes, strikethrough, tables,
		* tasklists).
		*
		* @param {Options | null | undefined} [options]
		*   Configuration (optional).
		* @returns {undefined}
		*   Nothing.
		*/
		function remarkGfm(options) {
			const self = this;
			const settings = options || emptyOptions;
			const data = self.data();
			const micromarkExtensions = data.micromarkExtensions || (data.micromarkExtensions = []);
			const fromMarkdownExtensions = data.fromMarkdownExtensions || (data.fromMarkdownExtensions = []);
			const toMarkdownExtensions = data.toMarkdownExtensions || (data.toMarkdownExtensions = []);
			micromarkExtensions.push(gfm(settings));
			fromMarkdownExtensions.push(gfmFromMarkdown());
			toMarkdownExtensions.push(gfmToMarkdown(settings));
		}
		//#endregion
		//#region \0dsh-css:src/client/components/SkillDetailShell.module.css.mjs
		const css$13 = "._58q8UW_page{min-width:0;min-height:100%;color:var(--dsw-alias-label-primary,#12141a);background:var(--dsw-alias-bg-layer-2,#f5f6f8);flex-direction:column;display:flex;container-type:inline-size}._58q8UW_top{background:var(--dsw-alias-bg-layer-1,#fff);border-bottom:1px solid var(--dsw-alias-border-l2,#e4e6eb);padding:18px 28px 0}._58q8UW_crumbs{min-width:0;color:var(--dsw-alias-label-tertiary,#6b7080);align-items:center;gap:8px;font-size:13px;line-height:20px;display:flex}._58q8UW_crumbBack{color:var(--dsw-alias-label-secondary,#4a4f5c);font:inherit;cursor:pointer;background:0 0;border:none;align-items:center;gap:6px;padding:0;display:inline-flex}._58q8UW_crumbBack:hover{color:var(--dsw-alias-label-primary,#12141a)}._58q8UW_crumbCurrent{color:var(--dsw-alias-label-primary,#12141a);text-overflow:ellipsis;white-space:nowrap;overflow:hidden}._58q8UW_hero{flex-wrap:wrap;align-items:flex-start;gap:20px 24px;margin-top:20px;display:flex}._58q8UW_heroText{flex:320px;min-width:0}._58q8UW_titleRow{flex-wrap:wrap;align-items:center;gap:8px 10px;display:flex}._58q8UW_title{letter-spacing:-.01em;overflow-wrap:anywhere;margin:0;font-size:28px;font-weight:700;line-height:36px}._58q8UW_title:focus{outline:none}._58q8UW_title:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#2f49d1);outline-offset:2px}._58q8UW_versionChip{border:1px solid var(--dsw-alias-border-l2,#e4e6eb);color:var(--dsw-alias-label-secondary,#4a4f5c);font-family:var(--dsw-font-mono,ui-monospace, \"SF Mono\", Menlo, monospace);white-space:nowrap;border-radius:6px;padding:1px 8px;font-size:12px;line-height:18px}._58q8UW_meta{color:var(--dsw-alias-label-tertiary,#6b7080);flex-wrap:wrap;align-items:center;gap:2px 0;margin:8px 0 0;font-size:13px;line-height:20px;display:flex}._58q8UW_meta>span+span:before{content:\"·\";margin:0 8px}._58q8UW_meta strong{color:var(--dsw-alias-label-primary,#12141a);font-weight:600}._58q8UW_summary{max-width:72ch;color:var(--dsw-alias-label-secondary,#4a4f5c);margin:12px 0 0;font-size:15px;line-height:1.65}._58q8UW_chips{flex-wrap:wrap;gap:8px;margin-top:14px;display:flex}._58q8UW_chip{background:color-mix(in srgb, var(--dsw-alias-label-primary,#12141a) 6%, transparent);color:var(--dsw-alias-label-secondary,#4a4f5c);white-space:nowrap;border-radius:6px;align-items:center;gap:5px;padding:3px 9px;font-size:12px;line-height:18px;display:inline-flex}._58q8UW_chip_ok{background:color-mix(in srgb, var(--dsw-alias-state-success-primary,#1b6b45) 12%, transparent);color:var(--dsw-alias-state-success-primary,#1b6b45);font-weight:500}._58q8UW_chip_warn{background:color-mix(in srgb, var(--dsw-alias-state-warn-primary,#b25e00) 14%, transparent);color:var(--dsw-alias-state-warn-label,#8a4b00);font-weight:500}._58q8UW_chip_neutral{font-weight:500}._58q8UW_chip_blue{background:color-mix(in srgb, var(--dsw-alias-state-business-primary,#2f49d1) 10%, transparent);color:var(--dsw-alias-state-business-primary,#2f49d1);font-weight:500}._58q8UW_actions{flex-wrap:wrap;align-items:center;gap:10px;display:flex}._58q8UW_primaryButton,._58q8UW_secondaryButton{box-sizing:border-box;height:44px;font:inherit;white-space:nowrap;cursor:pointer;border-radius:10px;justify-content:center;align-items:center;gap:8px;font-size:14px;line-height:20px;text-decoration:none;display:inline-flex}._58q8UW_primaryButton{background:var(--dsw-alias-label-primary,#12141a);color:var(--dsw-alias-bg-layer-1,#fff);border:none;padding:0 22px;font-weight:600}._58q8UW_primaryButton:hover:not(:disabled){opacity:.88}._58q8UW_secondaryButton{border:1px solid var(--dsw-alias-border-l2,#e4e6eb);background:var(--dsw-alias-bg-layer-1,#fff);color:var(--dsw-alias-label-primary,#12141a);padding:0 16px;font-weight:500}._58q8UW_secondaryButton:hover:not(:disabled){background:color-mix(in srgb, var(--dsw-alias-label-primary,#12141a) 6%, transparent)}._58q8UW_primaryButton:disabled,._58q8UW_secondaryButton:disabled{cursor:default;opacity:.55}._58q8UW_primaryButton:focus-visible,._58q8UW_secondaryButton:focus-visible,._58q8UW_tab:focus-visible,._58q8UW_crumbBack:focus-visible,._58q8UW_linkButton:focus-visible,._58q8UW_expand:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#2f49d1);outline-offset:2px}._58q8UW_installedMark{color:var(--dsw-alias-state-success-primary,#1b6b45);align-items:center;gap:6px;font-size:14px;font-weight:600;display:inline-flex}._58q8UW_notInstallable{color:var(--dsw-alias-label-tertiary,#6b7080);font-size:13px}._58q8UW_stats{border:1px solid var(--dsw-alias-border-l2,#e4e6eb);border-radius:12px;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));margin:24px 0 0;display:grid;overflow:hidden}._58q8UW_stat{border-left:1px solid var(--dsw-alias-border-l2,#e4e6eb);margin-left:-1px;padding:14px 18px}._58q8UW_stat dt{color:var(--dsw-alias-label-tertiary,#6b7080);font-size:12px;line-height:18px}._58q8UW_stat dd{font-family:var(--dsw-font-mono,ui-monospace, \"SF Mono\", Menlo, monospace);font-variant-numeric:tabular-nums;margin:2px 0 0;font-size:20px;font-weight:600;line-height:30px}._58q8UW_tabs{scrollbar-width:none;gap:28px;margin-top:24px;display:flex;overflow-x:auto}._58q8UW_tab{color:var(--dsw-alias-label-secondary,#4a4f5c);font:inherit;white-space:nowrap;cursor:pointer;background:0 0;border:none;align-items:center;gap:6px;padding:10px 0 12px;font-size:14px;line-height:21px;display:inline-flex;position:relative}._58q8UW_tab:hover{color:var(--dsw-alias-label-primary,#12141a)}._58q8UW_tab[aria-selected=true]{color:var(--dsw-alias-label-primary,#12141a);font-weight:600}._58q8UW_tab[aria-selected=true]:after{content:\"\";background:var(--dsw-alias-label-primary,#12141a);border-radius:2px;height:2px;position:absolute;bottom:-1px;left:0;right:0}._58q8UW_tabCount{background:color-mix(in srgb, var(--dsw-alias-label-primary,#12141a) 6%, transparent);color:var(--dsw-alias-label-secondary,#4a4f5c);border-radius:999px;padding:0 7px;font-size:12px;font-weight:500;line-height:18px}._58q8UW_tabDot{background:var(--dsw-alias-state-warn-primary,#b25e00);border-radius:50%;width:7px;height:7px}._58q8UW_body{flex-direction:column;gap:16px;padding:24px 28px 40px;display:flex}._58q8UW_columns{grid-template-columns:minmax(0,1fr);align-items:start;gap:20px;display:grid}@container (width>=900px){._58q8UW_columns{grid-template-columns:minmax(0,1fr) 300px;gap:28px}}@container (width<=560px){._58q8UW_top{padding:14px 16px 0}._58q8UW_body{padding:16px 16px 32px}._58q8UW_title{font-size:22px;line-height:30px}._58q8UW_actions{width:100%}}._58q8UW_main,._58q8UW_side,._58q8UW_stack{flex-direction:column;gap:20px;min-width:0;display:flex}._58q8UW_card,._58q8UW_sideCard{border:1px solid var(--dsw-alias-border-l2,#e4e6eb);background:var(--dsw-alias-bg-layer-1,#fff);border-radius:14px;min-width:0}._58q8UW_card{padding:24px 32px}@container (width<=560px){._58q8UW_card{padding:18px}}._58q8UW_cardTitle{margin:0 0 14px;font-size:15px;font-weight:600;line-height:22px}._58q8UW_sideCard{padding:20px}._58q8UW_sideHeader ._58q8UW_mono{color:var(--dsw-alias-label-secondary,#4a4f5c);font-size:12px}._58q8UW_sideHeader{justify-content:space-between;align-items:baseline;gap:8px;margin-bottom:10px;display:flex}._58q8UW_sideTitle{margin:0;font-size:14px;font-weight:600;line-height:21px}._58q8UW_linkButton{color:var(--dsw-alias-state-warn-label,#8a4b00);font:inherit;text-underline-offset:3px;cursor:pointer;background:0 0;border:none;padding:0;font-size:13px;font-weight:600;text-decoration:underline}._58q8UW_sideCard ._58q8UW_linkButton,._58q8UW_snapshot ._58q8UW_linkButton{color:var(--dsw-alias-state-business-primary,#2f49d1)}._58q8UW_linkButton:disabled{cursor:default;opacity:.5}._58q8UW_link{color:var(--dsw-alias-state-business-primary,#2f49d1);text-underline-offset:3px;align-items:center;gap:4px;margin-top:12px;font-size:13px;font-weight:600;text-decoration:underline;display:inline-flex}._58q8UW_info{margin:0}._58q8UW_infoRow{border-top:1px solid var(--dsw-alias-border-l1,#eef0f3);justify-content:space-between;gap:12px;padding:9px 0;font-size:13px;line-height:19px;display:flex}._58q8UW_infoRow:first-child{border-top:none}._58q8UW_infoRow dt{color:var(--dsw-alias-label-tertiary,#6b7080)}._58q8UW_infoRow dd{text-align:right;text-overflow:ellipsis;white-space:nowrap;min-width:0;margin:0;font-weight:500;overflow:hidden}._58q8UW_mono{font-family:var(--dsw-font-mono,ui-monospace, \"SF Mono\", Menlo, monospace);font-variant-numeric:tabular-nums}._58q8UW_muted{color:var(--dsw-alias-label-tertiary,#6b7080);margin:0;font-size:13px;line-height:20px}._58q8UW_snapshot{color:var(--dsw-alias-label-tertiary,#6b7080);flex-wrap:wrap;align-items:center;gap:4px 12px;margin:0;font-size:12px;line-height:18px;display:flex}._58q8UW_markdown{overflow-wrap:anywhere;max-width:74ch;font-size:13.5px;line-height:1.7}._58q8UW_frontmatter{margin-top:18px}._58q8UW_muted{color:var(--dsw-alias-label-tertiary,#81858c);align-items:center;gap:6px;margin:0;padding:6px 0;font-size:12.5px;line-height:19px;display:flex}._58q8UW_files{flex-wrap:wrap;align-items:flex-start;gap:14px;min-width:0;display:flex}._58q8UW_fileList{border:1px solid var(--dsw-alias-border-l2,#0000001a);border-radius:var(--dsw-radius-sm,8px);flex:220px;min-width:0;max-height:420px;margin:0;padding:4px;list-style:none;overflow-y:auto}._58q8UW_fileItem{box-sizing:border-box;border-radius:var(--dsw-radius-xs,4px);width:100%;color:var(--dsw-alias-label-secondary,#61666b);font:inherit;text-align:left;cursor:pointer;background:0 0;border:none;align-items:center;gap:7px;margin:0;padding:6px 8px;font-size:12px;line-height:18px;display:flex}._58q8UW_fileItem:hover{background:var(--dsw-alias-interactive-bg-hover,#2631480f)}._58q8UW_fileItem:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#4176e6);outline-offset:-1px}._58q8UW_fileItemActive{background:var(--dsw-alias-button-ghost-active-fill,#ebeef2);color:var(--dsw-alias-label-primary,#0f1115);font-weight:600}._58q8UW_fileIcon{color:var(--dsw-alias-label-tertiary,#81858c);flex:none}._58q8UW_filePath{text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;overflow:hidden}._58q8UW_fileFlag{background:color-mix(in srgb, var(--dsw-alias-state-warn-primary,#f59e0b) 14%, transparent);color:var(--dsw-alias-state-warn-primary,#f59e0b);border-radius:999px;flex:none;padding:0 6px;font-size:10.5px;font-weight:600;line-height:17px}._58q8UW_fileMeta{color:var(--dsw-alias-label-tertiary,#81858c);font-variant-numeric:tabular-nums;white-space:nowrap;flex:none;font-size:11px}._58q8UW_fileView{flex:2 320px;min-width:0}._58q8UW_fileBar{align-items:center;gap:8px;min-width:0;margin-bottom:8px;display:flex}._58q8UW_fileBarPath{min-width:0;color:var(--dsw-alias-label-secondary,#61666b);text-overflow:ellipsis;white-space:nowrap;flex:1;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;overflow:hidden}._58q8UW_copy{flex:none}._58q8UW_viewToggle{border:1px solid var(--dsw-alias-border-l2,#0000001a);background:var(--dsw-alias-bg-layer-2,#f0f2f5);border-radius:999px;flex:none;gap:2px;padding:2px;display:inline-flex}._58q8UW_viewToggle button{color:var(--dsw-alias-label-secondary,#61666b);font:inherit;cursor:pointer;background:0 0;border:0;border-radius:999px;padding:2px 10px;font-size:11.5px;line-height:18px}._58q8UW_viewToggle button[aria-pressed=true]{background:var(--dsw-alias-bg-layer-1,#fff);color:var(--dsw-alias-label-primary,#0f1115);font-weight:600}._58q8UW_viewToggle button:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#4176e6);outline-offset:1px}._58q8UW_srOnly{clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0;width:1px;height:1px;margin:-1px;padding:0;position:absolute;overflow:hidden}._58q8UW_markdown>:first-child{margin-top:0}._58q8UW_markdown>:last-child{margin-bottom:0}._58q8UW_markdown h1,._58q8UW_markdown h2,._58q8UW_markdown h3{margin:1.4em 0 .6em;line-height:1.35}._58q8UW_markdown h1{font-size:1.7em}._58q8UW_markdown h2{font-size:1.4em}._58q8UW_markdown h3{font-size:1.15em}._58q8UW_markdown p,._58q8UW_markdown ul,._58q8UW_markdown ol{margin:.75em 0}._58q8UW_markdown ul,._58q8UW_markdown ol{padding-left:1.7em}._58q8UW_markdown a{color:var(--dsw-alias-state-business-primary,#4176e6);text-decoration:underline}._58q8UW_markdown pre{color:#e8eaf0;background:#12141a;border-radius:10px;padding:14px 16px;font-size:12.5px;line-height:1.7;overflow-x:auto}._58q8UW_markdown pre code{color:inherit}._58q8UW_markdown code{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:.9em}._58q8UW_markdown :not(pre)>code{background:var(--dsw-alias-bg-layer-2,#f2f3f5);border-radius:4px;padding:2px 5px}._58q8UW_markdown blockquote{border-left:3px solid var(--dsw-alias-border-l2,#0000001a);color:var(--dsw-alias-label-secondary,#61666b);margin:1em 0;padding-left:14px}._58q8UW_markdown table{border-collapse:collapse;max-width:100%;display:block;overflow-x:auto}._58q8UW_markdown th,._58q8UW_markdown td{border:1px solid var(--dsw-alias-border-l2,#0000001a);text-align:left;padding:7px 10px}._58q8UW_markdown img{max-width:100%;height:auto}._58q8UW_markdown hr{border:0;border-top:1px solid var(--dsw-alias-border-l2,#0000001a);margin:20px 0}._58q8UW_skeletonAvatar,._58q8UW_skeletonTitle,._58q8UW_skeletonLine{background:var(--dsw-alias-border-l2,#0000001a);border-radius:5px;animation:1.6s ease-in-out infinite alternate _58q8UW_skeletonPulse;display:block}._58q8UW_skeletonAvatar{border-radius:16px;flex:none;width:72px;height:72px}._58q8UW_skeletonTitle{width:55%;height:28px;margin:8px 0 20px}._58q8UW_skeletonLine{width:100%;height:13px;margin:16px 0}._58q8UW_skeletonLine:nth-child(3n){width:72%}@keyframes _58q8UW_skeletonPulse{to{opacity:.4}}@media (prefers-reduced-motion:reduce){._58q8UW_skeletonAvatar,._58q8UW_skeletonTitle,._58q8UW_skeletonLine{animation:none}}";
		const tagId$13 = "@nanmicoder/dsh-skills-hub/SkillDetailShell.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$13) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@nanmicoder/dsh-skills-hub";
			tag.dataset.pluginCss = tagId$13;
			tag.textContent = css$13;
			document.head.appendChild(tag);
		}
		var SkillDetailShell_module_css_default = {
			"actions": "_58q8UW_actions",
			"body": "_58q8UW_body",
			"card": "_58q8UW_card",
			"cardTitle": "_58q8UW_cardTitle",
			"chip": "_58q8UW_chip",
			"chip_blue": "_58q8UW_chip_blue",
			"chip_neutral": "_58q8UW_chip_neutral",
			"chip_ok": "_58q8UW_chip_ok",
			"chip_warn": "_58q8UW_chip_warn",
			"chips": "_58q8UW_chips",
			"columns": "_58q8UW_columns",
			"copy": "_58q8UW_copy",
			"crumbBack": "_58q8UW_crumbBack",
			"crumbCurrent": "_58q8UW_crumbCurrent",
			"crumbs": "_58q8UW_crumbs",
			"expand": "_58q8UW_expand",
			"fileBar": "_58q8UW_fileBar",
			"fileBarPath": "_58q8UW_fileBarPath",
			"fileFlag": "_58q8UW_fileFlag",
			"fileIcon": "_58q8UW_fileIcon",
			"fileItem": "_58q8UW_fileItem",
			"fileItemActive": "_58q8UW_fileItemActive",
			"fileList": "_58q8UW_fileList",
			"fileMeta": "_58q8UW_fileMeta",
			"filePath": "_58q8UW_filePath",
			"fileView": "_58q8UW_fileView",
			"files": "_58q8UW_files",
			"frontmatter": "_58q8UW_frontmatter",
			"hero": "_58q8UW_hero",
			"heroText": "_58q8UW_heroText",
			"info": "_58q8UW_info",
			"infoRow": "_58q8UW_infoRow",
			"installedMark": "_58q8UW_installedMark",
			"link": "_58q8UW_link",
			"linkButton": "_58q8UW_linkButton",
			"main": "_58q8UW_main",
			"markdown": "_58q8UW_markdown",
			"meta": "_58q8UW_meta",
			"mono": "_58q8UW_mono",
			"muted": "_58q8UW_muted",
			"notInstallable": "_58q8UW_notInstallable",
			"page": "_58q8UW_page",
			"primaryButton": "_58q8UW_primaryButton",
			"secondaryButton": "_58q8UW_secondaryButton",
			"side": "_58q8UW_side",
			"sideCard": "_58q8UW_sideCard",
			"sideHeader": "_58q8UW_sideHeader",
			"sideTitle": "_58q8UW_sideTitle",
			"skeletonAvatar": "_58q8UW_skeletonAvatar",
			"skeletonLine": "_58q8UW_skeletonLine",
			"skeletonPulse": "_58q8UW_skeletonPulse",
			"skeletonTitle": "_58q8UW_skeletonTitle",
			"snapshot": "_58q8UW_snapshot",
			"srOnly": "_58q8UW_srOnly",
			"stack": "_58q8UW_stack",
			"stat": "_58q8UW_stat",
			"stats": "_58q8UW_stats",
			"summary": "_58q8UW_summary",
			"tab": "_58q8UW_tab",
			"tabCount": "_58q8UW_tabCount",
			"tabDot": "_58q8UW_tabDot",
			"tabs": "_58q8UW_tabs",
			"title": "_58q8UW_title",
			"titleRow": "_58q8UW_titleRow",
			"top": "_58q8UW_top",
			"versionChip": "_58q8UW_versionChip",
			"viewToggle": "_58q8UW_viewToggle"
		};
		//#endregion
		//#region lib/client/components/MarkdownView.js
		/**
		* Self-contained GFM rendering for untrusted marketplace and local skill docs.
		*
		* Raw HTML is skipped and external links are opened with `noopener noreferrer`;
		* the typography lives in the detail shell so a rendered document looks the same
		* in the overview tab and in the file viewer.
		*/
		function MarkdownView({ content }) {
			return (0, react_jsx_runtime.jsx)("div", {
				className: SkillDetailShell_module_css_default.markdown,
				children: (0, react_jsx_runtime.jsx)(Markdown, {
					remarkPlugins: [remarkGfm],
					skipHtml: true,
					components: { a: ({ children, node: _node, ...props }) => (0, react_jsx_runtime.jsx)("a", {
						...props,
						target: "_blank",
						rel: "noopener noreferrer",
						children
					}) },
					children: content
				})
			});
		}
		//#endregion
		//#region \0dsh-css:src/client/components/FrontmatterPanel.module.css.mjs
		const css$12 = ".hR0bda_panel{border:1px solid var(--dsw-alias-border-l2,#0000001a);border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-bg-layer-1,#fff);flex-direction:column;min-width:0;display:flex;overflow:hidden}.hR0bda_head{border-bottom:1px solid var(--dsw-alias-border-l1,#0000000a);background:var(--dsw-alias-bg-module-platform,#f5f6f7);align-items:center;gap:8px;padding:8px 12px;display:flex}.hR0bda_title{min-width:0;color:var(--dsw-alias-label-tertiary,#81858c);letter-spacing:.08em;text-transform:uppercase;flex:1;margin:0;font-size:10.5px;font-weight:600}.hR0bda_count{color:var(--dsw-alias-label-tertiary,#81858c);font-variant-numeric:tabular-nums;font-size:11px}.hR0bda_list{max-height:320px;margin:0;padding:0;overflow-y:auto}.hR0bda_row{border-bottom:1px solid var(--dsw-alias-border-l1,#0000000a);flex-direction:column;gap:3px;min-width:0;padding:8px 12px;display:flex}.hR0bda_row:last-child{border-bottom:none}.hR0bda_key{overflow-wrap:anywhere;min-width:0;color:var(--dsw-alias-label-tertiary,#81858c);letter-spacing:.02em;font-size:10.5px;font-weight:600}.hR0bda_value{min-width:0;color:var(--dsw-alias-label-primary,#0f1115);margin:0;font-size:12.5px;line-height:19px}.hR0bda_text{overflow-wrap:anywhere}.hR0bda_chips{flex-wrap:wrap;gap:4px;display:flex}.hR0bda_chip{background:var(--dsw-alias-bg-module-platform,#f5f6f7);max-width:100%;color:var(--dsw-alias-label-secondary,#61666b);overflow-wrap:anywhere;border-radius:999px;padding:1px 7px;font-size:11px;line-height:17px;display:inline-flex}.hR0bda_chipOn{background:color-mix(in srgb, var(--dsw-alias-state-success-primary,#22c55e) 12%, transparent);color:var(--dsw-alias-state-success-primary,#22c55e)}.hR0bda_block{border-radius:var(--dsw-radius-xs,4px);background:var(--dsw-alias-bg-module-platform,#f5f6f7);max-height:200px;color:var(--dsw-alias-label-secondary,#61666b);white-space:pre-wrap;overflow-wrap:anywhere;margin:0;padding:8px 10px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;line-height:18px;overflow:auto}";
		const tagId$12 = "@nanmicoder/dsh-skills-hub/FrontmatterPanel.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$12) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@nanmicoder/dsh-skills-hub";
			tag.dataset.pluginCss = tagId$12;
			tag.textContent = css$12;
			document.head.appendChild(tag);
		}
		var FrontmatterPanel_module_css_default = {
			"block": "hR0bda_block",
			"chip": "hR0bda_chip",
			"chipOn": "hR0bda_chipOn",
			"chips": "hR0bda_chips",
			"count": "hR0bda_count",
			"head": "hR0bda_head",
			"key": "hR0bda_key",
			"list": "hR0bda_list",
			"panel": "hR0bda_panel",
			"row": "hR0bda_row",
			"text": "hR0bda_text",
			"title": "hR0bda_title",
			"value": "hR0bda_value"
		};
		//#endregion
		//#region lib/client/components/FrontmatterPanel.js
		/** Longest JSON we are willing to render inline, in characters. */
		const MAX_JSON_LENGTH = 600;
		/** Narrow an `unknown` frontmatter value to a plain object (arrays excluded). */
		function isRecord(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value);
		}
		/** Scalar rendering for anything that is not an array, object or block string. */
		function scalarText(value) {
			if (value === null || value === void 0) return "—";
			if (typeof value === "string") return value;
			if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return String(value);
			if (typeof value === "symbol") return value.description ?? "symbol";
			if (typeof value === "function") return "fn";
			return "—";
		}
		/** Objects go out as JSON; a pathological value must not fill the whole rail. */
		function jsonText(value) {
			try {
				const text = JSON.stringify(value, null, 2);
				if (text === void 0) return "—";
				return text.length > MAX_JSON_LENGTH ? `${text.slice(0, MAX_JSON_LENGTH)}…` : text;
			} catch {
				return "—";
			}
		}
		/** One value cell; the shape decides between a chip row, a code block and text. */
		function ValueView({ value }) {
			if (Array.isArray(value)) {
				if (value.length === 0) return (0, react_jsx_runtime.jsx)("span", {
					className: FrontmatterPanel_module_css_default.text,
					children: "—"
				});
				return (0, react_jsx_runtime.jsx)("span", {
					className: FrontmatterPanel_module_css_default.chips,
					children: value.map((item, index) => (0, react_jsx_runtime.jsx)("span", {
						className: FrontmatterPanel_module_css_default.chip,
						children: scalarText(item)
					}, `${String(index)}`))
				});
			}
			if (typeof value === "boolean") return (0, react_jsx_runtime.jsx)("span", {
				className: `${FrontmatterPanel_module_css_default.chip} ${value ? FrontmatterPanel_module_css_default.chipOn : ""}`,
				children: value ? "true" : "false"
			});
			if (typeof value === "string" && value.includes("\n")) return (0, react_jsx_runtime.jsx)("pre", {
				className: FrontmatterPanel_module_css_default.block,
				children: value
			});
			if (isRecord(value)) return (0, react_jsx_runtime.jsx)("pre", {
				className: FrontmatterPanel_module_css_default.block,
				children: jsonText(value)
			});
			return (0, react_jsx_runtime.jsx)("span", {
				className: FrontmatterPanel_module_css_default.text,
				children: scalarText(value)
			});
		}
		/**
		* Structured view of a SKILL.md frontmatter block.
		*
		* SKILL.md metadata is data, not prose: pushing it through the markdown
		* renderer turns a dozen short fields into a wall of setext headings. It is
		* also reference material rather than the document itself, so it renders as a
		* label/value list under its own heading, with the list itself scrolling once a
		* skill declares more than a screenful of keys.
		*
		* `data` is typed `unknown`-valued on purpose — it is upstream YAML, and every
		* cell is derived defensively rather than trusted.
		*/
		function FrontmatterPanel(props) {
			const { data } = props;
			const t = useT();
			const entries = Object.entries(data);
			if (entries.length === 0) return (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, {});
			return (0, react_jsx_runtime.jsxs)("section", {
				className: FrontmatterPanel_module_css_default.panel,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: FrontmatterPanel_module_css_default.head,
					children: [(0, react_jsx_runtime.jsx)("h3", {
						className: FrontmatterPanel_module_css_default.title,
						children: t("frontmatter")
					}), (0, react_jsx_runtime.jsx)("span", {
						className: FrontmatterPanel_module_css_default.count,
						children: entries.length
					})]
				}), (0, react_jsx_runtime.jsx)("dl", {
					className: FrontmatterPanel_module_css_default.list,
					children: entries.map(([key, value]) => (0, react_jsx_runtime.jsxs)("div", {
						className: FrontmatterPanel_module_css_default.row,
						children: [(0, react_jsx_runtime.jsx)("dt", {
							className: FrontmatterPanel_module_css_default.key,
							title: key,
							children: key
						}), (0, react_jsx_runtime.jsx)("dd", {
							className: FrontmatterPanel_module_css_default.value,
							children: (0, react_jsx_runtime.jsx)(ValueView, { value })
						})]
					}, key))
				})]
			});
		}
		//#endregion
		//#region \0dsh-css:src/client/components/SkillAvatar.module.css.mjs
		const css$11 = ".C6tuwq_image{object-fit:cover;border:1px solid var(--dsw-alias-border-l2,#0000001a);background:var(--dsw-alias-bg-module-platform,#f5f6f7);flex:none}.C6tuwq_letter{box-sizing:border-box;letter-spacing:-.02em;color:var(--dsw-alias-label-primary-inverted,#fff);user-select:none;box-shadow:inset 0 1px 0 color-mix(in srgb, var(--dsw-alias-label-primary-inverted,#fff) 12%, transparent);flex:none;justify-content:center;align-items:center;font-weight:700;line-height:1;display:inline-flex;overflow:hidden}.C6tuwq_tone1{background:linear-gradient(145deg, color-mix(in srgb, var(--dsw-alias-state-success-primary,#22c55e) 74%, var(--dsw-alias-label-primary,#0f1115)), color-mix(in srgb, var(--dsw-alias-state-success-primary,#22c55e) 48%, var(--dsw-alias-label-primary,#0f1115)))}.C6tuwq_tone2{background:linear-gradient(145deg, color-mix(in srgb, var(--dsw-alias-state-warn-primary,#f59e0b) 80%, var(--dsw-alias-label-primary,#0f1115)), color-mix(in srgb, var(--dsw-alias-state-warn-primary,#f59e0b) 54%, var(--dsw-alias-label-primary,#0f1115)))}.C6tuwq_tone5{background:linear-gradient(145deg, color-mix(in srgb, color-mix(in srgb, var(--dsw-alias-state-warn-primary,#f59e0b) 55%, var(--dsw-alias-state-success-primary,#22c55e)) 78%, var(--dsw-alias-label-primary,#0f1115)), color-mix(in srgb, color-mix(in srgb, var(--dsw-alias-state-warn-primary,#f59e0b) 55%, var(--dsw-alias-state-success-primary,#22c55e)) 50%, var(--dsw-alias-label-primary,#0f1115)))}.C6tuwq_tone0{background:linear-gradient(145deg, color-mix(in srgb, var(--dsw-alias-state-business-primary,#4176e6) 82%, var(--dsw-alias-label-primary,#0f1115)), color-mix(in srgb, var(--dsw-alias-state-business-primary,#4176e6) 56%, var(--dsw-alias-label-primary,#0f1115)))}.C6tuwq_tone4{background:linear-gradient(145deg, color-mix(in srgb, color-mix(in srgb, var(--dsw-alias-state-business-primary,#4176e6) 58%, var(--dsw-alias-state-success-primary,#22c55e)) 80%, var(--dsw-alias-label-primary,#0f1115)), color-mix(in srgb, color-mix(in srgb, var(--dsw-alias-state-business-primary,#4176e6) 58%, var(--dsw-alias-state-success-primary,#22c55e)) 52%, var(--dsw-alias-label-primary,#0f1115)))}.C6tuwq_tone3{background:linear-gradient(145deg, color-mix(in srgb, var(--dsw-alias-state-idle-primary,#d4d4d4) 62%, var(--dsw-alias-label-primary,#0f1115)), color-mix(in srgb, var(--dsw-alias-state-idle-primary,#d4d4d4) 38%, var(--dsw-alias-label-primary,#0f1115)))}";
		const tagId$11 = "@nanmicoder/dsh-skills-hub/SkillAvatar.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$11) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@nanmicoder/dsh-skills-hub";
			tag.dataset.pluginCss = tagId$11;
			tag.textContent = css$11;
			document.head.appendChild(tag);
		}
		var SkillAvatar_module_css_default = {
			"image": "C6tuwq_image",
			"letter": "C6tuwq_letter",
			"tone0": "C6tuwq_tone0",
			"tone1": "C6tuwq_tone1",
			"tone2": "C6tuwq_tone2",
			"tone3": "C6tuwq_tone3",
			"tone4": "C6tuwq_tone4",
			"tone5": "C6tuwq_tone5"
		};
		//#endregion
		//#region lib/client/components/SkillAvatar.js
		/** Palette slots; each maps to one `.toneN` class in the module stylesheet. */
		const TONE_COUNT = 6;
		/**
		* Per-source tone family. The `source` prop is otherwise unused by a letter
		* avatar, so it earns its place as the family selector: ClawHub entries read
		* warm, SkillHub entries read cool, and a mixed grid still shows at a glance
		* where a card came from. A locally authored skill has no marketplace family,
		* so its tile stays neutral rather than borrowing one.
		*/
		const SOURCE_TONES = {
			clawhub: [
				2,
				5,
				1
			],
			skillhub: [
				0,
				4,
				3
			],
			local: [3]
		};
		/** Class name per tone slot, resolved once so the render path stays trivial. */
		const TONE_CLASSES = [
			SkillAvatar_module_css_default["tone0"] ?? "",
			SkillAvatar_module_css_default["tone1"] ?? "",
			SkillAvatar_module_css_default["tone2"] ?? "",
			SkillAvatar_module_css_default["tone3"] ?? "",
			SkillAvatar_module_css_default["tone4"] ?? "",
			SkillAvatar_module_css_default["tone5"] ?? ""
		];
		/**
		* Deterministic palette index: the same name always keeps the same identity
		* color across sessions, pages and re-renders.
		*/
		function hashIndex(input) {
			let hash = 0;
			for (let i = 0; i < input.length; i++) hash = hash * 31 + input.charCodeAt(i) | 0;
			return Math.abs(hash) % TONE_COUNT;
		}
		/**
		* First visible character, uppercased. `Array.from` rather than `name[0]` so a
		* CJK or astral-plane initial is not cut in half by UTF-16 indexing.
		*/
		function initialOf(name) {
			const first = Array.from(name.trim())[0];
			return first ? first.toUpperCase() : "?";
		}
		/**
		* Skill icon tile.
		*
		* An `<img>` is rendered only for an `https:` URL: the string arrives from a
		* third-party catalogue, and allowing `javascript:` or `data:` here would turn
		* an upstream payload into script execution inside the DSH page.
		*/
		function SkillAvatar(props) {
			const { name, source, iconUrl, size } = props;
			const radius = Math.round(size * .24);
			if (iconUrl !== void 0 && iconUrl.startsWith("https://")) return (0, react_jsx_runtime.jsx)("img", {
				src: iconUrl,
				alt: "",
				width: size,
				height: size,
				loading: "lazy",
				decoding: "async",
				className: SkillAvatar_module_css_default.image,
				style: {
					width: size,
					height: size,
					borderRadius: radius
				}
			});
			const family = SOURCE_TONES[source];
			const tone = family[hashIndex(name) % family.length] ?? 0;
			return (0, react_jsx_runtime.jsx)("span", {
				"aria-hidden": "true",
				className: `${SkillAvatar_module_css_default.letter} ${TONE_CLASSES[tone] ?? ""}`,
				style: {
					width: size,
					height: size,
					borderRadius: radius,
					fontSize: Math.round(size * .4)
				},
				children: initialOf(name)
			});
		}
		//#endregion
		//#region lib/client/skill-markdown.js
		/**
		* Frontmatter handling for skill documents.
		*
		* A `SKILL.md` opens with a YAML block, and feeding that block to a markdown
		* renderer is not merely ugly — it is wrong: a lone `---` is a setext underline,
		* so the closing fence promotes the whole metadata block into one giant heading.
		* The block is split off here instead, so the UI can render it as structured
		* metadata (`FrontmatterPanel`) while the rest of the document goes to the
		* renderer. The approach mirrors the desktop project's `skillFrontmatter.ts`.
		*
		* The parser is a deliberately small YAML subset — scalars, inline and block
		* sequences, `|`/`>` block scalars, and one level of nested mapping that is kept
		* as the raw YAML it is — because skill frontmatter is flat by convention and a
		* full YAML engine is a dependency this browser bundle does not need. It never
		* throws: a document without a fence, or with an unterminated one, comes back as
		* body only.
		*/
		/** A fence closing the block; it must sit at column zero. */
		const CLOSING_FENCE = /^(?:---|\.\.\.)[ \t]*$/;
		/** Top-level `key:` or `key: value`. Indented lines belong to the value above. */
		const KEY_LINE = /^([A-Za-z0-9_$][\w.$-]*)[ \t]*:(?:[ \t]+(.*))?$/;
		/** `|`, `>`, optionally with chomping and indentation indicators. */
		const BLOCK_SCALAR = /^([|>])([-+]?)(\d*)$/;
		function isBlank(line) {
			return line.trim() === "";
		}
		/** Visual indentation width; a tab counts as two columns, as YAML's own rules do. */
		function indentWidth(line) {
			let width = 0;
			for (const char of line) if (char === " ") width += 1;
			else if (char === "	") width += 2;
			else break;
			return width;
		}
		/** One pair of surrounding quotes, with the escapes YAML defines for it. */
		function stripQuotes(raw) {
			if (raw.length >= 2) {
				const first = raw[0];
				const last = raw[raw.length - 1];
				if (first === "\"" && last === "\"") return {
					value: raw.slice(1, -1).replace(/\\"/g, "\"").replace(/\\\\/g, "\\"),
					quoted: true
				};
				if (first === "'" && last === "'") return {
					value: raw.slice(1, -1).replace(/''/g, "'"),
					quoted: true
				};
			}
			return {
				value: raw,
				quoted: false
			};
		}
		/** Drop a trailing ` # comment`, but only when it sits outside quotes. */
		function stripComment(raw) {
			let quote = null;
			for (let index = 0; index < raw.length; index++) {
				const char = raw[index];
				if (quote !== null) {
					if (char === quote) quote = null;
					continue;
				}
				if (char === "\"" || char === "'") {
					quote = char;
					continue;
				}
				if (char === "#" && (index === 0 || raw[index - 1] === " " || raw[index - 1] === "	")) return raw.slice(0, index);
			}
			return raw;
		}
		/** Scalars keep their YAML meaning where it is unambiguous, and stay text otherwise. */
		function coerceScalar(raw) {
			const trimmed = raw.trim();
			if (trimmed === "") return "";
			const { value, quoted } = stripQuotes(trimmed);
			if (quoted) return value;
			const lower = value.toLowerCase();
			if (lower === "true") return true;
			if (lower === "false") return false;
			if (lower === "null" || lower === "~") return null;
			if (/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value)) return Number(value);
			return value;
		}
		/** Split `[a, "b, c", d]` on top-level commas only. */
		function splitInlineSequence(inner) {
			const parts = [];
			let current = "";
			let quote = null;
			let depth = 0;
			for (const char of inner) {
				if (quote !== null) {
					current += char;
					if (char === quote) quote = null;
					continue;
				}
				if (char === "\"" || char === "'") {
					quote = char;
					current += char;
					continue;
				}
				if (char === "[" || char === "{") depth += 1;
				if (char === "]" || char === "}") depth -= 1;
				if (char === "," && depth === 0) {
					parts.push(current);
					current = "";
					continue;
				}
				current += char;
			}
			parts.push(current);
			return parts.map((part) => part.trim()).filter((part) => part !== "");
		}
		/**
		* Remove a block's common indentation and its blank edges.
		*
		* @param lines - the block's lines, verbatim.
		* @param folded - `>` joins the lines into one paragraph; `|` keeps them.
		*/
		function dedent(lines, folded) {
			const margin = lines.reduce((min, line) => isBlank(line) ? min : Math.min(min, indentWidth(line)), Number.MAX_SAFE_INTEGER);
			const dedented = lines.map((line) => isBlank(line) ? "" : line.slice(margin === Number.MAX_SAFE_INTEGER ? 0 : margin));
			while (dedented.length > 0 && isBlank(dedented[0] ?? "")) dedented.shift();
			while (dedented.length > 0 && isBlank(dedented[dedented.length - 1] ?? "")) dedented.pop();
			return folded ? dedented.join(" ").replace(/\s+/g, " ").trim() : dedented.join("\n");
		}
		/** Parse the top-level keys of one YAML block. Shapes this subset does not model stay verbatim. */
		function parseBlock(yaml) {
			const lines = yaml.split("\n");
			const result = {};
			let index = 0;
			while (index < lines.length) {
				const line = lines[index] ?? "";
				index += 1;
				if (isBlank(line) || line.trimStart().startsWith("#") || indentWidth(line) > 0) continue;
				const match = KEY_LINE.exec(line);
				if (match === null) continue;
				const key = match[1] ?? "";
				const inline = match[2] ?? "";
				const blockScalar = BLOCK_SCALAR.exec(inline.trim());
				if (blockScalar !== null) {
					const collected = [];
					while (index < lines.length) {
						const next = lines[index] ?? "";
						if (!isBlank(next) && indentWidth(next) === 0) break;
						collected.push(next);
						index += 1;
					}
					result[key] = dedent(collected, blockScalar[1] === ">");
					continue;
				}
				const value = stripComment(inline).trim();
				if (value !== "") {
					result[key] = value.startsWith("[") && value.endsWith("]") ? splitInlineSequence(value.slice(1, -1)).map(coerceScalar) : coerceScalar(value);
					continue;
				}
				const children = [];
				while (index < lines.length) {
					const next = lines[index] ?? "";
					if (!isBlank(next) && indentWidth(next) === 0) break;
					children.push(next);
					index += 1;
				}
				const meaningful = children.filter((entry) => !isBlank(entry) && !entry.trimStart().startsWith("#"));
				if (meaningful.length === 0) {
					result[key] = null;
					continue;
				}
				if (meaningful.every((entry) => entry.trimStart().startsWith("- "))) {
					result[key] = meaningful.map((entry) => coerceScalar(stripComment(entry.trimStart().slice(2))));
					continue;
				}
				result[key] = dedent(children, false);
			}
			return result;
		}
		/**
		* Parse a metadata block that has already been extracted — the Host bounds its
		* size before it reaches the browser, so this entry point works on that text.
		*
		* @param yaml - the block's text, without its fences.
		* @returns the parsed keys, or `null` when the block carries nothing to show.
		*/
		function parseSkillFrontmatter(yaml) {
			if (yaml.trim() === "") return null;
			try {
				const parsed = parseBlock(yaml.replace(/\r\n/g, "\n"));
				return Object.keys(parsed).length === 0 ? null : parsed;
			} catch {
				return null;
			}
		}
		/**
		* Separate a document's frontmatter from its body.
		*
		* @param markdown - the whole document.
		* @returns the parsed metadata (or `null`) plus the body to render.
		*/
		function splitSkillFrontmatter(markdown) {
			const lines = (markdown.startsWith("﻿") ? markdown.slice(1) : markdown).replace(/\r\n/g, "\n").split("\n");
			if (!/^---[ \t]*$/.test(lines[0] ?? "")) return {
				frontmatter: null,
				body: markdown
			};
			for (let index = 1; index < lines.length; index++) {
				if (!CLOSING_FENCE.test(lines[index] ?? "")) continue;
				const body = lines.slice(index + 1).join("\n").replace(/^\n+/, "");
				return {
					frontmatter: parseSkillFrontmatter(lines.slice(1, index).join("\n")),
					body
				};
			}
			return {
				frontmatter: null,
				body: markdown
			};
		}
		/** Frontmatter is metadata, not part of the skill's rendered instructions. */
		function stripSkillFrontmatter(markdown) {
			return splitSkillFrontmatter(markdown).body;
		}
		//#endregion
		//#region lib/client/components/SkillDetailShell.js
		/**
		* The detail surface shared by the market catalogue and the installed inventory
		* (design: "技能市场重构 – 详情页").
		*
		* Both pages answer the same question — "what is inside this skill?" — and the
		* only real difference is where the facts come from: an upstream provider or the
		* filesystem. The shell therefore owns everything that is *layout*: breadcrumb,
		* identity header, stats strip, underlined tabs, the grey canvas, and the
		* document/side-rail columns. Callers compose the header pieces and the active
		* tab's content, and keep their own tab state (the market page in
		* `MarketState`, the local page in component state).
		*/
		/** The shell's stylesheet, for callers composing shell-shaped fragments. */
		const detailStyles = SkillDetailShell_module_css_default;
		function SkillDetailShell(props) {
			const t = useT();
			const headingRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				headingRef.current?.focus();
			}, [props.focusKey]);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: SkillDetailShell_module_css_default.page,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: SkillDetailShell_module_css_default.top,
					children: [
						(0, react_jsx_runtime.jsxs)("nav", {
							className: SkillDetailShell_module_css_default.crumbs,
							"aria-label": t("breadcrumb"),
							children: [
								(0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: SkillDetailShell_module_css_default.crumbBack,
									onClick: props.onBack,
									children: [(0, react_jsx_runtime.jsx)(ArrowLeftIcon, { size: 14 }), props.backLabel]
								}),
								(0, react_jsx_runtime.jsx)("span", {
									"aria-hidden": "true",
									children: "/"
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: SkillDetailShell_module_css_default.crumbCurrent,
									children: props.name
								})
							]
						}),
						(0, react_jsx_runtime.jsxs)("header", {
							className: SkillDetailShell_module_css_default.hero,
							children: [
								props.avatar,
								(0, react_jsx_runtime.jsxs)("div", {
									className: SkillDetailShell_module_css_default.heroText,
									children: [
										(0, react_jsx_runtime.jsxs)("div", {
											className: SkillDetailShell_module_css_default.titleRow,
											children: [(0, react_jsx_runtime.jsx)("h1", {
												ref: headingRef,
												tabIndex: -1,
												className: SkillDetailShell_module_css_default.title,
												children: props.name
											}), props.version !== void 0 && props.version !== "" && (0, react_jsx_runtime.jsxs)("span", {
												className: SkillDetailShell_module_css_default.versionChip,
												children: ["v", props.version]
											})]
										}),
										props.meta !== void 0 && (0, react_jsx_runtime.jsx)("p", {
											className: SkillDetailShell_module_css_default.meta,
											children: props.meta
										}),
										props.summary !== void 0 && props.summary !== "" && (0, react_jsx_runtime.jsx)("p", {
											className: SkillDetailShell_module_css_default.summary,
											children: props.summary
										}),
										props.chips !== void 0 && (0, react_jsx_runtime.jsx)("div", {
											className: SkillDetailShell_module_css_default.chips,
											children: props.chips
										})
									]
								}),
								props.actions !== void 0 && (0, react_jsx_runtime.jsx)("div", {
									className: SkillDetailShell_module_css_default.actions,
									children: props.actions
								})
							]
						}),
						props.stats !== void 0 && props.stats.length > 0 && (0, react_jsx_runtime.jsx)("dl", {
							className: SkillDetailShell_module_css_default.stats,
							children: props.stats.map((stat) => (0, react_jsx_runtime.jsxs)("div", {
								className: SkillDetailShell_module_css_default.stat,
								children: [(0, react_jsx_runtime.jsx)("dt", { children: stat.label }), (0, react_jsx_runtime.jsx)("dd", { children: stat.value })]
							}, stat.label))
						}),
						(0, react_jsx_runtime.jsx)("div", {
							className: SkillDetailShell_module_css_default.tabs,
							role: "tablist",
							"aria-label": props.name,
							children: props.tabs.map((tab) => (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								role: "tab",
								id: `skills-hub-tab-${tab.key}`,
								"aria-selected": props.activeTab === tab.key,
								"aria-controls": `skills-hub-panel-${tab.key}`,
								className: SkillDetailShell_module_css_default.tab,
								onClick: () => props.onTabChange(tab.key),
								children: [tab.label, tab.badge]
							}, tab.key))
						})
					]
				}), (0, react_jsx_runtime.jsxs)("div", {
					className: SkillDetailShell_module_css_default.body,
					role: "tabpanel",
					id: `skills-hub-panel-${props.activeTab}`,
					"aria-labelledby": `skills-hub-tab-${props.activeTab}`,
					children: [props.notice, props.children]
				})]
			});
		}
		/** Document column plus side rail; the rail moves below on a narrow panel. */
		function DetailColumns(props) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: SkillDetailShell_module_css_default.columns,
				children: [(0, react_jsx_runtime.jsx)("div", {
					className: SkillDetailShell_module_css_default.main,
					children: props.main
				}), (0, react_jsx_runtime.jsx)("aside", {
					className: SkillDetailShell_module_css_default.side,
					children: props.side
				})]
			});
		}
		function SideCard(props) {
			return (0, react_jsx_runtime.jsxs)("section", {
				className: SkillDetailShell_module_css_default.sideCard,
				children: [(0, react_jsx_runtime.jsxs)("header", {
					className: SkillDetailShell_module_css_default.sideHeader,
					children: [(0, react_jsx_runtime.jsx)("h2", {
						className: SkillDetailShell_module_css_default.sideTitle,
						children: props.title
					}), props.extra]
				}), props.children]
			});
		}
		function InfoRow(props) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: SkillDetailShell_module_css_default.infoRow,
				children: [(0, react_jsx_runtime.jsx)("dt", { children: props.label }), (0, react_jsx_runtime.jsx)("dd", {
					className: props.mono === true ? SkillDetailShell_module_css_default.mono : void 0,
					children: props.value
				})]
			});
		}
		/** Count in a tab label ("文件 15"). */
		function TabCount(props) {
			return (0, react_jsx_runtime.jsx)("span", {
				className: SkillDetailShell_module_css_default.tabCount,
				children: props.value
			});
		}
		function Chip(props) {
			const tone = props.tone ?? "plain";
			return (0, react_jsx_runtime.jsx)("span", {
				className: `${SkillDetailShell_module_css_default.chip} ${tone === "plain" ? "" : SkillDetailShell_module_css_default[`chip_${tone}`] ?? ""}`,
				title: props.title,
				children: props.children
			});
		}
		const SECURITY_TONE = {
			verified: "ok",
			benign: "ok",
			unknown: "plain",
			flagged: "warn"
		};
		/** Upstream scan verdict, shared by the cards, the detail header and the install dialog. */
		function SecurityChip(props) {
			const t = useT();
			const tone = SECURITY_TONE[props.status];
			return (0, react_jsx_runtime.jsxs)(Chip, {
				tone,
				children: [tone === "warn" ? (0, react_jsx_runtime.jsx)(AlertIcon, { size: 13 }) : (0, react_jsx_runtime.jsx)(ShieldIcon, { size: 13 }), t(`${props.short === true ? "scanShort" : "scan"}.${props.status}`)]
			});
		}
		/**
		* Keeps the detail layout stable while its request is in flight: the same
		* boxes as the real page rather than a spinner, so the page changes shape once.
		*/
		function SkillDetailSkeleton({ onBack, backLabel }) {
			const t = useT();
			return (0, react_jsx_runtime.jsxs)("div", {
				className: SkillDetailShell_module_css_default.page,
				"aria-busy": "true",
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: SkillDetailShell_module_css_default.top,
					children: [
						(0, react_jsx_runtime.jsx)("nav", {
							className: SkillDetailShell_module_css_default.crumbs,
							children: (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: SkillDetailShell_module_css_default.crumbBack,
								onClick: onBack,
								children: [(0, react_jsx_runtime.jsx)(ArrowLeftIcon, { size: 14 }), backLabel ?? t("marketTab")]
							})
						}),
						(0, react_jsx_runtime.jsx)("div", {
							role: "status",
							"aria-label": t("loading"),
							children: (0, react_jsx_runtime.jsxs)("div", {
								className: SkillDetailShell_module_css_default.hero,
								"aria-hidden": "true",
								children: [(0, react_jsx_runtime.jsx)("span", { className: SkillDetailShell_module_css_default.skeletonAvatar }), (0, react_jsx_runtime.jsxs)("div", {
									className: SkillDetailShell_module_css_default.heroText,
									children: [
										(0, react_jsx_runtime.jsx)("span", { className: SkillDetailShell_module_css_default.skeletonTitle }),
										(0, react_jsx_runtime.jsx)("span", { className: SkillDetailShell_module_css_default.skeletonLine }),
										(0, react_jsx_runtime.jsx)("span", { className: SkillDetailShell_module_css_default.skeletonLine })
									]
								})]
							})
						}),
						(0, react_jsx_runtime.jsx)("div", {
							className: SkillDetailShell_module_css_default.tabs,
							"aria-hidden": "true"
						})
					]
				}), (0, react_jsx_runtime.jsx)("div", {
					className: SkillDetailShell_module_css_default.body,
					"aria-hidden": "true",
					children: (0, react_jsx_runtime.jsxs)("div", {
						className: SkillDetailShell_module_css_default.columns,
						children: [(0, react_jsx_runtime.jsx)("div", {
							className: SkillDetailShell_module_css_default.main,
							children: (0, react_jsx_runtime.jsx)("div", {
								className: SkillDetailShell_module_css_default.card,
								children: Array.from({ length: 9 }, (_, index) => (0, react_jsx_runtime.jsx)("span", { className: SkillDetailShell_module_css_default.skeletonLine }, index))
							})
						}), (0, react_jsx_runtime.jsx)("div", {
							className: SkillDetailShell_module_css_default.side,
							children: (0, react_jsx_runtime.jsx)("div", {
								className: SkillDetailShell_module_css_default.sideCard,
								children: Array.from({ length: 5 }, (_, index) => (0, react_jsx_runtime.jsx)("span", { className: SkillDetailShell_module_css_default.skeletonLine }, index))
							})
						})]
					})
				})]
			});
		}
		//#endregion
		//#region lib/client/components/SkillFiles.js
		/**
		* Files tab body, shared by the two detail pages.
		*
		* The market page lists provider file metadata and the local page lists the
		* bytes on disk, but both are the same control: a picker on the left, one
		* document on the right, and a copy button that confirms itself. The only
		* difference the caller keeps is how a selection is fetched.
		*
		* A markdown document opens *rendered*: SKILL.md is prose meant to be read, and
		* showing its source first answers a question nobody asked. Installing still has
		* to be a trust decision, though, so the raw bytes are one toggle away — with
		* line numbers and the copy button pointed at exactly what is on disk. Other
		* files have no rendered form and stay source-only.
		*/
		/** How long the copy button stays in its confirmed state. */
		const COPIED_RESET_MS$1 = 2e3;
		/**
		* A rendered markdown document: its metadata as structure, its body as prose.
		*
		* The split matters more than it looks: handed to the renderer, the closing
		* `---` of the frontmatter turns the whole block into one setext heading.
		*/
		function MarkdownFilePreview({ content }) {
			const split = (0, react.useMemo)(() => splitSkillFrontmatter(content), [content]);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: detailStyles.markdown,
				children: [split.frontmatter !== null && (0, react_jsx_runtime.jsx)("div", {
					className: detailStyles.frontmatter,
					children: (0, react_jsx_runtime.jsx)(FrontmatterPanel, { data: split.frontmatter })
				}), (0, react_jsx_runtime.jsx)(MarkdownView, { content: split.body })]
			});
		}
		function SkillFiles(props) {
			const { files, selected, loading, error = null, onSelect } = props;
			const t = useT();
			const [copied, setCopied] = (0, react.useState)(false);
			const [mode, setMode] = (0, react.useState)("preview");
			const resetTimer = (0, react.useRef)(void 0);
			(0, react.useEffect)(() => () => {
				if (resetTimer.current !== void 0) clearTimeout(resetTimer.current);
			}, []);
			const selectedPath = selected?.path ?? null;
			/** Only markdown has a rendered form; a toggle on a script or a JSON file would be a lie. */
			const renderable = selected !== null && selected.language === "markdown";
			(0, react.useEffect)(() => {
				setMode("preview");
			}, [selectedPath]);
			const copyFile = (0, react.useCallback)(() => {
				const content = selected?.content;
				if (content === void 0) return;
				(0, _deepseek_ai_dsh_client_ui_primitives.writeClipboard)(content).then((ok) => {
					if (!ok) return;
					setCopied(true);
					if (resetTimer.current !== void 0) clearTimeout(resetTimer.current);
					resetTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS$1);
				});
			}, [selected]);
			if (files.length === 0) return loading ? (0, react_jsx_runtime.jsxs)("p", {
				className: detailStyles.muted,
				role: "status",
				"aria-live": "polite",
				children: [
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
						state: "ongoing",
						size: 14
					}),
					" ",
					t("loading")
				]
			}) : (0, react_jsx_runtime.jsx)("p", {
				className: detailStyles.muted,
				children: t("noFiles")
			});
			return (0, react_jsx_runtime.jsxs)("div", {
				className: detailStyles.files,
				children: [(0, react_jsx_runtime.jsx)("ul", {
					className: detailStyles.fileList,
					children: files.map((meta) => {
						const active = meta.path === selectedPath;
						return (0, react_jsx_runtime.jsx)("li", { children: (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: `${detailStyles.fileItem} ${active ? detailStyles.fileItemActive : ""}`,
							"aria-current": active ? "true" : void 0,
							onClick: () => onSelect(meta.path),
							children: [
								(0, react_jsx_runtime.jsx)(FileIcon, {
									size: 14,
									className: detailStyles.fileIcon
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: detailStyles.filePath,
									title: meta.path,
									children: meta.path
								}),
								meta.tooBig === true && (0, react_jsx_runtime.jsx)("span", {
									className: detailStyles.fileFlag,
									children: t("fileTooLarge")
								}),
								(0, react_jsx_runtime.jsxs)("span", {
									className: detailStyles.fileMeta,
									children: [
										(0, _deepseek_ai_dsh_client_ui_primitives.fileSizeText)(meta.size),
										" · ",
										meta.language
									]
								})
							]
						}) }, meta.path);
					})
				}), (0, react_jsx_runtime.jsx)("div", {
					className: detailStyles.fileView,
					children: error !== null ? (0, react_jsx_runtime.jsxs)("p", {
						className: detailStyles.muted,
						role: "alert",
						children: [
							(0, react_jsx_runtime.jsx)(AlertIcon, { size: 14 }),
							" ",
							error
						]
					}) : selected === null ? loading ? (0, react_jsx_runtime.jsxs)("p", {
						className: detailStyles.muted,
						role: "status",
						"aria-live": "polite",
						children: [
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
								state: "ongoing",
								size: 14
							}),
							" ",
							t("loading")
						]
					}) : null : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						(0, react_jsx_runtime.jsxs)("div", {
							className: detailStyles.fileBar,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: detailStyles.fileBarPath,
									title: selected.path,
									children: selected.path
								}),
								renderable && (0, react_jsx_runtime.jsxs)("div", {
									className: detailStyles.viewToggle,
									role: "group",
									"aria-label": t("fileView"),
									children: [(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-pressed": mode === "preview",
										onClick: () => setMode("preview"),
										children: t("filePreview")
									}), (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										"aria-pressed": mode === "source",
										onClick: () => setMode("source"),
										children: t("fileSource")
									})]
								}),
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									size: "sm",
									className: detailStyles.copy,
									"aria-label": copied ? t("copied") : t("copy"),
									onClick: copyFile,
									icon: copied ? (0, react_jsx_runtime.jsx)(CheckIcon, { size: 14 }) : (0, react_jsx_runtime.jsx)(CopyIcon, { size: 14 }),
									children: copied ? t("copied") : t("copy")
								})
							]
						}),
						selected.truncated && (0, react_jsx_runtime.jsx)("p", {
							className: detailStyles.muted,
							children: t("fileTruncated")
						}),
						renderable && mode === "preview" ? (0, react_jsx_runtime.jsx)(MarkdownFilePreview, { content: selected.content }) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.CodeBlock, {
							code: selected.content,
							lang: selected.language,
							showHeader: false,
							lineNumbers: true,
							copyLabel: t("copy"),
							copiedLabel: t("copied")
						}),
						(0, react_jsx_runtime.jsx)("p", {
							className: detailStyles.srOnly,
							role: "status",
							"aria-live": "polite",
							children: copied ? t("copied") : ""
						})
					] })
				})]
			});
		}
		//#endregion
		//#region \0dsh-css:src/client/components/MarketSkillDetail.module.css.mjs
		const css$10 = ".JBU-lG_capabilities{border:1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary,#b25e00) 26%, transparent);background:color-mix(in srgb, var(--dsw-alias-state-warn-primary,#b25e00) 5%, var(--dsw-alias-bg-layer-1,#fff));border-radius:14px;padding:20px 22px}.JBU-lG_capHeader{flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px 16px;display:flex}.JBU-lG_capTitle{color:var(--dsw-alias-label-primary,#12141a);align-items:center;gap:8px;margin:0;font-size:16px;font-weight:700;line-height:24px;display:inline-flex}.JBU-lG_capGrid{grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;margin:14px 0 0;padding:0;list-style:none;display:grid}.JBU-lG_capTitle svg{color:var(--dsw-alias-state-warn-primary,#b25e00)}.JBU-lG_capCard{border:1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary,#b25e00) 26%, transparent);background:var(--dsw-alias-bg-layer-1,#fff);border-radius:10px;flex-direction:column;gap:4px;min-width:0;padding:12px 14px;display:flex}.JBU-lG_capCard strong{font-size:13px;font-weight:600;line-height:19px}.JBU-lG_capCard span{color:var(--dsw-alias-label-secondary,#4a4f5c);font-family:var(--dsw-font-mono,ui-monospace, \"SF Mono\", Menlo, monospace);overflow-wrap:anywhere;font-size:12px;line-height:18px}.JBU-lG_capLink{color:var(--dsw-alias-state-warn-label,#8a4b00)}.JBU-lG_capNote{color:var(--dsw-alias-label-tertiary,#6b7080);margin:12px 0 0;font-size:12px;line-height:18px}.JBU-lG_docHeader{border-bottom:1px solid var(--dsw-alias-border-l1,#eef0f3);color:var(--dsw-alias-label-tertiary,#6b7080);flex-wrap:wrap;justify-content:space-between;gap:4px 12px;margin-bottom:18px;padding-bottom:14px;font-size:12px;line-height:18px;display:flex}.JBU-lG_docBody{min-width:0;font-size:14px;line-height:1.7;position:relative}.JBU-lG_docCollapsed{max-height:720px;overflow:hidden}.JBU-lG_docCollapsed:after{content:\"\";background:linear-gradient(to bottom, transparent, var(--dsw-alias-bg-layer-1,#fff));pointer-events:none;height:96px;position:absolute;bottom:0;left:0;right:0}.JBU-lG_expand{border:1px solid var(--dsw-alias-border-l2,#e4e6eb);background:var(--dsw-alias-bg-layer-1,#fff);color:var(--dsw-alias-label-primary,#12141a);font:inherit;cursor:pointer;border-radius:10px;margin-top:16px;padding:8px 16px;font-size:14px;font-weight:600}.JBU-lG_expand:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#2f49d1);outline-offset:2px}.JBU-lG_expand:hover{background:color-mix(in srgb, var(--dsw-alias-label-primary,#12141a) 6%, transparent)}.JBU-lG_frontmatter{margin-top:20px}.JBU-lG_triggers{flex-direction:column;gap:10px;margin:0;padding:0;font-size:13px;line-height:20px;list-style:none;display:flex}.JBU-lG_triggers li{color:var(--dsw-alias-label-primary,#12141a);gap:10px;display:flex}.JBU-lG_triggerIndex{background:color-mix(in srgb, var(--dsw-alias-label-primary,#12141a) 6%, transparent);width:20px;height:20px;color:var(--dsw-alias-label-secondary,#4a4f5c);font-family:var(--dsw-font-mono,ui-monospace, \"SF Mono\", Menlo, monospace);text-align:center;border-radius:6px;flex:none;font-size:11px;line-height:20px}.JBU-lG_changelogText{color:var(--dsw-alias-label-secondary,#4a4f5c);white-space:pre-line;overflow-wrap:anywhere;margin:0;font-size:13px;line-height:1.65}.JBU-lG_reports{flex-direction:column;gap:0;margin:0;padding:0;list-style:none;display:flex}.JBU-lG_report{border-top:1px solid var(--dsw-alias-border-l1,#eef0f3);padding:14px 0}.JBU-lG_report:first-child{border-top:none;padding-top:0}.JBU-lG_reportHead{flex-wrap:wrap;justify-content:space-between;align-items:center;gap:6px 12px;display:flex}.JBU-lG_reportVendor{font-size:14px;font-weight:600}.JBU-lG_reportSummary{color:var(--dsw-alias-label-secondary,#4a4f5c);margin:8px 0 0;font-size:13px;line-height:1.65}.JBU-lG_report>a{margin-top:6px}.JBU-lG_release{flex-direction:column;gap:10px;display:flex}.JBU-lG_releaseHead{align-items:center;gap:10px;display:flex}.JBU-lG_linkRow{flex-wrap:wrap;align-items:center;gap:8px 20px;margin-top:16px;display:flex}.JBU-lG_linkRow>a{margin-top:0}.JBU-lG_linkRow>button{color:var(--dsw-alias-state-business-primary,#2f49d1)}";
		const tagId$10 = "@nanmicoder/dsh-skills-hub/MarketSkillDetail.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$10) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@nanmicoder/dsh-skills-hub";
			tag.dataset.pluginCss = tagId$10;
			tag.textContent = css$10;
			document.head.appendChild(tag);
		}
		var MarketSkillDetail_module_css_default = {
			"capCard": "JBU-lG_capCard",
			"capGrid": "JBU-lG_capGrid",
			"capHeader": "JBU-lG_capHeader",
			"capLink": "JBU-lG_capLink",
			"capNote": "JBU-lG_capNote",
			"capTitle": "JBU-lG_capTitle",
			"capabilities": "JBU-lG_capabilities",
			"changelogText": "JBU-lG_changelogText",
			"docBody": "JBU-lG_docBody",
			"docCollapsed": "JBU-lG_docCollapsed",
			"docHeader": "JBU-lG_docHeader",
			"expand": "JBU-lG_expand",
			"frontmatter": "JBU-lG_frontmatter",
			"linkRow": "JBU-lG_linkRow",
			"release": "JBU-lG_release",
			"releaseHead": "JBU-lG_releaseHead",
			"report": "JBU-lG_report",
			"reportHead": "JBU-lG_reportHead",
			"reportSummary": "JBU-lG_reportSummary",
			"reportVendor": "JBU-lG_reportVendor",
			"reports": "JBU-lG_reports",
			"triggerIndex": "JBU-lG_triggerIndex",
			"triggers": "JBU-lG_triggers"
		};
		//#endregion
		//#region lib/client/components/MarketSkillDetail.js
		/** Compact counts: 482069 → 482.1k. */
		function formatCount$1(value) {
			if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
			if (value >= 1e3) return `${(value / 1e3).toFixed(1)}k`;
			return String(value);
		}
		/** Upstream timestamps are epoch millis; render as an ISO date (stable across locales). */
		function formatDate(timestamp) {
			if (timestamp === void 0) return "";
			const date = new Date(timestamp);
			return Number.isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);
		}
		function formatBytes(bytes) {
			if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
			if (bytes >= 1024) return `${Math.round(bytes / 1024)} KB`;
			return `${bytes} B`;
		}
		/** Only absolute http(s) links from upstream may become an `href`. */
		function safeUrl(url) {
			return url !== void 0 && /^https?:\/\//i.test(url) ? url : void 0;
		}
		/** One capability, phrased with its evidence. */
		function capabilityText(t, capability) {
			const evidence = capability.evidence.join(capability.kind === "shell" ? " / " : "、");
			return {
				title: t(`cap.${capability.kind}`),
				detail: t(`cap.${capability.kind}.detail`, { evidence })
			};
		}
		/** Capabilities and triggers, derived once per detail. */
		function useSkillInsights(detail) {
			return (0, react.useMemo)(() => {
				const description = detail.descriptionFrontmatter?.["description"];
				return {
					capabilities: detectCapabilities({
						markdown: detail.description,
						frontmatter: detail.descriptionFrontmatter,
						files: detail.files
					}),
					triggers: extractTriggers(typeof description === "string" ? description : void 0)
				};
			}, [detail]);
		}
		function SkillDocument(props) {
			const { detail } = props;
			const t = useT();
			const bodyRef = (0, react.useRef)(null);
			const [expanded, setExpanded] = (0, react.useState)(false);
			const [overflows, setOverflows] = (0, react.useState)(false);
			const skillMd = detail.files.find((file) => file.path === "SKILL.md");
			(0, react.useLayoutEffect)(() => {
				const body = bodyRef.current;
				if (body !== null) setOverflows(body.scrollHeight > 800);
			}, [detail.description]);
			(0, react.useEffect)(() => setExpanded(false), [detail.id]);
			const collapsed = overflows && !expanded;
			return (0, react_jsx_runtime.jsxs)("section", {
				className: detailStyles.card,
				children: [
					(0, react_jsx_runtime.jsxs)("header", {
						className: MarketSkillDetail_module_css_default.docHeader,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: detailStyles.mono,
							children: "SKILL.md"
						}), (0, react_jsx_runtime.jsxs)("span", { children: [skillMd !== void 0 && `${formatBytes(skillMd.size)} · `, t("readingTime", { minutes: readingMinutes(detail.description) })] })]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						ref: bodyRef,
						className: `${MarketSkillDetail_module_css_default.docBody} ${collapsed ? MarketSkillDetail_module_css_default.docCollapsed : ""}`,
						children: [detail.description.trim() !== "" ? (0, react_jsx_runtime.jsx)(MarkdownView, { content: detail.description }) : (0, react_jsx_runtime.jsx)("p", {
							className: detailStyles.muted,
							children: detail.summary
						}), detail.descriptionFrontmatter !== void 0 && Object.keys(detail.descriptionFrontmatter).length > 0 && (0, react_jsx_runtime.jsx)("div", {
							className: MarketSkillDetail_module_css_default.frontmatter,
							children: (0, react_jsx_runtime.jsx)(FrontmatterPanel, { data: detail.descriptionFrontmatter })
						})]
					}),
					overflows && (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: MarketSkillDetail_module_css_default.expand,
						onClick: () => setExpanded((value) => !value),
						children: expanded ? t("collapse") : t("expand")
					})
				]
			});
		}
		function CapabilityPanel(props) {
			const t = useT();
			return (0, react_jsx_runtime.jsxs)("section", {
				className: MarketSkillDetail_module_css_default.capabilities,
				"aria-labelledby": "skills-hub-capabilities",
				children: [
					(0, react_jsx_runtime.jsxs)("header", {
						className: MarketSkillDetail_module_css_default.capHeader,
						children: [(0, react_jsx_runtime.jsxs)("h2", {
							id: "skills-hub-capabilities",
							className: MarketSkillDetail_module_css_default.capTitle,
							children: [(0, react_jsx_runtime.jsx)(AlertIcon, { size: 18 }), t("capTitle")]
						}), (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: `${detailStyles.linkButton} ${MarketSkillDetail_module_css_default.capLink}`,
							onClick: props.onReport,
							children: t("viewFullReport")
						})]
					}),
					(0, react_jsx_runtime.jsx)("ul", {
						className: MarketSkillDetail_module_css_default.capGrid,
						children: props.capabilities.map((capability) => {
							const text = capabilityText(t, capability);
							return (0, react_jsx_runtime.jsxs)("li", {
								className: MarketSkillDetail_module_css_default.capCard,
								children: [(0, react_jsx_runtime.jsx)("strong", { children: text.title }), (0, react_jsx_runtime.jsx)("span", { children: text.detail })]
							}, capability.kind);
						})
					}),
					(0, react_jsx_runtime.jsx)("p", {
						className: MarketSkillDetail_module_css_default.capNote,
						children: t("capNote")
					})
				]
			});
		}
		function Report(props) {
			const t = useT();
			const { report } = props;
			const url = safeUrl(report.reportUrl);
			const clean = /^(clean|benign|safe)/i.test(report.status);
			return (0, react_jsx_runtime.jsxs)("li", {
				className: MarketSkillDetail_module_css_default.report,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: MarketSkillDetail_module_css_default.reportHead,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: MarketSkillDetail_module_css_default.reportVendor,
							children: report.vendor
						}), (0, react_jsx_runtime.jsx)(Chip, {
							tone: clean ? "ok" : "warn",
							children: report.statusText
						})]
					}),
					report.summary !== void 0 && (0, react_jsx_runtime.jsx)("p", {
						className: MarketSkillDetail_module_css_default.reportSummary,
						children: report.summary
					}),
					url !== void 0 && (0, react_jsx_runtime.jsxs)("a", {
						className: detailStyles.link,
						href: url,
						target: "_blank",
						rel: "noreferrer noopener",
						children: [
							t("viewReport"),
							" ",
							(0, react_jsx_runtime.jsx)(ExternalLinkIcon, { size: 12 })
						]
					})
				]
			});
		}
		/**
		* Market skill detail page.
		*
		* Owns no data: tab, selected file and file contents live in `MarketState`.
		* Upstream facts (stats, version, scans, files) come from the live detail; the
		* catalogue adds category and the Chinese summary. "What this skill does" and
		* "when it triggers" are read off its own SKILL.md and file list by explicit
		* rules (`skill-insights.ts`) and are hidden when no rule fires.
		*/
		function MarketSkillDetail(props) {
			const { detail, state, controller } = props;
			const t = useT();
			const { capabilities, triggers } = useSkillInsights(detail);
			const installing = state.installingIds.has(detail.id);
			const author = detail.author.displayName ?? detail.author.handle;
			const reports = detail.securityReports ?? [];
			const pageUrl = safeUrl(detail.pageUrl);
			const category = state.categories.find((entry) => entry.key === detail.category);
			const english = t("category.lang") === "en";
			const categoryName = category === void 0 ? void 0 : english && category.nameEn || category.name;
			const snapshotAt = state.detailStatus?.fromCache === true ? state.detailStatus.fetchedAt : void 0;
			const updated = formatDate(detail.updatedAt);
			const changelogFile = detail.files.find((file) => /^changelog(\.md)?$/i.test(file.path));
			const tabs = [
				{
					key: "overview",
					label: t("overview")
				},
				{
					key: "files",
					label: t("files"),
					badge: (0, react_jsx_runtime.jsx)(TabCount, { value: detail.files.length })
				},
				{
					key: "security",
					label: t("securityReport"),
					badge: detail.securityStatus === "flagged" ? (0, react_jsx_runtime.jsx)("span", {
						className: detailStyles.tabDot,
						"aria-label": t("scan.flagged")
					}) : void 0
				},
				{
					key: "changelog",
					label: t("changelog")
				}
			];
			const stats = [
				{
					label: t("downloads"),
					value: formatCount$1(detail.stats.downloads)
				},
				...detail.stats.installs === void 0 ? [] : [{
					label: t("installs"),
					value: formatCount$1(detail.stats.installs)
				}],
				...detail.stats.stars === void 0 ? [] : [{
					label: t("stars"),
					value: formatCount$1(detail.stats.stars)
				}],
				{
					label: t("files"),
					value: String(detail.files.length)
				}
			];
			return (0, react_jsx_runtime.jsxs)(SkillDetailShell, {
				focusKey: detail.id,
				onBack: () => controller.closeDetail(),
				backLabel: t("marketTab"),
				avatar: (0, react_jsx_runtime.jsx)(SkillAvatar, {
					name: detail.name,
					source: detail.source,
					iconUrl: detail.iconUrl,
					size: 72
				}),
				name: detail.name,
				version: detail.version,
				meta: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					author !== "" && (0, react_jsx_runtime.jsxs)("span", { children: ["by ", (0, react_jsx_runtime.jsx)("strong", { children: author })] }),
					(0, react_jsx_runtime.jsx)("span", { children: t(`source.${detail.source}`) }),
					detail.license !== void 0 && detail.license !== "" && (0, react_jsx_runtime.jsx)("span", { children: detail.license }),
					updated !== "" && (0, react_jsx_runtime.jsx)("span", { children: t("updatedOn", { date: updated }) })
				] }),
				summary: detail.summary,
				chips: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					(0, react_jsx_runtime.jsx)(SecurityChip, { status: detail.securityStatus }),
					detail.featured === true && (0, react_jsx_runtime.jsx)(Chip, {
						tone: "blue",
						children: t("featured")
					}),
					categoryName !== void 0 && (0, react_jsx_runtime.jsx)(Chip, { children: categoryName }),
					detail.tags.slice(0, 2).map((tag) => (0, react_jsx_runtime.jsx)(Chip, { children: tag }, tag)),
					detail.requiresApiKey === true && (0, react_jsx_runtime.jsx)(Chip, { children: t("needsApiKey") })
				] }),
				actions: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					pageUrl !== void 0 && (0, react_jsx_runtime.jsxs)("a", {
						className: detailStyles.secondaryButton,
						href: pageUrl,
						target: "_blank",
						rel: "noreferrer noopener",
						children: [t("sourcePage"), (0, react_jsx_runtime.jsx)(ExternalLinkIcon, { size: 14 })]
					}),
					detail.installState === "installable" && (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: detailStyles.primaryButton,
						disabled: installing,
						onClick: () => controller.requestInstall(detail.id),
						children: [(0, react_jsx_runtime.jsx)(DownloadIcon, { size: 16 }), installing ? t("installing") : t("install")]
					}),
					detail.installState === "installed" && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("span", {
						className: detailStyles.installedMark,
						children: [(0, react_jsx_runtime.jsx)(CheckIcon, { size: 14 }), t("installed")]
					}), (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: detailStyles.secondaryButton,
						disabled: installing,
						onClick: () => void controller.uninstall(detail.id),
						children: [(0, react_jsx_runtime.jsx)(TrashIcon, { size: 14 }), t("uninstall")]
					})] }),
					detail.installState === "not-installable" && (0, react_jsx_runtime.jsx)("span", {
						className: detailStyles.notInstallable,
						title: detail.notInstallableReason,
						children: t("notInstallable")
					})
				] }),
				stats,
				tabs,
				activeTab: state.activeTab,
				onTabChange: (tab) => controller.setTab(tab),
				notice: snapshotAt === void 0 ? void 0 : (0, react_jsx_runtime.jsxs)("p", {
					className: detailStyles.snapshot,
					role: "note",
					children: [(0, react_jsx_runtime.jsx)("span", {
						title: formatStamp(snapshotAt),
						children: t("detailSnapshot", { age: formatAge(t, snapshotAt) })
					}), (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: detailStyles.linkButton,
						disabled: state.detailLoading,
						onClick: () => void controller.openDetail(detail.id, { refresh: true }),
						children: t("refreshSnapshot")
					})]
				}),
				children: [
					state.activeTab === "overview" && (0, react_jsx_runtime.jsx)(DetailColumns, {
						main: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [capabilities.length > 0 && (0, react_jsx_runtime.jsx)(CapabilityPanel, {
							capabilities,
							onReport: () => controller.setTab("security")
						}), (0, react_jsx_runtime.jsx)(SkillDocument, { detail })] }),
						side: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							triggers.length > 0 && (0, react_jsx_runtime.jsx)(SideCard, {
								title: t("whenToUse"),
								children: (0, react_jsx_runtime.jsx)("ol", {
									className: MarketSkillDetail_module_css_default.triggers,
									children: triggers.map((trigger, index) => (0, react_jsx_runtime.jsxs)("li", { children: [(0, react_jsx_runtime.jsx)("span", {
										className: MarketSkillDetail_module_css_default.triggerIndex,
										children: index + 1
									}), (0, react_jsx_runtime.jsx)("span", { children: trigger })] }, trigger))
								})
							}),
							(0, react_jsx_runtime.jsx)(SideCard, {
								title: t("info"),
								children: (0, react_jsx_runtime.jsxs)("dl", {
									className: detailStyles.info,
									children: [
										author !== "" && (0, react_jsx_runtime.jsx)(InfoRow, {
											label: t("author"),
											value: author
										}),
										(0, react_jsx_runtime.jsx)(InfoRow, {
											label: t("filter.source"),
											value: t(`source.${detail.source}`)
										}),
										categoryName !== void 0 && (0, react_jsx_runtime.jsx)(InfoRow, {
											label: t("category.label"),
											value: categoryName
										}),
										detail.version !== void 0 && detail.version !== "" && (0, react_jsx_runtime.jsx)(InfoRow, {
											label: t("version"),
											value: `v${detail.version}`,
											mono: true
										}),
										detail.license !== void 0 && detail.license !== "" && (0, react_jsx_runtime.jsx)(InfoRow, {
											label: t("license"),
											value: detail.license
										}),
										updated !== "" && (0, react_jsx_runtime.jsx)(InfoRow, {
											label: t("updated"),
											value: updated,
											mono: true
										})
									]
								})
							}),
							detail.changelog !== void 0 && (0, react_jsx_runtime.jsxs)(SideCard, {
								title: t("latestUpdate"),
								extra: detail.changelog.version === void 0 ? void 0 : (0, react_jsx_runtime.jsx)("span", {
									className: detailStyles.mono,
									children: detail.changelog.version
								}),
								children: [(0, react_jsx_runtime.jsx)("p", {
									className: MarketSkillDetail_module_css_default.changelogText,
									children: detail.changelog.text
								}), (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: detailStyles.linkButton,
									onClick: () => controller.setTab("changelog"),
									children: t("fullChangelog")
								})]
							})
						] })
					}),
					state.activeTab === "files" && (0, react_jsx_runtime.jsx)("section", {
						className: detailStyles.card,
						children: (0, react_jsx_runtime.jsx)(SkillFiles, {
							files: detail.files,
							selected: state.file,
							loading: state.fileLoading,
							onSelect: (path) => void controller.selectFile(path)
						})
					}),
					state.activeTab === "security" && (0, react_jsx_runtime.jsxs)("div", {
						className: detailStyles.stack,
						children: [capabilities.length > 0 && (0, react_jsx_runtime.jsx)(CapabilityPanel, {
							capabilities,
							onReport: () => controller.setTab("files")
						}), (0, react_jsx_runtime.jsxs)("section", {
							className: detailStyles.card,
							children: [
								(0, react_jsx_runtime.jsx)("h2", {
									className: detailStyles.cardTitle,
									children: t("scanReports")
								}),
								reports.length > 0 ? (0, react_jsx_runtime.jsx)("ul", {
									className: MarketSkillDetail_module_css_default.reports,
									children: reports.map((report) => (0, react_jsx_runtime.jsx)(Report, { report }, `${report.vendor}:${report.status}`))
								}) : (0, react_jsx_runtime.jsx)("p", {
									className: detailStyles.muted,
									children: t("noReports")
								}),
								(0, react_jsx_runtime.jsx)("p", {
									className: MarketSkillDetail_module_css_default.capNote,
									children: t("scanDisclaimer")
								})
							]
						})]
					}),
					state.activeTab === "changelog" && (0, react_jsx_runtime.jsxs)("section", {
						className: detailStyles.card,
						children: [
							(0, react_jsx_runtime.jsx)("h2", {
								className: detailStyles.cardTitle,
								children: t("changelog")
							}),
							detail.changelog !== void 0 ? (0, react_jsx_runtime.jsxs)("article", {
								className: MarketSkillDetail_module_css_default.release,
								children: [(0, react_jsx_runtime.jsxs)("header", {
									className: MarketSkillDetail_module_css_default.releaseHead,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: detailStyles.versionChip,
										children: detail.changelog.version ?? detail.version ?? ""
									}), detail.changelog.publishedAt !== void 0 && (0, react_jsx_runtime.jsx)("span", {
										className: detailStyles.muted,
										children: formatDate(detail.changelog.publishedAt)
									})]
								}), (0, react_jsx_runtime.jsx)("p", {
									className: MarketSkillDetail_module_css_default.changelogText,
									children: detail.changelog.text
								})]
							}) : (0, react_jsx_runtime.jsx)("p", {
								className: detailStyles.muted,
								children: t("noChangelog")
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: MarketSkillDetail_module_css_default.linkRow,
								children: [changelogFile !== void 0 && (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: detailStyles.linkButton,
									onClick: () => {
										controller.setTab("files");
										controller.selectFile(changelogFile.path);
									},
									children: t("openChangelogFile", { path: changelogFile.path })
								}), pageUrl !== void 0 && (0, react_jsx_runtime.jsxs)("a", {
									className: detailStyles.link,
									href: pageUrl,
									target: "_blank",
									rel: "noreferrer noopener",
									children: [
										t("olderVersions"),
										" ",
										(0, react_jsx_runtime.jsx)(ExternalLinkIcon, { size: 12 })
									]
								})]
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region \0dsh-css:src/client/components/InstallConfirmDialog.module.css.mjs
		const css$9 = ".UTdxCa_body{min-width:0;color:var(--dsw-alias-label-primary,#12141a);flex-direction:column;gap:16px;display:flex}.UTdxCa_identity{align-items:center;gap:12px;display:flex}.UTdxCa_identityText{color:var(--dsw-alias-label-secondary,#4a4f5c);margin:0;font-size:13px;line-height:20px}.UTdxCa_warning{border:1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary,#b25e00) 26%, transparent);background:color-mix(in srgb, var(--dsw-alias-state-warn-primary,#b25e00) 6%, var(--dsw-alias-bg-layer-1,#fff));color:var(--dsw-alias-state-warn-label,#8a4b00);border-radius:10px;gap:8px;margin:0;padding:12px 14px;font-size:13px;line-height:20px;display:flex}.UTdxCa_warningIcon{flex:none;margin-top:2px}.UTdxCa_section{flex-direction:column;gap:8px;display:flex}.UTdxCa_sectionTitle{margin:0;font-size:13px;font-weight:600;line-height:20px}.UTdxCa_capabilities{border:1px solid var(--dsw-alias-border-l2,#e4e6eb);border-radius:10px;margin:0;padding:0;list-style:none}.UTdxCa_capability{border-top:1px solid var(--dsw-alias-border-l1,#eef0f3);justify-content:space-between;align-items:center;gap:12px;padding:10px 14px;font-size:13px;line-height:20px;display:flex}.UTdxCa_capability:first-child{border-top:none}.UTdxCa_capabilityText{flex-direction:column;min-width:0;display:flex}.UTdxCa_capabilityDetail{color:var(--dsw-alias-label-tertiary,#6b7080);font-family:var(--dsw-font-mono,ui-monospace, Menlo, monospace);text-overflow:ellipsis;white-space:nowrap;font-size:12px;line-height:18px;overflow:hidden}.UTdxCa_level{flex:none;font-size:12px;font-weight:600}.UTdxCa_level_high{color:var(--dsw-alias-state-warn-label,#8a4b00)}.UTdxCa_level_medium{color:var(--dsw-alias-label-secondary,#4a4f5c)}.UTdxCa_level_low{color:var(--dsw-alias-label-tertiary,#6b7080)}.UTdxCa_location{border:1px solid var(--dsw-alias-border-l2,#e4e6eb);color:var(--dsw-alias-label-secondary,#4a4f5c);font-family:var(--dsw-font-mono,ui-monospace, Menlo, monospace);overflow-wrap:anywhere;border-radius:10px;align-items:center;gap:8px;margin:0;padding:10px 14px;font-size:12px;line-height:18px;display:flex}.UTdxCa_note{color:var(--dsw-alias-label-tertiary,#6b7080);margin:0;font-size:12px;line-height:18px}.UTdxCa_ack{cursor:pointer;align-items:flex-start;gap:10px;font-size:13px;line-height:20px;display:flex}.UTdxCa_ack input{width:16px;height:16px;accent-color:var(--dsw-alias-label-primary,#12141a);flex:none;margin:2px 0 0}.UTdxCa_actions{justify-content:flex-end;gap:10px;display:flex}.UTdxCa_primary,.UTdxCa_secondary{height:40px;font:inherit;cursor:pointer;border-radius:10px;align-items:center;gap:8px;padding:0 18px;font-size:14px;font-weight:600;display:inline-flex}.UTdxCa_primary{background:var(--dsw-alias-label-primary,#12141a);color:var(--dsw-alias-bg-layer-1,#fff);border:none}.UTdxCa_secondary{border:1px solid var(--dsw-alias-border-l2,#e4e6eb);background:var(--dsw-alias-bg-layer-1,#fff);color:var(--dsw-alias-label-primary,#12141a)}.UTdxCa_primary:disabled,.UTdxCa_secondary:disabled{cursor:default;opacity:.4}.UTdxCa_primary:focus-visible,.UTdxCa_secondary:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#2f49d1);outline-offset:2px}";
		const tagId$9 = "@nanmicoder/dsh-skills-hub/InstallConfirmDialog.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$9) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@nanmicoder/dsh-skills-hub";
			tag.dataset.pluginCss = tagId$9;
			tag.textContent = css$9;
			document.head.appendChild(tag);
		}
		var InstallConfirmDialog_module_css_default = {
			"ack": "UTdxCa_ack",
			"actions": "UTdxCa_actions",
			"body": "UTdxCa_body",
			"capabilities": "UTdxCa_capabilities",
			"capability": "UTdxCa_capability",
			"capabilityDetail": "UTdxCa_capabilityDetail",
			"capabilityText": "UTdxCa_capabilityText",
			"identity": "UTdxCa_identity",
			"identityText": "UTdxCa_identityText",
			"level": "UTdxCa_level",
			"level_high": "UTdxCa_level_high",
			"level_low": "UTdxCa_level_low",
			"level_medium": "UTdxCa_level_medium",
			"location": "UTdxCa_location",
			"note": "UTdxCa_note",
			"primary": "UTdxCa_primary",
			"secondary": "UTdxCa_secondary",
			"section": "UTdxCa_section",
			"sectionTitle": "UTdxCa_sectionTitle",
			"warning": "UTdxCa_warning",
			"warningIcon": "UTdxCa_warningIcon"
		};
		//#endregion
		//#region lib/client/components/InstallConfirmDialog.js
		/** `source:slug` → the directory name the installer will create. */
		function slugOf(id) {
			const separator = id.indexOf(":");
			return separator >= 0 ? id.slice(separator + 1) : id;
		}
		function CapabilityList(props) {
			const t = useT();
			const { capabilities } = useSkillInsights(props.detail);
			if (capabilities.length === 0) return null;
			return (0, react_jsx_runtime.jsxs)("section", {
				className: InstallConfirmDialog_module_css_default.section,
				children: [(0, react_jsx_runtime.jsx)("h3", {
					className: InstallConfirmDialog_module_css_default.sectionTitle,
					children: t("willGet")
				}), (0, react_jsx_runtime.jsx)("ul", {
					className: InstallConfirmDialog_module_css_default.capabilities,
					children: capabilities.map((capability) => {
						const text = capabilityText(t, capability);
						return (0, react_jsx_runtime.jsxs)("li", {
							className: InstallConfirmDialog_module_css_default.capability,
							children: [(0, react_jsx_runtime.jsxs)("span", {
								className: InstallConfirmDialog_module_css_default.capabilityText,
								children: [(0, react_jsx_runtime.jsx)("span", { children: text.title }), (0, react_jsx_runtime.jsx)("span", {
									className: InstallConfirmDialog_module_css_default.capabilityDetail,
									children: text.detail
								})]
							}), (0, react_jsx_runtime.jsx)("span", {
								className: `${InstallConfirmDialog_module_css_default.level} ${InstallConfirmDialog_module_css_default[`level_${capability.level}`] ?? ""}`,
								children: t(`level.${capability.level}`)
							})]
						}, capability.kind);
					})
				})]
			});
		}
		/**
		* Install confirmation (design: install dialog of the detail page).
		*
		* Mounted only while a confirmation is pending. A skill that is not scanned
		* clean (flagged or unknown) needs an explicit acknowledgement before the
		* confirm button arms: installing is a trust decision about a third party, and
		* the dialog says so instead of making it a reflex click. Escape and mask-click
		* come from `Modal`; while `busy` both are neutralised, because an install in
		* flight cannot be recalled.
		*/
		function InstallConfirmDialog(props) {
			const { skill, busy, onCancel, onConfirm, open = true } = props;
			const t = useT();
			const ackId = (0, react.useId)();
			const [acknowledged, setAcknowledged] = (0, react.useState)(false);
			(0, react.useEffect)(() => setAcknowledged(false), [skill.id]);
			const sourceLabel = t(`source.${skill.source}`);
			const risky = skill.securityStatus === "unknown" || skill.securityStatus === "flagged";
			const armed = !busy && (!risky || acknowledged);
			const meta = [
				sourceLabel,
				skill.authorName,
				skill.version ? `v${skill.version}` : ""
			].filter(Boolean).join(" · ");
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open,
				onClose: busy ? () => void 0 : onCancel,
				title: t("installTitle", { name: skill.name }),
				closeLabel: t("dismiss"),
				description: meta,
				footer: (0, react_jsx_runtime.jsxs)("div", {
					className: InstallConfirmDialog_module_css_default.actions,
					children: [(0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: InstallConfirmDialog_module_css_default.secondary,
						disabled: busy,
						onClick: onCancel,
						children: t("cancel")
					}), (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: InstallConfirmDialog_module_css_default.primary,
						disabled: !armed,
						onClick: onConfirm,
						children: [(0, react_jsx_runtime.jsx)(DownloadIcon, { size: 16 }), busy ? t("installing") : t("confirmInstall")]
					})]
				}),
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: InstallConfirmDialog_module_css_default.body,
					children: [
						(0, react_jsx_runtime.jsxs)("div", {
							className: InstallConfirmDialog_module_css_default.identity,
							children: [(0, react_jsx_runtime.jsx)(SkillAvatar, {
								name: skill.name,
								source: skill.source,
								iconUrl: skill.iconUrl,
								size: 48
							}), (0, react_jsx_runtime.jsx)("p", {
								className: InstallConfirmDialog_module_css_default.identityText,
								children: t("installConfirmMessage", {
									name: skill.name,
									source: sourceLabel
								})
							})]
						}),
						risky && (0, react_jsx_runtime.jsxs)("p", {
							className: InstallConfirmDialog_module_css_default.warning,
							role: "note",
							children: [(0, react_jsx_runtime.jsx)(AlertIcon, {
								size: 16,
								className: InstallConfirmDialog_module_css_default.warningIcon
							}), (0, react_jsx_runtime.jsx)("span", { children: t(skill.securityStatus === "flagged" ? "installWarnFlagged" : "installWarnUnknown") })]
						}),
						skill.detail !== void 0 && (0, react_jsx_runtime.jsx)(CapabilityList, { detail: skill.detail }),
						(0, react_jsx_runtime.jsxs)("section", {
							className: InstallConfirmDialog_module_css_default.section,
							children: [(0, react_jsx_runtime.jsx)("h3", {
								className: InstallConfirmDialog_module_css_default.sectionTitle,
								children: t("installLocation")
							}), (0, react_jsx_runtime.jsxs)("p", {
								className: InstallConfirmDialog_module_css_default.location,
								children: [(0, react_jsx_runtime.jsx)(FolderIcon, { size: 14 }), (0, react_jsx_runtime.jsxs)("span", { children: [
									"…/skills/",
									slugOf(skill.id).toLowerCase(),
									"/"
								] })]
							})]
						}),
						skill.snapshotAt !== void 0 && (0, react_jsx_runtime.jsx)("p", {
							className: InstallConfirmDialog_module_css_default.note,
							role: "note",
							title: formatStamp(skill.snapshotAt),
							children: t("installSnapshot", { age: formatAge(t, skill.snapshotAt) })
						}),
						risky && (0, react_jsx_runtime.jsxs)("label", {
							className: InstallConfirmDialog_module_css_default.ack,
							htmlFor: ackId,
							children: [(0, react_jsx_runtime.jsx)("input", {
								id: ackId,
								type: "checkbox",
								checked: acknowledged,
								disabled: busy,
								onChange: (event) => setAcknowledged(event.currentTarget.checked)
							}), (0, react_jsx_runtime.jsx)("span", { children: t("ack") })]
						})
					]
				})
			});
		}
		//#endregion
		//#region lib/client/api.js
		/**
		* Skills Hub HTTP client (browser half).
		*
		* Every request goes to the Host surface documented in docs/CONTRACT.md §5.2:
		* one prefix route under `/api/skills-hub`, JSON in and JSON out, errors always
		* shaped `{ error: { code, message } }`.
		*
		* Client purity: this module imports *types only* from the shared wire layer —
		* never a value from the Host's `src/market/*`, which would drag Node code into
		* the browser bundle (contract §2).
		*/
		/**
		* Host route prefix (docs/CONTRACT.md §5.2 `ROUTE_PREFIX`).
		*
		* Restated as a literal rather than imported: `ROUTE_PREFIX` is a runtime value
		* of a Node module, and a value import would both fail the client purity gate
		* and inline a second copy of the Host's module graph.
		*/
		const API_BASE = "/api/skills-hub";
		/** One failure from the Skills Hub surface (transport, HTTP, or malformed body). */
		var SkillsHubApiError = class extends Error {
			/** Host error code (`MARKET_ERROR_CODES` value, `BAD_REQUEST`, …) or a client-side code. */
			code;
			/** HTTP status; `0` when the request never reached the Host. */
			status;
			constructor(code, status, message) {
				super(message);
				this.name = "SkillsHubApiError";
				this.code = code;
				this.status = status;
			}
		};
		/** Client-side code for a request that never reached the Host (offline, DNS, CORS). */
		const NETWORK_ERROR_CODE = "NETWORK_ERROR";
		/** Code the Host uses for a successful response whose body is not the promised JSON (contract §5.2). */
		const BAD_RESPONSE_CODE = "MARKET_UPSTREAM_BAD_RESPONSE";
		/**
		* Whether a rejection is an aborted request.
		*
		* `AbortError` is control flow, not a failure: the controller aborts superseded
		* requests on purpose, and surfacing one as a user-facing error would put a
		* spurious banner in front of a perfectly healthy panel. Checked by `name`
		* (not `instanceof`) because an abort may cross realms (iframes, workers).
		* Exported so the state layer applies the exact same rule.
		*/
		function isAbortError(error) {
			return typeof error === "object" && error !== null && error.name === "AbortError";
		}
		/** `fetch` wrapper turning every failure mode into either an abort or a `SkillsHubApiError`. */
		async function send(url, init) {
			try {
				return await fetch(url, init);
			} catch (error) {
				if (isAbortError(error)) throw error;
				throw new SkillsHubApiError(NETWORK_ERROR_CODE, 0, error instanceof Error ? error.message : String(error));
			}
		}
		/** Parse the Host's `{ error: { code, message } }` envelope, degrading to the status line. */
		async function toApiError(response) {
			let code = `HTTP_${response.status}`;
			let message = `HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ""}`;
			try {
				const envelope = (await response.json())?.error;
				if (envelope && typeof envelope.code === "string" && envelope.code !== "") code = envelope.code;
				if (envelope && typeof envelope.message === "string" && envelope.message !== "") message = envelope.message;
			} catch {}
			return new SkillsHubApiError(code, response.status, message);
		}
		/** Decode a successful JSON body, mapping a malformed one onto the Host's bad-response code. */
		async function toJson(response) {
			try {
				return await response.json();
			} catch {
				throw new SkillsHubApiError(BAD_RESPONSE_CODE, response.status, "The Skills Hub returned a response that is not valid JSON");
			}
		}
		async function getJson(path, signal) {
			const response = await send(`${API_BASE}${path}`, {
				method: "GET",
				credentials: "same-origin",
				headers: { accept: "application/json" },
				signal
			});
			if (!response.ok) throw await toApiError(response);
			return toJson(response);
		}
		async function postJson(path, body) {
			const response = await send(`${API_BASE}${path}`, {
				method: "POST",
				credentials: "same-origin",
				headers: {
					accept: "application/json",
					"content-type": "application/json"
				},
				body: JSON.stringify(body)
			});
			if (!response.ok) throw await toApiError(response);
			return toJson(response);
		}
		/** Split a `source:slug` skill id, rejecting anything the Host routes cannot address. */
		function parseMarketId(id) {
			const separator = id.indexOf(":");
			const source = separator > 0 ? id.slice(0, separator) : "";
			const slug = separator > 0 ? id.slice(separator + 1) : "";
			if ((source === "clawhub" || source === "skillhub") && slug !== "") return {
				source,
				slug
			};
			throw new SkillsHubApiError("BAD_REQUEST", 400, `"${id}" is not a market skill id (expected "<source>:<slug>")`);
		}
		/** Search the catalogue (market sources) — the remote list page. */
		async function fetchMarketList(query, signal, options = {}) {
			const search = new URLSearchParams();
			const q = query.q?.trim();
			if (q) search.set("q", q);
			if (query.scope === "market") search.set("scope", "market");
			else if (query.category && query.category !== "all") search.set("category", query.category);
			if (query.source !== "all") search.set("source", query.source);
			if (query.security !== "all") search.set("security", query.security);
			if (query.installed !== "all") search.set("installed", query.installed);
			if (query.cursor) search.set("cursor", query.cursor);
			if (typeof query.limit === "number" && Number.isFinite(query.limit)) search.set("limit", String(query.limit));
			if (options.refresh === true) search.set("refresh", "1");
			const suffix = search.toString();
			return getJson(`/skills${suffix === "" ? "" : `?${suffix}`}`, signal);
		}
		/** The category bar's entries (curated catalogue), with the snapshot's provenance. */
		async function fetchMarketCategories(signal) {
			return getJson("/categories", signal);
		}
		/** One skill's full detail plus the health of the source that served it. */
		async function fetchSkillDetail(id, signal, options = {}) {
			const { source, slug } = parseMarketId(id);
			const search = new URLSearchParams();
			if (options.refresh === true) search.set("refresh", "1");
			if (options.owner) search.set("owner", options.owner);
			const suffix = search.size > 0 ? `?${search.toString()}` : "";
			return getJson(`/skills/${source}/${encodeURIComponent(slug)}${suffix}`, signal);
		}
		/** One file of a skill, for the Files tab. */
		async function fetchSkillFile(id, path, signal, owner) {
			const { source, slug } = parseMarketId(id);
			const ownerParam = owner ? `&owner=${encodeURIComponent(owner)}` : "";
			return (await getJson(`/skills/${source}/${encodeURIComponent(slug)}/file?path=${encodeURIComponent(path)}${ownerParam}`, signal)).file;
		}
		/**
		* Every skill DSH can currently see, including directories this plugin did not
		* install (`managed: false`). This is the local index behind the "installed"
		* filter — no upstream request is involved.
		*/
		async function fetchInstalled(signal) {
			return (await getJson("/installed", signal)).items;
		}
		/** Install a market skill into the local skills directory. */
		async function installSkill(id, owner) {
			const payload = await postJson("/install", owner ? {
				id,
				owner
			} : { id });
			return {
				installedPath: payload.installedPath,
				skill: payload.skill
			};
		}
		/** Remove a skill this plugin installed (the Host refuses unmanaged directories). */
		async function uninstallSkill(id) {
			const payload = await postJson("/uninstall", { id });
			return {
				removedPath: payload.removedPath,
				skill: payload.skill
			};
		}
		/** Preview the exact local copy without consulting a market provider. */
		function fetchInstalledDetail(key, signal) {
			return getJson(`/installed/detail?key=${encodeURIComponent(key)}`, signal);
		}
		/** One file of an installed skill; the Host validates the key and contains the path. */
		async function fetchInstalledFile(key, path, signal) {
			return (await getJson(`/installed/file?key=${encodeURIComponent(key)}&path=${encodeURIComponent(path)}`, signal)).file;
		}
		/** Remove a specifically selected local entry after the management UI confirmation. */
		function removeInstalled(key) {
			return postJson("/installed/uninstall", { key });
		}
		//#endregion
		//#region \0dsh-css:src/client/components/InstalledSkillDetail.module.css.mjs
		const css$8 = "._4PqW5a_pathRow{border:1px solid var(--dsw-alias-border-l2,#e4e6eb);background:var(--dsw-alias-bg-layer-1,#fff);border-radius:12px;align-items:center;gap:10px;min-width:0;padding:10px 14px;display:flex}._4PqW5a_pathIcon{color:var(--dsw-alias-label-tertiary,#81858c);flex:none}._4PqW5a_pathText{min-width:0;color:var(--dsw-alias-label-secondary,#61666b);font-family:var(--dsw-font-mono,ui-monospace, SFMono-Regular, Menlo, monospace);overflow-wrap:anywhere;flex:1;font-size:12px;line-height:18px}._4PqW5a_pathCopy{border:1px solid var(--dsw-alias-border-l2,#e4e6eb);background:var(--dsw-alias-bg-layer-1,#fff);height:30px;color:var(--dsw-alias-label-primary,#12141a);font:inherit;cursor:pointer;border-radius:8px;flex:none;align-items:center;gap:6px;padding:0 10px;font-size:12px;display:inline-flex}._4PqW5a_pathCopy:hover{background:color-mix(in srgb, var(--dsw-alias-label-primary,#12141a) 6%, transparent)}._4PqW5a_pathCopy:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#2f49d1);outline-offset:2px}._4PqW5a_docHeader{border-bottom:1px solid var(--dsw-alias-border-l1,#eef0f3);color:var(--dsw-alias-label-tertiary,#6b7080);margin-bottom:18px;padding-bottom:14px;font-size:12px;line-height:18px}._4PqW5a_provenance{border-top:1px solid var(--dsw-alias-border-l1,#eef0f3);color:var(--dsw-alias-label-tertiary,#81858c);margin:12px 0 0;padding-top:12px;font-size:12px;line-height:18px}._4PqW5a_failure{flex-direction:column;align-items:flex-start;gap:8px;display:flex}._4PqW5a_failureTitle{margin:0;font-size:13.5px;font-weight:600}._4PqW5a_failureText{color:var(--dsw-alias-label-secondary,#61666b);overflow-wrap:anywhere;margin:0;font-size:12.5px;line-height:19px}";
		const tagId$8 = "@nanmicoder/dsh-skills-hub/InstalledSkillDetail.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$8) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@nanmicoder/dsh-skills-hub";
			tag.dataset.pluginCss = tagId$8;
			tag.textContent = css$8;
			document.head.appendChild(tag);
		}
		var InstalledSkillDetail_module_css_default = {
			"docHeader": "_4PqW5a_docHeader",
			"failure": "_4PqW5a_failure",
			"failureText": "_4PqW5a_failureText",
			"failureTitle": "_4PqW5a_failureTitle",
			"pathCopy": "_4PqW5a_pathCopy",
			"pathIcon": "_4PqW5a_pathIcon",
			"pathRow": "_4PqW5a_pathRow",
			"pathText": "_4PqW5a_pathText",
			"provenance": "_4PqW5a_provenance"
		};
		//#endregion
		//#region lib/client/components/InstalledSkillDetail.js
		/**
		* Installed skill detail page.
		*
		* The list's "view" affordance used to open a 380px confirmation-style modal,
		* which is the wrong container for a document: SKILL.md is a page of prose with
		* tables and code, and the marketplace already answers the same question with a
		* full-panel page. This page is that same reading surface (`SkillDetailShell`),
		* fed by the filesystem instead of a provider.
		*
		* What it deliberately does *not* do is pretend a local skill is a market
		* entry. There is no author, download count or security report to show, so
		* those rows are absent rather than zero. Where the two identities do meet —
		* a skill installed from a market, proven by its `.skills-hub.json` sidecar —
		* the page links to the market detail instead of duplicating it, which keeps
		* upstream data upstream and this page readable with the network down.
		*/
		/** How long the path copy button stays in its confirmed state. */
		const COPIED_RESET_MS = 2e3;
		/** Reader-facing text for anything thrown by the client. */
		function messageOf$1(reason) {
			return reason instanceof Error ? reason.message : String(reason);
		}
		/** Local install timestamps are ISO strings; an unparseable one renders as nothing. */
		function formatInstalledAt(value) {
			const date = new Date(value);
			return Number.isNaN(date.getTime()) ? "" : date.toLocaleString();
		}
		function InstalledSkillDetail(props) {
			const { item } = props;
			const t = useT();
			const [detail, setDetail] = (0, react.useState)(null);
			const [error, setError] = (0, react.useState)(null);
			const [revision, setRevision] = (0, react.useState)(0);
			const [tab, setTab] = (0, react.useState)("overview");
			const [selectedPath, setSelectedPath] = (0, react.useState)(null);
			const [file, setFile] = (0, react.useState)(null);
			const [fileLoading, setFileLoading] = (0, react.useState)(false);
			const [fileError, setFileError] = (0, react.useState)(null);
			const [copied, setCopied] = (0, react.useState)(false);
			const resetTimer = (0, react.useRef)(void 0);
			(0, react.useEffect)(() => {
				const abort = new AbortController();
				setError(null);
				fetchInstalledDetail(item.key, abort.signal).then((result) => {
					if (!abort.signal.aborted) setDetail(result);
				}).catch((reason) => {
					if (!abort.signal.aborted && !isAbortError(reason)) setError(messageOf$1(reason));
				});
				return () => abort.abort();
			}, [item.key, revision]);
			(0, react.useEffect)(() => {
				if (tab !== "files" || detail === null || selectedPath !== null) return;
				const preferred = detail.files.find((entry) => entry.path.toLowerCase() === "skill.md") ?? detail.files[0];
				if (preferred !== void 0) setSelectedPath(preferred.path);
			}, [
				tab,
				detail,
				selectedPath
			]);
			(0, react.useEffect)(() => {
				if (selectedPath === null) return;
				const abort = new AbortController();
				setFileLoading(true);
				setFileError(null);
				fetchInstalledFile(item.key, selectedPath, abort.signal).then((result) => {
					if (!abort.signal.aborted) setFile(result);
				}).catch((reason) => {
					if (abort.signal.aborted || isAbortError(reason)) return;
					setFile(null);
					setFileError(messageOf$1(reason));
				}).finally(() => {
					if (!abort.signal.aborted) setFileLoading(false);
				});
				return () => abort.abort();
			}, [item.key, selectedPath]);
			(0, react.useEffect)(() => () => {
				if (resetTimer.current !== void 0) clearTimeout(resetTimer.current);
			}, []);
			const copyPath = () => {
				(0, _deepseek_ai_dsh_client_ui_primitives.writeClipboard)(item.dirPath).then((ok) => {
					if (!ok) return;
					setCopied(true);
					if (resetTimer.current !== void 0) clearTimeout(resetTimer.current);
					resetTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
				});
			};
			const marketId = item.managed && item.source !== "local" ? item.id : null;
			const body = detail === null ? "" : stripSkillFrontmatter(detail.markdown);
			const metadata = (0, react.useMemo)(() => detail?.frontmatter == null ? null : parseSkillFrontmatter(detail.frontmatter), [detail]);
			const baseName = item.dirPath.split(/[\\/]/).pop() ?? item.dirName;
			const flatSkill = detail !== null && detail.files.length === 1 && detail.files[0]?.path === baseName;
			const installedAt = item.installedAt === void 0 ? "" : formatInstalledAt(item.installedAt);
			const fileCount = detail?.files.length ?? item.fileCount;
			const sourceName = item.source === "local" ? t("localSkill") : t(`source.${item.source}`);
			return (0, react_jsx_runtime.jsxs)(SkillDetailShell, {
				focusKey: item.key,
				onBack: props.onBack,
				backLabel: t("installedTitle"),
				avatar: (0, react_jsx_runtime.jsx)(SkillAvatar, {
					name: item.name,
					source: item.source,
					size: 72
				}),
				name: item.name,
				version: item.version,
				meta: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					(0, react_jsx_runtime.jsx)("span", { children: sourceName }),
					installedAt !== "" && (0, react_jsx_runtime.jsx)("span", { children: t("installedOn", { date: installedAt }) }),
					(0, react_jsx_runtime.jsxs)("span", { children: [
						t("filesCount", { count: item.fileCount }),
						" · ",
						(0, _deepseek_ai_dsh_client_ui_primitives.fileSizeText)(item.bytes)
					] })
				] }),
				summary: item.summary,
				chips: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					(0, react_jsx_runtime.jsx)(Chip, {
						tone: item.managed ? "blue" : "plain",
						children: item.managed ? t("managedByHub") : t("unmanagedSkill")
					}),
					item.linked && (0, react_jsx_runtime.jsx)(Chip, { children: t("symlinkSkill") }),
					detail !== null && (0, react_jsx_runtime.jsx)(Chip, { children: flatSkill ? t("flatSkill") : t("bundleSkill") })
				] }),
				actions: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [marketId !== null && (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: detailStyles.secondaryButton,
					onClick: () => props.onOpenMarket(marketId, item.owner),
					children: [t("openInMarket"), (0, react_jsx_runtime.jsx)(ExternalLinkIcon, { size: 14 })]
				}), (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: detailStyles.secondaryButton,
					disabled: !item.removable,
					title: item.removable ? t("uninstallConfirm") : t("uninstallDisabled"),
					onClick: () => props.onUninstall(item),
					children: [(0, react_jsx_runtime.jsx)(TrashIcon, { size: 14 }), t("uninstall")]
				})] }),
				tabs: [{
					key: "overview",
					label: t("overview")
				}, {
					key: "files",
					label: t("files"),
					badge: (0, react_jsx_runtime.jsx)(TabCount, { value: fileCount })
				}],
				activeTab: tab,
				onTabChange: setTab,
				notice: (0, react_jsx_runtime.jsxs)("div", {
					className: InstalledSkillDetail_module_css_default.pathRow,
					children: [
						(0, react_jsx_runtime.jsx)(FolderIcon, {
							size: 14,
							className: InstalledSkillDetail_module_css_default.pathIcon
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: InstalledSkillDetail_module_css_default.pathText,
							title: item.dirPath,
							children: item.dirPath
						}),
						(0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: InstalledSkillDetail_module_css_default.pathCopy,
							"aria-label": copied ? t("copiedPath") : t("copyPath"),
							onClick: copyPath,
							children: [copied ? (0, react_jsx_runtime.jsx)(CheckIcon, { size: 14 }) : (0, react_jsx_runtime.jsx)(CopyIcon, { size: 14 }), copied ? t("copiedPath") : t("copyPath")]
						})
					]
				}),
				children: [tab === "overview" && (0, react_jsx_runtime.jsx)(DetailColumns, {
					main: (0, react_jsx_runtime.jsx)("section", {
						className: detailStyles.card,
						children: error !== null ? (0, react_jsx_runtime.jsxs)("div", {
							className: InstalledSkillDetail_module_css_default.failure,
							role: "alert",
							children: [
								(0, react_jsx_runtime.jsx)("p", {
									className: InstalledSkillDetail_module_css_default.failureTitle,
									children: t("installedReadFailed")
								}),
								(0, react_jsx_runtime.jsx)("p", {
									className: InstalledSkillDetail_module_css_default.failureText,
									children: error
								}),
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									size: "sm",
									onClick: () => setRevision((value) => value + 1),
									children: t("retry")
								})
							]
						}) : detail === null ? (0, react_jsx_runtime.jsxs)("p", {
							className: detailStyles.muted,
							role: "status",
							"aria-live": "polite",
							children: [
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
									state: "ongoing",
									size: 14
								}),
								" ",
								t("loading")
							]
						}) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							(0, react_jsx_runtime.jsx)("header", {
								className: InstalledSkillDetail_module_css_default.docHeader,
								children: (0, react_jsx_runtime.jsx)("span", {
									className: detailStyles.mono,
									children: "SKILL.md"
								})
							}),
							body.trim() === "" ? (0, react_jsx_runtime.jsx)("p", {
								className: detailStyles.muted,
								children: t("emptyDocument")
							}) : (0, react_jsx_runtime.jsx)(MarkdownView, { content: body }),
							metadata !== null && (0, react_jsx_runtime.jsx)("div", {
								className: detailStyles.frontmatter,
								children: (0, react_jsx_runtime.jsx)(FrontmatterPanel, { data: metadata })
							})
						] })
					}),
					side: (0, react_jsx_runtime.jsxs)(SideCard, {
						title: t("info"),
						children: [(0, react_jsx_runtime.jsxs)("dl", {
							className: detailStyles.info,
							children: [
								(0, react_jsx_runtime.jsx)(InfoRow, {
									label: t("sourceLabel"),
									value: sourceName
								}),
								item.version !== void 0 && item.version !== "" && (0, react_jsx_runtime.jsx)(InfoRow, {
									label: t("version"),
									value: `v${item.version}`,
									mono: true
								}),
								installedAt !== "" && (0, react_jsx_runtime.jsx)(InfoRow, {
									label: t("installedAtLabel"),
									value: installedAt
								}),
								detail !== null && (0, react_jsx_runtime.jsx)(InfoRow, {
									label: t("skillKind"),
									value: flatSkill ? t("flatSkill") : t("bundleSkill")
								}),
								(0, react_jsx_runtime.jsx)(InfoRow, {
									label: t("files"),
									value: `${t("filesCount", { count: item.fileCount })} · ${(0, _deepseek_ai_dsh_client_ui_primitives.fileSizeText)(item.bytes)}`
								})
							]
						}), marketId !== null && (0, react_jsx_runtime.jsx)("p", {
							className: InstalledSkillDetail_module_css_default.provenance,
							children: t("marketProvenance")
						})]
					})
				}), tab === "files" && (0, react_jsx_runtime.jsx)("section", {
					className: detailStyles.card,
					children: error !== null ? (0, react_jsx_runtime.jsx)("p", {
						className: detailStyles.muted,
						role: "alert",
						children: t("installedReadFailed")
					}) : (0, react_jsx_runtime.jsx)(SkillFiles, {
						files: detail?.files ?? [],
						selected: file,
						loading: fileLoading || detail === null,
						error: fileError,
						onSelect: (path) => {
							setFile(null);
							setSelectedPath(path);
						}
					})
				})]
			});
		}
		//#endregion
		//#region \0dsh-css:src/client/components/InstalledSkills.module.css.mjs
		const css$7 = ".eYwU2a_root{box-sizing:border-box;min-width:0;min-height:100%;color:var(--dsw-alias-label-primary,#12141a);background:var(--dsw-alias-bg-layer-2,#f5f6f8);flex-direction:column;display:flex;container-type:inline-size}.eYwU2a_top{background:var(--dsw-alias-bg-layer-1,#fff);border-bottom:1px solid var(--dsw-alias-border-l2,#e4e6eb);flex-direction:column;gap:16px;padding:22px 28px 20px;display:flex}.eYwU2a_canvas{flex-direction:column;flex:1 0 auto;gap:14px;padding:18px 28px 36px;display:flex}@container (width<=560px){.eYwU2a_top{padding:16px}.eYwU2a_canvas{padding:14px 16px 28px}}.eYwU2a_header{flex-wrap:wrap;justify-content:space-between;align-items:flex-start;gap:12px 20px;display:flex}.eYwU2a_title{margin:0;font-size:26px;font-weight:700;line-height:34px}.eYwU2a_subtitle{max-width:760px;color:var(--dsw-alias-label-secondary,#4a4f5c);margin:4px 0 0;font-size:14px;line-height:1.6}.eYwU2a_searchField{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2,#e4e6eb);background:var(--dsw-alias-bg-layer-1,#fff);height:40px;color:var(--dsw-alias-label-tertiary,#6b7080);border-radius:10px;align-items:center;gap:8px;padding:0 12px;display:flex}.eYwU2a_searchField:focus-within{border-color:var(--dsw-alias-label-primary,#12141a)}.eYwU2a_search{min-width:0;color:var(--dsw-alias-label-primary,#12141a);font:inherit;background:0 0;border:none;outline:none;flex:1;font-size:14px}.eYwU2a_secondaryButton{border:1px solid var(--dsw-alias-border-l2,#e4e6eb);background:var(--dsw-alias-bg-layer-1,#fff);height:36px;color:var(--dsw-alias-label-primary,#12141a);font:inherit;white-space:nowrap;cursor:pointer;border-radius:10px;flex:none;align-items:center;gap:6px;padding:0 14px;font-size:13px;font-weight:500;display:inline-flex}.eYwU2a_secondaryButton:hover:not(:disabled){background:color-mix(in srgb, var(--dsw-alias-label-primary,#12141a) 6%, transparent)}.eYwU2a_secondaryButton:disabled{cursor:default;opacity:.5}.eYwU2a_secondaryButton:focus-visible,.eYwU2a_name:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#2f49d1);outline-offset:2px}.eYwU2a_count{margin:0;font-size:14px;font-weight:600;line-height:20px}.eYwU2a_list{gap:12px;display:grid}.eYwU2a_card{border:1px solid var(--dsw-alias-border-l2,#e4e6eb);background:var(--dsw-alias-bg-layer-1,#fff);border-radius:14px;align-items:flex-start;gap:16px;padding:18px 20px;display:flex}.eYwU2a_info{flex-direction:column;flex:1;gap:6px;min-width:0;display:flex}.eYwU2a_nameRow{align-items:center;gap:8px;min-width:0;display:flex}.eYwU2a_name{min-width:0;color:inherit;font:inherit;text-align:left;text-overflow:ellipsis;white-space:nowrap;cursor:pointer;background:0 0;border:0;padding:0;font-size:15px;font-weight:600;overflow:hidden}.eYwU2a_name:hover{text-underline-offset:3px;text-decoration:underline}.eYwU2a_version{border:1px solid var(--dsw-alias-border-l2,#e4e6eb);color:var(--dsw-alias-label-secondary,#4a4f5c);font-family:var(--dsw-font-mono,ui-monospace, Menlo, monospace);border-radius:5px;flex:none;padding:0 6px;font-size:11px;line-height:17px}.eYwU2a_chips{flex-wrap:wrap;gap:6px;display:flex}.eYwU2a_summary{color:var(--dsw-alias-label-secondary,#4a4f5c);-webkit-line-clamp:2;-webkit-box-orient:vertical;margin:0;font-size:13px;line-height:20px;display:-webkit-box;overflow:hidden}.eYwU2a_path{min-width:0;color:var(--dsw-alias-label-tertiary,#6b7080);font-family:var(--dsw-font-mono,ui-monospace, Menlo, monospace);align-items:center;gap:6px;margin:0;font-size:12px;line-height:18px;display:flex}.eYwU2a_path span{overflow-wrap:anywhere;min-width:0}.eYwU2a_actions{flex-wrap:wrap;flex:none;gap:8px;display:flex}@container (width<=560px){.eYwU2a_card{flex-wrap:wrap}.eYwU2a_actions{width:100%}}.eYwU2a_error{border:1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary,#d92d20) 30%, transparent);background:color-mix(in srgb, var(--dsw-alias-state-error-primary,#d92d20) 6%, var(--dsw-alias-bg-layer-1,#fff));color:var(--dsw-alias-state-error-primary,#d92d20);overflow-wrap:anywhere;border-radius:12px;margin:0;padding:12px 14px;font-size:13px;line-height:20px}.eYwU2a_empty{border:1px solid var(--dsw-alias-border-l2,#e4e6eb);background:var(--dsw-alias-bg-layer-1,#fff);color:var(--dsw-alias-label-tertiary,#6b7080);text-align:center;border-radius:14px;margin:0;padding:48px 20px;font-size:14px}.eYwU2a_skeleton{border:1px solid var(--dsw-alias-border-l2,#e4e6eb);background:var(--dsw-alias-bg-layer-1,#fff);border-radius:14px;height:104px;animation:1.6s ease-in-out infinite alternate eYwU2a_pulse}@keyframes eYwU2a_pulse{to{opacity:.5}}@media (prefers-reduced-motion:reduce){.eYwU2a_skeleton{animation:none}}.eYwU2a_dialogPath{color:var(--dsw-alias-label-secondary,#4a4f5c);font-family:var(--dsw-font-mono,ui-monospace, Menlo, monospace);overflow-wrap:anywhere;margin:0;font-size:12px;line-height:18px}.eYwU2a_dialogActions{justify-content:flex-end;gap:10px;display:flex}";
		const tagId$7 = "@nanmicoder/dsh-skills-hub/InstalledSkills.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$7) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@nanmicoder/dsh-skills-hub";
			tag.dataset.pluginCss = tagId$7;
			tag.textContent = css$7;
			document.head.appendChild(tag);
		}
		var InstalledSkills_module_css_default = {
			"actions": "eYwU2a_actions",
			"canvas": "eYwU2a_canvas",
			"card": "eYwU2a_card",
			"chips": "eYwU2a_chips",
			"count": "eYwU2a_count",
			"dialogActions": "eYwU2a_dialogActions",
			"dialogPath": "eYwU2a_dialogPath",
			"empty": "eYwU2a_empty",
			"error": "eYwU2a_error",
			"header": "eYwU2a_header",
			"info": "eYwU2a_info",
			"list": "eYwU2a_list",
			"name": "eYwU2a_name",
			"nameRow": "eYwU2a_nameRow",
			"path": "eYwU2a_path",
			"pulse": "eYwU2a_pulse",
			"root": "eYwU2a_root",
			"search": "eYwU2a_search",
			"searchField": "eYwU2a_searchField",
			"secondaryButton": "eYwU2a_secondaryButton",
			"skeleton": "eYwU2a_skeleton",
			"subtitle": "eYwU2a_subtitle",
			"summary": "eYwU2a_summary",
			"title": "eYwU2a_title",
			"top": "eYwU2a_top",
			"version": "eYwU2a_version"
		};
		//#endregion
		//#region lib/client/components/InstalledSkills.js
		/**
		* Installed skills: the local inventory and its reading page.
		*
		* Two views, one component. The detail page replaces the list *inside* this
		* component rather than in `MarketPage`, so the list is never unmounted: the
		* search query, the loaded rows and the scroll position are all still there when
		* the reader comes back. That is also why the selected row is stored as a key
		* and resolved against the current rows — a refresh that drops the entry closes
		* the page instead of leaving it pointing at something that no longer exists.
		*
		* Removal stays a confirmation modal on purpose: it is a short yes/no about a
		* destructive action, which is exactly what the primitive's dialog is for. The
		* skill's *content* is not, which is why it moved to a page.
		*/
		/** Reader-facing text for anything thrown by the client. */
		function messageOf(reason) {
			return reason instanceof Error ? reason.message : String(reason);
		}
		function InstalledSkills(props) {
			const t = useT();
			const [items, setItems] = (0, react.useState)([]);
			const [loading, setLoading] = (0, react.useState)(true);
			const [error, setError] = (0, react.useState)(null);
			const [query, setQuery] = (0, react.useState)("");
			const [revision, setRevision] = (0, react.useState)(0);
			const [selectedKey, setSelectedKey] = (0, react.useState)(null);
			const [pending, setPending] = (0, react.useState)(null);
			const [busy, setBusy] = (0, react.useState)(false);
			const [returnFocusKey, setReturnFocusKey] = (0, react.useState)(null);
			/** Row buttons by skill key, so the detail page can hand focus back. */
			const rowButtons = (0, react.useRef)(/* @__PURE__ */ new Map());
			(0, react.useEffect)(() => {
				const abort = new AbortController();
				setLoading(true);
				setError(null);
				fetchInstalled(abort.signal).then((result) => {
					if (!abort.signal.aborted) setItems(result);
				}).catch((reason) => {
					if (!abort.signal.aborted && !isAbortError(reason)) setError(messageOf(reason));
				}).finally(() => {
					if (!abort.signal.aborted) setLoading(false);
				});
				return () => abort.abort();
			}, [revision]);
			const uninstall = async (target) => {
				if (busy) return;
				setBusy(true);
				setError(null);
				try {
					await removeInstalled(target.key);
					setItems((current) => current.filter((item) => item.key !== target.key));
					setSelectedKey((current) => current === target.key ? null : current);
					setPending(null);
					props.onChanged();
				} catch (reason) {
					setError(messageOf(reason));
					setPending(null);
				} finally {
					setBusy(false);
				}
			};
			const selected = selectedKey === null ? null : items.find((item) => item.key === selectedKey) ?? null;
			(0, react.useEffect)(() => {
				if (returnFocusKey === null) return;
				rowButtons.current.get(returnFocusKey)?.focus();
				setReturnFocusKey(null);
			}, [returnFocusKey]);
			const needle = query.trim().toLocaleLowerCase();
			const visible = items.filter((item) => `${item.name} ${item.summary ?? ""} ${item.dirPath}`.toLocaleLowerCase().includes(needle));
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [selected !== null ? (0, react_jsx_runtime.jsx)(InstalledSkillDetail, {
				item: selected,
				onBack: () => {
					setReturnFocusKey(selected.key);
					setSelectedKey(null);
				},
				onUninstall: setPending,
				onOpenMarket: props.onOpenMarket
			}, selected.key) : (0, react_jsx_runtime.jsxs)("section", {
				className: InstalledSkills_module_css_default.root,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: InstalledSkills_module_css_default.top,
					children: [(0, react_jsx_runtime.jsxs)("header", {
						className: InstalledSkills_module_css_default.header,
						children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("h1", {
							className: InstalledSkills_module_css_default.title,
							children: t("installedTitle")
						}), (0, react_jsx_runtime.jsx)("p", {
							className: InstalledSkills_module_css_default.subtitle,
							children: t("installedScope")
						})] }), (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: InstalledSkills_module_css_default.secondaryButton,
							disabled: loading,
							onClick: () => setRevision((value) => value + 1),
							children: [(0, react_jsx_runtime.jsx)(RefreshIcon, { size: 14 }), t("refreshInstalled")]
						})]
					}), (0, react_jsx_runtime.jsxs)("label", {
						className: InstalledSkills_module_css_default.searchField,
						children: [(0, react_jsx_runtime.jsx)(SearchIcon, { size: 16 }), (0, react_jsx_runtime.jsx)("input", {
							className: InstalledSkills_module_css_default.search,
							type: "search",
							"aria-label": t("installedSearch"),
							placeholder: t("installedSearch"),
							value: query,
							onChange: (event) => setQuery(event.target.value)
						})]
					})]
				}), (0, react_jsx_runtime.jsxs)("div", {
					className: InstalledSkills_module_css_default.canvas,
					children: [error !== null && (0, react_jsx_runtime.jsx)("p", {
						role: "alert",
						className: InstalledSkills_module_css_default.error,
						children: error
					}), loading ? (0, react_jsx_runtime.jsx)("div", {
						role: "status",
						"aria-label": t("loading"),
						className: InstalledSkills_module_css_default.list,
						children: Array.from({ length: 5 }, (_, index) => (0, react_jsx_runtime.jsx)("div", { className: InstalledSkills_module_css_default.skeleton }, index))
					}) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("p", {
						className: InstalledSkills_module_css_default.count,
						children: t("count", { count: visible.length })
					}), visible.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
						className: InstalledSkills_module_css_default.empty,
						children: t(items.length === 0 ? "installedEmpty" : "emptySearch")
					}) : (0, react_jsx_runtime.jsx)("div", {
						className: InstalledSkills_module_css_default.list,
						children: visible.map((item) => (0, react_jsx_runtime.jsxs)("article", {
							className: InstalledSkills_module_css_default.card,
							children: [
								(0, react_jsx_runtime.jsx)(SkillAvatar, {
									name: item.name,
									source: item.source,
									size: 44
								}),
								(0, react_jsx_runtime.jsxs)("div", {
									className: InstalledSkills_module_css_default.info,
									children: [
										(0, react_jsx_runtime.jsxs)("div", {
											className: InstalledSkills_module_css_default.nameRow,
											children: [(0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: InstalledSkills_module_css_default.name,
												ref: (node) => {
													if (node === null) rowButtons.current.delete(item.key);
													else rowButtons.current.set(item.key, node);
												},
												onClick: () => setSelectedKey(item.key),
												children: item.name
											}), item.version !== void 0 && item.version !== "" && (0, react_jsx_runtime.jsxs)("span", {
												className: InstalledSkills_module_css_default.version,
												children: ["v", item.version]
											})]
										}),
										(0, react_jsx_runtime.jsxs)("div", {
											className: InstalledSkills_module_css_default.chips,
											children: [(0, react_jsx_runtime.jsx)(Chip, {
												tone: item.managed ? "blue" : "plain",
												children: item.source === "local" ? t("localSkill") : t(`source.${item.source}`)
											}), item.linked && (0, react_jsx_runtime.jsx)(Chip, { children: t("linkedSkill") })]
										}),
										item.summary !== void 0 && item.summary !== "" && (0, react_jsx_runtime.jsx)("p", {
											className: InstalledSkills_module_css_default.summary,
											children: item.summary
										}),
										(0, react_jsx_runtime.jsxs)("p", {
											className: InstalledSkills_module_css_default.path,
											children: [(0, react_jsx_runtime.jsx)(FolderIcon, { size: 13 }), (0, react_jsx_runtime.jsx)("span", { children: item.dirPath })]
										})
									]
								}),
								(0, react_jsx_runtime.jsxs)("div", {
									className: InstalledSkills_module_css_default.actions,
									children: [(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: InstalledSkills_module_css_default.secondaryButton,
										onClick: () => setSelectedKey(item.key),
										children: t("viewInstalled")
									}), (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: InstalledSkills_module_css_default.secondaryButton,
										disabled: !item.removable,
										title: item.removable ? void 0 : t("uninstallDisabled"),
										onClick: () => setPending(item),
										children: [(0, react_jsx_runtime.jsx)(TrashIcon, { size: 14 }), t("uninstall")]
									})]
								})
							]
						}, item.key))
					})] })]
				})]
			}), pending !== null && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open: true,
				title: t("uninstallTitle", { name: pending.name }),
				closeLabel: t("close"),
				description: t(pending.linked ? "unlinkDescription" : "localUninstallDescription"),
				onClose: () => {
					if (!busy) setPending(null);
				},
				footer: (0, react_jsx_runtime.jsxs)("div", {
					className: InstalledSkills_module_css_default.dialogActions,
					children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "outline",
						size: "md",
						disabled: busy,
						onClick: () => setPending(null),
						children: t("cancel")
					}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "primary",
						size: "md",
						disabled: busy,
						onClick: () => void uninstall(pending),
						children: t(busy ? "uninstalling" : "uninstallConfirm")
					})]
				}),
				children: (0, react_jsx_runtime.jsx)("p", {
					className: InstalledSkills_module_css_default.dialogPath,
					children: pending.dirPath
				})
			})] });
		}
		//#endregion
		//#region \0dsh-css:src/client/components/CategoryBar.module.css.mjs
		const css$6 = ".RyDtBq_bar{flex-direction:column;gap:6px;min-width:0;display:flex}.RyDtBq_chips{flex-wrap:wrap;gap:6px;min-width:0;display:flex}.RyDtBq_chip{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2,#0000001a);background:var(--dsw-alias-bg-layer-1,#fff);height:32px;color:var(--dsw-alias-label-secondary,#4a4f5c);font:inherit;white-space:nowrap;cursor:pointer;border-radius:999px;padding:0 14px;font-size:13px;line-height:30px}.RyDtBq_chip:hover:not(:disabled){border-color:var(--dsw-alias-border-l3,#0003)}.RyDtBq_chip:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#4176e6);outline-offset:1px}.RyDtBq_chip[aria-checked=true]{border-color:var(--dsw-alias-label-primary,#1a1c1f);background:var(--dsw-alias-label-primary,#1a1c1f);color:var(--dsw-alias-bg-layer-1,#fff)}.RyDtBq_chip:disabled{cursor:default;opacity:.5}.RyDtBq_count{opacity:.6;font-variant-numeric:tabular-nums;margin-left:5px;font-size:11px}";
		const tagId$6 = "@nanmicoder/dsh-skills-hub/CategoryBar.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$6) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@nanmicoder/dsh-skills-hub";
			tag.dataset.pluginCss = tagId$6;
			tag.textContent = css$6;
			document.head.appendChild(tag);
		}
		var CategoryBar_module_css_default = {
			"bar": "RyDtBq_bar",
			"chip": "RyDtBq_chip",
			"chips": "RyDtBq_chips",
			"count": "RyDtBq_count"
		};
		//#endregion
		//#region lib/client/components/CategoryBar.js
		/**
		* Category chips above the curated catalogue.
		*
		* The categories are the catalogue's own, so every chip has skills behind it
		* and its count is exact. Rendered only once they loaded.
		*/
		function CategoryBar(props) {
			const { categories, active, disabled, onSelect } = props;
			const t = useT();
			if (categories.length === 0) return null;
			const english = t("category.lang") === "en";
			const entries = [{
				key: "all",
				label: t("category.all")
			}].concat(categories.map((category) => ({
				key: category.key,
				label: english && category.nameEn || category.name,
				count: category.count
			})));
			return (0, react_jsx_runtime.jsx)("div", {
				className: CategoryBar_module_css_default.bar,
				children: (0, react_jsx_runtime.jsx)("div", {
					className: CategoryBar_module_css_default.chips,
					role: "radiogroup",
					"aria-label": t("category.label"),
					children: entries.map((entry) => (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						role: "radio",
						"aria-checked": entry.key === active,
						className: CategoryBar_module_css_default.chip,
						disabled: disabled && entry.key !== active,
						onClick: () => onSelect(entry.key),
						children: [entry.label, entry.count !== void 0 && (0, react_jsx_runtime.jsx)("span", {
							className: CategoryBar_module_css_default.count,
							children: entry.count
						})]
					}, entry.key))
				})
			});
		}
		//#endregion
		//#region \0dsh-css:src/client/components/FilterBar.module.css.mjs
		const css$5 = ".iX7c8W_bar{flex-wrap:wrap;align-items:center;gap:10px;min-width:0;display:flex}.iX7c8W_search{flex:220px;align-items:center;gap:6px;min-width:0;display:flex}.iX7c8W_searchInput{border-radius:10px;flex:auto;min-width:0;min-height:40px}.iX7c8W_clear{flex:none}.iX7c8W_field{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2,#e4e6eb);background:var(--dsw-alias-bg-layer-1,#fff);cursor:pointer;border-radius:10px;flex:none;align-items:center;gap:6px;height:40px;padding:0 8px 0 12px;display:inline-flex}.iX7c8W_field:hover{border-color:var(--dsw-alias-border-l3,#c9ccd4)}.iX7c8W_field:focus-within{border-color:var(--dsw-alias-label-primary,#12141a)}.iX7c8W_fieldLabel{color:var(--dsw-alias-label-tertiary,#81858c);white-space:nowrap;font-size:12px;line-height:18px}.iX7c8W_select{max-width:148px;color:var(--dsw-alias-label-primary,#0f1115);font:inherit;cursor:pointer;text-overflow:ellipsis;background:0 0;border:none;outline:none;font-size:12.5px;font-weight:600;line-height:18px}.iX7c8W_select:disabled{color:var(--dsw-alias-label-tertiary,#81858c);cursor:not-allowed}.iX7c8W_select option{background:var(--dsw-alias-bg-layer-1,#fff);color:var(--dsw-alias-label-primary,#0f1115)}.iX7c8W_srOnly{clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0;width:1px;height:1px;margin:-1px;padding:0;position:absolute;overflow:hidden}";
		const tagId$5 = "@nanmicoder/dsh-skills-hub/FilterBar.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$5) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@nanmicoder/dsh-skills-hub";
			tag.dataset.pluginCss = tagId$5;
			tag.textContent = css$5;
			document.head.appendChild(tag);
		}
		var FilterBar_module_css_default = {
			"bar": "iX7c8W_bar",
			"clear": "iX7c8W_clear",
			"field": "iX7c8W_field",
			"fieldLabel": "iX7c8W_fieldLabel",
			"search": "iX7c8W_search",
			"searchInput": "iX7c8W_searchInput",
			"select": "iX7c8W_select",
			"srOnly": "iX7c8W_srOnly"
		};
		//#endregion
		//#region lib/client/components/FilterBar.js
		/** Option order for each select; the values are the frozen filter unions. */
		const SOURCE_OPTIONS = [
			"all",
			"clawhub",
			"skillhub"
		];
		const SECURITY_OPTIONS = [
			"all",
			"verified",
			"benign",
			"unknown",
			"flagged"
		];
		const INSTALLED_OPTIONS = ["all", "installable"];
		/**
		* Search field plus the three catalogue filters.
		*
		* Native `<select>`s rather than a menu primitive: the DSH `Menu` is an
		* anchored popover that needs its own open state and focus return, and three
		* of them side by side would be three focus traps in a row. A `<select>` gets
		* platform keyboard behaviour, a real label association, and renders inside a
		* 720px panel without a portal.
		*
		* The search field is a draft: typing only edits local state, and the query is
		* submitted on Enter (or when the field is emptied/cleared). Enter during IME
		* composition confirms the candidate and must not submit.
		*
		* The result count is announced through a visually hidden live region instead
		* of being printed twice: the visible count lives in the home header, and a
		* screen reader still hears it change when a filter narrows the list.
		*/
		function FilterBar(props) {
			const { filters, total, disabled, onChange } = props;
			const t = useT();
			const [draft, setDraft] = (0, react.useState)(filters.q);
			(0, react.useEffect)(() => {
				setDraft(filters.q);
			}, [filters.q]);
			const submit = (q) => {
				if (q.trim() === filters.q.trim() && q === filters.q) return;
				onChange({ q });
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: FilterBar_module_css_default.bar,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: FilterBar_module_css_default.search,
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
							className: FilterBar_module_css_default.searchInput,
							icon: (0, react_jsx_runtime.jsx)(SearchIcon, { size: 16 }),
							value: draft,
							disabled,
							placeholder: t("searchPlaceholder"),
							"aria-label": t("searchPlaceholder"),
							enterKeyHint: "search",
							onChange: (event) => {
								const next = event.currentTarget.value;
								setDraft(next);
								if (next === "" && filters.q !== "") submit("");
							},
							onKeyDown: (event) => {
								if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
								event.preventDefault();
								submit(draft);
							}
						}), draft !== "" && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "ghost",
							size: "sm",
							className: FilterBar_module_css_default.clear,
							disabled,
							"aria-label": t("clearSearch"),
							onClick: () => {
								setDraft("");
								submit("");
							},
							icon: (0, react_jsx_runtime.jsx)(CloseIcon, { size: 14 })
						})]
					}),
					(0, react_jsx_runtime.jsxs)("label", {
						className: FilterBar_module_css_default.field,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: FilterBar_module_css_default.fieldLabel,
							children: t("filter.source")
						}), (0, react_jsx_runtime.jsx)("select", {
							className: FilterBar_module_css_default.select,
							value: filters.source,
							disabled,
							onChange: (event) => onChange({ source: event.currentTarget.value }),
							children: SOURCE_OPTIONS.map((value) => (0, react_jsx_runtime.jsx)("option", {
								value,
								children: t(`source.${value}`)
							}, value))
						})]
					}),
					(0, react_jsx_runtime.jsxs)("label", {
						className: FilterBar_module_css_default.field,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: FilterBar_module_css_default.fieldLabel,
							children: t("filter.security")
						}), (0, react_jsx_runtime.jsx)("select", {
							className: FilterBar_module_css_default.select,
							value: filters.security,
							disabled,
							onChange: (event) => onChange({ security: event.currentTarget.value }),
							children: SECURITY_OPTIONS.map((value) => (0, react_jsx_runtime.jsx)("option", {
								value,
								children: t(`security.${value}`)
							}, value))
						})]
					}),
					(0, react_jsx_runtime.jsxs)("label", {
						className: FilterBar_module_css_default.field,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: FilterBar_module_css_default.fieldLabel,
							children: t("filter.installed")
						}), (0, react_jsx_runtime.jsx)("select", {
							className: FilterBar_module_css_default.select,
							value: filters.installed,
							disabled,
							onChange: (event) => onChange({ installed: event.currentTarget.value }),
							children: INSTALLED_OPTIONS.map((value) => (0, react_jsx_runtime.jsx)("option", {
								value,
								children: t(`installed.${value}`)
							}, value))
						})]
					}),
					(0, react_jsx_runtime.jsx)("p", {
						className: FilterBar_module_css_default.srOnly,
						role: "status",
						"aria-live": "polite",
						children: t("count", { count: total })
					})
				]
			});
		}
		//#endregion
		//#region \0dsh-css:src/client/components/MarketDisclaimer.module.css.mjs
		const css$4 = ".e2Evdq_banner{box-sizing:border-box;border:1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary,#f59e0b) 38%, transparent);border-radius:var(--dsw-radius-sm,8px);background:color-mix(in srgb, var(--dsw-alias-state-warn-primary,#f59e0b) 10%, transparent);align-items:flex-start;gap:10px;padding:10px 12px;display:flex}.e2Evdq_icon{color:var(--dsw-alias-state-warn-primary,#f59e0b);flex:none;margin-top:1px}.e2Evdq_text{overflow-wrap:anywhere;min-width:0;color:var(--dsw-alias-label-secondary,#61666b);flex:1;margin:0;font-size:12.5px;line-height:1.65}.e2Evdq_dismiss{flex:none;margin:-4px -6px 0 0}";
		const tagId$4 = "@nanmicoder/dsh-skills-hub/MarketDisclaimer.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$4) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@nanmicoder/dsh-skills-hub";
			tag.dataset.pluginCss = tagId$4;
			tag.textContent = css$4;
			document.head.appendChild(tag);
		}
		var MarketDisclaimer_module_css_default = {
			"banner": "e2Evdq_banner",
			"dismiss": "e2Evdq_dismiss",
			"icon": "e2Evdq_icon",
			"text": "e2Evdq_text"
		};
		//#endregion
		//#region lib/client/components/MarketDisclaimer.js
		/**
		* Third-party risk notice shown above the catalogue until it is acknowledged.
		*
		* Purely presentational: persistence (`localStorage`, `disclaimerDismissed`)
		* belongs to the controller, so this component stays reusable in a bare test
		* render and cannot drift from the stored flag.
		*/
		function MarketDisclaimer(props) {
			const { onDismiss } = props;
			const t = useT();
			return (0, react_jsx_runtime.jsxs)("div", {
				className: MarketDisclaimer_module_css_default.banner,
				role: "note",
				children: [
					(0, react_jsx_runtime.jsx)(AlertIcon, {
						size: 16,
						className: MarketDisclaimer_module_css_default.icon
					}),
					(0, react_jsx_runtime.jsx)("p", {
						className: MarketDisclaimer_module_css_default.text,
						children: t("disclaimer")
					}),
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "ghost",
						size: "sm",
						className: MarketDisclaimer_module_css_default.dismiss,
						"aria-label": t("dismiss"),
						onClick: onDismiss,
						icon: (0, react_jsx_runtime.jsx)(CloseIcon, { size: 16 })
					})
				]
			});
		}
		//#endregion
		//#region \0dsh-css:src/client/components/SkillCard.module.css.mjs
		const css$3 = ".cii49a_card{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2,#e4e6eb);background:var(--dsw-alias-bg-layer-1,#fff);border-radius:14px;flex-direction:column;gap:12px;min-width:0;min-height:200px;padding:18px 18px 16px;transition:border-color .14s,box-shadow .14s;display:flex;position:relative}.cii49a_card:hover{border-color:var(--dsw-alias-border-l3,#c9ccd4);box-shadow:0 4px 16px color-mix(in srgb, var(--dsw-alias-label-primary,#12141a) 7%, transparent)}.cii49a_card:focus-within{border-color:var(--dsw-alias-label-primary,#12141a)}.cii49a_open{z-index:0;border-radius:inherit;cursor:pointer;background:0 0;border:none;margin:0;padding:0;position:absolute;inset:0}.cii49a_open:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#2f49d1);outline-offset:2px}.cii49a_head,.cii49a_summary,.cii49a_tags,.cii49a_footer{z-index:1;pointer-events:none;position:relative}.cii49a_head{align-items:center;gap:12px;min-width:0;display:flex}.cii49a_headText{flex:1;min-width:0}.cii49a_titleRow{align-items:center;gap:8px;min-width:0;display:flex}.cii49a_title{min-width:0;color:var(--dsw-alias-label-primary,#12141a);text-overflow:ellipsis;white-space:nowrap;margin:0;font-size:15px;font-weight:600;line-height:22px;overflow:hidden}.cii49a_version{border:1px solid var(--dsw-alias-border-l2,#e4e6eb);color:var(--dsw-alias-label-secondary,#4a4f5c);font-family:var(--dsw-font-mono,ui-monospace, Menlo, monospace);border-radius:5px;flex:none;padding:0 6px;font-size:11px;line-height:17px}.cii49a_origin{min-width:0;color:var(--dsw-alias-label-tertiary,#6b7080);align-items:center;margin:2px 0 0;font-size:12px;line-height:18px;display:flex}.cii49a_origin>span+span:before{content:\"·\";margin:0 6px}.cii49a_author{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}.cii49a_summary{min-height:42px;color:var(--dsw-alias-label-secondary,#4a4f5c);overflow-wrap:anywhere;-webkit-line-clamp:2;-webkit-box-orient:vertical;margin:0;font-size:13px;line-height:21px;display:-webkit-box;overflow:hidden}.cii49a_tags{flex-wrap:wrap;gap:6px;min-width:0;max-height:24px;display:flex;overflow:hidden}.cii49a_footer{border-top:1px solid var(--dsw-alias-border-l1,#eef0f3);justify-content:space-between;align-items:center;gap:10px;margin-top:auto;padding-top:12px;display:flex}.cii49a_stats{align-items:center;gap:14px;min-width:0;display:flex}.cii49a_stat{color:var(--dsw-alias-label-secondary,#4a4f5c);font-family:var(--dsw-font-mono,ui-monospace, Menlo, monospace);font-variant-numeric:tabular-nums;align-items:center;gap:5px;font-size:12px;display:inline-flex}.cii49a_install{background:var(--dsw-alias-label-primary,#12141a);height:32px;color:var(--dsw-alias-bg-layer-1,#fff);font:inherit;cursor:pointer;pointer-events:auto;border:none;border-radius:8px;flex:none;align-items:center;gap:6px;padding:0 14px;font-size:13px;font-weight:600;display:inline-flex}.cii49a_install:hover:not(:disabled){opacity:.88}.cii49a_install:disabled{cursor:default;opacity:.55}.cii49a_install:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#2f49d1);outline-offset:2px}.cii49a_installed{color:var(--dsw-alias-state-success-primary,#1b6b45);align-items:center;gap:5px;font-size:13px;font-weight:600;display:inline-flex}.cii49a_unavailable{color:var(--dsw-alias-label-tertiary,#6b7080);font-size:12px}";
		const tagId$3 = "@nanmicoder/dsh-skills-hub/SkillCard.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$3) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@nanmicoder/dsh-skills-hub";
			tag.dataset.pluginCss = tagId$3;
			tag.textContent = css$3;
			document.head.appendChild(tag);
		}
		var SkillCard_module_css_default = {
			"author": "cii49a_author",
			"card": "cii49a_card",
			"footer": "cii49a_footer",
			"head": "cii49a_head",
			"headText": "cii49a_headText",
			"install": "cii49a_install",
			"installed": "cii49a_installed",
			"open": "cii49a_open",
			"origin": "cii49a_origin",
			"stat": "cii49a_stat",
			"stats": "cii49a_stats",
			"summary": "cii49a_summary",
			"tags": "cii49a_tags",
			"title": "cii49a_title",
			"titleRow": "cii49a_titleRow",
			"unavailable": "cii49a_unavailable",
			"version": "cii49a_version"
		};
		//#endregion
		//#region lib/client/components/SkillCard.js
		/** Tags beyond this count collapse into a `+n` chip. */
		const MAX_VISIBLE_TAGS = 3;
		/**
		* Compact download/star counts (`1.2k`, `3.4M`). Numeric and language-neutral,
		* so it needs no dictionary entry.
		*/
		function formatCount(value) {
			if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
			if (value >= 1e3) return `${(value / 1e3).toFixed(1)}k`;
			return String(value);
		}
		/**
		* One catalogue card.
		*
		* The open affordance is a single stretched `<button>` behind the content
		* instead of a click handler on the `<article>`: it is focusable, Enter/Space
		* work for free, and the card never pretends a div is a link. That button sits
		* under the content, so the content is `pointer-events: none` and the install
		* control opts back in — without that pair, either the card stops opening or
		* the install button becomes unclickable.
		*/
		function SkillCard(props) {
			const { skill, installing, onOpen, onInstall } = props;
			const t = useT();
			const extraTags = Math.max(0, skill.tags.length - MAX_VISIBLE_TAGS);
			const showInstall = onInstall !== void 0 && skill.installState === "installable";
			const author = skill.author.displayName ?? skill.author.handle;
			return (0, react_jsx_runtime.jsxs)("article", {
				className: SkillCard_module_css_default.card,
				children: [
					(0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: SkillCard_module_css_default.open,
						"aria-label": skill.name,
						onClick: () => onOpen(skill.id)
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: SkillCard_module_css_default.head,
						children: [(0, react_jsx_runtime.jsx)(SkillAvatar, {
							name: skill.name,
							source: skill.source,
							iconUrl: skill.iconUrl,
							size: 44
						}), (0, react_jsx_runtime.jsxs)("div", {
							className: SkillCard_module_css_default.headText,
							children: [(0, react_jsx_runtime.jsxs)("div", {
								className: SkillCard_module_css_default.titleRow,
								children: [(0, react_jsx_runtime.jsx)("h3", {
									className: SkillCard_module_css_default.title,
									children: skill.name
								}), skill.version !== void 0 && skill.version !== "" && (0, react_jsx_runtime.jsxs)("span", {
									className: SkillCard_module_css_default.version,
									children: ["v", skill.version]
								})]
							}), (0, react_jsx_runtime.jsxs)("p", {
								className: SkillCard_module_css_default.origin,
								children: [(0, react_jsx_runtime.jsx)("span", { children: t(`source.${skill.source}`) }), author !== "" && (0, react_jsx_runtime.jsx)("span", {
									className: SkillCard_module_css_default.author,
									children: author
								})]
							})]
						})]
					}),
					(0, react_jsx_runtime.jsx)("p", {
						className: SkillCard_module_css_default.summary,
						children: skill.summary
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: SkillCard_module_css_default.tags,
						children: [
							(0, react_jsx_runtime.jsx)(SecurityChip, {
								status: skill.securityStatus,
								short: true
							}),
							skill.featured === true && (0, react_jsx_runtime.jsx)(Chip, {
								tone: "blue",
								children: t("featured")
							}),
							skill.tags.slice(0, MAX_VISIBLE_TAGS).map((tag) => (0, react_jsx_runtime.jsx)(Chip, { children: tag }, tag)),
							extraTags > 0 && (0, react_jsx_runtime.jsxs)(Chip, { children: ["+", extraTags] })
						]
					}),
					(0, react_jsx_runtime.jsxs)("footer", {
						className: SkillCard_module_css_default.footer,
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: SkillCard_module_css_default.stats,
								children: [(0, react_jsx_runtime.jsxs)("span", {
									className: SkillCard_module_css_default.stat,
									title: t("downloads"),
									children: [(0, react_jsx_runtime.jsx)(DownloadIcon, { size: 13 }), formatCount(skill.stats.downloads)]
								}), skill.stats.stars !== void 0 && skill.stats.stars > 0 && (0, react_jsx_runtime.jsxs)("span", {
									className: SkillCard_module_css_default.stat,
									title: t("stars"),
									children: [(0, react_jsx_runtime.jsx)(StarIcon, { size: 13 }), formatCount(skill.stats.stars)]
								})]
							}),
							showInstall && (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: SkillCard_module_css_default.install,
								disabled: installing,
								"aria-label": `${t("install")}: ${skill.name}`,
								onClick: () => onInstall?.(skill.id),
								children: [(0, react_jsx_runtime.jsx)(DownloadIcon, { size: 14 }), installing ? t("installing") : t("install")]
							}),
							skill.installState === "installed" && (0, react_jsx_runtime.jsxs)("span", {
								className: SkillCard_module_css_default.installed,
								children: [(0, react_jsx_runtime.jsx)(CheckIcon, { size: 14 }), t("installed")]
							}),
							skill.installState === "not-installable" && (0, react_jsx_runtime.jsx)("span", {
								className: SkillCard_module_css_default.unavailable,
								children: t("notInstallable")
							})
						]
					})
				]
			});
		}
		//#endregion
		//#region \0dsh-css:src/client/components/SourceStatusBar.module.css.mjs
		const css$2 = ".QI7v1q_bar{flex-wrap:wrap;align-items:center;gap:6px;display:flex}.QI7v1q_list{flex-wrap:wrap;align-items:center;gap:6px;min-width:0;margin:0;padding:0;list-style:none;display:flex}.QI7v1q_item{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2,#0000001a);background:var(--dsw-alias-bg-layer-1,#fff);white-space:nowrap;border-radius:999px;align-items:center;gap:6px;height:24px;padding:0 9px;font-size:12px;line-height:18px;display:inline-flex}.QI7v1q_dot{font-size:10px;line-height:10px}.QI7v1q_name{color:var(--dsw-alias-label-primary,#0f1115);font-weight:600}.QI7v1q_status{color:var(--dsw-alias-label-tertiary,#81858c)}.QI7v1q_snapshot{border-left:1px solid var(--dsw-alias-border-l2,#0000001a);color:var(--dsw-alias-label-secondary,#61666b);font-variant-numeric:tabular-nums;padding-left:6px}.QI7v1q_refresh{flex:none}.QI7v1q_spinning{transform-origin:50%;animation:.9s linear infinite QI7v1q_skills-hub-spin}@keyframes QI7v1q_skills-hub-spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.QI7v1q_spinning{animation:none}}";
		const tagId$2 = "@nanmicoder/dsh-skills-hub/SourceStatusBar.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$2) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@nanmicoder/dsh-skills-hub";
			tag.dataset.pluginCss = tagId$2;
			tag.textContent = css$2;
			document.head.appendChild(tag);
		}
		var SourceStatusBar_module_css_default = {
			"bar": "QI7v1q_bar",
			"dot": "QI7v1q_dot",
			"item": "QI7v1q_item",
			"list": "QI7v1q_list",
			"name": "QI7v1q_name",
			"refresh": "QI7v1q_refresh",
			"skills-hub-spin": "QI7v1q_skills-hub-spin",
			"snapshot": "QI7v1q_snapshot",
			"spinning": "QI7v1q_spinning",
			"status": "QI7v1q_status"
		};
		//#endregion
		//#region lib/client/components/SourceStatusBar.js
		/**
		* Display order, declared locally rather than imported: `MARKET_SOURCES` is a
		* runtime value in `src/market/types.ts`, and a value import from that module
		* would pull host-facing code into the browser bundle (contract §4).
		*/
		const SOURCES = ["clawhub", "skillhub"];
		/** Upstream health mapped onto the primitive's five-way state vocabulary. */
		const DOT_STATES = {
			ok: "done",
			degraded: "warning",
			failed: "error",
			cached: "idle"
		};
		/**
		* Per-source health strip.
		*
		* The upstream error string rides the pill's `title` instead of being printed:
		* a 720px panel has no room for a stack trace next to two source names, and an
		* operator who needs it can hover.
		*
		* The snapshot age *is* printed: a healthy source can still be answering from a
		* cache, and a reader deciding whether to install third-party code is entitled
		* to see that the page in front of them was read minutes ago rather than now.
		*/
		function SourceStatusBar(props) {
			const { sources, onRefresh, refreshing } = props;
			const t = useT();
			return (0, react_jsx_runtime.jsxs)("div", {
				className: SourceStatusBar_module_css_default.bar,
				children: [(0, react_jsx_runtime.jsx)("ul", {
					className: SourceStatusBar_module_css_default.list,
					children: SOURCES.map((source) => {
						const info = sources[source];
						const snapshotAt = info.fromCache === true ? info.fetchedAt : void 0;
						return (0, react_jsx_runtime.jsxs)("li", {
							className: SourceStatusBar_module_css_default.item,
							title: info.error,
							children: [
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
									state: DOT_STATES[info.status],
									className: SourceStatusBar_module_css_default.dot
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: SourceStatusBar_module_css_default.name,
									children: t(`source.${source}`)
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: SourceStatusBar_module_css_default.status,
									children: t(`sourceStatus.${info.status}`)
								}),
								snapshotAt !== void 0 && (0, react_jsx_runtime.jsx)("span", {
									className: SourceStatusBar_module_css_default.snapshot,
									title: formatStamp(snapshotAt),
									children: t("snapshotAge", { age: formatAge(t, snapshotAt) })
								})
							]
						}, source);
					})
				}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
					label: t("refreshNow"),
					children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "ghost",
						size: "sm",
						className: SourceStatusBar_module_css_default.refresh,
						disabled: refreshing,
						"aria-label": t("refreshNow"),
						onClick: onRefresh,
						icon: (0, react_jsx_runtime.jsx)(RefreshIcon, {
							size: 16,
							className: refreshing ? SourceStatusBar_module_css_default.spinning : void 0
						})
					})
				})]
			});
		}
		//#endregion
		//#region \0dsh-css:src/client/components/MarketHome.module.css.mjs
		const css$1 = ".tNGryG_home{box-sizing:border-box;min-width:0;min-height:100%;color:var(--dsw-alias-label-primary,#12141a);background:var(--dsw-alias-bg-layer-2,#f5f6f8);flex-direction:column;display:flex;container-type:inline-size}.tNGryG_top{background:var(--dsw-alias-bg-layer-1,#fff);border-bottom:1px solid var(--dsw-alias-border-l2,#e4e6eb);flex-direction:column;gap:16px;padding:22px 28px 20px;display:flex}.tNGryG_canvas{flex-direction:column;flex:1 0 auto;gap:14px;min-width:0;padding:18px 28px 36px;display:flex}@container (width<=560px){.tNGryG_top{padding:16px}.tNGryG_canvas{padding:14px 16px 28px}}.tNGryG_masthead{align-items:flex-start;gap:14px;min-width:0;display:flex}.tNGryG_mark{box-sizing:border-box;background:var(--dsw-alias-label-primary,#12141a);width:48px;height:48px;color:var(--dsw-alias-bg-layer-1,#fff);border-radius:14px;flex:none;justify-content:center;align-items:center;display:inline-flex}.tNGryG_mastheadText{flex:1;min-width:0}.tNGryG_title{letter-spacing:-.012em;overflow-wrap:anywhere;margin:0;font-size:26px;font-weight:700;line-height:34px}.tNGryG_subtitle{max-width:62ch;color:var(--dsw-alias-label-secondary,#4a4f5c);overflow-wrap:anywhere;margin:4px 0 0;font-size:14px;line-height:21px}.tNGryG_statusRow{flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px 12px;min-width:0;min-height:32px;display:flex}.tNGryG_count{color:var(--dsw-alias-label-primary,#12141a);font-variant-numeric:tabular-nums;flex-wrap:wrap;align-items:baseline;gap:4px 10px;margin:0;font-size:14px;font-weight:600;line-height:20px;display:flex}.tNGryG_countNote{color:var(--dsw-alias-label-tertiary,#6b7080);font-size:12px;font-weight:400}.tNGryG_body{flex-direction:column;gap:14px;min-width:0;display:flex}.tNGryG_grid{grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:16px;min-width:0;display:grid}.tNGryG_loading{color:var(--dsw-alias-label-secondary,#61666b);align-items:center;gap:8px;margin:0;padding:10px 0;font-size:13px;line-height:20px;display:flex}.tNGryG_more{justify-content:center;padding-top:2px;display:flex}.tNGryG_empty{border:1px solid var(--dsw-alias-border-l2,#e4e6eb);background:var(--dsw-alias-bg-layer-1,#fff);color:var(--dsw-alias-label-tertiary,#81858c);border-radius:14px;flex-direction:column;align-items:center;gap:10px;padding:48px 20px;display:flex}.tNGryG_emptyTitle{color:var(--dsw-alias-label-primary,#0f1115);text-align:center;overflow-wrap:anywhere;margin:0;font-size:14px;font-weight:600;line-height:21px}.tNGryG_emptyText{text-align:center;overflow-wrap:anywhere;max-width:52ch;margin:0;font-size:12.5px;line-height:19px}.tNGryG_error{border:1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary,#ec1313) 34%, transparent);border-radius:var(--dsw-radius-md,12px);background:color-mix(in srgb, var(--dsw-alias-state-error-primary,#ec1313) 8%, transparent);text-align:center;flex-direction:column;align-items:center;gap:8px;padding:32px 20px;display:flex}.tNGryG_errorIcon{color:var(--dsw-alias-state-error-primary,#ec1313)}.tNGryG_errorTitle{color:var(--dsw-alias-label-primary,#0f1115);margin:0;font-size:14px;font-weight:600;line-height:21px}.tNGryG_errorDetail{max-width:60ch;color:var(--dsw-alias-label-tertiary,#81858c);overflow-wrap:anywhere;margin:0;font-size:12px;line-height:19px}.tNGryG_skeletonCard{border:1px solid var(--dsw-alias-border-l2,#e4e6eb);background:var(--dsw-alias-bg-layer-1,#fff);border-radius:14px;flex-direction:column;gap:12px;min-height:190px;padding:20px;display:flex}.tNGryG_skeletonHeader{align-items:center;gap:12px;margin-bottom:6px;display:flex}.tNGryG_skeletonAvatar,.tNGryG_skeletonTitle,.tNGryG_skeletonLine,.tNGryG_skeletonShort{background:var(--dsw-alias-border-l2,#0000001a);border-radius:5px;animation:1.6s ease-in-out infinite alternate tNGryG_skeletonPulse;display:block}.tNGryG_skeletonAvatar{border-radius:12px;flex:none;width:44px;height:44px}.tNGryG_skeletonTitle{width:55%;height:18px}.tNGryG_skeletonLine{width:100%;height:12px}.tNGryG_skeletonShort{width:42%;height:12px}.tNGryG_more{min-height:32px}@keyframes tNGryG_skeletonPulse{to{opacity:.4}}@media (prefers-reduced-motion:reduce){.tNGryG_skeletonAvatar,.tNGryG_skeletonTitle,.tNGryG_skeletonLine,.tNGryG_skeletonShort{animation:none}}@media (width<=380px){.tNGryG_grid{grid-template-columns:minmax(0,1fr)}}.tNGryG_scope{color:var(--dsw-alias-label-tertiary,#81858c);flex-wrap:wrap;align-items:baseline;gap:4px 8px;margin:-6px 0 0;font-size:12px;line-height:18px;display:flex}.tNGryG_scopeSwitch{color:var(--dsw-alias-state-business-primary,#4176e6);font:inherit;cursor:pointer;background:0 0;border:none;padding:0}.tNGryG_scopeSwitch:disabled{cursor:default;opacity:.5}.tNGryG_scopeSwitch:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#4176e6);outline-offset:2px}";
		const tagId$1 = "@nanmicoder/dsh-skills-hub/MarketHome.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@nanmicoder/dsh-skills-hub";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var MarketHome_module_css_default = {
			"body": "tNGryG_body",
			"canvas": "tNGryG_canvas",
			"count": "tNGryG_count",
			"countNote": "tNGryG_countNote",
			"empty": "tNGryG_empty",
			"emptyText": "tNGryG_emptyText",
			"emptyTitle": "tNGryG_emptyTitle",
			"error": "tNGryG_error",
			"errorDetail": "tNGryG_errorDetail",
			"errorIcon": "tNGryG_errorIcon",
			"errorTitle": "tNGryG_errorTitle",
			"grid": "tNGryG_grid",
			"home": "tNGryG_home",
			"loading": "tNGryG_loading",
			"mark": "tNGryG_mark",
			"masthead": "tNGryG_masthead",
			"mastheadText": "tNGryG_mastheadText",
			"more": "tNGryG_more",
			"scope": "tNGryG_scope",
			"scopeSwitch": "tNGryG_scopeSwitch",
			"skeletonAvatar": "tNGryG_skeletonAvatar",
			"skeletonCard": "tNGryG_skeletonCard",
			"skeletonHeader": "tNGryG_skeletonHeader",
			"skeletonLine": "tNGryG_skeletonLine",
			"skeletonPulse": "tNGryG_skeletonPulse",
			"skeletonShort": "tNGryG_skeletonShort",
			"skeletonTitle": "tNGryG_skeletonTitle",
			"statusRow": "tNGryG_statusRow",
			"subtitle": "tNGryG_subtitle",
			"title": "tNGryG_title",
			"top": "tNGryG_top"
		};
		//#endregion
		//#region lib/client/components/MarketHome.js
		/**
		* How far ahead of the end of the list the next page is fetched.
		*
		* The catalogue scrolls inside the host's dock rather than the document, and an
		* observer whose root is the viewport is clipped by that dock: `rootMargin` on
		* the viewport is dead weight there (measured: the same sentinel reports
		* "not intersecting" 412px below the fold with a viewport root, and
		* "intersecting" with the dock as root). The margin therefore only means
		* anything once the observer is given the real scroll container.
		*/
		const PREFETCH_MARGIN = "900px 0px";
		/** Nearest scrollable ancestor, or `null` when the list scrolls with the document. */
		function scrollContainerOf(element) {
			let node = element.parentElement;
			while (node !== null && node !== document.body) {
				const overflowY = getComputedStyle(node).overflowY;
				if ((overflowY === "auto" || overflowY === "scroll") && node.scrollHeight > node.clientHeight) return node;
				node = node.parentElement;
			}
			return null;
		}
		/**
		* Market catalogue page.
		*
		* Presentational by contract: every interaction below is a call on the
		* controller, and every rendered value comes from `state`. That keeps the
		* whole page renderable in a bare test render with no services and no fetch.
		*/
		function MarketHome(props) {
			const { state, controller } = props;
			const t = useT();
			const sentinelRef = (0, react.useRef)(null);
			const [scrolled, setScrolled] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				if (scrolled) return;
				const mark = () => setScrolled(true);
				document.addEventListener("scroll", mark, {
					capture: true,
					passive: true,
					once: true
				});
				return () => document.removeEventListener("scroll", mark, { capture: true });
			}, [scrolled]);
			(0, react.useEffect)(() => {
				const sentinel = sentinelRef.current;
				if (sentinel === null || !scrolled || state.nextCursor === null || state.loading || state.loadingMore || state.error !== null) return;
				const observer = new IntersectionObserver((entries) => {
					if (entries.some((entry) => entry.isIntersecting)) controller.loadMore();
				}, {
					root: scrollContainerOf(sentinel),
					rootMargin: PREFETCH_MARGIN
				});
				observer.observe(sentinel);
				return () => observer.disconnect();
			}, [
				controller,
				scrolled,
				state.nextCursor,
				state.loading,
				state.loadingMore,
				state.error
			]);
			/**
			* The filter bar reports a patch; the controller exposes one setter per
			* field. Each branch is guarded so an unrelated key in the patch cannot
			* trigger a redundant reload.
			*/
			const applyFilterPatch = (patch) => {
				if (patch.q !== void 0) controller.setQuery(patch.q);
				if (patch.source !== void 0) controller.setSource(patch.source);
				if (patch.security !== void 0) controller.setSecurity(patch.security);
				if (patch.installed !== void 0) controller.setInstalledFilter(patch.installed);
			};
			const hasItems = state.items.length > 0;
			const searching = state.filters.q.trim() !== "";
			const isInitialLoad = state.loading && !hasItems;
			const narrowed = state.filters.q !== "" || state.filters.category !== "all" || state.filters.source !== "all" || state.filters.security !== "all" || state.filters.installed !== "all";
			const catalogue = state.filters.scope === "catalog";
			const catalogueAt = catalogue ? state.sources.clawhub.fetchedAt : void 0;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: MarketHome_module_css_default.home,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: MarketHome_module_css_default.top,
					children: [
						(0, react_jsx_runtime.jsxs)("header", {
							className: MarketHome_module_css_default.masthead,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: MarketHome_module_css_default.mark,
								"aria-hidden": "true",
								children: (0, react_jsx_runtime.jsx)(SkillsHubIcon, { size: 22 })
							}), (0, react_jsx_runtime.jsxs)("div", {
								className: MarketHome_module_css_default.mastheadText,
								children: [(0, react_jsx_runtime.jsx)("h1", {
									className: MarketHome_module_css_default.title,
									children: t("title")
								}), (0, react_jsx_runtime.jsx)("p", {
									className: MarketHome_module_css_default.subtitle,
									children: t("subtitle")
								})]
							})]
						}),
						!state.disclaimerDismissed && (0, react_jsx_runtime.jsx)(MarketDisclaimer, { onDismiss: () => controller.dismissDisclaimer() }),
						catalogue && (0, react_jsx_runtime.jsx)(CategoryBar, {
							categories: state.categories,
							active: state.filters.category,
							disabled: state.loading,
							onSelect: (category) => controller.setCategory(category)
						}),
						(0, react_jsx_runtime.jsx)(FilterBar, {
							filters: state.filters,
							total: state.items.length,
							disabled: state.loading,
							onChange: applyFilterPatch
						})
					]
				}), (0, react_jsx_runtime.jsxs)("div", {
					className: MarketHome_module_css_default.canvas,
					children: [
						(0, react_jsx_runtime.jsxs)("div", {
							className: MarketHome_module_css_default.statusRow,
							children: [(0, react_jsx_runtime.jsxs)("p", {
								className: MarketHome_module_css_default.count,
								"aria-live": "polite",
								children: [isInitialLoad ? t("loading") : catalogue && state.total !== null ? t("catalogSummary", { count: state.total }) : t(catalogue ? "count" : "liveResults", { count: state.items.length }), catalogueAt !== void 0 && (0, react_jsx_runtime.jsx)("span", {
									className: MarketHome_module_css_default.countNote,
									title: formatStamp(catalogueAt),
									children: t("catalogUpdated", { date: new Date(catalogueAt).toISOString().slice(0, 10) })
								})]
							}), !catalogue && (0, react_jsx_runtime.jsx)(SourceStatusBar, {
								sources: state.sources,
								onRefresh: () => void controller.refresh({ force: true }),
								refreshing: state.loading
							})]
						}),
						searching && (0, react_jsx_runtime.jsxs)("p", {
							className: MarketHome_module_css_default.scope,
							children: [catalogue ? t("scope.catalogHint") : t("scope.marketHint"), (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: MarketHome_module_css_default.scopeSwitch,
								disabled: state.loading,
								onClick: () => controller.setScope(catalogue ? "market" : "catalog"),
								children: catalogue ? t("scope.searchMarket", { q: state.filters.q.trim() }) : t("scope.backToCatalog")
							})]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: MarketHome_module_css_default.body,
							"aria-busy": state.loading,
							children: [
								state.error !== null && (0, react_jsx_runtime.jsxs)("div", {
									className: MarketHome_module_css_default.error,
									role: "alert",
									children: [
										(0, react_jsx_runtime.jsx)(AlertIcon, {
											size: 22,
											className: MarketHome_module_css_default.errorIcon
										}),
										(0, react_jsx_runtime.jsx)("p", {
											className: MarketHome_module_css_default.errorTitle,
											children: t("error")
										}),
										(0, react_jsx_runtime.jsx)("p", {
											className: MarketHome_module_css_default.errorDetail,
											children: state.error
										}),
										(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "outline",
											size: "md",
											icon: (0, react_jsx_runtime.jsx)(RefreshIcon, { size: 16 }),
											onClick: () => void (hasItems ? controller.loadMore() : controller.refresh()),
											children: t("retry")
										})
									]
								}),
								state.error === null && isInitialLoad && (0, react_jsx_runtime.jsx)("div", {
									role: "status",
									"aria-label": t("loading"),
									children: (0, react_jsx_runtime.jsx)("div", {
										className: MarketHome_module_css_default.grid,
										"aria-hidden": "true",
										children: Array.from({ length: 8 }, (_, index) => (0, react_jsx_runtime.jsxs)("div", {
											className: MarketHome_module_css_default.skeletonCard,
											children: [
												(0, react_jsx_runtime.jsxs)("div", {
													className: MarketHome_module_css_default.skeletonHeader,
													children: [(0, react_jsx_runtime.jsx)("span", { className: MarketHome_module_css_default.skeletonAvatar }), (0, react_jsx_runtime.jsx)("span", { className: MarketHome_module_css_default.skeletonTitle })]
												}),
												(0, react_jsx_runtime.jsx)("span", { className: MarketHome_module_css_default.skeletonLine }),
												(0, react_jsx_runtime.jsx)("span", { className: MarketHome_module_css_default.skeletonLine }),
												(0, react_jsx_runtime.jsx)("span", { className: MarketHome_module_css_default.skeletonShort })
											]
										}, index))
									})
								}),
								state.error === null && !state.loading && !hasItems && state.nextCursor === null && (0, react_jsx_runtime.jsxs)("div", {
									className: MarketHome_module_css_default.empty,
									children: [
										(0, react_jsx_runtime.jsx)(SkillsHubIcon, { size: 26 }),
										(0, react_jsx_runtime.jsx)("p", {
											className: MarketHome_module_css_default.emptyTitle,
											children: narrowed ? t("emptySearch") : t("empty")
										}),
										(0, react_jsx_runtime.jsx)("p", {
											className: MarketHome_module_css_default.emptyText,
											children: narrowed ? t("emptySearchHint") : t("emptyHint")
										})
									]
								}),
								hasItems && (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: (0, react_jsx_runtime.jsx)("div", {
									className: MarketHome_module_css_default.grid,
									children: state.items.map((skill) => (0, react_jsx_runtime.jsx)(SkillCard, {
										skill,
										installing: state.installingIds.has(skill.id),
										onOpen: (id) => void controller.openDetail(id),
										onInstall: (id) => controller.requestInstall(id)
									}, skill.id))
								}) }),
								state.nextCursor !== null && (0, react_jsx_runtime.jsx)("div", {
									ref: sentinelRef,
									className: MarketHome_module_css_default.more,
									children: state.loadingMore && (0, react_jsx_runtime.jsxs)("p", {
										className: MarketHome_module_css_default.loading,
										role: "status",
										"aria-live": "polite",
										children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
											state: "ongoing",
											size: 16
										}), t("loadingMore")]
									})
								})
							]
						})
					]
				})]
			});
		}
		//#endregion
		//#region lib/client/state.js
		/**
		* Skills Hub panel state machine — framework-free, so it is unit-testable
		* outside React.
		*
		* Ported from the reference desktop store (`desktop/src/stores/marketStore.ts`)
		* with the same invariants:
		*
		*  - **stale-response rejection**: every request family carries a monotonically
		*    increasing sequence; a response whose sequence is no longer current is
		*    dropped instead of overwriting newer state.
		*  - **merge by id**: a page append and an install/uninstall patch both merge on
		*    `NormalizedSkill.id`, and pagination never duplicates a skill the list
		*    already holds.
		*  - **in-flight guards**: one install/uninstall per id, one page per cursor, one
		*    detail/file request per target.
		*  - **detail snapshots**: reopening can show the previous copy immediately,
		*    while the Host rechecks its TTL and current install annotations.
		*  - **local management**: the InstalledSkills component independently lists what is already
		*    on disk (`fetchInstalled`) instead of asking the market, matching the
		*    contract's §5.3 behaviour.
		*
		* Aborts are control flow, never user-visible: the panel aborts superseded
		* requests on purpose, and `isAbortError` keeps those rejections out of
		* `state.error` / `state.notice`.
		*/
		/** One remote page (the reference store's `PAGE_SIZE`). */
		const PAGE_SIZE = 24;
		/** localStorage key of the dismissed disclaimer (frozen by docs/CONTRACT.md §5.3). */
		const DISCLAIMER_STORAGE_KEY = "dsh-skills-hub.disclaimer";
		/**
		* Notice values that are dictionary *codes* rather than literal text.
		*
		* The controller has no locale (it is framework-free and testable), so it stores
		* a code for the panel to translate and stores a verbatim message for anything
		* that has no dictionary entry — which is exactly what a Host error is.
		*/
		const MARKET_NOTICE_CODES = ["installDone", "uninstallDone"];
		/** Whether a `state.notice` value is a dictionary code (as opposed to verbatim text). */
		function isMarketNoticeCode(notice) {
			return MARKET_NOTICE_CODES.includes(notice);
		}
		/** Baseline source health, mirroring the Host's own initial value (`{ status: 'ok' }` per source). */
		function emptySources() {
			return {
				clawhub: { status: "ok" },
				skillhub: { status: "ok" }
			};
		}
		function initialState() {
			return {
				filters: {
					q: "",
					scope: "catalog",
					category: "all",
					source: "all",
					security: "all",
					installed: "all"
				},
				categories: [],
				items: [],
				nextCursor: null,
				total: null,
				sources: emptySources(),
				itemStatuses: {},
				loading: false,
				loadingMore: false,
				error: null,
				view: { kind: "home" },
				detail: null,
				detailStatus: null,
				detailLoading: false,
				detailError: null,
				activeTab: "overview",
				file: null,
				fileLoading: false,
				installingIds: /* @__PURE__ */ new Set(),
				confirmInstallId: null,
				disclaimerDismissed: readDisclaimerDismissed(),
				notice: null
			};
		}
		/** Read the persisted disclaimer dismissal; storage may be unavailable (private mode, sandboxed frame). */
		function readDisclaimerDismissed() {
			try {
				return globalThis.localStorage?.getItem(DISCLAIMER_STORAGE_KEY) === "1";
			} catch {
				return false;
			}
		}
		/** Persist the dismissal; a storage failure only means it is not remembered. */
		function writeDisclaimerDismissed() {
			try {
				globalThis.localStorage?.setItem(DISCLAIMER_STORAGE_KEY, "1");
			} catch {}
		}
		function errorMessage(error) {
			return error instanceof Error ? error.message : String(error);
		}
		function withId(ids, id) {
			const next = new Set(ids);
			next.add(id);
			return next;
		}
		function withoutId(ids, id) {
			const next = new Set(ids);
			next.delete(id);
			return next;
		}
		function fileCacheKey(id, path) {
			return `${id}\u0000${path}`;
		}
		/** Replace one source's health without dropping the others. */
		function mergeSourceStatus(sources, source, status) {
			return {
				...sources,
				[source]: status
			};
		}
		function itemStatuses(items, sources) {
			return Object.fromEntries(items.map((item) => [item.id, sources[item.source]]));
		}
		/** Copy the install-related fields of a fresh skill onto a cached detail. */
		function patchDetail(detail, updated) {
			return {
				...detail,
				installState: updated.installState,
				notInstallableReason: updated.notInstallableReason,
				installedInfo: updated.installedInfo
			};
		}
		function createInternalController() {
			let state = initialState();
			const listeners = /* @__PURE__ */ new Set();
			const detailCache = /* @__PURE__ */ new Map();
			let listSequence = 0;
			let detailSequence = 0;
			let fileSequence = 0;
			let listAbort = null;
			let detailAbort = null;
			let fileAbort = null;
			let inFlightList = null;
			let inFlightCursor = null;
			let inFlightFileKey = null;
			const owners = /* @__PURE__ */ new Map();
			function rememberOwners(items) {
				for (const item of items) if (item.source === "clawhub" && item.author.handle) owners.set(item.id, item.author.handle);
			}
			function ownerOf(id) {
				return owners.get(id);
			}
			function commit(patch) {
				if (patch.items) rememberOwners(patch.items);
				if (patch.detail) rememberOwners([patch.detail]);
				state = {
					...state,
					...patch
				};
				for (const listener of [...listeners]) listener();
			}
			function getSnapshot() {
				return state;
			}
			function subscribe(listener) {
				listeners.add(listener);
				return () => {
					listeners.delete(listener);
				};
			}
			/** Identity of a list request: any filter change makes a different request. */
			function currentListKey() {
				const { q, scope, category, source, security, installed } = state.filters;
				return JSON.stringify([
					q.trim(),
					scope,
					category,
					source,
					security,
					installed
				]);
			}
			function setNotice(notice) {
				commit({ notice });
			}
			/** Whether a skill still belongs in the list under the active installed-filter. */
			function keepUnderInstalledFilter(skill) {
				if (state.filters.installed === "installed") return skill.installState === "installed";
				if (state.filters.installed === "installable") return skill.installState !== "installed";
				return true;
			}
			/**
			* Apply the Host's authoritative skill record after an install/uninstall.
			*
			* The list, the open detail and the detail cache are patched together: leaving
			* the cache alone would resurrect the pre-install badge the next time the skill
			* is opened, which is exactly the stale state the reference store guards
			* against.
			*/
			function applySkillUpdate(updated) {
				const patch = { items: state.items.map((item) => item.id === updated.id ? {
					...item,
					...updated
				} : item).filter(keepUnderInstalledFilter) };
				if (state.detail !== null && state.detail.id === updated.id) {
					const patched = patchDetail(state.detail, updated);
					detailCache.set(updated.id, {
						skill: patched,
						status: state.detailStatus ?? { status: "ok" }
					});
					patch.detail = patched;
				} else {
					const cached = detailCache.get(updated.id);
					if (cached !== void 0) detailCache.set(updated.id, {
						skill: patchDetail(cached.skill, updated),
						status: cached.status
					});
				}
				commit(patch);
			}
			/**
			* Load the first page for the current filters.
			*
			* Concurrent callers asking for the *same* filters share one request: the panel
			* root and the catalogue component both kick off the first load, and React's
			* development double-invocation repeats it. A different filter set always
			* issues a fresh request.
			*/
			async function refresh(options = {}) {
				detailCache.clear();
				const key = currentListKey();
				const running = inFlightList;
				if (running !== null && running.key === key) return running.promise;
				const filters = state.filters;
				const sequence = ++listSequence;
				listAbort?.abort();
				const controller = new AbortController();
				listAbort = controller;
				inFlightCursor = null;
				commit({
					loading: true,
					loadingMore: false,
					error: null,
					items: [],
					itemStatuses: {},
					nextCursor: null,
					total: null
				});
				const promise = (async () => {
					try {
						const result = await fetchMarketList({
							q: filters.q.trim() || void 0,
							scope: filters.scope,
							category: filters.category,
							source: filters.source,
							security: filters.security,
							installed: filters.installed,
							limit: PAGE_SIZE
						}, controller.signal, { refresh: options.force === true });
						if (sequence !== listSequence) return;
						commit({
							items: result.items,
							nextCursor: result.nextCursor,
							total: result.total ?? null,
							sources: result.sources,
							itemStatuses: itemStatuses(result.items, result.sources),
							loading: false
						});
					} catch (error) {
						if (sequence !== listSequence || isAbortError(error)) return;
						commit({
							error: errorMessage(error),
							loading: false
						});
					} finally {
						if (inFlightList?.sequence === sequence) inFlightList = null;
					}
				})();
				inFlightList = {
					key,
					sequence,
					promise
				};
				return promise;
			}
			/** Append the next page, de-duplicating by id and by cursor. */
			async function loadMore() {
				const cursor = state.nextCursor;
				if (cursor === null || state.loadingMore || state.loading) return;
				if (inFlightCursor === cursor) return;
				const filters = state.filters;
				const sequence = listSequence;
				inFlightCursor = cursor;
				commit({
					loadingMore: true,
					error: null
				});
				try {
					const result = await fetchMarketList({
						q: filters.q.trim() || void 0,
						scope: filters.scope,
						category: filters.category,
						source: filters.source,
						security: filters.security,
						installed: filters.installed,
						cursor,
						limit: PAGE_SIZE
					}, listAbort?.signal);
					if (sequence !== listSequence) return;
					const seen = new Set(state.items.map((item) => item.id));
					const appended = result.items.filter((item) => !seen.has(item.id));
					commit({
						items: [...state.items, ...appended],
						nextCursor: result.nextCursor,
						sources: result.sources,
						itemStatuses: {
							...state.itemStatuses,
							...itemStatuses(appended, result.sources)
						},
						loadingMore: false
					});
				} catch (error) {
					if (sequence !== listSequence || isAbortError(error)) return;
					commit({
						loadingMore: false,
						error: errorMessage(error)
					});
				} finally {
					if (inFlightCursor === cursor) inFlightCursor = null;
				}
			}
			/**
			* Applies a submitted query. The search field keeps its own draft and only
			* calls this on Enter (or clear), so typing never reloads the catalogue.
			*/
			function applyInstantFilter(patch) {
				commit({ filters: {
					...state.filters,
					...patch
				} });
				refresh();
			}
			function setQuery(q) {
				applyInstantFilter(q.trim() === "" ? {
					q,
					scope: "catalog"
				} : { q });
			}
			let categoriesRequest = null;
			/**
			* The bar is navigation over the catalogue: a failure leaves it hidden and is
			* retried on the next call, never surfaced as a catalogue error.
			*/
			function loadCategories() {
				if (categoriesRequest !== null) return categoriesRequest;
				const request = (async () => {
					try {
						const result = await fetchMarketCategories();
						commit({ categories: result.items });
						if (result.items.length === 0) categoriesRequest = null;
					} catch {
						categoriesRequest = null;
					}
				})();
				categoriesRequest = request;
				return request;
			}
			function isCurrentDetail(id) {
				return state.view.kind === "detail" && state.view.id === id;
			}
			async function loadDetail(id, options = {}) {
				const sequence = ++detailSequence;
				detailAbort?.abort();
				const controller = new AbortController();
				detailAbort = controller;
				try {
					const { skill, sourceStatus } = await fetchSkillDetail(id, controller.signal, {
						refresh: options.refresh === true,
						owner: ownerOf(id)
					});
					if (sequence !== detailSequence || !isCurrentDetail(id)) return;
					detailCache.set(id, {
						skill,
						status: sourceStatus
					});
					commit({
						detail: skill,
						detailStatus: sourceStatus,
						detailLoading: false,
						detailError: null,
						sources: mergeSourceStatus(state.sources, skill.source, sourceStatus)
					});
				} catch (error) {
					if (sequence !== detailSequence || isAbortError(error)) return;
					detailCache.delete(id);
					commit({
						detail: null,
						detailStatus: null,
						detailLoading: false,
						detailError: errorMessage(error)
					});
				}
			}
			/** Show a previous copy immediately, then check the Host's authoritative cache. */
			async function openDetail(id, options = {}) {
				if (options.owner) owners.set(id, options.owner);
				const cached = options.refresh === true ? void 0 : detailCache.get(id);
				fileSequence += 1;
				fileAbort?.abort();
				inFlightFileKey = null;
				commit({
					view: {
						kind: "detail",
						id
					},
					activeTab: "overview",
					file: null,
					fileLoading: false,
					detailError: null
				});
				if (cached !== void 0) commit({
					detail: cached.skill,
					detailStatus: {
						...cached.status,
						fromCache: true
					},
					detailLoading: false
				});
				else commit({
					detail: null,
					detailStatus: null,
					detailLoading: true
				});
				await loadDetail(id, options);
			}
			function closeDetail() {
				detailSequence += 1;
				fileSequence += 1;
				detailAbort?.abort();
				fileAbort?.abort();
				commit({
					view: { kind: "home" },
					detail: null,
					detailStatus: null,
					detailLoading: false,
					detailError: null,
					file: null,
					fileLoading: false,
					activeTab: "overview"
				});
			}
			function setTab(tab) {
				commit({ activeTab: tab });
				if (tab !== "files") return;
				if (state.file !== null || state.fileLoading) return;
				const detail = state.detail;
				if (detail === null) return;
				const first = detail.files[0];
				if (first === void 0) return;
				selectFile(first.path);
			}
			/** Read through the Host's TTL cache, with one in-flight request per path. */
			async function selectFile(path) {
				if (state.view.kind !== "detail") return;
				const id = state.view.id;
				const key = fileCacheKey(id, path);
				if (inFlightFileKey === key) return;
				const sequence = ++fileSequence;
				fileAbort?.abort();
				const controller = new AbortController();
				fileAbort = controller;
				inFlightFileKey = key;
				commit({
					file: null,
					fileLoading: true
				});
				try {
					const file = await fetchSkillFile(id, path, controller.signal, ownerOf(id));
					if (sequence !== fileSequence) return;
					commit({
						file,
						fileLoading: false
					});
				} catch (error) {
					if (sequence !== fileSequence || isAbortError(error)) return;
					commit({
						file: null,
						fileLoading: false,
						notice: errorMessage(error)
					});
				} finally {
					if (inFlightFileKey === key) inFlightFileKey = null;
				}
			}
			/** Ask for confirmation before installing; the dialog is the only way in. */
			function requestInstall(id) {
				if (state.installingIds.has(id)) return;
				commit({
					confirmInstallId: id,
					notice: null
				});
			}
			function cancelInstall() {
				const id = state.confirmInstallId;
				if (id === null) return;
				if (state.installingIds.has(id)) return;
				commit({ confirmInstallId: null });
			}
			async function confirmInstall() {
				const id = state.confirmInstallId;
				if (id === null || state.installingIds.has(id)) return;
				commit({
					installingIds: withId(state.installingIds, id),
					notice: null
				});
				try {
					applySkillUpdate((await installSkill(id, ownerOf(id))).skill);
					setNotice("installDone");
				} catch (error) {
					if (!isAbortError(error)) setNotice(errorMessage(error));
				} finally {
					commit({
						installingIds: withoutId(state.installingIds, id),
						confirmInstallId: null
					});
				}
			}
			/** Uninstall straight from a card or the detail rail — no confirmation dialog. */
			async function uninstall(id) {
				if (state.installingIds.has(id)) return;
				commit({
					installingIds: withId(state.installingIds, id),
					notice: null
				});
				try {
					applySkillUpdate((await uninstallSkill(id)).skill);
					setNotice("uninstallDone");
				} catch (error) {
					if (!isAbortError(error)) setNotice(errorMessage(error));
				} finally {
					commit({ installingIds: withoutId(state.installingIds, id) });
				}
			}
			function dismissDisclaimer() {
				commit({ disclaimerDismissed: true });
				writeDisclaimerDismissed();
			}
			function dismissNotice() {
				setNotice(null);
			}
			return {
				get state() {
					return state;
				},
				injected: { useMarketController },
				refresh,
				loadMore,
				setQuery,
				setCategory: (category) => {
					if (category === state.filters.category) return;
					applyInstantFilter({ category });
				},
				loadCategories,
				setScope: (scope) => {
					if (scope === state.filters.scope) return;
					applyInstantFilter({ scope });
				},
				setSource: (source) => {
					applyInstantFilter({ source });
				},
				setSecurity: (security) => {
					applyInstantFilter({ security });
				},
				setInstalledFilter: (installed) => {
					applyInstantFilter({ installed });
				},
				openDetail,
				closeDetail,
				setTab,
				selectFile,
				requestInstall,
				cancelInstall,
				confirmInstall,
				uninstall,
				dismissDisclaimer,
				dismissNotice,
				subscribe,
				getSnapshot
			};
		}
		/**
		* React binding.
		*
		* `useSyncExternalStore` is the whole subscription: React owns the subscribe /
		* unsubscribe pairing, so an unmount cannot leak a listener, and the initializer
		* runs at most twice under StrictMode's development double-invocation (the extra
		* controller is discarded and holds no resources — no request, timer or
		* subscription exists until the panel asks for one).
		*
		* There is deliberately no unmount disposer: a StrictMode cleanup would tear down
		* the controller React is still using, and a late response writing into this
		* store is inert — nothing but the snapshot identity of an external store
		* changes, so no React state update happens after unmount.
		*/
		function useMarketController() {
			const [controller] = (0, react.useState)(createInternalController);
			(0, react.useSyncExternalStore)(controller.subscribe, controller.getSnapshot, controller.getSnapshot);
			return controller;
		}
		//#endregion
		//#region \0dsh-css:src/client/page/MarketPage.module.css.mjs
		const css = ".fbxsOq_panel{box-sizing:border-box;height:100%;min-height:0;color:var(--dsw-alias-label-primary,#1f2329);background:var(--dsw-alias-bg-base,#fff);flex-direction:column;display:flex;overflow:hidden}.fbxsOq_body{flex-direction:column;flex:auto;min-height:0;display:flex;overflow:auto}.fbxsOq_placeholder{text-align:center;flex-direction:column;flex:auto;justify-content:center;align-items:center;gap:12px;padding:48px 24px;display:flex}.fbxsOq_placeholderTitle{color:var(--dsw-alias-label-primary,#1f2329);margin:0;font-size:15px;font-weight:600}.fbxsOq_placeholderText{overflow-wrap:anywhere;max-width:460px;color:var(--dsw-alias-label-tertiary,#8a9099);margin:0;font-size:13px;line-height:1.6}.fbxsOq_retryButton{box-sizing:border-box;font:inherit;color:var(--dsw-alias-label-primary,#1f2329);cursor:pointer;background:var(--dsw-alias-bg-layer-1,#f5f6f7);border:1px solid var(--dsw-alias-border-l2,#e5e7eb);border-radius:8px;padding:6px 16px;font-size:13px}.fbxsOq_retryButton:hover{background:var(--dsw-alias-interactive-bg-hover,#eceef0)}.fbxsOq_retryButton:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4d6bfe);outline-offset:2px}.fbxsOq_spinner{border:2px solid var(--dsw-alias-border-l2,#e5e7eb);border-top-color:var(--dsw-alias-brand-primary,#4d6bfe);border-radius:50%;width:20px;height:20px;animation:.8s linear infinite fbxsOq_spin}@keyframes fbxsOq_spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.fbxsOq_spinner{animation-duration:2.4s}}.fbxsOq_navigation{border-bottom:1px solid var(--dsw-alias-border-l2,#e5e5e5);gap:20px;padding:0 28px;display:flex}.fbxsOq_navigation button{color:var(--dsw-alias-label-secondary,#777);font:inherit;cursor:pointer;background:0 0;border:0;border-bottom:2px solid #0000;padding:14px 0;font-size:13px}.fbxsOq_navigation button[aria-current]{color:var(--dsw-alias-label-primary,#222);border-bottom-color:currentColor;font-weight:600}";
		const tagId = "@nanmicoder/dsh-skills-hub/MarketPage.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "@nanmicoder/dsh-skills-hub";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var MarketPage_module_css_default = {
			"body": "fbxsOq_body",
			"navigation": "fbxsOq_navigation",
			"panel": "fbxsOq_panel",
			"placeholder": "fbxsOq_placeholder",
			"placeholderText": "fbxsOq_placeholderText",
			"placeholderTitle": "fbxsOq_placeholderTitle",
			"retryButton": "fbxsOq_retryButton",
			"spin": "fbxsOq_spin",
			"spinner": "fbxsOq_spinner"
		};
		//#endregion
		//#region lib/client/page/MarketPage.js
		/**
		* Skills Hub panel root.
		*
		* Responsibilities, and nothing else:
		*  - own exactly one controller per mounted panel instance (`props.useMarketController`);
		*  - route `state.view` to `MarketHome` or `SkillDetailView`;
		*  - render the install confirmation the controller asked for;
		*  - render one notice toast for `state.notice`.
		*
		* This is also the only component the slot machinery calls, so it is the only
		* place that receives the framework's `t` seat (`PropsLocale<NS>`); it publishes
		* that seat through `LocaleProvider` for every descendant, which keeps the
		* presentational components free of slot props (contract §5.4).
		*/
		/** Panel entry: bind the controller and publish the locale seat. */
		function MarketPage(props) {
			const controller = props.useMarketController();
			return (0, react_jsx_runtime.jsx)(LocaleProvider, {
				t: props.t,
				children: (0, react_jsx_runtime.jsx)(MarketPageSurface, { controller })
			});
		}
		function MarketPageSurface({ controller }) {
			const t = useT();
			const [section, setSection] = (0, react.useState)("market");
			const state = controller.state;
			const detailId = state.view.kind === "detail" ? state.view.id : null;
			(0, react.useEffect)(() => {
				controller.refresh();
				controller.loadCategories();
			}, [controller]);
			const confirmSkill = state.confirmInstallId === null ? null : confirmSkillOf(state, state.confirmInstallId);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: MarketPage_module_css_default.panel,
				children: [
					(0, react_jsx_runtime.jsxs)("nav", {
						className: MarketPage_module_css_default.navigation,
						"aria-label": t("panel"),
						children: [(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-current": section === "market" ? "page" : void 0,
							onClick: () => setSection("market"),
							children: t("marketTab")
						}), (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							"aria-current": section === "installed" ? "page" : void 0,
							onClick: () => setSection("installed"),
							children: t("installedTitle")
						})]
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: MarketPage_module_css_default.body,
						children: section === "installed" ? (0, react_jsx_runtime.jsx)(InstalledSkills, {
							onChanged: () => {
								controller.closeDetail();
								controller.refresh();
							},
							onOpenMarket: (id, owner) => {
								setSection("market");
								controller.openDetail(id, { owner });
							}
						}) : state.view.kind === "home" ? (0, react_jsx_runtime.jsx)(MarketHome, {
							state,
							controller
						}) : state.detail !== null ? (0, react_jsx_runtime.jsx)(MarketSkillDetail, {
							detail: state.detail,
							state,
							controller
						}) : state.detailError === null ? (0, react_jsx_runtime.jsx)(SkillDetailSkeleton, { onBack: () => controller.closeDetail() }) : (0, react_jsx_runtime.jsxs)("div", {
							className: MarketPage_module_css_default.placeholder,
							role: state.detailError === null ? "status" : "alert",
							children: [
								state.detailError === null ? (0, react_jsx_runtime.jsx)("span", {
									className: MarketPage_module_css_default.spinner,
									"aria-hidden": "true"
								}) : null,
								(0, react_jsx_runtime.jsx)("p", {
									className: MarketPage_module_css_default.placeholderTitle,
									children: state.detailError === null ? t("loading") : t("error")
								}),
								state.detailError === null ? null : (0, react_jsx_runtime.jsx)("p", {
									className: MarketPage_module_css_default.placeholderText,
									children: state.detailError
								}),
								state.detailError === null || detailId === null ? null : (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: MarketPage_module_css_default.retryButton,
									onClick: () => {
										controller.openDetail(detailId);
									},
									children: t("retry")
								})
							]
						})
					}),
					confirmSkill === null ? null : (0, react_jsx_runtime.jsx)(InstallConfirmDialog, {
						skill: confirmSkill,
						busy: state.installingIds.has(confirmSkill.id),
						onCancel: () => {
							controller.cancelInstall();
						},
						onConfirm: () => {
							controller.confirmInstall();
						}
					}),
					state.notice === null ? null : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
						text: noticeText(t, state.notice),
						tone: isMarketNoticeCode(state.notice) ? "success" : void 0,
						holdMs: isMarketNoticeCode(state.notice) ? 2600 : 6e3,
						onDone: () => {
							controller.dismissNotice();
						}
					})
				]
			});
		}
		/** Dictionary code for a panel-generated notice; anything else is already reader-facing text. */
		function noticeText(t, notice) {
			return isMarketNoticeCode(notice) ? t(notice) : notice;
		}
		/**
		* Resolve the skill the confirmation dialog describes.
		*
		* It is normally the card (or the detail view) the reader clicked, but the dialog
		* must never be dropped on a state the panel cannot see — e.g. a deep link that
		* arrived before the list finished loading — so the id itself is the fallback.
		*/
		function confirmSkillOf(state, id) {
			const skill = (state.detail !== null && state.detail.id === id ? state.detail : null) ?? state.items.find((item) => item.id === id) ?? null;
			if (skill !== null) {
				const fromDetail = state.detail !== null && state.detail.id === id;
				const status = fromDetail ? state.detailStatus : state.itemStatuses[skill.id];
				const snapshotAt = status?.fromCache === true ? status.fetchedAt : void 0;
				return {
					id: skill.id,
					name: skill.name,
					source: skill.source,
					version: skill.version,
					iconUrl: skill.iconUrl,
					securityStatus: skill.securityStatus,
					authorName: skill.author.displayName ?? skill.author.handle,
					...fromDetail && state.detail !== null ? { detail: state.detail } : {},
					...snapshotAt === void 0 ? {} : { snapshotAt }
				};
			}
			return {
				id,
				name: id,
				source: sourceFromId(id),
				securityStatus: "unknown",
				authorName: ""
			};
		}
		/** Display-only fallback: only market ids reach this path. */
		function sourceFromId(id) {
			return id.startsWith("skillhub:") ? "skillhub" : "clawhub";
		}
		//#endregion
		//#region lib/client/locales.js
		/**
		* `skillsHub` dictionaries for the Skills Hub panel.
		*
		* Registration mechanics are copied from `dsh-agent-teams/src/client/locales.ts`
		* (same DSH version): the plugin calls `ctx.locale.register(NS, { zh, en })` and
		* every registration site that declares `locale: NS` receives the framework's
		* typed `t` seat. The namespace name is frozen by docs/CONTRACT.md §5.3.
		*/
		/** Dictionary namespace owned by the Skills Hub client plugin. */
		const NS = "skillsHub";
		/** Simplified Chinese dictionary. */
		const zh = {
			installedTitle: "已安装技能",
			marketTab: "技能市场",
			installedScope: "查看与管理当前主机的 DSH 用户技能、共享 agents 技能及配置的技能目录。项目级与内置技能不在此列表中。",
			installedSearch: "搜索已安装技能或路径",
			refreshInstalled: "刷新列表",
			installedEmpty: "尚未发现已安装的用户技能。",
			localSkill: "本机技能",
			linkedSkill: "链接",
			viewInstalled: "查看",
			localUninstallDescription: "将删除下方路径的技能及其全部文件。共享 agents 目录中的技能也会影响其他使用它的工具。",
			unlinkDescription: "仅移除此技能的符号链接，保留链接目标及其文件。",
			uninstalling: "正在卸载…",
			uninstallDisabled: "卸载已在插件配置中禁用。",
			copyPath: "复制路径",
			copiedPath: "已复制路径",
			sourceLabel: "来源",
			managedByHub: "由 Skills Hub 安装",
			unmanagedSkill: "手工放置",
			symlinkSkill: "符号链接",
			installedAtLabel: "安装时间",
			skillKind: "形态",
			bundleSkill: "目录包",
			flatSkill: "单文件",
			filesCount: "{count} 个文件",
			emptyDocument: "这个技能没有正文内容。",
			installedReadFailed: "读取本地技能失败。",
			openInMarket: "在市场查看",
			fileView: "文件视图",
			filePreview: "预览",
			fileSource: "源码",
			snapshotAge: "快照 {age}",
			ageJustNow: "刚刚",
			ageMinutes: "{count} 分钟前",
			ageHours: "{count} 小时前",
			ageDays: "{count} 天前",
			refreshNow: "重新获取（跳过缓存）",
			refreshSnapshot: "重新获取",
			detailSnapshot: "以下内容来自 {age} 的缓存快照，作者可能已经更新。",
			installSnapshot: "这里显示的市场数据是 {age} 的快照；点确认后会重新拉取最新清单再安装。",
			marketProvenance: "这个技能来自技能市场：作者说明、统计与安全报告在市场的详情页里；本地这一份可能已经改动过。",
			panel: "技能市场",
			title: "技能市场",
			subtitle: "浏览、预览并安装来自 ClawHub 与 SkillHub 的第三方技能。",
			searchPlaceholder: "搜索技能名称、作者或关键词，按 Enter 搜索",
			clearSearch: "清除搜索",
			"source.all": "全部来源",
			"source.clawhub": "ClawHub",
			"source.skillhub": "SkillHub",
			"source.local": "本机技能",
			"security.all": "全部安全状态",
			"security.verified": "已验证",
			"security.benign": "无风险",
			"security.unknown": "未知",
			"security.flagged": "有风险",
			"installed.all": "全部",
			"installed.installed": "已安装",
			"installed.installable": "可安装",
			"category.lang": "zh",
			"category.label": "分类",
			"category.all": "全部",
			categoryTag: "分类：{name}",
			breadcrumb: "位置",
			updatedOn: "更新于 {date}",
			needsApiKey: "需要 API Key",
			sourcePage: "源仓库",
			securityReport: "安全报告",
			changelog: "更新日志",
			whenToUse: "何时触发",
			info: "信息",
			latestUpdate: "最近更新",
			fullChangelog: "完整更新日志 →",
			olderVersions: "在源站查看历史版本",
			openChangelogFile: "查看技能自带的 {path}",
			noChangelog: "上游没有提供这个版本的更新说明。",
			scanReports: "扫描结果",
			noReports: "上游没有提供安全扫描结果。",
			scanDisclaimer: "扫描结论来自上游平台，本插件只做展示，不对其作担保；安装即表示你信任该作者。",
			readingTime: "约 {minutes} 分钟阅读",
			expand: "展开全文",
			collapse: "收起",
			capTitle: "安装前请了解：这个技能会做什么",
			viewFullReport: "查看完整报告 →",
			capNote: "以上由插件按规则从 SKILL.md 和文件列表中识别，仅供参考；安装本身不会执行任何脚本。",
			"cap.shell": "执行命令或脚本",
			"cap.shell.detail": "{evidence}",
			"cap.hooks": "注册 Hook",
			"cap.hooks.detail": "涉及 {evidence}",
			"cap.secrets": "需要密钥",
			"cap.secrets.detail": "读取 {evidence}",
			"cap.network": "访问网络服务",
			"cap.network.detail": "请求 {evidence}",
			"cap.writes": "写入文件",
			"cap.writes.detail": "创建或修改 {evidence}",
			"cap.binaries": "依赖本地命令",
			"cap.binaries.detail": "需要安装 {evidence}",
			"scan.verified": "安全扫描：已验证",
			"scan.benign": "安全扫描：通过",
			"scan.unknown": "安全扫描：未知",
			"scan.flagged": "安全扫描：可疑",
			installTitle: "安装 {name}",
			confirmInstall: "确认安装",
			willGet: "这个技能将获得",
			"level.high": "高",
			"level.medium": "中",
			"level.low": "低",
			installWarnFlagged: "上游安全扫描将此技能标记为可疑。安装即表示你信任该作者，请先查看安全报告。",
			installWarnUnknown: "上游没有这个技能的安全扫描结论。安装即表示你信任该作者，请先查看 SKILL.md。",
			ack: "我已查看 SKILL.md 与安全报告，了解上述权限",
			installedOn: "安装于 {date}",
			"scanShort.verified": "已验证",
			"scanShort.benign": "扫描通过",
			"scanShort.unknown": "未扫描",
			"scanShort.flagged": "可疑",
			catalogSummary: "共 {count} 个精选技能",
			catalogUpdated: "清单更新于 {date}",
			liveResults: "{count} 个实时结果",
			featured: "精选",
			"scope.catalogHint": "当前只在精选技能中搜索。",
			"scope.marketHint": "正在实时搜索 ClawHub 与 SkillHub 全部技能，未经精选审核。",
			"scope.searchMarket": "在全部市场中搜索「{q}」",
			"scope.backToCatalog": "回到精选",
			"filter.source": "来源",
			"filter.security": "安全状态",
			"filter.installed": "安装状态",
			count: "{count} 个技能",
			loading: "正在加载…",
			loadingMore: "正在加载更多…",
			loadMore: "加载更多",
			loadMoreError: "加载下一页失败",
			empty: "暂无技能",
			emptyHint: "上游市场暂时没有返回内容，稍后再试。",
			emptySearch: "没有匹配的技能",
			emptySearchHint: "换个关键词，或放宽筛选条件。",
			error: "技能市场暂时不可用",
			retry: "重试",
			install: "安装",
			installing: "正在安装…",
			installed: "已安装",
			notInstallable: "不可安装",
			uninstall: "卸载",
			uninstallConfirm: "确认卸载",
			uninstallTitle: "卸载「{name}」？",
			uninstallDescription: "卸载后该技能会从本地技能目录移除，skill 工具将不再提供它。",
			installConfirmMessage: "即将从 {source} 安装「{name}」。",
			installLocation: "安装位置",
			cancel: "取消",
			confirm: "确认",
			close: "关闭",
			back: "返回",
			overview: "概览",
			files: "文件",
			security: "安全",
			viewReport: "查看报告",
			frontmatter: "元数据",
			footnotes: "脚注",
			author: "作者",
			downloads: "下载",
			installs: "安装量",
			stars: "星标",
			updated: "更新于",
			license: "许可",
			version: "版本",
			disclaimer: "技能由第三方社区作者发布；Skills Hub 是社区插件，并非 DeepSeek 官方出品。精选清单只做整理推荐，不构成安全担保，安装即表示你信任该技能的作者，请先查看安全报告与 SKILL.md。",
			dismiss: "知道了",
			"sourceStatus.ok": "正常",
			"sourceStatus.degraded": "不稳定",
			"sourceStatus.failed": "不可用",
			"sourceStatus.cached": "缓存",
			installDone: "安装完成",
			uninstallDone: "已卸载",
			noFiles: "这个技能没有可预览的文件。",
			fileTooLarge: "文件过大，无法预览。",
			fileTruncated: "文件过大，仅显示开头部分。",
			copy: "复制",
			copied: "已复制",
			unoaudited: "未审计"
		};
		/**
		* English dictionary. Typed against the Chinese key union so a missing or extra
		* key is a compile error — the locale runtime requires bilingual balance and
		* would otherwise throw at registration time.
		*/
		const en = {
			installedTitle: "Installed skills",
			marketTab: "Marketplace",
			installedScope: "Manage DSH user skills, shared agents skills and the configured skills directory on this host. Project and bundled skills are not included.",
			installedSearch: "Search installed skills or paths",
			refreshInstalled: "Refresh",
			installedEmpty: "No installed user skills found.",
			localSkill: "Local skill",
			linkedSkill: "Linked",
			viewInstalled: "View",
			localUninstallDescription: "Delete the skill and all files at the path below. Removing shared agents skills also affects other tools using them.",
			unlinkDescription: "Remove only this skill’s symbolic link. The target and its files will be kept.",
			uninstalling: "Uninstalling…",
			uninstallDisabled: "Uninstalling is disabled by the plugin configuration.",
			copyPath: "Copy path",
			copiedPath: "Path copied",
			sourceLabel: "Source",
			managedByHub: "Installed by Skills Hub",
			unmanagedSkill: "Placed by hand",
			symlinkSkill: "Symlink",
			installedAtLabel: "Installed",
			skillKind: "Layout",
			bundleSkill: "Directory bundle",
			flatSkill: "Single file",
			filesCount: "{count} files",
			emptyDocument: "This skill has no document body.",
			installedReadFailed: "Could not read the local skill.",
			openInMarket: "View in marketplace",
			fileView: "File view",
			filePreview: "Preview",
			fileSource: "Source",
			snapshotAge: "Snapshot {age}",
			ageJustNow: "just now",
			ageMinutes: "{count} min ago",
			ageHours: "{count} h ago",
			ageDays: "{count} d ago",
			refreshNow: "Refetch (skip cache)",
			refreshSnapshot: "Refetch",
			detailSnapshot: "This content is a cached snapshot from {age}; the author may have published since.",
			installSnapshot: "The marketplace data shown here is a snapshot from {age}; confirming refetches the current manifest before installing.",
			marketProvenance: "This skill came from a marketplace: the author description, statistics and security reports live on its marketplace page, while this local copy may have changed since.",
			panel: "Skills Hub",
			title: "Skills Hub",
			subtitle: "Browse, preview and install third-party skills from ClawHub and SkillHub.",
			searchPlaceholder: "Search skills by name, author or keyword, press Enter",
			clearSearch: "Clear search",
			"source.all": "All sources",
			"source.clawhub": "ClawHub",
			"source.skillhub": "SkillHub",
			"source.local": "Local skill",
			"security.all": "Any security status",
			"security.verified": "Verified",
			"security.benign": "Benign",
			"security.unknown": "Unknown",
			"security.flagged": "Flagged",
			"installed.all": "All",
			"installed.installed": "Installed",
			"installed.installable": "Installable",
			"category.lang": "en",
			"category.label": "Category",
			"category.all": "All",
			categoryTag: "Category: {name}",
			breadcrumb: "Location",
			updatedOn: "Updated {date}",
			needsApiKey: "Needs an API key",
			sourcePage: "Source",
			securityReport: "Security",
			changelog: "Changelog",
			whenToUse: "When it triggers",
			info: "Details",
			latestUpdate: "Latest update",
			fullChangelog: "Full changelog →",
			olderVersions: "Older versions on the registry",
			openChangelogFile: "Open the bundled {path}",
			noChangelog: "Upstream has no release note for this version.",
			scanReports: "Scan results",
			noReports: "Upstream has no security scan for this skill.",
			scanDisclaimer: "Verdicts come from the upstream registry; this plugin only shows them and does not vouch for them. Installing means you trust the author.",
			readingTime: "~{minutes} min read",
			expand: "Show all",
			collapse: "Collapse",
			capTitle: "Before installing: what this skill does",
			viewFullReport: "Full report →",
			capNote: "Detected by rules from SKILL.md and the file list; for reference only. Installing runs no scripts.",
			"cap.shell": "Runs commands or scripts",
			"cap.shell.detail": "{evidence}",
			"cap.hooks": "Registers hooks",
			"cap.hooks.detail": "Touches {evidence}",
			"cap.secrets": "Needs secrets",
			"cap.secrets.detail": "Reads {evidence}",
			"cap.network": "Calls network services",
			"cap.network.detail": "Requests {evidence}",
			"cap.writes": "Writes files",
			"cap.writes.detail": "Creates or changes {evidence}",
			"cap.binaries": "Needs local commands",
			"cap.binaries.detail": "Requires {evidence}",
			"scan.verified": "Scan: verified",
			"scan.benign": "Scan: passed",
			"scan.unknown": "Scan: unknown",
			"scan.flagged": "Scan: suspicious",
			installTitle: "Install {name}",
			confirmInstall: "Install",
			willGet: "This skill will be able to",
			"level.high": "High",
			"level.medium": "Medium",
			"level.low": "Low",
			installWarnFlagged: "The upstream scan flags this skill as suspicious. Installing means you trust the author; read the security report first.",
			installWarnUnknown: "Upstream has no scan verdict for this skill. Installing means you trust the author; read SKILL.md first.",
			ack: "I have read SKILL.md and the security report and understand these permissions",
			installedOn: "Installed {date}",
			"scanShort.verified": "Verified",
			"scanShort.benign": "Scan passed",
			"scanShort.unknown": "Not scanned",
			"scanShort.flagged": "Suspicious",
			catalogSummary: "{count} curated skills",
			catalogUpdated: "list updated {date}",
			liveResults: "{count} live results",
			featured: "Featured",
			"scope.catalogHint": "Searching curated skills only.",
			"scope.marketHint": "Searching all of ClawHub and SkillHub live; these results are not curated.",
			"scope.searchMarket": "Search all markets for “{q}”",
			"scope.backToCatalog": "Back to curated",
			"filter.source": "Source",
			"filter.security": "Security",
			"filter.installed": "Install state",
			count: "{count} skills",
			loading: "Loading…",
			loadingMore: "Loading more…",
			loadMore: "Load more",
			loadMoreError: "Could not load the next page",
			empty: "No skills yet",
			emptyHint: "The upstream markets returned nothing. Try again in a moment.",
			emptySearch: "No matching skills",
			emptySearchHint: "Try another keyword, or loosen the filters.",
			error: "The Skills Hub is unavailable",
			retry: "Retry",
			install: "Install",
			installing: "Installing…",
			installed: "Installed",
			notInstallable: "Not installable",
			uninstall: "Uninstall",
			uninstallConfirm: "Uninstall",
			uninstallTitle: "Uninstall “{name}”?",
			uninstallDescription: "Uninstalling removes the skill from the local skills directory, so the skill tool stops offering it.",
			installConfirmMessage: "Install “{name}” from {source}.",
			installLocation: "Install location",
			cancel: "Cancel",
			confirm: "Confirm",
			close: "Close",
			back: "Back",
			overview: "Overview",
			files: "Files",
			security: "Security",
			viewReport: "View report",
			frontmatter: "Metadata",
			footnotes: "Footnotes",
			author: "Author",
			downloads: "Downloads",
			installs: "Installs",
			stars: "Stars",
			updated: "Updated",
			license: "License",
			version: "Version",
			disclaimer: "Skills are published by third-party community authors; Skills Hub is a community plugin, not an official DeepSeek product. The curated list is a recommendation, not a security guarantee. Installing means you trust the skill's author; read the security report and SKILL.md first.",
			dismiss: "Got it",
			"sourceStatus.ok": "OK",
			"sourceStatus.degraded": "Degraded",
			"sourceStatus.failed": "Unavailable",
			"sourceStatus.cached": "Cached",
			installDone: "Installed",
			uninstallDone: "Uninstalled",
			noFiles: "This skill has no previewable files.",
			fileTooLarge: "The file is too large to preview.",
			fileTruncated: "The file is too large; only the beginning is shown.",
			copy: "Copy",
			copied: "Copied",
			unoaudited: "Not audited"
		};
		//#endregion
		//#region lib/client/index.js
		/**
		* Skills Hub, browser half.
		*
		* Two registrations, exactly the shape `@deepseek-ai/dsh-client-ui-plugin-manager`
		* uses for its own panel (read from
		* `.../dsh-client-ui-plugin-manager/lib/client.js`, same DSH version):
		*
		*   ctx.slots.inject('main', function* () { yield ctx.slots.register({ name: 'main', key: PANEL_ID, … }, MarketPage) })
		*   ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({ name: 'sidebar.panellist', id: PANEL_ID, order, label, … }, SkillsHubIcon))
		*
		* `slots.inject` waits for the declaring entry (the frame declares `main`, the
		* sidebar declares `sidebar.panellist`) and keeps the registration on this
		* plugin's fiber, so unloading the plugin removes both contributions.
		*
		* Selecting the panel is **not** done here: the sidebar renders each
		* `sidebar.panellist` entry inside its own `<button>` whose click calls
		* `selectPanel(id)` → `ctx.layout.selectPanel(id)`
		* (`.../dsh-client-ui-sidebar/lib/client.js`, `PanelRow` ≈ line 173 and the
		* injected `selectPanel` ≈ line 483). Because our entry `id` equals the `main`
		* registration key, that call opens this panel; adding our own button or a
		* second `selectPanel` call would nest interactive elements and fight the shell.
		*/
		/** Stable plugin name of the browser half. */
		const name = "skills-hub-client";
		/**
		* Services required before the registrations can be made. `slots` is the
		* registry itself; `locale` owns the dictionary this panel translates through.
		* `layout` is deliberately absent — the sidebar selects the panel for us.
		*/
		const inject = ["slots", "locale"];
		/** Sidebar entry id and `main` slot key — the same value is what links the two. */
		const PANEL_ID = "skills-hub";
		/** Register the sidebar entry and the panel it opens. */
		function apply(ctx) {
			const slots = ctx.slots;
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "skills-hub: dictionaries");
			const t = ctx.locale.bind(NS);
			slots.inject("main", function* () {
				yield slots.register({
					name: "main",
					key: PANEL_ID,
					locale: NS,
					inject: () => ({ useMarketController })
				}, MarketPage);
			});
			slots.inject("sidebar.panellist", () => slots.register({
				name: "sidebar.panellist",
				id: PANEL_ID,
				order: 20,
				label: () => t("panel"),
				locale: NS
			}, SkillsHubIcon));
		}
		//#endregion
		exports.PANEL_ID = PANEL_ID;
		exports.apply = apply;
		exports.inject = inject;
		exports.name = name;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map