import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { NavigationTabs } from "../components/NavigationTabs";
import {
  AppErrorFallback,
  BootConfigurationError,
} from "../components/AppErrorBoundary";

describe("accessibility contracts", () => {
  it("marks the active tab with aria-current, not aria-selected", () => {
    const markup = renderToStaticMarkup(
      <NavigationTabs activeTab="scriptures" onSelectTab={() => undefined} />,
    );

    expect(markup).not.toContain("aria-selected");
    expect(markup.match(/aria-current="page"/g)).toHaveLength(1);
    expect(markup.match(/type="button"/g)).toHaveLength(4);
  });

  it("announces fatal render errors and offers a recovery action", () => {
    const markup = renderToStaticMarkup(
      <AppErrorFallback onReload={() => undefined} />,
    );

    expect(markup).toContain('role="alert"');
    expect(markup).toContain("Something went wrong");
    expect(markup).toContain("Reload Rebirth");
    expect(markup).toContain("were not changed");
  });

  it("shows an actionable configuration screen instead of a blank page", () => {
    const markup = renderToStaticMarkup(
      <BootConfigurationError detail="Cloud backup is not configured." />,
    );

    expect(markup).toContain('role="alert"');
    expect(markup).toContain("Rebirth is not configured");
    expect(markup).toContain("VITE_CONVEX_URL");
    expect(markup).toContain("No journal data");
  });
});
