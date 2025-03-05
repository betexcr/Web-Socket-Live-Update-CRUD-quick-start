import React, { useEffect, useState } from "react";
import DataTable from "./components/DataTable";
import { RowData, RelatedObject } from "./types/DataTypes";

const App: React.FC = () => {
  const [data, setData] = useState<RowData[]>([]);
  const [relatedObjects, setRelatedObjects] = useState<RelatedObject[]>([]);
  const [socket, setSocket] = useState<WebSocket | null>(null);

  // Fetch initial data
  useEffect(() => {
    fetch("http://localhost:5001/api/data")
      .then((res) => res.json())
      .then(({ rows, relatedObjects }) => {
        setData(rows);
        setRelatedObjects(relatedObjects);
      });
  }, []);

  // WebSocket connection
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    ws.onmessage = (event) => {
      const { id, changes, type } = JSON.parse(event.data);
      console.log(" event received", event.data);
      // Update the specific row
      if (type == "DELETE") {
        setData((prevData) => prevData.filter((item) => item.id != id));
      } else if (type == "ADD") {
        const defaultRow = {
          name: "New Item",
          age: 0,
          status: false,
          related_id: null,
          date: null,
          color: "#ffffff",
          image: null,
        };
        setData((prevData) => [...prevData, defaultRow]);
      } else {
        setData((prevData) =>
          prevData.map((row) => (row.id === id ? { ...row, ...changes } : row))
        );
      }
    };

    setSocket(ws);
    return () => ws.close();
  }, []);

  const handleRowUpdate = (rowId: number, updates: Partial<RowData>) => {
    // Optimistically update the UI
    setData((prevData) =>
      prevData.map((row) => (row.id === rowId ? { ...row, ...updates } : row))
    );

    // Send update to WebSocket
    if (socket) {
      socket.send(JSON.stringify({ id: rowId, changes: updates }));
    }

    // Persist update to the database
    fetch("http://localhost:5001/api/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: rowId, changes: updates }),
    }).catch((err) => {
      console.error("Failed to save changes:", err);
    });
  };
  return (
    <div>
      <h1>Test Live Persistence</h1>
      <DataTable
        data={data}
        setData={setData}
        relatedObjects={relatedObjects}
        onRowUpdate={handleRowUpdate}
      />
      <button
        onClick={() => {
          fetch("http://localhost:5001/api/add", {
            method: "POST",
          })
            .then((response) => response.json())
            .then((newRow) => {
              setData((prevData) => [...prevData, newRow]);
            })
            .catch((error) => console.error("Failed to add row:", error));
        }}
      >
        Add Row
      </button>
    </div>
  );
};

export default App;
