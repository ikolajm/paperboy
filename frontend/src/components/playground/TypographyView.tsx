const SAMPLE = 'The quick brown fox jumps over the lazy dog';

function TypographySample({ family, tier, size, lineHeight }: {
  family: string; tier: string; size: string; lineHeight: string;
}) {
  return (
    <div>
      <p className={`text-${family}-${tier}`}>{SAMPLE}</p>
      <p className="text-label-sm text-on-surface-variant mt-1">
        {family}/{tier} — {size} / {lineHeight}
      </p>
    </div>
  );
}

const families = [
  {
    "name": "display",
    "font": "heading",
    "weight": 700,
    "letterSpacing": "-0.02em",
    "tiers": [
      {
        "tier": "sm",
        "size": "24px",
        "lineHeight": "32px"
      },
      {
        "tier": "md",
        "size": "32px",
        "lineHeight": "40px"
      },
      {
        "tier": "lg",
        "size": "40px",
        "lineHeight": "48px"
      }
    ]
  },
  {
    "name": "title",
    "font": "heading",
    "weight": 600,
    "letterSpacing": "-0.01em",
    "tiers": [
      {
        "tier": "sm",
        "size": "16px",
        "lineHeight": "24px"
      },
      {
        "tier": "md",
        "size": "18px",
        "lineHeight": "24px"
      },
      {
        "tier": "lg",
        "size": "24px",
        "lineHeight": "32px"
      }
    ]
  },
  {
    "name": "body",
    "font": "body",
    "weight": 400,
    "letterSpacing": "0",
    "tiers": [
      {
        "tier": "sm",
        "size": "14px",
        "lineHeight": "20px"
      },
      {
        "tier": "md",
        "size": "16px",
        "lineHeight": "24px"
      },
      {
        "tier": "lg",
        "size": "18px",
        "lineHeight": "28px"
      }
    ]
  },
  {
    "name": "action",
    "font": "body",
    "weight": 500,
    "letterSpacing": "0",
    "tiers": [
      {
        "tier": "sm",
        "size": "12px",
        "lineHeight": "16px"
      },
      {
        "tier": "md",
        "size": "14px",
        "lineHeight": "20px"
      },
      {
        "tier": "lg",
        "size": "16px",
        "lineHeight": "24px"
      }
    ]
  },
  {
    "name": "label",
    "font": "body",
    "weight": 500,
    "letterSpacing": "0.02em",
    "tiers": [
      {
        "tier": "sm",
        "size": "10px",
        "lineHeight": "14px"
      },
      {
        "tier": "md",
        "size": "12px",
        "lineHeight": "16px"
      },
      {
        "tier": "lg",
        "size": "14px",
        "lineHeight": "20px"
      }
    ]
  },
  {
    "name": "input",
    "font": "body",
    "weight": 400,
    "letterSpacing": "0",
    "tiers": [
      {
        "tier": "sm",
        "size": "14px",
        "lineHeight": "20px"
      },
      {
        "tier": "md",
        "size": "16px",
        "lineHeight": "24px"
      },
      {
        "tier": "lg",
        "size": "18px",
        "lineHeight": "28px"
      }
    ]
  }
];

export function TypographyView() {
  return (
    <div className="flex flex-col gap-section">
      <div>
        <h2 className="text-display-sm">Typography</h2>
        <p className="text-body-sm text-on-surface-variant mt-1">Text style families across sm / md / lg tiers. Styles are applied via generated CSS classes.</p>
      </div>
      <div className="flex flex-col gap-section">
        {families.map((f) => (
          <div key={f.name} className="flex flex-col gap-group">
            <div>
              <h3 className="text-title-sm capitalize">{f.name}</h3>
              <p className="text-label-sm text-on-surface-variant">
                {f.font} · {f.weight}{f.letterSpacing !== '0' ? ` · ${f.letterSpacing}` : ''}
              </p>
            </div>
            {f.tiers.map((t) => (
              <TypographySample key={t.tier} family={f.name} tier={t.tier} size={t.size} lineHeight={t.lineHeight} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
