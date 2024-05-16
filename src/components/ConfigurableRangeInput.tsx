import React, { useCallback, useState } from "react";

type ConfigurableRangeInputProps = {
  defaultValue: number,
  min?: string,
  defaultMax: number,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
  label: string,
  step?: string,
};

const ConfigurableRangeInput = (props: ConfigurableRangeInputProps) => {
  const { defaultValue, defaultMax, onChange, label, step, min } = props;
  const [ value, setAttack ] = useState<number>(defaultValue);
  const [ max, setMax ] = useState<number>(defaultMax);

  const onChangeValue = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e);
    setAttack(+e.target.value)
  }, [ onChange ]);
  const onChangeMax = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax : number = +e.target.value;
    setMax(newMax);
  }, []);
  return (
    <div>
      <span className="inline-block w-10">{label}</span>
      <input type="number" value={value} onChange={onChangeValue} />
      <input type="range" name="attack" min={min || "0.5"} max={max} step={step || "0.5"} value={value} onChange={onChangeValue} />
      (Max: <input type="number" value={max} onChange={onChangeMax} />)
    </div>
  );
}

export default ConfigurableRangeInput;
