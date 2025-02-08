export async function getBinInfo(bin) {
  try {
    return {
      brand: 'Unknown',
      type: 'Unknown',
      level: 'Unknown',
      bank: 'Unknown',
      country: 'Unknown'
    };
  } catch (error) {
    console.error('Error getting BIN info:', error);
    return null;
  }
} 
