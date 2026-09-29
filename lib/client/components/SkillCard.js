import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Button } from '@deepseek-ai/dsh-client-ui-primitives';
import { useT } from "../locale-context.js";
import { DownloadIcon, StarIcon, TagIcon } from "../icons.js";
import { InstallStateBadge } from "./InstallStateBadge.js";
import { SecurityBadge } from "./SecurityBadge.js";
import { SkillAvatar } from "./SkillAvatar.js";
import styles from './SkillCard.module.css';
/** Tags beyond this count collapse into a `+n` chip. */
const MAX_VISIBLE_TAGS = 3;
/**
 * Compact download/star counts (`1.2k`, `3.4M`). Numeric and language-neutral,
 * so it needs no dictionary entry.
 */
function formatCount(value) {
    if (value >= 1_000_000)
        return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000)
        return `${(value / 1_000).toFixed(1)}k`;
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
export function SkillCard(props) {
    const { skill, installing, onOpen, onInstall } = props;
    const t = useT();
    const extraTags = Math.max(0, skill.tags.length - MAX_VISIBLE_TAGS);
    const showInstall = onInstall !== undefined && skill.installState === 'installable';
    const author = skill.author.displayName ?? skill.author.handle;
    return (_jsxs("article", { className: styles.card, children: [_jsx("button", { type: "button", className: styles.open, "aria-label": skill.name, onClick: () => onOpen(skill.id) }), _jsxs("div", { className: styles.head, children: [_jsx(SkillAvatar, { name: skill.name, source: skill.source, iconUrl: skill.iconUrl, size: 46 }), _jsxs("div", { className: styles.headText, children: [_jsxs("div", { className: styles.titleRow, children: [_jsx("h3", { className: styles.title, children: skill.name }), skill.version !== undefined && skill.version !== '' && _jsxs("span", { className: styles.version, children: ["v", skill.version] })] }), _jsxs("p", { className: styles.origin, children: [_jsx("span", { className: styles.source, children: t(`source.${skill.source}`) }), author !== '' && (_jsxs(_Fragment, { children: [_jsx("span", { "aria-hidden": "true", children: "\u00B7" }), _jsx("span", { className: styles.author, children: author })] }))] })] })] }), _jsx("p", { className: styles.summary, children: skill.summary }), skill.tags.length > 0 && (_jsxs("p", { className: styles.tags, children: [_jsx(TagIcon, { size: 13, className: styles.tagIcon }), skill.tags.slice(0, MAX_VISIBLE_TAGS).map((tag) => (_jsxs("span", { className: styles.tag, children: ["#", tag] }, tag))), extraTags > 0 && _jsxs("span", { className: styles.tag, children: ["+", extraTags] })] })), _jsxs("footer", { className: styles.footer, children: [_jsxs("div", { className: styles.badges, children: [_jsx(SecurityBadge, { status: skill.securityStatus, reports: skill.securityReports, compact: true }), !showInstall && _jsx(InstallStateBadge, { state: skill.installState })] }), _jsxs("div", { className: styles.stats, children: [_jsxs("span", { className: styles.stat, title: t('downloads'), children: [_jsx(DownloadIcon, { size: 13 }), formatCount(skill.stats.downloads)] }), skill.stats.stars !== undefined && skill.stats.stars > 0 && (_jsxs("span", { className: styles.stat, title: t('stars'), children: [_jsx(StarIcon, { size: 13 }), formatCount(skill.stats.stars)] })), showInstall && (_jsx(Button, { variant: "primary", size: "sm", className: styles.install, disabled: installing, "aria-label": `${t('install')}: ${skill.name}`, onClick: () => onInstall?.(skill.id), icon: _jsx(DownloadIcon, { size: 14 }), children: installing ? t('installing') : t('install') }))] })] })] }));
}
