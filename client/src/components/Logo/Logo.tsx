import LogoImage from "../../assets/logo.png";
import "./Logo.scss";

function Logo() {
  return (
    <div className="logo">
      <img src={LogoImage} className="logoImg" alt="logo" />
    </div>
  );
}

export default Logo;
