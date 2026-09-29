window.__ModuleLoader__.load({
	id: "dsh-skills-hub",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
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
		/** Price tag: leading glyph of a card's tag row. */
		function TagIcon({ size = 16, className }) {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: size,
				height: size,
				viewBox: "0 0 16 16",
				className,
				strokeWidth: 1.5,
				...stroke,
				"aria-hidden": "true",
				focusable: "false",
				children: [(0, react_jsx_runtime.jsx)("path", { d: "M2.6 7.4V3.9a1.3 1.3 0 0 1 1.3-1.3h3.5a1.3 1.3 0 0 1 .92.38l5 5a1.3 1.3 0 0 1 0 1.84l-3.5 3.5a1.3 1.3 0 0 1-1.84 0l-5-5a1.3 1.3 0 0 1-.38-.92Z" }), (0, react_jsx_runtime.jsx)("circle", {
					cx: "5.7",
					cy: "5.7",
					r: ".85"
				})]
			});
		}
		//#endregion
		//#region \0dsh-css:/Users/nanmi/workspace/myself_code/dsh-skills-hub/src/client/components/SecurityBadge.module.css.mjs
		const css$11 = ".b5qwIW_badge{box-sizing:border-box;white-space:nowrap;border-radius:999px;flex:none;align-items:center;gap:4px;height:20px;padding:0 7px;font-size:11px;font-weight:600;line-height:18px;display:inline-flex}.b5qwIW_compact{height:18px;padding:0 6px;font-size:10.5px}.b5qwIW_success{color:var(--dsw-alias-state-success-primary,#22c55e);background:color-mix(in srgb, var(--dsw-alias-state-success-primary,#22c55e) 12%, transparent)}.b5qwIW_neutral{color:var(--dsw-alias-label-secondary,#61666b);background:var(--dsw-alias-bg-module-platform,#f5f6f7)}.b5qwIW_danger{color:var(--dsw-alias-state-error-primary,#ec1313);background:color-mix(in srgb, var(--dsw-alias-state-error-primary,#ec1313) 12%, transparent)}";
		const tagId$11 = "dsh-skills-hub/SecurityBadge.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$11) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-skills-hub";
			tag.dataset.pluginCss = tagId$11;
			tag.textContent = css$11;
			document.head.appendChild(tag);
		}
		var SecurityBadge_module_css_default = {
			"badge": "b5qwIW_badge",
			"compact": "b5qwIW_compact",
			"danger": "b5qwIW_danger",
			"neutral": "b5qwIW_neutral",
			"success": "b5qwIW_success"
		};
		//#endregion
		//#region lib/client/components/SecurityBadge.js
		/** Tone class per audit verdict; `unknown` is a neutral fact, not a warning. */
		const TONES$1 = {
			verified: "success",
			benign: "success",
			unknown: "neutral",
			flagged: "danger"
		};
		/**
		* Audit verdict chip.
		*
		* Shows a shield for every verdict except `flagged`, which uses the warning
		* triangle: a scan that found something must not look like a scan that merely
		* ran, and shape reads faster than color alone.
		*
		* `reports` supplies the upstream status line for the hover title, so the chip
		* can stay a two-word summary without hiding what the vendor actually said.
		*/
		function SecurityBadge(props) {
			const { status, reports, compact = false } = props;
			const t = useT();
			const report = reports?.[0];
			const detail = report ? `${report.vendor}: ${report.statusText}` : void 0;
			return (0, react_jsx_runtime.jsxs)("span", {
				className: `${SecurityBadge_module_css_default.badge} ${SecurityBadge_module_css_default[TONES$1[status]] ?? ""} ${compact ? SecurityBadge_module_css_default.compact : ""}`,
				title: detail,
				"data-security-status": status,
				children: [!compact && (status === "flagged" ? (0, react_jsx_runtime.jsx)(AlertIcon, { size: 13 }) : (0, react_jsx_runtime.jsx)(ShieldIcon, { size: 13 })), t(`security.${status}`)]
			});
		}
		//#endregion
		//#region \0dsh-css:/Users/nanmi/workspace/myself_code/dsh-skills-hub/src/client/components/InstallConfirmDialog.module.css.mjs
		const css$10 = ".fcwTSW_facts{margin:0}.fcwTSW_row{border-bottom:1px solid var(--dsw-alias-border-l1,#0000000a);justify-content:space-between;align-items:baseline;gap:16px;min-width:0;padding:8px 0;display:flex}.fcwTSW_row:last-child{border-bottom:none}.fcwTSW_label{color:var(--dsw-alias-label-tertiary,#81858c);flex:none;font-size:12.5px;line-height:19px}.fcwTSW_value{min-width:0;color:var(--dsw-alias-label-primary,#0f1115);text-align:right;overflow-wrap:anywhere;margin:0;font-size:13px;font-weight:600;line-height:19px}.fcwTSW_path{color:var(--dsw-alias-label-secondary,#61666b);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;font-weight:500}.fcwTSW_risk{border-radius:var(--dsw-radius-sm,8px);background:color-mix(in srgb, var(--dsw-alias-state-warn-primary,#f59e0b) 10%, transparent);color:var(--dsw-alias-label-secondary,#61666b);align-items:flex-start;gap:8px;margin:12px 0 0;padding:9px 11px;font-size:12px;line-height:19px;display:flex}.fcwTSW_riskIcon{color:var(--dsw-alias-state-warn-primary,#f59e0b);flex:none;margin-top:1px}.fcwTSW_actions{flex-wrap:wrap;justify-content:flex-end;align-items:center;gap:8px;width:100%;display:flex}";
		const tagId$10 = "dsh-skills-hub/InstallConfirmDialog.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$10) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-skills-hub";
			tag.dataset.pluginCss = tagId$10;
			tag.textContent = css$10;
			document.head.appendChild(tag);
		}
		var InstallConfirmDialog_module_css_default = {
			"actions": "fcwTSW_actions",
			"facts": "fcwTSW_facts",
			"label": "fcwTSW_label",
			"path": "fcwTSW_path",
			"risk": "fcwTSW_risk",
			"riskIcon": "fcwTSW_riskIcon",
			"row": "fcwTSW_row",
			"value": "fcwTSW_value"
		};
		//#endregion
		//#region lib/client/components/InstallConfirmDialog.js
		/**
		* `source:slug` → the directory name the installer will create. The market id
		* is the only identifier this dialog receives, so the slug is derived here
		* rather than passed twice.
		*/
		function slugOf(id) {
			const separator = id.indexOf(":");
			return separator >= 0 ? id.slice(separator + 1) : id;
		}
		/**
		* Install confirmation.
		*
		* Mounted only while a confirmation is pending — the frozen props carry no
		* `skill | null` and no `open`, so the caller's conditional render *is* the
		* open state (the optional `open` prop exists only for a caller that prefers
		* to keep the element mounted).
		*
		* Escape and mask-click closing come from `Modal` itself; while `busy` both
		* are neutralised and the buttons are disabled, because an install already in
		* flight cannot be recalled and a dialog that vanishes mid-request reads as a
		* cancel that never happened.
		*/
		function InstallConfirmDialog(props) {
			const { skill, busy, onCancel, onConfirm, open = true } = props;
			const t = useT();
			const sourceLabel = t(`source.${skill.source}`);
			const risky = skill.securityStatus === "unknown" || skill.securityStatus === "flagged";
			return (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open,
				onClose: busy ? () => void 0 : onCancel,
				title: t("install"),
				closeLabel: t("dismiss"),
				description: t("installConfirmMessage", {
					name: skill.name,
					source: sourceLabel
				}),
				footer: (0, react_jsx_runtime.jsxs)("div", {
					className: InstallConfirmDialog_module_css_default.actions,
					children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "outline",
						size: "md",
						disabled: busy,
						onClick: onCancel,
						children: t("cancel")
					}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "primary",
						size: "md",
						disabled: busy,
						icon: (0, react_jsx_runtime.jsx)(DownloadIcon, { size: 16 }),
						onClick: onConfirm,
						children: busy ? t("installing") : t("confirm")
					})]
				}),
				children: [(0, react_jsx_runtime.jsxs)("dl", {
					className: InstallConfirmDialog_module_css_default.facts,
					children: [
						(0, react_jsx_runtime.jsxs)("div", {
							className: InstallConfirmDialog_module_css_default.row,
							children: [(0, react_jsx_runtime.jsx)("dt", {
								className: InstallConfirmDialog_module_css_default.label,
								children: t("filter.source")
							}), (0, react_jsx_runtime.jsx)("dd", {
								className: InstallConfirmDialog_module_css_default.value,
								children: sourceLabel
							})]
						}),
						skill.version !== void 0 && skill.version !== "" && (0, react_jsx_runtime.jsxs)("div", {
							className: InstallConfirmDialog_module_css_default.row,
							children: [(0, react_jsx_runtime.jsx)("dt", {
								className: InstallConfirmDialog_module_css_default.label,
								children: t("version")
							}), (0, react_jsx_runtime.jsxs)("dd", {
								className: InstallConfirmDialog_module_css_default.value,
								children: ["v", skill.version]
							})]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: InstallConfirmDialog_module_css_default.row,
							children: [(0, react_jsx_runtime.jsx)("dt", {
								className: InstallConfirmDialog_module_css_default.label,
								children: t("author")
							}), (0, react_jsx_runtime.jsx)("dd", {
								className: InstallConfirmDialog_module_css_default.value,
								children: skill.authorName
							})]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: InstallConfirmDialog_module_css_default.row,
							children: [(0, react_jsx_runtime.jsx)("dt", {
								className: InstallConfirmDialog_module_css_default.label,
								children: t("security")
							}), (0, react_jsx_runtime.jsx)("dd", {
								className: InstallConfirmDialog_module_css_default.value,
								children: (0, react_jsx_runtime.jsx)(SecurityBadge, { status: skill.securityStatus })
							})]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: InstallConfirmDialog_module_css_default.row,
							children: [(0, react_jsx_runtime.jsx)("dt", {
								className: InstallConfirmDialog_module_css_default.label,
								children: t("installLocation")
							}), (0, react_jsx_runtime.jsxs)("dd", {
								className: `${InstallConfirmDialog_module_css_default.value} ${InstallConfirmDialog_module_css_default.path}`,
								children: [
									"…/skills/",
									slugOf(skill.id).toLowerCase(),
									"/"
								]
							})]
						})
					]
				}), risky && (0, react_jsx_runtime.jsxs)("p", {
					className: InstallConfirmDialog_module_css_default.risk,
					role: "note",
					children: [(0, react_jsx_runtime.jsx)(AlertIcon, {
						size: 16,
						className: InstallConfirmDialog_module_css_default.riskIcon
					}), (0, react_jsx_runtime.jsx)("span", { children: t("unoaudited") })]
				})]
			});
		}
		//#endregion
		//#region \0dsh-css:/Users/nanmi/workspace/myself_code/dsh-skills-hub/src/client/components/FilterBar.module.css.mjs
		const css$9 = ".m0m-BW_bar{flex-wrap:wrap;align-items:center;gap:8px;min-width:0;display:flex}.m0m-BW_search{flex:220px;align-items:center;gap:6px;min-width:0;display:flex}.m0m-BW_searchInput{flex:auto;min-width:0}.m0m-BW_clear{flex:none}.m0m-BW_field{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2,#0000001a);border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-bg-layer-1,#fff);cursor:pointer;flex:none;align-items:center;gap:6px;height:32px;padding:0 6px 0 10px;display:inline-flex}.m0m-BW_field:focus-within{border-color:var(--dsw-alias-state-business-primary,#4176e6)}.m0m-BW_fieldLabel{color:var(--dsw-alias-label-tertiary,#81858c);white-space:nowrap;font-size:12px;line-height:18px}.m0m-BW_select{max-width:148px;color:var(--dsw-alias-label-primary,#0f1115);font:inherit;cursor:pointer;text-overflow:ellipsis;background:0 0;border:none;outline:none;font-size:12.5px;font-weight:600;line-height:18px}.m0m-BW_select:disabled{color:var(--dsw-alias-label-tertiary,#81858c);cursor:not-allowed}.m0m-BW_select option{background:var(--dsw-alias-bg-layer-1,#fff);color:var(--dsw-alias-label-primary,#0f1115)}.m0m-BW_srOnly{clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0;width:1px;height:1px;margin:-1px;padding:0;position:absolute;overflow:hidden}";
		const tagId$9 = "dsh-skills-hub/FilterBar.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$9) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-skills-hub";
			tag.dataset.pluginCss = tagId$9;
			tag.textContent = css$9;
			document.head.appendChild(tag);
		}
		var FilterBar_module_css_default = {
			"bar": "m0m-BW_bar",
			"clear": "m0m-BW_clear",
			"field": "m0m-BW_field",
			"fieldLabel": "m0m-BW_fieldLabel",
			"search": "m0m-BW_search",
			"searchInput": "m0m-BW_searchInput",
			"select": "m0m-BW_select",
			"srOnly": "m0m-BW_srOnly"
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
		const INSTALLED_OPTIONS = [
			"all",
			"installed",
			"installable"
		];
		/**
		* Search field plus the three catalogue filters.
		*
		* Native `<select>`s rather than a menu primitive: the DSH `Menu` is an
		* anchored popover that needs its own open state and focus return, and three
		* of them side by side would be three focus traps in a row. A `<select>` gets
		* platform keyboard behaviour, a real label association, and renders inside a
		* 720px panel without a portal.
		*
		* The result count is announced through a visually hidden live region instead
		* of being printed twice: the visible count lives in the home header, and a
		* screen reader still hears it change when a filter narrows the list.
		*/
		function FilterBar(props) {
			const { filters, total, disabled, onChange } = props;
			const t = useT();
			return (0, react_jsx_runtime.jsxs)("div", {
				className: FilterBar_module_css_default.bar,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: FilterBar_module_css_default.search,
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
							className: FilterBar_module_css_default.searchInput,
							icon: (0, react_jsx_runtime.jsx)(SearchIcon, { size: 16 }),
							value: filters.q,
							disabled,
							placeholder: t("searchPlaceholder"),
							"aria-label": t("searchPlaceholder"),
							onChange: (event) => onChange({ q: event.currentTarget.value })
						}), filters.q !== "" && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "ghost",
							size: "sm",
							className: FilterBar_module_css_default.clear,
							disabled,
							"aria-label": t("clearSearch"),
							onClick: () => onChange({ q: "" }),
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
		//#region \0dsh-css:/Users/nanmi/workspace/myself_code/dsh-skills-hub/src/client/components/MarketDisclaimer.module.css.mjs
		const css$8 = ".Q7HjEG_banner{box-sizing:border-box;border:1px solid color-mix(in srgb, var(--dsw-alias-state-warn-primary,#f59e0b) 38%, transparent);border-radius:var(--dsw-radius-sm,8px);background:color-mix(in srgb, var(--dsw-alias-state-warn-primary,#f59e0b) 10%, transparent);align-items:flex-start;gap:10px;padding:10px 12px;display:flex}.Q7HjEG_icon{color:var(--dsw-alias-state-warn-primary,#f59e0b);flex:none;margin-top:1px}.Q7HjEG_text{overflow-wrap:anywhere;min-width:0;color:var(--dsw-alias-label-secondary,#61666b);flex:1;margin:0;font-size:12.5px;line-height:1.65}.Q7HjEG_dismiss{flex:none;margin:-4px -6px 0 0}";
		const tagId$8 = "dsh-skills-hub/MarketDisclaimer.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$8) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-skills-hub";
			tag.dataset.pluginCss = tagId$8;
			tag.textContent = css$8;
			document.head.appendChild(tag);
		}
		var MarketDisclaimer_module_css_default = {
			"banner": "Q7HjEG_banner",
			"dismiss": "Q7HjEG_dismiss",
			"icon": "Q7HjEG_icon",
			"text": "Q7HjEG_text"
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
		//#region \0dsh-css:/Users/nanmi/workspace/myself_code/dsh-skills-hub/src/client/components/InstallStateBadge.module.css.mjs
		const css$7 = "._1cHkIa_badge{box-sizing:border-box;white-space:nowrap;border-radius:999px;flex:none;align-items:center;gap:4px;height:20px;padding:0 7px;font-size:11px;font-weight:600;line-height:18px;display:inline-flex}._1cHkIa_success{color:var(--dsw-alias-state-success-primary,#22c55e);background:color-mix(in srgb, var(--dsw-alias-state-success-primary,#22c55e) 12%, transparent)}._1cHkIa_brand{color:var(--dsw-alias-state-business-primary,#4176e6);background:color-mix(in srgb, var(--dsw-alias-state-business-primary,#4176e6) 12%, transparent)}._1cHkIa_danger{color:var(--dsw-alias-state-error-primary,#ec1313);background:color-mix(in srgb, var(--dsw-alias-state-error-primary,#ec1313) 12%, transparent)}";
		const tagId$7 = "dsh-skills-hub/InstallStateBadge.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$7) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-skills-hub";
			tag.dataset.pluginCss = tagId$7;
			tag.textContent = css$7;
			document.head.appendChild(tag);
		}
		var InstallStateBadge_module_css_default = {
			"badge": "_1cHkIa_badge",
			"brand": "_1cHkIa_brand",
			"danger": "_1cHkIa_danger",
			"success": "_1cHkIa_success"
		};
		//#endregion
		//#region lib/client/components/InstallStateBadge.js
		/** Tone class per local install state. */
		const TONES = {
			installed: "success",
			installable: "brand",
			"not-installable": "danger"
		};
		/**
		* Local install state chip.
		*
		* The three labels come from dictionary keys the contract already fixes —
		* `installed`, `installed.installable` and `notInstallable` — so this badge
		* adds no vocabulary of its own.
		*/
		function InstallStateBadge(props) {
			const { state } = props;
			const t = useT();
			const label = state === "installed" ? t("installed") : state === "installable" ? t("installed.installable") : t("notInstallable");
			return (0, react_jsx_runtime.jsxs)("span", {
				className: `${InstallStateBadge_module_css_default.badge} ${InstallStateBadge_module_css_default[TONES[state]] ?? ""}`,
				"data-install-state": state,
				children: [state === "installed" ? (0, react_jsx_runtime.jsx)(CheckIcon, { size: 13 }) : state === "installable" ? (0, react_jsx_runtime.jsx)(DownloadIcon, { size: 13 }) : (0, react_jsx_runtime.jsx)(AlertIcon, { size: 13 }), label]
			});
		}
		//#endregion
		//#region \0dsh-css:/Users/nanmi/workspace/myself_code/dsh-skills-hub/src/client/components/SkillAvatar.module.css.mjs
		const css$6 = ".zkTFSW_image{object-fit:cover;border:1px solid var(--dsw-alias-border-l2,#0000001a);background:var(--dsw-alias-bg-module-platform,#f5f6f7);flex:none}.zkTFSW_letter{box-sizing:border-box;letter-spacing:-.02em;color:var(--dsw-alias-label-primary-inverted,#fff);user-select:none;box-shadow:inset 0 1px 0 color-mix(in srgb, var(--dsw-alias-label-primary-inverted,#fff) 12%, transparent);flex:none;justify-content:center;align-items:center;font-weight:700;line-height:1;display:inline-flex;overflow:hidden}.zkTFSW_tone1{background:linear-gradient(145deg, color-mix(in srgb, var(--dsw-alias-state-success-primary,#22c55e) 74%, var(--dsw-alias-label-primary,#0f1115)), color-mix(in srgb, var(--dsw-alias-state-success-primary,#22c55e) 48%, var(--dsw-alias-label-primary,#0f1115)))}.zkTFSW_tone2{background:linear-gradient(145deg, color-mix(in srgb, var(--dsw-alias-state-warn-primary,#f59e0b) 80%, var(--dsw-alias-label-primary,#0f1115)), color-mix(in srgb, var(--dsw-alias-state-warn-primary,#f59e0b) 54%, var(--dsw-alias-label-primary,#0f1115)))}.zkTFSW_tone5{background:linear-gradient(145deg, color-mix(in srgb, color-mix(in srgb, var(--dsw-alias-state-warn-primary,#f59e0b) 55%, var(--dsw-alias-state-success-primary,#22c55e)) 78%, var(--dsw-alias-label-primary,#0f1115)), color-mix(in srgb, color-mix(in srgb, var(--dsw-alias-state-warn-primary,#f59e0b) 55%, var(--dsw-alias-state-success-primary,#22c55e)) 50%, var(--dsw-alias-label-primary,#0f1115)))}.zkTFSW_tone0{background:linear-gradient(145deg, color-mix(in srgb, var(--dsw-alias-state-business-primary,#4176e6) 82%, var(--dsw-alias-label-primary,#0f1115)), color-mix(in srgb, var(--dsw-alias-state-business-primary,#4176e6) 56%, var(--dsw-alias-label-primary,#0f1115)))}.zkTFSW_tone4{background:linear-gradient(145deg, color-mix(in srgb, color-mix(in srgb, var(--dsw-alias-state-business-primary,#4176e6) 58%, var(--dsw-alias-state-success-primary,#22c55e)) 80%, var(--dsw-alias-label-primary,#0f1115)), color-mix(in srgb, color-mix(in srgb, var(--dsw-alias-state-business-primary,#4176e6) 58%, var(--dsw-alias-state-success-primary,#22c55e)) 52%, var(--dsw-alias-label-primary,#0f1115)))}.zkTFSW_tone3{background:linear-gradient(145deg, color-mix(in srgb, var(--dsw-alias-state-idle-primary,#d4d4d4) 62%, var(--dsw-alias-label-primary,#0f1115)), color-mix(in srgb, var(--dsw-alias-state-idle-primary,#d4d4d4) 38%, var(--dsw-alias-label-primary,#0f1115)))}";
		const tagId$6 = "dsh-skills-hub/SkillAvatar.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$6) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-skills-hub";
			tag.dataset.pluginCss = tagId$6;
			tag.textContent = css$6;
			document.head.appendChild(tag);
		}
		var SkillAvatar_module_css_default = {
			"image": "zkTFSW_image",
			"letter": "zkTFSW_letter",
			"tone0": "zkTFSW_tone0",
			"tone1": "zkTFSW_tone1",
			"tone2": "zkTFSW_tone2",
			"tone3": "zkTFSW_tone3",
			"tone4": "zkTFSW_tone4",
			"tone5": "zkTFSW_tone5"
		};
		//#endregion
		//#region lib/client/components/SkillAvatar.js
		/** Palette slots; each maps to one `.toneN` class in the module stylesheet. */
		const TONE_COUNT = 6;
		/**
		* Per-source tone family. The `source` prop is otherwise unused by a letter
		* avatar, so it earns its place as the family selector: ClawHub entries read
		* warm, SkillHub entries read cool, and a mixed grid still shows at a glance
		* where a card came from.
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
			]
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
		//#region \0dsh-css:/Users/nanmi/workspace/myself_code/dsh-skills-hub/src/client/components/SkillCard.module.css.mjs
		const css$5 = ".y50cca_card{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2,#0000001a);border-radius:var(--dsw-radius-md,12px);background:var(--dsw-alias-bg-layer-1,#fff);flex-direction:column;gap:10px;min-width:0;min-height:188px;padding:14px;transition:border-color .14s,background-color .14s;display:flex;position:relative}.y50cca_card:hover{border-color:var(--dsw-alias-border-l3,#00000029);background:var(--dsw-alias-interactive-bg-hover,#2631480f)}.y50cca_card:focus-within{border-color:var(--dsw-alias-state-business-primary,#4176e6)}.y50cca_open{z-index:0;border-radius:inherit;cursor:pointer;background:0 0;border:none;margin:0;padding:0;position:absolute;inset:0}.y50cca_open:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#4176e6);outline-offset:2px}.y50cca_head,.y50cca_summary,.y50cca_tags,.y50cca_footer{z-index:1;pointer-events:none;position:relative}.y50cca_head{align-items:center;gap:12px;min-width:0;display:flex}.y50cca_headText{flex:1;min-width:0}.y50cca_titleRow{align-items:baseline;gap:8px;min-width:0;display:flex}.y50cca_title{min-width:0;color:var(--dsw-alias-label-primary,#0f1115);letter-spacing:-.01em;text-overflow:ellipsis;white-space:nowrap;flex:1;margin:0;font-size:15px;font-weight:700;line-height:22px;overflow:hidden}.y50cca_version{color:var(--dsw-alias-label-tertiary,#81858c);font-variant-numeric:tabular-nums;flex:none;font-size:11.5px;font-weight:600}.y50cca_origin{align-items:center;gap:6px;min-width:0;margin:2px 0 0;font-size:11px;line-height:16px;display:flex}.y50cca_source{color:var(--dsw-alias-label-tertiary,#81858c);letter-spacing:.06em;text-transform:uppercase;flex:none;font-weight:700}.y50cca_author{min-width:0;color:var(--dsw-alias-label-secondary,#61666b);text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.y50cca_summary{min-height:42px;color:var(--dsw-alias-label-secondary,#61666b);overflow-wrap:anywhere;-webkit-line-clamp:3;-webkit-box-orient:vertical;margin:0;font-size:13px;line-height:21px;display:-webkit-box;overflow:hidden}.y50cca_tags{min-height:18px;color:var(--dsw-alias-label-tertiary,#81858c);flex-wrap:wrap;align-items:center;gap:4px 8px;margin:0;font-size:12px;line-height:18px;display:flex}.y50cca_tagIcon{color:var(--dsw-alias-label-tertiary,#81858c);flex:none}.y50cca_tag{text-overflow:ellipsis;white-space:nowrap;max-width:100%;overflow:hidden}.y50cca_footer{border-top:1px solid var(--dsw-alias-border-l1,#0000000a);flex-wrap:wrap;align-items:center;gap:8px;margin-top:auto;padding-top:10px;display:flex}.y50cca_badges{flex-wrap:wrap;align-items:center;gap:6px;min-width:0;display:flex}.y50cca_stats{color:var(--dsw-alias-label-secondary,#61666b);font-variant-numeric:tabular-nums;flex-wrap:wrap;align-items:center;gap:10px;margin-left:auto;font-size:12px;line-height:18px;display:flex}.y50cca_stat{white-space:nowrap;align-items:center;gap:4px;display:inline-flex}.y50cca_install{z-index:2;pointer-events:auto;position:relative}";
		const tagId$5 = "dsh-skills-hub/SkillCard.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$5) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-skills-hub";
			tag.dataset.pluginCss = tagId$5;
			tag.textContent = css$5;
			document.head.appendChild(tag);
		}
		var SkillCard_module_css_default = {
			"author": "y50cca_author",
			"badges": "y50cca_badges",
			"card": "y50cca_card",
			"footer": "y50cca_footer",
			"head": "y50cca_head",
			"headText": "y50cca_headText",
			"install": "y50cca_install",
			"open": "y50cca_open",
			"origin": "y50cca_origin",
			"source": "y50cca_source",
			"stat": "y50cca_stat",
			"stats": "y50cca_stats",
			"summary": "y50cca_summary",
			"tag": "y50cca_tag",
			"tagIcon": "y50cca_tagIcon",
			"tags": "y50cca_tags",
			"title": "y50cca_title",
			"titleRow": "y50cca_titleRow",
			"version": "y50cca_version"
		};
		//#endregion
		//#region lib/client/components/SkillCard.js
		/** Tags beyond this count collapse into a `+n` chip. */
		const MAX_VISIBLE_TAGS = 3;
		/**
		* Compact download/star counts (`1.2k`, `3.4M`). Numeric and language-neutral,
		* so it needs no dictionary entry.
		*/
		function formatCount$1(value) {
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
							size: 46
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
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: SkillCard_module_css_default.source,
									children: t(`source.${skill.source}`)
								}), author !== "" && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
									"aria-hidden": "true",
									children: "·"
								}), (0, react_jsx_runtime.jsx)("span", {
									className: SkillCard_module_css_default.author,
									children: author
								})] })]
							})]
						})]
					}),
					(0, react_jsx_runtime.jsx)("p", {
						className: SkillCard_module_css_default.summary,
						children: skill.summary
					}),
					skill.tags.length > 0 && (0, react_jsx_runtime.jsxs)("p", {
						className: SkillCard_module_css_default.tags,
						children: [
							(0, react_jsx_runtime.jsx)(TagIcon, {
								size: 13,
								className: SkillCard_module_css_default.tagIcon
							}),
							skill.tags.slice(0, MAX_VISIBLE_TAGS).map((tag) => (0, react_jsx_runtime.jsxs)("span", {
								className: SkillCard_module_css_default.tag,
								children: ["#", tag]
							}, tag)),
							extraTags > 0 && (0, react_jsx_runtime.jsxs)("span", {
								className: SkillCard_module_css_default.tag,
								children: ["+", extraTags]
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("footer", {
						className: SkillCard_module_css_default.footer,
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: SkillCard_module_css_default.badges,
							children: [(0, react_jsx_runtime.jsx)(SecurityBadge, {
								status: skill.securityStatus,
								reports: skill.securityReports,
								compact: true
							}), !showInstall && (0, react_jsx_runtime.jsx)(InstallStateBadge, { state: skill.installState })]
						}), (0, react_jsx_runtime.jsxs)("div", {
							className: SkillCard_module_css_default.stats,
							children: [
								(0, react_jsx_runtime.jsxs)("span", {
									className: SkillCard_module_css_default.stat,
									title: t("downloads"),
									children: [(0, react_jsx_runtime.jsx)(DownloadIcon, { size: 13 }), formatCount$1(skill.stats.downloads)]
								}),
								skill.stats.stars !== void 0 && skill.stats.stars > 0 && (0, react_jsx_runtime.jsxs)("span", {
									className: SkillCard_module_css_default.stat,
									title: t("stars"),
									children: [(0, react_jsx_runtime.jsx)(StarIcon, { size: 13 }), formatCount$1(skill.stats.stars)]
								}),
								showInstall && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "primary",
									size: "sm",
									className: SkillCard_module_css_default.install,
									disabled: installing,
									"aria-label": `${t("install")}: ${skill.name}`,
									onClick: () => onInstall?.(skill.id),
									icon: (0, react_jsx_runtime.jsx)(DownloadIcon, { size: 14 }),
									children: installing ? t("installing") : t("install")
								})
							]
						})]
					})
				]
			});
		}
		//#endregion
		//#region \0dsh-css:/Users/nanmi/workspace/myself_code/dsh-skills-hub/src/client/components/SourceStatusBar.module.css.mjs
		const css$4 = ".VDgWmG_bar{flex-wrap:wrap;align-items:center;gap:6px;display:flex}.VDgWmG_list{flex-wrap:wrap;align-items:center;gap:6px;min-width:0;margin:0;padding:0;list-style:none;display:flex}.VDgWmG_item{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2,#0000001a);background:var(--dsw-alias-bg-layer-1,#fff);white-space:nowrap;border-radius:999px;align-items:center;gap:6px;height:24px;padding:0 9px;font-size:12px;line-height:18px;display:inline-flex}.VDgWmG_dot{font-size:10px;line-height:10px}.VDgWmG_name{color:var(--dsw-alias-label-primary,#0f1115);font-weight:600}.VDgWmG_status{color:var(--dsw-alias-label-tertiary,#81858c)}.VDgWmG_refresh{flex:none}.VDgWmG_spinning{transform-origin:50%;animation:.9s linear infinite VDgWmG_skills-hub-spin}@keyframes VDgWmG_skills-hub-spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.VDgWmG_spinning{animation:none}}";
		const tagId$4 = "dsh-skills-hub/SourceStatusBar.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$4) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-skills-hub";
			tag.dataset.pluginCss = tagId$4;
			tag.textContent = css$4;
			document.head.appendChild(tag);
		}
		var SourceStatusBar_module_css_default = {
			"bar": "VDgWmG_bar",
			"dot": "VDgWmG_dot",
			"item": "VDgWmG_item",
			"list": "VDgWmG_list",
			"name": "VDgWmG_name",
			"refresh": "VDgWmG_refresh",
			"skills-hub-spin": "VDgWmG_skills-hub-spin",
			"spinning": "VDgWmG_spinning",
			"status": "VDgWmG_status"
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
								})
							]
						}, source);
					})
				}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
					label: t("retry"),
					children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "ghost",
						size: "sm",
						className: SourceStatusBar_module_css_default.refresh,
						disabled: refreshing,
						"aria-label": t("retry"),
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
		//#region \0dsh-css:/Users/nanmi/workspace/myself_code/dsh-skills-hub/src/client/components/MarketHome.module.css.mjs
		const css$3 = ".RkU0KG_home{box-sizing:border-box;min-width:0;color:var(--dsw-alias-label-primary,#0f1115);flex-direction:column;gap:12px;padding:18px 20px 28px;display:flex}.RkU0KG_masthead{align-items:flex-start;gap:14px;min-width:0;display:flex}.RkU0KG_mark{box-sizing:border-box;border:1px solid var(--dsw-alias-border-l2,#0000001a);border-radius:var(--dsw-radius-md,12px);background:var(--dsw-alias-bg-layer-1,#fff);width:44px;height:44px;color:var(--dsw-alias-label-primary,#0f1115);flex:none;justify-content:center;align-items:center;display:inline-flex}.RkU0KG_mastheadText{flex:1;min-width:0}.RkU0KG_title{letter-spacing:-.012em;overflow-wrap:anywhere;margin:0;font-size:22px;font-weight:700;line-height:30px}.RkU0KG_subtitle{max-width:62ch;color:var(--dsw-alias-label-secondary,#61666b);overflow-wrap:anywhere;margin:3px 0 0;font-size:13.5px;line-height:21px}.RkU0KG_statusRow{flex-wrap:wrap;justify-content:space-between;align-items:center;gap:8px 12px;min-width:0;padding-top:2px;display:flex}.RkU0KG_count{color:var(--dsw-alias-label-secondary,#61666b);font-variant-numeric:tabular-nums;margin:0;font-size:13px;line-height:20px}.RkU0KG_body{flex-direction:column;gap:14px;min-width:0;display:flex}.RkU0KG_grid{grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px;min-width:0;display:grid}.RkU0KG_loading{color:var(--dsw-alias-label-secondary,#61666b);align-items:center;gap:8px;margin:0;padding:10px 0;font-size:13px;line-height:20px;display:flex}.RkU0KG_more{justify-content:center;padding-top:2px;display:flex}.RkU0KG_empty{border:1px dashed var(--dsw-alias-border-l3,#00000029);border-radius:var(--dsw-radius-md,12px);color:var(--dsw-alias-label-tertiary,#81858c);flex-direction:column;align-items:center;gap:10px;padding:44px 20px;display:flex}.RkU0KG_emptyTitle{color:var(--dsw-alias-label-primary,#0f1115);text-align:center;overflow-wrap:anywhere;margin:0;font-size:14px;font-weight:600;line-height:21px}.RkU0KG_emptyText{text-align:center;overflow-wrap:anywhere;max-width:52ch;margin:0;font-size:12.5px;line-height:19px}.RkU0KG_error{border:1px solid color-mix(in srgb, var(--dsw-alias-state-error-primary,#ec1313) 34%, transparent);border-radius:var(--dsw-radius-md,12px);background:color-mix(in srgb, var(--dsw-alias-state-error-primary,#ec1313) 8%, transparent);text-align:center;flex-direction:column;align-items:center;gap:8px;padding:32px 20px;display:flex}.RkU0KG_errorIcon{color:var(--dsw-alias-state-error-primary,#ec1313)}.RkU0KG_errorTitle{color:var(--dsw-alias-label-primary,#0f1115);margin:0;font-size:14px;font-weight:600;line-height:21px}.RkU0KG_errorDetail{max-width:60ch;color:var(--dsw-alias-label-tertiary,#81858c);overflow-wrap:anywhere;margin:0;font-size:12px;line-height:19px}";
		const tagId$3 = "dsh-skills-hub/MarketHome.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$3) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-skills-hub";
			tag.dataset.pluginCss = tagId$3;
			tag.textContent = css$3;
			document.head.appendChild(tag);
		}
		var MarketHome_module_css_default = {
			"body": "RkU0KG_body",
			"count": "RkU0KG_count",
			"empty": "RkU0KG_empty",
			"emptyText": "RkU0KG_emptyText",
			"emptyTitle": "RkU0KG_emptyTitle",
			"error": "RkU0KG_error",
			"errorDetail": "RkU0KG_errorDetail",
			"errorIcon": "RkU0KG_errorIcon",
			"errorTitle": "RkU0KG_errorTitle",
			"grid": "RkU0KG_grid",
			"home": "RkU0KG_home",
			"loading": "RkU0KG_loading",
			"mark": "RkU0KG_mark",
			"masthead": "RkU0KG_masthead",
			"mastheadText": "RkU0KG_mastheadText",
			"more": "RkU0KG_more",
			"statusRow": "RkU0KG_statusRow",
			"subtitle": "RkU0KG_subtitle",
			"title": "RkU0KG_title"
		};
		//#endregion
		//#region lib/client/components/MarketHome.js
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
			const isInitialLoad = state.loading && !hasItems;
			const narrowed = state.filters.q !== "" || state.filters.source !== "all" || state.filters.security !== "all" || state.filters.installed !== "all";
			return (0, react_jsx_runtime.jsxs)("div", {
				className: MarketHome_module_css_default.home,
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
					(0, react_jsx_runtime.jsxs)("div", {
						className: MarketHome_module_css_default.statusRow,
						children: [(0, react_jsx_runtime.jsx)("p", {
							className: MarketHome_module_css_default.count,
							"aria-live": "polite",
							children: t("count", { count: state.items.length })
						}), (0, react_jsx_runtime.jsx)(SourceStatusBar, {
							sources: state.sources,
							onRefresh: () => void controller.refresh(),
							refreshing: state.loading
						})]
					}),
					(0, react_jsx_runtime.jsx)(FilterBar, {
						filters: state.filters,
						total: state.items.length,
						disabled: state.loading,
						onChange: applyFilterPatch
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
										onClick: () => void controller.refresh(),
										children: t("retry")
									})
								]
							}),
							state.error === null && isInitialLoad && (0, react_jsx_runtime.jsxs)("p", {
								className: MarketHome_module_css_default.loading,
								role: "status",
								"aria-live": "polite",
								children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
									state: "ongoing",
									size: 16
								}), t("loading")]
							}),
							state.error === null && !state.loading && !hasItems && (0, react_jsx_runtime.jsxs)("div", {
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
							state.error === null && hasItems && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("div", {
								className: MarketHome_module_css_default.grid,
								children: state.items.map((skill) => (0, react_jsx_runtime.jsx)(SkillCard, {
									skill,
									installing: state.installingIds.has(skill.id),
									onOpen: (id) => void controller.openDetail(id),
									onInstall: (id) => controller.requestInstall(id)
								}, skill.id))
							}), state.nextCursor !== null && (0, react_jsx_runtime.jsx)("div", {
								className: MarketHome_module_css_default.more,
								children: state.loadingMore ? (0, react_jsx_runtime.jsxs)("p", {
									className: MarketHome_module_css_default.loading,
									role: "status",
									"aria-live": "polite",
									children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
										state: "ongoing",
										size: 16
									}), t("loadingMore")]
								}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									size: "md",
									disabled: state.loading,
									icon: (0, react_jsx_runtime.jsx)(DownloadIcon, { size: 16 }),
									onClick: () => void controller.loadMore(),
									children: t("loadMore")
								})
							})] })
						]
					})
				]
			});
		}
		//#endregion
		//#region \0dsh-css:/Users/nanmi/workspace/myself_code/dsh-skills-hub/src/client/components/FrontmatterPanel.module.css.mjs
		const css$2 = ".CU7Uba_panel{border:1px solid var(--dsw-alias-border-l2,#0000001a);border-radius:var(--dsw-radius-sm,8px);background:var(--dsw-alias-bg-layer-1,#fff);flex-direction:column;min-width:0;display:flex;overflow:hidden}.CU7Uba_head{border-bottom:1px solid var(--dsw-alias-border-l1,#0000000a);background:var(--dsw-alias-bg-module-platform,#f5f6f7);align-items:center;gap:8px;padding:8px 12px;display:flex}.CU7Uba_title{min-width:0;color:var(--dsw-alias-label-tertiary,#81858c);letter-spacing:.08em;text-transform:uppercase;flex:1;margin:0;font-size:10.5px;font-weight:600}.CU7Uba_count{color:var(--dsw-alias-label-tertiary,#81858c);font-variant-numeric:tabular-nums;font-size:11px}.CU7Uba_list{max-height:320px;margin:0;padding:0;overflow-y:auto}.CU7Uba_row{border-bottom:1px solid var(--dsw-alias-border-l1,#0000000a);flex-direction:column;gap:3px;min-width:0;padding:8px 12px;display:flex}.CU7Uba_row:last-child{border-bottom:none}.CU7Uba_key{overflow-wrap:anywhere;min-width:0;color:var(--dsw-alias-label-tertiary,#81858c);letter-spacing:.02em;font-size:10.5px;font-weight:600}.CU7Uba_value{min-width:0;color:var(--dsw-alias-label-primary,#0f1115);margin:0;font-size:12.5px;line-height:19px}.CU7Uba_text{overflow-wrap:anywhere}.CU7Uba_chips{flex-wrap:wrap;gap:4px;display:flex}.CU7Uba_chip{background:var(--dsw-alias-bg-module-platform,#f5f6f7);max-width:100%;color:var(--dsw-alias-label-secondary,#61666b);overflow-wrap:anywhere;border-radius:999px;padding:1px 7px;font-size:11px;line-height:17px;display:inline-flex}.CU7Uba_chipOn{background:color-mix(in srgb, var(--dsw-alias-state-success-primary,#22c55e) 12%, transparent);color:var(--dsw-alias-state-success-primary,#22c55e)}.CU7Uba_block{border-radius:var(--dsw-radius-xs,4px);background:var(--dsw-alias-bg-module-platform,#f5f6f7);max-height:200px;color:var(--dsw-alias-label-secondary,#61666b);white-space:pre-wrap;overflow-wrap:anywhere;margin:0;padding:8px 10px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;line-height:18px;overflow:auto}";
		const tagId$2 = "dsh-skills-hub/FrontmatterPanel.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$2) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-skills-hub";
			tag.dataset.pluginCss = tagId$2;
			tag.textContent = css$2;
			document.head.appendChild(tag);
		}
		var FrontmatterPanel_module_css_default = {
			"block": "CU7Uba_block",
			"chip": "CU7Uba_chip",
			"chipOn": "CU7Uba_chipOn",
			"chips": "CU7Uba_chips",
			"count": "CU7Uba_count",
			"head": "CU7Uba_head",
			"key": "CU7Uba_key",
			"list": "CU7Uba_list",
			"panel": "CU7Uba_panel",
			"row": "CU7Uba_row",
			"text": "CU7Uba_text",
			"title": "CU7Uba_title",
			"value": "CU7Uba_value"
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
		//#region \0dsh-css:/Users/nanmi/workspace/myself_code/dsh-skills-hub/src/client/components/SkillDetailView.module.css.mjs
		const css$1 = ".NbBuJa_detail{box-sizing:border-box;min-width:0;color:var(--dsw-alias-label-primary,#0f1115);flex-direction:column;gap:12px;padding:16px 20px 28px;display:flex}.NbBuJa_back{display:flex}.NbBuJa_header{align-items:flex-start;gap:18px;min-width:0;display:flex}.NbBuJa_headerText{flex:1;min-width:0}.NbBuJa_eyebrow{align-items:center;gap:7px;margin:0;font-size:11px;line-height:16px;display:flex}.NbBuJa_source{color:var(--dsw-alias-label-tertiary,#81858c);letter-spacing:.1em;text-transform:uppercase;font-weight:700}.NbBuJa_version{color:var(--dsw-alias-label-tertiary,#81858c);font-variant-numeric:tabular-nums}.NbBuJa_name{letter-spacing:-.014em;overflow-wrap:anywhere;margin:4px 0 0;font-size:26px;font-weight:700;line-height:34px}.NbBuJa_name:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#4176e6);outline-offset:3px;border-radius:var(--dsw-radius-xs,4px)}.NbBuJa_badges{flex-wrap:wrap;align-items:center;gap:6px;margin-top:10px;display:flex}.NbBuJa_summary{max-width:68ch;color:var(--dsw-alias-label-secondary,#61666b);overflow-wrap:anywhere;margin:10px 0 0;font-size:14px;line-height:22px}.NbBuJa_warning{border-radius:var(--dsw-radius-sm,8px);background:color-mix(in srgb, var(--dsw-alias-state-error-primary,#ec1313) 10%, transparent);color:var(--dsw-alias-label-primary,#0f1115);align-items:center;gap:8px;margin:0;padding:8px 12px;font-size:12.5px;line-height:19px;display:flex}.NbBuJa_warningIcon{color:var(--dsw-alias-state-error-primary,#ec1313);flex:none}.NbBuJa_reports{border-top:1px solid var(--dsw-alias-border-l1,#0000000a);border-bottom:1px solid var(--dsw-alias-border-l1,#0000000a);flex-wrap:wrap;align-items:center;gap:8px 14px;padding:10px 2px;font-size:12.5px;line-height:19px;display:flex}.NbBuJa_reportsLabel{color:var(--dsw-alias-label-tertiary,#81858c)}.NbBuJa_report{flex-wrap:wrap;align-items:center;gap:8px;min-width:0;display:inline-flex}.NbBuJa_reportVendor{color:var(--dsw-alias-label-primary,#0f1115);font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12.5px;font-weight:600}.NbBuJa_reportStatus{color:var(--dsw-alias-label-secondary,#61666b)}.NbBuJa_reportLink{background:color-mix(in srgb, var(--dsw-alias-state-business-primary,#4176e6) 12%, transparent);color:var(--dsw-alias-state-business-primary,#4176e6);border-radius:999px;align-items:center;padding:2px 9px;font-size:12px;font-weight:600;text-decoration:none;display:inline-flex}.NbBuJa_reportLink:hover{background:color-mix(in srgb, var(--dsw-alias-state-business-primary,#4176e6) 20%, transparent)}.NbBuJa_reportLink:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#4176e6);outline-offset:2px}.NbBuJa_columns{flex-wrap:wrap;align-items:flex-start;gap:20px;min-width:0;display:flex}.NbBuJa_main{flex-direction:column;flex:340px;gap:14px;min-width:0;display:flex}.NbBuJa_panel{border:1px solid var(--dsw-alias-border-l2,#0000001a);border-radius:var(--dsw-radius-md,12px);background:var(--dsw-alias-bg-layer-1,#fff);min-width:0;padding:16px 18px}.NbBuJa_markdown{overflow-wrap:anywhere;max-width:74ch;font-size:13.5px;line-height:1.7}.NbBuJa_frontmatter{margin-top:18px}.NbBuJa_muted{color:var(--dsw-alias-label-tertiary,#81858c);align-items:center;gap:6px;margin:0;padding:6px 0;font-size:12.5px;line-height:19px;display:flex}.NbBuJa_files{flex-wrap:wrap;align-items:flex-start;gap:14px;min-width:0;display:flex}.NbBuJa_fileList{border:1px solid var(--dsw-alias-border-l2,#0000001a);border-radius:var(--dsw-radius-sm,8px);flex:220px;min-width:0;max-height:420px;margin:0;padding:4px;list-style:none;overflow-y:auto}.NbBuJa_fileItem{box-sizing:border-box;border-radius:var(--dsw-radius-xs,4px);width:100%;color:var(--dsw-alias-label-secondary,#61666b);font:inherit;text-align:left;cursor:pointer;background:0 0;border:none;align-items:center;gap:7px;margin:0;padding:6px 8px;font-size:12px;line-height:18px;display:flex}.NbBuJa_fileItem:hover{background:var(--dsw-alias-interactive-bg-hover,#2631480f)}.NbBuJa_fileItem:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#4176e6);outline-offset:-1px}.NbBuJa_fileItemActive{background:var(--dsw-alias-button-ghost-active-fill,#ebeef2);color:var(--dsw-alias-label-primary,#0f1115);font-weight:600}.NbBuJa_fileIcon{color:var(--dsw-alias-label-tertiary,#81858c);flex:none}.NbBuJa_filePath{text-overflow:ellipsis;white-space:nowrap;flex:1;min-width:0;overflow:hidden}.NbBuJa_fileFlag{background:color-mix(in srgb, var(--dsw-alias-state-warn-primary,#f59e0b) 14%, transparent);color:var(--dsw-alias-state-warn-primary,#f59e0b);border-radius:999px;flex:none;padding:0 6px;font-size:10.5px;font-weight:600;line-height:17px}.NbBuJa_fileMeta{color:var(--dsw-alias-label-tertiary,#81858c);font-variant-numeric:tabular-nums;white-space:nowrap;flex:none;font-size:11px}.NbBuJa_fileView{flex:2 320px;min-width:0}.NbBuJa_fileBar{align-items:center;gap:8px;min-width:0;margin-bottom:8px;display:flex}.NbBuJa_fileBarPath{min-width:0;color:var(--dsw-alias-label-secondary,#61666b);text-overflow:ellipsis;white-space:nowrap;flex:1;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11.5px;overflow:hidden}.NbBuJa_copy{flex:none}.NbBuJa_rail{flex:260px;min-width:0}.NbBuJa_railCard{border:1px solid var(--dsw-alias-border-l2,#0000001a);border-radius:var(--dsw-radius-md,12px);background:var(--dsw-alias-bg-layer-1,#fff);flex-direction:column;min-width:0;display:flex;overflow:hidden}.NbBuJa_railAction{flex-direction:column;gap:8px;padding:14px 14px 10px;display:flex}.NbBuJa_railAction>button{width:100%}.NbBuJa_facts{margin:0;padding:0 14px 6px}.NbBuJa_fact{border-bottom:1px solid var(--dsw-alias-border-l1,#0000000a);justify-content:space-between;align-items:baseline;gap:14px;min-width:0;padding:9px 0;display:flex}.NbBuJa_fact:last-child{border-bottom:none}.NbBuJa_factLabel{color:var(--dsw-alias-label-tertiary,#81858c);flex:none;font-size:12.5px;line-height:19px}.NbBuJa_factValue{min-width:0;color:var(--dsw-alias-label-primary,#0f1115);text-align:right;overflow-wrap:anywhere;margin:0;font-size:13px;font-weight:600;line-height:19px}.NbBuJa_srOnly{clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;border:0;width:1px;height:1px;margin:-1px;padding:0;position:absolute;overflow:hidden}";
		const tagId$1 = "dsh-skills-hub/SkillDetailView.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-skills-hub";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var SkillDetailView_module_css_default = {
			"back": "NbBuJa_back",
			"badges": "NbBuJa_badges",
			"columns": "NbBuJa_columns",
			"copy": "NbBuJa_copy",
			"detail": "NbBuJa_detail",
			"eyebrow": "NbBuJa_eyebrow",
			"fact": "NbBuJa_fact",
			"factLabel": "NbBuJa_factLabel",
			"factValue": "NbBuJa_factValue",
			"facts": "NbBuJa_facts",
			"fileBar": "NbBuJa_fileBar",
			"fileBarPath": "NbBuJa_fileBarPath",
			"fileFlag": "NbBuJa_fileFlag",
			"fileIcon": "NbBuJa_fileIcon",
			"fileItem": "NbBuJa_fileItem",
			"fileItemActive": "NbBuJa_fileItemActive",
			"fileList": "NbBuJa_fileList",
			"fileMeta": "NbBuJa_fileMeta",
			"filePath": "NbBuJa_filePath",
			"fileView": "NbBuJa_fileView",
			"files": "NbBuJa_files",
			"frontmatter": "NbBuJa_frontmatter",
			"header": "NbBuJa_header",
			"headerText": "NbBuJa_headerText",
			"main": "NbBuJa_main",
			"markdown": "NbBuJa_markdown",
			"muted": "NbBuJa_muted",
			"name": "NbBuJa_name",
			"panel": "NbBuJa_panel",
			"rail": "NbBuJa_rail",
			"railAction": "NbBuJa_railAction",
			"railCard": "NbBuJa_railCard",
			"report": "NbBuJa_report",
			"reportLink": "NbBuJa_reportLink",
			"reportStatus": "NbBuJa_reportStatus",
			"reportVendor": "NbBuJa_reportVendor",
			"reports": "NbBuJa_reports",
			"reportsLabel": "NbBuJa_reportsLabel",
			"source": "NbBuJa_source",
			"srOnly": "NbBuJa_srOnly",
			"summary": "NbBuJa_summary",
			"version": "NbBuJa_version",
			"warning": "NbBuJa_warning",
			"warningIcon": "NbBuJa_warningIcon"
		};
		//#endregion
		//#region lib/client/components/SkillDetailView.js
		/** How long the copy button stays in its confirmed state. */
		const COPIED_RESET_MS = 2e3;
		/** Stable DOM ids for the tab list and its panels; one detail view is mounted at a time. */
		const TAB_ID = "skills-hub-detail-tab";
		const PANEL_ID$1 = "skills-hub-detail-panel";
		/** Compact counts, matching the catalogue cards. */
		function formatCount(value) {
			if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
			if (value >= 1e3) return `${(value / 1e3).toFixed(1)}k`;
			return String(value);
		}
		/** Upstream timestamps are epoch millis; an unparseable one renders as nothing. */
		function formatDate(timestamp) {
			const date = new Date(timestamp);
			return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString();
		}
		/**
		* A report link is only rendered for an absolute http(s) URL: the value comes
		* from an upstream catalogue, and `javascript:` in an `href` would execute in
		* the DSH page.
		*/
		function safeReportUrl(url) {
			return url !== void 0 && /^https?:\/\//i.test(url) ? url : void 0;
		}
		/** One label/value row of the right-hand facts rail. */
		function Fact(props) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: SkillDetailView_module_css_default.fact,
				children: [(0, react_jsx_runtime.jsx)("dt", {
					className: SkillDetailView_module_css_default.factLabel,
					children: props.label
				}), (0, react_jsx_runtime.jsx)("dd", {
					className: SkillDetailView_module_css_default.factValue,
					children: props.children
				})]
			});
		}
		/**
		* Skill detail page.
		*
		* Like the home page this component owns no data: the tab, the selected file
		* and the file contents all live in `MarketState`, so switching tabs or
		* re-opening a skill does not lose its place.
		*
		* Overview renders the SKILL.md body with the primitives' `MarkdownText`,
		* which is a plain prop-driven component — it needs `labels`, not a provider,
		* so the contract's fallback ("a local markdown-lite renderer") was not
		* necessary. Frontmatter is shown as structure rather than markdown, because a
		* dozen short YAML fields rendered as prose is a wall of bold headings.
		*/
		function SkillDetailView(props) {
			const { detail, state, controller } = props;
			const t = useT();
			const headingRef = (0, react.useRef)(null);
			const [copied, setCopied] = (0, react.useState)(false);
			const resetTimer = (0, react.useRef)(void 0);
			(0, react.useEffect)(() => {
				headingRef.current?.focus();
			}, [detail.id]);
			(0, react.useEffect)(() => () => {
				if (resetTimer.current !== void 0) clearTimeout(resetTimer.current);
			}, []);
			const copyFile = (0, react.useCallback)(() => {
				const content = state.file?.content;
				if (content === void 0) return;
				(0, _deepseek_ai_dsh_client_ui_primitives.writeClipboard)(content).then((ok) => {
					if (!ok) return;
					setCopied(true);
					if (resetTimer.current !== void 0) clearTimeout(resetTimer.current);
					resetTimer.current = setTimeout(() => setCopied(false), COPIED_RESET_MS);
				});
			}, [state.file]);
			const markdownLabels = (0, react.useMemo)(() => ({
				code: {
					copyLabel: t("copy"),
					copiedLabel: t("copied")
				},
				footnotes: t("footnotes")
			}), [t]);
			const tabs = [{
				value: "overview",
				label: t("overview"),
				id: `${TAB_ID}-overview`,
				panelId: `${PANEL_ID$1}-overview`
			}, {
				value: "files",
				label: `${t("files")} (${detail.files.length})`,
				id: `${TAB_ID}-files`,
				panelId: `${PANEL_ID$1}-files`
			}];
			const installationInFlight = state.installingIds.has(detail.id);
			const author = detail.author.displayName ?? detail.author.handle;
			const file = state.file;
			const selectedPath = file?.path ?? null;
			const selectFile = (meta) => {
				if (meta.path === selectedPath) return;
				controller.selectFile(meta.path);
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: SkillDetailView_module_css_default.detail,
				children: [
					(0, react_jsx_runtime.jsx)("div", {
						className: SkillDetailView_module_css_default.back,
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "ghost",
							size: "sm",
							icon: (0, react_jsx_runtime.jsx)(ArrowLeftIcon, { size: 16 }),
							onClick: () => controller.closeDetail(),
							children: t("back")
						})
					}),
					(0, react_jsx_runtime.jsxs)("header", {
						className: SkillDetailView_module_css_default.header,
						children: [(0, react_jsx_runtime.jsx)(SkillAvatar, {
							name: detail.name,
							source: detail.source,
							iconUrl: detail.iconUrl,
							size: 84
						}), (0, react_jsx_runtime.jsxs)("div", {
							className: SkillDetailView_module_css_default.headerText,
							children: [
								(0, react_jsx_runtime.jsxs)("p", {
									className: SkillDetailView_module_css_default.eyebrow,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: SkillDetailView_module_css_default.source,
										children: t(`source.${detail.source}`)
									}), detail.version !== void 0 && detail.version !== "" && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
										"aria-hidden": "true",
										children: "·"
									}), (0, react_jsx_runtime.jsxs)("span", {
										className: SkillDetailView_module_css_default.version,
										children: ["v", detail.version]
									})] })]
								}),
								(0, react_jsx_runtime.jsx)("h1", {
									ref: headingRef,
									tabIndex: -1,
									className: SkillDetailView_module_css_default.name,
									children: detail.name
								}),
								(0, react_jsx_runtime.jsxs)("div", {
									className: SkillDetailView_module_css_default.badges,
									children: [(0, react_jsx_runtime.jsx)(SecurityBadge, {
										status: detail.securityStatus,
										reports: detail.securityReports
									}), (0, react_jsx_runtime.jsx)(InstallStateBadge, { state: detail.installState })]
								}),
								detail.summary !== "" && (0, react_jsx_runtime.jsx)("p", {
									className: SkillDetailView_module_css_default.summary,
									children: detail.summary
								})
							]
						})]
					}),
					detail.installState === "not-installable" && detail.notInstallableReason !== void 0 && (0, react_jsx_runtime.jsxs)("p", {
						className: SkillDetailView_module_css_default.warning,
						role: "note",
						title: detail.notInstallableReason,
						children: [(0, react_jsx_runtime.jsx)(AlertIcon, {
							size: 16,
							className: SkillDetailView_module_css_default.warningIcon
						}), (0, react_jsx_runtime.jsx)("span", { children: t("notInstallable") })]
					}),
					detail.securityReports !== void 0 && detail.securityReports.length > 0 && (0, react_jsx_runtime.jsxs)("div", {
						className: SkillDetailView_module_css_default.reports,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: SkillDetailView_module_css_default.reportsLabel,
							children: t("security")
						}), detail.securityReports.map((report) => {
							const url = safeReportUrl(report.reportUrl);
							return (0, react_jsx_runtime.jsxs)("span", {
								className: SkillDetailView_module_css_default.report,
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										className: SkillDetailView_module_css_default.reportVendor,
										children: report.vendor
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: SkillDetailView_module_css_default.reportStatus,
										children: report.statusText
									}),
									url !== void 0 && (0, react_jsx_runtime.jsx)("a", {
										className: SkillDetailView_module_css_default.reportLink,
										href: url,
										target: "_blank",
										rel: "noreferrer noopener",
										children: t("viewReport")
									})
								]
							}, `${report.vendor}:${report.status}`);
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: SkillDetailView_module_css_default.columns,
						children: [(0, react_jsx_runtime.jsxs)("main", {
							className: SkillDetailView_module_css_default.main,
							children: [
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SegmentedTabs, {
									items: tabs,
									value: state.activeTab,
									onChange: (value) => controller.setTab(value),
									label: detail.name
								}),
								state.activeTab === "overview" && (0, react_jsx_runtime.jsxs)("section", {
									className: SkillDetailView_module_css_default.panel,
									id: `${PANEL_ID$1}-overview`,
									role: "tabpanel",
									"aria-labelledby": `${TAB_ID}-overview`,
									children: [detail.description.trim() !== "" ? (0, react_jsx_runtime.jsx)("div", {
										className: SkillDetailView_module_css_default.markdown,
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
											text: detail.description,
											labels: markdownLabels,
											variant: "body"
										})
									}) : detail.summary !== "" && (0, react_jsx_runtime.jsx)("p", {
										className: SkillDetailView_module_css_default.summary,
										children: detail.summary
									}), detail.descriptionFrontmatter !== void 0 && Object.keys(detail.descriptionFrontmatter).length > 0 && (0, react_jsx_runtime.jsx)("div", {
										className: SkillDetailView_module_css_default.frontmatter,
										children: (0, react_jsx_runtime.jsx)(FrontmatterPanel, { data: detail.descriptionFrontmatter })
									})]
								}),
								state.activeTab === "files" && (0, react_jsx_runtime.jsx)("section", {
									className: SkillDetailView_module_css_default.panel,
									id: `${PANEL_ID$1}-files`,
									role: "tabpanel",
									"aria-labelledby": `${TAB_ID}-files`,
									children: detail.files.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
										className: SkillDetailView_module_css_default.muted,
										children: t("noFiles")
									}) : (0, react_jsx_runtime.jsxs)("div", {
										className: SkillDetailView_module_css_default.files,
										children: [(0, react_jsx_runtime.jsx)("ul", {
											className: SkillDetailView_module_css_default.fileList,
											children: detail.files.map((meta) => {
												const active = meta.path === selectedPath;
												return (0, react_jsx_runtime.jsx)("li", { children: (0, react_jsx_runtime.jsxs)("button", {
													type: "button",
													className: `${SkillDetailView_module_css_default.fileItem} ${active ? SkillDetailView_module_css_default.fileItemActive : ""}`,
													"aria-current": active ? "true" : void 0,
													onClick: () => selectFile(meta),
													children: [
														(0, react_jsx_runtime.jsx)(FileIcon, {
															size: 14,
															className: SkillDetailView_module_css_default.fileIcon
														}),
														(0, react_jsx_runtime.jsx)("span", {
															className: SkillDetailView_module_css_default.filePath,
															title: meta.path,
															children: meta.path
														}),
														meta.tooBig && (0, react_jsx_runtime.jsx)("span", {
															className: SkillDetailView_module_css_default.fileFlag,
															children: t("fileTooLarge")
														}),
														(0, react_jsx_runtime.jsxs)("span", {
															className: SkillDetailView_module_css_default.fileMeta,
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
											className: SkillDetailView_module_css_default.fileView,
											children: file === null ? state.fileLoading ? (0, react_jsx_runtime.jsxs)("p", {
												className: SkillDetailView_module_css_default.muted,
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
													className: SkillDetailView_module_css_default.fileBar,
													children: [(0, react_jsx_runtime.jsx)("span", {
														className: SkillDetailView_module_css_default.fileBarPath,
														title: file.path,
														children: file.path
													}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
														variant: "outline",
														size: "sm",
														className: SkillDetailView_module_css_default.copy,
														"aria-label": copied ? t("copied") : t("copy"),
														onClick: copyFile,
														icon: copied ? (0, react_jsx_runtime.jsx)(CheckIcon, { size: 14 }) : (0, react_jsx_runtime.jsx)(CopyIcon, { size: 14 }),
														children: copied ? t("copied") : t("copy")
													})]
												}),
												file.truncated && (0, react_jsx_runtime.jsx)("p", {
													className: SkillDetailView_module_css_default.muted,
													children: t("fileTooLarge")
												}),
												(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.CodeBlock, {
													code: file.content,
													lang: file.language,
													showHeader: false,
													lineNumbers: true,
													copyLabel: t("copy"),
													copiedLabel: t("copied")
												}),
												(0, react_jsx_runtime.jsx)("p", {
													className: SkillDetailView_module_css_default.srOnly,
													role: "status",
													"aria-live": "polite",
													children: copied ? t("copied") : ""
												})
											] })
										})]
									})
								})
							]
						}), (0, react_jsx_runtime.jsx)("aside", {
							className: SkillDetailView_module_css_default.rail,
							children: (0, react_jsx_runtime.jsxs)("div", {
								className: SkillDetailView_module_css_default.railCard,
								children: [(0, react_jsx_runtime.jsxs)("div", {
									className: SkillDetailView_module_css_default.railAction,
									children: [
										detail.installState === "installable" && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "primary",
											size: "md",
											disabled: installationInFlight,
											icon: (0, react_jsx_runtime.jsx)(DownloadIcon, { size: 16 }),
											onClick: () => controller.requestInstall(detail.id),
											children: installationInFlight ? t("installing") : t("install")
										}),
										detail.installState === "installed" && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "outline",
											size: "md",
											disabled: installationInFlight,
											title: t("uninstallConfirm"),
											icon: (0, react_jsx_runtime.jsx)(TrashIcon, { size: 16 }),
											onClick: () => void controller.uninstall(detail.id),
											children: t("uninstall")
										}),
										detail.installState === "not-installable" && (0, react_jsx_runtime.jsx)("p", {
											className: SkillDetailView_module_css_default.muted,
											children: t("notInstallable")
										})
									]
								}), (0, react_jsx_runtime.jsxs)("dl", {
									className: SkillDetailView_module_css_default.facts,
									children: [
										(0, react_jsx_runtime.jsx)(Fact, {
											label: t("author"),
											children: author
										}),
										(0, react_jsx_runtime.jsx)(Fact, {
											label: t("downloads"),
											children: formatCount(detail.stats.downloads)
										}),
										detail.stats.installs !== void 0 && (0, react_jsx_runtime.jsx)(Fact, {
											label: t("installs"),
											children: formatCount(detail.stats.installs)
										}),
										detail.stats.stars !== void 0 && (0, react_jsx_runtime.jsx)(Fact, {
											label: t("stars"),
											children: formatCount(detail.stats.stars)
										}),
										detail.updatedAt !== void 0 && (0, react_jsx_runtime.jsx)(Fact, {
											label: t("updated"),
											children: formatDate(detail.updatedAt)
										}),
										detail.license !== void 0 && detail.license !== "" && (0, react_jsx_runtime.jsx)(Fact, {
											label: t("license"),
											children: detail.license
										}),
										detail.version !== void 0 && detail.version !== "" && (0, react_jsx_runtime.jsxs)(Fact, {
											label: t("version"),
											children: ["v", detail.version]
										})
									]
								})]
							})
						})]
					})
				]
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
		async function fetchMarketList(query, signal) {
			const search = new URLSearchParams();
			const q = query.q?.trim();
			if (q) search.set("q", q);
			if (query.source !== "all") search.set("source", query.source);
			if (query.security !== "all") search.set("security", query.security);
			if (query.installed !== "all") search.set("installed", query.installed);
			if (query.cursor) search.set("cursor", query.cursor);
			if (typeof query.limit === "number" && Number.isFinite(query.limit)) search.set("limit", String(query.limit));
			const suffix = search.toString();
			return getJson(`/skills${suffix === "" ? "" : `?${suffix}`}`, signal);
		}
		/** One skill's full detail plus the health of the source that served it. */
		async function fetchSkillDetail(id, signal) {
			const { source, slug } = parseMarketId(id);
			return getJson(`/skills/${source}/${encodeURIComponent(slug)}`, signal);
		}
		/** One file of a skill, for the Files tab. */
		async function fetchSkillFile(id, path, signal) {
			const { source, slug } = parseMarketId(id);
			return (await getJson(`/skills/${source}/${encodeURIComponent(slug)}/file?path=${encodeURIComponent(path)}`, signal)).file;
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
		async function installSkill(id) {
			const payload = await postJson("/install", { id });
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
		*  - **detail/file caching**: reopening a skill is instant and cannot blank the
		*    pane with a spinner.
		*  - **local index**: `filters.installed === 'installed'` lists what is already
		*    on disk (`fetchInstalled`) instead of asking the market, matching the
		*    contract's §5.3 behaviour.
		*
		* Aborts are control flow, never user-visible: the panel aborts superseded
		* requests on purpose, and `isAbortError` keeps those rejections out of
		* `state.error` / `state.notice`.
		*/
		/** One remote page (the reference store's `PAGE_SIZE`). */
		const PAGE_SIZE = 24;
		/** Search debounce, mirroring the reference store: typing must not fire per keystroke. */
		const SEARCH_DEBOUNCE_MS = 300;
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
					source: "all",
					security: "all",
					installed: "all"
				},
				items: [],
				nextCursor: null,
				sources: emptySources(),
				loading: false,
				loadingMore: false,
				error: null,
				view: { kind: "home" },
				detail: null,
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
		/** Case-insensitive match over the fields the local index can search. */
		function matchesQuery(skill, query) {
			if (query === "") return true;
			return skill.name.toLowerCase().includes(query) || skill.slug.toLowerCase().includes(query) || skill.summary.toLowerCase().includes(query) || skill.author.handle.toLowerCase().includes(query);
		}
		/**
		* Map one locally installed directory onto the card shape.
		*
		* `NormalizedSkill.source` is the two-value *market* union, so a directory with
		* no provenance sidecar (`source: 'local'`) has no truthful value there; it is
		* mapped onto the first market source purely to satisfy the display type. Its
		* `id` stays `local:<dir>`, so an uninstall attempt is rejected by the Host
		* (or by `parseMarketId`) rather than removing the wrong directory, and its
		* `securityStatus: 'unknown'` marks it as not market-audited in the UI.
		*/
		function installedRecordToSkill(record) {
			return {
				id: record.id,
				source: record.source === "local" ? "clawhub" : record.source,
				slug: record.slug,
				name: record.name,
				summary: record.summary ?? "",
				author: { handle: "" },
				stats: { downloads: 0 },
				tags: [],
				version: record.version,
				securityStatus: "unknown",
				installState: "installed",
				installedInfo: {
					version: record.version,
					installedAt: record.installedAt,
					dirName: record.dirName
				}
			};
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
			const fileCache = /* @__PURE__ */ new Map();
			let listSequence = 0;
			let detailSequence = 0;
			let fileSequence = 0;
			let listAbort = null;
			let detailAbort = null;
			let fileAbort = null;
			let inFlightList = null;
			let inFlightCursor = null;
			let inFlightFileKey = null;
			let debounceTimer = null;
			/**
			* Raw local index behind the installed filter.
			*
			* Kept alongside `state.items` because that branch is searched *in place*: the
			* index is already in memory, so a keystroke must not cost a round trip the way
			* a remote search does. `installedIndexLoaded` distinguishes "not fetched yet"
			* (a query change still needs the load) from "fetched and empty".
			*/
			let installedRecords = [];
			let installedIndexLoaded = false;
			function commit(patch) {
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
			function cancelDebounce() {
				if (debounceTimer === null) return;
				clearTimeout(debounceTimer);
				debounceTimer = null;
			}
			/** Identity of a list request: any filter change makes a different request. */
			function currentListKey() {
				const { q, source, security, installed } = state.filters;
				return JSON.stringify([
					q.trim(),
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
			/** Project the cached local index through the current query, with no request. */
			function commitInstalledIndex(extra = {}) {
				const query = state.filters.q.trim().toLowerCase();
				commit({
					...extra,
					items: installedRecords.map(installedRecordToSkill).filter((skill) => matchesQuery(skill, query)),
					nextCursor: null
				});
			}
			/**
			* After an install/uninstall the directory listing is the authority for the
			* installed view, so re-read it when it is the view on screen.
			*/
			function refreshInstalledIndexIfActive() {
				if (state.filters.installed !== "installed") return;
				installedIndexLoaded = false;
				refresh();
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
					detailCache.set(updated.id, patched);
					patch.detail = patched;
				} else {
					const cached = detailCache.get(updated.id);
					if (cached !== void 0) detailCache.set(updated.id, patchDetail(cached, updated));
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
			async function refresh() {
				cancelDebounce();
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
					nextCursor: null
				});
				const promise = (async () => {
					try {
						if (filters.installed === "installed") {
							const records = await fetchInstalled(controller.signal);
							if (sequence !== listSequence) return;
							installedRecords = records;
							installedIndexLoaded = true;
							commitInstalledIndex({ loading: false });
							return;
						}
						const result = await fetchMarketList({
							q: filters.q.trim() || void 0,
							source: filters.source,
							security: filters.security,
							installed: filters.installed,
							limit: PAGE_SIZE
						}, controller.signal);
						if (sequence !== listSequence) return;
						commit({
							items: result.items,
							nextCursor: result.nextCursor,
							sources: result.sources,
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
			* Typing rebuilds the catalogue after a pause, but the input stays controlled:
			* `filters.q` updates immediately so the field never lags the keyboard.
			*/
			function setQuery(q) {
				commit({ filters: {
					...state.filters,
					q
				} });
				cancelDebounce();
				if (state.filters.installed === "installed" && installedIndexLoaded) {
					commitInstalledIndex();
					return;
				}
				debounceTimer = setTimeout(() => {
					debounceTimer = null;
					refresh();
				}, SEARCH_DEBOUNCE_MS);
			}
			function applyInstantFilter(patch) {
				commit({ filters: {
					...state.filters,
					...patch
				} });
				cancelDebounce();
				refresh();
			}
			function isCurrentDetail(id) {
				return state.view.kind === "detail" && state.view.id === id;
			}
			async function loadDetail(id) {
				const sequence = ++detailSequence;
				detailAbort?.abort();
				const controller = new AbortController();
				detailAbort = controller;
				try {
					const { skill, sourceStatus } = await fetchSkillDetail(id, controller.signal);
					if (sequence !== detailSequence || !isCurrentDetail(id)) return;
					detailCache.set(id, skill);
					commit({
						detail: skill,
						detailLoading: false,
						detailError: null,
						sources: mergeSourceStatus(state.sources, skill.source, sourceStatus)
					});
				} catch (error) {
					if (sequence !== detailSequence || isAbortError(error)) return;
					commit({
						detailLoading: false,
						detailError: errorMessage(error)
					});
				}
			}
			/** Open one skill: cache first, network only when the cache misses. */
			async function openDetail(id) {
				const cached = detailCache.get(id);
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
				if (cached !== void 0) {
					commit({
						detail: cached,
						detailLoading: false
					});
					return;
				}
				commit({
					detail: null,
					detailLoading: true
				});
				await loadDetail(id);
			}
			function closeDetail() {
				detailSequence += 1;
				fileSequence += 1;
				detailAbort?.abort();
				fileAbort?.abort();
				commit({
					view: { kind: "home" },
					detail: null,
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
			/** Load one file of the open skill, cache first and one request per path. */
			async function selectFile(path) {
				if (state.view.kind !== "detail") return;
				const id = state.view.id;
				const key = fileCacheKey(id, path);
				const cached = fileCache.get(key);
				if (cached !== void 0) {
					commit({
						file: cached,
						fileLoading: false
					});
					return;
				}
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
					const file = await fetchSkillFile(id, path, controller.signal);
					if (sequence !== fileSequence) return;
					fileCache.set(key, file);
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
					applySkillUpdate((await installSkill(id)).skill);
					setNotice("installDone");
					refreshInstalledIndexIfActive();
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
					refreshInstalledIndexIfActive();
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
		//#region \0dsh-css:/Users/nanmi/workspace/myself_code/dsh-skills-hub/src/client/page/MarketPage.module.css.mjs
		const css = "._0pmZjW_panel{box-sizing:border-box;height:100%;min-height:0;color:var(--dsw-alias-label-primary,#1f2329);background:var(--dsw-alias-bg-base,#fff);flex-direction:column;display:flex;overflow:hidden}._0pmZjW_body{flex-direction:column;flex:auto;min-height:0;display:flex;overflow:auto}._0pmZjW_placeholder{text-align:center;flex-direction:column;flex:auto;justify-content:center;align-items:center;gap:12px;padding:48px 24px;display:flex}._0pmZjW_placeholderTitle{color:var(--dsw-alias-label-primary,#1f2329);margin:0;font-size:15px;font-weight:600}._0pmZjW_placeholderText{overflow-wrap:anywhere;max-width:460px;color:var(--dsw-alias-label-tertiary,#8a9099);margin:0;font-size:13px;line-height:1.6}._0pmZjW_retryButton{box-sizing:border-box;font:inherit;color:var(--dsw-alias-label-primary,#1f2329);cursor:pointer;background:var(--dsw-alias-bg-layer-1,#f5f6f7);border:1px solid var(--dsw-alias-border-l2,#e5e7eb);border-radius:8px;padding:6px 16px;font-size:13px}._0pmZjW_retryButton:hover{background:var(--dsw-alias-interactive-bg-hover,#eceef0)}._0pmZjW_retryButton:focus-visible{outline:2px solid var(--dsw-alias-brand-primary,#4d6bfe);outline-offset:2px}._0pmZjW_spinner{border:2px solid var(--dsw-alias-border-l2,#e5e7eb);border-top-color:var(--dsw-alias-brand-primary,#4d6bfe);border-radius:50%;width:20px;height:20px;animation:.8s linear infinite _0pmZjW_spin}@keyframes _0pmZjW_spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){._0pmZjW_spinner{animation-duration:2.4s}}";
		const tagId = "dsh-skills-hub/MarketPage.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-skills-hub";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var MarketPage_module_css_default = {
			"body": "_0pmZjW_body",
			"panel": "_0pmZjW_panel",
			"placeholder": "_0pmZjW_placeholder",
			"placeholderText": "_0pmZjW_placeholderText",
			"placeholderTitle": "_0pmZjW_placeholderTitle",
			"retryButton": "_0pmZjW_retryButton",
			"spin": "_0pmZjW_spin",
			"spinner": "_0pmZjW_spinner"
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
			const state = controller.state;
			const detailId = state.view.kind === "detail" ? state.view.id : null;
			(0, react.useEffect)(() => {
				controller.refresh();
			}, [controller]);
			const confirmSkill = state.confirmInstallId === null ? null : confirmSkillOf(state, state.confirmInstallId);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: MarketPage_module_css_default.panel,
				children: [
					(0, react_jsx_runtime.jsx)("div", {
						className: MarketPage_module_css_default.body,
						children: state.view.kind === "home" ? (0, react_jsx_runtime.jsx)(MarketHome, {
							state,
							controller
						}) : state.detail !== null ? (0, react_jsx_runtime.jsx)(SkillDetailView, {
							detail: state.detail,
							state,
							controller
						}) : (0, react_jsx_runtime.jsxs)("div", {
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
			const skill = state.items.find((item) => item.id === id) ?? (state.detail !== null && state.detail.id === id ? state.detail : null);
			if (skill !== null) return {
				id: skill.id,
				name: skill.name,
				source: skill.source,
				version: skill.version,
				securityStatus: skill.securityStatus,
				authorName: skill.author.displayName ?? skill.author.handle
			};
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
			panel: "技能市场",
			title: "技能市场",
			subtitle: "浏览、预览并安装来自 ClawHub 与 SkillHub 的第三方技能。",
			searchPlaceholder: "搜索技能名称、作者或关键词",
			clearSearch: "清除搜索",
			"source.all": "全部来源",
			"source.clawhub": "ClawHub",
			"source.skillhub": "SkillHub",
			"security.all": "全部安全状态",
			"security.verified": "已验证",
			"security.benign": "无风险",
			"security.unknown": "未知",
			"security.flagged": "有风险",
			"installed.all": "全部",
			"installed.installed": "已安装",
			"installed.installable": "可安装",
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
			disclaimer: "第三方技能由社区作者提供，未经 DeepSeek 审核。安装表示你信任其来源，请在安装前查看安全报告与 SKILL.md 内容。",
			dismiss: "知道了",
			"sourceStatus.ok": "正常",
			"sourceStatus.degraded": "不稳定",
			"sourceStatus.failed": "不可用",
			"sourceStatus.cached": "缓存",
			installDone: "安装完成",
			uninstallDone: "已卸载",
			noFiles: "这个技能没有可预览的文件。",
			fileTooLarge: "文件过大，无法预览。",
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
			panel: "Skills Hub",
			title: "Skills Hub",
			subtitle: "Browse, preview and install third-party skills from ClawHub and SkillHub.",
			searchPlaceholder: "Search skills by name, author or keyword",
			clearSearch: "Clear search",
			"source.all": "All sources",
			"source.clawhub": "ClawHub",
			"source.skillhub": "SkillHub",
			"security.all": "Any security status",
			"security.verified": "Verified",
			"security.benign": "Benign",
			"security.unknown": "Unknown",
			"security.flagged": "Flagged",
			"installed.all": "All",
			"installed.installed": "Installed",
			"installed.installable": "Installable",
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
			disclaimer: "Third-party skills come from community authors and are not reviewed by DeepSeek. Installing means you trust the source; read the security report and SKILL.md before you install.",
			dismiss: "Got it",
			"sourceStatus.ok": "OK",
			"sourceStatus.degraded": "Degraded",
			"sourceStatus.failed": "Unavailable",
			"sourceStatus.cached": "Cached",
			installDone: "Installed",
			uninstallDone: "Uninstalled",
			noFiles: "This skill has no previewable files.",
			fileTooLarge: "The file is too large to preview.",
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