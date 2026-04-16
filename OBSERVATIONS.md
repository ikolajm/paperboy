# Observations

## General

- Looking at things we could send upstream, could we look to use our text styles more within our components/screens? We may benefit from having a wider catalog of text styles knowing that we could then cut down immensly on individual component overrides -- this also makes it easy to modify items then and have all changes cascade from the variable value changing (body text: sm, md, lg | label: sm, md, lg | etc.)

## /design-system

### Deferred
- **Custom Select/Dropdown molecule:** Native `<select>` dropdown position is browser-controlled. Need a custom `Dropdown`/`Combobox` component with positioned popover for full design system control. Future sprint item.
