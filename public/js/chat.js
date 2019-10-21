const socket = io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $messageLocation = document.querySelector('#message-location')
const $messages = document.querySelector('#messages')

//Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search, { ignoreQueryPrefix: true})
$messageForm.addEventListener('submit',(e) =>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')
    const message = e.target.elements.message.value
    //document.querySelector('input').value
    socket.emit('sendMessage', message, (error) => {
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        if(error){
            return alert(error)
        }
        console.log('Message delivered')
    })
})


$messageLocation.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('Geolocation not supported by your browser!')
    }
    $messageLocation.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        const location = {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
        }
        socket.emit('sendLocation',location, () => {
            console.log('Location shared!')
            $messageLocation.removeAttribute('disabled')
        })
    })
})

const autoscroll = () => {
     // New message element
     const $newMessage = $messages.lastElementChild

     // Height of the new message
     const newMessageStyles = getComputedStyle($newMessage)
     const newMessageMargin = parseInt(newMessageStyles.marginBottom)
     const newMessageHeight = $newMessage.offsetHeight + newMessageMargin
 
     // Visible height
     const visibleHeight = $messages.offsetHeight
 
     // Height of messages container
     const containerHeight = $messages.scrollHeight
 
     // How far have I scrolled?
     const scrollOffset = $messages.scrollTop + visibleHeight
 
     if (containerHeight - newMessageHeight <= scrollOffset) {
         $messages.scrollTop = $messages.scrollHeight
     }
}

socket.on('message', (message) => {
  console.log(message)  
  const html = Mustache.render(messageTemplate, {
      username: message.username,
      message: message.text,
      createdAt: moment(message.createdAt).format('h:mm a')
  })
  $messages.insertAdjacentHTML('beforeend', html)
  autoscroll()
})

socket.on('locationMessage', (url) => {
    console.log(url)
    const html = Mustache.render(locationTemplate, {
        username: url.username,
        url: url.link,
        createdAt: moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})
socket.emit('join', {username, room}, (error) => {
    if(error){
        alert(error)
        location.href = '/'
    }
})