import Footer from '../components/Footer';

function Login() {
return (
        <div className="App">
            <div className="App-container">
                <main className='App-login'>
                  <form>
                    <p>Connexion à l'espace client</p>
                    <label htmlFor='login'>Identifiant : </label>
                    <input type='text' placeholder='Identifiant' id='login'/>
                    <br/>
                    <label htmlFor='login'>Mot de passe : </label>
                    <input type='password' placeholder='Identifiant' id='password'/>
                    <a href='/'>Retour</a>
                  </form>

                </main>
                <Footer/>
            </div>
        </div>
)}

export default Login