import { CSSProperties } from "react";
import LoaderImg from "../../assets/loader.gif";
import "./Loader.scss"

interface LoaderProps {
  style?: CSSProperties;
  label?: string;
}

function Loader(props: LoaderProps) {
  return (
    <div className="flexRow center" style={props.style}>
      <img src={LoaderImg} className="loaderImg" alt="loader" />
      {props.label && <b>{props.label}</b>}
    </div>
  );
}

export default Loader;
