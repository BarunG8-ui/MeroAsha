import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = "http://localhost:5001/api";

function PatientProfile() {
  const { token } = useAuth();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    emergencyName: "",
    emergencyRelationship: "",
    emergencyPhone: "",
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/patients/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load profile"
          );
        }

        const p = data.patient;

        setPatient(p);

        setForm({
          dateOfBirth: p.dateOfBirth
            ? p.dateOfBirth.substring(0, 10)
            : "",
          gender: p.gender || "",
          bloodGroup: p.bloodGroup || "",
          phone: p.phone || "",
          street: p.address?.street || "",
          city: p.address?.city || "",
          state: p.address?.state || "",
          country: p.address?.country || "",
          postalCode: p.address?.postalCode || "",
          emergencyName: p.emergencyContact?.name || "",
          emergencyRelationship:
            p.emergencyContact?.relationship || "",
          emergencyPhone: p.emergencyContact?.phone || "",
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadProfile();
    }
  }, [token]);

  const handleChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const response = await fetch(
        `${API_BASE_URL}/patients/me`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            dateOfBirth: form.dateOfBirth,
            gender: form.gender,
            bloodGroup: form.bloodGroup,
            phone: form.phone,

            address: {
              street: form.street,
              city: form.city,
              state: form.state,
              country: form.country,
              postalCode: form.postalCode,
            },

            emergencyContact: {
              name: form.emergencyName,
              relationship: form.emergencyRelationship,
              phone: form.emergencyPhone,
            },
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update profile"
        );
      }

      setPatient(data.patient);
      setMessage("Profile updated successfully.");
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (error && !patient) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h1>My Profile</h1>

      <p>
        <strong>Patient ID:</strong>{" "}
        {patient?.patientId}
      </p>

      {message && (
        <p>{message}</p>
      )}

      {error && (
        <p>{error}</p>
      )}

      <form onSubmit={handleSubmit}>
        <h2>Personal Information</h2>

        <label>Date of Birth</label>
        <br />
        <input
          type="date"
          name="dateOfBirth"
          value={form.dateOfBirth}
          onChange={handleChange}
        />

        <br /><br />

        <label>Gender</label>
        <br />
        <select
          name="gender"
          value={form.gender}
          onChange={handleChange}
        >
          <option value="">Select</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
        </select>

        <br /><br />

        <label>Blood Group</label>
        <br />
        <select
          name="bloodGroup"
          value={form.bloodGroup}
          onChange={handleChange}
        >
          <option value="UNKNOWN">Unknown</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select>

        <br /><br />

        <label>Phone</label>
        <br />
        <input
          type="text"
          name="phone"
          value={form.phone}
          onChange={handleChange}
        />

        <h2>Address</h2>

        <input
          type="text"
          name="street"
          placeholder="Street"
          value={form.street}
          onChange={handleChange}
        />

        <br /><br />

        <input
          type="text"
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleChange}
        />

        <br /><br />

        <input
          type="text"
          name="state"
          placeholder="State"
          value={form.state}
          onChange={handleChange}
        />

        <br /><br />

        <input
          type="text"
          name="country"
          placeholder="Country"
          value={form.country}
          onChange={handleChange}
        />

        <br /><br />

        <input
          type="text"
          name="postalCode"
          placeholder="Postal Code"
          value={form.postalCode}
          onChange={handleChange}
        />

        <h2>Emergency Contact</h2>

        <input
          type="text"
          name="emergencyName"
          placeholder="Name"
          value={form.emergencyName}
          onChange={handleChange}
        />

        <br /><br />

        <input
          type="text"
          name="emergencyRelationship"
          placeholder="Relationship"
          value={form.emergencyRelationship}
          onChange={handleChange}
        />

        <br /><br />

        <input
          type="text"
          name="emergencyPhone"
          placeholder="Phone"
          value={form.emergencyPhone}
          onChange={handleChange}
        />

        <br /><br />

        <button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
}

export default PatientProfile;