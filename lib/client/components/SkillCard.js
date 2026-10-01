import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useT } from "../locale-context.js";
import { CheckIcon, DownloadIcon, StarIcon } from "../icons.js";
import { SkillAvatar } from "./SkillAvatar.js";
import { Chip, SecurityChip } from "./SkillDetailShell.js";
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
    return (_jsxs("article", { className: styles.card, children: [_jsx("button", { type: "button", className: styles.open, "aria-label": skill.name, onClick: () => onOpen(skill.id) }), _jsxs("div", { className: styles.head, children: [_jsx(SkillAvatar, { name: skill.name, source: skill.source, iconUrl: skill.iconUrl, size: 44 }), _jsxs("div", { className: styles.headText, children: [_jsxs("div", { className: styles.titleRow, children: [_jsx("h3", { className: styles.title, children: skill.name }), skill.version !== undefined && skill.version !== '' && _jsxs("span", { className: styles.version, children: ["v", skill.version] })] }), _jsxs("p", { className: styles.origin, children: [_jsx("span", { children: t(`source.${skill.source}`) }), author !== '' && _jsx("span", { className: styles.author, children: author })] })] })] }), _jsx("p", { className: styles.summary, children: skill.summary }), _jsxs("div", { className: styles.tags, children: [_jsx(SecurityChip, { status: skill.securityStatus, short: true }), skill.featured === true && _jsx(Chip, { tone: "blue", children: t('featured') }), skill.tags.slice(0, MAX_VISIBLE_TAGS).map((tag) => (_jsx(Chip, { children: tag }, tag))), extraTags > 0 && _jsxs(Chip, { children: ["+", extraTags] })] }), _jsxs("footer", { className: styles.footer, children: [_jsxs("div", { className: styles.stats, children: [_jsxs("span", { className: styles.stat, title: t('downloads'), children: [_jsx(DownloadIcon, { size: 13 }), formatCount(skill.stats.downloads)] }), skill.stats.stars !== undefined && skill.stats.stars > 0 && (_jsxs("span", { className: styles.stat, title: t('stars'), children: [_jsx(StarIcon, { size: 13 }), formatCount(skill.stats.stars)] }))] }), showInstall && (_jsxs("button", { type: "button", className: styles.install, disabled: installing, "aria-label": `${t('install')}: ${skill.name}`, onClick: () => onInstall?.(skill.id), children: [_jsx(DownloadIcon, { size: 14 }), installing ? t('installing') : t('install')] })), skill.installState === 'installed' && (_jsxs("span", { className: styles.installed, children: [_jsx(CheckIcon, { size: 14 }), t('installed')] })), skill.installState === 'not-installable' && _jsx("span", { className: styles.unavailable, children: t('notInstallable') })] })] }));
}
