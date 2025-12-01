# 🌱 EcoBite - Food Waste Reduction Platform

EcoBite is a comprehensive digital platform designed to combat food waste by connecting food donors (restaurants, individuals) with recipients (NGOs, animal shelters) and waste management organizations. The platform features AI-powered food recognition, automated content generation, and a gamified reward system.

## ✨ Features

### 🤖 AI-Powered Features
- **Visual Food Recognition** (Azure Custom Vision): Automatically identifies food types and quality scores from uploaded images
- **AI Content Drafting** (Azure OpenAI): Generates compelling social media posts for NGO food requests
- **Impact Story Generation**: Creates personalized weekly impact narratives for users
- **Badge Descriptions**: Auto-generates celebratory badge unlock messages

### 🎯 Core Functionality
- **Donation Management**: Post, browse, and claim food donations
- **Request System**: NGOs can request specific food items with AI-drafted appeals
- **Gamification**: Earn EcoPoints through donations and redeem for vouchers
- **Impact Tracking**: Monitor CO2 saved, meals served, and community impact
- **Multi-Role Support**: Individual donors, restaurants, NGOs, animal shelters, and admins

## 🛠️ Technology Stack

### Frontend
- **React 18+** with TypeScript
- **Vite** for blazing-fast builds
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Recharts** for data visualization
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js
- **SQLite** database (via sqlite3)
- **JWT** authentication
- **Azure OpenAI** for content generation
- **Azure Custom Vision** for image recognition

## 📦 Installation

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Setup Steps

1. **Clone the repository**
```bash
git clone <repository-url>
cd ecobite
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
Create a `.env` file in the root directory:
```env
PORT=3001

# Azure OpenAI Configuration (Optional - uses mock data if not provided)
AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
AZURE_OPENAI_API_KEY=your_api_key
AZURE_OPENAI_DEPLOYMENT_NAME=gpt-35-turbo

# Azure Custom Vision Configuration (Optional - uses mock data if not provided)
AZURE_CUSTOM_VISION_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_CUSTOM_VISION_KEY=your_prediction_key
AZURE_CUSTOM_VISION_PROJECT_ID=your_project_id
AZURE_CUSTOM_VISION_ITERATION_NAME=your_iteration_name
```

4. **Run the development server**
```bash
npm run dev
```

This starts both the frontend (Vite) and backend (Express) servers concurrently.

5. **Access the application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## 🚀 Usage

### For Donors
1. Sign up and select "Individual" or "Restaurant" role
2. Navigate to "Donate Food"
3. Upload a food image (AI will auto-detect type and quality)
4. Fill in quantity, expiry, and description
5. Submit to make food available to recipients

### For NGOs
1. Sign up with "NGO" role and provide license ID
2. Browse available donations in your area
3. Claim donations for pickup
4. Create food requests with AI-generated appeals
5. Track your impact on the dashboard

### For Everyone
- Earn EcoPoints for donations and activities
- Unlock badges for milestones
- Redeem points for vouchers from partner restaurants
- View personalized AI-generated impact stories

## 📁 Project Structure

```
ecobite/
├── src/
│   ├── components/
│   │   └── dashboard/
│   │       ├── DonationForm.tsx      # Create donations with AI analysis
│   │       ├── RequestForm.tsx       # Create requests with AI drafts
│   │       ├── DonationsList.tsx     # Browse available donations
│   │       ├── HistoryView.tsx       # Activity timeline
│   │       ├── RewardsView.tsx       # Badges and vouchers
│   │       └── SettingsView.tsx      # User settings
│   ├── pages/
│   │   ├── LandingPage.tsx           # Homepage
│   │   ├── LoginPage.tsx             # Authentication
│   │   ├── Dashboard.tsx             # Main dashboard
│   │   └── NotFound.tsx              # 404 page
│   └── main.tsx                      # App entry point
├── server/
│   ├── routes/
│   │   ├── donations.ts              # Donation API endpoints
│   │   └── requests.ts               # Request API endpoints
│   ├── services/
│   │   └── aiService.ts              # AI integration layer
│   ├── db.ts                         # Database initialization
│   └── index.ts                      # Express server
├── .env.example                      # Environment template
└── package.json                      # Dependencies
```

## 🔌 API Endpoints

### Donations
- `GET /api/donations` - List all donations
- `POST /api/donations` - Create new donation
- `POST /api/donations/analyze` - Analyze food image with AI
- `POST /api/donations/impact-story` - Generate impact narrative

### Requests
- `GET /api/requests/food` - List food requests
- `POST /api/requests/food` - Create food request (with AI drafts)

## 🎨 Design System

### Colors
- **Forest Green**: `#1a4d2e` (Primary)
- **Mint**: `#e8f5e9` (Accent)
- **Ivory**: `#fdfbf7` (Background)

### Components
- Glassmorphism effects for cards
- Smooth Framer Motion transitions
- Responsive grid layouts
- AI indicators with sparkle icons

## 🔮 AI Integration

### Mock Mode (Default)
The platform works out-of-the-box with mock AI responses. Perfect for development and testing.

### Production Mode
To enable real Azure AI:
1. Provision Azure OpenAI and Custom Vision resources
2. Train Custom Vision model with food images
3. Add credentials to `.env` file
4. Restart the server

The system automatically detects Azure credentials and switches to real AI when available.

## 📊 Database Schema

### Tables
- `users` - User accounts and profiles
- `donations` - Food donation records with AI metadata
- `food_requests` - NGO requests with AI-drafted content
- `badges` - Gamification achievements
- `vouchers` - Redeemable rewards

## 🤝 Contributing

Contributions are welcome! Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Azure AI Services for powering intelligent features
- React and Vite communities for excellent tooling
- All contributors to the food waste reduction movement

## 📧 Support

For issues and questions:
- Open an issue on GitHub
- Contact: support@ecobite.org

---

**Built with ❤️ for a sustainable future**
