import React, {useState} from 'react';
import { DEFAULT_TILESET } from './app';

export default function Tileset({ onChange }) {
  const [tileset, setTileset] = useState(DEFAULT_TILESET.tileset)
  const [filter, setFilter] = useState(DEFAULT_TILESET.filter)

  return <>
    <fieldset>
      <label htmlFor="tileset">tileset</label>
      <input id="tileset" type="text" value={tileset} onChange={(event) => setTileset(event.target.value)} />
    </fieldset>
    <fieldset>
      <label htmlFor="filters">filters</label>
      <input id="filters" type="text" value={filter} onChange={(event) => setFilter(event.target.value)} />
    </fieldset>
    <button onClick={() => onChange({ tileset, filter })}>ok</button>
  </>
}