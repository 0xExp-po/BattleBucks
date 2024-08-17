import { MouseEvent, useState } from "react";
import "./Chooser.scss";

type ValidTypes = undefined | string | number;
type Combined = { value: ValidTypes, label?: string };

interface ChooserProps {
  name?: string;
  label?: string;
  options: Combined[] | ValidTypes[];
  default?: ValidTypes;
  onChange?: (value: ValidTypes) => void;
}

function Chooser(props: ChooserProps) {
  const [value, setValue] = useState(props.default);

  let options: ValidTypes[] = [];
  if (props.options.length > 0) {
    options = typeof props.options[0] === "object" ? props.options.map(v => (v as Combined).value) : props.options as ValidTypes[];
  }

  const onChange = (_: MouseEvent<HTMLSelectElement>) => {
    let newVal = value;
    do {
      let index = options.indexOf(newVal);
      newVal = options[(index + 1) % options.length];
    } while (newVal === undefined);

    setValue(newVal);
    props.onChange && props.onChange(newVal);
  }

  return (
    <div className="flexRow" style={{ gap: "0.5em" }}>
      <label htmlFor={props.name}>{props.label}</label>
      <select name={props.name} defaultValue={value} value={value} onClick={onChange} onMouseDown={e => e.preventDefault()} className="chooserOption">
        {props.options.map(option => {
          const value = typeof option === "object" ? option.value : option;
          const label = typeof option === "object" ? option.label : option;
          return <option key={value ?? null} value={value}>{label}</option>;
        })}
      </select>
    </div>
  );
}

export default Chooser;
