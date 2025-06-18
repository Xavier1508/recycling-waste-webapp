# **Trash Trade Web Application**

## **Project Overview**

**Trash Trade** is a full-stack web application designed to create a real-time ecosystem connecting users with waste collection drivers. The platform aims to streamline the recycling process, making it more accessible and rewarding. It features a complete workflow from pickup requests and live driver tracking to a gamified points and rewards system, encouraging environmental participation.

This project is built on a modern technology stack, featuring a **Next.js** frontend and a **Node.js (Express)** backend, with real-time communication powered by **Socket.IO**.

-----

## **Key Features**

  * **End-to-End Pickup Lifecycle:** A complete, real-time workflow for users to request waste pickups, receive driver assignments, track the driver's location, and confirm completion.
  * **Dual-Role User System:** Robust authentication and authorization system distinguishing between **General Users** and **Drivers**, each with their own dedicated dashboard and functionalities.
  * **Gamified Points & Rewards System:** Users earn points for each completed pickup, which can be redeemed for items in a rewards catalog, adding an incentive layer to recycling.
  * **Real-time Notifications & Tracking:** Utilizes **WebSockets (Socket.IO)** to push instant updates to the client, including driver assignments, status changes, and live location data, eliminating the need for manual refreshes.
  * **Interactive Map Integration:** Leverages a mapping service (e.g., Google Maps) for visualizing and tracking driver locations, providing transparency to the user.
  * **Feedback and Rating System:** Upon task completion, users can rate and provide feedback for the driver, fostering a trustworthy and reliable community.
  * **Responsive User Interface:** Built with **Tailwind CSS**, the UI is fully responsive and provides an optimal user experience across desktops, tablets, and mobile devices.

-----

## **Technology Stack**

| Category      | Technology                                                              |
| :------------ | :---------------------------------------------------------------------- |
| **Frontend** | `Next.js`, `React`, `Tailwind CSS`, `Framer Motion`, `Socket.IO Client`   |
| **Backend** | `Node.js`, `Express.js`, `Socket.IO`, `Sequelize` (ORM), `JWT`            |
| **Database** | `MySQL` (or any other SQL dialect supported by Sequelize)               |

-----

## **Getting Started**

Follow these instructions to set up and run the project on your local machine.

### **Prerequisites**

Ensure you have the following software installed:

  * **Node.js** (v16.x or newer recommended)
  * **NPM** (or Yarn)
  * A running **SQL Database Server** (e.g., MySQL via XAMPP, WAMP, or a standalone server)

### **Installation and Setup**

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/Xavier1508/recycling-waste-webapp.git
    cd recycling-waste-webapp
    ```

2.  **Setup the Backend**
    The backend powers the core logic, API, and database connections.

    ```bash
    # Navigate to the backend directory
    cd backend

    # Install dependencies
    npm install
    ```

    Next, create a `.env` file in the `/backend` directory by copying `.env.example` or creating it from scratch. Populate it with your local configuration:

    ```env
    # Database Connection
    DB_HOST=localhost
    DB_USER=your_db_user
    DB_PASSWORD=your_db_password
    DB_NAME=your_db_name

    # JSON Web Token (JWT) Secret
    JWT_SECRET=your_strong_secret_key
    ```

3.  **Initialize the Database**
    This project includes a database schema file to set up all necessary tables.

      * First, create a new, empty database in your SQL server with the name you specified for `DB_NAME`.
      * Then, import the structure using the provided `database_structure.sql` file. You can use a tool like phpMyAdmin or run the following command in your terminal:
        ```bash
        # Make sure you are in the repository's root directory
        mysql -u your_db_user -p your_db_name < database_structure.sql
        ```

4.  **Setup the Frontend**
    The frontend serves the user interface.

    ```bash
    # Navigate back to the root project directory if you are in /backend
    cd ..

    # Install dependencies
    npm install
    ```

    This project requires a **Maps Provider API Key** to render maps. Create a `.env.local` file in the project's **root** directory and add the following, replacing the placeholder with your actual key:

    ```env
    # Example for Google Maps API
    NEXT_PUBLIC_MAPS_API_KEY=YOUR_API_KEY_HERE
    ```

    **Note:** The `NEXT_PUBLIC_` prefix is a Next.js convention to expose the variable safely to the browser.

### **Running the Application**

You must run two separate processes in **two separate terminal windows**.

  * **Terminal 1: Start the Backend Server**

    ```bash
    # In the /backend directory
    npm run dev
    ```

    The backend API will be available at `http://localhost:3001`.

  * **Terminal 2: Start the Frontend Server**

    ```bash
    # In the root project directory
    npm run dev
    ```

    The frontend will be accessible at `http://localhost:3000`.

-----

## **Local Testing Guide**

To properly test the real-time interaction between a user and a driver, you need to simulate two concurrent sessions. The recommended approach is the **Two-Browser Technique**.

1.  **User Session (Main Browser Window)**

      * Open your primary browser (e.g., Chrome, Firefox).
      * Navigate to `http://localhost:3000`.
      * Register a new account and log in as a **General User**.

2.  **Driver Session (Incognito/Private Window)**

      * Open a new **Incognito** or **Private** window.
      * Navigate to `http://localhost:3000` again.
      * Register a new account (with a different email) and log in as a **Driver**.

3.  **Test the Workflow**

      * In the **User Session**, initiate a pickup request.
      * Observe the **Driver Session** window. The new request should appear on the driver's dashboard in real-time.
      * As the driver, accept the request. The status, notifications, and map on the user's screen will update automatically.
      * Proceed through the entire workflow to test all features.

-----

## **Technical Deep Dive**

\<details\>
\<summary\>\<strong\>Project Structure Overview\</strong\>\</summary\>

The repository is structured as a monorepo with a separate backend and a frontend-focused root.

```
/
├── backend/                # Node.js, Express, Sequelize Backend
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   └── socketManager.js    # Core WebSocket logic
├── components/             # Reusable React components for the frontend
├── context/                # React Context providers (e.g., PickupContext)
├── pages/                  # Next.js page routes
├── services/               # API service functions (using Axios)
├── lib/                    # Library/helper code (e.g., socket client setup)
├── public/                 # Static assets
└── database_structure.sql  # SQL file for database schema setup
```

\</details\>

\<details\>
\<summary\>\<strong\>Backend API Endpoint Highlights\</strong\>\</summary\>

The backend exposes a RESTful API. Key routes include:

  * **Authentication (`/api/auth`)**:
      * `POST /register`: Create a new user or driver account.
      * `POST /login`: Authenticate a user and return a JWT.
      * `GET /me`: Get the profile of the currently logged-in user.
  * **Pickups (`/api/pickups`)**:
      * `POST /`: Create a new pickup request (User).
      * `GET /driver`: Fetch available pickup requests (Driver).
      * `POST /:id/accept`: Accept a pickup request (Driver).
      * `POST /:id/complete`: Mark a pickup as complete (Driver).
      * `POST /:id/feedback`: Submit feedback for a completed pickup (User).
  * **User Data (`/api/user`)**:
      * `GET /points`: Get the current point balance for the logged-in user.

\</details\>

\<details\>
\<summary\>\<strong\>Real-time WebSocket Events\</strong\>\</summary\>

Real-time communication is handled via Socket.IO. Key events include:

  * **Server Emits (to Client)**:
      * `new_pickup_request`: Sent to all available drivers when a new request is created.
      * `pickup_accepted`: Sent to the specific user whose request was accepted.
      * `pickup_completed`: Sent to the user when a driver completes the task, triggering the feedback modal.
      * `points_updated`: Sent to the user after feedback submission to update their point total in real-time.
      * `driver_location_update`: Sent to the user to update the driver's position on the map.
  * **Client Emits (to Server)**:
      * `join_driver_pool`: A driver client joins a room to listen for new requests.
      * `update_location`: A driver client sends its new coordinates to the server.

\</details\>

-----

## **Contributing**

Contributions are welcome. Please follow standard open-source practices.

1.  **Fork** the repository.
2.  Create a new feature **branch** (`git checkout -b feature/YourFeature`).
3.  **Commit** your changes (`git commit -m 'feat: Add some amazing feature'`).
4.  **Push** to the branch (`git push origin feature/YourFeature`).
5.  Open a **Pull Request**.

## 📄 **License**

This project is licensed under the [MIT License](https://www.google.com/search?q=LICENSE). You are free to use, modify, and distribute this code.

## **Acknowledgements**

This project was originally forked from murtazaghulam99 (https://github.com/murtazaghulam99/recycling-waste-webapp). While the initial project provided the foundational landing page, this version has been significantly expanded with a full backend, database integration, real-time features, a user authentication system, and a complete rewrite of the application logic to build the full-stack **Trash Trade** ecosystem.

We are grateful to the original creator for providing the initial spark for this project.
