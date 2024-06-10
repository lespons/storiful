import {
  Combobox,
  ComboboxButton,
  ComboboxInput,
  ComboboxOption,
  ComboboxOptions
} from '@headlessui/react';
import React, { useCallback, useEffect, useState } from 'react';

type Item = { id: string; name: string; [key: string]: unknown } & unknown;

export function SelectBox({
  items,
  showDisplayValue,
  onSelect,
  initialItem,
  id
}: {
  id?: string;
  items: Item[];
  initialItem?: Item | null;
  showDisplayValue?: boolean;
  onSelect: (item: Item | null) => void;
}) {
  const [options, setOptions] = useState(items);
  const search = useCallback(
    (v: string) => {
      setOptions(items.filter(({ name }) => name.toLowerCase().startsWith(v.toLowerCase())));
    },
    [items]
  );
  useEffect(() => {
    setOptions(items);
  }, [items]);

  const [selectedValue, setSelectedValue] = useState(initialItem);
  return (
    <div id={id} className="relative">
      <Combobox
        value={showDisplayValue ? selectedValue : null}
        onChange={(value: Item) => {
          setSelectedValue(value);
          onSelect(value);
        }}
        defaultValue={initialItem}>
        <div className="relative">
          <div className="relative w-full cursor-default overflow-hidden rounded-md bg-white text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300">
            <ComboboxInput
              className="w-full px-2 py-1 text-md rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              displayValue={(item: Item) => (item ? item.name : '')}
              onChange={(event) => search(event.target.value)}
            />
            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-2">
              <div className="h-5 w-5 text-gray-400" aria-hidden="true">
                ^
              </div>
            </ComboboxButton>
          </div>
        </div>
        <ComboboxOptions className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-md ring-1 ring-black/5 focus:outline-none z-20 ">
          {!options.length ? (
            <div className="relative cursor-no-drop font-light px-6">No items</div>
          ) : null}
          {options.map((item) => (
            <ComboboxOption
              key={item.id}
              value={item}
              className={({ selected }) =>
                `relative select-none py-1 px-4 font-semibold  hover:cursor-pointer hover:bg-violet-600 ${
                  selected ? 'bg-violet-600 text-white' : 'odd:bg-gray-200 hover:text-white'
                }`
              }>
              {item.name}
            </ComboboxOption>
          ))}
        </ComboboxOptions>
      </Combobox>
    </div>
  );
}
