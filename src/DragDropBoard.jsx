import { useEffect, useState } from "react";
import Masonry from "react-masonry-css";
import BoardItem from "./BoardItem";

const DragDropBoard = ({ board = [], updateItem }) => {
  const [items, setItems] = useState([]);

  // Load board items on mount
  useEffect(() => {
    const storedOrder = JSON.parse(localStorage.getItem("boardOrder"));
    if (storedOrder?.length) {
      const orderedItems = storedOrder
        .map((id) => board.find((item) => item.id === id))
        .filter(Boolean);
      setItems(orderedItems.length ? orderedItems : board);
    } else {
      setItems(board);
    }
  }, [board]);

  // Update local storage whenever items change
  useEffect(() => {
    if (items.length) {
      localStorage.setItem("boardOrder", JSON.stringify(items.map((item) => item.id)));
    }
  }, [items]);

  // Function to handle adding a new box (Text or Gallery)
  const addNewItem = (newItem) => {
    setItems((prevItems) => {
      const updatedItems = [...prevItems, newItem];
      localStorage.setItem("boardOrder", JSON.stringify(updatedItems.map((item) => item.id)));
      return updatedItems;
    });
  };

  // Function to delete an item
  const handleDelete = (id) => {
    setItems((prevItems) => {
      const updatedItems = prevItems.filter((item) => item.id !== id);
      localStorage.setItem("boardOrder", JSON.stringify(updatedItems.map((item) => item.id)));
      return updatedItems;
    });
  };

  // Drag-and-drop functionality
  useEffect(() => {
    const boardContainer = document.querySelector(".board");

    const handleDragOver = (e) => {
      e.preventDefault();
      const afterElement = getDragAfterElement(boardContainer, e.clientY);
      const dragging = document.querySelector(".dragging");

      if (dragging) {
        if (afterElement == null) {
          boardContainer.appendChild(dragging);
        } else {
          boardContainer.insertBefore(dragging, afterElement);
        }

        const newOrder = [...document.querySelectorAll(".board-item")].map((item) => item.dataset.id);
        setItems(newOrder.map((id) => items.find((item) => item.id === id)));
      }
    };

    function getDragAfterElement(container, y) {
      const draggableElements = [...container.querySelectorAll(".board-item:not(.dragging)")];

      return draggableElements.reduce(
        (closest, child) => {
          const box = child.getBoundingClientRect();
          const offset = y - box.top - box.height / 2;

          if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
          } else {
            return closest;
          }
        },
        { offset: Number.NEGATIVE_INFINITY }
      ).element;
    }

    boardContainer.addEventListener("dragover", handleDragOver);
    return () => {
      boardContainer.removeEventListener("dragover", handleDragOver);
    };
  }, [items]);

  const breakpointColumnsObj = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  return (
    <div>
      <button onClick={() => addNewItem({ id: Date.now().toString(), type: "text", content: "New Text Box" })}>
        Add Text Box
      </button>
      <button onClick={() => addNewItem({ id: Date.now().toString(), type: "gallery", content: "New Gallery Box" })}>
        Add Gallery Box
      </button>

      <Masonry
        breakpointCols={breakpointColumnsObj}
        className="board"
        columnClassName="board-column"
      >
        {items.map((item) => (
          <div
            key={item.id}
            id={item.id}
            data-id={item.id}
            className="board-item"
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData("text/plain", e.target.id);
              e.target.classList.add("dragging");
            }}
            onDragEnd={(e) => {
              e.target.classList.remove("dragging");
            }}
          >
            <BoardItem item={item} onDelete={() => handleDelete(item.id)} onUpdate={updateItem} />
          </div>
        ))}
      </Masonry>
    </div>
  );
};

export default DragDropBoard;
