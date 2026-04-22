function ColorSwatch({ token }: { token: string }) {
  return (
    <div className="flex flex-col gap-component-compact">
      <div className="h-12 rounded-component border border-outline-subtle" style={{ backgroundColor: `var(--${token})` }} />
      <span className="text-label-sm text-on-surface-variant">{token}</span>
    </div>
  );
}

function PaletteSwatch({ shade, hex, light }: { shade: string; hex: string; light: boolean }) {
  return (
    <div
      className={`flex flex-col items-center justify-end h-12 rounded-component px-1 pb-1 ${light ? 'text-neutral-900' : 'text-white'}`}
      style={{ backgroundColor: hex }}
    >
      <span className="text-label-sm">{shade}</span>
    </div>
  );
}

const roleGroups = [
  {
    "group": "primary",
    "roles": [
      "primary",
      "on-primary",
      "primary-container",
      "on-primary-container",
      "primary-fixed",
      "primary-fixed-dim",
      "on-primary-fixed",
      "on-primary-fixed-variant"
    ]
  },
  {
    "group": "secondary",
    "roles": [
      "secondary",
      "on-secondary",
      "secondary-container",
      "on-secondary-container",
      "secondary-fixed",
      "secondary-fixed-dim",
      "on-secondary-fixed",
      "on-secondary-fixed-variant"
    ]
  },
  {
    "group": "neutral",
    "roles": [
      "neutral",
      "on-neutral",
      "neutral-container",
      "on-neutral-container"
    ]
  },
  {
    "group": "surface",
    "roles": [
      "surface",
      "surface-1",
      "surface-2",
      "surface-3",
      "on-surface",
      "on-surface-variant",
      "surface-inverse",
      "on-surface-inverse",
      "inverse-primary",
      "scrim"
    ]
  },
  {
    "group": "outline",
    "roles": [
      "outline",
      "outline-subtle"
    ]
  },
  {
    "group": "error",
    "roles": [
      "error",
      "on-error",
      "error-container",
      "on-error-container"
    ]
  },
  {
    "group": "success",
    "roles": [
      "success",
      "on-success",
      "success-container",
      "on-success-container"
    ]
  },
  {
    "group": "warning",
    "roles": [
      "warning",
      "on-warning",
      "warning-container",
      "on-warning-container"
    ]
  },
  {
    "group": "info",
    "roles": [
      "info",
      "on-info",
      "info-container",
      "on-info-container"
    ]
  },
  {
    "group": "common",
    "roles": [
      "on-color"
    ]
  }
];

const palette = [
  {
    "family": "primary",
    "shades": [
      {
        "shade": "50",
        "hex": "#eef4f6",
        "light": true
      },
      {
        "shade": "100",
        "hex": "#dde8ee",
        "light": true
      },
      {
        "shade": "200",
        "hex": "#b5d4e3",
        "light": true
      },
      {
        "shade": "300",
        "hex": "#6dbadf",
        "light": true
      },
      {
        "shade": "400",
        "hex": "#2e9dd1",
        "light": true
      },
      {
        "shade": "500",
        "hex": "#2784af",
        "light": false
      },
      {
        "shade": "600",
        "hex": "#206e92",
        "light": false
      },
      {
        "shade": "700",
        "hex": "#1a5875",
        "light": false
      },
      {
        "shade": "800",
        "hex": "#14455c",
        "light": false
      },
      {
        "shade": "900",
        "hex": "#132d3a",
        "light": false
      }
    ]
  },
  {
    "family": "secondary",
    "shades": [
      {
        "shade": "50",
        "hex": "#f6f1ef",
        "light": true
      },
      {
        "shade": "100",
        "hex": "#ece3df",
        "light": true
      },
      {
        "shade": "200",
        "hex": "#dfc5b9",
        "light": true
      },
      {
        "shade": "300",
        "hex": "#d69476",
        "light": true
      },
      {
        "shade": "400",
        "hex": "#c4663b",
        "light": true
      },
      {
        "shade": "500",
        "hex": "#a55532",
        "light": false
      },
      {
        "shade": "600",
        "hex": "#894729",
        "light": false
      },
      {
        "shade": "700",
        "hex": "#6e3921",
        "light": false
      },
      {
        "shade": "800",
        "hex": "#562d1a",
        "light": false
      },
      {
        "shade": "900",
        "hex": "#372016",
        "light": false
      }
    ]
  },
  {
    "family": "accent",
    "shades": [
      {
        "shade": "50",
        "hex": "#f6eff4",
        "light": true
      },
      {
        "shade": "100",
        "hex": "#eddee8",
        "light": true
      },
      {
        "shade": "200",
        "hex": "#e1b7d3",
        "light": true
      },
      {
        "shade": "300",
        "hex": "#d972b8",
        "light": true
      },
      {
        "shade": "400",
        "hex": "#c93699",
        "light": true
      },
      {
        "shade": "500",
        "hex": "#a92d81",
        "light": false
      },
      {
        "shade": "600",
        "hex": "#8d266b",
        "light": false
      },
      {
        "shade": "700",
        "hex": "#711e56",
        "light": false
      },
      {
        "shade": "800",
        "hex": "#591843",
        "light": false
      },
      {
        "shade": "900",
        "hex": "#38152c",
        "light": false
      }
    ]
  },
  {
    "family": "neutral",
    "shades": [
      {
        "shade": "5",
        "hex": "#0c0d0e",
        "light": false
      },
      {
        "shade": "10",
        "hex": "#181a1b",
        "light": false
      },
      {
        "shade": "15",
        "hex": "#242729",
        "light": false
      },
      {
        "shade": "20",
        "hex": "#2f3437",
        "light": false
      },
      {
        "shade": "25",
        "hex": "#3b4144",
        "light": false
      },
      {
        "shade": "30",
        "hex": "#474e52",
        "light": false
      },
      {
        "shade": "40",
        "hex": "#5f696d",
        "light": true
      },
      {
        "shade": "50",
        "hex": "#778388",
        "light": true
      },
      {
        "shade": "60",
        "hex": "#929ca0",
        "light": true
      },
      {
        "shade": "70",
        "hex": "#adb4b8",
        "light": true
      },
      {
        "shade": "80",
        "hex": "#c8cdd0",
        "light": true
      },
      {
        "shade": "85",
        "hex": "#d6dadb",
        "light": true
      },
      {
        "shade": "90",
        "hex": "#e4e6e7",
        "light": true
      },
      {
        "shade": "95",
        "hex": "#f1f3f3",
        "light": true
      }
    ]
  },
  {
    "family": "error",
    "shades": [
      {
        "shade": "50",
        "hex": "#f7eded",
        "light": true
      },
      {
        "shade": "100",
        "hex": "#efdcdc",
        "light": true
      },
      {
        "shade": "200",
        "hex": "#e7b1b1",
        "light": true
      },
      {
        "shade": "300",
        "hex": "#e86363",
        "light": true
      },
      {
        "shade": "400",
        "hex": "#df2020",
        "light": true
      },
      {
        "shade": "500",
        "hex": "#bb1b1b",
        "light": false
      },
      {
        "shade": "600",
        "hex": "#9c1717",
        "light": false
      },
      {
        "shade": "700",
        "hex": "#7d1212",
        "light": false
      },
      {
        "shade": "800",
        "hex": "#620e0e",
        "light": false
      },
      {
        "shade": "900",
        "hex": "#3d0f0f",
        "light": false
      }
    ]
  },
  {
    "family": "success",
    "shades": [
      {
        "shade": "50",
        "hex": "#edf7f1",
        "light": true
      },
      {
        "shade": "100",
        "hex": "#dcefe4",
        "light": true
      },
      {
        "shade": "200",
        "hex": "#b1e7c8",
        "light": true
      },
      {
        "shade": "300",
        "hex": "#63e89b",
        "light": true
      },
      {
        "shade": "400",
        "hex": "#20df70",
        "light": true
      },
      {
        "shade": "500",
        "hex": "#1bbb5e",
        "light": false
      },
      {
        "shade": "600",
        "hex": "#179c4e",
        "light": false
      },
      {
        "shade": "700",
        "hex": "#127d3f",
        "light": false
      },
      {
        "shade": "800",
        "hex": "#0e6231",
        "light": false
      },
      {
        "shade": "900",
        "hex": "#0f3d23",
        "light": false
      }
    ]
  },
  {
    "family": "warning",
    "shades": [
      {
        "shade": "50",
        "hex": "#f7f4ed",
        "light": true
      },
      {
        "shade": "100",
        "hex": "#efe9dc",
        "light": true
      },
      {
        "shade": "200",
        "hex": "#e7d5b1",
        "light": true
      },
      {
        "shade": "300",
        "hex": "#e8bc63",
        "light": true
      },
      {
        "shade": "400",
        "hex": "#dfa020",
        "light": true
      },
      {
        "shade": "500",
        "hex": "#bb861b",
        "light": false
      },
      {
        "shade": "600",
        "hex": "#9c7017",
        "light": false
      },
      {
        "shade": "700",
        "hex": "#7d5912",
        "light": false
      },
      {
        "shade": "800",
        "hex": "#62460e",
        "light": false
      },
      {
        "shade": "900",
        "hex": "#3d2e0f",
        "light": false
      }
    ]
  },
  {
    "family": "info",
    "shades": [
      {
        "shade": "50",
        "hex": "#edf2f7",
        "light": true
      },
      {
        "shade": "100",
        "hex": "#dce6ef",
        "light": true
      },
      {
        "shade": "200",
        "hex": "#b1cce7",
        "light": true
      },
      {
        "shade": "300",
        "hex": "#63a6e8",
        "light": true
      },
      {
        "shade": "400",
        "hex": "#207fdf",
        "light": true
      },
      {
        "shade": "500",
        "hex": "#1b6bbb",
        "light": false
      },
      {
        "shade": "600",
        "hex": "#17599c",
        "light": false
      },
      {
        "shade": "700",
        "hex": "#12477d",
        "light": false
      },
      {
        "shade": "800",
        "hex": "#0e3862",
        "light": false
      },
      {
        "shade": "900",
        "hex": "#0f263d",
        "light": false
      }
    ]
  }
];

export function ColorsView() {
  return (
    <div className="flex flex-col gap-section">
      <div>
        <h2 className="text-display-sm">Colors</h2>
        <p className="text-body-sm text-on-surface-variant mt-1">Semantic color roles for the current theme. Toggle the theme to see alternate values.</p>
      </div>

      <div className="flex flex-col gap-section">
        <div>
          <h3 className="text-title-md mb-3">Semantic Roles</h3>
          <div className="flex flex-col gap-group">
            {roleGroups.map((g) => (
              <div key={g.group} className="flex flex-col gap-group">
                <h3 className="text-title-sm capitalize">{g.group}</h3>
                <div className="grid grid-cols-4 gap-component">
                  {g.roles.map((r) => <ColorSwatch key={r} token={r} />)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-title-md mb-3">Base Palette</h3>
          <div className="flex flex-col gap-group">
            {palette.map((p) => (
              <div key={p.family} className="flex flex-col gap-component-compact">
                <h3 className="text-label-md capitalize text-on-surface-variant">{p.family}</h3>
                <div className="grid grid-cols-5 gap-1 sm:grid-cols-10">
                  {p.shades.map((s) => <PaletteSwatch key={s.shade} shade={s.shade} hex={s.hex} light={s.light} />)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
