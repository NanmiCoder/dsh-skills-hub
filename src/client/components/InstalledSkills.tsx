import { useEffect, useState } from 'react'
import { Button, Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import { fetchInstalled, fetchInstalledDetail, removeInstalled, isAbortError, type InstalledSkillRecord } from '../api.ts'
import { stripSkillFrontmatter } from '../skill-markdown.ts'
import { MarkdownView } from './MarkdownView.tsx'
import { useT } from '../locale-context.tsx'
import styles from './InstalledSkills.module.css'

export function InstalledSkills({ onChanged }: { onChanged: () => void }): JSX.Element {
  const t = useT()
  const [items, setItems] = useState<InstalledSkillRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [revision, setRevision] = useState(0)
  const [selected, setSelected] = useState<InstalledSkillRecord | null>(null)
  const [markdown, setMarkdown] = useState<string | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [pending, setPending] = useState<InstalledSkillRecord | null>(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    const abort = new AbortController()
    setLoading(true)
    setError(null)
    void fetchInstalled(abort.signal).then(result => { if (!abort.signal.aborted) setItems(result) }).catch(reason => {
      if (!abort.signal.aborted && !isAbortError(reason)) setError(String(reason.message ?? reason))
    }).finally(() => { if (!abort.signal.aborted) setLoading(false) })
    return () => abort.abort()
  }, [revision])
  useEffect(() => {
    setMarkdown(null)
    setDetailError(null)
    if (!selected) return
    const abort = new AbortController()
    void fetchInstalledDetail(selected.key, abort.signal).then(result => { if (!abort.signal.aborted) setMarkdown(stripSkillFrontmatter(result.markdown)) }).catch(reason => {
      if (!abort.signal.aborted && !isAbortError(reason)) setDetailError(String(reason.message ?? reason))
    })
    return () => abort.abort()
  }, [selected])
  async function uninstall(): Promise<void> {
    if (!pending || busy) return
    setBusy(true)
    setError(null)
    try {
      await removeInstalled(pending.key)
      setItems(current => current.filter(item => item.key !== pending.key))
      if (selected?.key === pending.key) setSelected(null)
      setPending(null)
      onChanged()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason))
      setPending(null)
    } finally { setBusy(false) }
  }
  const needle = query.trim().toLocaleLowerCase()
  const visible = items.filter(item => `${item.name} ${item.summary ?? ''} ${item.dirPath}`.toLocaleLowerCase().includes(needle))
  return <section className={styles.root}>
    <header className={styles.header}>
      <div><h1>{t('installedTitle')}</h1><p>{t('installedScope')}</p></div>
      <Button variant="outline" size="sm" disabled={loading} onClick={() => setRevision(value => value + 1)}>{t('refreshInstalled')}</Button>
    </header>
    <input className={styles.search} type="search" aria-label={t('installedSearch')} placeholder={t('installedSearch')} value={query} onChange={event => setQuery(event.target.value)} />
    {error && <p role="alert" className={styles.error}>{error}</p>}
    {loading ? <div role="status" aria-label={t('loading')} className={styles.list}>{Array.from({ length: 5 }, (_, index) => <div key={index} className={styles.skeleton} />)}</div> : <>
      <p className={styles.count}>{t('count', { count: visible.length })}</p>
      {visible.length === 0 ? <p className={styles.empty}>{t(items.length === 0 ? 'installedEmpty' : 'emptySearch')}</p> : <div className={styles.list}>
        {visible.map(item => <article key={item.key} className={styles.card}>
          <div className={styles.info}><button className={styles.name} onClick={() => setSelected(item)}>{item.name}</button>
            <span className={styles.badge}>{item.source === 'local' ? t('localSkill') : t(`source.${item.source}`)}</span>
            {item.linked && <span className={styles.badge}>{t('linkedSkill')}</span>}
            {item.version && <span className={styles.version}>v{item.version}</span>}
            {item.summary && <p className={styles.summary}>{item.summary}</p>}
            <p className={styles.path}>{item.dirPath}</p>
          </div>
          <div className={styles.actions}><Button variant="outline" size="sm" onClick={() => setSelected(item)}>{t('viewInstalled')}</Button><Button variant="outline" size="sm" disabled={!item.removable} onClick={() => setPending(item)}>{t('uninstall')}</Button></div>
        </article>)}
      </div>}
    </>}
    {selected && <Modal open title={selected.name} closeLabel={t('close')} onClose={() => setSelected(null)}>
      <p className={styles.path}>{selected.dirPath}</p>
      <div className={styles.preview}>{detailError ? <p role="alert">{detailError}</p> : markdown === null ? <div role="status" aria-label={t('loading')}><div className={styles.skeleton} /><div className={styles.skeleton} /></div> : <MarkdownView content={markdown} />}</div>
    </Modal>}
    {pending && <Modal open title={t('uninstallTitle', { name: pending.name })} closeLabel={t('close')} description={t(pending.linked ? 'unlinkDescription' : 'localUninstallDescription')} onClose={() => { if (!busy) setPending(null) }} footer={<div className={styles.actions}><Button variant="outline" size="md" disabled={busy} onClick={() => setPending(null)}>{t('cancel')}</Button><Button variant="primary" size="md" disabled={busy} onClick={() => void uninstall()}>{t(busy ? 'uninstalling' : 'uninstallConfirm')}</Button></div>}>
      <p className={styles.path}>{pending.dirPath}</p>
    </Modal>}
  </section>
}
