import type { NormalizedSkill } from '../../market/types.ts'
import { useT } from '../locale-context.tsx'
import { CheckIcon, DownloadIcon, StarIcon } from '../icons.tsx'
import { SkillAvatar } from './SkillAvatar.tsx'
import { Chip, SecurityChip } from './SkillDetailShell.tsx'
import styles from './SkillCard.module.css'

/** Tags beyond this count collapse into a `+n` chip. */
const MAX_VISIBLE_TAGS = 3

/**
 * Compact download/star counts (`1.2k`, `3.4M`). Numeric and language-neutral,
 * so it needs no dictionary entry.
 */
function formatCount(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}k`
  return String(value)
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
export function SkillCard(props: {
  skill: NormalizedSkill
  installing: boolean
  onOpen: (id: string) => void
  onInstall?: (id: string) => void
}): JSX.Element {
  const { skill, installing, onOpen, onInstall } = props
  const t = useT()

  const extraTags = Math.max(0, skill.tags.length - MAX_VISIBLE_TAGS)
  const showInstall = onInstall !== undefined && skill.installState === 'installable'
  const author = skill.author.displayName ?? skill.author.handle

  return (
    <article className={styles.card}>
      <button
        type="button"
        className={styles.open}
        aria-label={skill.name}
        onClick={() => onOpen(skill.id)}
      />

      <div className={styles.head}>
        <SkillAvatar name={skill.name} source={skill.source} iconUrl={skill.iconUrl} size={44} />
        <div className={styles.headText}>
          <div className={styles.titleRow}>
            <h3 className={styles.title}>{skill.name}</h3>
            {skill.version !== undefined && skill.version !== '' && <span className={styles.version}>v{skill.version}</span>}
          </div>
          <p className={styles.origin}>
            <span>{t(`source.${skill.source}`)}</span>
            {author !== '' && <span className={styles.author}>{author}</span>}
          </p>
        </div>
      </div>

      <p className={styles.summary}>{skill.summary}</p>

      <div className={styles.tags}>
        <SecurityChip status={skill.securityStatus} short />
        {skill.featured === true && <Chip tone="blue">{t('featured')}</Chip>}
        {skill.tags.slice(0, MAX_VISIBLE_TAGS).map((tag) => (
          <Chip key={tag}>{tag}</Chip>
        ))}
        {extraTags > 0 && <Chip>+{extraTags}</Chip>}
      </div>

      <footer className={styles.footer}>
        <div className={styles.stats}>
          <span className={styles.stat} title={t('downloads')}>
            <DownloadIcon size={13} />
            {formatCount(skill.stats.downloads)}
          </span>
          {skill.stats.stars !== undefined && skill.stats.stars > 0 && (
            <span className={styles.stat} title={t('stars')}>
              <StarIcon size={13} />
              {formatCount(skill.stats.stars)}
            </span>
          )}
        </div>

        {showInstall && (
          <button
            type="button"
            className={styles.install}
            disabled={installing}
            aria-label={`${t('install')}: ${skill.name}`}
            onClick={() => onInstall?.(skill.id)}
          >
            <DownloadIcon size={14} />
            {installing ? t('installing') : t('install')}
          </button>
        )}
        {skill.installState === 'installed' && (
          <span className={styles.installed}>
            <CheckIcon size={14} />
            {t('installed')}
          </span>
        )}
        {skill.installState === 'not-installable' && <span className={styles.unavailable}>{t('notInstallable')}</span>}
      </footer>
    </article>
  )
}
