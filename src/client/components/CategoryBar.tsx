import type { MarketCategory } from '../../market/types.ts'
import { useT } from '../locale-context.tsx'
import styles from './CategoryBar.module.css'

/**
 * Category chips above the curated catalogue.
 *
 * The categories are the catalogue's own, so every chip has skills behind it
 * and its count is exact. Rendered only once they loaded.
 */
export function CategoryBar(props: {
  categories: MarketCategory[]
  active: string
  disabled: boolean
  onSelect: (category: string) => void
}): JSX.Element | null {
  const { categories, active, disabled, onSelect } = props
  const t = useT()
  if (categories.length === 0) return null
  const english = t('category.lang') === 'en'
  const entries: Array<{ key: string; label: string; count?: number }> = [{ key: 'all', label: t('category.all') }].concat(
    categories.map((category) => ({
      key: category.key,
      label: (english && category.nameEn) || category.name,
      count: category.count,
    })),
  )

  return (
    <div className={styles.bar}>
      <div className={styles.chips} role="radiogroup" aria-label={t('category.label')}>
        {entries.map((entry) => (
          <button
            key={entry.key}
            type="button"
            role="radio"
            aria-checked={entry.key === active}
            className={styles.chip}
            disabled={disabled && entry.key !== active}
            onClick={() => onSelect(entry.key)}
          >
            {entry.label}
            {entry.count !== undefined && <span className={styles.count}>{entry.count}</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
