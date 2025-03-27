import { useState, useEffect } from 'react'
import { FaTrash } from 'react-icons/fa'
import './App.css'

function App() {
  const [country, setCountry] = useState(null)
  const [droppedItems, setDroppedItems] = useState([])
  const [history, setHistory] = useState([])
  const [availableItems, setAvailableItems] = useState(['capital', 'region', 'language', 'currency'])
  const [error, setError] = useState(null)

  const getNewCountry = async () => {
    try {
      const newCountry = await fetchRandomCountry()
      
      if (newCountry && newCountry.name && newCountry.flags) {
        setCountry(newCountry)
        setAvailableItems(['capital', 'region', 'language', 'currency'])

        setHistory((prev) => [
          ...prev,
          {
            name: newCountry.name.common || 'Unknown Country',
            flag: newCountry.flags.png || ''
          }
        ])
        setError(null)
      }
    } catch (err) {
      setCountry(null)
      setError(err.message)
    }
  }

  const fetchRandomCountry = async () => {
    const response = await fetch('https://restcountries.com/v3.1/all');
    if (!response.ok) throw new Error('Failed to fetch countries');

    const data = await response.json();
    const filteredData = data.filter((country) => {
      const hasValidCountryProperties =
        country.name?.common &&
        country.flags?.png &&
        country.capital &&
        country.region && 
        country.languages && 
        country.currencies;
        
      if (!hasValidCountryProperties) return false;
    
      return !droppedItems.some((bannedItem) => {
        return (
          country.capital?.[0] === bannedItem ||
          country.region === bannedItem ||
          Object.values(country.languages).includes(bannedItem) ||
          Object.values(country.currencies).some(currency => currency.name === bannedItem)
        );
      });
    });

    if (filteredData.length === 0) {
      throw new Error(`No countries left to discover. Remove some items from the ban zone to continue!`)
    }

    return filteredData[Math.floor(Math.random() * filteredData.length)];
  };

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('text/plain', item)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const droppedItem = e.dataTransfer.getData('text/plain')
  
    const value = {
      capital: country?.capital?.[0] ?? 'N/A',
      region: country?.region ?? 'N/A',
      language: country?.languages ? Object.values(country.languages)[0] : 'N/A',
      currency: country?.currencies ? Object.values(country.currencies)[0].name : 'N/A'
    }[droppedItem]
    
    setDroppedItems((prev) => {
      const updated = [...prev, value];
      return updated;
    });
  
    setAvailableItems((prev) => prev.filter(item => item !== droppedItem));
  }

  const handleRemoveItem = (value) => {
    setDroppedItems((prev) => prev.filter((item) => item !== value))
  }

  return (
    <>
      <h1>Discover a New Country!</h1>
      <div className='App'>
        <div className='history-column'>
          <h3>History</h3>
          {history.length > 0 ? (
            history.map((item, index) => (
              <div key={index} className='history-item'>
                <img 
                  src={item.flag} 
                  alt={item.name} 
                  width={30} 
                  onError={(e) => e.target.style.display = 'none'}
                />
                <p>{item.name}</p>
              </div>
            ))
          ) : (
            <p>No previous discoveries</p>
          )}
        </div>
        
        <div className='country-info-column'>          
          {country && country.flags && country.flags.png ? (
            <div>
              <h2>{country.name.common}</h2>
              <img 
                className='flag' 
                src={country.flags.png} 
                alt={country.name.common} 
                width={200}
                onError={(e) => e.target.style.display = 'none'}
              />
              <div className='draggable-buttons'>
                {availableItems.map((item) => {
                  const details = {
                    'capital': country?.capital?.[0] ?? 'N/A',
                    'region': country?.region ?? 'N/A',
                    'language': country?.languages ? Object.values(country.languages)[0] : 'N/A',
                    'currency': country?.currencies ? Object.values(country.currencies)[0].name : 'N/A'
                  }

                  return (
                    <button 
                      key={item} 
                      draggable 
                      onDragStart={(e) => handleDragStart(e, item)} 
                      className='drag-button'
                    >
                      {details[item]}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <p>{error || 'No country discovered yet. Click Discover to start!'}</p>
          )}

          <button onClick={getNewCountry}>Discover</button>
        </div>

        <div className='drop-zone-column' onDragOver={handleDragOver} onDrop={handleDrop}>
          <h3>Drop Here<FaTrash className='trash-can' /></h3>
          {droppedItems.length > 0 ? 
            droppedItems.map((value, index) => (
              <div key={index} className='drag-button' onClick={() => handleRemoveItem(value)}>
                {value}
              </div>
            ))
            : <p>Drag and drop items here</p>
          }
        </div>
      </div>
    </>
  )
}

export default App