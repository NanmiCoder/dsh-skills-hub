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

import { useEffect, useRef, useState } from 'react'
import { Button, Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import { fetchInstalled, isAbortError, removeInstalled, type InstalledSkillRecord } from '../api.ts'
import { useT } from '../locale-context.tsx'
import { FolderIcon, RefreshIcon, SearchIcon, TrashIcon } from '../icons.tsx'
import { InstalledSkillDetail } from './InstalledSkillDetail.tsx'
import { SkillAvatar } from './SkillAvatar.tsx'
import { Chip } from './SkillDetailShell.tsx'
import styles from './InstalledSkills.module.css'

/** Reader-facing text for anything thrown by the client. */
function messageOf(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason)
}

export function InstalledSkills(props: {
  /** A removal changed the local inventory; the market half refreshes too. */
  onChanged: () => void
  /** Open the market page of a skill that came from a market. */
  onOpenMarket: (id: string, owner?: string) => void
}): JSX.Element {
  const t = useT()
  const [items, setItems] = useState<InstalledSkillRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [revision, setRevision] = useState(0)
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const [pending, setPending] = useState<InstalledSkillRecord | null>(null)
  const [busy, setBusy] = useState(false)
  const [returnFocusKey, setReturnFocusKey] = useState<string | null>(null)
  /** Row buttons by skill key, so the detail page can hand focus back. */
  const rowButtons = useRef(new Map<string, HTMLButtonElement>())

  useEffect(() => {
    const abort = new AbortController()
    setLoading(true)
    setError(null)
    void fetchInstalled(abort.signal)
      .then((result) => {
        if (!abort.signal.aborted) setItems(result)
      })
      .catch((reason: unknown) => {
        if (!abort.signal.aborted && !isAbortError(reason)) setError(messageOf(reason))
      })
      .finally(() => {
        if (!abort.signal.aborted) setLoading(false)
      })
    return () => abort.abort()
  }, [revision])

  const uninstall = async (target: InstalledSkillRecord): Promise<void> => {
    if (busy) return
    setBusy(true)
    setError(null)
    try {
      await removeInstalled(target.key)
      setItems((current) => current.filter((item) => item.key !== target.key))
      setSelectedKey((current) => (current === target.key ? null : current))
      setPending(null)
      props.onChanged()
    } catch (reason) {
      setError(messageOf(reason))
      setPending(null)
    } finally {
      setBusy(false)
    }
  }

  // Resolved against the current rows, not captured when the row was clicked.
  const selected = selectedKey === null ? null : items.find((item) => item.key === selectedKey) ?? null

  // Returning to the list is a page switch back, so the keyboard cursor goes
  // back to the row that opened the page instead of to the top of the document.
  useEffect(() => {
    if (returnFocusKey === null) return
    rowButtons.current.get(returnFocusKey)?.focus()
    setReturnFocusKey(null)
  }, [returnFocusKey])

  const needle = query.trim().toLocaleLowerCase()
  const visible = items.filter((item) =>
    `${item.name} ${item.summary ?? ''} ${item.dirPath}`.toLocaleLowerCase().includes(needle),
  )

  return (
    <>
      {selected !== null ? (
        <InstalledSkillDetail
          key={selected.key}
          item={selected}
          onBack={() => {
            setReturnFocusKey(selected.key)
            setSelectedKey(null)
          }}
          onUninstall={setPending}
          onOpenMarket={props.onOpenMarket}
        />
      ) : (
        <section className={styles.root}>
          <div className={styles.top}>
            <header className={styles.header}>
              <div>
                <h1 className={styles.title}>{t('installedTitle')}</h1>
                <p className={styles.subtitle}>{t('installedScope')}</p>
              </div>
              <button
                type="button"
                className={styles.secondaryButton}
                disabled={loading}
                onClick={() => setRevision((value) => value + 1)}
              >
                <RefreshIcon size={14} />
                {t('refreshInstalled')}
              </button>
            </header>

            <label className={styles.searchField}>
              <SearchIcon size={16} />
              <input
                className={styles.search}
                type="search"
                aria-label={t('installedSearch')}
                placeholder={t('installedSearch')}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </label>
          </div>

          <div className={styles.canvas}>
            {error !== null && (
              <p role="alert" className={styles.error}>
                {error}
              </p>
            )}

            {loading ? (
              <div role="status" aria-label={t('loading')} className={styles.list}>
                {Array.from({ length: 5 }, (_, index) => (
                  <div key={index} className={styles.skeleton} />
                ))}
              </div>
            ) : (
              <>
                <p className={styles.count}>{t('count', { count: visible.length })}</p>
                {visible.length === 0 ? (
                  <p className={styles.empty}>{t(items.length === 0 ? 'installedEmpty' : 'emptySearch')}</p>
                ) : (
                  <div className={styles.list}>
                    {visible.map((item) => (
                      <article key={item.key} className={styles.card}>
                        <SkillAvatar name={item.name} source={item.source} size={44} />
                        <div className={styles.info}>
                          <div className={styles.nameRow}>
                            <button
                              type="button"
                              className={styles.name}
                              ref={(node) => {
                                if (node === null) rowButtons.current.delete(item.key)
                                else rowButtons.current.set(item.key, node)
                              }}
                              onClick={() => setSelectedKey(item.key)}
                            >
                              {item.name}
                            </button>
                            {item.version !== undefined && item.version !== '' && (
                              <span className={styles.version}>v{item.version}</span>
                            )}
                          </div>
                          <div className={styles.chips}>
                            <Chip tone={item.managed ? 'blue' : 'plain'}>
                              {item.source === 'local' ? t('localSkill') : t(`source.${item.source}`)}
                            </Chip>
                            {item.linked && <Chip>{t('linkedSkill')}</Chip>}
                          </div>
                          {item.summary !== undefined && item.summary !== '' && (
                            <p className={styles.summary}>{item.summary}</p>
                          )}
                          <p className={styles.path}>
                            <FolderIcon size={13} />
                            <span>{item.dirPath}</span>
                          </p>
                        </div>
                        <div className={styles.actions}>
                          <button type="button" className={styles.secondaryButton} onClick={() => setSelectedKey(item.key)}>
                            {t('viewInstalled')}
                          </button>
                          <button
                            type="button"
                            className={styles.secondaryButton}
                            disabled={!item.removable}
                            title={item.removable ? undefined : t('uninstallDisabled')}
                            onClick={() => setPending(item)}
                          >
                            <TrashIcon size={14} />
                            {t('uninstall')}
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      )}

      {/* Rendered by both views: the detail page's own uninstall button opens the
          same confirmation, and a dialog that only exists in one branch is a
          button that silently does nothing in the other. */}
      {pending !== null && (
        <Modal
          open
          title={t('uninstallTitle', { name: pending.name })}
          closeLabel={t('close')}
          description={t(pending.linked ? 'unlinkDescription' : 'localUninstallDescription')}
          onClose={() => {
            if (!busy) setPending(null)
          }}
          footer={
            <div className={styles.dialogActions}>
              <Button variant="outline" size="md" disabled={busy} onClick={() => setPending(null)}>
                {t('cancel')}
              </Button>
              <Button variant="primary" size="md" disabled={busy} onClick={() => void uninstall(pending)}>
                {t(busy ? 'uninstalling' : 'uninstallConfirm')}
              </Button>
            </div>
          }
        >
          <p className={styles.dialogPath}>{pending.dirPath}</p>
        </Modal>
      )}
    </>
  )
}
