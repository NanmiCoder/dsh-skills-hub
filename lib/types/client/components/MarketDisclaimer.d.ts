/**
 * Third-party risk notice shown above the catalogue until it is acknowledged.
 *
 * Purely presentational: persistence (`localStorage`, `disclaimerDismissed`)
 * belongs to the controller, so this component stays reusable in a bare test
 * render and cannot drift from the stored flag.
 */
export declare function MarketDisclaimer(props: {
    onDismiss: () => void;
}): JSX.Element;
