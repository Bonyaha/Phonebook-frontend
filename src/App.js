import { useEffect, useState } from 'react'
import Notification from './Notification'
import ErrorNotification from './ErrorNotification'
import Search from './Search'
import PersonForm from './PersonForm'
import Persons from './Persons'
import contactService from './services/contacts'

const App = () => {
  const [persons, setPersons] = useState([])
  const [name, setName] = useState('')
  const [number, setNumber] = useState('')
  const [notification, setNotification] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [confirmationMessage, setConfirmationMessage] = useState('')
  const [confirmationCallback, setConfirmationCallback] = useState(null)

  useEffect(() => {
    contactService.getAll().then((res) => {
      setPersons(res)
    })
  }, [])
  console.log(persons)
  // Filter the persons array based on the search query
  const filteredPersons = persons.filter((person) => {
    console.log(`I'm in filteredPersons function`)
    console.log('person', person)
    if (person && person.name) {
      return person.name.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return false
  })

  const addPerson = (e) => {
    e.preventDefault()
    let id = checkingExistense(e)
    if (id) {
      updatingNum(id)
    } else {
      const newPerson = { name: name, number: number }
      contactService
        .create(newPerson)
        .then((response) => {
          setPersons(persons.concat(response))
          setName('')
          setNumber('')
          setNotification(`Added ${name}`)
          setTimeout(() => {
            setNotification(null)
          }, 5000)
        })
        .catch((error) => {
          setErrorMessage(`${error.response.data.error}`)
          setTimeout(() => {
            setErrorMessage(null)
          }, 5000)
        })
    }
  }

  const updatingNum = (id) => {
    setShowConfirmation(true)
    setConfirmationMessage(
      `${name} is already added to phonebook, replace the old number with the new one?`
    )
    setConfirmationCallback(() => () => {
      const personToUpdate = persons.find((person) => person.id === id)
      if (personToUpdate) {
      }
      const newPerson = { name: name, number: number }
      contactService.update(id, newPerson).then((returnedNote) => {
        if (returnedNote === null) {
          setShowConfirmation(false)
          setPersons(
            persons.map((person) => (person.id !== id ? person : returnedNote))
          )
          setErrorMessage(
            `The information of ${name} has already been removed, please refresh the page`
          )
          setTimeout(() => {
            setErrorMessage(null)
          }, 5000)
          setName('')
          setNumber('')
        } else {
          setPersons(
            persons.map((person) => (person.id !== id ? person : returnedNote))
          )
          setShowConfirmation(false)
          setName('')
          setNumber('')
          setNotification(`The old number of ${name} is replaced `)
          setTimeout(() => {
            setNotification(null)
          }, 5000)
        }
      })

      //if that person had already been removed
      /*  .catch((error) => {
          console.log(error)
          setShowConfirmation(false)
          setErrorMessage(
            `The information of ${name} has already been removed, please refresh the page `
          )
          setName('')
          setNumber('')
          setTimeout(() => {
            setErrorMessage(null)
          }, 5000)
        }) */
    })
  }
  //Check if person already exist in our book(it's not the same as checking function - the difference is target (button and input))
  const checkingExistense = (e) => {
    e.preventDefault()
    console.log('e.target', e.target)
    let query = e.target.querySelector('#name').value
    //console.log(query)
    const target = persons.find((person) => person.name === query)

    if (target) return target.id
  }

  const handleNameChange = (e) => {
    //console.log(e.target.value);
    setName(e.target.value)

    //checking(e.target.value)
  }

  const handleNumberChange = (e) => {
    setNumber(e.target.value)
  }

  //Check if person already exist in our book
  /*  const checking = (value) => {
    return persons.forEach((person) => {
      if (person.name === value) alert(`${value} is already added to phonebook`)
    })
  } */
  //search for person
  const filterPersons = (e) => {
    const query = e.target.value
    setSearchQuery(query)
  }

  const deleteNum = (id, name) => {
    setShowConfirmation(true)
    setConfirmationMessage(`Delete person ${name}?`)
    setConfirmationCallback(() => () => {
      contactService
        .del(id)
        .then(() => {
          setPersons(persons.filter((person) => person.id !== id))
          setShowConfirmation(false)
          setNotification(`Person ${name} deleted.`)
          setTimeout(() => {
            setNotification(null)
          }, 5000)
        })
        .catch((error) => {
          setErrorMessage(`Error deleting the contact: ${error.message}`)
          setTimeout(() => {
            setErrorMessage(null)
          }, 5000)
        })
    })
    const confirmationDiv = document.getElementById('confirmationDiv')
    confirmationDiv.scrollIntoView({ behavior: 'smooth' })
  }

  const handleConfirmation = () => {
    if (confirmationCallback) {
      confirmationCallback()
      setConfirmationCallback(null)
    }
  }
  const closeConfirmation = () => {
    setShowConfirmation(false)
    setConfirmationCallback(null)
  }
  console.log('showConfirmation', showConfirmation)
  console.log('confirmationCallback', confirmationCallback)
  return (
    <div className='container mt-3 w-50 '>
      <div id='confirmationDiv'>
        {showConfirmation && (
          <div className='confirmation'>
            <p className='confirmation-message'>{confirmationMessage}</p>
            <button
              className='confirmation-button'
              onClick={handleConfirmation}
            >
              Confirm
            </button>
            <button className='close-button' onClick={closeConfirmation}>
              Cancel
            </button>
          </div>
        )}
      </div>
      <Notification message={notification} />
      <ErrorNotification message={errorMessage} />
      <h2 className='h1'>Phonebook</h2>
      <Search onChange={filterPersons} />

      <br />
      <br />
      <h3>Add a new person</h3>
      <PersonForm
        addPerson={addPerson}
        name={name}
        number={number}
        handleNameChange={handleNameChange}
        handleNumberChange={handleNumberChange}
      />
      <h2>Numbers</h2>
      <Persons filtered={filteredPersons} deleteNum={deleteNum} />
    </div>
  )
}

export default App
