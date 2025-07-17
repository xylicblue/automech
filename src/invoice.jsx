import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "./supabase";
import BackgroundWrapper from "./background";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import NavBar from "./navbar";
import Footer from "./footer";
import { emvqr } from "emvqr";

// --- ICONS ---
import { FaPlus, FaTrash, FaFilePdf, FaQrcode } from "react-icons/fa";
const ErrorIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="12"></line>
    <line x1="12" y1="16" x2="12.01" y2="16"></line>
  </svg>
);

// --- CUSTOM TOAST NOTIFICATION COMPONENT ---
const Toast = ({ message, type = "error", onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3500); // Auto-dismiss after 3.5 seconds
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const style = type === "error" ? styles.toastError : styles.toastSuccess;

  return <div style={{ ...styles.toast, ...style }}>{message}</div>;
};

const QrCodeModal = ({ isOpen, onClose, qrValue, details }) => {
  if (!isOpen) return null;

  return (
    <div style={styles.backdrop} onClick={onClose}>
      <div style={{ ...styles.qrModal }} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>Scan to Pay</h2>
        <p style={styles.modalSubtitle}>
          Use your banking app to scan the QR code below.
        </p>
        <div style={styles.qrCanvasWrapper}>
          <QRCodeCanvas
            value={qrValue}
            size={256}
            bgColor={"#ffffff"}
            fgColor={"#111524"}
          />
        </div>
        <div style={styles.paymentDetails}>
          <div style={styles.detailRow}>
            <span>Amount:</span> <strong>PKR {details.total.toFixed(2)}</strong>
          </div>
          <div style={styles.detailRow}>
            <span>Beneficiary:</span> <strong>AUTOMECH</strong>
          </div>
          <div style={styles.detailRow}>
            <span>Reference:</span> <strong>{details.receiptNumber}</strong>
          </div>
        </div>
        <button style={styles.closeButton} onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

// --- PDF Generation Logic ---
const generatePdf = (details, items) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 15;
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text(details.companyName, margin, 20);
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(details.companyAddress, margin, 28);
  doc.text(details.companyPhone, margin, 34);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text("INVOICE", pageWidth - margin, 20, { align: "right" });
  let currentY = 50;
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Bill To:", margin, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(details.clientName, margin, currentY + 6);
  doc.text(details.clientAddress, margin, currentY + 12);
  doc.setFont("helvetica", "bold");
  doc.text("Invoice #:", pageWidth - margin - 50, currentY);
  doc.setFont("helvetica", "normal");
  doc.text(details.receiptNumber, pageWidth - margin, currentY, {
    align: "right",
  });
  doc.setFont("helvetica", "bold");
  doc.text("Date:", pageWidth - margin - 50, currentY + 6);
  doc.setFont("helvetica", "normal");
  doc.text(details.receiptDate, pageWidth - margin, currentY + 6, {
    align: "right",
  });
  currentY += 20;
  doc.setLineWidth(0.5);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 10;
  const tableHeaders = [["Description", "Quantity", "Unit Price", "Total"]];
  let subtotal = 0;
  const tableData = items.map((item) => {
    const total = (Number(item.quantity) || 0) * (Number(item.price) || 0);
    subtotal += total;
    return [
      item.description,
      item.quantity,
      `$${Number(item.price).toFixed(2)}`,
      `$${total.toFixed(2)}`,
    ];
  });
  autoTable(doc, {
    head: tableHeaders,
    body: tableData,
    startY: currentY,
    theme: "striped",
    headStyles: { fillColor: [22, 22, 35] },
    styles: { fontSize: 10, cellPadding: 3 },
    margin: { left: margin, right: margin },
  });
  let totalsY = doc.lastAutoTable.finalY + 15;
  const totalsX = pageWidth - margin;
  const labelX = totalsX - 60;
  const discountAmount = Number(details.discount) || 0;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const taxRate = 0.08;
  const tax = subtotalAfterDiscount * taxRate;
  const total = subtotalAfterDiscount + tax;
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Subtotal:", labelX, totalsY);
  doc.setFont("helvetica", "normal");
  doc.text(`$${subtotal.toFixed(2)}`, totalsX, totalsY, { align: "right" });
  if (discountAmount > 0) {
    totalsY += 7;
    doc.setFont("helvetica", "bold");
    doc.text("Discount:", labelX, totalsY);
    doc.setFont("helvetica", "normal");
    doc.text(`-$${discountAmount.toFixed(2)}`, totalsX, totalsY, {
      align: "right",
    });
  }
  totalsY += 7;
  doc.setFont("helvetica", "bold");
  doc.text(`Tax (${(taxRate * 100).toFixed(0)}%):`, labelX, totalsY);
  doc.setFont("helvetica", "normal");
  doc.text(`$${tax.toFixed(2)}`, totalsX, totalsY, { align: "right" });
  totalsY += 3;
  doc.setLineWidth(0.2);
  doc.line(labelX, totalsY, totalsX, totalsY);
  totalsY += 8;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Total:", labelX, totalsY);
  doc.text(`$${total.toFixed(2)}`, totalsX, totalsY, { align: "right" });
  doc.save(`invoice-${details.receiptNumber}.pdf`);
};

// --- Main Page Component ---
const InvoiceGenerator = () => {
  const navigate = useNavigate();
  const [details, setDetails] = useState({
    companyName: "AUTOMECH",
    companyAddress: "575 - Q, JOHAR TOWN, LAHORE, 54000",
    companyPhone: "+92 (300) 4292-156",
    clientName: "",
    clientAddress: "",
    receiptNumber: `INV-${Date.now().toString().slice(-6)}`,
    receiptDate: new Date().toISOString().split("T")[0],
    discount: "0",
  });
  const [items, setItems] = useState([
    { id: Date.now(), description: "", quantity: 1, price: "" },
  ]);
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState({ show: false, message: "" });

  const subtotal = items.reduce(
    (acc, item) =>
      acc + (Number(item.quantity) || 0) * (Number(item.price) || 0),
    0
  );
  const discountAmount = Number(details.discount) || 0;
  const subtotalAfterDiscount = subtotal - discountAmount;
  const tax = subtotalAfterDiscount * 0.08;
  const grandTotal = subtotalAfterDiscount + tax;
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrValue, setQrValue] = useState("");

  const handleGenerateQr = () => {
    if (validateForm()) {
      // **IMPORTANT**: Replace with YOUR actual business details
      const beneficiaryAccount = "02140107697782"; // Your bank account / IBAN
      const beneficiaryName = "MAHAD BIN AAMIR";
      const amount = grandTotal.toFixed(2);
      const invoiceNumber = details.receiptNumber;

      // Generate the QR code string using the EMVCo standard
      const qrString = emvqr.generate([
        // Payload Format Indicator
        emvqr.Tags.PayloadFormatIndicator("01"),
        // Merchant Account Information
        emvqr.Tags.MerchantAccountInformation("26", [
          emvqr.Tags.MerchantAccountInformation.GloballyUniqueIdentifier(
            "00",
            "com.yourcompany"
          ), // A unique identifier for your app/service
          emvqr.Tags.MerchantAccountInformation.PaymentNetworkSpecific(
            "01",
            beneficiaryAccount
          ),
        ]),
        // Merchant Category Code (e.g., 7538 for Auto Service Shops)
        emvqr.Tags.MerchantCategoryCode("52", "7538"),
        // Transaction Currency (PKR is 586)
        emvqr.Tags.TransactionCurrency("53", "586"),
        // Transaction Amount
        emvqr.Tags.TransactionAmount("54", amount),
        // Country Code
        emvqr.Tags.CountryCode("58", "PK"),
        // Merchant Name
        emvqr.Tags.MerchantName("59", beneficiaryName),
        // Merchant City
        emvqr.Tags.MerchantCity("60", "Lahore"),
        // Additional Data Field for Invoice Number
        emvqr.Tags.AdditionalDataFieldTemplate("62", [
          emvqr.Tags.AdditionalDataFieldTemplate.ReferenceLabel(
            "05",
            invoiceNumber
          ),
        ]),
      ]);

      setQrValue(qrString);
      setShowQrModal(true);
    } else {
      alert("Please fill in all required fields.");
    }
  };
  useEffect(() => {
    /* ... admin check ... */
  }, [navigate]);
  const handleDetailChange = (e) =>
    setDetails({ ...details, [e.target.name]: e.target.value });
  const handleItemChange = (index, e) => {
    const newItems = [...items];
    newItems[index][e.target.name] = e.target.value;
    setItems(newItems);
  };
  const handleAddItem = () =>
    setItems([
      ...items,
      { id: Date.now(), description: "", quantity: 1, price: "" },
    ]);
  const handleDeleteItem = (id) =>
    setItems(items.filter((item) => item.id !== id));

  const validateForm = () => {
    const newErrors = {};
    if (!details.companyName.trim())
      newErrors.companyName = "Company name is required.";
    if (!details.clientName.trim())
      newErrors.clientName = "Client name is required.";
    const itemErrors = items.map((item) =>
      !item.description.trim() ? "Description is required" : null
    );
    if (itemErrors.some((e) => e)) newErrors.items = itemErrors;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleGeneratePdf = () => {
    if (validateForm()) {
      generatePdf(details, items);
    } else {
      setToast({ show: true, message: "Please fill in all required fields." });
    }
  };

  return (
    <BackgroundWrapper>
      <QrCodeModal
        isOpen={showQrModal}
        onClose={() => setShowQrModal(false)}
        qrValue={qrValue}
        details={{ total: grandTotal, receiptNumber: details.receiptNumber }}
      />
      {toast.show && (
        <Toast
          message={toast.message}
          onDismiss={() => setToast({ show: false, message: "" })}
        />
      )}
      <div style={styles.pageContainer}>
        <NavBar />
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.title}>Invoice Generator</h1>
            <button style={styles.generateButton} onClick={handleGeneratePdf}>
              <FaFilePdf /> Generate PDF
            </button>
            <button style={styles.generateButton} onClick={handleGenerateQr}>
              <FaQrcode /> Generate Payment QR
            </button>
          </div>

          <div style={styles.form}>
            {/* Company Details */}
            <div style={styles.formSection}>
              <h3 style={styles.sectionTitle}>Company Details</h3>
              <div style={styles.formGrid}>
                <div style={{ ...styles.formGroup, gridColumn: "1 / -1" }}>
                  <label>Company Name</label>
                  <div style={styles.inputWrapper}>
                    <input
                      type="text"
                      name="companyName"
                      value={details.companyName}
                      onChange={handleDetailChange}
                      style={{
                        ...styles.inputField,
                        ...(errors.companyName && styles.inputError),
                      }}
                    />
                    {errors.companyName && (
                      <span style={styles.errorIcon}>
                        <ErrorIcon />
                      </span>
                    )}
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label>Company Address</label>
                  <input
                    type="text"
                    name="companyAddress"
                    value={details.companyAddress}
                    onChange={handleDetailChange}
                    style={styles.inputField}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label>Company Contact</label>
                  <input
                    type="text"
                    name="companyPhone"
                    value={details.companyPhone}
                    onChange={handleDetailChange}
                    style={styles.inputField}
                  />
                </div>
              </div>
            </div>

            {/* Client & Invoice Details */}
            <div style={styles.formSection}>
              <h3 style={styles.sectionTitle}>Bill To</h3>
              <div style={styles.formGrid}>
                <div style={styles.formGroup}>
                  <label>Client Name</label>
                  <div style={styles.inputWrapper}>
                    <input
                      type="text"
                      name="clientName"
                      value={details.clientName}
                      onChange={handleDetailChange}
                      style={{
                        ...styles.inputField,
                        ...(errors.clientName && styles.inputError),
                      }}
                    />
                    {errors.clientName && (
                      <span style={styles.errorIcon}>
                        <ErrorIcon />
                      </span>
                    )}
                  </div>
                </div>
                <div style={styles.formGroup}>
                  <label>Client Address</label>
                  <input
                    type="text"
                    name="clientAddress"
                    value={details.clientAddress}
                    onChange={handleDetailChange}
                    style={styles.inputField}
                  />
                </div>
                <div style={styles.formGroup}>
                  <label>Invoice Number</label>
                  <p style={styles.staticText}>{details.receiptNumber}</p>
                </div>
                <div style={styles.formGroup}>
                  <label>Invoice Date</label>
                  <input
                    type="date"
                    name="receiptDate"
                    value={details.receiptDate}
                    onChange={handleDetailChange}
                    style={styles.inputField}
                  />
                </div>
              </div>
            </div>

            {/* Items Section */}
            <div style={styles.formSection}>
              <h3 style={styles.sectionTitle}>Services / Items</h3>
              <div style={styles.itemHeader}>
                <span style={{ gridColumn: "1 / span 4" }}>Description</span>
                <span>Qty</span>
                <span>Price</span>
              </div>
              <div style={styles.itemsContainer}>
                {items.map((item, index) => (
                  <div key={item.id} style={styles.itemRow}>
                    <div
                      style={{
                        ...styles.inputWrapper,
                        gridColumn: "1 / span 4",
                      }}
                    >
                      <input
                        type="text"
                        name="description"
                        placeholder="Service Description"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, e)}
                        style={{
                          ...styles.inputField,
                          ...(errors.items?.[index] && styles.inputError),
                        }}
                      />
                      {errors.items?.[index] && (
                        <span style={styles.errorIcon}>
                          <ErrorIcon />
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      name="quantity"
                      placeholder="1"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, e)}
                      style={styles.inputField}
                    />
                    <input
                      type="number"
                      name="price"
                      placeholder="$0.00"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, e)}
                      style={styles.inputField}
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      style={styles.deleteButton}
                    >
                      <FaTrash />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                style={styles.addButton}
              >
                <FaPlus /> Add Item
              </button>
            </div>

            {/* Totals Section */}
            <div style={styles.totalsSection}>
              <div />
              <div style={styles.summaryBox}>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Subtotal</span>
                  <span style={styles.summaryValue}>
                    ${subtotal.toFixed(2)}
                  </span>
                </div>
                <div style={styles.summaryRow}>
                  <label style={styles.summaryLabel}>Discount ($)</label>
                  <input
                    type="number"
                    name="discount"
                    value={details.discount}
                    onChange={handleDetailChange}
                    style={styles.discountInput}
                  />
                </div>
                <div style={styles.summaryRow}>
                  <span style={styles.summaryLabel}>Tax (8%)</span>
                  <span style={styles.summaryValue}>${tax.toFixed(2)}</span>
                </div>
                <div style={styles.divider}></div>
                <div style={{ ...styles.summaryRow, ...styles.grandTotal }}>
                  <span style={styles.summaryLabel}>Grand Total</span>
                  <span style={styles.summaryValue}>
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </BackgroundWrapper>
  );
};

// --- STYLES ---
const styles = {
  pageContainer: {
    fontFamily: "'Inter', sans-serif",
    padding: "60px 20px",
    color: "#fff",
    marginTop: "50px",
  },
  card: {
    background: "rgba(20, 20, 35, 0.75)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    padding: "40px",
    maxWidth: "900px",
    margin: "auto",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "40px",
  },
  title: { fontSize: "2.5rem", fontWeight: "700", margin: 0 },
  generateButton: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 25px",
    fontSize: "1rem",
    fontWeight: "600",
    color: "#fff",
    background: "linear-gradient(90deg, #00A8FF, #007BFF)",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    transition: "transform 0.2s",
  },
  form: { display: "flex", flexDirection: "column", gap: "40px" },
  formSection: {},
  sectionTitle: {
    fontSize: "1.2rem",
    fontWeight: "600",
    color: "rgba(255,255,255,0.9)",
    borderBottom: "1px solid rgba(255,255,255,0.15)",
    paddingBottom: "15px",
    marginBottom: "25px",
  },
  formGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "25px",
  },
  formGroup: { display: "flex", flexDirection: "column", gap: "10px" },
  label: {
    fontWeight: "500",
    color: "rgba(255,255,255,0.7)",
    fontSize: "0.9rem",
  },
  inputWrapper: { position: "relative", width: "100%" },
  inputField: {
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    color: "#ffffff",
    borderRadius: "8px",
    padding: "12px 15px",
    fontSize: "1rem",
    boxSizing: "border-box",
    outline: "none",
  },
  staticText: {
    padding: "12px 15px",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "8px",
    minHeight: "45px",
    display: "flex",
    alignItems: "center",
    color: "rgba(255,255,255,0.9)",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  itemsContainer: { display: "flex", flexDirection: "column", gap: "15px" },
  itemHeader: {
    display: "grid",
    gridTemplateColumns: "4fr 1fr 1fr 45px",
    gap: "15px",
    padding: "0 10px",
    marginBottom: "5px",
    color: "rgba(255,255,255,0.5)",
    fontSize: "0.9rem",
  },
  itemRow: {
    display: "grid",
    gridTemplateColumns: "4fr 1fr 1fr 45px",
    gap: "15px",
    alignItems: "center",
  },
  addButton: {
    alignSelf: "flex-start",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: "rgba(0, 168, 255, 0.15)",
    border: "none",
    color: "#00A8FF",
    padding: "10px 15px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    marginTop: "15px",
  },
  deleteButton: {
    background: "rgba(220, 53, 69, 0.2)",
    border: "none",
    color: "#dc3545",
    width: "45px",
    height: "45px",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  totalsSection: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "20px",
  },
  summaryBox: {
    background: "rgba(0,0,0,0.2)",
    borderRadius: "12px",
    padding: "20px",
    width: "100%",
    maxWidth: "350px",
    border: "1px solid rgba(255,255,255,0.1)",
  },
  summaryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  },
  summaryLabel: { color: "rgba(255,255,255,0.7)", fontWeight: "500" },
  summaryValue: { fontWeight: "600", fontSize: "1.1rem" },
  discountInput: {
    backgroundColor: "rgba(0,0,0,0.3)",
    border: "1px solid rgba(255,255,255,0.2)",
    color: "#fff",
    borderRadius: "6px",
    padding: "5px 8px",
    width: "100px",
    textAlign: "right",
    fontSize: "1rem",
  },
  divider: {
    height: "1px",
    backgroundColor: "rgba(255,255,255,0.15)",
    margin: "15px 0",
  },
  grandTotal: { fontSize: "1.4rem", color: "#00A8FF" },
  inputError: { border: "1px solid #dc3545" },
  errorIcon: {
    position: "absolute",
    top: "50%",
    right: "15px",
    transform: "translateY(-50%)",
    color: "#dc3545",
  },
  toast: {
    position: "fixed",
    top: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "12px 25px",
    borderRadius: "10px",
    color: "#fff",
    fontSize: "1rem",
    fontWeight: "600",
    zIndex: 3000,
    animation: "slideIn 0.3s ease-out",
  },
  toastError: {
    backgroundColor: "rgba(220, 53, 69, 0.8)",
    border: "1px solid rgba(255,255,255,0.2)",
    boxShadow: "0 5px 15px rgba(220, 53, 69, 0.3)",
  },
  backdrop: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    backdropFilter: "blur(5px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
  },
  qrModal: {
    backgroundColor: "#111524",
    border: "1px solid rgba(0, 168, 255, 0.3)",
    borderRadius: "20px",
    padding: "40px",
    width: "100%",
    maxWidth: "450px",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
  },
  modalTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#FFFFFF",
    margin: 0,
  },
  modalSubtitle: {
    fontSize: "1rem",
    color: "rgba(255, 255, 255, 0.7)",
    margin: "0 0 10px 0",
  },
  qrCanvasWrapper: {
    background: "white",
    padding: "20px",
    borderRadius: "16px",
  },
  paymentDetails: {
    width: "100%",
    textAlign: "left",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "10px",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    padding: "10px 0",
    fontSize: "1rem",
  },
  closeButton: {
    width: "100%",
    marginTop: "20px",
    padding: "12px",
    fontSize: "1rem",
    fontWeight: "600",
    color: "#fff",
    backgroundColor: "rgba(0, 168, 255, 0.2)",
    border: "1px solid #00A8FF",
    borderRadius: "10px",
    cursor: "pointer",
  },
  summaryValue: { fontWeight: "600", fontSize: "1.1rem" }, // Changed to PKR
  grandTotal: { fontSize: "1.4rem", color: "#00A8FF" },
};

export default InvoiceGenerator;
