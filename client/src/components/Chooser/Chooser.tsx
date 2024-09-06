import { MouseEvent, useState } from "react";
import "./Chooser.scss";

type ValidTypes = undefined | string | number;
type Combined = { value: ValidTypes, label?: string };

interface ChooserProps {
  name?: string;
  label?: string;
  labelPosition?: "left" | "top";
  options: Combined[] | ValidTypes[];
  default?: ValidTypes;
  onChange?: (value: ValidTypes) => void;
  style?: React.CSSProperties;
}

function Chooser(props: ChooserProps) {
  const options: Combined[] = typeof props.options[0] === "object" ? props.options as Combined[] : props.options.map(t => ({ value: (t as ValidTypes), label: (t as ValidTypes)?.toString() }));
  const [value, setValue] = useState(props.default || options[0].value);

  const values: ValidTypes[] = options.map(o => o.value);

  const onChange = (_: MouseEvent<HTMLSelectElement>) => {
    let newVal = value;

    do {
      let index = values.indexOf(newVal);
      newVal = options[(index + 1) % options.length].value;
    } while (newVal === undefined);

    setValue(newVal);
    props.onChange && props.onChange(newVal);
  }

  return (
    <div className={(props.labelPosition === "top" ? "flexCol" : "flexRow") + " center"} style={{ gap: "0.5em", ...props.style }}>
      <label className="flexRow center outline2" htmlFor={props.name}>{props.label}</label>
      <select name={props.name} value={value} onClick={onChange} onMouseDown={e => e.preventDefault()} onChange={() => {}} className="chooserOption">
        {options.map(option => {
          return <option key={option.value || "undefined"} value={option.value}>{option.label || option.value}</option>;
        })}
      </select>
    </div>
  );
}

export default Chooser;
