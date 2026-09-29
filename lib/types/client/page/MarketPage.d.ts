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
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots';
import { NS } from '../locales.ts';
import { type MarketPageInjected } from '../state.ts';
/** Composed props of the `main` registration: the injected business face plus the locale seat. */
export type MarketPageProps = MarketPageInjected & PropsLocale<typeof NS>;
/** Panel entry: bind the controller and publish the locale seat. */
export declare function MarketPage(props: MarketPageProps): JSX.Element;
