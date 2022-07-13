import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Item from "../Components/Item";
import { store } from "../configure-store";
import {
  LOADING_FALSE,
  LOADING_TRUE,
  SET_SHOPPING_LIST,
} from "../Shopping-reducers/reducer";

const Shopping = () => {
  const state = store.getState();
  const Navigate = useNavigate();

  const [newItem, setNewItem] = useState("");
  const dispatch = useDispatch();
  const { shoppingList, socket, roomNo, loading } = store.getState();

  useEffect(() => {
    if (state.roomNo === null) Navigate("/");

    socket.on("changed_list", (data) => {
      dispatch({ type: LOADING_TRUE });
      dispatch({ type: SET_SHOPPING_LIST, value: data.newList });
      dispatch({ type: LOADING_FALSE });
    });
  }, [Navigate, dispatch, socket, state.roomNo]);

  const handleSubmit = (e) => {
    e.preventDefault();
    let NewItem = newItem.trim();
    if (NewItem.length === 0) return;
    if (NewItem.length > 200) return;
    dispatch({ type: LOADING_TRUE });

    let today = new Date();
    let timestamp =
      today.getDate() +
      "/" +
      (today.getMonth() + 1) +
      "/" +
      today.getFullYear() +
      " @ " +
      today.getHours() +
      ":" +
      today.getMinutes() +
      ":" +
      today.getSeconds();

    const newList = [
      {
        title: NewItem,
        completed: false,
        id: Date.now(),
        completedBy: "",
        timestamp,
      },
      ...shoppingList,
    ];

    dispatch({ type: SET_SHOPPING_LIST, value: newList });
    socket.emit("changed_list", { newList, roomNo });
    setNewItem("");

    dispatch({ type: LOADING_FALSE });
  };
  return (
    <div>
      <form
        className="form d-flex justify-content-around my-4"
        onSubmit={handleSubmit}
      >
        <div className="form-floating d-inline-block w-100 me-3">
          <input
            className="form-control mx-1 outline-none bg-transparent border-bottom text-light"
            type="text"
            name="item"
            id="item"
            placeholder="Bread.."
            value={newItem}
            onChange={(e) => {
              setNewItem(e.target.value);
            }}
          />
          <label htmlFor="item" className="text-light">
            Bread...
          </label>
        </div>
        <button type="submit" className="btn btn-success mx-1">
          Add
        </button>
      </form>
      {loading === true ? (
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      ) : null}
      {shoppingList.map((item, idx) => (
        <Item
          key={item.id + "_" + String(idx)}
          title={item.title}
          completed={item.completed}
          timestamp={item.timestamp}
          id={item.id}
          completedBy={item.completedBy}
          completedTime={item.completedTime}
        />
      ))}
    </div>
  );
};

export default Shopping;
