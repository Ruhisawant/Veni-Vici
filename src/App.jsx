import { useState, useEffect } from 'react'
import { FaTrash } from 'react-icons/fa'
import './App.css'

function App() {
  const [country, setCountry] = useState(null)
  const [droppedItems, setDroppedItems] = useState([])
  const [history, setHistory] = useState([])
  const [availableItems, setAvailableItems] = useState(['capital', 'region', 'language', 'currency'])

  const getNewCountry = async () => {
    const newCountry = await fetchRandomCountry()
    setCountry(newCountry)
    setAvailableItems(['capital', 'region', 'language', 'currency'])

    setHistory((prev) => [
      ...prev,
      {
        name: newCountry.name.common,
        flag: newCountry.flags.png
      }
    ])
  }

  const fetchRandomCountry = async () => {
    try {
      const response = await fetch('https://restcountries.com/v3.1/all')
      if (!response.ok) throw new Error('Failed to fetch countries')

      const data = await response.json()
      return data[Math.floor(Math.random() * data.length)]
    } catch (error) {
      console.error(error)
      return null
    }
  }

  useEffect(() => {
    // Initial state is null, so no country is displayed initially
  }, [])

  const handleDragStart = (e, item) => {
    e.dataTransfer.setData('text/plain', item)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const droppedItem = e.dataTransfer.getData('text/plain')
    
    if (!droppedItems.some((item) => item.type === droppedItem)) {
      const value = {
        capital: country.capital?.[0] ?? 'N/A',
        region: country.region ?? 'N/A',
        language: Object.values(country.languages).join(', ') ?? 'N/A',
        currency: Object.values(country.currencies).map(c => c.name).join(', ') ?? 'N/A'
      }[droppedItem]
  
      setDroppedItems((prev) => [...prev, { type: droppedItem, value, label: droppedItem.charAt(0).toUpperCase() + droppedItem.slice(1) }])
      
      setAvailableItems((prev) => prev.filter(item => item !== droppedItem))
    }
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
                <img src={item.flag} alt={item.name} width={30} />
                <p>{item.name}</p>
              </div>
            ))
          ) : (
            <p>No previous discoveries</p>
          )}
        </div>
        
        <div className='country-info-column'>
        {country ? (
          <div>
            <h2>{country.name.common}</h2>
            <img className='flag' src={country.flags.png} alt={country.name.common} width={200} />
            <br />

            <div className='draggable-buttons'>
              {availableItems.map((item) => {
                const details = {
                  'capital': country.capital?.[0],
                  'region': country.region,
                  'language': Object.values(country.languages ?? {}).join(', '),
                  'currency': Object.values(country.currencies ?? {}).map((currency) => currency.name).join(', ')
                }
                
                return (
                  <button 
                    key={item} 
                    draggable 
                    onDragStart={(e) => handleDragStart(e, item)} 
                    className='drag-button'
                  >
                    {item.charAt(0).toUpperCase() + item.slice(1)}: {details[item]}
                  </button>
                )
              })}
            </div>
          </div>
        ) : (
          <p>No country discovered yet. Click Discover to start!</p>
        )}
          <button onClick={getNewCountry}>Discover</button>
        </div>

        <div className='drop-zone-column' onDragOver={handleDragOver} onDrop={handleDrop}>
          {droppedItems.length > 0 ? (
            droppedItems.map((item, index) => (
              <div key={index} className='drag-button'>
                {item.label}: {item.value}
              </div>
            ))
          ) : (
            <p>Drop Here</p>
          )}

          <FaTrash className='trash-can' />
        </div>
      </div>
    </>
  )
}

export default App
