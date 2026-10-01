/**
 * `skillsHub` dictionaries for the Skills Hub panel.
 *
 * Registration mechanics are copied from `dsh-agent-teams/src/client/locales.ts`
 * (same DSH version): the plugin calls `ctx.locale.register(NS, { zh, en })` and
 * every registration site that declares `locale: NS` receives the framework's
 * typed `t` seat. The namespace name is frozen by docs/CONTRACT.md §5.3.
 */
/** Dictionary namespace owned by the Skills Hub client plugin. */
export declare const NS = "skillsHub";
/**
 * Simplified Chinese dictionary — the key-set source of truth.
 *
 * Kept as an unexported literal so `en` below can be *checked* against its exact
 * key union while `zh` itself is exported as the plain `Record<string, string>`
 * the contract §5.3 declares (the literal type would otherwise leak into every
 * consumer, including the components workstream).
 */
declare const zhDictionary: {
    installedTitle: string;
    marketTab: string;
    installedScope: string;
    installedSearch: string;
    refreshInstalled: string;
    installedEmpty: string;
    localSkill: string;
    linkedSkill: string;
    viewInstalled: string;
    localUninstallDescription: string;
    unlinkDescription: string;
    uninstalling: string;
    uninstallDisabled: string;
    copyPath: string;
    copiedPath: string;
    sourceLabel: string;
    managedByHub: string;
    unmanagedSkill: string;
    symlinkSkill: string;
    installedAtLabel: string;
    skillKind: string;
    bundleSkill: string;
    flatSkill: string;
    filesCount: string;
    emptyDocument: string;
    installedReadFailed: string;
    openInMarket: string;
    fileView: string;
    filePreview: string;
    fileSource: string;
    snapshotAge: string;
    ageJustNow: string;
    ageMinutes: string;
    ageHours: string;
    ageDays: string;
    refreshNow: string;
    refreshSnapshot: string;
    detailSnapshot: string;
    installSnapshot: string;
    marketProvenance: string;
    panel: string;
    title: string;
    subtitle: string;
    searchPlaceholder: string;
    clearSearch: string;
    'source.all': string;
    'source.clawhub': string;
    'source.skillhub': string;
    'source.local': string;
    'security.all': string;
    'security.verified': string;
    'security.benign': string;
    'security.unknown': string;
    'security.flagged': string;
    'installed.all': string;
    'installed.installed': string;
    'installed.installable': string;
    'category.lang': string;
    'category.label': string;
    'category.all': string;
    categoryTag: string;
    breadcrumb: string;
    updatedOn: string;
    needsApiKey: string;
    sourcePage: string;
    securityReport: string;
    changelog: string;
    whenToUse: string;
    info: string;
    latestUpdate: string;
    fullChangelog: string;
    olderVersions: string;
    openChangelogFile: string;
    noChangelog: string;
    scanReports: string;
    noReports: string;
    scanDisclaimer: string;
    readingTime: string;
    expand: string;
    collapse: string;
    capTitle: string;
    viewFullReport: string;
    capNote: string;
    'cap.shell': string;
    'cap.shell.detail': string;
    'cap.hooks': string;
    'cap.hooks.detail': string;
    'cap.secrets': string;
    'cap.secrets.detail': string;
    'cap.network': string;
    'cap.network.detail': string;
    'cap.writes': string;
    'cap.writes.detail': string;
    'cap.binaries': string;
    'cap.binaries.detail': string;
    'scan.verified': string;
    'scan.benign': string;
    'scan.unknown': string;
    'scan.flagged': string;
    installTitle: string;
    confirmInstall: string;
    willGet: string;
    'level.high': string;
    'level.medium': string;
    'level.low': string;
    installWarnFlagged: string;
    installWarnUnknown: string;
    ack: string;
    installedOn: string;
    'scanShort.verified': string;
    'scanShort.benign': string;
    'scanShort.unknown': string;
    'scanShort.flagged': string;
    catalogSummary: string;
    catalogUpdated: string;
    liveResults: string;
    featured: string;
    'scope.catalogHint': string;
    'scope.marketHint': string;
    'scope.searchMarket': string;
    'scope.backToCatalog': string;
    'filter.source': string;
    'filter.security': string;
    'filter.installed': string;
    count: string;
    loading: string;
    loadingMore: string;
    loadMore: string;
    loadMoreError: string;
    empty: string;
    emptyHint: string;
    emptySearch: string;
    emptySearchHint: string;
    error: string;
    retry: string;
    install: string;
    installing: string;
    installed: string;
    notInstallable: string;
    uninstall: string;
    uninstallConfirm: string;
    uninstallTitle: string;
    uninstallDescription: string;
    installConfirmMessage: string;
    installLocation: string;
    cancel: string;
    confirm: string;
    close: string;
    back: string;
    overview: string;
    files: string;
    security: string;
    viewReport: string;
    frontmatter: string;
    footnotes: string;
    author: string;
    downloads: string;
    installs: string;
    stars: string;
    updated: string;
    license: string;
    version: string;
    disclaimer: string;
    dismiss: string;
    'sourceStatus.ok': string;
    'sourceStatus.degraded': string;
    'sourceStatus.failed': string;
    'sourceStatus.cached': string;
    installDone: string;
    uninstallDone: string;
    noFiles: string;
    fileTooLarge: string;
    fileTruncated: string;
    copy: string;
    copied: string;
    unoaudited: string;
};
/** Simplified Chinese dictionary. */
export declare const zh: Record<string, string>;
/**
 * English dictionary. Typed against the Chinese key union so a missing or extra
 * key is a compile error — the locale runtime requires bilingual balance and
 * would otherwise throw at registration time.
 */
export declare const en: Record<keyof typeof zhDictionary, string>;
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Skills Hub panel copy. */
        skillsHub: string;
    }
}
export {};
