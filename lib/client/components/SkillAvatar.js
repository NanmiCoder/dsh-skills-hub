import { jsx as _jsx } from "react/jsx-runtime";
import styles from './SkillAvatar.module.css';
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
    clawhub: [2, 5, 1],
    skillhub: [0, 4, 3],
    local: [3],
};
/** Class name per tone slot, resolved once so the render path stays trivial. */
const TONE_CLASSES = [
    styles['tone0'] ?? '',
    styles['tone1'] ?? '',
    styles['tone2'] ?? '',
    styles['tone3'] ?? '',
    styles['tone4'] ?? '',
    styles['tone5'] ?? '',
];
/**
 * Deterministic palette index: the same name always keeps the same identity
 * color across sessions, pages and re-renders.
 */
function hashIndex(input) {
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
        hash = (hash * 31 + input.charCodeAt(i)) | 0;
    }
    return Math.abs(hash) % TONE_COUNT;
}
/**
 * First visible character, uppercased. `Array.from` rather than `name[0]` so a
 * CJK or astral-plane initial is not cut in half by UTF-16 indexing.
 */
function initialOf(name) {
    const first = Array.from(name.trim())[0];
    return first ? first.toUpperCase() : '?';
}
/**
 * Skill icon tile.
 *
 * An `<img>` is rendered only for an `https:` URL: the string arrives from a
 * third-party catalogue, and allowing `javascript:` or `data:` here would turn
 * an upstream payload into script execution inside the DSH page.
 */
export function SkillAvatar(props) {
    const { name, source, iconUrl, size } = props;
    // One corner ratio, not one fixed corner: the grid tile and the detail
    // header draw the same shape at 46px and 92px.
    const radius = Math.round(size * 0.24);
    if (iconUrl !== undefined && iconUrl.startsWith('https://')) {
        return (_jsx("img", { src: iconUrl, alt: "", width: size, height: size, loading: "lazy", decoding: "async", className: styles.image, style: { width: size, height: size, borderRadius: radius } }));
    }
    const family = SOURCE_TONES[source];
    const tone = family[hashIndex(name) % family.length] ?? 0;
    return (_jsx("span", { "aria-hidden": "true", className: `${styles.letter} ${TONE_CLASSES[tone] ?? ''}`, style: { width: size, height: size, borderRadius: radius, fontSize: Math.round(size * 0.4) }, children: initialOf(name) }));
}
