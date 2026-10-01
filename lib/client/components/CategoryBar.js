import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useT } from "../locale-context.js";
import styles from './CategoryBar.module.css';
/**
 * Category chips above the curated catalogue.
 *
 * The categories are the catalogue's own, so every chip has skills behind it
 * and its count is exact. Rendered only once they loaded.
 */
export function CategoryBar(props) {
    const { categories, active, disabled, onSelect } = props;
    const t = useT();
    if (categories.length === 0)
        return null;
    const english = t('category.lang') === 'en';
    const entries = [{ key: 'all', label: t('category.all') }].concat(categories.map((category) => ({
        key: category.key,
        label: (english && category.nameEn) || category.name,
        count: category.count,
    })));
    return (_jsx("div", { className: styles.bar, children: _jsx("div", { className: styles.chips, role: "radiogroup", "aria-label": t('category.label'), children: entries.map((entry) => (_jsxs("button", { type: "button", role: "radio", "aria-checked": entry.key === active, className: styles.chip, disabled: disabled && entry.key !== active, onClick: () => onSelect(entry.key), children: [entry.label, entry.count !== undefined && _jsx("span", { className: styles.count, children: entry.count })] }, entry.key))) }) }));
}
