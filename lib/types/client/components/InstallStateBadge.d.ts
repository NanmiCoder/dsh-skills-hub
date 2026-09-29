import type { InstallState } from '../../market/types.ts';
/**
 * Local install state chip.
 *
 * The three labels come from dictionary keys the contract already fixes —
 * `installed`, `installed.installable` and `notInstallable` — so this badge
 * adds no vocabulary of its own.
 */
export declare function InstallStateBadge(props: {
    state: InstallState;
}): JSX.Element;
