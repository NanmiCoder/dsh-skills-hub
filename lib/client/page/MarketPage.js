import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { useEffect, useState } from 'react';
import { Toast } from '@deepseek-ai/dsh-client-ui-primitives';
import { InstallConfirmDialog } from "../components/InstallConfirmDialog.js";
import { InstalledSkills } from "../components/InstalledSkills.js";
import { MarketHome } from "../components/MarketHome.js";
import { SkillDetailView, SkillDetailSkeleton } from "../components/SkillDetailView.js";
import { LocaleProvider, useT } from "../locale-context.js";
import { isMarketNoticeCode, } from "../state.js";
import styles from './MarketPage.module.css';
/** Panel entry: bind the controller and publish the locale seat. */
export function MarketPage(props) {
    const controller = props.useMarketController();
    return (_jsx(LocaleProvider, { t: props.t, children: _jsx(MarketPageSurface, { controller: controller }) }));
}
function MarketPageSurface({ controller }) {
    const t = useT();
    const [section, setSection] = useState('market');
    const state = controller.state;
    const detailId = state.view.kind === 'detail' ? state.view.id : null;
    // The panel guarantees its own first load: the catalogue component may or may
    // not request one, and the controller de-duplicates a concurrent request, so a
    // second trigger costs nothing. A StrictMode remount re-runs this effect and is
    // absorbed by the same guard.
    useEffect(() => {
        void controller.refresh();
    }, [controller]);
    const confirmSkill = state.confirmInstallId === null ? null : confirmSkillOf(state, state.confirmInstallId);
    return (_jsxs("div", { className: styles.panel, children: [_jsxs("nav", { className: styles.navigation, "aria-label": t('panel'), children: [_jsx("button", { type: "button", "aria-current": section === 'market' ? 'page' : undefined, onClick: () => setSection('market'), children: t('marketTab') }), _jsx("button", { type: "button", "aria-current": section === 'installed' ? 'page' : undefined, onClick: () => setSection('installed'), children: t('installedTitle') })] }), _jsx("div", { className: styles.body, children: section === 'installed' ? (_jsx(InstalledSkills, { onChanged: () => { controller.closeDetail(); void controller.refresh(); } })) : state.view.kind === 'home' ? (_jsx(MarketHome, { state: state, controller: controller })) : state.detail !== null ? (_jsx(SkillDetailView, { detail: state.detail, state: state, controller: controller })) : state.detailError === null ? (_jsx(SkillDetailSkeleton, { onBack: () => controller.closeDetail() })) : (_jsxs("div", { className: styles.placeholder, role: state.detailError === null ? 'status' : 'alert', children: [state.detailError === null ? _jsx("span", { className: styles.spinner, "aria-hidden": "true" }) : null, _jsx("p", { className: styles.placeholderTitle, children: state.detailError === null ? t('loading') : t('error') }), state.detailError === null ? null : _jsx("p", { className: styles.placeholderText, children: state.detailError }), state.detailError === null || detailId === null ? null : (_jsx("button", { type: "button", className: styles.retryButton, onClick: () => {
                                void controller.openDetail(detailId);
                            }, children: t('retry') }))] })) }), confirmSkill === null ? null : (_jsx(InstallConfirmDialog, { skill: confirmSkill, busy: state.installingIds.has(confirmSkill.id), onCancel: () => {
                    controller.cancelInstall();
                }, onConfirm: () => {
                    void controller.confirmInstall();
                } })), state.notice === null ? null : (_jsx(Toast, { text: noticeText(t, state.notice), tone: isMarketNoticeCode(state.notice) ? 'success' : undefined, 
                // A failure names what broke, so it needs a longer read than a success.
                holdMs: isMarketNoticeCode(state.notice) ? 2600 : 6000, onDone: () => {
                    controller.dismissNotice();
                } }))] }));
}
/** Dictionary code for a panel-generated notice; anything else is already reader-facing text. */
function noticeText(t, notice) {
    return isMarketNoticeCode(notice) ? t(notice) : notice;
}
/**
 * Resolve the skill the confirmation dialog describes.
 *
 * It is normally the card (or the detail view) the reader clicked, but the dialog
 * must never be dropped on a state the panel cannot see — e.g. a deep link that
 * arrived before the list finished loading — so the id itself is the fallback.
 */
function confirmSkillOf(state, id) {
    const skill = (state.detail !== null && state.detail.id === id ? state.detail : null) ?? state.items.find((item) => item.id === id) ?? null;
    if (skill !== null) {
        return {
            id: skill.id,
            name: skill.name,
            source: skill.source,
            version: skill.version,
            securityStatus: skill.securityStatus,
            authorName: skill.author.displayName ?? skill.author.handle,
        };
    }
    return {
        id,
        name: id,
        source: sourceFromId(id),
        securityStatus: 'unknown',
        authorName: '',
    };
}
/** Display-only fallback: only market ids reach this path. */
function sourceFromId(id) {
    return id.startsWith('skillhub:') ? 'skillhub' : 'clawhub';
}
