# Automobile Workshop Maintenance Website

This is a **full-stack automobile workshop maintenance platform** that allows clients to explore workshop services, interact with other clients, book services, and manage their profiles. The website also includes admin controls for handling service bookings, managing clients, and more.  

---

## Features

### **1. Landing Page**
- A welcoming landing page introducing the workshop and its offerings.

### **2. Authentication & Role-Based Access**
- **User Authentication** powered by **Supabase** (Sign up / Login).  
- **Role-based access control**:
  - **Admin**: Manage services, accept/reject booking requests, view all clients.
  - **Client/User**: Book services, interact with other users, update profile, etc.
- **Route Protection**:
  - Guests cannot access authenticated pages without signing up or logging in.

### **3. Explore Us (Live Feed)**
- A live feed section where authenticated users can:
  - Post updates or messages.
  - Comment on posts.
  - Like posts.
  - Share posts.

### **4. Our Services**
- A dedicated page showcasing all the services offered by the workshop.
- Dynamic template to **add/remove services** easily.

### **5. Meet Clients**
- A directory of all authenticated and registered clients.
- View client profiles (profile picture and bio included).

### **6. Chat Functionality**
- **Inter-client chat**: Users can chat with each other in real time.
- **Owner-client chat**: Clients can communicate directly with the workshop admin.

### **7. Service Booking**
- Clients can book workshop services via a booking request form.
- Booking requests are sent to the **admin**:
  - Admin can **accept** or **reject** service requests.
  - Clients are notified of the booking status accordingly.

### **8. Receipt Generator**
- Automatically generates receipts for completed services.
- Downloadable receipts for client records.

### **9. User Profile Management**
- Clients can update their profile with:
  - Profile picture.
  - Personal bio.

---

## Tech Stack

### **Frontend**
- **React.js** for UI and routing.
- **CSS** for styling and responsiveness.

### **Backend**
- **Supabase**:
  - Authentication (Sign up/Login).
  - Database (Stores users, services, chat data, feed posts, and bookings).
  - Role-based access control.

---

## Key Functionalities

- **Authentication & Role Management**: Supabase assigns roles to users (admin or client) to control access.  
- **Protected Routes**: Guests cannot access certain features/pages without authentication.  
- **Real-Time Features**: Feed, chat, and booking updates are reflected live.  
- **Service Management**: Admin can dynamically add, edit, or remove services.  
- **Client Engagement**: Posts, comments, likes, shares, and chat functionality foster user interaction.

---

## Setup & Installation

### **1. Clone the repository**
```bash
git clone <your-repo-url>
cd <repo-name>
