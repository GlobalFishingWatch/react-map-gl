import React, {useState, useCallback} from 'react';
import {DEFAULT_SUBLAYERS} from './App';

function Sublayer({index, sublayer, setDatasets, setFilter, setActive, setVisible, setInterval, allowIntervalChange}) {
  return (
    <div className={`tileset ${sublayer.active ? '' : 'disabled'}`}>
      <span>
        {index > 0 && (
          <input
            type="checkbox"
            checked={sublayer.active}
            onChange={event => setActive(index, event.target.checked)}
          />
        )}
      </span>
      <fieldset>
        <label htmlFor={`datsets_${index}`} />
        <input
          id={`datsets_${index}`}
          type="text"
          value={sublayer.datasets}
          onChange={event => setDatasets(index, event.target.value)}
        />
      </fieldset>
      <fieldset>
        <label htmlFor={`filters_${index}`}>filters</label>
        <input
          id={`filters_${index}`}
          type="text"
          value={sublayer.filter}
          onChange={event => setFilter(index, event.target.value)}
        />
      </fieldset>
      <fieldset>
        <label htmlFor={`visible_${index}`}>v</label>
        <input
          id={`visible_${index}`}
          type="checkbox"
          checked={sublayer.visible}
          onChange={event => setVisible(index, event.target.checked)}
        />
      </fieldset>
      <fieldset>
        <label htmlFor={`interval_${index}`}>interval</label>
        <select
          id={`interval_${index}`}
          onChange={event => {
            setInterval(index, event.target.value);
          }}
          disabled={!allowIntervalChange}
        >
          <option value="auto">auto</option>
          <option value="month">month</option>
          <option value="10days">10days</option>
          <option value="day">day</option>
          <option value="hour">hour</option>
        </select>
      </fieldset>
    </div>
  );
}

export default function Sublayers({onChange, allowIntervalChange}) {
  const [sublayers, updateSublayers] = useState(DEFAULT_SUBLAYERS);

  const setDatasets = useCallback((index, datasets) => {
    const newSublayers = [...sublayers];
    newSublayers[index].datasets = datasets;
    updateSublayers(newSublayers);
  });
  const setFilter = useCallback((index, filter) => {
    const newSublayers = [...sublayers];
    newSublayers[index].filter = filter;
    updateSublayers(newSublayers);
  });
  const setActive = useCallback((index, active) => {
    const newSublayers = [...sublayers];
    newSublayers[index].active = active;
    updateSublayers(newSublayers);
  });
  const setVisible = useCallback((index, visible) => {
    const newSublayers = [...sublayers];
    newSublayers[index].visible = visible;
    updateSublayers(newSublayers);
  });
  const setInterval = useCallback((index, interval) => {
    const newSublayers = [...sublayers];
    newSublayers[index].interval = interval;
    updateSublayers(newSublayers);
  });

  return (
    <>
      {sublayers.map((sublayer, i) => (
        <Sublayer
          key={i}
          index={i}
          sublayer={sublayer}
          setDatasets={setDatasets}
          setFilter={setFilter}
          setActive={setActive}
          setVisible={setVisible}
          setInterval={setInterval}
          allowIntervalChange={allowIntervalChange}
        />
      ))}

      <button onClick={() => onChange(sublayers)}>ok</button>
    </>
  );
}