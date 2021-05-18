import React, { useState, useEffect, useRef } from 'react'
import { connect } from 'react-redux'
import { addMessage, clearMessages } from '../../../actions/messages'
import socket from '../../../utils/socket'
import Ready from '../GameController/Ready'
import DeathMessage from '../GameController/DeathMessage'

const Discuss = ({ dispatch, messages, username, currentRoom, ticker }) => {
  const isAlive = currentRoom.players.find(player => player.name === username).isAlive


  //Form to hold message state before sent to socket
  const [formData, setFormData] = useState('')
  const messageRef = useRef(null)
  function onReceiveMessage(message) {
    dispatch(addMessage(message))
    messageRef.current.scrollIntoView({ behavior: 'smooth' })
  }

  //Link to serverside using socket.io
  function submitHandler(e) {
    e.preventDefault()
    socket.emit('send-message', { message: formData, username: username }, currentRoom.name)
    setFormData('')
  }

  useEffect(() => {
    dispatch(clearMessages())
    socket.on('receive-message', onReceiveMessage)

    return () => {
      socket.removeEventListener('receive-message', onReceiveMessage)
    }
  }, [])

  return (
    <div className='gameScreen-discuss'>
      <div className='discuss-outer'>
        {isAlive ?
          <>
            <div className='discuss-header'>
              <h2>Time For Discussion!</h2>
              <p>You'll be able to vote on it after the timer.</p>
            </div>
            <Ready />
          </>
          :
          <DeathMessage />
        }

        <p>Time remaining: {ticker} </p>
        <div className='discuss-messageBoard'>
          <ul>
            {messages.map((message, i) => <p key={i}>{message}</p>
            )}
          </ul>
          <div ref={messageRef} />
        </div>

        {/* conditionally rendered chat box */}
        {isAlive &&
          <div className='discuss-message'>
            <form id="message-form" onSubmit={submitHandler}>
              <input
                type="text"
                id="message"
                placeholder='Message'
                value={formData}
                onChange={(e) => setFormData(e.target.value)}
              />
              <button className='discuss-send' type="submit" >Send</button>
            </form>
          </div>
        }

      </div>
    </div>
  )
}

const mapStateToProps = (globalState) => {
  return {
    messages: globalState.messages,
    username: globalState.auth.user.username,
    currentRoom: globalState.currentRoom,
    ticker: globalState.gameState.ticker
  }
}

export default connect(mapStateToProps)(Discuss)
