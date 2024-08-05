import { CSSProperties } from "react";
import LoaderImg from "../../assets/loader.gif";
import "./Loader.scss"

interface LoaderProps {
  style?: CSSProperties;
  label?: string;
}

function Loader(props: LoaderProps) {
  return (
    <div className="flex center" style={props.style}>
      <img src={LoaderImg} className="loaderImg" alt="loader" />
      {props.label && <div>{props.label}</div>}
    </div>
  );
}

export default Loader;
