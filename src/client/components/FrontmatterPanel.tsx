import { useT } from '../locale-context.tsx'
import styles from './FrontmatterPanel.module.css'

/** Longest JSON we are willing to render inline, in characters. */
const MAX_JSON_LENGTH = 600

/** Narrow an `unknown` frontmatter value to a plain object (arrays excluded). */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Scalar rendering for anything that is not an array, object or block string. */
function scalarText(value: unknown): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') return String(value)
  if (typeof value === 'symbol') return value.description ?? 'symbol'
  if (typeof value === 'function') return 'fn'
  return '—'
}

/** Objects go out as JSON; a pathological value must not fill the whole rail. */
function jsonText(value: unknown): string {
  try {
    const text = JSON.stringify(value, null, 2)
    if (text === undefined) return '—'
    return text.length > MAX_JSON_LENGTH ? `${text.slice(0, MAX_JSON_LENGTH)}…` : text
  } catch {
    return '—'
  }
}

/** One value cell; the shape decides between a chip row, a code block and text. */
function ValueView({ value }: { value: unknown }): JSX.Element {
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className={styles.text}>—</span>
    return (
      <span className={styles.chips}>
        {value.map((item, index) => (
          <span key={`${String(index)}`} className={styles.chip}>
            {scalarText(item)}
          </span>
        ))}
      </span>
    )
  }

  if (typeof value === 'boolean') {
    return <span className={`${styles.chip} ${value ? styles.chipOn : ''}`}>{value ? 'true' : 'false'}</span>
  }

  if (typeof value === 'string' && value.includes('\n')) {
    return <pre className={styles.block}>{value}</pre>
  }

  if (isRecord(value)) {
    return <pre className={styles.block}>{jsonText(value)}</pre>
  }

  return <span className={styles.text}>{scalarText(value)}</span>
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
export function FrontmatterPanel(props: { data: Record<string, unknown> }): JSX.Element {
  const { data } = props
  const t = useT()

  const entries = Object.entries(data)
  // An empty block still returns an element: the prop is a required object, so
  // "nothing to show" must not become a `null` return.
  if (entries.length === 0) return <></>

  return (
    <section className={styles.panel}>
      <div className={styles.head}>
        <h3 className={styles.title}>{t('frontmatter')}</h3>
        <span className={styles.count}>{entries.length}</span>
      </div>
      <dl className={styles.list}>
        {entries.map(([key, value]) => (
          <div key={key} className={styles.row}>
            <dt className={styles.key} title={key}>
              {key}
            </dt>
            <dd className={styles.value}>
              <ValueView value={value} />
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
