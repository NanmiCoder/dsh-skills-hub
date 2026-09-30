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
import { InstalledSkillDetail } from './InstalledSkillDetail.tsx'
import styles from './InstalledSkills.module.css'

/** Reader-facing text for anything thrown by the client. */
function messageOf(reason: unknown): string {
  return reason instanceof Error ? reason.message : String(reason)
}

export function InstalledSkills(props: {
  /** A removal changed the local inventory; the market half refreshes too. */
  onChanged: () => void
  /** Open the market page of a skill that came from a market. */
  onOpenMarket: (id: string) => void
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
          <header className={styles.header}>
            <div>
              <h1>{t('installedTitle')}</h1>
              <p>{t('installedScope')}</p>
            </div>
            <Button variant="outline" size="sm" disabled={loading} onClick={() => setRevision((value) => value + 1)}>
              {t('refreshInstalled')}
            </Button>
          </header>

          <input
            className={styles.search}
            type="search"
            aria-label={t('installedSearch')}
            placeholder={t('installedSearch')}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />

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
                      <div className={styles.info}>
                        <button
                          className={styles.name}
                          ref={(node) => {
                            if (node === null) rowButtons.current.delete(item.key)
                            else rowButtons.current.set(item.key, node)
                          }}
                          onClick={() => setSelectedKey(item.key)}
                        >
                          {item.name}
                        </button>
                        <span className={styles.badge}>
                          {item.source === 'local' ? t('localSkill') : t(`source.${item.source}`)}
                        </span>
                        {item.linked && <span className={styles.badge}>{t('linkedSkill')}</span>}
                        {item.version !== undefined && item.version !== '' && (
                          <span className={styles.version}>v{item.version}</span>
                        )}
                        {item.summary !== undefined && item.summary !== '' && (
                          <p className={styles.summary}>{item.summary}</p>
                        )}
                        <p className={styles.path}>{item.dirPath}</p>
                      </div>
                      <div className={styles.actions}>
                        <Button variant="outline" size="sm" onClick={() => setSelectedKey(item.key)}>
                          {t('viewInstalled')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!item.removable}
                          title={item.removable ? undefined : t('uninstallDisabled')}
                          onClick={() => setPending(item)}
                        >
                          {t('uninstall')}
                        </Button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </>
          )}
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
            <div className={styles.actions}>
              <Button variant="outline" size="md" disabled={busy} onClick={() => setPending(null)}>
                {t('cancel')}
              </Button>
              <Button variant="primary" size="md" disabled={busy} onClick={() => void uninstall(pending)}>
                {t(busy ? 'uninstalling' : 'uninstallConfirm')}
              </Button>
            </div>
          }
        >
          <p className={styles.path}>{pending.dirPath}</p>
        </Modal>
      )}
    </>
  )
}
