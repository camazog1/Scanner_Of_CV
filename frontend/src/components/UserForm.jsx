// frontend/src/components/UserForm.jsx

import React from "react";

function UserForm({ userData, setUserData }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="user-form p-3 mb-4 border rounded">
      <h4 className="mb-3">Información del Aspirante</h4>
      <div className="mb-3">
        <label htmlFor="name" className="form-label">
          Nombre <span className="text-danger">*</span>
        </label>
        <input
          type="text"
          className="form-control"
          id="name"
          name="name"
          value={userData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="email" className="form-label">
          Correo Electrónico <span className="text-danger">*</span>
        </label>
        <input
          type="email"
          className="form-control"
          id="email"
          name="email"
          value={userData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="mb-3">
        <label htmlFor="phone" className="form-label">
          Teléfono <span className="text-danger">*</span>
        </label>
        <input
          type="tel"
          className="form-control"
          id="phone"
          name="phone"
          value={userData.phone}
          onChange={handleChange}
          required
        />
      </div>
    </div>
  );
}

export default UserForm;