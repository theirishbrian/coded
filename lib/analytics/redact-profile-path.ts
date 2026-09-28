type AnalyticsEvent = {
  url: string;
};

const PROFILE_PATH = /^\/u\/[^/]+\/?$/;

/**
 * Group profile pageviews without sending a public GitHub username to Vercel.
 * Query strings and fragments are also removed from profile URLs because they
 * are not needed for the aggregate route-level signal.
 */
export function redactProfilePath<T extends AnalyticsEvent>(event: T): T {
  try {
    const url = new URL(event.url);

    if (!PROFILE_PATH.test(url.pathname)) {
      return event;
    }

    return {
      ...event,
      url: `${url.origin}/u/[username]`,
    };
  } catch {
    // Vercel supplies absolute URLs. Preserve an unexpected value rather than
    // risking a client-side analytics failure.
    return event;
  }
}
