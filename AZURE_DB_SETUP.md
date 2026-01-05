# Azure SQL Database Setup Guide

This guide explains how to set up an Azure SQL Database and connect it to your EcoBite application.

## Prerequisites
- An active Azure Subscription.
- Access to the Azure Portal (https://portal.azure.com).

## Step 1: Create Azure SQL Database

1.  Log in to the **Azure Portal**.
2.  Search for **SQL Databases** in the top search bar and select it.
3.  Click **+ Create**.
4.  **Basics Tab**:
    - **Subscription**: Select your subscription.
    - **Resource Group**: Select your existing resource group (e.g., `EcoBiteRG`) or create a new one.
    - **Database Name**: Enter `ecobite-db`.
    - **Server**: Click **Create new**.
        - **Server name**: Enter a unique name (e.g., `ecobite-sql-server`).
        - **Location**: Choose a region close to you (e.g., `(US) East US`).
        - **Authentication method**: Select **Use SQL authentication**.
        - **Server admin login**: Enter a username (e.g., `ecoadmin`).
        - **Password**: Create a strong password and save it!
        - Click **OK**.
    - **Compute + storage**: Click **Configure database**.
        - Select **Service tier**: "Basic" (cheapest) or "Standard".
        - For testing, "Basic" (DTU-based) is sufficient cost-wise (~$5/mo).
    - **Backup storage redundancy**: "Locally-redundant backup storage" (cheapest).
5.  Click **Review + create**, then **Create**. Use default settings for Networking tags.

## Step 2: Configure Firewall (Important!)

By default, the database blocks all external connections.

1.  Go to your new **SQL Server** resource (not the database, the server).
2.  In the left menu, under **Security**, click **Networking**.
3.  **Public network access**: Select **Selected networks**.
4.  **Exceptions**: Check **Allow Azure services and resources to access this server** (This allows Vercel/Azure App Service to connect).
5.  **Firewall rules**:
    - Click **+ Add your client IPv4 address** (This allows your local computer to connect).
    - If you are deploying to Vercel, Vercel uses dynamic IPs. Ensure "Allow Azure services" is checked, but for Vercel specifically, you might need to allow `0.0.0.0` to `255.255.255.255` temporarily or use a Vercel Integration (Vercel Postgres is easier usually, but for Azure SQL, this is the way).
    - *Safer Alternative:* Only whitelist your local IP for development.
6.  Click **Save**.

## Step 3: Get Connection String

1.  Go to your **SQL Database** resource (`ecobite-db`).
2.  In the left menu, click **Connection strings**.
3.  Copy the string under the **ADO.NET** (SQL authentication) tab.
    - It looks like: `Server=tcp:ecobite-sql-server.database.windows.net,1433;Initial Catalog=ecobite-db;Persist Security Info=False;User ID={your_username};Password={your_password};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;`
4.  Replace `{your_username}` with the admin username you created.
5.  Replace `{your_password}` with your actual password.

## Step 4: Configure Environment Variables

### Local Development
1.  Open your `.env` file in VS Code.
2.  Add the connection string:
    ```ini
    AZURE_SQL_CONNECTION_STRING="Server=tcp:ecobite-sql-server.database.windows.net,1433;Initial Catalog=ecobite-db;Persist Security Info=False;User ID=ecoadmin;Password=yourStrongPassword123!;MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
    ```

### Vercel Deployment
1.  Go to your Vercel Project Dashboard.
2.  Click **Settings** > **Environment Variables**.
3.  Add a new variable:
    - **Key**: `AZURE_SQL_CONNECTION_STRING`
    - **Value**: The full connection string from Step 3.
    - **Environments**: Check Production, Preview, and Development.
4.  Click **Save**.
5.  Redeploy your application (Push to git or click Redeploy in Vercel) for changes to take effect.

## Step 5: Verify

1.  Restart your local server with `npm run dev`.
2.  Check the terminal logs.
3.  You should see:
    ```
    ✅ Found AZURE_SQL_CONNECTION_STRING. Using Azure SQL Database.
    ✅ Azure Database connected and schema initialized.
    ```
4.  If you see this, your app is now using Azure SQL! The tables will be created automatically.

## Troubleshooting

- **Login failed for user...**: Check your username/password in the connection string.
- **Client with IP address '...' is not allowed to access the server**: You forgot Step 2 (Firewall). Add your IP.
- **Timeout**: Firewall likely blocking the connection.
