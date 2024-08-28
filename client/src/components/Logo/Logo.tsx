import LogoImage from "../../assets/logo.png";
import Dots from "../../assets/dots.avif";
import "./Logo.scss";
import { CSSProperties } from "react";

function Logo(props: { style?: CSSProperties }) {
  return (
    <div className="logoOuter" style={{ backgroundImage: `url(${Dots})`, ...props.style }}>
      <div className="logoInner">
        <img className="logoImg" src={LogoImage} alt="logo" />
      </div>
    </div >
  );
}

export default Logo;
