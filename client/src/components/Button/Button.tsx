import { CSSProperties } from "react";
import { Children } from "../../utils/types";
import "./Button.scss";

interface ButtonProps {
  children: Children;
  type?: "normal" | "big" | "accept" | "cancel";
  style?: CSSProperties;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  className?: string;
  colorfulBorder?: boolean;
  disabled?: boolean;
}

function Button(props: ButtonProps) {
  let baseClass = (props.type ?? "normal") + "Button";
  if (props.colorfulBorder) baseClass += " colorfulBorder";
  if (props.className) baseClass += " " + props.className;
  return (
    <button className={baseClass} style={props.style} onClick={props.onClick} disabled={props.disabled}>
      <div className="buttonInner">
        <div className="buttonInnerBgDarken"> {/* for darkening the background on active */}
          <div>{props.children}</div> {/* The additional div is for padding */}
        </div>
      </div>
    </button>
  );
}

export default Button;
