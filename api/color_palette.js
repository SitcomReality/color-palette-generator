import chroma from 'chroma-js';
import { config } from '../config.js';

export async function get(req) {
  const url = new URL(req.url);
  const baseColor = url.searchParams.get('color') || '4287f5';
  const harmonyType = url.searchParams.get('type') || 'complementary';
  
  // Clean the color value (remove # if present)
  const cleanColor = baseColor.replace('#', '');
  
  try {
    // Validate the color
    const color = chroma('#' + cleanColor);
    
    // Generate the color palette based on the harmony type
    const palette = generateColorPalette(color, harmonyType);
    
    return {
      body: JSON.stringify(palette),
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    };
  } catch (error) {
    return {
      body: JSON.stringify({ error: 'Invalid color format' }),
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    };
  }
}

function generateColorPalette(baseColor, harmonyType) {
  const hsl = baseColor.hsl();
  const h = hsl[0] || 0; // Hue (0-360)
  const s = hsl[1]; // Saturation (0-1)
  const l = hsl[2]; // Lightness (0-1)
  
  let colors = [];
  
  switch (harmonyType) {
    case 'complementary':
      colors = [
        baseColor,
        chroma.hsl((h + 180) % 360, s, l)
      ];
      break;
      
    case 'analogous':
      colors = [
        chroma.hsl((h - 30 + 360) % 360, s, l),
        baseColor,
        chroma.hsl((h + 30) % 360, s, l)
      ];
      break;
      
    case 'triadic':
      colors = [
        baseColor,
        chroma.hsl((h + 120) % 360, s, l),
        chroma.hsl((h + 240) % 360, s, l)
      ];
      break;
      
    case 'tetradic':
      colors = [
        baseColor,
        chroma.hsl((h + 90) % 360, s, l),
        chroma.hsl((h + 180) % 360, s, l),
        chroma.hsl((h + 270) % 360, s, l)
      ];
      break;
      
    case 'monochromatic':
      const lightnessValues = [l, Math.min(l + 0.2, 0.9), Math.max(l - 0.2, 0.1), Math.min(l + 0.4, 0.95)];
      colors = lightnessValues.map(lValue => chroma.hsl(h, s, lValue));
      break;
      
    case 'splitComplementary':
      colors = [
        baseColor,
        chroma.hsl((h + 150) % 360, s, l),
        chroma.hsl((h + 210) % 360, s, l)
      ];
      break;
      
    default:
      colors = [baseColor];
  }
  
  // Format the result
  return colors.map(color => {
    const hex = color.hex();
    return {
      hex,
      rgb: color.rgb(),
      hsl: color.hsl().map((val, i) => i === 0 ? Math.round(val) : Math.round(val * 100) / 100),
      name: getColorName(color)
    };
  });
}

// Simple function to determine a rough color name
function getColorName(color) {
  const hsl = color.hsl();
  const h = hsl[0] || 0;
  const s = hsl[1];
  const l = hsl[2];
  
  if (l < 0.12) return 'Black';
  if (l > 0.98) return 'White';
  if (s < 0.1) {
    if (l < 0.3) return 'Dark Gray';
    if (l < 0.6) return 'Gray';
    return 'Light Gray';
  }
  
  let name;
  
  if (h >= 0 && h < 15 || h >= 345 && h < 360) name = 'Red';
  else if (h >= 15 && h < 45) name = 'Orange';
  else if (h >= 45 && h < 75) name = 'Yellow';
  else if (h >= 75 && h < 105) name = 'Lime';
  else if (h >= 105 && h < 135) name = 'Green';
  else if (h >= 135 && h < 165) name = 'Teal';
  else if (h >= 165 && h < 195) name = 'Cyan';
  else if (h >= 195 && h < 225) name = 'Light Blue';
  else if (h >= 225 && h < 255) name = 'Blue';
  else if (h >= 255 && h < 285) name = 'Purple';
  else if (h >= 285 && h < 315) name = 'Magenta';
  else if (h >= 315 && h < 345) name = 'Pink';
  
  if (l < 0.3) name = 'Dark ' + name;
  else if (l > 0.7) name = 'Light ' + name;
  
  return name;
}

