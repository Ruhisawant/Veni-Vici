import { useState, useEffect } from 'react'
import { FaTrash } from 'react-icons/fa'
import './App.css'

function App() {
  const [country, setCountry] = useState(null)
  const [droppedItems, setDroppedItems] = useState([])
  const [history, setHistory] = useState([])
  const [availableItems, setAvailableItems] = useState(['capital', 'region', 'language', 'currency'])
  const [error, setError] = useState(null)

  // Fetch a new random country and update state accordingly
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

  // Fetch a random country from the API, filtering out banned items
  const fetchRandomCountry = async () => {
    const response = await fetch('https://restcountries.com/v3.1/all')
    if (!response.ok) throw new Error('Failed to fetch countries')

    const data = await response.json()
    const filteredData = data.filter((country) => {
      const hasValidCountryProperties =
        country.name?.common &&
        country.flags?.png &&
        country.capital &&
        country.region && 
        country.languages && 
        country.currencies
        
      if (!hasValidCountryProperties) return false
    
      return !droppedItems.some((bannedItem) => {
        return (
          country.capital?.[0] === bannedItem ||
          country.region === bannedItem ||
          Object.values(country.languages).includes(bannedItem) ||
          Object.values(country.currencies).some(currency => currency.name === bannedItem)
        )
      })
    })

    if (filteredData.length === 0) {
      throw new Error('No countries left to discover. Remove some items from the ban zone to continue!')
    }
    return filteredData[Math.floor(Math.random() * filteredData.length)]
  }

  // Handle drag start event for draggable items
  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('text/plain', item)
  }

  // Allow drag-over event to enable dropping
  const handleDragOver = (e) => {
    e.preventDefault()
  }

  // Handle drop event and add dropped item to the list
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
      const updated = [...prev, value]
      return updated
    })

    setAvailableItems((prev) => prev.filter(item => item !== droppedItem))
  }

  // Remove an item from the drop zone
  const handleRemoveItem = (value) => {
    setDroppedItems((prev) => prev.filter((item) => item !== value))
  }

  return (
    <>
      <h1>Discover a New Country!</h1>
      <div className='App'>
        {/* History Column */}
        <div className='history-column'>
          <h3>History</h3>
          {history.length > 0 ? (
            history.map((item, index) => (
              <div key={index} className='history-item'>
                <img src={item.flag} alt={item.name} onError={(e) => e.target.style.display = 'none'} />
                <p>{item.name}</p>
              </div>
            ))
          ) : (
            <p>No previous discoveries</p>
          )}
        </div>
        
        {/* Country Info Column */}
        <div className='country-info-column'>          
          {country && country.flags && country.flags.png ? (
            <div>
              <h1>{country.name.common}</h1>
              <img className='flag' src={country.flags.png} alt={country.name.common} onError={(e) => e.target.style.display = 'none'} />
              <div className='info-container'>
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
                      className='info-btn'
                    >
                      {details[item]}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <p>{error || 'Enter a country name or click Discover to reveal details. Drag attributes to the ban list to filter them out.'}</p>
          )}

          <button className='discover-btn' onClick={getNewCountry}>Discover</button>
        </div>

        {/* Ban Column */}
        <div className='ban-column' onDragOver={handleDragOver} onDrop={handleDrop}>
          <h3>Ban List <FaTrash className='trash-can' /></h3>
          {droppedItems.length > 0 ? 
            droppedItems.map((value, index) => (
              <div key={index} className='info-btn' onClick={() => handleRemoveItem(value)}>
                {value}
              </div>
            ))
            : <p>Drag and drop items here to ban!</p>
          }
        </div>
      </div>
    </>
  )
}

export default App