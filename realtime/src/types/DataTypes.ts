export type RowData = {
  id: number;
  name: string;
  age: number;
  status: boolean; // Updated to boolean
  relatedId: number;
  date: string; // ISO format
  color: string; // Hex color code
  image: string; // URL or base64 string for the image
};
export type RelatedObject = {
  id: number;
  label: string;
};

export type EditEvent = {
  id: number;
  key: keyof RowData;
  oldValue: any;
  newValue: any;
};
