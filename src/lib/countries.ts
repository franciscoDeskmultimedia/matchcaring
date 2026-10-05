export interface CountryInfo {
  code: string;
  nameEn: string;
  nameEs: string;
  dialCode: string;
  flag: string;
  placeholder: string;
}

export const COUNTRIES: CountryInfo[] = [
  { code: "US", nameEn: "United States", nameEs: "Estados Unidos", dialCode: "+1", flag: "🇺🇸", placeholder: "(555) 234-5678" },
  { code: "MX", nameEn: "Mexico", nameEs: "México", dialCode: "+52", flag: "🇲🇽", placeholder: "55 1234 5678" },
  { code: "CO", nameEn: "Colombia", nameEs: "Colombia", dialCode: "+57", flag: "🇨🇴", placeholder: "300 123 4567" },
  { code: "ES", nameEn: "Spain", nameEs: "España", dialCode: "+34", flag: "🇪🇸", placeholder: "612 345 678" },
  { code: "AR", nameEn: "Argentina", nameEs: "Argentina", dialCode: "+54", flag: "🇦🇷", placeholder: "9 11 2345 6789" },
  { code: "CL", nameEn: "Chile", nameEs: "Chile", dialCode: "+56", flag: "🇨🇱", placeholder: "9 1234 5678" },
  { code: "PE", nameEn: "Peru", nameEs: "Perú", dialCode: "+51", flag: "🇵🇪", placeholder: "912 345 678" },
  { code: "EC", nameEn: "Ecuador", nameEs: "Ecuador", dialCode: "+593", flag: "🇪🇨", placeholder: "99 123 4567" },
  { code: "GT", nameEn: "Guatemala", nameEs: "Guatemala", dialCode: "+502", flag: "🇬🇹", placeholder: "5123 4567" },
  { code: "CR", nameEn: "Costa Rica", nameEs: "Costa Rica", dialCode: "+506", flag: "🇨🇷", placeholder: "8123 4567" },
  { code: "PA", nameEn: "Panama", nameEs: "Panamá", dialCode: "+507", flag: "🇵🇦", placeholder: "6123 4567" },
  { code: "DO", nameEn: "Dominican Republic", nameEs: "República Dominicana", dialCode: "+1", flag: "🇩🇴", placeholder: "(809) 234-5678" },
  { code: "UY", nameEn: "Uruguay", nameEs: "Uruguay", dialCode: "+598", flag: "🇺🇾", placeholder: "91 234 567" },
  { code: "PY", nameEn: "Paraguay", nameEs: "Paraguay", dialCode: "+595", flag: "🇵🇾", placeholder: "981 123 456" },
  { code: "BO", nameEn: "Bolivia", nameEs: "Bolivia", dialCode: "+591", flag: "🇧🇴", placeholder: "7123 4567" },
  { code: "HN", nameEn: "Honduras", nameEs: "Honduras", dialCode: "+504", flag: "🇭🇳", placeholder: "9123 4567" },
  { code: "SV", nameEn: "El Salvador", nameEs: "El Salvador", dialCode: "+503", flag: "🇸🇻", placeholder: "7123 4567" },
  { code: "NI", nameEn: "Nicaragua", nameEs: "Nicaragua", dialCode: "+505", flag: "🇳🇮", placeholder: "8123 4567" },
  { code: "VE", nameEn: "Venezuela", nameEs: "Venezuela", dialCode: "+58", flag: "🇻🇪", placeholder: "412 123 4567" },
  { code: "BR", nameEn: "Brazil", nameEs: "Brasil", dialCode: "+55", flag: "🇧🇷", placeholder: "(11) 98765-4321" },
  { code: "CA", nameEn: "Canada", nameEs: "Canadá", dialCode: "+1", flag: "🇨🇦", placeholder: "(416) 234-5678" },
  { code: "GB", nameEn: "United Kingdom", nameEs: "Reino Unido", dialCode: "+44", flag: "🇬🇧", placeholder: "7123 456789" },
  { code: "FR", nameEn: "France", nameEs: "Francia", dialCode: "+33", flag: "🇫🇷", placeholder: "6 12 34 56 78" },
  { code: "DE", nameEn: "Germany", nameEs: "Alemania", dialCode: "+49", flag: "🇩🇪", placeholder: "151 12345678" },
  { code: "IT", nameEn: "Italy", nameEs: "Italia", dialCode: "+39", flag: "🇮🇹", placeholder: "312 345 6789" },
  { code: "PT", nameEn: "Portugal", nameEs: "Portugal", dialCode: "+351", flag: "🇵🇹", placeholder: "912 345 678" },
  { code: "OTHER", nameEn: "Other Country", nameEs: "Otro País", dialCode: "+", flag: "🌐", placeholder: "123456789" },
];

export function getCountryByCode(code: string): CountryInfo {
  return COUNTRIES.find((c) => c.code === code) || COUNTRIES[0];
}
