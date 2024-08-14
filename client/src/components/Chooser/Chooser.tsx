interface ChooserProps {
  name?: string;
  label?: string;
  options: { value: undefined | string | number, label?: string }[] | (undefined | string | number)[];
  default?: string | number;
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
}

function Chooser(props: ChooserProps) {
  return (
    <div>
      <label htmlFor={props.name}>{props.label}</label>
      <select name={props.name} defaultValue={props.default} onChange={props.onChange}>
        {props.options.map(option => {
          const value = typeof option === "object" ? option.value : option;
          const label = typeof option === "object" ? option.label : option;
          return <option key={value} value={value}>{label}</option>;
        })}
      </select>
    </div>
  );
}

export default Chooser;
