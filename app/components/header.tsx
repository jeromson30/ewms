import Link from "next/link"
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@radix-ui/react-navigation-menu"

const Header = async () => {
    return (
      <header>
        <p className="logo">eSWMS <br/>Simple Warehouse Management System</p>
        <NavigationMenu className="menunav">
          <NavigationMenuList className="menu">
              <NavigationMenuItem>
                <Link href="/">Accueil</Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/">Tarifs</Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/">Contact</Link>
              </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
        <Link href="/signin"><button className="btn_conn">Connexion</button></Link>
      </header>
    );
  };
  
  export default Header;