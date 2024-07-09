import { useNavigate } from "react-router";
import reactLogo from "../assets/react.svg";

function Navbar() {
  const navigate = useNavigate();
  const items = [
    { image: reactLogo, text: "Welcome", link: "/" },
    { image: reactLogo, text: "Versus", link: "/versus" },
    { image: reactLogo, text: "GameEnd", link: "/end" },
    { image: reactLogo, text: "Profile", link: "/profile" },
  ];
  return (
    <div className="navbar">
      {items.map((item, i) => (
        <>
          {i !== 0 && <div className="divider" />}
          <div key={i} className="flexCol flex center" onClick={() => navigate(item.link)}>
            <img src={item.image} alt={item.text} style={{ flex: 0, width: "fit-content" }} />
            <div style={{ fontSize: "0.8em", margin: "0.2em" }}>{item.text}</div>
          </div >
        </>
      ))
      }
    </div >
  );
}

export default Navbar;
