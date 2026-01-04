# 🌱 EcoBite - Food Waste Reduction Platform

### 🚀 Imagine Cup 2026: Azure-Powered Social Impact

EcoBite is a comprehensive digital platform designed to combat food waste by connecting food donors with recipients through intelligent cloud services. This roadmap focuses on the full integration of the Azure Ecosystem to ensure scalability, security, and real-time intelligence.

---

## 🏗️ Azure Implementation Roadmap

### 1. 👁️ Azure AI Vision (Food Quality Control)
Transform visual data into actionable safety scores.
*   **Feature**: Automatic food type detection and freshness verification.
*   **Implementation**: Utilizes `Azure AI Vision` (Computer Vision) to analyze uploaded images.
*   **Current State**: Integrated in `server/services/azureAI.ts`.
*   **Action Required**: Provision an Azure AI Vision resource and update the endpoint/key in `.env`.

### 2. 🗄️ Azure SQL Database (Scalable Data)
Move from local SQLite to a cloud-native relational database.
*   **Feature**: High-availability storage for users, donations, and impact metrics.
*   **Implementation**: PostgreSQL-compatible Azure SQL interface.
*   **Action Required**: Migrate schema from `server/db.ts` to an Azure SQL instance. Update connection string in `.env`.

### 3. 🔐 Microsoft Authentication (Entra ID)
Secure enterprise-grade identity management.
*   **Feature**: "Sign in with Microsoft" for NGOs and Corporate Partners.
*   **Implementation**: Integration with MSAL (Microsoft Authentication Library).
*   **Action Required**: Register the app in the Azure Portal (App Registrations) and configure Redirect URIs.

### 4. �️ Azure Maps (Real-Time Logistics)
Spatial intelligence for food recovery.
*   **Feature**: Live mapping of available donations and NGO request zones.
*   **Replacement**: Transitioning from Leaflet/OSM to `Azure Maps SDK`.
*   **Action Required**: Update `RealTimeMap.tsx` with the Azure Maps Web SDK for cleaner, enterprise-level visualization.

### 5. ✍️ Deterministic AI Content (OpenAI Replacement)
To ensure reliability and zero API costs for content drafting, EcoBite uses a **Smart Template Engine** instead of OpenAI.
*   **Status**: OpenAI dependencies are replaced with high-quality, pre-defined social media appeals and impact stories in `aiService.ts`.
*   **Benefit**: Instant results, no latency, and consistent branding without per-token costs.

---

## �️ Setup & Configuration

### Prerequisites
*   **Node.js**: 18.x or higher
*   **Azure Subscription**: Active account with resource group permission

### 🔑 Environment Variables (`.env`)
Copy `.env.example` to `.env` and fill in the Azure credentials:

```env
# 🔵 Azure SQL Database
AZURE_SQL_HOST=your-server.database.windows.net
AZURE_SQL_USER=your_db_user
AZURE_SQL_PASSWORD=your_secure_password
AZURE_SQL_DATABASE=ecobite_db

# 🔵 Azure AI Vision
AZURE_VISION_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_VISION_KEY=your_vision_api_key

# 🔵 Azure Maps
AZURE_MAPS_KEY=your_azure_maps_subscription_key

# � Microsoft Authentication
AZURE_AUTH_CLIENT_ID=your_client_id
AZURE_AUTH_TENANT_ID=your_tenant_id
```

---

## � Project Structure

```
ecobite/
├── src/
│   ├── components/
│   │   └── map/                # Transitioning to Azure Maps
│   ├── services/
│   │   └── auth/               # Microsoft Auth Logic
├── server/
│   ├── services/
│   │   ├── azureAI.ts          # AI Vision Integration
│   │   └── aiService.ts        # Deterministic Content Engine
│   └── db.ts                   # SQL Connection Layer
└── .env.example                # Configuration Blueprint
```

---

## 📈 Sustainable Development Goals (SDGs)
Our platform directly addresses:
*   **SDG 2: Zero Hunger** (Food redistribution)
*   **SDG 12: Responsible Consumption** (Waste reduction)
*   **SDG 13: Climate Action** (CO2 tracking)

---

**Built for a sustainable future by Team EcoBite ❤️**

