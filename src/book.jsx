import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";
import BackgroundWrapper from "./background"; // Assuming this provides your standard background
import NavBar from "./navbar"; // For navigation
import LoadingSpinner from "./loading";
import Footer from "./footer";
// --- SERVICE DATA WITH PRICES ---
const servicesData = [
  { id: 1, name: "Engine Diagnostics", price: 150.0 },
  { id: 2, name: "Oil & Filter Change", price: 75.0 },
  { id: 3, name: "Brake Services", price: 250.0 },
  { id: 4, name: "Tire & Wheel Alignment", price: 120.0 },
  { id: 5, name: "Performance Tuning", price: 400.0 },
  { id: 6, name: "Full Detailing", price: 300.0 },
  { id: 7, name: "Transmission Service", price: 280.0 },
  { id: 8, name: "Battery Replacement", price: 180.0 },
];

const BookService = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [user, setUser] = useState(null);
  const [vehicleModel, setVehicleModel] = useState("");
  const [isVehicleDisabled, setIsVehicleDisabled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredServices, setFilteredServices] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [preferredDate, setPreferredDate] = useState("");

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }
      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("vehicle_type")
        .eq("id", user.id)
        .single();
      if (profile && profile.vehicle_type) {
        setVehicleModel(profile.vehicle_type);
        setIsVehicleDisabled(true);
      }
      setLoading(false);
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredServices([]);
    } else {
      const searchResults = servicesData.filter(
        (service) =>
          service.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !selectedServices.some((s) => s.id === service.id)
      );
      setFilteredServices(searchResults);
    }
  }, [searchTerm, selectedServices]);

  useEffect(() => {
    const total = selectedServices.reduce(
      (sum, service) => sum + service.price,
      0
    );
    setTotalPrice(total);
  }, [selectedServices]);

  const handleSelectService = (service) => {
    setSelectedServices((prev) => [...prev, service]);
    setSearchTerm("");
  };

  const handleRemoveService = (serviceToRemove) => {
    setSelectedServices((prev) =>
      prev.filter((s) => s.id !== serviceToRemove.id)
    );
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const requestData = {
      user_id: user.id,
      vehicle_model: vehicleModel,
      selected_services: selectedServices,
      total_price: totalPrice,
      preferred_date: preferredDate,
      status: "pending",
    };

    const { error } = await supabase
      .from("service_requests")
      .insert(requestData);

    if (error) {
      alert("Error submitting request: " + error.message);
      setIsSubmitting(false);
    } else {
      alert("Your service request has been submitted!");
      navigate("/dashboard");
    }
  };

  return (
    <>
      <style>{`.service-item:hover { background-color: rgba(0, 168, 255, 0.2); }`}</style>
      <BackgroundWrapper>
        <div style={styles.pageContainer}>
          {/* Add NavBar for consistent navigation */}
          <NavBar />

          {/* Main content centered */}
          <div style={styles.contentWrapper}>
            {loading ? (
              <LoadingSpinner text="Loading Booking Requests..." />
            ) : (
              <div style={styles.formCard}>
                <h1 style={styles.title}>Book Your Service</h1>
                <p style={styles.subtitle}>
                  Select your desired services and schedule a date with our
                  expert technicians.
                </p>

                <form onSubmit={handleSubmitRequest} style={styles.form}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Select Services</label>
                    <div style={styles.searchWrapper}>
                      <input
                        type="text"
                        placeholder="Search for services like 'Oil Change' or 'Brakes'..."
                        style={styles.inputField}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      {filteredServices.length > 0 && (
                        <div style={styles.searchResults}>
                          {filteredServices.map((service) => (
                            <div
                              key={service.id}
                              className="service-item"
                              style={styles.serviceItem}
                              onClick={() => handleSelectService(service)}
                            >
                              <span>{service.name}</span>
                              <span>${service.price.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={styles.selectedContainer}>
                    {selectedServices.length === 0 ? (
                      <p style={styles.placeholderText}>
                        Your selected services will appear here.
                      </p>
                    ) : (
                      <div style={styles.pillsContainer}>
                        {selectedServices.map((service) => (
                          <div key={service.id} style={styles.servicePill}>
                            {service.name}
                            <button
                              type="button"
                              style={styles.removePillButton}
                              onClick={() => handleRemoveService(service)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div style={styles.totalPrice}>
                      <span>TOTAL</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                  <div style={styles.formRow}>
                    <div style={{ ...styles.inputGroup, flex: 1 }}>
                      <label style={styles.label}>Preferred Date</label>
                      <input
                        type="date"
                        style={styles.inputField}
                        value={preferredDate}
                        onChange={(e) => setPreferredDate(e.target.value)}
                        required
                        min={new Date().toISOString().split("T")[0]}
                      />
                    </div>
                    <div style={{ ...styles.inputGroup, flex: 1 }}>
                      <label style={styles.label}>Vehicle Model</label>
                      <input
                        type="text"
                        placeholder="e.g., Toyota Camry 2021"
                        style={
                          isVehicleDisabled
                            ? { ...styles.inputField, ...styles.disabledInput }
                            : styles.inputField
                        }
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        required
                        disabled={isVehicleDisabled}
                      />
                    </div>
                  </div>
                  <div style={styles.buttonGroup}>
                    <button
                      type="button"
                      onClick={() => navigate("/dashboard")}
                      style={{ ...styles.actionButton, ...styles.cancelButton }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      style={styles.actionButton}
                      disabled={isSubmitting || selectedServices.length === 0}
                    >
                      {isSubmitting ? "Submitting..." : "Submit Request"}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
        <Footer></Footer>
      </BackgroundWrapper>
    </>
  );
};

// --- STYLES ---
const styles = {
  pageContainer: {
    minHeight: "100vh",
    width: "100%",
    display: "flex",
    flexDirection: "column",
    fontFamily: "'Inter', sans-serif",
    color: "#fff",
  },
  contentWrapper: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
  },
  loading: { fontSize: "2rem", textAlign: "center" },
  formCard: {
    width: "100%",
    maxWidth: "800px",
    backgroundColor: "rgba(20, 20, 35, 0.65)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    borderRadius: "24px",
    padding: "40px 50px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
  },
  title: {
    textAlign: "center",
    fontSize: "2.5rem",
    fontWeight: "700",
    margin: "0 0 10px 0",
  },
  subtitle: {
    textAlign: "center",
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: "1.1rem",
    margin: "0 0 40px 0",
  },
  form: { display: "flex", flexDirection: "column", gap: "25px" },
  inputGroup: { width: "100%" },
  label: {
    display: "block",
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "500",
    marginBottom: "12px",
    fontSize: "1rem",
  },
  inputField: {
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.25)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    color: "#ffffff",
    borderRadius: "10px",
    padding: "14px 16px",
    fontSize: "1rem",
    transition: "all 0.3s ease",
    boxSizing: "border-box",
    outline: "none",
  },
  disabledInput: {
    backgroundColor: "rgba(0,0,0,0.4)",
    color: "rgba(255,255,255,0.6)",
    cursor: "not-allowed",
  },
  searchWrapper: { position: "relative" },
  searchResults: {
    position: "absolute",
    width: "100%",
    top: "calc(100% + 5px)",
    left: 0,
    backgroundColor: "rgba(30, 30, 45, 0.9)",
    backdropFilter: "blur(10px)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    borderRadius: "10px",
    zIndex: 10,
    maxHeight: "200px",
    overflowY: "auto",
  },
  serviceItem: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 16px",
    cursor: "pointer",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    transition: "background-color 0.2s ease",
  },
  selectedContainer: {
    minHeight: "100px",
    backgroundColor: "rgba(0,0,0,0.25)",
    borderRadius: "10px",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    gap: "15px",
  },
  placeholderText: {
    color: "rgba(255,255,255,0.5)",
    margin: "auto",
    textAlign: "center",
  },
  pillsContainer: { display: "flex", flexWrap: "wrap", gap: "10px" },
  servicePill: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    backgroundColor: "#00A8FF",
    color: "#0A0A14",
    padding: "5px 12px",
    borderRadius: "20px",
    fontWeight: "600",
  },
  removePillButton: {
    background: "none",
    border: "none",
    color: "#0A0A14",
    fontSize: "18px",
    cursor: "pointer",
    padding: "0 0 0 5px",
    lineHeight: 1,
  },
  totalPrice: {
    display: "flex",
    justifyContent: "space-between",
    paddingTop: "15px",
    borderTop: "1px solid rgba(255,255,255,0.2)",
    fontWeight: "700",
    fontSize: "1.2rem",
  },
  formRow: { display: "flex", gap: "25px" },
  buttonGroup: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "15px",
    marginTop: "20px",
  },
  actionButton: {
    fontFamily: "'Inter', sans-serif",
    fontSize: "1rem",
    fontWeight: "600",
    padding: "12px 30px",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "all 0.3s ease",
    background: "linear-gradient(90deg, #00A8FF, #007BFF)",
    color: "#FFFFFF",
  },
  cancelButton: {
    background: "rgba(255, 255, 255, 0.1)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
};

export default BookService;
