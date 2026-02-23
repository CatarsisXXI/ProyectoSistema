import { forwardRef } from 'react';
import Select from 'react-select';

// Lista de países en español (comúnmente usados)
const paises = [
  'Afganistán', 'Albania', 'Alemania', 'Andorra', 'Angola', 'Antigua y Barbuda',
  'Arabia Saudita', 'Argelia', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Azerbaiyán', 'Bahamas', 'Bangladés', 'Barbados', 'Baréin', 'Bélgica',
  'Belice', 'Benín', 'Bielorrusia', 'Birmania', 'Bolivia', 'Bosnia y Herzegovina',
  'Botsuana', 'Brasil', 'Brunéi', 'Bulgaria', 'Burkina Faso', 'Burundi',
  'Bután', 'Cabo Verde', 'Camboya', 'Camerún', 'Canadá', 'Catar', 'Chad',
  'Chile', 'China', 'Chipre', 'Colombia', 'Comoras', 'Congo', 'Corea del Norte',
  'Corea del Sur', 'Costa de Marfil', 'Costa Rica', 'Croacia', 'Cuba',
  'Dinamarca', 'Dominica', 'Ecuador', 'Egipto', 'El Salvador', 'Emiratos Árabes Unidos',
  'Eritrea', 'Eslovaquia', 'Eslovenia', 'España', 'Estados Unidos', 'Estonia',
  'Etiopía', 'Filipinas', 'Finlandia', 'Fiyi', 'Francia', 'Gabón', 'Gambia',
  'Georgia', 'Ghana', 'Granada', 'Grecia', 'Guatemala', 'Guyana', 'Guinea',
  'Guinea-Bisáu', 'Guinea Ecuatorial', 'Haití', 'Honduras', 'Hungría', 'India',
  'Indonesia', 'Irak', 'Irán', 'Irlanda', 'Islandia', 'Islas Marshall',
  'Islas Salomón', 'Israel', 'Italia', 'Jamaica', 'Japón', 'Jordania',
  'Kazajistán', 'Kenia', 'Kirguistán', 'Kiribati', 'Kuwait', 'Laos', 'Lesoto',
  'Letonia', 'Líbano', 'Liberia', 'Libia', 'Liechtenstein', 'Lituania',
  'Luxemburgo', 'Madagascar', 'Malasia', 'Malaui', 'Maldivas', 'Malí', 'Malta',
  'Marruecos', 'Mauricio', 'Mauritania', 'México', 'Micronesia', 'Moldavia',
  'Mónaco', 'Mongolia', 'Montenegro', 'Mozambique', 'Namibia', 'Nauru', 'Nepal',
  'Nicaragua', 'Níger', 'Nigeria', 'Noruega', 'Nueva Zelanda', 'Omán',
  'Países Bajos', 'Pakistán', 'Palaos', 'Palestina', 'Panamá', 'Papúa Nueva Guinea',
  'Paraguay', 'Perú', 'Polonia', 'Portugal', 'Reino Unido', 'República Centroafricana',
  'República Checa', 'República de Macedonia', 'República Dominicana', 'Ruanda',
  'Rumanía', 'Rusia', 'Samoa', 'San Cristóbal y Nieves', 'San Marino',
  'San Vicente y las Granadinas', 'Santa Lucía', 'Santo Tomé y Príncipe',
  'Senegal', 'Serbia', 'Seychelles', 'Sierra Leona', 'Singapur', 'Siria',
  'Somalia', 'Sri Lanka', 'Suazilandia', 'Sudáfrica', 'Sudán', 'Sudán del Sur',
  'Suecia', 'Suiza', 'Surinam', 'Tailandia', 'Taiwán', 'Tanzania', 'Tayikistán',
  'Timor Oriental', 'Togo', 'Tonga', 'Trinidad y Tobago', 'Túnez',
  'Turkmenistán', 'Turquía', 'Tuvalu', 'Ucrania', 'Uganda', 'Uruguay',
  'Uzbekistán', 'Vanuatu', 'Vaticano', 'Venezuela', 'Vietnam', 'Yemen',
  'Yibuti', 'Zambia', 'Zimbabue'
].map(pais => ({ value: pais, label: pais }));

const SelectPais = forwardRef(({ value, onChange, placeholder, className, ...props }, ref) => {
  const selectedOption = paises.find(p => p.value === value) || null;

  return (
    <Select
      ref={ref}
      options={paises}
      value={selectedOption}
      onChange={(option) => onChange(option ? option.value : '')}
      placeholder={placeholder || 'Seleccione o escriba un país...'}
      isClearable
      isSearchable
      className={className}
      classNamePrefix="react-select"
      styles={{
        control: (base) => ({
          ...base,
          borderColor: '#e2e8f0',
          boxShadow: 'none',
          '&:hover': {
            borderColor: '#94a3b8'
          },
          padding: '2px',
          borderRadius: '0.5rem',
        }),
        option: (base, { isFocused, isSelected }) => ({
          ...base,
          backgroundColor: isSelected ? '#2563eb' : isFocused ? '#e6f0ff' : 'white',
          color: isSelected ? 'white' : '#1e293b',
          cursor: 'pointer',
        }),
        menu: (base) => ({
          ...base,
          borderRadius: '0.5rem',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        }),
      }}
      theme={(theme) => ({
        ...theme,
        colors: {
          ...theme.colors,
          primary: '#2563eb',
          primary25: '#e6f0ff',
          primary50: '#bfdbfe',
        },
      })}
      {...props}
    />
  );
});

SelectPais.displayName = 'SelectPais';

export default SelectPais;