import { useRouteError, isRouteErrorResponse, Link} from "react-router-dom";

function RouteError() {

    const error = useRouteError()
    if (isRouteErrorResponse(error)) {

      if (error.status === 404) {
        return <div className="App-pageerror-container"><h2 className="App-pageerror-error">{error.status}</h2><p className="App-pageerror-errortext">Oups! La page que vous demandez n'existe pas.</p><Link to='/' className="App-pageerror-link">Retourner sur la page d'accueil</Link></div>
      }
  
      if (error.status === 401) {
        return <div className="App-pageerror-container"><h2 className="App-pageerror-error">{error.status}</h2><p className="App-pageerror-errortext">Vous n'êtes pas autorisé à voir cette page</p><Link to='/' className="App-pageerror-link">Retourner sur la page d'accueil</Link></div>
      }
  
      if (error.status === 503) {
        return <div className="App-pageerror-container"><h2 className="App-pageerror-error">{error.status}</h2><p className="App-pageerror-errortext">Il semble avoir un problème avec l'API</p><Link to='/' className="App-pageerror-link">Retourner sur la page d'accueil</Link></div>
      }
  
      if (error.status === 418) {
        return <div className="App-pageerror-container"><h2 className="App-pageerror-error">{error.status}</h2><p className="App-pageerror-errortext">🫖</p><Link to='/' className="App-pageerror-link">Retourner sur la page d'accueil</Link></div>
      }
    }
  
    return <div className="App-pageerror-container"><h2 className="App-pageerror-error">Erreur</h2><p className="App-pageerror-errortext">Le logement demandé n'existe pas</p><Link to='/' className="App-pageerror-link">Retourner sur la page d'accueil</Link></div>
  }

  export default RouteError;