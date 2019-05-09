import React, { useEffect, useState } from "react";
import axios from "axios";
import numeral from "numeral";

const Fib = () => {
  const [seenIndexes, setSeenIndexes] = useState([]);
  const [values, setValues] = useState({});
  const [index, setIndex] = useState("");
  const [updated, setUpdated] = useState(true);

  useEffect(() => {
    try {
      fetchValues();
      fetchIndexes();
      setUpdated(false);
    } catch (e) {
      console.log("Error fetching", e);
    }
  }, [updated]);

  const fetchValues = async () => {
    try {
      const values = await axios.get("/api/values/current");
      setValues(values.data);
    } catch (e) {
      console.log("Values fetching error", e);
    }
  };
  const fetchIndexes = async () => {
    try {
      const seenIndexes = await axios.get("/api/values/all");
      setSeenIndexes(seenIndexes.data);
    } catch (e) {
      console.log("Index fetching error", e);
    }
  };
  const handleClear = async () => {
    try {
      await axios.post("/api/values/clear", {
        action: "clear"
      });
      setUpdated(true);
    } catch (e) {
      console.log(e);
    }
  };
  const handleKeyPress = e => {
    if (e.keyCode === 13) handleSubmit();
  };

  const handleSubmit = async event => {
    event.preventDefault();
    await axios.post("/api/values", { index: index });
    setIndex("");
    setUpdated(true);
  };

  const renderClearButton = () => {
    if (values) {
      return (
        <button
          className="btn btn-block btn-outline-danger border border-danger my-3"
          onClick={handleClear}
        >
          Clear Persistent Data
        </button>
      );
    }
  };
  const renderSeenIndexes = () => {
    const indexes = seenIndexes
      .map(({ number }) => number)
      .sort((a, b) => a - b)
      .join(", ");
    return (
      <ul className="list-group">
        <li className="list-group-item">{indexes}</li>
      </ul>
    );
  };

  const renderValues = () => {
    const entries = [];

    for (let key in values) {
      entries.push(
        <div key={key}>
          <li className="list-group-item">
            For index, {key}, I calculated: {numeral(values[key]).format()}
          </li>
        </div>
      );
    }

    return entries;
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="text-info" htmlFor="index">
            Enter your index:
          </label>
          <input
            aria-describedby="indexHelp"
            className="form-control"
            id="index"
            onChange={event => setIndex(event.target.value)}
            onKeyPress={() => handleKeyPress}
            type="number"
            value={index}
          />
          <small id="emailHelp" className="form-text text-muted">
            Enter a number
          </small>
        </div>
        <div className="d-flex justify-content-center align-items-center">
          <button
            type="submit"
            className="btn btn-block btn-outline-info border border-info m-1"
          >
            Submit
          </button>
        </div>
      </form>

      <div className="mt-4 mb-0">
        <div className="lead text-info">Things I have seen (Postgres)</div>
        <small className="mt-0">(...near the Tanhausser gate)</small>
        {seenIndexes.length > 0 ? renderSeenIndexes() : null}
      </div>

      <div className="lead mt-4 mb-0 text-info">
        Values I've calculated (Redis)
      </div>
      <small className="mt-0">(...like tears in rain)</small>
      <ul className="list-group">{renderValues()}</ul>
      {renderClearButton()}
    </div>
  );
};
export default Fib;
