import { useEffect } from "react"
import { useLocation } from "react-router-dom"

function Navigation(){
  const location = useLocation()

  useEffect(() =>{

  if(document.querySelector('.App-link-home').classList.contains('App-link-active')){ document.querySelector('.App-link-home').classList.remove('App-link-active') }
  if(document.querySelector('.App-link-about').classList.contains('App-link-active')){ document.querySelector('.App-link-home').classList.remove('App-link-active') }
  if(location.pathname === '/'){document.querySelector('.App-link-home').classList.add('App-link-active')}
  else if(location.pathname === '/A-propos'){document.querySelector('.App-link-about').classList.add('App-link-active')}

  },[location])
  


  return (
    <nav aria-label='Primary navigation' className="App-navigation">
      <ul>
        <li><a href="/" className="App-link-home">Accueil</a></li>
        <li><a href="/" className="App-link-home">Fonctionnalites</a></li>
        <li><a href="/" className="App-link-home">Tarifs</a></li>
        <li><a href="/A-propos" className="App-link-about">A propos</a></li>
        <li><a href="/login" className="App-connexion">Espace client</a></li>
      </ul>
    </nav>
  )
}

export default Navigation