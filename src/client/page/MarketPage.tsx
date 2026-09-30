/**
 * Skills Hub panel root.
 *
 * Responsibilities, and nothing else:
 *  - own exactly one controller per mounted panel instance (`props.useMarketController`);
 *  - route `state.view` to `MarketHome` or `SkillDetailView`;
 *  - render the install confirmation the controller asked for;
 *  - render one notice toast for `state.notice`.
 *
 * This is also the only component the slot machinery calls, so it is the only
 * place that receives the framework's `t` seat (`PropsLocale<NS>`); it publishes
 * that seat through `LocaleProvider` for every descendant, which keeps the
 * presentational components free of slot props (contract §5.4).
 */

import { useEffect, useState } from 'react'
import { Toast } from '@deepseek-ai/dsh-client-ui-primitives'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import type { MarketSource } from '../../market/types.ts'
import { InstallConfirmDialog } from '../components/InstallConfirmDialog.tsx'
import { InstalledSkills } from '../components/InstalledSkills.tsx'
import { MarketHome } from '../components/MarketHome.tsx'
import { SkillDetailView } from '../components/SkillDetailView.tsx'
import { SkillDetailSkeleton } from '../components/SkillDetailShell.tsx'
import { LocaleProvider, useT, type Translate } from '../locale-context.tsx'
import { NS } from '../locales.ts'
import {
  isMarketNoticeCode,
  type MarketController,
  type MarketPageInjected,
  type MarketState,
} from '../state.ts'
import styles from './MarketPage.module.css'

/** Composed props of the `main` registration: the injected business face plus the locale seat. */
export type MarketPageProps = MarketPageInjected & PropsLocale<typeof NS>

/** The summary `InstallConfirmDialog` expects, derived from its own frozen props. */
type ConfirmSkill = Parameters<typeof InstallConfirmDialog>[0]['skill']

/** Panel entry: bind the controller and publish the locale seat. */
export function MarketPage(props: MarketPageProps): JSX.Element {
  const controller = props.useMarketController()
  return (
    <LocaleProvider t={props.t}>
      <MarketPageSurface controller={controller} />
    </LocaleProvider>
  )
}

function MarketPageSurface({ controller }: { controller: MarketController }): JSX.Element {
  const t = useT()
  const [section, setSection] = useState<'market' | 'installed'>('market')
  const state = controller.state
  const detailId = state.view.kind === 'detail' ? state.view.id : null

  // The panel guarantees its own first load: the catalogue component may or may
  // not request one, and the controller de-duplicates a concurrent request, so a
  // second trigger costs nothing. A StrictMode remount re-runs this effect and is
  // absorbed by the same guard.
  useEffect(() => {
    void controller.refresh()
  }, [controller])

  const confirmSkill = state.confirmInstallId === null ? null : confirmSkillOf(state, state.confirmInstallId)

  return (
    <div className={styles.panel}>
      <nav className={styles.navigation} aria-label={t('panel')}>
        <button type="button" aria-current={section === 'market' ? 'page' : undefined} onClick={() => setSection('market')}>{t('marketTab')}</button>
        <button type="button" aria-current={section === 'installed' ? 'page' : undefined} onClick={() => setSection('installed')}>{t('installedTitle')}</button>
      </nav>
      <div className={styles.body}>
        {section === 'installed' ? (
          <InstalledSkills
            onChanged={() => { controller.closeDetail(); void controller.refresh() }}
            // A locally installed skill that carries market provenance opens
            // the marketplace's own detail page: upstream facts stay upstream.
            onOpenMarket={(id) => {
              setSection('market')
              void controller.openDetail(id)
            }}
          />
        ) : state.view.kind === 'home' ? (
          <MarketHome state={state} controller={controller} />
        ) : state.detail !== null ? (
          <SkillDetailView detail={state.detail} state={state} controller={controller} />
        ) : state.detailError === null ? (
          <SkillDetailSkeleton onBack={() => controller.closeDetail()} />
        ) : (
          <div className={styles.placeholder} role={state.detailError === null ? 'status' : 'alert'}>
            {state.detailError === null ? <span className={styles.spinner} aria-hidden="true" /> : null}
            <p className={styles.placeholderTitle}>{state.detailError === null ? t('loading') : t('error')}</p>
            {state.detailError === null ? null : <p className={styles.placeholderText}>{state.detailError}</p>}
            {state.detailError === null || detailId === null ? null : (
              <button
                type="button"
                className={styles.retryButton}
                onClick={() => {
                  void controller.openDetail(detailId)
                }}
              >
                {t('retry')}
              </button>
            )}
          </div>
        )}
      </div>

      {confirmSkill === null ? null : (
        <InstallConfirmDialog
          skill={confirmSkill}
          busy={state.installingIds.has(confirmSkill.id)}
          onCancel={() => {
            controller.cancelInstall()
          }}
          onConfirm={() => {
            void controller.confirmInstall()
          }}
        />
      )}

      {state.notice === null ? null : (
        <Toast
          text={noticeText(t, state.notice)}
          tone={isMarketNoticeCode(state.notice) ? 'success' : undefined}
          // A failure names what broke, so it needs a longer read than a success.
          holdMs={isMarketNoticeCode(state.notice) ? 2600 : 6000}
          onDone={() => {
            controller.dismissNotice()
          }}
        />
      )}
    </div>
  )
}

/** Dictionary code for a panel-generated notice; anything else is already reader-facing text. */
function noticeText(t: Translate, notice: string): string {
  return isMarketNoticeCode(notice) ? t(notice) : notice
}

/**
 * Resolve the skill the confirmation dialog describes.
 *
 * It is normally the card (or the detail view) the reader clicked, but the dialog
 * must never be dropped on a state the panel cannot see — e.g. a deep link that
 * arrived before the list finished loading — so the id itself is the fallback.
 */
function confirmSkillOf(state: MarketState, id: string): ConfirmSkill {
  const skill =
    (state.detail !== null && state.detail.id === id ? state.detail : null) ?? state.items.find((item) => item.id === id) ?? null
  if (skill !== null) {
    // The dialog has to be able to say "this is a snapshot": which status
    // applies depends on where the skill came from — the open detail page or
    // the list.
    const fromDetail = state.detail !== null && state.detail.id === id
    const status = fromDetail ? state.detailStatus : state.sources[skill.source]
    const snapshotAt = status?.fromCache === true ? status.fetchedAt : undefined
    return {
      id: skill.id,
      name: skill.name,
      source: skill.source,
      version: skill.version,
      securityStatus: skill.securityStatus,
      authorName: skill.author.displayName ?? skill.author.handle,
      ...(snapshotAt === undefined ? {} : { snapshotAt }),
    }
  }
  return {
    id,
    name: id,
    source: sourceFromId(id),
    securityStatus: 'unknown',
    authorName: '',
  }
}

/** Display-only fallback: only market ids reach this path. */
function sourceFromId(id: string): MarketSource {
  return id.startsWith('skillhub:') ? 'skillhub' : 'clawhub'
}
