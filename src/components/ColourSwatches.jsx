import { colourSwatches } from '../lib/catalog';

export default function ColourSwatches({ colours, className }) {
  const swatches = colourSwatches(colours);
  if (!swatches.length) return null;

  return (
    <div className={'colour-swatches' + (className ? ' ' + className : '')} aria-label="Available colours">
      {swatches.map((swatch) => (
        <span
          key={swatch.name}
          className="colour-swatch"
          style={{ backgroundColor: swatch.hex }}
          title={swatch.name}
        />
      ))}
    </div>
  );
}
