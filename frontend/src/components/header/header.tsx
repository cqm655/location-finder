import {CasefolderidInput} from "./casefolderid-input.tsx";
import {MapLink} from "./map-link.tsx";
import {ToogleSideBar} from "./toggle-sidebar.tsx";
import {Logo} from "./logo.tsx";

export const Header = () => {


    return (
        <div style={{
            width: "100%",
            display: "flex",
            justifyContent: "space-between",
            height: "70px",
            backgroundColor: "#fff",
            alignItems: "center"
        }}><Logo/>
            <ToogleSideBar/>
            <MapLink/>
            <CasefolderidInput/>
        </div>
    )
}