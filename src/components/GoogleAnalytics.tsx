"use client";

interface GoogleAnalyticsProps {
  gaTrackingId: string;
}

export function GoogleAnalytics({ gaTrackingId }: GoogleAnalyticsProps) {
  if (!gaTrackingId) return null;

  return (
    <>
      <script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${gaTrackingId}`}
      />
      <script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for Google Analytics integration
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaTrackingId}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
    </>
  );
}
