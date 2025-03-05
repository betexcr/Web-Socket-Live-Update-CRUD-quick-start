import React from "react";
import { RowData, RelatedObject } from "../types/DataTypes";

interface DataTableProps {
  data: RowData[];
  relatedObjects: RelatedObject[];
  onRowUpdate: (rowId: number, updates: Partial<RowData>) => void;
  setData: any
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  relatedObjects,
  onRowUpdate,setData
}) => {
  

  const handleInputChange = (
    rowId: number,
    field: keyof RowData,
    value: any
  ) => {
    const updates = { [field]: value };
    onRowUpdate(rowId, updates);
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Age</th>
          <th>Status</th>
          <th>Related</th>
          <th>Date</th>
          <th>Color</th>
          <th>Image</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((row) => (
          <tr key={row.id}>
            <td>
              <input
                type="text"
                value={row.name}
                onChange={(e) =>
                  handleInputChange(row.id, "name", e.target.value)
                }
              />
            </td>
            <td>
              <input
                type="number"
                value={row.age}
                onChange={(e) =>
                  handleInputChange(row.id, "age", parseInt(e.target.value, 10))
                }
              />
            </td>
            <td>
              <input
                type="checkbox"
                checked={row.status}
                onChange={(e) =>
                  handleInputChange(row.id, "status", e.target.checked)
                }
              />
            </td>
            <td>
              <select
                value={row.related_id}
                onChange={(e) =>
                  handleInputChange(
                    row.id,
                    "related_id",
                    parseInt(e.target.value, 10)
                  )
                }
              >
                {relatedObjects.map((obj) => (
                  <option key={obj.id} value={obj.id}>
                    {obj.label}
                  </option>
                ))}
              </select>
            </td>
            <td>
              <input
                type="date"
                value={row.date}
                onChange={(e) =>
                  handleInputChange(row.id, "date", e.target.value)
                }
              />
            </td>
            <td>
              <input
                type="color"
                value={row.color}
                onChange={(e) =>
                  handleInputChange(row.id, "color", e.target.value)
                }
              />
            </td>
            <td>
              <div>
                {row.image && (
                  <img
                    src={row.image}
                    alt="Row Image"
                    style={{
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                    }}
                  />
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files ? e.target.files[0] : null;
                    if (file) {
                      const formData = new FormData();
                      formData.append("image", file);

                      // Upload the image to the server
                      fetch("http://localhost:5001/api/upload", {
                        method: "POST",
                        body: formData,
                      })
                        .then((response) => response.json())
                        .then((result) => {
                          if (result.imageUrl) {
                            onRowUpdate(row.id, { image: result.imageUrl }); // Save URL in the database
                          }
                        })
                        .catch((error) =>
                          console.error("Image upload failed:", error)
                        );
                    }
                  }}
                />
              </div>
            </td>
            <td>
              <button
                onClick={() => {
                  fetch("http://localhost:5001/api/delete", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id: row.id }),
                  })
                    .then((response) => response.json())
                    .then((result) => {
                      if (result.success) {
                        setData((prevData) =>
                          prevData.filter((r) => r.id !== row.id)
                        );
                      }
                    })
                    .catch((error) =>
                      console.error("Failed to delete row:", error)
                    );
                }}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DataTable;
