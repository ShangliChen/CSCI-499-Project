import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

function CounselorDocs() {
  const [idPicture, setIdPicture] = useState(null);
  const [licensePicture, setLicensePicture] = useState(null);
  const [message, setMessage] = useState("");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = searchParams.get("userId");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idPicture || !licensePicture) {
      setMessage("Please upload both documents.");
      return;
    }

    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("idPicture", idPicture);
    formData.append("licensePicture", licensePicture);

    try {
      const res = await fetch("http://localhost:5000/api/counselor/upload-docs", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Documents uploaded. Your registration is under review by an administrator.");
        setTimeout(() => navigate("/user-type"), 2500);
      } else {
        setMessage(data.message || "Upload failed!");
      }
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong!");
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/images/background.jpg')" }}
    >
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm">
        <h2 className="text-xl font-bold mb-6 text-center">Upload Documents</h2>

        <div className="mb-4">
          <label htmlFor="idPicture" className="block mb-2 text-sm font-medium text-gray-900">
            ID Picture
          </label>
          <input
            type="file"
            id="idPicture"
            onChange={(e) => setIdPicture(e.target.files[0])}
            className="w-full p-2 border rounded"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="licensePicture" className="block mb-2 text-sm font-medium text-gray-900">
            License Picture
          </label>
          <input
            type="file"
            id="licensePicture"
            onChange={(e) => setLicensePicture(e.target.files[0])}
            className="w-full p-2 border rounded"
          />
        </div>

        <button type="submit" className="bg-[#98FF98] text-black w-full py-2 rounded-lg hover:bg-[#87e687] transition">
          Upload
        </button>

        {message && <p className="mt-4 text-center text-gray-700">{message}</p>}
      </form>
    </div>
  );
}

export default CounselorDocs;
