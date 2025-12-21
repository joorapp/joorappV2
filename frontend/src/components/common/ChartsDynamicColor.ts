/**
 * Utility function to convert CSS variables or color strings to actual color values
 * Used for ApexCharts color configuration
 */
const getChartColorsArray = (colors: string): string[] => {
  try {
    // Parse JSON string if provided
    const parsed = JSON.parse(colors);
    const colorArray = Array.isArray(parsed) ? parsed : [parsed];
    
    // Convert CSS variables to actual colors
    return colorArray.map((color: string) => {
      if (typeof color !== 'string') {
        return '#564cf3'; // Default primary color
      }
      
      // If it's a CSS variable (starts with --bs-), convert it
      if (color.startsWith('--bs-')) {
        const colorMap: { [key: string]: string } = {
          '--bs-primary': '#564cf3',
          '--bs-secondary': '#74788d',
          '--bs-success': '#34c38f',
          '--bs-danger': '#f46a6a',
          '--bs-warning': '#f1b44c',
          '--bs-info': '#50a5f1',
          '--bs-dark': '#343a40',
          '--bs-light': '#f8f9fa',
        };
        return colorMap[color] || '#564cf3';
      }
      
      // If it's already a hex color or named color, return as is
      return color;
    });
  } catch (error) {
    // If parsing fails, try to handle as single color string
    if (typeof colors === 'string' && colors.startsWith('--bs-')) {
      const colorMap: { [key: string]: string } = {
        '--bs-primary': '#564cf3',
        '--bs-secondary': '#74788d',
        '--bs-success': '#34c38f',
        '--bs-danger': '#f46a6a',
        '--bs-warning': '#f1b44c',
        '--bs-info': '#50a5f1',
        '--bs-dark': '#343a40',
        '--bs-light': '#f8f9fa',
      };
      return [colorMap[colors] || '#564cf3'];
    }
    
    // Default fallback
    return ['#564cf3'];
  }
};

export default getChartColorsArray;

