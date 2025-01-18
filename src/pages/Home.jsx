import Header from '../components/Header';
// import Banner from "../components/Banner";
// import Gallery from "../components/Gallery";
// import image from "../assets/images/banner_slogan.webp";
// import Footer from '../components/Footer';
import { useEffect } from 'react';
import TiltedScroll from '../components/TiltedScroll';

function Home() {
    // useEffect(() => {
    //     document.title = 'Kasa : Chez vous, partout et ailleurs'
    // },[]);

    return (
        <div className="App">
            <div className="App-container">
                <Header/>
                <main>
                  <TiltedScroll/>
                </main>
            </div>
            {/* <Footer/> */}
        </div>
    )
  }
  
  export default Home