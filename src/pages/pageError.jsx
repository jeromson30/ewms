import Header from "../components/Header";
//import Footer from "../components/Footer";
import RouteError from "../modules/routeError";


function PageError() {
    return (
        <div className="App">
            <div className="App-container">
                <Header/>
                <RouteError />
            </div>
            {/* <Footer /> */}
        </div>
    )
  }
  
  export default PageError