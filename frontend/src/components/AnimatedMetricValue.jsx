import { useAnimatedCounter } from "../hooks/useAnimatedCounter";

export function AnimatedMetricValue({ value }) {
  // Handle numeric values
  if (typeof value === "number") {
    const animatedValue = useAnimatedCounter(value, 200, true);
    // For integers, display without decimal places
    if (Number.isInteger(value)) {
      return <span>{Math.round(animatedValue)}</span>;
    }
    // For decimals, preserve decimal places from original
    const decimalPlaces = value.toString().split(".")[1]?.length || 0;
    return <span>{animatedValue.toFixed(decimalPlaces)}</span>;
  }

  // Handle string values with number + suffix (e.g., "70%", "2.4h")
  if (typeof value === "string") {
    // Try to extract number from start of string
    const match = value.match(/^([\d.]+)(.*)/);
    if (match) {
      const numericValue = parseFloat(match[1]);
      const suffix = match[2];
      
      // Get animated numeric value
      const animatedValue = useAnimatedCounter(numericValue, 200, true);
      
      // Check if original is integer or decimal
      const isOriginalInteger = Number.isInteger(numericValue);
      
      let displayValue;
      if (isOriginalInteger) {
        displayValue = Math.round(animatedValue);
      } else {
        // Preserve original decimal places
        const decimalPlaces = match[1].split(".")[1]?.length || 1;
        displayValue = animatedValue.toFixed(decimalPlaces);
      }
      
      return <span>{displayValue}{suffix}</span>;
    }
    // If no numeric value found, return as is
    return <span>{value}</span>;
  }

  return <span>{value}</span>;
}
