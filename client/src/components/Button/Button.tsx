import { CSSProperties } from "react";
import { Children } from "../../utils/types";
import "./Button.scss";

interface ButtonProps {
  children: Children;
  type?: "big" | "normal";
  style?: CSSProperties;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  colorfulBorder?: boolean;
}

function Button(props: ButtonProps) {
  let baseClass = props.type === "big" ? "bigButton" : "button";
  if (props.colorfulBorder) baseClass += " colorfulBorder";
  if (props.className) baseClass += " " + props.className;
  return (
    <button className={baseClass} style={props.style} onClick={props.onClick}>
      <div className="buttonInner">
        <div>{props.children}</div> {/* The additional div is for padding */}
      </div>
    </button>
  );
}

export default Button;
