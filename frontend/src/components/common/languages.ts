import usFlag from '../../assets/images/flags/us.jpg';
import germanyFlag from '../../assets/images/flags/germany.jpg';
// TODO: Add Arabic flag image (saudi-arabia.jpg or arabic.jpg) to assets/images/flags/ directory
// Then import it: import arabicFlag from '../../assets/images/flags/saudi-arabia.jpg';
// For now using a placeholder URL - replace with local import when flag image is added
const arabicFlag = 'https://flagcdn.com/w40/sa.png'; // Placeholder: Saudi Arabia flag

const languages: Record<string, { label: string; flag: string }> = {
  en: { label: 'English', flag: usFlag },
  de: { label: 'German', flag: germanyFlag },
  ar: { label: 'العربية', flag: arabicFlag }
};

export default languages;

