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

    const value = {
      capital: country.capital?.[0] ?? 'N/A',
      region: country.region ?? 'N/A',
      language: country.languages ? Object.values(country.languages)[0] : 'N/A',
      currency: country.currencies ? Object.values(country.currencies)[0].name : 'N/A'
    }[droppedItem]

    setDroppedItems((prev) => [...prev, value])
    setAvailableItems((prev) => prev.filter(item => item !== droppedItem))
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
                  'capital': country.capital?.[0] ?? 'N/A',
                  'region': country.region ?? 'N/A',
                  'language': country.languages ? Object.values(country.languages)[0] : 'N/A',
                  'currency': country.currencies ? Object.values(country.currencies)[0].name : 'N/A'
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
          <p>No country discovered yet. Click Discover to start!</p>
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
