/**
 * How old a snapshot is, in the panel's own vocabulary.
 *
 * The panel shows cached catalogue data, so "when was this actually fetched" is
 * part of the answer rather than a debug detail: a reader who is about to
 * install third-party code is entitled to know whether the security report in
 * front of them was read a minute ago or yesterday.
 */
/** Coarse buckets: the first match wins, and precision beyond them is noise. */
export function formatAge(t, from, now = Date.now()) {
    const minutes = Math.floor(Math.max(0, now - from) / 60_000);
    if (minutes < 1)
        return t('ageJustNow');
    if (minutes < 60)
        return t('ageMinutes', { count: minutes });
    const hours = Math.floor(minutes / 60);
    if (hours < 24)
        return t('ageHours', { count: hours });
    return t('ageDays', { count: Math.floor(hours / 24) });
}
/** Absolute timestamp for the hover text, so the bucket never hides the fact. */
export function formatStamp(from) {
    const date = new Date(from);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleString();
}
