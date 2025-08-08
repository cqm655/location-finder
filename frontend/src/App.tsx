import './App.css'
import {Header} from "./components/header/header.tsx";
import {Sidebar} from "./components/sidebar/sidebar.tsx";
import {useStateToggleSideBar} from "./store/useStateToggleSideBar.ts";
import {Outlet} from "react-router";

function App() {
    const {isOpen} = useStateToggleSideBar();
    const sidebarWidth = isOpen ? 300 : 10;

    return (
        <div style={{
            padding: 0,
            margin: 0,
            width: '100%',
            height: '100vh',
            backgroundColor: 'antiquewhite',
            display: 'flex',
            flexDirection: 'column'
        }}>

            <Header/>

            <div style={{display: 'flex', flex: 1}}>

                <div
                    style={{
                        width: `${sidebarWidth}px`,
                        backgroundColor: '#cfcdca',
                        height: '100%',
                        transition: 'width 0.6s ease'
                    }}
                >
                    <Sidebar/>
                </div>

                <div
                    style={{
                        flex: 1,
                        backgroundColor: 'blue',
                        height: '100%'
                    }}
                >
                    {/* Aici pui conținutul principal */}
                    <Outlet/>
                </div>
            </div>
        </div>
    );
}

export default App;
