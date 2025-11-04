import React, { useState } from 'react';
import { AsyncPaginate } from 'react-select-async-paginate';
import { fetchCities } from '../../api/OpenMeteoService';

const Search = ({ onSearchChange }) => {
  const [searchValue, setSearchValue] = useState(null);

  const loadOptions = async (inputValue) => {
    const citiesList = await fetchCities(inputValue);

    return {
      options: citiesList.data.map((city) => {
        // Create enhanced label with more location information
        let label = city.name;
        
        // Add state/province if available
        if (city.admin1) {
          label += `, ${city.admin1}`;
        }
        
        // Add country (prefer full name over country code)
        if (city.country) {
          label += `, ${city.country}`;
        } else if (city.countryCode) {
          label += `, ${city.countryCode}`;
        }

        return {
          value: `${city.latitude} ${city.longitude}`,
          label: label,
        };
      }),
    };
  };

  const onChangeHandler = (enteredData) => {
    setSearchValue(enteredData);
    onSearchChange(enteredData);
  };

  return (
    <AsyncPaginate
      placeholder="Search for cities"
      debounceTimeout={600}
      value={searchValue}
      onChange={onChangeHandler}
      loadOptions={loadOptions}
    />
  );
};

export default Search;
