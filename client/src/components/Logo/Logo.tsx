import LogoImage from "../../assets/logo.png";
import Dots from "../../assets/dots.avif";
import "./Logo.scss";

function Logo() {
  return (
    <div className="logoOuter" style={{ backgroundImage: `url(${Dots})` }}>
      <div className="logoInner">
        <img className="logoImg" src={LogoImage} className="logoImg" alt="logo" />
      </div>
    </div >
  );
}

export default Logo;
