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
export declare function InstalledSkills(props: {
    /** A removal changed the local inventory; the market half refreshes too. */
    onChanged: () => void;
    /** Open the market page of a skill that came from a market. */
    onOpenMarket: (id: string) => void;
}): JSX.Element;
