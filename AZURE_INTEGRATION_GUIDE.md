# Azure Integration Guide - Complete Setup

**Date:** December 10, 2024  
**Services:** Azure SQL, Microsoft Auth, Azure AI Vision, Google Maps  
**Time Required:** 4-6 hours

---

## 🎯 WHAT WE'RE ADDING

1. ✅ **Azure SQL Database** - Production database
2. ✅ **Microsoft Authentication** - Enterprise login
3. ✅ **Azure AI Vision** - Food image scanning
4. ✅ **Google Maps** - Real-time location

---

## 📋 PREREQUISITES

### **What You Need:**
- [ ] Microsoft Azure account (free tier available)
- [ ] Google Cloud account (free tier available)
- [ ] Credit card (for verification - won't be charged on free tier)
- [ ] 4-6 hours of time

### **Costs:**
- Azure SQL: ~$5/month (Basic tier)
- Azure AI Vision: FREE (5,000 images/month)
- Microsoft Auth: FREE
- Google Maps: FREE ($200 credit/month)

**Total: ~$5/month** 💰

---

## 🚀 PART 1: AZURE SQL DATABASE

### **Step 1: Create Azure Account**

1. **Go to:** https://azure.microsoft.com/
2. **Click:** "Start free"
3. **Sign up with:** Your email
4. **Verify:** Phone number
5. **Add:** Credit card (won't be charged)
6. **Get:** $200 free credit for 30 days

### **Step 2: Create SQL Database**

1. **Login to:** https://portal.azure.com/
2. **Click:** "Create a resource"
3. **Search:** "SQL Database"
4. **Click:** "Create"

**Configuration:**
```
Subscription: Free Trial
Resource Group: Create new → "ecobite-rg"
Database name: ecobite-db
Server: Create new
  Server name: ecobite-server (must be unique)
  Location: Southeast Asia (Singapore)
  Authentication: SQL authentication
  Admin login: ecobiteadmin
  Password: [Create strong password]
Compute + storage: Basic (2GB, $5/month)
Backup storage: Locally-redundant
```

5. **Click:** "Review + create"
6. **Click:** "Create"
7. **Wait:** 5-10 minutes for deployment

### **Step 3: Configure Firewall**

1. **Go to:** Your SQL Server (ecobite-server)
2. **Click:** "Networking" (left menu)
3. **Under "Firewall rules":**
   - Check: "Allow Azure services and resources to access this server"
   - Click: "Add your client IPv4 address"
4. **Click:** "Save"

### **Step 4: Get Connection String**

1. **Go to:** Your database (ecobite-db)
2. **Click:** "Connection strings" (left menu)
3. **Copy:** ADO.NET connection string
4. **Save it** - looks like:
```
Server=tcp:ecobite-server.database.windows.net,1433;Initial Catalog=ecobite-db;Persist Security Info=False;User ID=ecobiteadmin;Password={your_password};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;
```

### **Step 5: Update .env File**

```env
# Azure SQL Database
AZURE_SQL_SERVER=ecobite-server.database.windows.net
AZURE_SQL_DATABASE=ecobite-db
AZURE_SQL_USER=ecobiteadmin
AZURE_SQL_PASSWORD=your_password_here
AZURE_SQL_PORT=1433
```

### **Step 6: Install Dependencies**

```bash
cd d:\ecobite_\server
npm install mssql @types/mssql
```

### **Step 7: Create Azure SQL Service**

Create file: `server/services/azureSQL.ts`

```typescript
import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config: sql.config = {
    server: process.env.AZURE_SQL_SERVER || '',
    database: process.env.AZURE_SQL_DATABASE || '',
    user: process.env.AZURE_SQL_USER || '',
    password: process.env.AZURE_SQL_PASSWORD || '',
    port: parseInt(process.env.AZURE_SQL_PORT || '1433'),
    options: {
        encrypt: true,
        trustServerCertificate: false
    }
};

let pool: sql.ConnectionPool | null = null;

export async function getAzureSQLPool(): Promise<sql.ConnectionPool> {
    if (!pool) {
        pool = await sql.connect(config);
        console.log('✅ Connected to Azure SQL Database');
    }
    return pool;
}

export async function initializeAzureDatabase() {
    const pool = await getAzureSQLPool();
    
    // Create tables
    await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='users' AND xtype='U')
        CREATE TABLE users (
            id NVARCHAR(50) PRIMARY KEY,
            email NVARCHAR(255) UNIQUE NOT NULL,
            password NVARCHAR(255),
            name NVARCHAR(255) NOT NULL,
            type NVARCHAR(50) NOT NULL,
            organization NVARCHAR(255),
            licenseId NVARCHAR(100),
            location NVARCHAR(500),
            ecoPoints INT DEFAULT 0,
            createdAt DATETIME DEFAULT GETDATE(),
            microsoftId NVARCHAR(255),
            profilePicture NVARCHAR(500)
        );
    `);
    
    // Add more tables...
    console.log('✅ Azure SQL Database initialized');
}

export { sql };
```

---

## 🔐 PART 2: MICROSOFT AUTHENTICATION

### **Step 1: Register App in Azure AD**

1. **Go to:** https://portal.azure.com/
2. **Search:** "Azure Active Directory"
3. **Click:** "App registrations" (left menu)
4. **Click:** "New registration"

**Configuration:**
```
Name: EcoBite
Supported account types: Accounts in any organizational directory and personal Microsoft accounts
Redirect URI: 
  Platform: Web
  URI: http://localhost:5173/auth/microsoft/callback
```

5. **Click:** "Register"
6. **Copy:** Application (client) ID
7. **Copy:** Directory (tenant) ID

### **Step 2: Create Client Secret**

1. **Click:** "Certificates & secrets" (left menu)
2. **Click:** "New client secret"
3. **Description:** "EcoBite Production"
4. **Expires:** 24 months
5. **Click:** "Add"
6. **Copy:** Secret Value (only shown once!)

### **Step 3: Configure API Permissions**

1. **Click:** "API permissions" (left menu)
2. **Click:** "Add a permission"
3. **Select:** "Microsoft Graph"
4. **Select:** "Delegated permissions"
5. **Add these:**
   - User.Read
   - email
   - profile
   - openid
6. **Click:** "Add permissions"
7. **Click:** "Grant admin consent"

### **Step 4: Update .env File**

```env
# Microsoft Authentication
MICROSOFT_CLIENT_ID=your_application_client_id
MICROSOFT_CLIENT_SECRET=your_client_secret
MICROSOFT_TENANT_ID=your_tenant_id
MICROSOFT_REDIRECT_URI=http://localhost:5173/auth/microsoft/callback
```

### **Step 5: Install Dependencies**

```bash
npm install @azure/msal-node @azure/msal-browser passport-azure-ad
```

### **Step 6: Create Microsoft Auth Service**

Create file: `server/services/microsoftAuth.ts`

```typescript
import { ConfidentialClientApplication } from '@azure/msal-node';

const msalConfig = {
    auth: {
        clientId: process.env.MICROSOFT_CLIENT_ID || '',
        authority: `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}`,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET || ''
    }
};

const msalClient = new ConfidentialClientApplication(msalConfig);

export async function getMicrosoftAuthUrl(): Promise<string> {
    const authCodeUrlParameters = {
        scopes: ['user.read', 'email', 'profile'],
        redirectUri: process.env.MICROSOFT_REDIRECT_URI || ''
    };
    
    return await msalClient.getAuthCodeUrl(authCodeUrlParameters);
}

export async function getMicrosoftTokens(code: string) {
    const tokenRequest = {
        code,
        scopes: ['user.read', 'email', 'profile'],
        redirectUri: process.env.MICROSOFT_REDIRECT_URI || ''
    };
    
    return await msalClient.acquireTokenByCode(tokenRequest);
}

export async function getMicrosoftUserInfo(accessToken: string) {
    const response = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });
    
    return await response.json();
}
```

---

## 🤖 PART 3: AZURE AI VISION (Food Scanning)

### **Step 1: Create Computer Vision Resource**

1. **Go to:** https://portal.azure.com/
2. **Click:** "Create a resource"
3. **Search:** "Computer Vision"
4. **Click:** "Create"

**Configuration:**
```
Subscription: Free Trial
Resource Group: ecobite-rg
Region: Southeast Asia
Name: ecobite-vision
Pricing tier: Free F0 (5,000 images/month)
```

5. **Click:** "Review + create"
6. **Click:** "Create"

### **Step 2: Get API Keys**

1. **Go to:** Your Computer Vision resource
2. **Click:** "Keys and Endpoint" (left menu)
3. **Copy:** KEY 1
4. **Copy:** Endpoint

### **Step 3: Update .env File**

```env
# Azure AI Vision
AZURE_VISION_KEY=your_vision_api_key
AZURE_VISION_ENDPOINT=https://ecobite-vision.cognitiveservices.azure.com/
```

### **Step 4: Install Dependencies**

```bash
npm install @azure/cognitiveservices-computervision @azure/ms-rest-js
```

### **Step 5: Create AI Vision Service**

Create file: `server/services/azureVision.ts`

```typescript
import { ComputerVisionClient } from '@azure/cognitiveservices-computervision';
import { ApiKeyCredentials } from '@azure/ms-rest-js';

const credentials = new ApiKeyCredentials({
    inHeader: {
        'Ocp-Apim-Subscription-Key': process.env.AZURE_VISION_KEY || ''
    }
});

const visionClient = new ComputerVisionClient(
    credentials,
    process.env.AZURE_VISION_ENDPOINT || ''
);

export async function analyzeFoodImage(imageUrl: string) {
    try {
        // Analyze image
        const analysis = await visionClient.analyzeImage(imageUrl, {
            visualFeatures: ['Tags', 'Description', 'Objects', 'Categories']
        });
        
        // Extract food-related information
        const foodTags = analysis.tags?.filter(tag => 
            tag.name?.toLowerCase().includes('food') ||
            tag.name?.toLowerCase().includes('meal') ||
            tag.name?.toLowerCase().includes('dish')
        ) || [];
        
        // Determine food type
        const foodType = determineFoodType(analysis.tags || []);
        
        // Calculate quality score (0-100)
        const qualityScore = calculateQualityScore(analysis);
        
        return {
            foodType,
            qualityScore,
            description: analysis.description?.captions?.[0]?.text || 'Food item',
            tags: foodTags.map(t => t.name),
            confidence: analysis.description?.captions?.[0]?.confidence || 0
        };
    } catch (error) {
        console.error('Azure Vision error:', error);
        throw error;
    }
}

function determineFoodType(tags: any[]): string {
    const tagNames = tags.map(t => t.name?.toLowerCase() || '');
    
    if (tagNames.some(t => t.includes('vegetable') || t.includes('salad'))) {
        return 'Vegetables';
    } else if (tagNames.some(t => t.includes('fruit'))) {
        return 'Fruits';
    } else if (tagNames.some(t => t.includes('bread') || t.includes('bakery'))) {
        return 'Bakery';
    } else if (tagNames.some(t => t.includes('meat') || t.includes('chicken'))) {
        return 'Cooked Food';
    } else if (tagNames.some(t => t.includes('rice') || t.includes('pasta'))) {
        return 'Grains';
    } else {
        return 'Other Food';
    }
}

function calculateQualityScore(analysis: any): number {
    // Base score on image quality and food appearance
    let score = 70; // Base score
    
    // Increase if high confidence
    const confidence = analysis.description?.captions?.[0]?.confidence || 0;
    score += confidence * 20;
    
    // Decrease if tags suggest poor quality
    const tags = analysis.tags?.map((t: any) => t.name?.toLowerCase()) || [];
    if (tags.includes('old') || tags.includes('spoiled')) {
        score -= 30;
    }
    
    return Math.min(100, Math.max(0, Math.round(score)));
}

export async function detectFoodFreshness(imageBuffer: Buffer) {
    // Upload image and analyze
    const analysis = await visionClient.analyzeImageInStream(imageBuffer, {
        visualFeatures: ['Color', 'Tags', 'Description']
    });
    
    const isFresh = !analysis.tags?.some(tag => 
        tag.name?.toLowerCase().includes('old') ||
        tag.name?.toLowerCase().includes('spoiled') ||
        tag.name?.toLowerCase().includes('rotten')
    );
    
    return {
        isFresh,
        confidence: analysis.description?.captions?.[0]?.confidence || 0,
        description: analysis.description?.captions?.[0]?.text || ''
    };
}
```

---

## 🗺️ PART 4: GOOGLE MAPS INTEGRATION

### **Step 1: Create Google Cloud Project**

1. **Go to:** https://console.cloud.google.com/
2. **Click:** "Select a project" → "New Project"
3. **Project name:** "EcoBite"
4. **Click:** "Create"

### **Step 2: Enable APIs**

1. **Go to:** "APIs & Services" → "Library"
2. **Search and Enable:**
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Directions API

### **Step 3: Create API Key**

1. **Go to:** "APIs & Services" → "Credentials"
2. **Click:** "Create Credentials" → "API Key"
3. **Copy:** Your API key
4. **Click:** "Restrict Key"

**Restrictions:**
```
Application restrictions:
  HTTP referrers
  Add: http://localhost:5173/*
  Add: https://yourdomain.com/*

API restrictions:
  Restrict key
  Select: 
    - Maps JavaScript API
    - Places API
    - Geocoding API
    - Directions API
```

5. **Click:** "Save"

### **Step 4: Update .env File**

```env
# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### **Step 5: Install Dependencies**

```bash
cd d:\ecobite_
npm install @react-google-maps/api
```

### **Step 6: Create Google Maps Component**

Create file: `src/components/map/RealTimeMap.tsx`

```typescript
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { useState, useEffect } from 'react';

interface Donation {
    id: string;
    lat: number;
    lng: number;
    foodType: string;
    quantity: string;
    donorName: string;
}

const mapContainerStyle = {
    width: '100%',
    height: '500px'
};

const center = {
    lat: 31.5204, // Lahore, Pakistan
    lng: 74.3587
};

export default function RealTimeMap() {
    const [donations, setDonations] = useState<Donation[]>([]);
    const [selected, setSelected] = useState<Donation | null>(null);

    useEffect(() => {
        fetchDonations();
        const interval = setInterval(fetchDonations, 30000); // Update every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchDonations = async () => {
        const response = await fetch('http://localhost:3002/api/donations/map');
        const data = await response.json();
        setDonations(data);
    };

    return (
        <LoadScript googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}>
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={center}
                zoom={12}
            >
                {donations.map(donation => (
                    <Marker
                        key={donation.id}
                        position={{ lat: donation.lat, lng: donation.lng }}
                        onClick={() => setSelected(donation)}
                        icon={{
                            url: '/food-marker.png',
                            scaledSize: new google.maps.Size(40, 40)
                        }}
                    />
                ))}

                {selected && (
                    <InfoWindow
                        position={{ lat: selected.lat, lng: selected.lng }}
                        onCloseClick={() => setSelected(null)}
                    >
                        <div className="p-2">
                            <h3 className="font-bold">{selected.foodType}</h3>
                            <p>Quantity: {selected.quantity}</p>
                            <p>From: {selected.donorName}</p>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </LoadScript>
    );
}
```

---

## 📝 COMPLETE .ENV FILE

```env
# Server
PORT=3002
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Azure SQL Database
AZURE_SQL_SERVER=ecobite-server.database.windows.net
AZURE_SQL_DATABASE=ecobite-db
AZURE_SQL_USER=ecobiteadmin
AZURE_SQL_PASSWORD=your_strong_password
AZURE_SQL_PORT=1433

# Microsoft Authentication
MICROSOFT_CLIENT_ID=your_application_client_id
MICROSOFT_CLIENT_SECRET=your_client_secret
MICROSOFT_TENANT_ID=your_tenant_id
MICROSOFT_REDIRECT_URI=https://yourdomain.com/auth/microsoft/callback

# Azure AI Vision
AZURE_VISION_KEY=your_vision_api_key
AZURE_VISION_ENDPOINT=https://ecobite-vision.cognitiveservices.azure.com/

# Google Maps
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=saadianigah@gmail.com
EMAIL_PASSWORD=your_gmail_app_password

# Payment (for later)
STRIPE_SECRET_KEY=sk_live_your_key
JAZZCASH_MERCHANT_ID=MC12345
JAZZCASH_PASSWORD=your_password
JAZZCASH_INTEGRITY_SALT=your_salt
```

---

## ✅ TESTING CHECKLIST

- [ ] Azure SQL connected
- [ ] Tables created
- [ ] Microsoft login works
- [ ] AI scans food images
- [ ] Google Maps shows donations
- [ ] All features working

---

**Time to complete: 4-6 hours**  
**Cost: ~$5/month**  
**Result: Enterprise-grade platform!** 🚀
