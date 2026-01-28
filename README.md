# EHSM Safety Engineer Portal

A SAPUI5 application for Safety Engineers to manage incidents and assess risks in the plant.

## Features

- **Login Authentication**: Secure login using Employee ID and Password via SAP OData
- **Dashboard**: Overview of incidents and risks with statistics
- **Incident Management**: View and search all incidents with status tracking
- **Risk Assessment**: View and search all risks with severity levels

## Technology Stack

- SAPUI5 1.120.14
- SAP OData Services (ZEHSM_NK_SRV)
- Modern UI with Glassmorphism effects

## Prerequisites

- Node.js (v14 or higher)
- SAP Cloud Connector configured to route to `http://172.17.19.24:8000`
- Access to SAP S4 HANA system with ZEHSM_NK_SRV OData service

## Installation

```bash
npm install
```

## Running the Application

### Local Development (with SAP Backend)

```bash
npm run start-local
```

This will start the application with proxy configuration to connect to your SAP backend at `http://172.17.19.24:8000`.

### Without Fiori Launchpad

```bash
npm run start-noflp
```

## Login Credentials

Use the following test credentials:
- **Employee ID**: `00000001`
- **Password**: `123`

## OData Services

The application uses the following OData endpoints:

1. **Login**: `/sap/opu/odata/SAP/ZEHSM_NK_SRV/ZNK_loginSet`
2. **Incidents**: `/sap/opu/odata/SAP/ZEHSM_NK_SRV/ZNK_INCIDENTSet`
3. **Risks**: `/sap/opu/odata/SAP/ZEHSM_NK_SRV/ZNK_RISKSet`

## Project Structure

```
webapp/
├── controller/          # Controllers for all views
│   ├── App.controller.js
│   ├── Login.controller.js
│   ├── Dashboard.controller.js
│   ├── Incidents.controller.js
│   └── Risks.controller.js
├── view/               # XML views
│   ├── App.view.xml
│   ├── Login.view.xml
│   ├── Dashboard.view.xml
│   ├── Incidents.view.xml
│   └── Risks.view.xml
├── css/                # Styling
│   └── style.css
├── model/              # Models
├── i18n/               # Internationalization
├── manifest.json       # App descriptor
└── Component.js        # Component initialization
```

## Features Overview

### Login Page
- Modern glassmorphism design
- Employee ID and Password authentication
- Error handling and validation
- Session management

### Dashboard
- Welcome section with employee information
- Statistics cards for incidents and risks
- Quick navigation tiles
- Real-time data from OData services

### Incident Management
- Responsive table with all incidents
- Search functionality
- Status-based color coding (Open, In Progress, Closed)
- Priority indicators (High, Medium, Low)

### Risk Assessment
- Responsive table with all risks
- Search functionality
- Severity-based color coding (High, Medium, Low)
- Likelihood indicators

## Styling

The application features:
- Dark theme with gradient backgrounds
- Glassmorphism effects
- Smooth animations and transitions
- Responsive design for all screen sizes
- Modern color palette with visual hierarchy

## Build

```bash
npm run build
```

## Deployment

```bash
npm run deploy
```

## Support

For issues or questions, please contact your SAP administrator.
